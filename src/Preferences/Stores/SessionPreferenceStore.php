<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\Preferences\Stores;

use ArtisanToolbox\FrontAwesome\Preferences\Contracts\PreferencesStore;
use ArtisanToolbox\FrontAwesome\Preferences\PreferenceConfiguration;
use Illuminate\Http\Request;

final class SessionPreferenceStore implements PreferencesStore
{
    private function get(Request $request, string $field): ?string
    {
        $value = $request->session()->get('front-awesome.'.PreferenceConfiguration::key().'.'.$field);

        return is_string($value) ? $value : null;
    }

    private function set(Request $request, string $field, ?string $value): void
    {
        $request->session()->put('front-awesome.'.PreferenceConfiguration::key().'.'.$field, $value);
    }

    public function getAppearance(Request $request): ?string
    {
        return $this->get($request, 'appearance');
    }

    public function setAppearance(Request $request, string $appearance): void
    {
        $this->set($request, 'appearance', $appearance);
    }

    public function getLocale(Request $request): ?string
    {
        return $this->get($request, 'locale');
    }

    public function setLocale(Request $request, string $locale): void
    {
        $this->set($request, 'locale', $locale);
    }

    public function getTimezone(Request $request): ?string
    {
        return $this->get($request, 'timezone');
    }

    public function setTimezone(Request $request, string $timezone): void
    {
        $this->set($request, 'timezone', $timezone);
    }

    public function getCurrency(Request $request): ?string
    {
        return $this->get($request, 'currency');
    }

    public function setCurrency(Request $request, ?string $currency): void
    {
        $this->set($request, 'currency', $currency);
    }
}
