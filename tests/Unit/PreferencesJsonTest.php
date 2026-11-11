<?php

declare(strict_types=1);

use ArtisanToolbox\FrontAwesome\Preferences\JsonPreferences;

it('changes only the selected top-level JSON value', function (string $document, string $expected): void {
    expect(JsonPreferences::set($document, 'appearance', 'dark'))->toBe($expected);
})->with([
    ['{"appearance":"light","amount":18446744073709551615}', '{"appearance":"dark","amount":18446744073709551615}'],
    ['{ "appearance" : "light" , "nested" : {"appearance":"keep","values":[1,{"x":2}]} }', '{ "appearance" : "dark" , "nested" : {"appearance":"keep","values":[1,{"x":2}]} }'],
    ['{"appearance":"light","appearance":"system"}', '{"appearance":"dark","appearance":"dark"}'],
    ['{"\\u0061ppearance":"light","currency":null}', '{"\\u0061ppearance":"dark","currency":null}'],
    ['{"appearance":{"stale":[true,null,1.2300e+300]}}', '{"appearance":"dark"}'],
    ['{"text":"escaped \\" quote and \\\\ backslash, } [","appearance":"light"}', '{"text":"escaped \\" quote and \\\\ backslash, } [","appearance":"dark"}'],
]);

it('appends nullable currency without changing existing numeric bytes', function (): void {
    $document = '{"precise":0.123456789012345678901234567890,"huge":1e999}';
    expect(JsonPreferences::set($document, 'currency', null))->toBe('{"precise":0.123456789012345678901234567890,"huge":1e999,"currency":null}');
});

it('accepts an empty or nullable JSON document', function (?string $document): void {
    expect(json_decode(JsonPreferences::set($document, 'currency', 'BRL'), true))->toBe(['currency' => 'BRL']);
})->with([null, 'null', '{}', " {\n\t} "]);

it('rejects non-object documents before modifying them', function (string $document): void {
    expect(fn () => JsonPreferences::set($document, 'currency', 'USD'))->toThrow(LogicException::class);
})->with(['[]', '123', 'true', '"string"']);
