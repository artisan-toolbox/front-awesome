<?php

declare(strict_types=1);

use ArtisanToolbox\FrontAwesome\FrontAwesomeServiceProvider;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\ServiceProvider;
use Symfony\Component\Process\ExecutableFinder;
use Symfony\Component\Process\Process;

beforeEach(function (): void {
    $this->translationDirectory = sys_get_temp_dir().'/front-awesome-translations-'.bin2hex(random_bytes(8));
    app()->useLangPath($this->translationDirectory.'/lang');
    config(['front-awesome.translations.output' => $this->translationDirectory.'/output/catalog.json']);
});

afterEach(function (): void {
    (new Filesystem)->deleteDirectory($this->translationDirectory);
});

function translationFixture(string $relative, string $contents): void
{
    $path = app()->langPath($relative);
    (new Filesystem)->ensureDirectoryExists(dirname($path));
    file_put_contents($path, $contents);
}

function exportedTranslations(): array
{
    expect(Artisan::call('front-awesome:export-translations', ['--manifest' => true]))->toBe(0);
    $manifest = json_decode(Artisan::output(), true, flags: JSON_THROW_ON_ERROR);

    return [$manifest, json_decode(file_get_contents($manifest['output']), true, flags: JSON_THROW_ON_ERROR)];
}

it('registers translations and their dedicated publish tag', function (): void {
    expect(ServiceProvider::pathsToPublish(FrontAwesomeServiceProvider::class, 'front-awesome-lang'))
        ->toHaveKey(dirname(__DIR__, 2).'/lang');
    expect(__('front-awesome::printing.title'))->toBe('Print documents');
});

it('uses the application fallback environment when exporting translations', function (?string $environment, string $expected): void {
    (new Filesystem)->ensureDirectoryExists($this->translationDirectory);
    $process = new Process([
        PHP_BINARY,
        dirname(__DIR__).'/frontend/fixtures/localization/artisan.php',
        'front-awesome:export-translations',
        '--manifest',
        '--no-ansi',
    ], $this->translationDirectory, ['APP_FALLBACK_LOCALE' => $environment ?? false]);
    $process->mustRun();
    $manifest = json_decode($process->getOutput(), true, flags: JSON_THROW_ON_ERROR);
    $catalog = json_decode(file_get_contents($manifest['output']), true, flags: JSON_THROW_ON_ERROR);
    expect($catalog['fallbackLocale'])->toBe($expected);
})->with([
    'unset defaults to English' => [null, 'en'],
    'Spanish application fallback' => ['es', 'es'],
    'Brazilian Portuguese application fallback' => ['pt_BR', 'pt-BR'],
]);

it('exports complete mandatory catalogs and exact schemas without application data by default', function (): void {
    expect(config('front-awesome.translations.locales'))->toBe(['*']);
    translationFixture('en/app.php', "<?php return ['secret' => 'Only server'];");
    [$manifest, $catalog] = exportedTranslations();
    expect($catalog['version'])->toBe(1);
    expect($catalog['fallbackLocale'])->toBe('en');
    expect($catalog['availableLocales'])->toBe(['en', 'es', 'pt-BR']);
    expect(array_keys($catalog['locales']))->toBe(['en', 'es', 'pt-BR']);
    expect($catalog['locales']['pt-BR']['sourceLocale'])->toBe('pt_BR');
    $keys = array_keys($catalog['locales']['en']['messages']);
    expect(count($keys))->toBeGreaterThan(40);
    foreach ($catalog['locales'] as $entry) {
        expect(array_keys($entry['messages']))->toBe($keys);
        expect($entry['messages'])->not->toHaveKey('app.secret');
    }
    expect(file_get_contents($manifest['types']))->toContain('"front-awesome::printing.title": string;');
    expect(file_get_contents($manifest['output']))->not->toContain($this->translationDirectory);
    $before = file_get_contents($manifest['output']);
    exportedTranslations();
    expect(file_get_contents($manifest['output']))->toBe($before);
});

