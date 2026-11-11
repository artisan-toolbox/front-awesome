<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome;

use ArtisanToolbox\FrontAwesome\Preferences\PreferenceConfiguration;
use ArtisanToolbox\Maintainer\Versionable\Contracts\Versionable;
use ArtisanToolbox\Maintainer\Versionable\Contracts\WithReadmeHead;
use ArtisanToolbox\Maintainer\Versionable\Readme\Badge;
use ArtisanToolbox\Maintainer\Versionable\Readme\Head;

final class FrontAwesome implements Versionable, WithReadmeHead
{
    public const string VERSION = '1.0.0-alpha.1';

    /**
     * Select a custom request-aware store or an authenticatable model implementing HasPreferences.
     *
     * @param  class-string  $class
     */
    public static function setPreferenceStore(string $class): void
    {
        config(['front-awesome.preferences.store' => PreferenceConfiguration::storeClass($class)]);
    }

    public function readmeHead(): Head
    {
        return (new Head)
            ->withLogo(src: 'logo/front-awesome-icon.svg', alt: '', width: 88)
            ->withTitle('Front Awesome')
            ->withDescription('Reusable Vue components and frontend integrations for Laravel and Inertia applications.')
            ->addBadge(Badge::make(
                link: 'https://github.com/artisan-toolbox/front-awesome/releases',
                imgSrc: 'https://img.shields.io/badge/Release-in%20development-lightgrey?style=flat-square',
                imgAlt: 'Release',
            ))
            ->addBadge(Badge::make(
                link: 'https://atb.dev.br/packages/front-awesome/',
                imgSrc: 'https://img.shields.io/badge/PHP-%5E8.5-777BB4?style=flat-square',
                imgAlt: 'PHP',
            ))
            ->addBadge(Badge::make(
                link: 'https://atb.dev.br/packages/front-awesome/',
                imgSrc: 'https://img.shields.io/badge/Laravel-13-FF2D20?style=flat-square',
                imgAlt: 'Laravel',
            ))
            ->addBadge(Badge::make(
                link: 'https://atb.dev.br/packages/front-awesome/',
                imgSrc: 'https://img.shields.io/badge/Node.js-%3E%3D24.11.0-339933?style=flat-square',
                imgAlt: 'Node.js',
            ))
            ->addBadge(Badge::make(
                link: 'https://github.com/artisan-toolbox/front-awesome/actions/workflows/tests.yml?query=branch%3A1.x',
                imgSrc: 'https://img.shields.io/github/actions/workflow/status/artisan-toolbox/front-awesome/tests.yml?branch=1.x&label=Tests&style=flat-square',
                imgAlt: 'Tests',
            ))
            ->addBadge(Badge::make(
                link: 'https://atb.dev.br/packages/front-awesome/',
                imgSrc: 'https://img.shields.io/badge/Docs-Read-blue?style=flat-square',
                imgAlt: 'Docs',
            ));
    }
}
