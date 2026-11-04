<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\WebAwesome;

final readonly class ToastIcon
{
    public function __construct(
        public string $name,
        public ?string $library = null,
        public ?string $family = null,
        public ?string $variant = null,
    ) {}

    /** @return array{name: string, library?: string, family?: string, variant?: string} */
    public function toArray(): array
    {
        return array_filter([
            'name' => $this->name,
            'library' => $this->library,
            'family' => $this->family,
            'variant' => $this->variant,
        ], static fn (?string $value): bool => $value !== null);
    }
}
