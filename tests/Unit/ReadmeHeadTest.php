<?php

declare(strict_types=1);

use ArtisanToolbox\FrontAwesome\FrontAwesome;
use ArtisanToolbox\Maintainer\Versionable\Readme\Badge;

it('configures the package logo and badges for the managed README header', function () {
    $head = (new FrontAwesome)->readmeHead();
    $logo = $head->logo();

    expect($head->title())->toBe('Front Awesome')
        ->and($logo)->toBe(['src' => 'logo/front-awesome-icon.svg', 'alt' => '', 'width' => 88])
        ->and(dirname(__DIR__, 2).'/logo/front-awesome-icon.svg')->toBeFile()
        ->and(array_map(static fn (Badge $badge): string => $badge->link(), $head->badges()))->toBe([
            'https://github.com/artisan-toolbox/front-awesome/releases',
            'https://packagist.org/packages/artisan-toolbox/front-awesome',
            'https://github.com/artisan-toolbox/front-awesome/actions',
        ]);
});
