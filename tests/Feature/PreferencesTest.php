<?php

declare(strict_types=1);

use ArtisanToolbox\FrontAwesome\FrontAwesome;
use ArtisanToolbox\FrontAwesome\FrontAwesomeServiceProvider;
use ArtisanToolbox\FrontAwesome\Preferences\CarbonPreferences;
use ArtisanToolbox\FrontAwesome\Preferences\Contracts\PreferencesStore;
use ArtisanToolbox\FrontAwesome\Preferences\Http\Middleware\HandlePreferences;
use ArtisanToolbox\FrontAwesome\Preferences\InertiaPreferences;
use ArtisanToolbox\FrontAwesome\Preferences\PreferenceConfiguration;
use ArtisanToolbox\FrontAwesome\Preferences\RequestPreferences;
use ArtisanToolbox\FrontAwesome\Preferences\ResolvedPreferences;
use ArtisanToolbox\FrontAwesome\Preferences\Stores\SessionPreferenceStore;
use ArtisanToolbox\FrontAwesome\Tests\Fixtures\RequestAwarePreferencesStore;
use Carbon\CarbonImmutable;
use Illuminate\Config\Repository;
use Illuminate\Container\Container;
use Illuminate\Contracts\Auth\Middleware\AuthenticatesRequests;
use Illuminate\Events\Dispatcher;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Http\Kernel;
use Illuminate\Http\Request;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\ResponseFactory;

beforeEach(function (): void {
    config(['mosaicast.broadcasting.session_channel_key' => 'preference-test-key', 'app.key' => 'base64:'.base64_encode(str_repeat('a', 32))]);
    Route::middleware(['web', HandlePreferences::class])->get('/preference-fixture', fn () => Inertia::render('Preferences', ['foreign' => 'retained']));
});

it('resolves negotiated preferences and preserves application timezone and locale', function (): void {
    config(['app.locale' => 'en', 'app.timezone' => 'UTC']);
    $this->withHeaders(['X-Inertia' => 'true', 'Accept-Language' => 'pt-BR,en;q=0.8'])
        ->get('/preference-fixture')->assertOk()->assertJsonPath('props.preferences.locale', 'pt-BR')
        ->assertJsonPath('props.preferences.appearance', 'system')->assertJsonPath('props.preferences.timezone', 'UTC');
    expect(app()->getLocale())->toBe('en')->and(config('app.timezone'))->toBe('UTC');
});

it('persists one preference through an Inertia same-page redirect', function (): void {
    $this->withHeaders(['X-Inertia' => 'true', 'X-Front-Awesome-Return' => '/preference-fixture?q=one'])
        ->patch('/front-awesome/preferences', ['appearance' => 'dark'])->assertStatus(303)
        ->assertHeader('Location', '/preference-fixture?q=one');
    $this->withHeaders(['X-Inertia' => 'true'])->get('/preference-fixture')->assertJsonPath('props.preferences.appearance', 'dark');
});

it('redirects invalid values without writing preferences', function (): void {
    $this->withHeaders(['X-Inertia' => 'true', 'X-Front-Awesome-Return' => '/preference-fixture'])
        ->patch('/front-awesome/preferences', ['appearance' => ['dark']])->assertStatus(303)
        ->assertSessionHasErrors('appearance', errorBag: 'frontAwesomePreferences');
    $this->withHeaders(['X-Inertia' => 'true'])->get('/preference-fixture')->assertJsonPath('props.preferences.appearance', 'system');
});

it('rejects unsafe return locations before a preference write', function (string $target): void {
    $this->withHeader('X-Front-Awesome-Return', $target)->patch('/front-awesome/preferences', ['appearance' => 'dark'])->assertStatus(400);
})->with(['//evil.example', 'https://evil.example', '/\\evil.example', '/ok#fragment']);

it('shares current preferences during partial reloads', function (): void {
    $this->withHeaders(['X-Inertia' => 'true', 'X-Inertia-Partial-Component' => 'Preferences', 'X-Inertia-Partial-Data' => 'foreign'])
        ->get('/preference-fixture')->assertJsonPath('props.preferences.appearance', 'system')->assertJsonPath('props.foreign', 'retained');
});

