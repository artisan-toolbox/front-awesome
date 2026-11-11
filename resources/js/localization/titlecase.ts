import generated from './titlecase.generated.json';

// PHP mbstring uses Unicode titlecase, which differs from uppercasing the first letter.
// The checked generator retains its exceptions. See https://www.unicode.org/license.txt.
const exceptions: ReadonlyMap<string, string> = new Map(Object.entries(generated));

export function titlecase(character: string): string {
    const known = exceptions.get(character);
    if (known) return known;
    const [first = '', ...rest] = Array.from(character.toUpperCase());
    return first + rest.join('').toLowerCase();
}
