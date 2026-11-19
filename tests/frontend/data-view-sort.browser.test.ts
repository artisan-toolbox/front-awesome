import { http, type HttpRequestConfig, type HttpResponse } from '@inertiajs/core';
import { afterEach, beforeEach, expect, test, vi } from 'vite-plus/test';
import { page } from 'vitest/browser';
import { createApp, createSSRApp, h, type App } from 'vue';
import { DataView, type DataViewSlots } from '@artisan-toolbox/front-awesome/data-view';
import { createFrontAwesome, type DataViewOptions } from '@artisan-toolbox/front-awesome';
import {
    useDataAdapter,
    type AdapterDefinition,
    type SourceRequestedStateV2,
} from '@artisan-toolbox/dapter';
import { decodeRow, intent, response } from './data-view-fixtures';
import { useSortModifier } from '../../resources/js/data-view/sortModifier';
import '@artisan-toolbox/front-awesome/web-awesome.css';

const original = http.getClient();
const request = vi.fn<(config: HttpRequestConfig) => Promise<HttpResponse>>();
const cleanups: (() => void)[] = [];
beforeEach(() => {
    request.mockReset();
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
    cleanups.splice(0).forEach((cleanup) => cleanup());
    http.setClient(original);
    Reflect.deleteProperty(globalThis, 'Ziggy');
    vi.restoreAllMocks();
});
function serve(directions: ('asc' | 'desc')[] = ['asc', 'desc']) {
    request.mockImplementation(async (config) => {
        const payload = JSON.parse(String(config.data)) as { state?: SourceRequestedStateV2 };
        const data = response(payload.state ?? intent());
        const fields: AdapterDefinition['fields'] = {
            ...data.capabilities.fields,
            title: { search: null, filters: null, order: { directions, sortTypes: ['natural'] } },
            id: { search: null, filters: null, order: { directions, sortTypes: ['natural'] } },
        };
        data.capabilities = { ...data.capabilities, fields };
        return { status: 200, data: JSON.stringify(data), headers: {} };
    });
}
function createCatalog() {
    return useDataAdapter('Catalog', {
        decodeRow,
        protocol: 2,
        paging: 'source',
        url: false,
        searchDebounce: 0,
    });
}
function mount(
    options?: DataViewOptions,
    slots?: DataViewSlots<ReturnType<typeof createCatalog>, number>,
    prepare?: (app: App) => void,
) {
    const host = document.createElement('div');
    document.body.append(host);
    let catalog: ReturnType<typeof createCatalog> | undefined;
    const app = createApp({
        setup() {
            const adapter = createCatalog();
            catalog = adapter;
            return () =>
                h(
                    DataView<typeof adapter>,
                    {
                        adapter,
                        rowKey: 'id',
                        label: 'Sorting',
                        views: {
                            table: {
                                columns: [
                                    { field: 'name', label: 'Name', orderBy: 'title' },
                                    { field: 'id', label: 'ID', orderBy: 'id' },
                                    { kind: 'display', id: 'actions', label: 'Actions' },
                                ],
                            },
                        },
                    },
                    slots,
                );
        },
    });
    if (options) app.use(createFrontAwesome({ dataView: options }));
    prepare?.(app);
    app.mount(host);
    cleanups.push(() => {
        app.unmount();
        host.remove();
    });
    if (!catalog) throw new Error('Missing adapter');
    return { catalog, host };
}
async function click(label: string, modifiers: MouseEventInit = {}) {
    const button = page.getByRole('button', { name: new RegExp(`^${label}`) });
    await expect.element(button).toBeVisible();
    button
        .element()
        .dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true, ...modifiers }));
}
const term = (field: string, direction = 'asc') => ({ field, direction, sortType: 'natural' });

test.each([
    { directions: ['asc'] as const, descending: false },
    { directions: ['asc', 'desc'] as const, descending: true },
])(
    'keeps the clicked column when leaving multi-sort at the final permitted direction ($descending)',
    async ({ directions, descending }) => {
        serve([...directions]);
        const { catalog } = mount({ multiSortKey: 'shift' });
        await expect.poll(() => catalog.status).toBe('success');
        await click('Name', { shiftKey: true });
        await expect.poll(() => catalog.status).toBe('success');
        if (descending) {
            await click('Name', { shiftKey: true });
            await expect.poll(() => catalog.status).toBe('success');
        }
        await click('ID', { shiftKey: true });
        await expect
            .poll(() => catalog.requested?.order)
            .toEqual({
                kind: 'fields',
                terms: [term('title', descending ? 'desc' : 'asc'), term('id')],
            });
        await click('Name');
        await expect
            .poll(() => catalog.requested?.order)
            .toEqual({ kind: 'fields', terms: [term('title')] });
    },
);

