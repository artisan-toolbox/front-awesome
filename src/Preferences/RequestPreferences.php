<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\Preferences;

use ArtisanToolbox\FrontAwesome\Localization\LocaleRegistry;
use ArtisanToolbox\FrontAwesome\Preferences\Contracts\PreferencesStore;
use DateTimeZone;
use Illuminate\Http\Request;
use InvalidArgumentException;

/** @internal */
final readonly class RequestPreferences
{
    public const string ATTRIBUTE = 'front-awesome.preferences';

    public function __construct(private PreferencesStore $store, private LocaleRegistry $registry) {}

    public function get(Request $request): ResolvedPreferences
    {
        $existing = $request->attributes->get(self::ATTRIBUTE);

        if ($existing instanceof ResolvedPreferences) {
            return $existing;
        }
        $catalog = $this->registry->discover();
        $locales = [];
        foreach ($catalog['available'] as $locale) {
            $locales[] = ['locale' => $locale, 'sourceLocale' => $catalog['locales'][$locale], 'label' => LocaleRegistry::label($locale)];
        }
        $fallbackSource = config()->string('app.locale');
        $locale = LocaleRegistry::normalize($fallbackSource);
        $stored = $this->store->getLocale($request);

        $locale = $stored !== null && in_array($stored, $catalog['available'], true)
            ? $stored
            : $this->registry->negotiate($request->header('Accept-Language', ''), $catalog['available'], $locale);
        $appearance = $this->store->getAppearance($request);
        $timezones = DateTimeZone::listIdentifiers();
        $defaultTimezone = config()->string('app.timezone');

        throw_unless(in_array($defaultTimezone, DateTimeZone::listIdentifiers(DateTimeZone::ALL_WITH_BC), true), InvalidArgumentException::class, 'app.timezone must be a supported IANA timezone identifier.');

        if (! in_array($defaultTimezone, $timezones, true)) {
            $timezones[] = $defaultTimezone;
        }
        $timezone = $this->store->getTimezone($request);
        $currencies = CurrencyRegistry::codes();
        $currency = $this->store->getCurrency($request);
        $snapshot = new ResolvedPreferences(
            in_array($appearance, ['system', 'light', 'dark'], true) ? $appearance : 'system',
            $locale,
            in_array($timezone, $timezones, true) ? $timezone : $defaultTimezone,
            $catalog['locales'][$locale] ?? $fallbackSource,
            $locales,
            $timezones,
            in_array($currency, $currencies, true) ? $currency : null,
            $currencies,
        );
        $request->attributes->set(self::ATTRIBUTE, $snapshot);

        return $snapshot;
    }
}
