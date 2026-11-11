<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\Preferences\Console\Commands;

use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\GeneratorCommand;

#[Description('Create a request-aware Front Awesome preference store')]
#[Signature('make:preferences-store {name : The preference store class name}')]
final class MakePreferencesStoreCommand extends GeneratorCommand
{
    protected $type = 'Preference store';

    public function handle(): ?bool
    {
        $name = str_replace('/', '\\', $this->getNameInput());
        $segments = explode('\\', ltrim($name, '\\'));

        foreach ($segments as $segment) {
            if (preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/D', $segment) !== 1 || $this->isReservedName($segment)) {
                $this->fail('The name must be a valid PHP class name or namespace.');
            }
        }

        $class = $segments[array_key_last($segments)];
        $tokens = token_get_all('<?php '.$class);
        $token = $tokens[1] ?? null;

        if (! is_array($token) || $token[0] !== T_STRING || in_array(strtolower($class), ['int', 'float', 'string', 'bool', 'void', 'never', 'null', 'object', 'mixed', 'iterable', 'self', 'parent', 'true', 'false'], true)) {
            $this->fail('The class name must not be a reserved PHP type or keyword.');
        }

        if (parent::handle() === false) {
            $this->fail('The preference store was not generated.');
        }

        return null;
    }

    protected function buildClass($name): string
    {
        $contents = parent::buildClass($name);
        $class = class_basename($name);

        foreach (['PreferencesStore' => 'PreferencesStoreContract', 'SessionPreferenceStore' => 'DefaultSessionPreferenceStore', 'Request' => 'HttpRequest'] as $import => $alias) {
            if (strcasecmp($class, $import) !== 0) {
                continue;
            }

            $contents = str_replace('\\'.$import.';', '\\'.$import.' as '.$alias.';', $contents);
            $contents = str_replace(['implements '.$import, $import.' $'], ['implements '.$alias, $alias.' $'], $contents);
        }

        return $contents;
    }

    protected function getStub(): string
    {
        return __DIR__.'/../../stubs/preferences-store.stub';
    }

    protected function getDefaultNamespace($rootNamespace): string
    {
        return $rootNamespace.'\\Http\\Preferences';
    }
}