test.each([
    { platform: 'MacIntel', key: 'metaKey', label: 'Command' },
    { platform: 'Win32', key: 'ctrlKey', label: 'Ctrl' },
    { platform: 'iPad', key: 'metaKey', label: 'Command' },
])(
    'uses the platform modifier on $platform without requiring the plugin',
    async ({ platform, key, label }) => {
        vi.spyOn(navigator, 'platform', 'get').mockReturnValue(platform);
        vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(platform);
        serve();
        const { catalog } = mount();
        await expect.poll(() => catalog.status).toBe('success');
        expect(
            page.getByRole('button', { name: 'Name', exact: true }).element().getAttribute('title'),
        ).toContain(`Hold ${label}`);
        await click('Name', { [key]: true });
        await expect.poll(() => catalog.status).toBe('success');
        await click('ID', { [key]: true });
        await expect
            .poll(() => catalog.requested?.order)
            .toEqual({ kind: 'fields', terms: [term('title'), term('id')] });
        await click('ID');
        await expect
            .poll(() => catalog.requested?.order)
            .toEqual({ kind: 'fields', terms: [term('id', 'desc')] });
        await click('ID');
        await expect.poll(() => catalog.requested?.order).toEqual({ kind: 'default' });
    },
);

test.each(['meta', 'ctrl', 'shift', 'alt'] as const)(
    'uses configured %s and clears only the clicked term when held',
    async (key) => {
        serve(['asc']);
        const { catalog } = mount({ multiSortKey: key });
        await expect.poll(() => catalog.status).toBe('success');
        await click('Name', { [`${key}Key`]: true });
        await expect.poll(() => catalog.status).toBe('success');
        await click('ID', { [`${key}Key`]: true });
        await expect
            .poll(() => catalog.requested?.order)
            .toEqual({ kind: 'fields', terms: [term('title'), term('id')] });
        await click('Name', { [`${key}Key`]: true });
        await expect
            .poll(() => catalog.requested?.order)
            .toEqual({ kind: 'fields', terms: [term('id')] });
    },
);

test('ignores Shift with the automatic Windows modifier and preserves the clicked secondary column', async () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('Win32');
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Windows');
    serve(['asc']);
    const { catalog } = mount();
    await expect.poll(() => catalog.status).toBe('success');
    await click('Name', { ctrlKey: true });
    await expect.poll(() => catalog.status).toBe('success');
    await click('ID', { ctrlKey: true });
    await expect
        .poll(() => catalog.requested?.order)
        .toEqual({ kind: 'fields', terms: [term('title'), term('id')] });
    await click('ID', { shiftKey: true });
    await expect
        .poll(() => catalog.requested?.order)
        .toEqual({ kind: 'fields', terms: [term('id')] });
});

test('renders default Font Awesome icons and changes direction icons through the public wrapper', async () => {
    serve();
    const { catalog, host } = mount();
    await expect.poll(() => catalog.status).toBe('success');
    const icon = () => host.querySelector('th')?.querySelector('wa-icon');
    await expect.poll(() => icon()?.getAttribute('name')).toBe('sort');
    expect(icon()?.getAttribute('family')).toBe('classic');
    expect(icon()?.getAttribute('variant')).toBe('solid');
    expect(icon()?.getAttribute('library')).toBe('default');
    await click('Name');
    await expect.poll(() => icon()?.getAttribute('name')).toBe('sort-up');
    await click('Name');
    await expect.poll(() => icon()?.getAttribute('name')).toBe('sort-down');
});

test('inherits Font Awesome family and variant while rendering character overrides as text', async () => {
    serve();
    const { catalog, host } = mount({
        sortIcons: {
            family: 'duotone',
            variant: 'regular',
            ascending: { name: 'arrow-up', family: 'sharp', variant: 'light' },
            descending: '<b>↓</b>',
        },
    });
    await expect.poll(() => catalog.status).toBe('success');
    const icon = () => host.querySelector('th')?.querySelector('wa-icon');
    await expect.poll(() => icon()?.getAttribute('family')).toBe('duotone');
    expect(icon()?.getAttribute('variant')).toBe('regular');
    await click('Name');
    await expect.poll(() => icon()?.getAttribute('name')).toBe('arrow-up');
    expect(icon()?.getAttribute('family')).toBe('sharp');
    expect(icon()?.getAttribute('variant')).toBe('light');
    await click('Name');
    await expect.poll(() => host.querySelector('th')?.textContent).toContain('<b>↓</b>');
    expect(host.querySelector('th')?.querySelector('b')).toBeNull();
    expect(host.querySelector('th')?.querySelector('wa-icon')).toBeNull();
});

