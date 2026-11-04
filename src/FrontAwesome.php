<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome;

use ArtisanToolbox\Maintainer\Versionable\Contracts\Versionable;
use ArtisanToolbox\Maintainer\Versionable\Contracts\WithReadmeHead;
use ArtisanToolbox\Maintainer\Versionable\Readme\Badge;
use ArtisanToolbox\Maintainer\Versionable\Readme\Head;

/** @internal */
final class FrontAwesome implements Versionable, WithReadmeHead
{
    public const string VERSION = '1.0.0';

    public function readmeHead(): Head
    {
        return (new Head)
            ->withLogo(src: 'logo/front-awesome-icon.svg', alt: '', width: 88)
            ->withTitle('Front Awesome')
            ->withDescription('Reusable Vue components and frontend integrations for Laravel and Inertia applications.')
            ->addBadge(Badge::releaseVersion('https://github.com/artisan-toolbox/front-awesome/releases'))
            ->addBadge(Badge::make(
                link: 'https://packagist.org/packages/artisan-toolbox/front-awesome',
                imgSrc: 'https://img.shields.io/packagist/php-v/artisan-toolbox/front-awesome.svg?style=flat-square',
                imgAlt: 'PHP from Packagist',
            ))
            ->addBadge(Badge::make(
                link: 'https://github.com/artisan-toolbox/front-awesome/actions',
                imgSrc: 'https://img.shields.io/github/actions/workflow/status/artisan-toolbox/front-awesome/tests.yml?branch=1.x&label=Tests&style=flat-square',
                imgAlt: 'Tests',
            ));
    }
}
