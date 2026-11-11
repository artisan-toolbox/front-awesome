<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\Preferences;

use Inertia\AlwaysProp;
use Inertia\ProvidesInertiaProperties;
use Inertia\RenderContext;

/** @internal */
final class InertiaPreferences implements ProvidesInertiaProperties
{
    /** @return array<string, AlwaysProp> */
    public function toInertiaProperties(RenderContext $context): iterable
    {
        $preferences = $context->request->attributes->get(RequestPreferences::ATTRIBUTE);

        return $preferences instanceof ResolvedPreferences ? [PreferenceConfiguration::key() => new AlwaysProp($preferences->toArray($context->request))] : [];
    }
}
