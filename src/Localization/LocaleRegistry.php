<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\Localization;

use Illuminate\Contracts\Foundation\Application;
use Illuminate\Filesystem\Filesystem;
use InvalidArgumentException;
use Symfony\Component\HttpFoundation\AcceptHeader;

/** @internal */
final readonly class LocaleRegistry
{
    public function __construct(private Application $app) {}

    /** @return array{locales: array<string, string>, available: list<string>, fallback: string} */
    public function discover(): array
    {
        $config = $this->app->make('config')->get('front-awesome.translations');

        throw_if(! is_array($config) || ! is_bool($config['include_application'] ?? null) || ! is_string($config['fallback_locale'] ?? null) || ! is_array($config['locales'] ?? null) || ! array_is_list($config['locales']) || $config['locales'] === [], InvalidArgumentException::class, 'Translation locale discovery requires include_application, fallback_locale, and a nonempty locales list.');
        foreach ($config['locales'] as $source) {
            throw_if(! is_string($source) || $source === '', InvalidArgumentException::class, 'translations.locales must contain nonempty locale strings.');
        }

        throw_if(in_array('*', $config['locales'], true) && $config['locales'] !== ['*'], InvalidArgumentException::class, "translations.locales must be ['*'] or a nonempty list of locale IDs.");
        $package = str_replace('\\', '/', dirname(__DIR__, 2)).'/lang';
        $application = rtrim(str_replace('\\', '/', $this->app->langPath()), '/');
        $files = new Filesystem;
        $locales = ['en' => 'en', 'es' => 'es', 'pt-BR' => 'pt_BR'];
        $sources = $config['locales'];
        $discover = $sources === ['*'];

        if ($discover) {
            $sources = array_values($locales);
            foreach ([$package, $application.'/vendor/front-awesome'] as $directory) {
                if ($files->isDirectory($directory)) {
                    foreach ($files->directories($directory) as $localeDirectory) {
                        $sources[] = basename($localeDirectory);
                    }
                }
            }
        }

        if ($discover && $config['include_application'] && $files->isDirectory($application)) {
            foreach ($files->directories($application) as $directory) {
                if (basename($directory) !== 'vendor') {
                    $sources[] = basename($directory);
                } else {
                    foreach ($files->directories($directory) as $namespace) {
                        foreach ($files->directories($namespace) as $localeDirectory) {
                            $sources[] = basename($localeDirectory);
                        }
                    }
                }
            }
            foreach ($files->files($application) as $file) {
                if ($file->getExtension() === 'json') {
                    $sources[] = $file->getBasename('.json');
                }
            }
        }
        $available = [];
        foreach ($sources as $source) {
            $normalized = self::normalize($source);

            if (isset($locales[$normalized]) && $locales[$normalized] !== $source) {
                throw new InvalidArgumentException("Locale [{$source}] conflicts with [{$locales[$normalized]}]. Use one Laravel source locale for [{$normalized}].");
            }
            $locales[$normalized] = $source;
            $available[$normalized] = true;
        }
        $available = array_keys($available);

        if ($discover) {
            sort($available);
        }
        $fallback = self::normalize($config['fallback_locale']);
        $locales[$fallback] ??= $config['fallback_locale'];
        ksort($locales);

        return ['locales' => $locales, 'available' => $available, 'fallback' => $fallback];
    }

    /** @param list<string> $available */
    public function negotiate(string $header, array $available, string $fallback): string
    {
        $ranges = AcceptHeader::fromString($header)->all();
        $excluded = [];
        foreach ($available as $candidate) {
            $specificity = -1;
            $quality = 1.0;
            $normalized = strtolower($candidate);
            foreach ($ranges as $range) {
                $tag = str_replace('_', '-', strtolower($range->getValue()));

                if ($tag !== '*' && $normalized !== $tag && ! str_starts_with($normalized, $tag.'-')) {
                    continue;
                }
                $length = $tag === '*' ? 0 : count(explode('-', $tag));

                if ($length > $specificity) {
                    $specificity = $length;
                    $quality = $range->getQuality();
                }
            }

            if ($quality <= 0) {
                $excluded[$candidate] = true;
            }
        }
        foreach ($ranges as $range) {
            if ($range->getQuality() <= 0) {
                continue;
            }
            $tag = str_replace('_', '-', strtolower($range->getValue()));

            if ($tag === '*') {
                return $fallback;
            }
            foreach ($available as $candidate) {
                if (! isset($excluded[$candidate]) && strtolower($candidate) === $tag) {
                    return $candidate;
                }
            }
            foreach ($available as $candidate) {
                if (! isset($excluded[$candidate]) && strtolower(explode('-', $candidate)[0]) === explode('-', $tag)[0]) {
                    return $candidate;
                }
            }
        }

        return $fallback;
    }

    public static function label(string $locale): string
    {
        return ['en' => 'English', 'es' => 'Español', 'pt-BR' => 'Português (Brasil)'][$locale] ?? $locale;
    }

    public static function normalize(string $locale): string
    {
        throw_unless(preg_match('/^[a-zA-Z]{2,3}(?:[-_][a-zA-Z]{4})?(?:[-_](?:[a-zA-Z]{2}|[0-9]{3}))?$/', $locale), InvalidArgumentException::class, "Invalid translation locale [{$locale}].");
        $segments = explode('-', str_replace('_', '-', $locale));
        $segments[0] = strtolower($segments[0]);
        foreach ($segments as $index => $segment) {
            if ($index > 0) {
                $segments[$index] = strlen($segment) === 4 ? ucfirst(strtolower($segment)) : strtoupper($segment);
            }
        }

        return implode('-', $segments);
    }
}
