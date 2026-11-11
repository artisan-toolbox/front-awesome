import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const catalogs = JSON.parse(
    execFileSync(
        process.env.PHP_BINARY ?? 'php',
        [
            '-r',
            '$root = $argv[1]; $catalogs = []; foreach (["en", "es", "pt_BR"] as $locale) { $catalogs[$locale] = require $root."/lang/".$locale."/printing.php"; } echo json_encode($catalogs, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);',
            root,
        ],
        { encoding: 'utf8' },
    ),
);
const keys = Object.keys(catalogs.en).sort();
for (const [locale, messages] of Object.entries(catalogs)) {
    if (
        JSON.stringify(Object.keys(messages).sort()) !== JSON.stringify(keys) ||
        Object.values(messages).some((message) => typeof message !== 'string' || !message.trim())
    ) {
        throw new Error(
            `The ${locale} printing catalog must contain every English key and a nonempty string for each value.`,
        );
    }
}

const fixture = {
    version: 1,
    fallbackLocale: 'en',
    locales: Object.fromEntries(
        Object.entries(catalogs).map(([sourceLocale, messages]) => [
            sourceLocale.replaceAll('_', '-'),
            {
                sourceLocale,
                label: { en: 'English', es: 'Español', pt_BR: 'Português (Brasil)' }[sourceLocale],
                messages: Object.fromEntries(
                    Object.entries(messages).map(([key, value]) => [
                        `front-awesome::printing.${key}`,
                        value,
                    ]),
                ),
            },
        ]),
    ),
};
for (const [path, content] of [
    ['../resources/js/printing/messages.generated.json', catalogs.en],
    ['../tests/frontend/fixtures/printingCatalog.json', fixture],
]) {
    const target = new URL(path, import.meta.url);
    const output = `${JSON.stringify(content, null, 2)}\n`;
    if (process.argv.includes('--check')) {
        if (readFileSync(target, 'utf8') !== output) {
            throw new Error(
                'Printing defaults differ from Laravel translations. Run npm run translations:generate.',
            );
        }
    } else {
        writeFileSync(target, output);
    }
}
