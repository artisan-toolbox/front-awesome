export function canonicalLocale(value) {
    try {
        return Intl.getCanonicalLocales(value.replaceAll('_', '-'))[0];
    } catch {
        return undefined;
    }
}
