<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\Preferences\Http\Controllers;

use ArtisanToolbox\FrontAwesome\Preferences\Contracts\PreferencesStore;
use ArtisanToolbox\FrontAwesome\Preferences\RequestPreferences;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Session\Store;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Validator as LaravelValidator;
use Inertia\Inertia;
use LogicException;

/** @internal */
final class UpdatePreferencesController
{
    public function __invoke(Request $request, PreferencesStore $store, RequestPreferences $preferences): RedirectResponse
    {
        $target = $request->header('X-Front-Awesome-Return');
        abort_unless(is_string($target) && str_starts_with($target, '/') && ! str_starts_with($target, '//') && ! str_contains($target, '\\') && ! preg_match('/[\x00-\x20\x7f#]/', $target) && ! preg_match('/%(?:0[0-9a-f]|1[0-9a-f]|7f|5c)/i', $target), 400, 'A safe local X-Front-Awesome-Return path is required.');
        $snapshot = $preferences->get($request);
        $input = $request->all();
        $validator = Validator::make($input, [
            'appearance' => ['sometimes', 'required', 'string', Rule::in(['system', 'light', 'dark'])],
            'locale' => ['sometimes', 'required', 'string', Rule::in(array_column($snapshot->locales, 'locale'))],
            'timezone' => ['sometimes', 'required', 'string', Rule::in($snapshot->timezones)],
            'currency' => ['sometimes', 'nullable', 'string', Rule::in($snapshot->currencies)],
        ], [
            'appearance.*' => __('front-awesome::preferences.invalid_appearance'),
            'locale.*' => __('front-awesome::preferences.invalid_locale'),
            'timezone.*' => __('front-awesome::preferences.invalid_timezone'),
            'currency.*' => __('front-awesome::preferences.invalid_currency'),
        ]);
        $validator->after(function (LaravelValidator $validator) use ($input): void {
            if (count($input) !== 1 || array_diff(array_keys($input), ['appearance', 'locale', 'timezone', 'currency']) !== []) {
                $validator->errors()->add('preferences', __('front-awesome::preferences.one_field'));
            }
        });
        Inertia::preserveFragment();
        $redirect = new RedirectResponse($target, 303);
        $session = $request->session();

        throw_unless($session instanceof Store, LogicException::class, 'Preference redirects require a Laravel session store.');
        $redirect->setSession($session);

        if ($validator->fails()) {
            return $redirect->withErrors($validator, 'frontAwesomePreferences');
        }
        $validated = $validator->validated();
        foreach ($validated as $field => $value) {
            match ($field) {
                'appearance' => $store->setAppearance($request, $value),
                'locale' => $store->setLocale($request, $value),
                'timezone' => $store->setTimezone($request, $value),
                'currency' => $store->setCurrency($request, $value),
                default => throw new LogicException('Unexpected validated preference field.'),
            };
        }

        return $redirect;
    }
}
