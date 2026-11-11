import { readFileSync } from 'node:fs';
import { canonicalLocale } from './canonicalLocale.mjs';

try {
    const [major, minor] = process.versions.node.split('.').map(Number);
    if (major < 24 || (major === 24 && minor < 11))
        throw new Error('Translation export requires Node.js 24.11 or later.');
    const registry = JSON.parse(readFileSync(0, 'utf8'));
    const locales = new Map();
    for (const locale of registry.locales) {
        const canonical = canonicalLocale(locale);
        if (!canonical) throw new Error(`Invalid browser locale [${locale}].`);
        if (locales.has(canonical))
            throw new Error(
                `Locales [${locales.get(canonical)}] and [${locale}] resolve to the same browser locale [${canonical}]. Use one Laravel source locale.`,
            );
        locales.set(canonical, locale);
    }
    for (const locale of registry.sourceLocales) {
        if (!canonicalLocale(locale)) throw new Error(`Invalid browser source locale [${locale}].`);
    }
    for (const locale of [...registry.availableLocales, registry.fallbackLocale]) {
        if (!locales.has(canonicalLocale(locale)))
            throw new Error(`Browser locale [${locale}] has no exported catalog.`);
    }
    process.stdout.write('Front Awesome browser locales validated.');
} catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 1;
}
