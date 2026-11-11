<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\Preferences\Contracts;

use Illuminate\Http\Request;

interface PreferencesStore
{
    public function getAppearance(Request $request): ?string;

    public function setAppearance(Request $request, string $appearance): void;

    public function getLocale(Request $request): ?string;

    public function setLocale(Request $request, string $locale): void;

    public function getTimezone(Request $request): ?string;

    public function setTimezone(Request $request, string $timezone): void;

    public function getCurrency(Request $request): ?string;

    public function setCurrency(Request $request, ?string $currency): void;
}