it('merges Laravel overrides and JSON precedence while respecting application filters', function (): void {
    config(['front-awesome.translations.include_application' => true,
        'front-awesome.translations.include_files' => ['en/*.php', 'en.json'],
        'front-awesome.translations.exclude_files' => ['en/private.php'],
        'front-awesome.translations.exclude_keys' => ['app.hidden*', 'front-awesome::*'],
    ]);
    translationFixture('en/app.php', "<?php return ['greeting' => 'Hello :name', 'nested' => ['value' => 'Nested'], 'hidden' => 'Secret'];");
    translationFixture('en/private.php', "<?php return ['token' => 'Never export'];");
    translationFixture('en.json', '{"app.greeting":"JSON wins","literal.with.dots":"Literal {name}"}');
    translationFixture('vendor/front-awesome/en/printing.php', "<?php return ['title' => 'Published override'];");
    [, $catalog] = exportedTranslations();
    expect($catalog['locales']['en']['messages'])
        ->toHaveKey('app.greeting', 'JSON wins')
        ->toHaveKey('app.nested.value', 'Nested')
        ->toHaveKey('literal.with.dots', 'Literal {name}')
        ->toHaveKey('front-awesome::printing.title', 'Published override')
        ->not->toHaveKeys(['app.hidden', 'private.token']);
});

it('exports nested groups extra locales and unregistered namespace overrides', function (): void {
    config(['front-awesome.translations.include_application' => true, 'front-awesome.translations.locales' => ['fr_CA']]);
    translationFixture('fr_CA/account/profile.php', "<?php return ['name' => 'Nom'];");
    translationFixture('vendor/custom/fr_CA/main.php', "<?php return ['title' => 'Personnalisé'];");
    [, $catalog] = exportedTranslations();
    expect($catalog['locales']['fr-CA']['messages'])->toBe(['account/profile.name' => 'Nom', 'custom::main.title' => 'Personnalisé']);
    expect($catalog['locales'])->toHaveKeys(['en', 'es', 'pt-BR']);
});

it('preserves numeric JSON translation keys supported by Laravel', function (): void {
    config(['front-awesome.translations.include_application' => true]);
    translationFixture('en.json', '{"123":"Translated numeric key","0":"Zero"}');
    expect(__('123'))->toBe('Translated numeric key');
    [$manifest, $catalog] = exportedTranslations();
    expect(file_get_contents($manifest['output']))->toContain('"123": "Translated numeric key"');
    expect(file_get_contents($manifest['types']))->toContain('"123": string;');
    expect($catalog['locales']['en']['messages'])
        ->toHaveKey('123', 'Translated numeric key')
        ->toHaveKey('0', 'Zero');
});

it('excludes application JSON keys that only imitate the package namespace', function (): void {
    config(['front-awesome.translations.include_application' => true,
        'front-awesome.translations.exclude_keys' => ['front-awesome::*'],
    ]);
    translationFixture('en.json', '{"front-awesome::private.token":"Application-only text"}');
    [, $catalog] = exportedTranslations();
    expect($catalog['locales']['en']['messages'])
        ->not->toHaveKey('front-awesome::private.token')
        ->toHaveKey('front-awesome::printing.title', 'Print documents');
});

it('resolves dotted PHP translation keys with Laravel precedence regardless of insertion order', function (bool $literalFirst): void {
    config(['front-awesome.translations.include_application' => true]);
    $lines = $literalFirst
        ? ['foo.bar' => 'Literal dotted key', 'foo' => ['bar' => 'Nested key']]
        : ['foo' => ['bar' => 'Nested key'], 'foo.bar' => 'Literal dotted key'];
    translationFixture('en/app.php', '<?php return '.var_export($lines, true).';');
    expect(__('app.foo.bar'))->toBe('Literal dotted key');
    [, $catalog] = exportedTranslations();
    expect($catalog['locales']['en']['messages']['app.foo.bar'])->toBe(__('app.foo.bar'));
})->with([true, false]);

it('leaves prior artifacts intact when translation data is invalid', function (string $contents): void {
    config(['front-awesome.translations.include_application' => true]);
    [$manifest] = exportedTranslations();
    $before = file_get_contents($manifest['output']);
    $types = file_get_contents($manifest['types']);
    translationFixture('en/app.php', $contents);
    expect(Artisan::call('front-awesome:export-translations'))->toBe(1);
    expect(file_get_contents($manifest['output']))->toBe($before);
    expect(file_get_contents($manifest['types']))->toBe($types);
})->with(["<?php return ['invalid' => null];", "<?php return ['invalid' => new stdClass];", "<?php return ['invalid' => false];"]);

