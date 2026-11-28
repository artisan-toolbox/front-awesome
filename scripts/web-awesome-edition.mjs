import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const unwrappedCoreTags = new Set([
    'wa-code-highlighter',
    'wa-counter',
    'wa-lightbox',
    'wa-lightbox-item',
    'wa-number-ticker',
]);

export function supportsCoreWrapper(tag) {
    return !unwrappedCoreTags.has(tag);
}

export function usesProLicense(dist, tag) {
    const reference = resolve(dist, `skills/webawesome/references/components/${tag.slice(3)}.md`);
    return /^# .+ \[Pro\]\r?$/m.test(readFileSync(reference, 'utf8').split('\n', 1)[0]);
}

export function requireRichTextEditor(declarations) {
    if (!declarations.some((declaration) => declaration.tagName === 'wa-rich-text-editor'))
        throw new Error('Generating Pro wrappers requires Web Awesome Pro 3.15.0 or later.');
}
