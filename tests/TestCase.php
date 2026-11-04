<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\Tests;

use ArtisanToolbox\FrontAwesome\FrontAwesomeServiceProvider;
use Orchestra\Testbench\TestCase as Orchestra;

abstract class TestCase extends Orchestra
{
    protected $enablesPackageDiscoveries = true;

    protected function getPackageProviders($app): array
    {
        return [FrontAwesomeServiceProvider::class];
    }
}
