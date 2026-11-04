<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\WebAwesome;

use Inertia\Inertia;
use InvalidArgumentException;

final class ToastFactory
{
    private const string EVENT = 'front-awesome.toast';

    private const string FLASH_KEY = 'front-awesome.toasts';

    private ?int $duration = null;

    private string|ToastIcon|null $icon = null;

    private ?Size $size = null;

    private ?bool $allowHtml = null;

    public function __construct(
        private readonly string $message,
        private readonly Variant $variant,
    ) {}

    public function duration(int $milliseconds): self
    {
        $this->duration = $milliseconds;

        return $this;
    }

    public function icon(string|ToastIcon $icon): self
    {
        $this->icon = $icon;

        return $this;
    }

    public function size(Size $size): self
    {
        $this->size = $size;

        return $this;
    }

    public function allowHtml(bool $allow = true): self
    {
        $this->allowHtml = $allow;

        return $this;
    }

    public function dispatch(): void
    {
        mosaicast()->dispatch(self::EVENT, $this->payload());
    }

    public function flash(): void
    {
        $payload = $this->payload();
        $pending = Inertia::getFlashed()[self::FLASH_KEY] ?? [];
        $pending = is_array($pending) && array_is_list($pending) ? $pending : [];
        $pending[] = $payload;

        Inertia::flash(self::FLASH_KEY, $pending);
    }

    /** @return array{message: string, options: array<string, mixed>} */
    private function payload(): array
    {
        throw_if($this->duration !== null && $this->duration < 0, InvalidArgumentException::class, 'Toast duration must be zero or greater.');

        $icon = $this->icon ?? $this->defaultIcon();
        $options = array_filter([
            'variant' => $this->variant->value,
            'duration' => $this->duration,
            'icon' => $icon instanceof ToastIcon ? $icon->toArray() : $icon,
            'size' => $this->size?->value,
            'allowHtml' => $this->allowHtml,
        ], static fn (mixed $value): bool => $value !== null);

        return ['message' => $this->message, 'options' => $options];
    }

    private function defaultIcon(): string|ToastIcon|null
    {
        $icon = config('front-awesome.webawesome.toast.icons.'.$this->variant->value);

        if (is_string($icon)) {
            return $icon;
        }

        if (! is_array($icon) || ! is_string($icon['name'] ?? null)) {
            return null;
        }

        return new ToastIcon(
            $icon['name'],
            library: is_string($icon['library'] ?? null) ? $icon['library'] : null,
            family: is_string($icon['family'] ?? null) ? $icon['family'] : null,
            variant: is_string($icon['variant'] ?? null) ? $icon['variant'] : null,
        );
    }
}
