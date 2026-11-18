import { http, type HttpRequestConfig, type HttpResponse } from '@inertiajs/core';
import { afterEach, beforeEach, expect, test, vi } from 'vite-plus/test';
import { page, userEvent } from 'vitest/browser';
import { createApp, nextTick } from 'vue';
import type WaInput from '@awesome.me/webawesome/dist/components/input/input.js';
import type { AdapterDefinition, SourceRequestedStateV2 } from '@artisan-toolbox/dapter';
import Fixture from './DataViewCriteriaFixture.vue';
import { definition, intent, response } from './data-view-fixtures';
import '@artisan-toolbox/front-awesome/web-awesome.css';

const original = http.getClient();
const request = vi.fn<(config: HttpRequestConfig) => Promise<HttpResponse>>();
let cleanup: () => void;
let advertised: AdapterDefinition;
let latest: SourceRequestedStateV2;
beforeEach(() => {
    request.mockReset();
    latest = intent();
    const fullText = {
        engine: 'pgsql',
        configuration: 'pg_catalog.english',
        input: 'plain_text',
        maxBytes: 512,
        ranking: 'filter_only',
    } as const;
    const options = [null, false, 0, '0', '', 'two words'];
    advertised = {
        ...definition,
        fields: {
            ...definition.fields,
            amount: {
                search: { valueType: 'number', matchTypes: ['equals'] },
                order: { sortTypes: ['numeric', 'native'], directions: ['asc', 'desc'] },
                filters: null,
            },
            notes: {
                search: {
                    valueType: 'string',
                    matchTypes: ['contains', 'equals', 'starts_with', 'ends_with', 'full_text'],
                    fullText,
                },
                order: null,
                filters: { many: { multiple: true, empty: 'reject', values: options } },
            },
        },
        global: {
            ...definition.global,
            search: {
                valueType: 'string',
                targets: { notes: { valueType: 'string', matchType: 'full_text', fullText } },
            },
            filters: {
                single: { multiple: false, values: options },
                many: { multiple: true, empty: 'clear', values: options },
            },
        },
    };
    request.mockImplementation(async (config) => {
        const submitted = JSON.parse(String(config.data)) as { state?: SourceRequestedStateV2 };
        latest = submitted.state ?? intent(latest.paging);
        const result = response(latest);
        return {
            status: 200,
            headers: {},
            data: JSON.stringify({
                ...result,
                capabilities: { ...advertised, paging: result.capabilities.paging },
            }),
        };
    });
    http.setClient({ request });
    Object.defineProperty(globalThis, 'Ziggy', {
        configurable: true,
        value: {
            url: location.origin,
            port: null,
            defaults: {},
            routes: { 'dapter.data': { uri: 'dapter/data/{source}', methods: ['POST'] } },
        },
    });
});
afterEach(() => {
    cleanup();
    http.setClient(original);
    Reflect.deleteProperty(globalThis, 'Ziggy');
});
async function mount() {
    const element = document.createElement('div');
    document.body.append(element);
    const app = createApp(Fixture);
    const instance = app.mount(element) as InstanceType<typeof Fixture>;
    cleanup = () => {
        app.unmount();
        element.remove();
    };
    await expect.element(page.getByText('Alpha', { exact: true })).toBeVisible();
    return instance.adapter;
}
function controls(label: string) {
    return page.getByRole('group', { name: label, exact: true });
}
async function choose(label: string, option: string, root: Element = document.body) {
    const host = Array.from(root.querySelectorAll('wa-select')).find(
        (item) => item.getAttribute('label') === label,
    );
    if (!host) throw new Error('Missing ' + label);
    const shown = new Promise<void>((resolve) =>
        host.addEventListener('wa-after-show', () => resolve(), { once: true }),
    );
    const combo = page.elementLocator(host).getByRole('combobox', { name: label, exact: true });
    if (host.hasAttribute('multiple')) {
        (combo.element() as HTMLElement).focus();
        await userEvent.keyboard('{ArrowDown}');
    } else await combo.click();
    await shown;
    const multiple = host.hasAttribute('multiple');
    const hidden = new Promise<void>((resolve) =>
        host.addEventListener('wa-after-hide', () => resolve(), { once: true }),
    );
    await page.getByRole('option', { name: option, exact: true }).click();
    if (multiple) await userEvent.keyboard('{Escape}');
    await hidden;
}
test('retains numeric drafts across unrelated changes and restores external field searches', async () => {
    const adapter = await mount();
    await page.getByText('Search and filters', { exact: true }).click();
    const amount = page.getByRole('textbox', { name: 'Search amount' });
    await amount.fill('-');
    await controls('Search amount').getByRole('button', { name: 'Apply' }).click();
    await expect
        .element(page.getByRole('alert'))
        .toHaveTextContent('Enter a finite number within the safe numeric range.');
    expect(request).toHaveBeenCalledTimes(1);
    await choose('Combine searches', 'Any');
    await expect.poll(() => latest.searchMatch).toBe('any');
    await expect.element(amount).toHaveValue('-');
    await amount.fill('-12.75');
    await controls('Search amount').getByRole('button', { name: 'Apply' }).click();
    await expect.poll(() => latest.fields.amount?.search?.value).toBe(-12.75);
    await adapter.replaceState({
        ...latest,
        fields: { amount: { search: { matchType: 'equals', value: 0 } } },
    });
    await expect.element(amount).toHaveValue('0');
    const notes = page.getByRole('textbox', { name: 'Search notes' });
    await notes.fill('  padded  ');
    await controls('Search notes').getByRole('button', { name: 'Apply' }).click();
    await expect.poll(() => latest.fields.notes?.search?.value).toBe('  padded  ');
    await page.getByRole('button', { name: 'Reset to source defaults' }).click();
    await expect.poll(() => adapter.requested?.searchMatch).toBe('all');
});
test('applies exact advertised single filter scalar types in the HTTP payload', async () => {
    await mount();
    await page.getByText('Search and filters', { exact: true }).click();
    for (const value of [null, false, 0, '0', '', 'two words']) {
        await choose('global single', typeof value + ' ' + JSON.stringify(value));
        await controls('global single').getByRole('button', { name: 'Apply' }).click();
        await expect.poll(() => latest.global.filters?.single?.value).toBe(value);
    }
    await controls('global single').getByRole('button', { name: 'Clear' }).click();
    await expect.poll(() => latest.global.filters?.single).toBeUndefined();
    await controls('notes many').getByRole('button', { name: 'Apply' }).click();
    await expect
        .element(controls('notes many').getByRole('alert'))
        .toHaveTextContent('Choose an option.');
});
test('orders independent fields in a grid, edits at capacity, removes a term and replaces a preset', async () => {
    await mount();
    await page.getByText('Ordering', { exact: true }).click();
    const group = (field: string) => page.getByRole('group', { name: new RegExp(field) });
    await group('title').getByRole('button', { name: 'Replace order' }).click();
    await expect.poll(() => latest.order.kind).toBe('fields');
    await expect
        .element(page.getByRole('combobox', { name: 'Order preset' }))
        .toHaveValue('No preset');
    await group('amount').getByRole('button', { name: 'Add to order' }).click();
    await expect.poll(() => latest.order.kind === 'fields' && latest.order.terms.length).toBe(2);
    await expect
        .element(group('amount').getByRole('button', { name: 'Update term' }))
        .toBeVisible();
    await choose('Direction', 'Descending', group('amount').element());
    await choose('Sort type', 'Native', group('amount').element());
    await group('amount').getByRole('button', { name: 'Update term' }).click();
    await expect
        .poll(() => latest.order.kind === 'fields' && latest.order.terms[1])
        .toEqual({ field: 'amount', direction: 'desc', sortType: 'native' });
    await group('title').getByRole('button', { name: 'Remove term' }).click();
    await expect
        .poll(() => latest.order.kind === 'fields' && latest.order.terms[0]?.field)
        .toBe('amount');
    await choose('Order preset', 'Featured');
    await expect.poll(() => latest.order.kind).toBe('preset');
    await expect
        .element(group('amount').getByRole('button', { name: 'Add to order' }))
        .not.toBeInTheDocument();
    await group('title').getByRole('button', { name: 'Replace order' }).click();
    await expect
        .poll(() => latest.order.kind === 'fields' && latest.order.terms[0]?.field)
        .toBe('title');
});

