<?php

declare(strict_types=1);

use ArtisanToolbox\FrontAwesome\Tests\Fixtures\PreferenceUser;
use Illuminate\Config\Repository;
use Illuminate\Container\Container;
use Illuminate\Database\Capsule\Manager;
use Illuminate\Database\Events\QueryExecuted;
use Illuminate\Events\Dispatcher;
use Illuminate\Support\Sleep;

require dirname(__DIR__, 2).'/vendor/autoload.php';

$container = new Container;
Container::setInstance($container);
$container->instance('config', new Repository(['front-awesome' => ['preferences' => ['key' => 'preferences']]]));
$database = new Manager($container);
$database->addConnection(['driver' => 'sqlite', 'database' => $argv[1], 'busy_timeout' => 200, 'prefix' => '']);
$events = new Dispatcher($container);
$database->setEventDispatcher($events);
$database->setAsGlobal();
$database->bootEloquent();
$user = PreferenceUser::query()->findOrFail(1);
$waiting = false;
$events->listen(QueryExecuted::class, function (QueryExecuted $query) use (&$waiting, $argv): void {
    if ($waiting || ! str_starts_with($query->sql, 'select')) {
        return;
    }
    $waiting = true;
    echo "ready\n";
    $deadline = microtime(true) + 10;
    while (! file_exists($argv[2])) {
        throw_if(microtime(true) > $deadline, RuntimeException::class, 'The concurrent writer was not released.');
        Sleep::usleep(10000);
    }
});
$user->setFrontAwesomePreference($argv[3], $argv[4]);
echo "saved\n";
