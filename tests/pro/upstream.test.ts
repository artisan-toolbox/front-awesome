import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from 'vite-plus/test';
import inventory from './upstream-scenarios.json';

const root = resolve(import.meta.dirname, '../..');

test('records every upstream Pro HTML example and preserves script and stylesheet sources', () => {
    expect(inventory.components).toHaveLength(18);
    const ids = new Set();
    let total = 0;
    for (const component of inventory.components) {
        const file = resolve(
            root,
            `node_modules/@web.awesome.me/webawesome-pro/dist/skills/webawesome/references/components/${component.tag.slice(3)}.md`,
        );
        const source = readFileSync(file, 'utf8');
        const examples = [...source.matchAll(/```html[^\n]*\n([\s\S]*?)```/g)];
        const inlineCount =
            component.tag === 'wa-rich-text-editor'
                ? [...source.matchAll(/<div class="code-example-source"/g)].length
                : 0;
        const records = inventory.scenarios.filter(
            (scenario) => scenario.component === component.name,
        );
        expect(records, component.name).toHaveLength(examples.length + inlineCount);
        for (const [index, record] of records.entries()) {
            const example = examples[index];
            if (example) expect(record.original).toBe(example[1]?.trim());
            else expect(record.original).toContain('<wa-rich-text-editor');
            expect(ids.has(record.id)).toBe(false);
            ids.add(record.id);
            if (record.scriptExecution === 'review-required')
                expect(record.limitations.length).toBeGreaterThan(0);
            expect(record.counts.scripts).toBe(record.scripts.length);
            expect(record.counts.styles).toBe(record.styles.length);
        }
        total += examples.length + inlineCount;
    }
    expect(inventory.scenarios).toHaveLength(total);
});

test('keeps the application API prerequisite explicit while rendering its grid example', () => {
    expect(
        inventory.scenarios
            .filter(
                (scenario) =>
                    scenario.component === 'DataGrid' &&
                    scenario.scriptExecution === 'review-required',
            )
            .map((scenario) => ({ id: scenario.id, reason: scenario.limitations[0] })),
    ).toEqual([{ id: 'data-grid-31', reason: 'requires-application-api-endpoint' }]);
    expect(inventory.scenarios.every((scenario) => scenario.counts.elements > 0)).toBe(true);
});

test('records the Rich Text Editor reference prerequisites and all highlighted examples', () => {
    const scenarios = inventory.scenarios.filter(
        (scenario) => scenario.component === 'RichTextEditor',
    );
    expect(scenarios).toHaveLength(40);
    expect(scenarios[7]?.title).toBe('Appearance');
    expect(scenarios.at(-1)?.title).toBe('Styling the Editor');
    expect(
        scenarios
            .filter((scenario) => scenario.scriptExecution === 'review-required')
            .map((scenario) => scenario.id),
    ).toEqual([
        'rich-text-editor-13',
        'rich-text-editor-15',
        'rich-text-editor-28',
        'rich-text-editor-35',
        'rich-text-editor-37',
    ]);
});
