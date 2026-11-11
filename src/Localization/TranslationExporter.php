<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\Localization;

use Illuminate\Contracts\Foundation\Application;
use Illuminate\Filesystem\Filesystem;
use Illuminate\Support\Arr;
use Illuminate\Support\Str;
use Illuminate\Translation\FileLoader;
use InvalidArgumentException;
use Symfony\Component\Process\Process;

/** @internal */
final class TranslationExporter
{
    public function __construct(private readonly Application $app) {}

    /** @return array{output: string, types: string, watchPaths: list<string>} */
    public function export(?string $output = null, ?string $nodeBinary = null): array
    {
        $config = $this->configuration();
        $package = str_replace('\\', '/', dirname(__DIR__, 2)).'/lang';
        $application = rtrim(str_replace('\\', '/', $this->app->langPath()), '/');
        $files = new Filesystem;
        $registry = (new LocaleRegistry($this->app))->discover();
        ['locales' => $locales, 'available' => $available, 'fallback' => $fallback] = $registry;
        $nodeBinary ??= $config['node_binary'];

        throw_if($nodeBinary === '' || str_contains($nodeBinary, "\0"), InvalidArgumentException::class, 'The Node executable must be a nonempty executable name or path.');
        $validation = new Process([$nodeBinary, dirname(__DIR__, 2).'/resources/js/localization/validateLocales.mjs']);
        $validation->setInput(json_encode([
            'locales' => array_keys($locales),
            'sourceLocales' => array_values($locales),
            'availableLocales' => $available,
            'fallbackLocale' => $fallback,
        ], JSON_THROW_ON_ERROR));
        $validation->run();

        if (! $validation->isSuccessful() || trim($validation->getOutput()) !== 'Front Awesome browser locales validated.') {
            throw new InvalidArgumentException('Browser locale validation requires Node.js 24.11 or later. '.trim($validation->getErrorOutput()));
        }

        $included = function (string $file) use ($package, $application, $config): bool {
            $file = str_replace('\\', '/', $file);

            if (str_starts_with($file, $package.'/') || str_starts_with($file, $application.'/vendor/front-awesome/')) {
                return true;
            }

            if (! $config['include_application'] || ! str_starts_with($file, $application.'/')) {
                return false;
            }
            $relative = substr($file, strlen($application) + 1);

            $include = $config['include_files'] === [] && $config['include_regex']['path'] === [] && $config['include_regex']['file'] === [];

            return ($include || Str::is($config['include_files'], $relative) || $this->matchesRegex($config['include_regex'], $relative))
                && ! Str::is($config['exclude_files'], $relative)
                && ! $this->matchesRegex($config['exclude_regex'], $relative);
        };
        $loader = new FileLoader(new TranslationFilesystem($included), [$application]);
        $loader->addNamespace('front-awesome', $package);
        $registered = $this->app->make('translation.loader');
        foreach ($registered->namespaces() as $namespace => $path) {
            if ($namespace !== 'front-awesome') {
                $loader->addNamespace($namespace, $path);
            }
        }

        $catalog = ['version' => 1, 'fallbackLocale' => $fallback, 'availableLocales' => $available, 'locales' => []];
        $schema = [];
        foreach ($locales as $locale => $source) {
            $messages = [];
            $mandatoryKeys = [];
            $includeApplication = $config['include_application'] && ($locale === $fallback || in_array($locale, $available, true));
            $groups = $this->groups($files, $package.'/'.$source, 'front-awesome');
            $groups = array_merge($groups, $this->groups($files, $application.'/vendor/front-awesome/'.$source, 'front-awesome'));

            if ($includeApplication) {
                $groups = array_merge($groups, $this->groups($files, $application.'/'.$source, '*'));
                $vendor = $application.'/vendor';

                if ($files->isDirectory($vendor)) {
                    foreach ($files->directories($vendor) as $directory) {
                        $namespace = basename($directory);

                        if (! isset($loader->namespaces()[$namespace])) {
                            $loader->addNamespace($namespace, $directory);
                        }
                        $groups = array_merge($groups, $this->groups($files, $directory.'/'.$source, $namespace));
                    }
                }
            }
            foreach (array_unique($groups, SORT_REGULAR) as [$namespace, $group]) {
                $prefix = ($namespace === '*' ? '' : $namespace.'::').$group;
                $lines = $loader->load($source, $group, $namespace);
                $candidates = [];
                $this->flatten($lines, $prefix, $candidates);
                foreach (array_keys($candidates) as $key) {
                    $value = Arr::get($lines, substr($key, strlen($prefix) + 1));

                    if (is_string($value)) {
                        $messages[$key] = $value;

                        if ($namespace === 'front-awesome') {
                            $mandatoryKeys[$key] = true;
                        }
                    }
                }
            }
            foreach ($includeApplication ? $loader->load($source, '*', '*') : [] as $key => $message) {
                throw_unless(is_string($message), InvalidArgumentException::class, 'JSON translations must contain string values.');
                $messages[$key] = $message;
            }
            foreach (array_keys($messages) as $key) {
                $key = (string) $key;

                if (! isset($mandatoryKeys[$key]) && Str::is($config['exclude_keys'], $key)) {
                    unset($messages[$key]);
                }
            }
            ksort($messages);
            $schema = array_merge($schema, array_keys($messages));
            $catalog['locales'][$locale] = [
                'sourceLocale' => $source,
                'label' => LocaleRegistry::label($locale),
                'messages' => (object) $messages,
            ];
        }
        $json = json_encode($catalog, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR)."\n";
        $schema = array_unique($schema);
        sort($schema);
        $declaration = "import 'vue-i18n';\n\ndeclare module 'vue-i18n' {\n    interface DefineLocaleMessage {\n";
        foreach ($schema as $key) {
            $declaration .= '        '.json_encode((string) $key, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR).": string;\n";
        }
        $declaration .= "    }\n}\n";
        $output ??= $config['output'];
        $output = str_replace('\\', '/', $output);

        throw_if($output === '' || str_contains($output, "\0"), InvalidArgumentException::class, 'The translation output must be a nonempty file path.');

        if (! str_starts_with($output, '/') && ! preg_match('/^[A-Za-z]:\//', $output)) {
            $output = $this->app->basePath($output);
        }
        $types = preg_replace('/\.json$/', '', $output).'.d.ts';
        $files->ensureDirectoryExists(dirname($output));

        if (! $files->exists($types) || $files->get($types) !== $declaration) {
            $files->replace($types, $declaration);
        }

        if (! $files->exists($output) || $files->get($output) !== $json) {
            $files->replace($output, $json);
        }

        return ['output' => $output, 'types' => $types, 'watchPaths' => [$package, $application, $this->app->configPath('front-awesome.php')]];
    }

