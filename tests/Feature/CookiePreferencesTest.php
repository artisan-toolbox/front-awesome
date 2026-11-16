<?php

declare(strict_types=1);

use ArtisanToolbox\FrontAwesome\Preferences\Contracts\PreferencesStore;
use ArtisanToolbox\FrontAwesome\Preferences\Http\Middleware\HandlePreferences;
use ArtisanToolbox\FrontAwesome\Preferences\Stores\CookiePreferenceStore;
use ArtisanToolbox\FrontAwesome\Preferences\Stores\SessionPreferenceStore;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

beforeEach(function (): void {
    config(['app.key' => str_repeat('a', 32), 'session.cookie' => 'fa_session', 'mosaicast.broadcasting.session_channel_key' => 'cookie-preference-test-key']);
    Route::middleware(['web', HandlePreferences::class])->get('/cookie-preferences', fn () => Inertia::render('Preferences'));
});

it('uses persistent cookies by default without writing negotiated defaults', function (): void {
    expect(resolve(PreferencesStore::class))->toBeInstanceOf(CookiePreferenceStore::class);
    $response = $this->withHeader('X-Inertia', 'true')->get('/cookie-preferences')->assertOk()
        ->assertJsonPath('props.preferences.appearance', 'system');
    foreach (['appearance', 'locale', 'timezone', 'currency'] as $field) {
        $response->assertCookieMissing('fa_session_front_awesome_preferences_'.$field);
    }
    expect(session()->get('front-awesome.preferences'))->toBeNull();
});

it('keeps each preference after session invalidation and a new request', function (string $field, string $value): void {
    $name = 'fa_session_front_awesome_preferences_'.$field;
    $response = $this->withHeaders(['X-Inertia' => 'true', 'X-Front-Awesome-Return' => '/cookie-preferences'])
        ->patch('/front-awesome/preferences', [$field => $value])->assertStatus(303)->assertCookie($name, $value);
    $cookie = $response->getCookie($name);
    expect($cookie->isHttpOnly())->toBeTrue()
        ->and($cookie->getExpiresTime())->toBeGreaterThan(now()->addDays(364)->getTimestamp())
        ->and(session()->get('front-awesome.preferences'))->toBeNull();
    session()->invalidate();
    Cookie::flushQueuedCookies();
    $this->withCookie($name, $cookie->getValue())->get('/cookie-preferences')
        ->assertJsonPath('props.preferences.'.$field, $value);
})->with([
    ['appearance', 'dark'], ['locale', 'pt-BR'], ['timezone', 'America/Sao_Paulo'], ['currency', 'BRL'],
]);

it('migrates active legacy session preferences once without keeping two copies', function (): void {
    $saved = ['appearance' => 'dark', 'locale' => 'es', 'timezone' => 'America/Sao_Paulo', 'currency' => 'BRL'];
    $response = $this->withSession(['front-awesome.preferences' => $saved])->withHeader('X-Inertia', 'true')
        ->get('/cookie-preferences')->assertOk();
    foreach ($saved as $field => $value) {
        $response->assertJsonPath('props.preferences.'.$field, $value)->assertCookie('fa_session_front_awesome_preferences_'.$field, $value);
    }
    expect(session()->get('front-awesome.preferences'))->toBe([]);
    Cookie::flushQueuedCookies();
    $this->withCookie('fa_session_front_awesome_preferences_appearance', 'light')->get('/cookie-preferences')
        ->assertJsonPath('props.preferences.appearance', 'light')->assertCookieMissing('fa_session_front_awesome_preferences_appearance');
});

it('does not let a legacy session override an existing cookie', function (): void {
    $this->withSession(['front-awesome.preferences.appearance' => 'light'])
        ->withCookie('fa_session_front_awesome_preferences_appearance', 'dark')->withHeader('X-Inertia', 'true')
        ->get('/cookie-preferences')->assertJsonPath('props.preferences.appearance', 'dark');
    expect(session()->has('front-awesome.preferences.appearance'))->toBeFalse();
});

it('writes only the changed cookie and retains other incoming preferences', function (): void {
    $response = $this->withCookies([
        'fa_session_front_awesome_preferences_appearance' => 'dark',
        'fa_session_front_awesome_preferences_locale' => 'es',
    ])->withHeaders(['X-Inertia' => 'true', 'X-Front-Awesome-Return' => '/cookie-preferences'])
        ->patch('/front-awesome/preferences', ['timezone' => 'Europe/London'])->assertStatus(303);
    $response->assertCookie('fa_session_front_awesome_preferences_timezone', 'Europe/London')
        ->assertCookieMissing('fa_session_front_awesome_preferences_appearance')->assertCookieMissing('fa_session_front_awesome_preferences_locale');
    $this->withCookie('fa_session_front_awesome_preferences_timezone', 'Europe/London')->get('/cookie-preferences')
        ->assertJsonPath('props.preferences.appearance', 'dark')->assertJsonPath('props.preferences.locale', 'es')
        ->assertJsonPath('props.preferences.timezone', 'Europe/London');
});

