<?php

declare(strict_types=1);

use ArtisanToolbox\FrontAwesome\FrontAwesomeServiceProvider;
use Illuminate\Support\Facades\File;
use Illuminate\Support\ServiceProvider;

beforeEach(function (): void {
    File::delete(resource_path('css/branding.css'));
});

afterEach(function (): void {
    File::delete(resource_path('css/branding.css'));
});

it('publishes only the editable branding stylesheet under its dedicated tag', function (): void {
    expect(ServiceProvider::pathsToPublish(FrontAwesomeServiceProvider::class, 'front-awesome-branding'))
        ->toBe([dirname(__DIR__, 2).'/resources/css/branding.css' => resource_path('css/branding.css')]);

    $this->artisan('vendor:publish', ['--tag' => 'front-awesome-branding'])->assertSuccessful();
    expect(File::get(resource_path('css/branding.css')))
        ->toBe(File::get(dirname(__DIR__, 2).'/resources/css/branding.css'));
});

it('preserves application branding when publishing again without force', function (): void {
    File::ensureDirectoryExists(resource_path('css'));
    File::put(resource_path('css/branding.css'), '/* Application-owned branding. */');

    $this->artisan('vendor:publish', ['--tag' => 'front-awesome-branding'])->assertSuccessful();
    expect(File::get(resource_path('css/branding.css')))->toBe('/* Application-owned branding. */');
});
