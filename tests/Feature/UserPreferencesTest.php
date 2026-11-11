<?php

declare(strict_types=1);

use ArtisanToolbox\FrontAwesome\FrontAwesome;
use ArtisanToolbox\FrontAwesome\Preferences\Contracts\PreferencesStore;
use ArtisanToolbox\FrontAwesome\Preferences\Http\Middleware\HandlePreferences;
use ArtisanToolbox\FrontAwesome\Preferences\Stores\SessionPreferenceStore;
use ArtisanToolbox\FrontAwesome\Preferences\Stores\UserPreferenceStore;
use ArtisanToolbox\FrontAwesome\Tests\Fixtures\PreferenceUser;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Foundation\Auth\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Inertia\Inertia;
use Symfony\Component\Process\Process;

beforeEach(function (): void {
    config([
        'app.key' => str_repeat('a', 32),
        'mosaicast.broadcasting.session_channel_key' => 'user-preference-test-key',
        'database.default' => 'testing',
        'database.connections.testing' => ['driver' => 'sqlite', 'database' => ':memory:', 'prefix' => ''],
    ]);
    Schema::create('preference_users', function (Blueprint $table): void {
        $table->id();
        $table->string('name');
        $table->json('preferences')->nullable();
        $table->json('display_settings')->nullable();
        $table->timestamps();
    });
    Route::middleware(['web', HandlePreferences::class])->get('/account-preferences', fn () => Inertia::render('Preferences'));
});

it('keeps session storage as the default even for a model implementing HasPreferences', function (): void {
    $user = PreferenceUser::query()->create(['name' => 'Reader', 'preferences' => json_encode(['appearance' => 'dark'])]);
    $this->actingAs($user)->withHeader('X-Inertia', 'true')->get('/account-preferences')->assertJsonPath('props.preferences.appearance', 'system');
    expect(resolve(PreferencesStore::class))->toBeInstanceOf(SessionPreferenceStore::class);
});

it('resolves only the explicitly registered current authenticated model', function (): void {
    FrontAwesome::setPreferenceStore(PreferenceUser::class);
    $user = PreferenceUser::query()->create(['name' => 'Reader', 'preferences' => json_encode(['appearance' => 'dark', 'privateSetting' => 'secret'])]);
    $this->actingAs($user)->withHeader('X-Inertia', 'true')->get('/account-preferences')->assertJsonPath('props.preferences.appearance', 'dark')->assertDontSee('privateSetting');
    expect(resolve(PreferencesStore::class))->toBeInstanceOf(UserPreferenceStore::class)
        ->and($user->toArray())->not->toHaveKey('preferences');
});

it('merges against fresh JSON and updates only the configured column', function (): void {
    $user = PreferenceUser::query()->create(['name' => 'Original']);
    $other = PreferenceUser::query()->findOrFail($user->getKey());
    $user->name = 'Unsaved change';
    $user->setFrontAwesomePreference('appearance', 'dark');
    DB::table('preference_users')->where('id', $user->getKey())->update(['preferences' => json_encode(['appearance' => 'dark', 'privateSetting' => ['enabled' => true]])]);
    $other->setFrontAwesomePreference('timezone', 'America/Sao_Paulo');
    expect($user->isDirty('name'))->toBeTrue()->and($user->name)->toBe('Unsaved change');
    $fresh = PreferenceUser::query()->findOrFail($user->getKey());
    expect($fresh->name)->toBe('Original')
        ->and($fresh->getFrontAwesomePreference('appearance'))->toBe('dark')
        ->and($fresh->getFrontAwesomePreference('timezone'))->toBe('America/Sao_Paulo')
        ->and(json_decode($fresh->getRawOriginal('preferences'), true)['privateSetting'])->toBe(['enabled' => true]);
});

it('uses a configured column and hides it from model serialization', function (): void {
    config(['front-awesome.preferences.key' => 'display_settings']);
    $user = PreferenceUser::query()->create(['name' => 'Reader']);
    $user->setFrontAwesomePreference('locale', 'pt-BR');
    expect($user->getFrontAwesomePreference('locale'))->toBe('pt-BR')
        ->and($user->fresh()->getRawOriginal('preferences'))->toBeNull()
        ->and($user->toArray())->not->toHaveKey('display_settings');
});