test('reports local full-text rejection and honors every advertised field match operator', async () => {
    const adapter = await mount();
    const query = page.getByRole('textbox', { name: 'Search results' });
    const tooLong = 'é'.repeat(257);
    await query.fill(tooLong);
    await expect
        .element(page.getByRole('alert'))
        .toHaveTextContent('Choose an available operation, value, page, and page size.');
    expect(adapter.error).toBeNull();
    expect(request).toHaveBeenCalledTimes(1);
    await query.fill('  valid  ');
    await expect.poll(() => latest.global.search?.value).toBe('  valid  ');
    await page.getByRole('button', { name: 'Search and filters' }).click();
    const field = controls('Search notes');
    const input = field.getByRole('textbox', { name: 'Search notes' });
    await input.fill('words');
    for (const [label, operator] of [
        ['Contains', 'contains'],
        ['Equals', 'equals'],
        ['Starts with', 'starts_with'],
        ['Ends with', 'ends_with'],
        ['Full text', 'full_text'],
    ] as const) {
        await choose('Match operator', label, field.element());
        await field.getByRole('button', { name: 'Apply' }).click();
        await expect.poll(() => latest.fields.notes?.search?.matchType).toBe(operator);
    }
    await input.fill(tooLong);
    await field.getByRole('button', { name: 'Apply' }).click();
    await expect
        .element(field.getByRole('alert'))
        .toHaveTextContent('Choose an available operation, value, page, and page size.');
    await input.fill('replacement draft');
    await expect.element(field.getByRole('alert')).not.toBeInTheDocument();
    await userEvent.keyboard('{Escape}');
    const toggle = page.getByRole('button', { name: 'Search and filters' });
    await expect.element(toggle).toHaveFocus();
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false');
});
test('discards local validation outcomes superseded by an input or a context reset in the same turn', async () => {
    const adapter = await mount();
    const query = page.getByRole('textbox', { name: 'Search results' });
    const root = query.element().getRootNode();
    if (!(root instanceof ShadowRoot)) throw new Error('Missing Web Awesome input');
    const host = root.host as WaInput;
    function edit(value: string) {
        host.value = value;
        host.dispatchEvent(new Event('input', { bubbles: true }));
    }
    edit('bad\0value');
    edit('fresh input');
    await expect.poll(() => latest.global.search?.value).toBe('fresh input');
    await expect.element(page.getByRole('alert')).not.toBeInTheDocument();
    edit('\uD800');
    await nextTick();
    await expect
        .element(page.getByRole('alert'))
        .toHaveTextContent('Choose an available operation, value, page, and page size.');
    edit('bad\0value');
    latest = intent();
    await adapter.resetContext();
    await expect.element(query).toHaveValue('');
    await expect.element(page.getByRole('alert')).not.toBeInTheDocument();
});
test.each(['cursor', 'simple'] as const)(
    'restricts ordering to advertised %s capabilities in every layout',
    async (mode) => {
        latest = intent(
            mode === 'cursor'
                ? { mode, cursor: null, per_page: 2 }
                : { mode, current: 1, per_page: 2 },
        );
        await mount();
        await expect
            .element(page.getByRole('combobox', { name: 'Order preset' }))
            .not.toBeInTheDocument();
        await page.getByRole('button', { name: 'Ordering', exact: true }).click();
        const group = page.getByRole('group', { name: 'amount' });
        if (mode === 'cursor')
            await expect
                .element(page.getByRole('group', { name: 'title' }))
                .not.toBeInTheDocument();
        await group.getByRole('button', { name: 'Replace order' }).click();
        await expect
            .poll(() => latest.order.kind === 'fields' && latest.order.terms[0]?.sortType)
            .toBe(mode === 'cursor' ? 'native' : 'numeric');
    },
);
test('distinguishes clearable and required multiple filters and returns focus after removal', async () => {
    const adapter = await mount();
    const toggle = page.getByRole('button', { name: 'Search and filters' });
    await toggle.click();
    const field = controls('notes many');
    const global = controls('global many');
    await choose('global many', 'number 0');
    await global.getByRole('button', { name: 'Apply' }).click();
    await expect.poll(() => latest.global.filters?.many?.value).toEqual([0]);
    await choose('global many', 'number 0');
    await global.getByRole('button', { name: 'Apply' }).click();
    await expect.poll(() => latest.global.filters?.many).toBeUndefined();
    await choose('notes many', 'boolean false');
    await field.getByRole('button', { name: 'Apply' }).click();
    await expect.poll(() => latest.fields.notes?.filters?.many?.value).toEqual([false]);
    await choose('notes many', 'boolean false');
    await field.getByRole('button', { name: 'Apply' }).click();
    await expect.element(field.getByRole('alert')).toHaveTextContent('Choose an option.');
    expect(latest.fields.notes?.filters?.many?.value).toEqual([false]);
    await field.getByRole('button', { name: 'Clear' }).click();
    await expect.poll(() => latest.fields.notes?.filters?.many).toBeUndefined();
    advertised = {
        ...advertised,
        fields: { ...advertised.fields, notes: { search: null, filters: null, order: null } },
    };
    await adapter.paging.reload();
    await expect
        .element(page.getByRole('combobox', { name: 'notes many' }))
        .not.toBeInTheDocument();
    await expect.element(toggle).toHaveFocus();
});
test('shows source stability terms as read-only in an embedded ordering disclosure', async () => {
    const field = { field: 'title', direction: 'desc', sortType: 'natural' } as const;
    const state: SourceRequestedStateV2 = {
        ...intent(),
        order: { kind: 'fields', terms: [field] },
    };
    const result = response(state);
    const prefix = { id: 'tenant', direction: 'asc', sortType: 'native' } as const;
    const tie = { id: 'id', direction: 'asc', sortType: 'native' } as const;
    request.mockResolvedValueOnce({
        status: 200,
        headers: {},
        data: JSON.stringify({
            ...result,
            capabilities: {
                ...advertised,
                global: { ...advertised.global, stability: { prefix: [prefix], identity: [tie] } },
            },
            state: {
                ...result.state,
                order: {
                    kind: 'terms',
                    terms: [
                        {
                            field: prefix.id,
                            direction: prefix.direction,
                            sortType: prefix.sortType,
                            role: 'prefix',
                        },
                        field,
                        {
                            field: tie.id,
                            direction: tie.direction,
                            sortType: tie.sortType,
                            role: 'tie',
                        },
                    ],
                },
            },
        }),
    });
    await mount();
    const toggle = page.getByRole('button', { name: 'Ordering', exact: true });
    const region = page
        .getByRole('region', { name: 'Results', exact: true })
        .element() as HTMLElement;
    region.style.inlineSize = '320px';
    region.dir = 'rtl';
    (toggle.element() as HTMLElement).focus();
    await userEvent.keyboard('{Enter}');
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'true');
    const summary = page.getByRole('region', { name: 'Applied order' });
    await expect
        .poll(() =>
            summary
                .getByRole('listitem')
                .elements()
                .map((item) => item.textContent?.replace(/\s+/g, ' ').trim()),
        )
        .toEqual([
            'tenant · Ascending · Native (Source prefix)',
            'title · Descending · Natural',
            'id · Ascending · Native (Tie-breaker)',
        ]);
    expect(region.scrollWidth).toBeLessThanOrEqual(region.clientWidth);
    expect(request).toHaveBeenCalledTimes(1);
});
test('drops a stale finite-filter draft when its selected option is withdrawn', async () => {
    const adapter = await mount();
    await page.getByRole('button', { name: 'Search and filters' }).click();
    await choose('global single', 'string "two words"');
    advertised = {
        ...advertised,
        global: {
            ...advertised.global,
            filters: {
                ...advertised.global.filters,
                single: { multiple: false, values: [0, false] },
            },
        },
    };
    await adapter.paging.reload();
    await controls('global single').getByRole('button', { name: 'Apply' }).click();
    await expect
        .element(controls('global single').getByRole('alert'))
        .toHaveTextContent('Choose an option.');
    expect(request).toHaveBeenCalledTimes(2);
    expect(latest.global.filters?.single).toBeUndefined();
});

test.each(['integer', 'number'] as const)(
    'retains inexact %s search drafts without a read',
    async (valueType) => {
        advertised = {
            ...advertised,
            fields: {
                ...advertised.fields,
                amount: {
                    search: { valueType, matchTypes: ['equals'] },
                    order: null,
                    filters: null,
                },
            },
        };
        await mount();
        await page.getByText('Search and filters', { exact: true }).click();
        const input = page.getByRole('textbox', { name: 'Search amount' });
        for (const raw of [
            '1.0000000000000001',
            '1e-9999',
            '9007199254740991.1',
            '-9007199254740991.1',
        ]) {
            await input.fill(raw);
            await userEvent.keyboard('{Enter}');
            await expect.element(controls('Search amount').getByRole('alert')).toBeVisible();
            await expect.element(input).toHaveValue(raw);
            expect(request).toHaveBeenCalledTimes(1);
        }
        for (const [raw, value] of [
            ['1e3', 1000],
            ['1.0', 1],
            ['9007199254740991', Number.MAX_SAFE_INTEGER],
        ] as const) {
            await input.fill(raw);
            await userEvent.keyboard('{Enter}');
            await expect.poll(() => latest.fields.amount?.search?.value).toBe(value);
        }
    },
);
