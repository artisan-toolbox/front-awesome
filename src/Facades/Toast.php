<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\Facades;

use ArtisanToolbox\FrontAwesome\WebAwesome\Toast as ToastManager;
use ArtisanToolbox\FrontAwesome\WebAwesome\ToastFactory;
use Illuminate\Support\Facades\Facade;

/**
 * @method static ToastFactory brand(string $message)
 * @method static ToastFactory success(string $message)
 * @method static ToastFactory warning(string $message)
 * @method static ToastFactory danger(string $message)
 * @method static ToastFactory neutral(string $message)
 *
 * @see ToastManager
 */
final class Toast extends Facade
{
    protected static function getFacadeAccessor(): string
    {
        return ToastManager::class;
    }
}
