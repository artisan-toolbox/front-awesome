<?php

declare(strict_types=1);

namespace ArtisanToolbox\FrontAwesome\Preferences;

use LogicException;
use stdClass;

/** @internal */
final class JsonPreferences
{
    /** Preserve the original representation of unrelated JSON numbers and objects. */
    public static function set(?string $document, string $key, ?string $value): string
    {
        $document = trim($document ?? '{}', " \t\r\n");
        $decoded = json_decode($document, flags: JSON_THROW_ON_ERROR);

        if ($decoded === null) {
            $document = '{}';
        } elseif (! $decoded instanceof stdClass) {
            throw new LogicException('The preference column must contain a JSON object or null.');
        }
        $replacement = json_encode($value, JSON_THROW_ON_ERROR);
        $positions = [];
        $cursor = self::skipWhitespace($document, 1);
        while ($document[$cursor] !== '}') {
            $keyEnd = self::stringEnd($document, $cursor);
            $property = json_decode(substr($document, $cursor, $keyEnd - $cursor), flags: JSON_THROW_ON_ERROR);
            $valueStart = self::skipWhitespace($document, self::skipWhitespace($document, $keyEnd) + 1);
            $boundary = self::valueEnd($document, $valueStart);
            $valueEnd = $boundary;
            while ($valueEnd > $valueStart && str_contains(" \t\r\n", $document[$valueEnd - 1])) {
                $valueEnd--;
            }

            if ($property === $key) {
                $positions[] = [$valueStart, $valueEnd - $valueStart];
            }

            if ($document[$boundary] === '}') {
                break;
            }
            $cursor = self::skipWhitespace($document, $boundary + 1);
        }

        if ($positions !== []) {
            foreach (array_reverse($positions) as [$start, $length]) {
                $document = substr_replace($document, $replacement, $start, $length);
            }

            return $document;
        }
        $end = strlen($document) - 1;
        $separator = trim(substr($document, 1, $end - 1)) === '' ? '' : ',';

        return substr($document, 0, $end).$separator.json_encode($key, JSON_THROW_ON_ERROR).':'.$replacement.'}';
    }

    private static function skipWhitespace(string $document, int $cursor): int
    {
        while (isset($document[$cursor]) && str_contains(" \t\r\n", $document[$cursor])) {
            $cursor++;
        }

        return $cursor;
    }

    private static function stringEnd(string $document, int $cursor): int
    {
        $cursor++;
        while ($document[$cursor] !== '"') {
            $cursor += $document[$cursor] === '\\' ? 2 : 1;
        }

        return $cursor + 1;
    }

    private static function valueEnd(string $document, int $cursor): int
    {
        $depth = 0;
        while (true) {
            $character = $document[$cursor];

            if ($character === '"') {
                $cursor = self::stringEnd($document, $cursor);

                continue;
            }

            if ($character === '{' || $character === '[') {
                $depth++;
            } elseif ($character === '}' || $character === ']') {
                if ($depth === 0) {
                    return $cursor;
                }
                $depth--;
            } elseif ($character === ',' && $depth === 0) {
                return $cursor;
            }
            $cursor++;
        }
    }
}