it('validates every field before invoking a store setter', function (array $input, string $error): void {
    $this->withHeaders(['X-Inertia' => 'true', 'X-Front-Awesome-Return' => '/preference-fixture'])
        ->patch('/front-awesome/preferences', $input)->assertStatus(303)
        ->assertSessionHasErrors($error, errorBag: 'frontAwesomePreferences');
    expect(session()->get('front-awesome.preferences'))->toBeNull();
})->with([
    'empty input' => [[], 'preferences'],
    'unknown field' => [['user_id' => 1], 'preferences'],
    'multiple fields' => [['appearance' => 'dark', 'locale' => 'en'], 'preferences'],
    'null appearance' => [['appearance' => null], 'appearance'],
    'invalid appearance' => [['appearance' => 'blue'], 'appearance'],
    'locale array' => [['locale' => ['en']], 'locale'],
    'unsupported locale' => [['locale' => 'ja'], 'locale'],
    'timezone boolean' => [['timezone' => false], 'timezone'],
    'invalid timezone' => [['timezone' => 'Mars/Olympus'], 'timezone'],
]);

it('uses quality order and excludes zero-quality language ranges', function (string $header, string $expected): void {
    $this->withHeaders(['X-Inertia' => 'true', 'Accept-Language' => $header])->get('/preference-fixture')
        ->assertJsonPath('props.preferences.locale', $expected);
})->with([
    ['es;q=0,pt-BR;q=0.9,en;q=0.5', 'pt-BR'],
    ['de-DE', 'en'],
    ['es-MX', 'es'],
    ['*', 'en'],
]);

it('sets the Laravel source locale inside the request and restores independent translator state', function (): void {
    resolve('translator')->setLocale('es');
    Route::middleware(['web', HandlePreferences::class])->get('/source-locale', fn () => response()->json([
        'locale' => app()->getLocale(), 'translator' => resolve('translator')->getLocale(), 'request' => request()->getLocale(),
    ]));
    $this->withHeader('Accept-Language', 'pt-BR')->get('/source-locale')
        ->assertJson(['locale' => 'pt_BR', 'translator' => 'pt_BR', 'request' => 'pt_BR']);
    expect(app()->getLocale())->toBe('en')->and(resolve('translator')->getLocale())->toBe('es');
});

it('restores locale after a downstream exception', function (): void {
    Route::middleware(['web', HandlePreferences::class])->get('/locale-failure', function (): never {
        throw new RuntimeException('A downstream failure.');
    });
    $this->withHeader('Accept-Language', 'es')->get('/locale-failure')->assertStatus(500);
    expect(app()->getLocale())->toBe('en');
});

it('does not share preferences on a route without the integration middleware', function (): void {
    Route::middleware('web')->get('/without-preferences', fn () => Inertia::render('Other'));
    $this->withHeaders(['X-Inertia' => 'true'])->get('/preference-fixture')->assertJsonPath('props.preferences.appearance', 'system');
    $this->get('/without-preferences')->assertJsonMissingPath('props.preferences');
});

it('supports a configured property name without leaking foreign shares', function (): void {
    config(['front-awesome.preferences.key' => 'display_settings']);
    Inertia::share('foreignShared', 'retained');
    $this->withHeader('X-Inertia', 'true')->get('/preference-fixture')
        ->assertJsonPath('props.display_settings.key', 'display_settings')->assertJsonPath('props.foreignShared', 'retained')
        ->assertJsonMissingPath('props.preferences');
});

it('preserves fragments through successful and invalid Inertia redirects', function (): void {
    $this->withHeaders(['X-Inertia' => 'true', 'X-Front-Awesome-Return' => '/preference-fixture'])
        ->patch('/front-awesome/preferences', ['timezone' => 'America/Sao_Paulo'])->assertStatus(303);
    $this->get('/preference-fixture')->assertJsonPath('preserveFragment', true)->assertJsonPath('props.preferences.timezone', 'America/Sao_Paulo');
    $this->patch('/front-awesome/preferences', ['timezone' => 'invalid'])->assertStatus(303);
    $this->get('/preference-fixture')->assertJsonPath('preserveFragment', true)->assertJsonPath('props.preferences.timezone', 'America/Sao_Paulo');
});

it('preserves session preferences during regeneration and clears them on invalidation', function (): void {
    $session = resolve('session.store');
    $request = Request::create('/');
    $request->setLaravelSession($session);
    $store = new SessionPreferenceStore;
    $store->setAppearance($request, 'dark');
    $session->regenerate(true);
    expect($store->getAppearance($request))->toBe('dark');
    $session->invalidate();
    expect($store->getAppearance($request))->toBeNull();
});

it('renders safe server appearance prepaint without browser storage', function (): void {
    Route::middleware(['web', HandlePreferences::class])->get('/prepaint', fn () => Blade::render('@frontAwesomePreferences("test-nonce")'));
    $html = $this->get('/prepaint')->assertOk()->getContent();
    expect($html)->toContain('nonce="test-nonce"')->toContain('matchMedia')->not->toContain('localStorage')->not->toContain('timezones');
});

