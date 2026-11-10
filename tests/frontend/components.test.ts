import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { expect, test } from 'vite-plus/test';
import * as components from '@artisan-toolbox/front-awesome/components/WebAwesome';
import definitions from '../../resources/js/WebAwesome/components.json';

const root = resolve(import.meta.dirname, '../..');
const manifest = JSON.parse(
    readFileSync(
        resolve(root, 'node_modules/@awesome.me/webawesome/dist/custom-elements.json'),
        'utf8',
    ),
);
const tags = manifest.modules
    .flatMap((module: { declarations?: { tagName?: string }[] }) => module.declarations ?? [])
    .flatMap((declaration: { tagName?: string }) =>
        declaration.tagName ? [declaration.tagName] : [],
    );

test('exports every installed Core component through both public direct paths and the Vue barrel', () => {
    expect(definitions.map((definition) => definition.tag).sort()).toEqual(tags.sort());
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
    for (const definition of definitions) {
        expect(components).toHaveProperty(definition.name);
        for (const prefix of ['components', 'components/WebAwesome']) {
            expect(pkg.exports[`./${prefix}/${definition.name}.vue`]).toBe(
                `./resources/js/components/WebAwesome/${definition.name}.vue`,
            );
        }
    }
});

for (const definition of definitions.filter((definition) => definition.generated)) {
    test(`${definition.name} renders one native host without introducing visual defaults during SSR`, async () => {
        const component = Reflect.get(components, definition.name);
        const rendered = await renderToString(
            createSSRApp({
                render: () =>
                    h(
                        component,
                        { 'data-contract': 'native', 'aria-label': 'Example' },
                        () => 'Example',
                    ),
            }),
        );
        const html = rendered.replaceAll('<!--[-->', '').replaceAll('<!--]-->', '');
        if (definition.name === 'Rating') {
            expect(html).toMatch(/^<fa-form-field-frame class="fa-form-field-frame-inactive">/);
        } else expect(html).toMatch(new RegExp(`^<${definition.tag}[^>]*>`));
        const nativeHost = html.match(new RegExp(`<${definition.tag}[^>]*>`))?.[0];
        expect(nativeHost).toBeDefined();
        expect(html).toContain('data-contract="native"');
        expect(html).toContain('aria-label="Example"');
        expect(nativeHost).not.toContain('class=');
        expect(nativeHost).not.toContain('style=');
        expect(html).toContain('Example');
        if (definition.name === 'Rating') expect(html).toContain(`</${definition.tag}>`);
        else expect(html).toMatch(new RegExp(`</${definition.tag}>$`));
    });
}
