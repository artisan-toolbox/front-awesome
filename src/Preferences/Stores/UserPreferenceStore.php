<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\Preferences\Stores;

use ArtisanToolbox\FrontAwesome\Preferences\Contracts\HasPreferences;
use ArtisanToolbox\FrontAwesome\Preferences\Contracts\PreferencesStore;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use InvalidArgumentException;
use LogicException;

final readonly class UserPreferenceStore implements PreferencesStore
{
    /** @param class-string<Model&HasPreferences&Authenticatable> $model */
    public function __construct(private string $model, private SessionPreferenceStore $session) {}

    private function user(Request $request): ?HasPreferences
    {
        $guard = config('front-awesome.preferences.guard');

        throw_if($guard !== null && (! is_string($guard) || $guard === ''), InvalidArgumentException::class, 'front-awesome.preferences.guard must be null or a nonempty configured authentication guard name.');
        $user = $request->user($guard);

        if ($user === null) {
            return null;
        }

        throw_unless($user instanceof $this->model, LogicException::class, 'The authenticated user does not match the configured Front Awesome preference model.');

        return $user;
    }

    public function getAppearance(Request $request): ?string
    {
        return ($user = $this->user($request)) ? $user->getFrontAwesomePreference('appearance') : $this->session->getAppearance($request);
    }

    public function setAppearance(Request $request, string $appearance): void
    {
        ($user = $this->user($request)) ? $user->setFrontAwesomePreference('appearance', $appearance) : $this->session->setAppearance($request, $appearance);
    }

    public function getLocale(Request $request): ?string
    {
        return ($user = $this->user($request)) ? $user->getFrontAwesomePreference('locale') : $this->session->getLocale($request);
    }

    public function setLocale(Request $request, string $locale): void
    {
        ($user = $this->user($request)) ? $user->setFrontAwesomePreference('locale', $locale) : $this->session->setLocale($request, $locale);
    }

    public function getTimezone(Request $request): ?string
    {
        return ($user = $this->user($request)) ? $user->getFrontAwesomePreference('timezone') : $this->session->getTimezone($request);
    }

    public function setTimezone(Request $request, string $timezone): void
    {
        ($user = $this->user($request)) ? $user->setFrontAwesomePreference('timezone', $timezone) : $this->session->setTimezone($request, $timezone);
    }

    public function getCurrency(Request $request): ?string
    {
        return ($user = $this->user($request)) ? $user->getFrontAwesomePreference('currency') : $this->session->getCurrency($request);
    }

    public function setCurrency(Request $request, ?string $currency): void
    {
        ($user = $this->user($request)) ? $user->setFrontAwesomePreference('currency', $currency) : $this->session->setCurrency($request, $currency);
    }
}
