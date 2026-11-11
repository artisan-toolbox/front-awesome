<?php

declare(strict_types=1);

use ArtisanToolbox\FrontAwesome\Preferences\Http\Controllers\UpdatePreferencesController;
use ArtisanToolbox\FrontAwesome\Preferences\Http\Middleware\HandlePreferences;
use Illuminate\Support\Facades\Route;

Route::patch('/front-awesome/preferences', UpdatePreferencesController::class)
    ->middleware(['web', HandlePreferences::class])
    ->name('front-awesome.preferences.update');
