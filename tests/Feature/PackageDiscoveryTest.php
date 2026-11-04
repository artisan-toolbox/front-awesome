<?php

declare(strict_types=1);

use ArtisanToolbox\FrontAwesome\FrontAwesomeServiceProvider;
use ArtisanToolbox\Mosaicast\MosaicastServiceProvider;
use Inertia\ServiceProvider as InertiaServiceProvider;

it('boots Front Awesome with its Laravel integrations', function (): void {
    expect($this->app->getLoadedProviders())->toHaveKeys([
        FrontAwesomeServiceProvider::class,
        MosaicastServiceProvider::class,
        InertiaServiceProvider::class,
    ]);
});