it('keeps guest preferences separate from authenticated account defaults', function (): void {
    FrontAwesome::setPreferenceStore(PreferenceUser::class);
    $this->withHeaders(['X-Inertia' => 'true', 'X-Front-Awesome-Return' => '/account-preferences'])
        ->patch('/front-awesome/preferences', ['appearance' => 'dark'])->assertStatus(303);
    $this->get('/account-preferences')->assertJsonPath('props.preferences.appearance', 'dark');
    $user = PreferenceUser::query()->create(['name' => 'Reader']);
    $this->actingAs($user)->get('/account-preferences')->assertJsonPath('props.preferences.appearance', 'system');
    expect($user->fresh()->getRawOriginal('preferences'))->toBeNull();
});

it('resolves the actual user after an alternate auth guard selects it', function (): void {
    config(['auth.guards.staff' => ['driver' => 'session', 'provider' => 'staff'], 'auth.providers.staff' => ['driver' => 'eloquent', 'model' => PreferenceUser::class]]);
    FrontAwesome::setPreferenceStore(PreferenceUser::class);
    $user = PreferenceUser::query()->create(['name' => 'Staff', 'preferences' => json_encode(['locale' => 'es'])]);
    Route::middleware(['web', HandlePreferences::class, 'auth:staff'])->get('/staff-preferences', fn () => Inertia::render('Preferences'));
    $this->actingAs($user, 'staff')->withHeader('X-Inertia', 'true')->get('/staff-preferences')->assertOk()->assertJsonPath('props.preferences.locale', 'es');
});

it('rejects invalid stores and unsafe preference identifiers', function (): void {
    expect(fn () => FrontAwesome::setPreferenceStore(stdClass::class))->toThrow(InvalidArgumentException::class);
    config(['front-awesome.preferences.key' => 'preferences.secret']);
    expect(fn () => new PreferenceUser)->toThrow(InvalidArgumentException::class);
});

it('rejects mismatched authenticated models rather than querying another table', function (): void {
    $store = new UserPreferenceStore(PreferenceUser::class, new SessionPreferenceStore);
    $request = Request::create('/');
    $request->setUserResolver(fn () => new User);
    expect(fn () => $store->getAppearance($request))->toThrow(LogicException::class);
});

it('does not mix request snapshots between authenticated accounts', function (): void {
    FrontAwesome::setPreferenceStore(PreferenceUser::class);
    $first = PreferenceUser::query()->create(['name' => 'First', 'preferences' => json_encode(['appearance' => 'dark'])]);
    $second = PreferenceUser::query()->create(['name' => 'Second', 'preferences' => json_encode(['appearance' => 'light'])]);
    $this->actingAs($first)->withHeader('X-Inertia', 'true')->get('/account-preferences')->assertJsonPath('props.preferences.appearance', 'dark');
    $this->actingAs($second)->get('/account-preferences')->assertJsonPath('props.preferences.appearance', 'light');
});

it('retries overlapping SQLite transactions without losing another preference', function (): void {
    $directory = sys_get_temp_dir().'/front-awesome-preference-writers-'.bin2hex(random_bytes(8));
    mkdir($directory);
    $file = $directory.'/preferences.sqlite';
    touch($file);
    config(['database.connections.concurrent_preferences' => ['driver' => 'sqlite', 'database' => $file, 'prefix' => '']]);
    $connection = DB::connection('concurrent_preferences');
    $connection->statement('pragma journal_mode=WAL');
    $connection->getSchemaBuilder()->create('preference_users', function (Blueprint $table): void {
        $table->id();
        $table->string('name');
        $table->json('preferences')->nullable();
        $table->timestamps();
    });
    $connection->table('preference_users')->insert(['id' => 1, 'name' => 'Concurrent reader']);
    $writer = dirname(__DIR__).'/Support/preferences-writer.php';
    $first = new Process([PHP_BINARY, $writer, $file, $directory.'/first', 'appearance', 'dark']);
    $second = new Process([PHP_BINARY, $writer, $file, $directory.'/second', 'timezone', 'America/Sao_Paulo']);

    try {
        $first->start();
        expect($first->waitUntil(fn (string $type, string $output): bool => str_contains($output, 'ready')))->toBeTrue();
        $second->start();
        expect($second->waitUntil(fn (string $type, string $output): bool => str_contains($output, 'ready')))->toBeTrue();
        touch($directory.'/first');
        expect($first->wait())->toBe(0);
        touch($directory.'/second');
        expect($second->wait())->toBe(0);
        $values = json_decode($connection->table('preference_users')->where('id', 1)->value('preferences'), true);
        expect($values)->toBe(['appearance' => 'dark', 'timezone' => 'America/Sao_Paulo']);
    } finally {
        $first->stop();
        $second->stop();
        DB::purge('concurrent_preferences');
        (new Filesystem)->deleteDirectory($directory);
    }
});

