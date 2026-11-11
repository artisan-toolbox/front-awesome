<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\Preferences\Console\Commands;

use ArtisanToolbox\FrontAwesome\Preferences\PreferenceConfiguration;
use Illuminate\Console\Attributes\Aliases;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Filesystem\Filesystem;
use InvalidArgumentException;
use ReflectionClass;
use Throwable;

#[Aliases(['install:user_preferences'])]
#[Description('Generate a reviewable JSON preferences migration and model setup instructions')]
#[Signature('install:user-preferences {--model=App\\Models\\User : The authenticatable Eloquent model class}')]
final class InstallUserPreferencesCommand extends Command
{
    public function handle(Filesystem $files): int
    {
        try {
            $class = $this->option('model');

            throw_if(! is_string($class) || ! is_subclass_of($class, Model::class) || ! is_subclass_of($class, Authenticatable::class) || ! (new ReflectionClass($class))->isInstantiable(), InvalidArgumentException::class, 'The model option must name an instantiable authenticatable Eloquent model.');

            $column = PreferenceConfiguration::key();

            $model = new $class;
            $table = $model->getTable();
            $connection = $model->getConnection();
            $connectionName = $model->getConnectionName();

            throw_if(preg_match('/^[A-Za-z_][A-Za-z0-9_]{0,62}$/D', $table) !== 1 || $connectionName === '', InvalidArgumentException::class, 'The model must use a portable SQL table identifier of at most 63 characters and a named connection.');

            $directory = database_path('migrations');
            $migrationName = 'add_'.$column.'_to_'.$table.'_table';
            $existing = $files->glob($directory.'/*_'.$migrationName.'.php');
            $hasColumn = false;

            if ($existing === []) {
                try {
                    $hasColumn = $connection->getSchemaBuilder()->hasColumn($table, $column);
                } catch (Throwable) {
                    $this->components->warn('The database schema could not be inspected. Review the migration for an existing column before migrating.');
                }
            }

            if ($existing !== []) {
                $this->components->info('A matching migration already exists. Review it before migrating: '.$existing[0]);
            } elseif ($hasColumn) {
                $this->components->info('The '.$table.'.'.$column.' column already exists. No migration was created; verify that it accepts nullable JSON.');
            } else {
                $path = $directory.'/'.date('Y_m_d_His').'_'.$migrationName.'.php';
                $stub = $files->get(__DIR__.'/../../stubs/user-preferences-migration.stub');
                $contents = str_replace(
                    ['{{ connection }}', '{{ table }}', '{{ column }}'],
                    array_map(static fn (?string $value): string => $value === null ? 'null' : "'".addcslashes($value, "\\\\'")."'", [$connectionName, $table, $column]),
                    $stub,
                );
                $files->ensureDirectoryExists($directory);
                $files->put($path, $contents);
                $this->components->info('Migration created: '.$path);
            }

            $this->newLine();
            $this->line('Add these imports and the interface/trait to '.$class.':');
            $this->line('use ArtisanToolbox\\FrontAwesome\\Preferences\\Contracts\\HasPreferences;');
            $this->line('use ArtisanToolbox\\FrontAwesome\\Preferences\\Concerns\\InteractsWithPreferences;');
            $this->line('class '.class_basename($class).' extends Authenticatable implements HasPreferences');
            $this->line('{');
            $this->line('    use InteractsWithPreferences;');
            $this->line('}');
            $this->newLine();
            $this->line('Register this model in AppServiceProvider::boot():');
            $this->line('\\ArtisanToolbox\\FrontAwesome\\FrontAwesome::setPreferenceStore(\\'.ltrim($class, '\\').'::class);');
            $this->line('Keep front-awesome.preferences.key set to '.$column.'.');
            $this->line('Review the migration, then run php artisan migrate. No model was edited and no migration was executed.');
            $this->line('Rolling back the generated migration drops only '.$table.'.'.$column.' and its stored preferences.');

            return self::SUCCESS;
        } catch (Throwable $error) {
            $this->components->error($error->getMessage());

            return self::FAILURE;
        }
    }
}
