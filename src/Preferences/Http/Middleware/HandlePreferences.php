<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\Preferences\Http\Middleware;

use ArtisanToolbox\FrontAwesome\Preferences\RequestPreferences;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

final readonly class HandlePreferences
{
    public function __construct(private RequestPreferences $preferences) {}

    /** @param Closure(Request): Response $next */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = app()->getLocale();
        $translatorLocale = resolve('translator')->getLocale();
        $requestLocale = $request->getLocale();

        try {
            $preferences = $this->preferences->get($request);
            app()->setLocale($preferences->sourceLocale);
            $request->setLocale($preferences->sourceLocale);

            return $next($request);
        } finally {
            app()->setLocale($locale);
            resolve('translator')->setLocale($translatorLocale);
            $request->setLocale($requestLocale);
        }
    }
}