it('expires a cleared currency cookie and prevents legacy currency restoration', function (): void {
    $this->withSession(['front-awesome.preferences.currency' => 'USD'])
        ->withCookie('fa_session_front_awesome_preferences_currency', 'BRL')
        ->withHeader('X-Front-Awesome-Return', '/cookie-preferences')->patch('/front-awesome/preferences', ['currency' => null])
        ->assertStatus(303)->assertCookieExpired('fa_session_front_awesome_preferences_currency');
    expect(session()->has('front-awesome.preferences.currency'))->toBeFalse();
});

it('reads its own writes on the supplied request without leaking to another request', function (): void {
    $store = new CookiePreferenceStore;
    $request = Request::create('/', cookies: ['fa_session_front_awesome_preferences_currency' => 'BRL']);
    $store->setCurrency($request, null);
    $store->setAppearance($request, 'dark');
    expect($store->getCurrency($request))->toBeNull()->and($store->getAppearance($request))->toBe('dark')
        ->and($store->getAppearance(Request::create('/')))->toBeNull();
});

it('honors cookie lifetime and application scope while keeping cookies HttpOnly', function (): void {
    config(['front-awesome.preferences.key' => 'display_settings', 'front-awesome.preferences.cookie_lifetime' => 60,
        'session.cookie' => 'another_app', 'session.path' => '/portal', 'session.domain' => 'example.test', 'session.secure' => true, 'session.same_site' => 'strict', 'session.http_only' => false]);
    $this->freezeTime();
    $response = $this->withHeader('X-Front-Awesome-Return', '/cookie-preferences')->patch('/front-awesome/preferences', ['appearance' => 'dark'])->assertStatus(303);
    $cookie = $response->getCookie('another_app_front_awesome_display_settings_appearance');
    expect($cookie->getExpiresTime())->toBe(now()->addHour()->getTimestamp())->and($cookie->getPath())->toBe('/portal')
        ->and($cookie->getDomain())->toBe('example.test')->and($cookie->isSecure())->toBeTrue()
        ->and($cookie->isHttpOnly())->toBeTrue()->and($cookie->getSameSite())->toBe('strict');
});

it('ignores cookies from another application or preference namespace', function (): void {
    $this->withCookies(['another_app_front_awesome_preferences_appearance' => 'dark', 'fa_session_front_awesome_display_settings_appearance' => 'dark'])
        ->withHeader('X-Inertia', 'true')->get('/cookie-preferences')->assertJsonPath('props.preferences.appearance', 'system');
});

it('rejects tampered cookies through Laravel encryption and falls back from invalid saved values', function (): void {
    $this->withUnencryptedCookie('fa_session_front_awesome_preferences_appearance', 'dark')->withHeader('X-Inertia', 'true')
        ->get('/cookie-preferences')->assertJsonPath('props.preferences.appearance', 'system');
    $this->withCookie('fa_session_front_awesome_preferences_timezone', 'Mars/Olympus')->get('/cookie-preferences')
        ->assertJsonPath('props.preferences.timezone', 'UTC')->assertCookieMissing('fa_session_front_awesome_preferences_timezone');
});

it('rejects nonpositive or noninteger cookie lifetimes before writing', function (mixed $lifetime): void {
    config(['front-awesome.preferences.cookie_lifetime' => $lifetime]);
    expect(fn () => (new CookiePreferenceStore)->setAppearance(Request::create('/'), 'dark'))
        ->toThrow(InvalidArgumentException::class, 'front-awesome.preferences.cookie_lifetime');
    expect(Cookie::getQueuedCookies())->toBe([]);
})->with([0, -1, '60', null, true]);

it('does not write cookies for invalid preference submissions', function (): void {
    $this->withHeader('X-Front-Awesome-Return', '/cookie-preferences')->patch('/front-awesome/preferences', ['appearance' => 'blue'])
        ->assertStatus(303)->assertSessionHasErrors('appearance', errorBag: 'frontAwesomePreferences')
        ->assertCookieMissing('fa_session_front_awesome_preferences_appearance');
});

it('renders the cookie appearance before paint after the session is lost', function (): void {
    Route::middleware(['web', HandlePreferences::class])->get('/cookie-prepaint', fn () => Blade::render('@frontAwesomePreferences'));
    session()->invalidate();
    $html = $this->withCookie('fa_session_front_awesome_preferences_appearance', 'dark')->get('/cookie-prepaint')->assertOk()->getContent();
    expect($html)->toContain('"dark"')->not->toContain('localStorage');
});

it('keeps the explicitly selected session store temporary', function (): void {
    config(['front-awesome.preferences.store' => SessionPreferenceStore::class]);
    $this->withHeader('X-Front-Awesome-Return', '/cookie-preferences')->patch('/front-awesome/preferences', ['appearance' => 'dark'])
        ->assertStatus(303)->assertCookieMissing('fa_session_front_awesome_preferences_appearance');
    $this->withHeader('X-Inertia', 'true')->get('/cookie-preferences')->assertJsonPath('props.preferences.appearance', 'dark');
    session()->invalidate();
    $this->get('/cookie-preferences')->assertJsonPath('props.preferences.appearance', 'system');
});
