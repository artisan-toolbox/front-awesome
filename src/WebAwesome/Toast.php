<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\WebAwesome;

final class Toast
{
    public function brand(string $message): ToastFactory
    {
        return new ToastFactory($message, Variant::BRAND);
    }

    public function success(string $message): ToastFactory
    {
        return new ToastFactory($message, Variant::SUCCESS);
    }

    public function warning(string $message): ToastFactory
    {
        return new ToastFactory($message, Variant::WARNING);
    }

    public function danger(string $message): ToastFactory
    {
        return new ToastFactory($message, Variant::DANGER);
    }

    public function neutral(string $message): ToastFactory
    {
        return new ToastFactory($message, Variant::NEUTRAL);
    }
}
