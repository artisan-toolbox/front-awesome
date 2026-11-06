<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome;

use Illuminate\Support\ServiceProvider;

final class FrontAwesomeServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        $this->replaceConfigRecursivelyFrom(dirname(__DIR__).'/config/front-awesome.php', 'front-awesome');
    }

    public function boot(): void
    {
        if ($this->app->runningInConsole()) {
            $this->publishes([
                dirname(__DIR__).'/config/front-awesome.php' => config_path('front-awesome.php'),
            ], 'front-awesome-config');

            $this->publishes([
                dirname(__DIR__).'/resources/css/branding.css' => resource_path('css/branding.css'),
            ], 'front-awesome-branding');
        }
    }
}
