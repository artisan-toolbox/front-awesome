<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\Localization\Console\Commands;

use ArtisanToolbox\FrontAwesome\Localization\TranslationExporter;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use InvalidArgumentException;
use Throwable;

#[Description('Export Laravel translations for Front Awesome localization')]
#[Signature('front-awesome:export-translations {--output= : Override the generated JSON path} {--node= : Override the Node.js executable used to validate browser locale IDs} {--manifest : Print only machine-readable tooling metadata}')]
final class ExportTranslations extends Command
{
    public function handle(TranslationExporter $exporter): int
    {
        try {
            $output = $this->input->getOption('output');

            throw_if($output !== null && ! is_string($output), InvalidArgumentException::class, 'The output option must be a file path.');
            $node = $this->input->getOption('node');

            throw_if($node !== null && ! is_string($node), InvalidArgumentException::class, 'The node option must be an executable name or path.');
            $manifest = $exporter->export($output, $node);
            $this->line($this->option('manifest')
                ? json_encode($manifest, JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR)
                : 'Front Awesome translations exported to '.$manifest['output']);

            return self::SUCCESS;
        } catch (Throwable $error) {
            $this->error($error->getMessage());

            return self::FAILURE;
        }
    }
}
