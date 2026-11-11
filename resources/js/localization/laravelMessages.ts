import type { MessageContext } from 'vue-i18n';
import { pluralIndex } from './pluralRules';
import { titlecase } from './titlecase';

export function chooseMessage(line: string, count: number, sourceLocale: string): string {
    const segments = line.split('|');
    for (const segment of segments) {
        const condition = /^[{[]([-?\d|*,.]*)[}\]](.*)/s.exec(segment);
        if (!condition) continue;
        const [, range, text] = condition;
        if (range.includes(',')) {
            const [from, to] = range.split(',', 2);
            if (
                (to === '*' && count >= Number(from)) ||
                (from === '*' && count <= Number(to)) ||
                (count >= Number(from) && count <= Number(to))
            )
                return text.replace(/^[ \t\n\r\0\v]+|[ \t\n\r\0\v]+$/g, '');
        }
        if (range.trim() !== '' && Number(range) === count)
            return text.replace(/^[ \t\n\r\0\v]+|[ \t\n\r\0\v]+$/g, '');
    }
    const stripped = segments.map((segment) => segment.replace(/^[{[][-?\d|*,.]*[}\]]/, ''));
    return stripped[pluralIndex(sourceLocale, count)] ?? stripped[0];
}

function scalar(value: unknown): value is string | number | boolean | null {
    return value === null || ['string', 'number', 'boolean'].includes(typeof value);
}
function phpString(value: string | number | boolean | null): string {
    return value === null || value === false ? '' : value === true ? '1' : String(value);
}
function ucfirst(value: string): string {
    const [first = '', ...rest] = Array.from(value);
    return titlecase(first) + rest.join('');
}

export function replaceMessage(line: string, values: Record<string, unknown>): string {
    const replacements = new Map<string, string>();
    for (const [key, value] of Object.entries(values)) {
        if (!scalar(value)) continue;
        const string = phpString(value);
        replacements.set(`:${ucfirst(key)}`, ucfirst(string));
        replacements.set(`:${key.toUpperCase()}`, string.toUpperCase());
        replacements.set(`:${key}`, string);
    }
    if (!replacements.size) return line;
    const keys = [...replacements.keys()].sort((left, right) => right.length - left.length);
    const pattern = keys.map((key) => key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
    // One pass matches PHP strtr without interpolating replacement text again.
    return line.replace(new RegExp(pattern, 'g'), (token) => replacements.get(token) ?? token);
}

export function laravelMessage(line: string, sourceLocale: string) {
    return (context: MessageContext<string>): string => {
        const count = context.named('count') ?? context.named('n');
        const values = { ...context.values };
        for (const name of ['count', 'n']) {
            const value = context.named(name);
            if (scalar(value)) values[name] = value;
        }
        return replaceMessage(
            typeof count === 'number' ? chooseMessage(line, count, sourceLocale) : line,
            values,
        );
    };
}
