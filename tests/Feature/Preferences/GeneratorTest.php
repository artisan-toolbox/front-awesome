<?php

declare(strict_types=1);

use ArtisanToolbox\FrontAwesome\Preferences\Console\Commands\InstallUserPreferencesCommand;
use ArtisanToolbox\FrontAwesome\Preferences\Console\Commands\MakePreferencesStoreCommand;
use ArtisanToolbox\FrontAwesome\Preferences\Contracts\PreferencesStore;
use Illuminate\Auth\Authenticatable;
use Illuminate\Contracts\Auth\Authenticatable as AuthenticatableContract;
use Illuminate\Database\Eloquent\Attributes\Connection;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\MariaDbConnection;
use Illuminate\Database\MySqlConnection;
use Illuminate\Database\PostgresConnection;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\SqlServerConnection;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Symfony\Component\Process\Process;

beforeEach(function (): void {
    $this->preferencesGeneratorPath = sys_get_temp_dir().'/front-awesome-generators-'.bin2hex(random_bytes(8));
    $this->app->getNamespace();
    $this->app->useAppPath($this->preferencesGeneratorPath.'/app');
    $this->app->useDatabasePath($this->preferencesGeneratorPath.'/database');
    config()->set('database.default', 'testing');
    config()->set('database.connections.testing', ['driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '']);
    config()->set('front-awesome.preferences.key', 'preferences');
    $this->app->make('Illuminate\Contracts\Console\Kernel')->registerCommand($this->app->make(MakePreferencesStoreCommand::class));
    $this->app->make('Illuminate\Contracts\Console\Kernel')->registerCommand($this->app->make(InstallUserPreferencesCommand::class));
    Schema::create('preference_generator_users', function (Blueprint $table): void {
        $table->id();
    });
});

afterEach(function (): void {
    (new Filesystem)->deleteDirectory($this->preferencesGeneratorPath);
});

it('generates a request-aware functional preference store with the Laravel default namespace', function (): void {
    $this->artisan('make:preferences-store', ['name' => 'GeneratedPreferenceStore'])->assertSuccessful();
    $path = app_path('Http/Preferences/GeneratedPreferenceStore.php');
    $process = new Process([PHP_BINARY, '-l', $path]);
    $process->mustRun();
    require_once $path;
    $store = app()->make('App\\Http\\Preferences\\GeneratedPreferenceStore');
    expect($store)->toBeInstanceOf(PreferencesStore::class);
    $request = Request::create('/');
    $request->setLaravelSession(resolve('session.store'));
    $store->setAppearance($request, 'dark');
    $store->setLocale($request, 'pt-BR');
    $store->setTimezone($request, 'America/Sao_Paulo');
    $store->setCurrency($request, 'BRL');
    expect($store->getAppearance($request))->toBe('dark')
        ->and($store->getLocale($request))->toBe('pt-BR')
        ->and($store->getTimezone($request))->toBe('America/Sao_Paulo')
        ->and($store->getCurrency($request))->toBe('BRL');
    $store->setCurrency($request, null);
    expect($store->getCurrency($request))->toBeNull();
});

it('generates valid PHP when the class name matches an imported dependency', function (string $name): void {
    $this->artisan('make:preferences-store', ['name' => $name])->assertSuccessful();
    $process = new Process([PHP_BINARY, '-l', app_path('Http/Preferences/'.$name.'.php')]);
    $process->mustRun();
    expect($process->isSuccessful())->toBeTrue();
})->with(['PreferencesStore', 'SessionPreferenceStore', 'Request', 'request']);

it('supports nested and fully qualified store names and preserves existing files', function (): void {
    $this->artisan('make:preferences-store', ['name' => 'App\\Http\\Preferences\\Account\\Store'])->assertSuccessful();
    $path = app_path('Http/Preferences/Account/Store.php');
    expect(file_get_contents($path))->toContain('namespace App\\Http\\Preferences\\Account;', 'class Store implements PreferencesStore');
    file_put_contents($path, 'preserve this user code');
    $this->artisan('make:preferences-store', ['name' => 'App\\Http\\Preferences\\Account\\Store'])->assertFailed();
    expect(file_get_contents($path))->toBe('preserve this user code');
});

it('rejects invalid PHP class names before writing files', function (string $name): void {
    $this->artisan('make:preferences-store', ['name' => $name])->assertFailed();
    expect(is_dir(app_path()))->toBeFalse();
})->with(['../Escape', 'Broken-Store', 'Class', 'Account\\function', '123Store']);

it('rejects PHP reserved type class names before writing files', function (string $name): void {
    $this->artisan('make:preferences-store', ['name' => $name])->assertFailed();
    expect(is_dir(app_path()))->toBeFalse();
})->with(['int', 'String', 'bool', 'mixed', 'void', 'never', 'null', 'object', 'float', 'iterable', 'self', 'parent', 'true', 'false', 'Account\\int', '__PrOpErTy__', 'Account\\__PrOpErTy__']);

it('generates a frozen nullable JSON migration without migrating or editing the model', function (): void {
    config()->set('front-awesome.preferences.key', 'account_settings');
    $this->artisan('install:user-preferences', ['--model' => PreferenceGeneratorUser::class])
        ->expectsOutputToContain('HasPreferences')
        ->expectsOutputToContain('InteractsWithPreferences')
        ->expectsOutputToContain('FrontAwesome::setPreferenceStore')
        ->expectsOutputToContain('php artisan migrate')
        ->assertSuccessful();
    $files = glob(database_path('migrations/*_add_account_settings_to_preference_generator_users_table.php'));
    expect($files)->toHaveCount(1)->and(Schema::hasColumn('preference_generator_users', 'account_settings'))->toBeFalse();
    $process = new Process([PHP_BINARY, '-l', $files[0]]);
    $process->mustRun();
    $migration = require $files[0];
    config()->set('front-awesome.preferences.key', 'different_column');
    $migration->up();
    expect(Schema::hasColumn('preference_generator_users', 'account_settings'))->toBeTrue()
        ->and(Schema::hasColumn('preference_generator_users', 'different_column'))->toBeFalse();
    Schema::table('preference_generator_users', function (Blueprint $table): void {
        $table->string('unrelated')->nullable();
    });
    $migration->down();
    expect(Schema::hasColumn('preference_generator_users', 'account_settings'))->toBeFalse()
        ->and(Schema::hasColumn('preference_generator_users', 'unrelated'))->toBeTrue();
});

it('compiles the generated migration for installed database grammars without connecting to servers', function (string $connectionClass, string $expectedType): void {
    $this->artisan('install:user-preferences', ['--model' => PreferenceGeneratorUser::class])->assertSuccessful();
    $files = glob(database_path('migrations/*.php'));
    $migration = require $files[0];
    $connection = new $connectionClass(fn () => throw new RuntimeException('A live server connection was not expected.'), 'preferences', '', [
        'name' => 'testing',
        'version' => '8.0.32',
        'prefix_indexes' => true,
    ]);
    $connection->useDefaultSchemaGrammar();
    DB::purge('testing');
    DB::extend('grammar-probe', fn () => $connection);
    config()->set('database.connections.testing', ['driver' => 'grammar-probe']);
    $queries = $connection->pretend(fn () => $migration->up());
    expect($queries)->not->toBeEmpty();
    $sql = strtolower(implode(' ', array_column($queries, 'query')));
    expect($sql)->toContain($expectedType, 'preferences', 'null')->not->toContain('default');
    $rollback = $connection->pretend(fn () => $migration->down());
    expect(strtolower(implode(' ', array_column($rollback, 'query'))))->toContain('drop ', 'preferences');
})->with([
    'MySQL' => [MySqlConnection::class, 'json'],
    'MariaDB' => [MariaDbConnection::class, 'json'],
    'PostgreSQL' => [PostgresConnection::class, 'json'],
    'SQL Server' => [SqlServerConnection::class, 'nvarchar(max)'],
]);

it('uses the selected model connection instead of the default database connection', function (): void {
    config()->set('database.connections.preferences_secondary', ['driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '']);
    Schema::connection('preferences_secondary')->create('preference_generator_users', function (Blueprint $table): void {
        $table->id();
    });
    $this->artisan('install:user-preferences', ['--model' => PreferenceGeneratorSecondaryUser::class])->assertSuccessful();
    $files = glob(database_path('migrations/*.php'));
    $migration = require $files[0];
    expect($migration->getConnection())->toBe('preferences_secondary');
    $migration->up();
    expect(Schema::connection('preferences_secondary')->hasColumn('preference_generator_users', 'preferences'))->toBeTrue()
        ->and(Schema::hasColumn('preference_generator_users', 'preferences'))->toBeFalse();
});

it('uses the deployment default connection when the model inherits its connection', function (): void {
    config()->set('database.connections.production', ['driver' => 'sqlite', 'database' => ':memory:', 'prefix' => '']);
    Schema::connection('production')->create('preference_generator_users', function (Blueprint $table): void {
        $table->id();
    });
    $this->artisan('install:user-preferences', ['--model' => PreferenceGeneratorUser::class])->assertSuccessful();
    $migration = require glob(database_path('migrations/*.php'))[0];
    expect($migration->getConnection())->toBeNull();
    config()->set('database.default', 'production');
    $migration->up();
    expect(Schema::connection('production')->hasColumn('preference_generator_users', 'preferences'))->toBeTrue()
        ->and(Schema::connection('testing')->hasColumn('preference_generator_users', 'preferences'))->toBeFalse();
    $migration->down();
    expect(Schema::connection('production')->hasColumn('preference_generator_users', 'preferences'))->toBeFalse();
});

it('generates a reviewable migration before the database exists', function (): void {
    config()->set('database.connections.unavailable', ['driver' => 'sqlite', 'database' => $this->preferencesGeneratorPath.'/missing.sqlite', 'prefix' => '']);
    config()->set('database.default', 'unavailable');
    $this->artisan('install:user-preferences', ['--model' => PreferenceGeneratorUser::class])
        ->expectsOutputToContain('could not be inspected')
        ->assertSuccessful();
    $files = glob(database_path('migrations/*.php'));
    expect($files)->toHaveCount(1);
    $process = new Process([PHP_BINARY, '-l', $files[0]]);
    $process->mustRun();
    expect(file_exists($this->preferencesGeneratorPath.'/missing.sqlite'))->toBeFalse();
});

it('does not duplicate or overwrite an existing generated migration', function (): void {
    $this->artisan('install:user-preferences', ['--model' => PreferenceGeneratorUser::class])->assertSuccessful();
    $files = glob(database_path('migrations/*.php'));
    file_put_contents($files[0], 'reviewed user migration');
    $this->artisan('install:user_preferences', ['--model' => PreferenceGeneratorUser::class])->expectsOutputToContain('already exists')->assertSuccessful();
    expect(glob(database_path('migrations/*.php')))->toHaveCount(1)
        ->and(file_get_contents($files[0]))->toBe('reviewed user migration');
});

it('skips creating a migration when the column already exists', function (): void {
    Schema::table('preference_generator_users', function (Blueprint $table): void {
        $table->json('preferences')->nullable();
    });
    $this->artisan('install:user-preferences', ['--model' => PreferenceGeneratorUser::class])->expectsOutputToContain('already exists')->assertSuccessful();
    expect(glob(database_path('migrations/*.php')))->toBe([]);
});

it('rejects an unsafe preference column', function (mixed $key): void {
    config()->set('front-awesome.preferences.key', $key);
    $this->artisan('install:user-preferences', ['--model' => PreferenceGeneratorUser::class])->expectsOutputToContain('portable column and Inertia property identifier')->assertFailed();
    expect(glob(database_path('migrations/*.php')))->toBe([]);
})->with(['settings->appearance', 'settings.name', '', str_repeat('x', 64), 12, '__proto__', 'prototype', 'constructor']);

it('rejects models which cannot represent authenticated users', function (string $model): void {
    $this->artisan('install:user-preferences', ['--model' => $model])->expectsOutputToContain('authenticatable Eloquent model')->assertFailed();
    expect(glob(database_path('migrations/*.php')))->toBe([]);
})->with([stdClass::class, PreferenceGeneratorPlainModel::class, 'App\\Models\\MissingUser']);

#[Table(name: 'preference_generator_users')]
class PreferenceGeneratorUser extends Model implements AuthenticatableContract
{
    use Authenticatable;
    use HasFactory;
}

#[Table(name: 'preference_generator_users')]
class PreferenceGeneratorPlainModel extends Model
{
    use HasFactory;
}

#[Connection('preferences_secondary')]
class PreferenceGeneratorSecondaryUser extends PreferenceGeneratorUser
{
    use HasFactory;
}