it('rejects invalid configuration without creating an artifact', function (): void {
    config(['front-awesome.translations.locales' => ['../secret']]);
    expect(Artisan::call('front-awesome:export-translations'))->toBe(1);
    expect(file_exists(config('front-awesome.translations.output')))->toBeFalse();
});

it('discovers all application locales when the global switch is enabled', function (): void {
    config(['front-awesome.translations.include_application' => true]);
    translationFixture('de/account.php', "<?php return ['title' => 'Konto'];");
    translationFixture('fr.json', '{"Greeting":"Bonjour"}');
    translationFixture('vendor/custom/it/main.php', "<?php return ['title' => 'Titolo'];");
    [, $catalog] = exportedTranslations();
    expect($catalog['locales']['de']['messages'])->toBe(['account.title' => 'Konto']);
    expect($catalog['locales']['fr']['messages'])->toBe(['Greeting' => 'Bonjour']);
    expect($catalog['locales']['it']['messages'])->toBe(['custom::main.title' => 'Titolo']);
    expect($catalog['availableLocales'])->toBe(['de', 'en', 'es', 'fr', 'it', 'pt-BR']);
});

it('limits selectable and application locales while retaining internal package catalogs', function (): void {
    config(['front-awesome.translations.include_application' => true,
        'front-awesome.translations.locales' => ['es', 'en'],
    ]);
    translationFixture('en/app.php', "<?php return ['title' => 'English application'];");
    translationFixture('es/app.php', "<?php return ['title' => 'Spanish application'];");
    translationFixture('pt_BR/app.php', "<?php return ['private' => 'Not selected'];");
    translationFixture('de/app.php', "<?php return ['private' => 'Not selected'];");
    [$manifest, $catalog] = exportedTranslations();
    expect($catalog['availableLocales'])->toBe(['es', 'en']);
    expect(array_keys($catalog['locales']))->toBe(['en', 'es', 'pt-BR']);
    expect($catalog['locales']['en']['messages'])->toHaveKey('app.title', 'English application');
    expect($catalog['locales']['es']['messages'])->toHaveKey('app.title', 'Spanish application');
    expect($catalog['locales']['pt-BR']['messages'])
        ->toHaveKey('front-awesome::printing.title', 'Imprimir documentos')
        ->not->toHaveKey('app.private');
    expect(file_get_contents($manifest['types']))->not->toContain('app.private');
});

it('retains an unselected application fallback without advertising it in the selector', function (): void {
    config(['front-awesome.translations.include_application' => true,
        'front-awesome.translations.locales' => ['es'],
        'front-awesome.translations.fallback_locale' => 'fr',
    ]);
    translationFixture('fr/app.php', "<?php return ['title' => 'French fallback'];");
    translationFixture('de/app.php', "<?php return ['private' => 'Not selected'];");
    [, $catalog] = exportedTranslations();
    expect($catalog['availableLocales'])->toBe(['es']);
    expect($catalog['fallbackLocale'])->toBe('fr');
    expect($catalog['locales']['fr']['messages'])->toHaveKey('app.title', 'French fallback');
    expect($catalog['locales'])->not->toHaveKey('de');
});

it('discovers published package locales without enabling application messages', function (): void {
    translationFixture('vendor/front-awesome/fr/printing.php', "<?php return ['title' => 'Imprimer'];");
    translationFixture('de/app.php', "<?php return ['title' => 'Private application'];");
    [, $catalog] = exportedTranslations();
    expect($catalog['availableLocales'])->toBe(['en', 'es', 'fr', 'pt-BR']);
    expect($catalog['locales']['fr']['messages'])->toBe(['front-awesome::printing.title' => 'Imprimer']);
    expect($catalog['locales'])->not->toHaveKey('de');
});

