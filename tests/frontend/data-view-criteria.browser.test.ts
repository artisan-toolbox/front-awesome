import { http, HttpNetworkError, type HttpRequestConfig, type HttpResponse } from '@inertiajs/core';
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
    const options = [null, false, 0, '0', '', ' ', 'two words'];
    advertised = {
        ...definition,
        fields: {
            ...definition.fields,
            embedding: {
                search: {
                    valueType: 'vector',
                    matchTypes: ['vector'],
                    vector: {
                        engine: 'pgsql',
                        metric: 'l2',
                        dimensions: 3,
                        maxDistance: 1,
                        input: 'prepared_vector',
                        precision: 'float32',
                        maxCoordinateMagnitude: 1000000,
                        threshold: 'inclusive',
                        ranking: 'filter_only',
                    },
                },
                order: null,
                filters: null,
            },
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
    let defaultPaging: SourceRequestedStateV2['paging'] | undefined;
    request.mockImplementation(async (config) => {
        defaultPaging ??= latest.paging;
        const submitted = JSON.parse(String(config.data)) as { state?: SourceRequestedStateV2 };
        latest = submitted.state ?? intent(defaultPaging);
        const names = ['Alpha', 'Beta', 'Gamma'];
        const rows = names
            .slice(0, latest.paging.per_page)
            .map((name, index) => ({ id: index + 1, name }));
        const result = response(latest, { rows });
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
async function mount(options: { sidebar?: boolean; debounce?: number } = {}) {
    await page.viewport(1120, 800);
    const element = document.createElement('div');
    document.body.append(element);
    const app = createApp(Fixture, options);
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
function optionsTrigger() {
    return page.getByRole('button', { name: 'View options', exact: true });
}
async function openSection(section: 'Search' | 'Filters' | 'Sort' | 'Page settings') {
    await optionsTrigger().click();
    await page.getByRole('button', { name: section, exact: true }).click();
}
async function selectCriterion(label: string) {
    const name = label.startsWith('Search ') ? 'Search scope' : 'Criterion';
    await choose(name, label);
}
async function selectOrder(label: string) {
    await choose('Order field', label);
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
    await openSection('Search');
    await selectCriterion('Search amount');
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
    await selectCriterion('Search notes');
    const notes = page.getByRole('textbox', { name: 'Search notes' });
    await notes.fill('  padded  ');
    await controls('Search notes').getByRole('button', { name: 'Apply' }).click();
    await expect.poll(() => latest.fields.notes?.search?.value).toBe('  padded  ');
    await page.getByRole('button', { name: 'Reset to source defaults' }).click();
    await expect.poll(() => adapter.requested?.searchMatch).toBe('all');
});
test('applies exact advertised single filter scalar types in the HTTP payload', async () => {
    await mount();
    await openSection('Filters');
    await selectCriterion('global single');
    for (const value of [null, false, 0, '0', '', ' ', 'two words']) {
        await choose('global single', typeof value + ' ' + JSON.stringify(value));
        await controls('global single').getByRole('button', { name: 'Apply' }).click();
        await expect.poll(() => latest.global.filters?.single?.value).toBe(value);
    }
    await controls('global single').getByRole('button', { name: 'Clear' }).click();
    await expect.poll(() => latest.global.filters?.single).toBeUndefined();
    await selectCriterion('notes many');
    await controls('notes many').getByRole('button', { name: 'Apply' }).click();
    await expect
        .element(controls('notes many').getByRole('alert'))
        .toHaveTextContent('Choose an option.');
});
test('orders independent fields in a grid, edits at capacity, removes a term and replaces a preset', async () => {
    await mount();
    await openSection('Sort');
    const group = (field: string) => page.getByRole('group', { name: new RegExp(field) });
    await group('title').getByRole('button', { name: 'Replace order' }).click();
    await expect.poll(() => latest.order.kind).toBe('fields');
    await expect
        .element(page.getByRole('combobox', { name: 'Order preset' }))
        .toHaveValue('No preset');
    await selectOrder('amount');
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
    await selectOrder('title');
    await group('title').getByRole('button', { name: 'Remove term' }).click();
    await expect
        .poll(() => latest.order.kind === 'fields' && latest.order.terms[0]?.field)
        .toBe('amount');
    await choose('Order preset', 'Featured');
    await expect.poll(() => latest.order.kind).toBe('preset');
    await selectOrder('amount');
    await expect
        .element(group('amount').getByRole('button', { name: 'Add to order' }))
        .not.toBeInTheDocument();
    await selectOrder('title');
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
    await openSection('Search');
    await selectCriterion('Search notes');
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
    const toggle = optionsTrigger();
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
        await openSection('Sort');
        await expect
            .element(page.getByRole('combobox', { name: 'Order preset' }))
            .not.toBeInTheDocument();
        if (mode !== 'cursor') await selectOrder('amount');
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
    const toggle = optionsTrigger();
    await toggle.click();
    const field = controls('notes many');
    const global = controls('global many');
    await selectCriterion('global many');
    await choose('global many', 'number 0');
    await global.getByRole('button', { name: 'Apply' }).click();
    await expect.poll(() => latest.global.filters?.many?.value).toEqual([0]);
    await choose('global many', 'number 0');
    await global.getByRole('button', { name: 'Apply' }).click();
    await expect.poll(() => latest.global.filters?.many).toBeUndefined();
    await selectCriterion('notes many');
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
    await expect
        .element(
            page.getByRole('button', { name: 'Remove title · Descending · Natural · Priority 1' }),
        )
        .toBeVisible();
    await expect
        .element(page.getByRole('button', { name: /^Remove (tenant|id) · / }))
        .not.toBeInTheDocument();
    const toggle = optionsTrigger();
    const region = page
        .getByRole('region', { name: 'Results', exact: true })
        .element() as HTMLElement;
    region.style.inlineSize = '320px';
    region.dir = 'rtl';
    await expect.element(toggle).toHaveAttribute('aria-haspopup', 'dialog');
    (toggle.element() as HTMLElement).focus();
    await userEvent.keyboard('{Enter}');
    await expect.element(page.getByRole('dialog', { name: 'View options' })).toBeVisible();
    await page.getByRole('button', { name: 'Sort', exact: true }).click();
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
    await openSection('Filters');
    await selectCriterion('global single');
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
        await openSection('Search');
        await selectCriterion('Search amount');
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

test('submits prepared vector arrays, rejects invalid coordinates, and restores the accepted draft', async () => {
    const adapter = await mount();
    await openSection('Search');
    await selectCriterion('Search embedding');
    const input = page.getByRole('textbox', { name: 'Search embedding' });
    const group = controls('Search embedding');
    await input.fill('[0,1]');
    await group.getByRole('button', { name: 'Apply', exact: true }).click();
    await expect
        .element(page.getByRole('alert'))
        .toHaveTextContent(
            'Enter 3 finite numeric coordinates between -1000000 and 1000000 as a JSON array.',
        );
    expect(request).toHaveBeenCalledTimes(1);
    await input.fill('[0,1,0]');
    await group.getByRole('button', { name: 'Apply', exact: true }).click();
    await expect
        .poll(() => latest.fields.embedding?.search)
        .toEqual({ value: [0, 1, 0], matchType: 'vector' });
    await adapter.replaceState({
        ...latest,
        fields: { embedding: { search: { value: [1, 0, 0], matchType: 'vector' } } },
    });
    await expect.element(input).toHaveValue('[1,0,0]');
    await group.getByRole('button', { name: 'Clear', exact: true }).click();
    await expect.poll(() => latest.fields.embedding).toBeUndefined();
    await expect.element(input).toHaveValue('');
});

test('shares a standalone host form with accepted chips and removes only one criterion', async () => {
    const adapter = await mount({ sidebar: true });
    const sidebar = page.getByRole('complementary', { name: 'Filter stock' });
    const filter = sidebar.getByRole('group', { name: 'Stock mark' });
    await choose('Stock mark', 'string " "', sidebar.element());
    expect(request).toHaveBeenCalledTimes(1);
    await filter.getByRole('button', { name: 'Apply' }).click();
    const chip = page.getByRole('button', { name: 'Remove global single: string " "' });
    await expect.element(chip).toBeVisible();
    expect(request).toHaveBeenCalledTimes(2);
    await sidebar.getByRole('textbox', { name: 'Search notes' }).fill('paper');
    await userEvent.keyboard('{Enter}');
    await expect
        .element(page.getByRole('button', { name: 'Remove Search notes: paper' }))
        .toBeVisible();
    await chip.click();
    await expect.poll(() => adapter.status).toBe('success');
    expect(latest.fields.notes?.search?.value).toBe('paper');
    expect(latest.global.filters?.single).toBeUndefined();
    await expect.element(chip).not.toBeInTheDocument();
    const remaining = page.getByRole('button', { name: 'Remove Search notes: paper' });
    await expect.element(remaining).toHaveFocus();
    await remaining.click();
    await expect.element(optionsTrigger()).toHaveFocus();
    expect(request).toHaveBeenCalledTimes(5);
    await expect.element(sidebar.getByTestId('submissions')).toHaveTextContent('0');
    await sidebar.getByRole('button', { name: 'Save host form' }).click();
    await expect.element(sidebar.getByTestId('submissions')).toHaveTextContent('1');
});

test('keeps accepted chips through pending and failed reads and cancels a narrow dialog draft', async () => {
    await mount();
    await page.viewport(390, 800);
    const filters = optionsTrigger();
    await expect.element(filters).toHaveAttribute('aria-haspopup', 'dialog');
    await filters.click();
    const dialog = page.getByRole('dialog', { name: 'View options' });
    await expect.element(dialog).toBeVisible();
    await selectCriterion('global single');
    await choose('global single', 'number 0');
    await controls('global single').getByRole('button', { name: 'Apply' }).click();
    const chip = page.getByRole('button', { name: 'Remove global single: number 0' });
    let rejectRead!: (reason: Error) => void;
    request.mockReturnValueOnce(
        new Promise<HttpResponse>((_, reject) => {
            rejectRead = reject;
        }),
    );
    await choose('global single', 'boolean false');
    await controls('global single').getByRole('button', { name: 'Apply' }).click();
    expect(document.querySelector('[aria-label="Remove global single: number 0"]')).not.toBeNull();
    expect(document.querySelector('[aria-label="Remove global single: boolean false"]')).toBeNull();
    rejectRead(new HttpNetworkError('offline'));
    await expect.element(controls('global single').getByRole('alert')).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expect.element(filters).toHaveFocus();
    await expect.element(chip).toBeVisible();
    await filters.click();
    await selectCriterion('global single');
    await expect.element(controls('global single').getByRole('combobox')).toHaveValue('number 0');
    await choose('global single', 'string "0"');
    await page.getByRole('button', { name: 'Done' }).click();
    await expect.element(filters).toHaveFocus();
    await filters.click();
    await selectCriterion('global single');
    await expect.element(controls('global single').getByRole('combobox')).toHaveValue('number 0');
    expect(request).toHaveBeenCalledTimes(3);
});

test('coalesces global typing according to the borrowed adapter debounce', async () => {
    await mount({ debounce: 300 });
    const query = page.getByRole('textbox', { name: 'Search results' });
    await query.click();
    await userEvent.keyboard('clips');
    await expect.poll(() => latest.global.search?.value).toBe('clips');
    expect(request).toHaveBeenCalledTimes(2);
});

test('ignores a superseded filter response after a newer choice has been accepted', async () => {
    const adapter = await mount({ sidebar: true });
    const filter = controls('Stock mark');
    const older = { ...intent(), global: { filters: { single: { value: false } } } };
    let resolveOlder!: (response: HttpResponse) => void;
    request.mockReturnValueOnce(
        new Promise<HttpResponse>((resolve) => {
            resolveOlder = resolve;
        }),
    );
    await choose('Stock mark', 'boolean false', filter.element());
    await filter.getByRole('button', { name: 'Apply' }).click();
    await expect.poll(() => adapter.status).toBe('loading');
    await choose('Stock mark', 'number 0', filter.element());
    await filter.getByRole('button', { name: 'Apply' }).click();
    const current = page.getByRole('button', { name: 'Remove global single: number 0' });
    await expect.element(current).toBeVisible();
    const stale = response(older);
    resolveOlder({
        status: 200,
        headers: {},
        data: JSON.stringify({ ...stale, capabilities: advertised }),
    });
    await new Promise(requestAnimationFrame);
    await expect.element(current).toBeVisible();
    await expect
        .element(page.getByRole('button', { name: 'Remove global single: boolean false' }))
        .not.toBeInTheDocument();
    expect(adapter.requested?.global.filters?.single?.value).toBe(0);
    expect(request).toHaveBeenCalledTimes(3);
});

test('restores a pure paging source after leaving its first page', async () => {
    advertised = {
        ...advertised,
        fields: {},
        global: {
            ...definition.global,
            search: null,
            order: null,
            filters: null,
            multi_order: false,
            multi_order_limit: 1,
            searchMatch: { default: 'all', allowed: ['all'] },
        },
    };
    const adapter = await mount();
    const reset = page.getByRole('button', { name: 'Reset to source defaults' });
    await expect.element(reset).not.toBeInTheDocument();
    await adapter.paging.goToNext();
    await expect.poll(() => adapter.accepted?.paging).toMatchObject({ current: 2 });
    await expect.element(controls('Applied criteria')).not.toBeInTheDocument();
    await openSection('Page settings');
    await reset.click();
    await expect.poll(() => adapter.accepted?.paging).toMatchObject({ current: 1 });
    expect(JSON.parse(String(request.mock.calls.at(-1)?.[0].data))).toEqual({ version: 2 });
});

test('reopens view options during its closing animation', async () => {
    await mount();
    const filters = optionsTrigger();
    await filters.click();
    await selectCriterion('global single');
    // Reopen as soon as the trigger regains focus, before the closing animation finishes.
    await page.getByRole('button', { name: 'Done' }).click();
    await filters.click();
    await selectCriterion('global single');
    await expect.element(controls('global single').getByRole('combobox')).toBeVisible();
    await choose('global single', 'boolean false');
    await controls('global single').getByRole('button', { name: 'Apply' }).click();
    await expect.poll(() => latest.global.filters?.single?.value).toBe(false);
    expect(request).toHaveBeenCalledTimes(2);
});

test('clears individual accepted search, filter, order and paging changes while preserving the others', async () => {
    const adapter = await mount();
    const remove = (text: string) =>
        page.getByRole('button', { name: 'Remove ' + text, exact: true });
    const state: SourceRequestedStateV2 = {
        ...intent({ mode: 'offset', current: 2, per_page: 3 }),
        global: { search: { value: 'paper' }, filters: { many: { value: [0, '0'] } } },
        fields: { notes: { search: { value: 'print', matchType: 'contains' } } },
        searchMatch: 'any',
        order: {
            kind: 'fields',
            terms: [
                { field: 'title', direction: 'desc', sortType: 'natural' },
                { field: 'amount', direction: 'asc', sortType: 'numeric' },
            ],
        },
    };
    await adapter.replaceState(state);
    const search = remove('Search results: paper');
    const firstOrder = remove('title · Descending · Natural · Priority 1');
    const secondOrder = remove('amount · Ascending · Numeric · Priority 2');
    const rows = remove('Rows per page: 3');
    for (const chip of [search, remove('Search notes: print'), firstOrder, secondOrder, rows]) {
        await expect.element(chip).toBeVisible();
    }
    await firstOrder.click();
    await expect.element(remove('amount · Ascending · Numeric · Priority 1')).toBeVisible();
    let expected = {
        ...state,
        order: {
            kind: 'fields',
            terms: [{ field: 'amount', direction: 'asc', sortType: 'numeric' }],
        },
    } satisfies SourceRequestedStateV2;
    expect(latest).toEqual(expected);
    const match = remove('Combine searches: Any');
    await match.click();
    await expect.element(match).not.toBeInTheDocument();
    expected = { ...expected, searchMatch: 'all' };
    expect(latest).toEqual(expected);
    const zero = remove('global many: number 0');
    await zero.click();
    await expect.element(zero).not.toBeInTheDocument();
    await expect.element(remove('global many: string "0"')).toBeVisible();
    expected = { ...expected, global: { ...expected.global, filters: { many: { value: ['0'] } } } };
    expect(latest).toEqual(expected);
    await search.click();
    await expect.element(search).not.toBeInTheDocument();
    expected = { ...expected, global: { filters: expected.global.filters } };
    expect(latest).toEqual(expected);
    await rows.click();
    await expect.element(rows).not.toBeInTheDocument();
    expected = { ...expected, paging: { mode: 'offset', current: 2, per_page: 2 } };
    expect(latest).toEqual(expected);
    await expect.element(remove('Page 2')).not.toBeInTheDocument();
});

test('restores source order from an accepted preset without clearing the search or page', async () => {
    const adapter = await mount();
    const state: SourceRequestedStateV2 = {
        ...intent({ mode: 'offset', current: 2, per_page: 2 }),
        order: { kind: 'preset', id: 'featured' },
        global: { search: { value: 'paper' } },
    };
    await adapter.replaceState(state);
    const preset = page.getByRole('button', { name: 'Remove Preset Featured' });
    await preset.click();
    await expect.element(preset).not.toBeInTheDocument();
    expect(latest).toEqual({ ...state, order: { kind: 'default' } });
});

test.each(['offset', 'cursor', 'simple'] as const)(
    'keeps explicit %s navigation out of applied criteria',
    async (mode) => {
        latest = intent(
            mode === 'cursor'
                ? { mode, cursor: null, per_page: 2 }
                : { mode, current: 1, per_page: 2 },
        );
        const adapter = await mount();
        await adapter.paging.goToNext();
        expect(adapter.accepted?.paging).toEqual(
            mode === 'cursor'
                ? { mode, cursor: 'next-token', per_page: 2 }
                : { mode, current: 2, per_page: 2 },
        );
        await expect.element(controls('Applied criteria')).not.toBeInTheDocument();
    },
);

test('withdraws accepted chip values when the source revokes access', async () => {
    const adapter = await mount();
    await adapter.replaceState({ ...intent(), global: { search: { value: 'private paper' } } });
    const chip = page.getByRole('button', { name: 'Remove Search results: private paper' });
    await expect.element(chip).toBeVisible();
    request.mockResolvedValueOnce({
        status: 403,
        headers: {},
        data: JSON.stringify({
            version: 2,
            error: { kind: 'access', code: 'forbidden', message: 'Access denied.' },
        }),
    });
    await adapter.paging.reload();
    await expect.element(chip).not.toBeInTheDocument();
    expect(document.body.textContent).not.toContain('private paper');
});

test('retries the same chip removal after its first read fails', async () => {
    const adapter = await mount();
    await adapter.replaceState({ ...intent(), global: { search: { value: 'paper' } } });
    const chip = page.getByRole('button', { name: 'Remove Search results: paper' });
    request.mockRejectedValueOnce(new HttpNetworkError('offline'));
    await chip.click();
    await expect.poll(() => adapter.status).toBe('error');
    await expect.element(chip).toBeVisible();
    await chip.click();
    await expect.element(chip).not.toBeInTheDocument();
    expect(latest.global.search).toBeUndefined();
    expect(request).toHaveBeenCalledTimes(4);
});

test('restores the grouping advertised by the source when it differs from the usual default', async () => {
    advertised = {
        ...advertised,
        global: {
            ...advertised.global,
            searchMatch: { default: 'any', allowed: ['all', 'any'] },
        },
    };
    const adapter = await mount();
    const chip = page.getByRole('button', { name: 'Remove Combine searches: All' });
    await expect.element(chip).toBeVisible();
    await chip.click();
    await expect.element(chip).not.toBeInTheDocument();
    expect(adapter.requested?.searchMatch).toBe('any');
    await expect.element(controls('Applied criteria')).not.toBeInTheDocument();
});
