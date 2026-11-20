<?php

declare(strict_types=1);

use Symfony\Component\Process\Process;

it('rejects successful type coverage when the report omits source files', function (): void {
    $coverage = new Process([
        PHP_BINARY,
        'scripts/check-type-coverage.php',
        '--configuration=tests/Fixtures/coverage-partial.xml',
    ], dirname(__DIR__, 2));

    expect($coverage->run())->toBe(1)
        ->and($coverage->getErrorOutput())->toContain('Type coverage is incomplete.', 'src/FrontAwesomeServiceProvider.php');
});
