<?php

declare(strict_types=1);
use ArtisanToolbox\FrontAwesome\Preferences\Stores\SessionPreferenceStore;

return [
    'preferences' => [
        'key' => 'preferences',
        'store' => SessionPreferenceStore::class,
        'guard' => null,
        'carbon_macro' => true,
    ],
    'translations' => [
        'node_binary' => 'node',
        'include_application' => false,
        'locales' => ['*'],
        'fallback_locale' => env('APP_FALLBACK_LOCALE', 'en'),
        'include_files' => [],
        'exclude_files' => [],
        'include_regex' => ['path' => [], 'file' => []],
        'exclude_regex' => ['path' => [], 'file' => []],
        'exclude_keys' => [],
        'output' => resource_path('js/generated/front-awesome-translations.json'),
    ],
    'webawesome' => [
        'toast' => [
            // Use an icon name, an array with name and optional library, family, and variant, or null to disable it.
            'icons' => [
                'brand' => 'bell',
                'success' => 'circle-check',
                'warning' => 'triangle-exclamation',
                'danger' => 'circle-exclamation',
                'neutral' => 'circle-info',
            ],
        ],
    ],
];