it('preserves unknown JSON object and array shapes exactly', function (): void {
    $user = PreferenceUser::query()->create(['name' => 'Reader', 'preferences' => '{"emptyObject":{},"numericObject":{"0":"zero"},"list":[]}']);
    $user->setFrontAwesomePreference('appearance', 'dark');
    expect($user->fresh()->getRawOriginal('preferences'))->toBe('{"emptyObject":{},"numericObject":{"0":"zero"},"list":[],"appearance":"dark"}');
});

it('persists an authenticated selection in the model rather than the guest session', function (): void {
    FrontAwesome::setPreferenceStore(PreferenceUser::class);
    $user = PreferenceUser::query()->create(['name' => 'Reader']);
    $this->actingAs($user)->withHeaders(['X-Inertia' => 'true', 'X-Front-Awesome-Return' => '/account-preferences'])
        ->patch('/front-awesome/preferences', ['locale' => 'pt-BR'])->assertStatus(303);
    $this->get('/account-preferences')->assertJsonPath('props.preferences.locale', 'pt-BR');
    expect($user->fresh()->getFrontAwesomePreference('locale'))->toBe('pt-BR')
        ->and(session()->get('front-awesome.preferences'))->toBeNull();
});

it('uses the authenticated model original identity while preserving dirty attributes', function (): void {
    $first = PreferenceUser::query()->create(['name' => 'First']);
    $second = PreferenceUser::query()->create(['name' => 'Second']);
    $firstId = $first->getKey();
    $first->id = $second->getKey();
    $first->setFrontAwesomePreference('appearance', 'dark');
    expect(PreferenceUser::query()->findOrFail($firstId)->getFrontAwesomePreference('appearance'))->toBe('dark')
        ->and($second->fresh()->getFrontAwesomePreference('appearance'))->toBeNull()
        ->and($first->isDirty('id'))->toBeTrue();
});

it('uses the configured nondefault guard for both page reads and endpoint writes', function (): void {
    config([
        'auth.defaults.guard' => 'web',
        'auth.guards.staff' => ['driver' => 'session', 'provider' => 'staff'],
        'auth.providers.staff' => ['driver' => 'eloquent', 'model' => PreferenceUser::class],
        'front-awesome.preferences.guard' => 'staff',
    ]);
    FrontAwesome::setPreferenceStore(PreferenceUser::class);
    $user = PreferenceUser::query()->create(['name' => 'Staff', 'preferences' => '{"locale":"es"}']);
    Route::middleware(['web', 'auth:staff', HandlePreferences::class])->get('/guarded-preferences', fn () => Inertia::render('Preferences'));
    $this->withSession([auth()->guard('staff')->getName() => $user->getKey()])->withHeader('X-Inertia', 'true')
        ->get('/guarded-preferences')->assertJsonPath('props.preferences.locale', 'es');
    auth()->shouldUse('web');
    auth()->forgetGuards();
    $this->withHeader('X-Front-Awesome-Return', '/guarded-preferences')
        ->patch('/front-awesome/preferences', ['locale' => 'pt-BR'])->assertStatus(303);
    expect($user->fresh()->getFrontAwesomePreference('locale'))->toBe('pt-BR')
        ->and(session()->get('front-awesome.preferences'))->toBeNull();
});

it('preserves unrelated JSON numeric values without rounding or changing representation', function (): void {
    $original = '{"externalId":18446744073709551615,"precise":0.12345678901234567890123456789,"exponent":1.2300e+27,"nested":{"value":999999999999999999999999}}';
    $user = PreferenceUser::query()->create(['name' => 'Reader', 'preferences' => $original]);
    $user->setFrontAwesomePreference('appearance', 'dark');
    expect($user->fresh()->getRawOriginal('preferences'))->toBe(substr($original, 0, -1).',"appearance":"dark"}');
});

it('persists and clears currency in the authenticated JSON document', function (): void {
    FrontAwesome::setPreferenceStore(PreferenceUser::class);
    $user = PreferenceUser::query()->create(['name' => 'Reader', 'preferences' => '{"privateNumber":18446744073709551615}']);
    $this->actingAs($user)->withHeaders(['X-Inertia' => 'true', 'X-Front-Awesome-Return' => '/account-preferences'])
        ->patch('/front-awesome/preferences', ['currency' => 'USD'])->assertStatus(303);
    $this->get('/account-preferences')->assertJsonPath('props.preferences.currency', 'USD');
    $this->patch('/front-awesome/preferences', ['currency' => null])->assertStatus(303);
    expect($user->fresh()->getRawOriginal('preferences'))->toBe('{"privateNumber":18446744073709551615,"currency":null}');
});
