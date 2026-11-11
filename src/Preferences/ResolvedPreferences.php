<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\Preferences;

use Illuminate\Http\Request;

/** @internal */
final readonly class ResolvedPreferences
{
    /**
     * @param  list<array{locale: string, sourceLocale: string, label: string}>  $locales
     * @param  list<string>  $timezones
     * @param  list<string>  $currencies
     */
    public function __construct(
        public string $appearance,
        public string $locale,
        public string $timezone,
        public string $sourceLocale,
        public array $locales,
        public array $timezones,
        public ?string $currency = null,
        public array $currencies = [],
    ) {}

    /** @return array{appearance: string, locale: string, timezone: string, key: string, updateUrl: string, locales: list<array{locale: string, sourceLocale: string, label: string}>, timezones: list<string>, currency: ?string, currencies: list<string>} */
    public function toArray(Request $request): array
    {
        return [
            'appearance' => $this->appearance,
            'locale' => $this->locale,
            'timezone' => $this->timezone,
            'key' => PreferenceConfiguration::key(),
            'updateUrl' => $request->getBaseUrl().route('front-awesome.preferences.update', absolute: false),
            'locales' => $this->locales,
            'timezones' => $this->timezones,
            'currency' => $this->currency,
            'currencies' => $this->currencies,
        ];
    }
}