it('converts Carbon copies at call time without changing instants or global timezone', function (): void {
    $request = request();
    $request->attributes->set(RequestPreferences::ATTRIBUTE,
        new ResolvedPreferences('system', 'en', 'America/New_York', 'en', [], []));
    foreach ([Carbon\Carbon::class, CarbonImmutable::class, Illuminate\Support\Carbon::class] as $type) {
        $date = $type::parse('2026-03-08T07:30:00Z');
        $converted = $date->toPreferenceTimezone();
        expect($converted->format('H:i P'))->toBe('03:30 -04:00')
            ->and($converted->getTimestamp())->toBe($date->getTimestamp())
            ->and($date->getTimezone()->getName())->toBe('Z');
    }
    expect(config('app.timezone'))->toBe('UTC');
});

it('resolves a request-aware custom store and dependencies through the container', function (): void {
    FrontAwesome::setPreferenceStore(RequestAwarePreferencesStore::class);
    $this->withHeaders(['X-Inertia' => 'true', 'X-Initial-Appearance' => 'dark'])->get('/preference-fixture')->assertJsonPath('props.preferences.appearance', 'dark');
    $store = resolve(PreferencesStore::class);
    expect($store)->toBeInstanceOf(RequestAwarePreferencesStore::class)
        ->and($store->config)->toBe(resolve('config'));
    $this->withHeader('X-Front-Awesome-Return', '/preference-fixture')->patch('/front-awesome/preferences', ['appearance' => 123])->assertStatus(303);
    expect($store->writes)->toBe(0);
    $this->patch('/front-awesome/preferences', ['timezone' => 'America/Sao_Paulo'])->assertStatus(303);
    expect($store->writes)->toBe(1);
});

it('requires CSRF verification on the web preference endpoint', function (): void {
    app()->instance('env', 'production');
    $this->withHeader('X-Front-Awesome-Return', '/preference-fixture')->patch('/front-awesome/preferences', ['appearance' => 'dark'])->assertStatus(419);
    expect(session()->get('front-awesome.preferences'))->toBeNull();
    $this->withSession(['_token' => 'valid-preference-token'])->withHeader('X-CSRF-TOKEN', 'valid-preference-token')
        ->patch('/front-awesome/preferences', ['appearance' => 'dark'])->assertStatus(303);
});

it('keeps a host-defined Carbon macro', function (): void {
    $original = Date::getMacro('toPreferenceTimezone');
    Date::macro('toPreferenceTimezone', function (): string {
        return 'host-owned';
    });

    try {
        CarbonPreferences::register();
        expect(Date::now()->toPreferenceTimezone())->toBe('host-owned');
    } finally {
        Date::macro('toPreferenceTimezone', $original);
    }
});

it('keeps the original subdirectory and query in a safe redirect', function (): void {
    $path = '/portal/reports?filter=read%20only&status=active';
    $this->withHeaders(['X-Inertia' => 'true', 'X-Front-Awesome-Return' => $path])
        ->patch('/front-awesome/preferences', ['appearance' => 'dark'])->assertStatus(303)->assertHeader('Location', $path);
});

it('honors explicit zero-quality exclusions during regional fallback', function (): void {
    config(['front-awesome.translations.locales' => ['pt_BR', 'es', 'en']]);
    $this->withHeaders(['X-Inertia' => 'true', 'Accept-Language' => 'pt-PT,pt-BR;q=0,es;q=0.8'])
        ->get('/preference-fixture')->assertJsonPath('props.preferences.locale', 'es');
});

it('includes a supported configured timezone alias in the available choices', function (): void {
    config(['app.timezone' => 'Etc/UTC']);
    $payload = $this->withHeader('X-Inertia', 'true')->get('/preference-fixture')->assertOk()->json('props.preferences');
    expect($payload['timezone'])->toBe('Etc/UTC')->and($payload['timezones'])->toContain('Etc/UTC');
});

it('rejects property names reserved by the shared client protocol', function (string $key): void {
    config(['front-awesome.preferences.key' => $key]);
    expect(fn () => PreferenceConfiguration::key())->toThrow(InvalidArgumentException::class);
})->with(['__proto__', 'prototype', 'constructor', 'errors', 'auth', 'flash', 'deferredProps', 'onceProps']);