test('passes numeric head states and exact scope while retaining sorting and pending feedback', async () => {
    serve();
    let handle: ReturnType<typeof createCatalog> | undefined;
    const seen: unknown[] = [];
    const { catalog, host } = mount(
        { multiSortKey: 'shift' },
        {
            'head-name': (scope) => {
                seen.push(scope.adapter);
                return h(
                    'span',
                    { 'data-testid': 'head-name' },
                    `${scope.name}:${scope.sortDirection}:${scope.column.label}:${scope.adapter === handle}`,
                );
            },
            'head-actions': (scope) =>
                h(
                    'span',
                    { 'data-testid': 'head-actions' },
                    `${scope.name}:${scope.sortDirection}`,
                ),
        },
    );
    handle = catalog;
    await expect.poll(() => catalog.status).toBe('success');
    await expect.element(page.getByTestId('head-name')).toHaveTextContent('Name:0:Name:true');
    await expect.element(page.getByTestId('head-actions')).toHaveTextContent('Actions:null');
    expect(host.querySelector('th')?.querySelector('wa-icon')).toBeNull();
    let finish: ((value: HttpResponse) => void) | undefined;
    request.mockImplementationOnce(
        () =>
            new Promise((resolve) => {
                finish = resolve;
            }),
    );
    await page.getByRole('button', { name: /^Name:0/ }).click();
    await expect.element(page.getByTestId('head-name')).toHaveTextContent('Name:1:Name:true');
    await expect.poll(() => host.querySelector('th')?.textContent).toContain('(pending)');
    expect(host.querySelector('th')?.getAttribute('aria-sort')).toBeNull();
    const data = response({
        ...intent(),
        order: {
            kind: 'fields',
            terms: [{ field: 'title', direction: 'asc', sortType: 'natural' }],
        },
    });
    finish?.({ status: 200, data: JSON.stringify(data), headers: {} });
    await expect.poll(() => catalog.status).toBe('success');
    await expect.poll(() => host.querySelector('th')?.getAttribute('aria-sort')).toBe('ascending');
    await page.getByRole('button', { name: /^Name:1/ }).click();
    await expect.element(page.getByTestId('head-name')).toHaveTextContent('Name:-1:Name:true');
    expect(seen.every((adapter) => adapter === catalog)).toBe(true);
});

test('keeps header replacement precedence and its original scope', async () => {
    serve();
    const { catalog, host } = mount(undefined, {
        'header-name': ({ column, adapter }) =>
            h('strong', `Legacy ${column.label} ${adapter.status}`),
        'head-name': () => h('span', 'Hidden head'),
    });
    await expect.poll(() => catalog.status).toBe('success');
    await expect.element(page.getByText('Legacy Name success')).toBeVisible();
    expect(host.querySelector('th')?.querySelector('wa-button')).toBeNull();
    expect(host.textContent).not.toContain('Hidden head');
});

test('reports null head direction when cursor paging disallows the advertised sort type', async () => {
    request.mockResolvedValueOnce({
        status: 200,
        data: JSON.stringify(response(intent({ mode: 'cursor', cursor: null, per_page: 2 }))),
        headers: {},
    });
    const { catalog, host } = mount(undefined, {
        'head-name': ({ name, sortDirection }) => h('span', `${name}:${sortDirection}`),
    });
    await expect.poll(() => catalog.status).toBe('success');
    await expect
        .element(page.getByRole('columnheader', { name: 'Name:null', exact: true }))
        .toBeVisible();
    expect(host.querySelector('th')?.querySelector('wa-button')).toBeNull();
});

test('hydrates the automatic modifier with the server fallback before selecting the Mac modifier', async () => {
    vi.spyOn(navigator, 'platform', 'get').mockReturnValue('MacIntel');
    const host = document.createElement('div');
    host.innerHTML = '<span>ctrl</span>';
    document.body.append(host);
    const warning = vi.fn();
    const app = createSSRApp({
        setup() {
            const modifier = useSortModifier('auto');
            return () => h('span', modifier.value);
        },
    });
    app.config.warnHandler = warning;
    app.mount(host);
    cleanups.push(() => {
        app.unmount();
        host.remove();
    });
    await expect.poll(() => host.textContent).toBe('meta');
    expect(warning).not.toHaveBeenCalled();
});
