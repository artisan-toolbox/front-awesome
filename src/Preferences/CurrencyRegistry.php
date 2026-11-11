<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\Preferences;

/** @internal */
final class CurrencyRegistry
{
    public const string SOURCE = 'https://www.six-group.com/dam/download/financial-information/data-center/iso-currrency/lists/list-one.xml';

    public const string PUBLISHED_AT = '2026-09-17';

    /** @return list<string> */
    public static function codes(): array
    {
        return require __DIR__.'/data/currencies.php';
    }
}
