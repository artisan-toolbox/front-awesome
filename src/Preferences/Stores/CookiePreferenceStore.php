<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\Preferences\Stores;

use ArtisanToolbox\FrontAwesome\Preferences\Contracts\PreferencesStore;
use ArtisanToolbox\FrontAwesome\Preferences\PreferenceConfiguration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use InvalidArgumentException;

final class CookiePreferenceStore implements PreferencesStore
{
    private function name(string $field): string
    {
        return config()->string('session.cookie').'_front_awesome_'.PreferenceConfiguration::key().'_'.$field;
    }

    private function get(Request $request, string $field): ?string
    {
        $name = $this->name($field);
        $attribute = 'front-awesome.cookie.'.$name;

        if ($request->attributes->has($attribute)) {
            $value = $request->attributes->get($attribute);

            return is_string($value) ? $value : null;
        }

        $value = $request->cookie($name);
        $sessionKey = 'front-awesome.'.PreferenceConfiguration::key().'.'.$field;

        if (is_string($value)) {
            if ($request->hasSession()) {
                $request->session()->forget($sessionKey);
            }

            return $value;
        }

        $legacy = $request->hasSession() ? $request->session()->get($sessionKey) : null;

        if (is_string($legacy)) {
            $this->set($request, $field, $legacy);

            return $legacy;
        }

        return null;
    }

    private function set(Request $request, string $field, ?string $value): void
    {
        $lifetime = config('front-awesome.preferences.cookie_lifetime');
        throw_if(! is_int($lifetime) || $lifetime <= 0, InvalidArgumentException::class, 'front-awesome.preferences.cookie_lifetime must be a positive integer number of minutes.');

        $name = $this->name($field);
        Cookie::queue($value === null ? Cookie::forget($name) : Cookie::make($name, $value, $lifetime, httpOnly: true));
        $request->attributes->set('front-awesome.cookie.'.$name, $value);

        if ($request->hasSession()) {
            $request->session()->forget('front-awesome.'.PreferenceConfiguration::key().'.'.$field);
        }
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
