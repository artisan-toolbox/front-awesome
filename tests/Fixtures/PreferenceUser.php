<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\Tests\Fixtures;

use ArtisanToolbox\FrontAwesome\Preferences\Concerns\InteractsWithPreferences;
use ArtisanToolbox\FrontAwesome\Preferences\Contracts\HasPreferences;
use Illuminate\Database\Eloquent\Attributes\Table;
use Illuminate\Database\Eloquent\Attributes\Unguarded;
use Illuminate\Foundation\Auth\User;

#[Unguarded]
#[Table(name: 'preference_users')]
final class PreferenceUser extends User implements HasPreferences
{
    use InteractsWithPreferences;
}
