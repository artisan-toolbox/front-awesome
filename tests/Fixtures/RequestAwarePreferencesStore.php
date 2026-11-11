<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\Tests\Fixtures;

use ArtisanToolbox\FrontAwesome\Preferences\Contracts\PreferencesStore;
use ArtisanToolbox\FrontAwesome\Preferences\Stores\SessionPreferenceStore;
use Illuminate\Contracts\Config\Repository;
use Illuminate\Http\Request;

final class RequestAwarePreferencesStore implements PreferencesStore
{
    public int $writes = 0;

    public function __construct(public readonly Repository $config, private readonly SessionPreferenceStore $session) {}

    public function getAppearance(Request $request): ?string
    {
        return $request->header('X-Initial-Appearance') ?? $this->session->getAppearance($request);
    }

    public function setAppearance(Request $request, string $appearance): void
    {
        $this->writes++;
        $this->session->setAppearance($request, $appearance);
    }

    public function getLocale(Request $request): ?string
    {
        return $this->session->getLocale($request);
    }

    public function setLocale(Request $request, string $locale): void
    {
        $this->writes++;
        $this->session->setLocale($request, $locale);
    }

    public function getTimezone(Request $request): ?string
    {
        return $this->session->getTimezone($request);
    }

    public function setTimezone(Request $request, string $timezone): void
    {
        $this->writes++;
        $this->session->setTimezone($request, $timezone);
    }

    public function getCurrency(Request $request): ?string
    {
        return $this->session->getCurrency($request);
    }

    public function setCurrency(Request $request, ?string $currency): void
    {
        $this->writes++;
        $this->session->setCurrency($request, $currency);
    }
}
