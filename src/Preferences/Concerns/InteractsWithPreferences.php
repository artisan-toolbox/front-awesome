<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\Preferences\Concerns;

use ArtisanToolbox\FrontAwesome\Preferences\JsonPreferences;
use ArtisanToolbox\FrontAwesome\Preferences\PreferenceConfiguration;
use Illuminate\Database\Eloquent\Model;
use InvalidArgumentException;
use LogicException;
use stdClass;

/** @mixin Model */
trait InteractsWithPreferences
{
    public function initializeInteractsWithPreferences(): void
    {
        $this->mergeHidden([PreferenceConfiguration::key()]);
    }

    public function getFrontAwesomePreference(string $key): ?string
    {
        $raw = $this->getAttributes()[PreferenceConfiguration::key()] ?? null;
        $values = is_string($raw) ? json_decode($raw, flags: JSON_THROW_ON_ERROR) : null;
        $value = $values instanceof stdClass ? ($values->{$key} ?? null) : null;

        return is_string($value) ? $value : null;
    }

    public function setFrontAwesomePreference(string $key, ?string $value): void
    {
        throw_unless(in_array($key, ['appearance', 'locale', 'timezone', 'currency'], true), InvalidArgumentException::class, 'Unknown Front Awesome preference.');

        throw_unless($this->exists, LogicException::class, 'Preferences require a persisted authenticated model.');
        $column = PreferenceConfiguration::key();
        $identifier = $this->getRawOriginal($this->getKeyName()) ?? $this->getKey();
        $json = $this->getConnection()->transaction(function () use ($column, $identifier, $key, $value): string {
            $row = $this->newQuery()->whereKey($identifier)->lockForUpdate()->firstOrFail();
            $raw = $row->getAttributes()[$column] ?? null;
            $json = JsonPreferences::set(is_string($raw) ? $raw : null, $key, $value);
            $row->newQuery()->whereKey($row->getKey())->toBase()->update([$column => $json]);

            return $json;
        }, attempts: 3);
        $this->setRawAttributes(array_replace($this->getAttributes(), [$column => $json]));
        $this->syncOriginalAttribute($column);
    }
}
