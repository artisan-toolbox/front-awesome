import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { layers } from './theme-tokens.mjs';
const packageNames = ['@awesome.me/webawesome', 'tailwindcss', 'primevue', '@primeuix/themes'];
const files = [
    'styles/themes/default.css',
    'styles/layers.css',
    'styles/color/palettes/base.css',
    'styles/color/variants/brand.css',
    'styles/color/variants/neutral.css',
    'styles/color/variants/success.css',
    'styles/color/variants/warning.css',
    'styles/color/variants/danger.css',
    'components/page/page.styles.js',
];
const versions = Object.fromEntries(
    await Promise.all(
        packageNames.map(async (name) => [
            name,
            JSON.parse(
                await readFile(
                    new URL(`../node_modules/${name}/package.json`, import.meta.url),
                    'utf8',
                ),
            ).version,
        ]),
    ),
);
const hashes = Object.fromEntries(
    await Promise.all(
        files.map(async (path) => [
            path,
            createHash('sha256')
                .update(
                    await readFile(
                        new URL(
                            `../node_modules/@awesome.me/webawesome/dist/${path}`,
                            import.meta.url,
                        ),
                    ),
                )
                .digest('hex'),
        ]),
    ),
);
const sourceRoot = new URL('../node_modules/@awesome.me/webawesome/dist/', import.meta.url);
const visited = new Map();
async function visit(path) {
    if (visited.has(path)) return;
    const css = await readFile(new URL(path), 'utf8');
    visited.set(path, css);
    for (const match of css.matchAll(/@import\s+url\(['"]([^'"]+)['"]\)/g))
        await visit(new URL(match[1], path).href);
}
await visit(new URL('styles/themes/default.css', sourceRoot).href);
await visit(new URL('styles/utilities.css', sourceRoot).href);
const names = (source) =>
    [...new Set([...source.matchAll(/(--[\w-]+)\s*:/g)].map((match) => match[1]))].sort((a, b) =>
        a.localeCompare(b),
    );
const upstream = names([...visited.values()].join('\n'));
const adapter = await readFile(
    new URL('../resources/js/theme/tokens.css', import.meta.url),
    'utf8',
);
const owned = names(adapter);
const tailwind = names(
    await readFile(new URL('../node_modules/tailwindcss/theme.css', import.meta.url), 'utf8'),
);
const references = [
    ...new Set([...adapter.matchAll(/var\((--[\w-]+)/g)].map((match) => match[1])),
].sort((a, b) => a.localeCompare(b));
const inventory = {
    owned,
    inherited: upstream.filter((name) => !owned.includes(name)),
    unresolved: references.filter(
        (name) => !owned.includes(name) && !upstream.includes(name) && !tailwind.includes(name),
    ),
};
assert.deepEqual(inventory.unresolved, [], 'Adapter contains unresolved token inputs.');
const record = {
    versions,
    edition: 'Core',
    pro: 'Not tested. Resolver unit fixtures do not establish Pro theme compatibility.',
    hashes,
    inventory,
};
const cssEntry = await readFile(new URL('../resources/js/tailwind.css', import.meta.url), 'utf8');
const primeEntry = await readFile(new URL('../resources/js/primevue.ts', import.meta.url), 'utf8');
assert.ok(cssEntry.startsWith(`@layer ${layers};`), 'Shared layer prelude drifted.');
assert.ok(primeEntry.includes(layers), 'PrimeVue layer order drifted.');
const path = new URL('../tests/theme-compatibility.json', import.meta.url);
if (process.argv.includes('--record'))
    await writeFile(path, `${JSON.stringify(record, null, 2)}\n`);
else
    assert.deepEqual(
        record,
        JSON.parse(await readFile(path, 'utf8')),
        'Upstream theme contracts changed. Review tokens, scopes, and wa-page, run all consumer tests, then record reviewed versions with node scripts/check-theme-compatibility.mjs --record.',
    );