    /** @return array{node_binary: string, include_application: bool, locales: list<string>, fallback_locale: string, include_files: list<string>, exclude_files: list<string>, include_regex: array{path: list<string>, file: list<string>}, exclude_regex: array{path: list<string>, file: list<string>}, exclude_keys: list<string>, output: string} */
    private function configuration(): array
    {
        $config = $this->app->make('config')->get('front-awesome.translations');

        throw_if(! is_array($config) || ! is_bool($config['include_application'] ?? null), InvalidArgumentException::class, 'translations.include_application must be a boolean.');
        foreach (['fallback_locale', 'output', 'node_binary'] as $key) {
            throw_unless(is_string($config[$key] ?? null), InvalidArgumentException::class, "translations.{$key} must be a string.");
        }

        $locales = $this->stringList($config['locales'] ?? null, 'locales');

        throw_if($locales === [] || (in_array('*', $locales, true) && $locales !== ['*']), InvalidArgumentException::class, "translations.locales must be ['*'] or a nonempty list of locale IDs.");

        return [
            'node_binary' => $config['node_binary'],
            'include_application' => $config['include_application'],
            'locales' => $locales,
            'fallback_locale' => $config['fallback_locale'],
            'include_files' => $this->stringList($config['include_files'] ?? null, 'include_files'),
            'exclude_files' => $this->stringList($config['exclude_files'] ?? null, 'exclude_files'),
            'include_regex' => $this->regexPatterns($config['include_regex'] ?? null, 'include_regex'),
            'exclude_regex' => $this->regexPatterns($config['exclude_regex'] ?? null, 'exclude_regex'),
            'exclude_keys' => $this->stringList($config['exclude_keys'] ?? null, 'exclude_keys'),
            'output' => $config['output'],
        ];
    }

    /** @return list<string> */
    private function stringList(mixed $values, string $key): array
    {
        throw_if(! is_array($values) || ! array_is_list($values), InvalidArgumentException::class, "translations.{$key} must be a list of strings.");
        foreach ($values as $value) {
            throw_if(! is_string($value) || $value === '', InvalidArgumentException::class, "translations.{$key} must be a list of nonempty strings.");
        }

        return $values;
    }

    /** @return array{path: list<string>, file: list<string>} */
    private function regexPatterns(mixed $values, string $key): array
    {
        throw_if(! is_array($values) || array_diff(array_keys($values), ['path', 'file']) !== [], InvalidArgumentException::class, "translations.{$key} must contain path and file pattern lists.");
        $patterns = [
            'path' => $this->stringList($values['path'] ?? null, "{$key}.path"),
            'file' => $this->stringList($values['file'] ?? null, "{$key}.file"),
        ];
        foreach ($patterns as $expressions) {
            foreach ($expressions as $expression) {
                throw_if(@preg_match($expression, '') === false, InvalidArgumentException::class, "translations.{$key} contains an invalid PCRE pattern.");
            }
        }

        return $patterns;
    }

    /** @param array{path: list<string>, file: list<string>} $patterns */
    private function matchesRegex(array $patterns, string $relative): bool
    {
        foreach ($patterns as $target => $expressions) {
            foreach ($expressions as $expression) {
                if (preg_match($expression, $target === 'file' ? basename($relative) : $relative) === 1) {
                    return true;
                }
            }
        }

        return false;
    }

    /** @return list<array{string, string}> */
    private function groups(Filesystem $files, string $directory, string $namespace): array
    {
        $groups = [];

        if ($files->isDirectory($directory)) {
            foreach ($files->allFiles($directory) as $file) {
                if ($file->getExtension() === 'php') {
                    $groups[] = [$namespace, substr(str_replace('\\', '/', $file->getRelativePathname()), 0, -4)];
                }
            }
        }

        return $groups;
    }

    /** @param array<array-key, mixed> $lines
     * @param  array<string, string>  $messages
     */
    private function flatten(array $lines, string $prefix, array &$messages): void
    {
        foreach ($lines as $key => $value) {
            $name = $prefix.'.'.$key;

            if (is_array($value)) {
                $this->flatten($value, $name, $messages);
            } elseif (is_string($value)) {
                $messages[$name] = $value;
            } else {
                throw new InvalidArgumentException("Translation [{$name}] must be a string or a nested array of strings.");
            }
        }
    }
}
