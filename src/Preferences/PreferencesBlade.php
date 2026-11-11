<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\Preferences;

use Illuminate\Support\Js;

/** @internal */
final class PreferencesBlade
{
    public static function render(?string $nonce = null): string
    {
        $preferences = resolve(RequestPreferences::class)->get(request());
        $json = Js::from(['appearance' => $preferences->appearance, 'locale' => $preferences->locale])->toHtml();
        $nonceAttribute = $nonce === null ? '' : ' nonce="'.e($nonce).'"';

        return '<script'.$nonceAttribute.'>(function(){const p='.$json.';const r=document.documentElement;const d=p.appearance==="dark"||(p.appearance==="system"&&window.matchMedia("(prefers-color-scheme: dark)").matches);r.classList.toggle("dark",d);r.classList.toggle("wa-dark",d);r.classList.toggle("wa-light",!d);r.lang=p.locale;})();</script>';
    }
}
