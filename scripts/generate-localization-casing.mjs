import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const output = fileURLToPath(
    new URL('../resources/js/localization/titlecase.generated.json', import.meta.url),
);
const source = `
$characters = [];
for ($code = 0; $code <= 0x10ffff; $code++) {
    if ($code >= 0xd800 && $code <= 0xdfff) continue;
    $character = mb_chr($code, 'UTF-8');
    $title = mb_ucfirst($character, 'UTF-8');
    if ($character !== $title || mb_strtoupper($character, 'UTF-8') !== $character) {
        $characters[$character] = $title;
    }
}
echo json_encode($characters, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE);
`;
const mappings = JSON.parse(
    execFileSync(process.env.PHP_BINARY ?? 'php', ['-r', source], { encoding: 'utf8' }),
);
const exceptions = Object.entries(mappings).filter(([character, title]) => {
    const [first = '', ...rest] = Array.from(character.toUpperCase());
    return first + rest.join('').toLowerCase() !== title;
});
const generated = `${JSON.stringify(Object.fromEntries(exceptions), null, 2)}\n`;
if (process.argv.includes('--check')) {
    if (readFileSync(output, 'utf8') !== generated) {
        throw new Error(
            'Localization casing differs from PHP mbstring. Run node scripts/generate-localization-casing.mjs.',
        );
    }
} else {
    writeFileSync(output, generated);
}
console.info(`Verified ${exceptions.length} PHP titlecase exceptions.`);
