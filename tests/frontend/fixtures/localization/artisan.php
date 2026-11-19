<?php

declare(strict_types=1);
use ArtisanToolbox\FrontAwesome\FrontAwesomeServiceProvider;
use Illuminate\Contracts\Console\Kernel;
use Orchestra\Testbench\Foundation\Application;
use Symfony\Component\Console\Input\ArgvInput;

require dirname(__DIR__, 4).'/vendor/autoload.php';

$app = Application::create(options: ['extra' => ['providers' => [FrontAwesomeServiceProvider::class]]]);
$app->useLangPath(getcwd().'/lang');
$app->make(Kernel::class)->bootstrap();
$app->useConfigPath(getcwd().'/config');
$app->make('config')->set('front-awesome.translations.include_application', true);
$app->make('config')->set('front-awesome.translations.output', getcwd().'/generated/catalog.json');

if (file_exists(getcwd().'/config/front-awesome.php')) {
    $app->make('config')->set('front-awesome.translations', array_replace_recursive($app->make('config')->get('front-awesome.translations'), require getcwd().'/config/front-awesome.php'));
}

exit($app->handleCommand(new ArgvInput));
