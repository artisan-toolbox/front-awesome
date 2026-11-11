<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\Preferences;

use Carbon\Carbon;
use Carbon\CarbonInterface;

/** @internal */
final class CarbonPreferences
{
    public static function register(): void
    {
        if (config('front-awesome.preferences.carbon_macro') !== true || Carbon::hasMacro('toPreferenceTimezone')) {
            return;
        }
        Carbon::macro('toPreferenceTimezone', function (): CarbonInterface {
            $snapshot = app()->bound('request') ? request()->attributes->get(RequestPreferences::ATTRIBUTE) : null;
            $timezone = $snapshot instanceof ResolvedPreferences ? $snapshot->timezone : config()->string('app.timezone');

            return $this->copy()->setTimezone($timezone);
        });
    }
}
