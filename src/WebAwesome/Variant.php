<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\WebAwesome;

enum Variant: string
{
    case BRAND = 'brand';
    case SUCCESS = 'success';
    case WARNING = 'warning';
    case DANGER = 'danger';
    case NEUTRAL = 'neutral';
}
