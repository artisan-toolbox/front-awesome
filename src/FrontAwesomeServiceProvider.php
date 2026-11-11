<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome;

use ArtisanToolbox\FrontAwesome\Localization\Console\Commands\ExportTranslations;
use ArtisanToolbox\FrontAwesome\Preferences\CarbonPreferences;
use ArtisanToolbox\FrontAwesome\Preferences\Console\Commands\InstallUserPreferencesCommand;
use ArtisanToolbox\FrontAwesome\Preferences\Console\Commands\MakePreferencesStoreCommand;
use ArtisanToolbox\FrontAwesome\Preferences\Contracts\PreferencesStore;
use ArtisanToolbox\FrontAwesome\Preferences\Http\Middleware\HandlePreferences;
use ArtisanToolbox\FrontAwesome\Preferences\InertiaPreferences;
use ArtisanToolbox\FrontAwesome\Preferences\PreferenceConfiguration;
use ArtisanToolbox\FrontAwesome\Preferences\Stores\SessionPreferenceStore;
use ArtisanToolbox\FrontAwesome\Preferences\Stores\UserPreferenceStore;
use Illuminate\Contracts\Auth\Middleware\AuthenticatesRequests;
use Illuminate\Contracts\Foundation\Application;
use Illuminate\Contracts\Http\Kernel as HttpKernel;
use Illuminate\Foundation\Http\Kernel;
use Illuminate\Session\Middleware\StartSession;
use Illuminate\Support\Facades\Blade;
use Illuminate\Support\ServiceProvider;
use Inertia\ResponseFactory;

final class FrontAwesomeServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $config = $this->app->make('config');
        $hasLocales = $config->has('front-awesome.translations.locales');
        $locales = $config->get('front-awesome.translations.locales');
        $this->replaceConfigRecursivelyFrom(dirname(__DIR__).'/config/front-awesome.php', 'front-awesome');

        if ($hasLocales) {
            $config->set('front-awesome.translations.locales', $locales);
        }
        $this->app->scoped(PreferencesStore::class, function (Application $app): PreferencesStore {
            $class = PreferenceConfiguration::storeClass($app->make('config')->get('front-awesome.preferences.store'));

            if (is_a($class, PreferencesStore::class, true)) {
                return $app->make($class);
            }

            return new UserPreferenceStore($class, $app->make(SessionPreferenceStore::class));
        });
        $this->callAfterResolving(HttpKernel::class, function (HttpKernel $kernel): void {
            if ($kernel instanceof Kernel) {
                $kernel->addToMiddlewarePriorityAfter([StartSession::class, AuthenticatesRequests::class], HandlePreferences::class);
            }
        });
        $this->callAfterResolving(ResponseFactory::class, function (ResponseFactory $inertia): void {
            $inertia->share(new InertiaPreferences);
        });
    }

    public function boot(): void
    {
        $this->loadTranslationsFrom(dirname(__DIR__).'/lang', 'front-awesome');
        $this->loadRoutesFrom(dirname(__DIR__).'/routes/preferences.php');
        Blade::directive('frontAwesomePreferences', static fn (string $expression): string => '<?php echo \\ArtisanToolbox\\FrontAwesome\\Preferences\\PreferencesBlade::render('.($expression ?: 'null').'); ?>');
        CarbonPreferences::register();

        if ($this->app->runningInConsole()) {
            $this->commands([ExportTranslations::class, MakePreferencesStoreCommand::class, InstallUserPreferencesCommand::class]);

            $this->publishes([
                dirname(__DIR__).'/lang' => lang_path('vendor/front-awesome'),
            ], 'front-awesome-lang');

            $this->publishes([
                dirname(__DIR__).'/config/front-awesome.php' => config_path('front-awesome.php'),
            ], 'front-awesome-config');

            $this->publishes([
                dirname(__DIR__).'/resources/css/branding.css' => resource_path('css/branding.css'),
            ], 'front-awesome-branding');
        }
    }
}
