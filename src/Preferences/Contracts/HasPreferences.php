<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\Preferences\Contracts;

interface HasPreferences
{
    public function getFrontAwesomePreference(string $key): ?string;

    public function setFrontAwesomePreference(string $key, ?string $value): void;
}
