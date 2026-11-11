<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\Preferences;

use ArtisanToolbox\FrontAwesome\Preferences\Contracts\HasPreferences;
use ArtisanToolbox\FrontAwesome\Preferences\Contracts\PreferencesStore;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;
use InvalidArgumentException;
use ReflectionClass;

/** @internal */
final class PreferenceConfiguration
{
    public static function key(): string
    {
        $key = config('front-awesome.preferences.key');

        throw_if(! is_string($key) || preg_match('/^[A-Za-z_][A-Za-z0-9_]{0,62}$/D', $key) !== 1 || in_array($key, ['__proto__', 'prototype', 'constructor', 'errors', 'auth', 'flash', 'deferredProps', 'onceProps'], true), InvalidArgumentException::class, 'front-awesome.preferences.key must be a portable column and Inertia property identifier of at most 63 characters.');

        return $key;
    }

    /** @return class-string<PreferencesStore>|class-string<Model&HasPreferences&Authenticatable> */
    public static function storeClass(mixed $class): string
    {
        throw_if(! is_string($class) || ! class_exists($class) || (new ReflectionClass($class))->isAbstract(), InvalidArgumentException::class, 'The preference store must be a concrete PreferencesStore or authenticatable Eloquent model implementing HasPreferences.');

        if (is_a($class, PreferencesStore::class, true)) {
            return $class;
        }

        if (is_a($class, Model::class, true) && is_a($class, HasPreferences::class, true) && is_a($class, Authenticatable::class, true)) {
            return $class;
        }

        throw new InvalidArgumentException('The preference store must implement PreferencesStore or be an authenticatable Eloquent model implementing HasPreferences.');
    }
}