it('keeps the deployment base URL in the generated update endpoint', function (): void {
    $request = Request::create('https://example.test/portal/index.php/reports', server: [
        'SCRIPT_NAME' => '/portal/index.php', 'SCRIPT_FILENAME' => '/var/www/portal/index.php', 'PHP_SELF' => '/portal/index.php/reports',
    ]);
    $snapshot = new ResolvedPreferences('system', 'en', 'UTC', 'en', [], []);
    expect($request->getBaseUrl())->toBe('/portal/index.php')
        ->and($snapshot->toArray($request)['updateUrl'])->toBe('/portal/index.php/front-awesome/preferences');
});

it('lets a specific allowed language override a wildcard exclusion', function (): void {
    $this->withHeaders(['X-Inertia' => 'true', 'Accept-Language' => '*;q=0,pt-BR;q=1'])
        ->get('/preference-fixture')->assertJsonPath('props.preferences.locale', 'pt-BR');
});

it('falls back from malformed saved values without rewriting the store', function (): void {
    $saved = ['appearance' => 'blue', 'locale' => 'xx', 'timezone' => 'Mars/Olympus'];
    $this->withSession(['front-awesome.preferences' => $saved])->withHeader('X-Inertia', 'true')
        ->get('/preference-fixture')->assertJsonPath('props.preferences.appearance', 'system')
        ->assertJsonPath('props.preferences.locale', 'en')->assertJsonPath('props.preferences.timezone', 'UTC');
    expect(session()->get('front-awesome.preferences'))->toBe($saved);
});

it('wires middleware priority and shared properties when framework services already resolved', function (): void {
    $current = app();
    $configuration = config('front-awesome');
    $isolated = new Application(base_path());

    try {
        $isolated->instance('config', new Repository(['front-awesome' => $configuration]));
        $router = new Router(new Dispatcher($isolated), $isolated);
        $kernel = new Kernel($isolated, $router);
        $inertia = new ResponseFactory;
        $isolated->instance(Illuminate\Contracts\Http\Kernel::class, $kernel);
        $isolated->instance(ResponseFactory::class, $inertia);
        (new FrontAwesomeServiceProvider($isolated))->register();
        expect(array_search(HandlePreferences::class, $kernel->getMiddlewarePriority(), true))
            ->toBeGreaterThan(array_search(AuthenticatesRequests::class, $kernel->getMiddlewarePriority(), true));
        expect(collect($inertia->getShared())->contains(fn (mixed $value): bool => $value instanceof InertiaPreferences))->toBeTrue();
    } finally {
        Container::setInstance($current);
    }
});

it('defaults currency to null and shares the authoritative ISO 4217 list', function (): void {
    $payload = $this->withHeader('X-Inertia', 'true')->get('/preference-fixture')->assertJsonPath('props.preferences.currency', null)->json('props.preferences');
    expect($payload['currencies'])->toContain('BRL', 'USD', 'EUR', 'JPY', 'XAD')->not->toContain('ZZZ', 'BGN');
});

it('persists and clears a nullable currency preference', function (): void {
    $this->withHeaders(['X-Inertia' => 'true', 'X-Front-Awesome-Return' => '/preference-fixture'])
        ->patch('/front-awesome/preferences', ['currency' => 'BRL'])->assertStatus(303);
    $this->get('/preference-fixture')->assertJsonPath('props.preferences.currency', 'BRL');
    $this->patch('/front-awesome/preferences', ['currency' => null])->assertStatus(303);
    $this->get('/preference-fixture')->assertJsonPath('props.preferences.currency', null);
});

it('rejects invalid currency inputs before calling the store', function (mixed $currency): void {
    FrontAwesome::setPreferenceStore(RequestAwarePreferencesStore::class);
    $this->withHeaders(['X-Inertia' => 'true', 'X-Front-Awesome-Return' => '/preference-fixture'])
        ->patch('/front-awesome/preferences', ['currency' => $currency])->assertStatus(303)->assertSessionHasErrors('currency', errorBag: 'frontAwesomePreferences');
    expect(resolve(PreferencesStore::class)->writes)->toBe(0);
})->with(['ZZZ', 'usd', 'US', 123, true, [['USD']]]);

it('uses the application timezone macro fallback without a bound HTTP request', function (): void {
    $request = resolve('request');
    app()->forgetInstance('request');
    config(['app.timezone' => 'America/Sao_Paulo']);

    try {
        expect(Date::parse('2026-11-10T12:00:00Z')->toPreferenceTimezone()->format('H:i P'))->toBe('09:00 -03:00');
    } finally {
        app()->instance('request', $request);
    }
});
