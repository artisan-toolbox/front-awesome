<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\Localization;

use Closure;
use Illuminate\Filesystem\Filesystem;

/** @internal */
final class TranslationFilesystem extends Filesystem
{
    /** @param Closure(string): bool $included */
    public function __construct(private readonly Closure $included) {}

    public function exists($path): bool
    {
        return ($this->included)($path) && parent::exists($path);
    }
}