it('rejects empty selections and ambiguous wildcard lists', function (array $locales): void {
    [$manifest] = exportedTranslations();
    $before = file_get_contents($manifest['output']);
    config(['front-awesome.translations.locales' => $locales]);
    expect(Artisan::call('front-awesome:export-translations'))->toBe(1);
    expect(file_get_contents($manifest['output']))->toBe($before);
})->with([
    'empty selection' => [[]],
    'mixed wildcard' => [['*', 'en']],
    'partial wildcard' => [['en*']],
]);

it('matches optional basename and relative path regexes with exclusions winning', function (): void {
    config(['front-awesome.translations.include_application' => true,
        'front-awesome.translations.include_regex' => ['file' => ['/^app\.php$/'], 'path' => ['~^es/public/~']],
        'front-awesome.translations.exclude_regex' => ['file' => ['/^hidden\.php$/'], 'path' => ['~^en/private/~']],
    ]);
    translationFixture('en/app.php', "<?php return ['title' => 'Included basename'];");
    translationFixture('es/public/main.php', "<?php return ['title' => 'Included path'];");
    translationFixture('es/public/hidden.php', "<?php return ['title' => 'Excluded basename'];");
    translationFixture('en/private/app.php', "<?php return ['title' => 'Excluded path'];");
    translationFixture('en/other.php', "<?php return ['title' => 'Not included'];");
    [, $catalog] = exportedTranslations();
    expect($catalog['locales']['en']['messages'])->toHaveKey('app.title', 'Included basename')->not->toHaveKeys(['private/app.title', 'other.title']);
    expect($catalog['locales']['es']['messages'])->toHaveKey('public/main.title', 'Included path')->not->toHaveKey('public/hidden.title');
});

it('rejects malformed regexes and ambiguous locale aliases without replacing artifacts', function (): void {
    [$manifest] = exportedTranslations();
    $before = file_get_contents($manifest['output']);
    config(['front-awesome.translations.include_regex.path' => ['[invalid']]);
    expect(Artisan::call('front-awesome:export-translations'))->toBe(1);
    expect(file_get_contents($manifest['output']))->toBe($before);
    config(['front-awesome.translations.include_regex.path' => [], 'front-awesome.translations.locales' => ['pt-BR']]);
    expect(Artisan::call('front-awesome:export-translations'))->toBe(1);
    expect(file_get_contents($manifest['output']))->toBe($before);
});

it('rejects a published empty locale allowlist instead of enabling wildcard discovery', function (): void {
    config(['front-awesome.translations.locales' => []]);
    (new FrontAwesomeServiceProvider(app()))->register();
    expect(config('front-awesome.translations.locales'))->toBe([]);
    expect(Artisan::call('front-awesome:export-translations'))->toBe(1);
    expect(file_exists(config('front-awesome.translations.output')))->toBeFalse();
});

it('preserves both previous artifacts when browser locale aliases collide', function (array $locales): void {
    [$manifest] = exportedTranslations();
    $before = [file_get_contents($manifest['output']), file_get_contents($manifest['types'])];
    config(['front-awesome.translations.locales' => $locales]);
    expect(Artisan::call('front-awesome:export-translations'))->toBe(1);
    expect(Artisan::output())->toContain('same browser locale');
    expect([file_get_contents($manifest['output']), file_get_contents($manifest['types'])])->toBe($before);
})->with([
    [['iw', 'he']],
    [['sh', 'sr_Latn']],
]);

it('preserves generated artifacts when the locale validator executable is unavailable or incompatible', function (string $binary): void {
    [$manifest] = exportedTranslations();
    $before = [file_get_contents($manifest['output']), file_get_contents($manifest['types'])];
    config(['front-awesome.translations.node_binary' => $binary]);
    expect(Artisan::call('front-awesome:export-translations'))->toBe(1);
    expect([file_get_contents($manifest['output']), file_get_contents($manifest['types'])])->toBe($before);
})->with(['', 'missing-front-awesome-node-executable', PHP_BINARY]);

it('allows the tooling host to override the configured Node executable', function (): void {
    config(['front-awesome.translations.node_binary' => 'missing-front-awesome-node-executable']);
    $node = (new ExecutableFinder)->find('node');
    expect($node)->not->toBeNull();
    expect(Artisan::call('front-awesome:export-translations', ['--node' => $node]))->toBe(0);
    expect(file_exists(config('front-awesome.translations.output')))->toBeTrue();
});
