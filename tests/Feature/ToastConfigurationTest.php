<?php

declare(strict_types=1);

use ArtisanToolbox\FrontAwesome\Facades\Toast;
use ArtisanToolbox\FrontAwesome\FrontAwesomeServiceProvider;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use Inertia\Response;

it('publishes the package config with a dedicated tag', function (): void {
    expect(ServiceProvider::pathsToPublish(FrontAwesomeServiceProvider::class, 'front-awesome-config'))
        ->toBe([dirname(__DIR__, 2).'/config/front-awesome.php' => config_path('front-awesome.php')]);
});

it('applies icon overrides and disabled defaults to server toasts without sharing the config', function (): void {
    config([
        'app.key' => str_repeat('a', 32),
        'mosaicast.broadcasting.session_channel_key' => 'toast-config-test-key',
        'front-awesome' => ['webawesome' => ['toast' => ['icons' => [
            'success' => ['name' => 'tick', 'library' => 'custom'],
            'warning' => null,
            'brand' => ['library' => 'custom'],
        ]]]],
    ]);

    new FrontAwesomeServiceProvider(app())->register();

    Route::middleware('web')->get('/toast-config', function (): Response {
        Toast::success('Saved.')->flash();
        Toast::warning('Warning without a default.')->flash();
        Toast::warning('Warning with an explicit icon.')->icon('bell')->flash();
        Toast::brand('Invalid icon configuration.')->flash();
        Toast::neutral('Uses the package default.')->dispatch();

        return Inertia::render('ToastConfig');
    });

    $this->get('/toast-config', ['X-Inertia' => 'true'])
        ->assertOk()
        ->assertJsonMissingPath('props.frontAwesome.toastIcons')
        ->assertJsonPath('flash', ['front-awesome.toasts' => [
            ['message' => 'Saved.', 'options' => ['variant' => 'success', 'icon' => ['name' => 'tick', 'library' => 'custom']]],
            ['message' => 'Warning without a default.', 'options' => ['variant' => 'warning']],
            ['message' => 'Warning with an explicit icon.', 'options' => ['variant' => 'warning', 'icon' => 'bell']],
            ['message' => 'Invalid icon configuration.', 'options' => ['variant' => 'brand']],
        ]])
        ->assertJsonPath('props.mosaicast.events.0.payload.options.icon', 'circle-info');
});
