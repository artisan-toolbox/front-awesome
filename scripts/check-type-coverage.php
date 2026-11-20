<?php

declare(strict_types=1);

use Illuminate\Filesystem\Filesystem;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Process\Process;

$root = dirname(__DIR__);

require $root.'/vendor/autoload.php';

$report = tempnam(sys_get_temp_dir(), 'front-awesome-types-');

throw_if($report === false, RuntimeException::class, 'Could not create the type coverage report.');

$exitCode = 0;

try {
    $pest = new Process([
        PHP_BINARY,
        $root.'/vendor/bin/pest',
        ...array_slice($argv, 1),
        '--type-coverage',
        '--min=100',
        '--no-cache',
        '--memory-limit=512M',
        '--type-coverage-json='.$report,
    ], $root, timeout: null);

    $pest->mustRun(static function (string $stream, string $output): void {
        fwrite($stream === Process::ERR ? STDERR : STDOUT, $output);
    });

    $results = json_decode((string) file_get_contents($report), true, flags: JSON_THROW_ON_ERROR);
    $covered = array_map(static fn (string $file): string => str_replace('\\', '/', $file), array_column($results['result'] ?? [], 'file'));
    $expected = [];

    foreach (Finder::create()->files()->name('*.php')->in($root.'/src') as $file) {
        $expected[] = 'src/'.str_replace('\\', '/', $file->getRelativePathname());
    }

    // Pest Type Coverage skips files containing the literal text 'trait ', including this command's message.
    $pestExclusions = [
        'src/Preferences/Concerns/InteractsWithPreferences.php',
        'src/Preferences/Console/Commands/InstallUserPreferencesCommand.php',
    ];

    $missing = array_diff($expected, $covered, $pestExclusions);

    if ($missing !== []) {
        sort($missing);

        throw new RuntimeException('Type coverage is incomplete. Missing files: '.implode(', ', $missing));
    }

    $analysed = count(array_intersect($expected, $covered));

    fwrite(STDOUT, 'Type coverage analysed '.$analysed.' of '.count($expected)." source files.\n");
} catch (Throwable $error) {
    fwrite(STDERR, $error->getMessage().PHP_EOL);

    $exitCode = 1;
} finally {
    new Filesystem()->delete($report);
}

exit($exitCode);
