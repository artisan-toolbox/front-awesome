import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test } from 'vite-plus/test';
import inventory from './upstream-scenarios.json';

const root = resolve(import.meta.dirname, '../..');

test('records every upstream Pro HTML example and preserves script and stylesheet sources', () => {
    expect(inventory.components).toHaveLength(17);
    const ids = new Set();
    let total = 0;
    for (const component of inventory.components) {
        const file = resolve(
            root,
            `node_modules/@web.awesome.me/webawesome-pro/dist/skills/webawesome/references/components/${component.tag.slice(3)}.md`,
        );
        const source = readFileSync(file, 'utf8');
        const examples = [...source.matchAll(/```html[^\n]*\n([\s\S]*?)```/g)];
        const records = inventory.scenarios.filter(
            (scenario) => scenario.component === component.name,
        );
        expect(records, component.name).toHaveLength(examples.length);
        for (const [index, example] of examples.entries()) {
            const record = records[index];
            if (!record) throw new Error(`Missing ${component.name} scenario ${index}`);
            expect(record.original).toBe(example[1]?.trim());
            expect(ids.has(record.id)).toBe(false);
            ids.add(record.id);
            if (record.scriptExecution === 'review-required')
                expect(record.limitations.length).toBeGreaterThan(0);
            expect(record.counts.scripts).toBe(record.scripts.length);
            expect(record.counts.styles).toBe(record.styles.length);
        }
        total += examples.length;
    }
    expect(inventory.scenarios).toHaveLength(total);
});

test('keeps the application API prerequisite explicit while rendering its grid example', () => {
    expect(
        inventory.scenarios
            .filter((scenario) => scenario.scriptExecution === 'review-required')
            .map((scenario) => ({ id: scenario.id, reason: scenario.limitations[0] })),
    ).toEqual([{ id: 'data-grid-31', reason: 'requires-application-api-endpoint' }]);
    expect(inventory.scenarios.every((scenario) => scenario.counts.elements > 0)).toBe(true);
});
