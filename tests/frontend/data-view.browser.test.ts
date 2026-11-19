import {
    http,
    HttpNetworkError,
    router,
    type HttpRequestConfig,
    type HttpResponse,
} from '@inertiajs/core';
import { afterEach, beforeEach, expect, onTestFinished, test, vi } from 'vite-plus/test';
import { page, userEvent } from 'vitest/browser';
import { createApp, nextTick, h, shallowRef, type App } from 'vue';
import Fixture from './DataViewFixture.vue';
import { createFrontAwesome } from '@artisan-toolbox/front-awesome';
import { DataView } from '@artisan-toolbox/front-awesome/data-view';
import { useDataAdapter, defineActions } from '@artisan-toolbox/dapter';
import corpus from '@artisan-toolbox/dapter/contracts/read-v1.json';
import { decodeRow, intent, response } from './data-view-fixtures';
import '@artisan-toolbox/front-awesome/web-awesome.css';
import themeCss from '../theme-consumer/app.css?inline';
const original = http.getClient();
const request = vi.fn<(config: HttpRequestConfig) => Promise<HttpResponse>>();
const cleanups: (() => void)[] = [];
const respond = (data: unknown, status = 200): HttpResponse => ({
    status,
    data: JSON.stringify(data),
    headers: {},
});
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
    cleanups.splice(0).forEach((fn) => fn());
    http.setClient(original);
    Reflect.deleteProperty(globalThis, 'Ziggy');
});
function deferred<T>() {
    let resolve: (value: T) => void = () => {
        throw new Error('Uninitialized promise');
    };
    const promise = new Promise<T>((accept) => {
        resolve = accept;
    });
    return { promise, resolve };
}
function mount(
    props: InstanceType<typeof Fixture>['$props'] = {},
    prepare?: (app: App, container: HTMLDivElement) => void,
) {
    const container = document.createElement('div');
    document.body.append(container);
    const app = createApp(Fixture, { ...props });
    prepare?.(app, container);
    const instance = app.mount(container) as InstanceType<typeof Fixture>;
    cleanups.push(() => {
        app.unmount();
        container.remove();
    });
    return instance;
}
test('keeps the exact shared handle and pending read when switching layouts with real controls', async () => {
    const pending = deferred<HttpResponse>();
    request.mockReturnValueOnce(pending.promise);
    mount({ shared: true });
    await expect.poll(() => request.mock.calls.length).toBe(1);
    await page.getByRole('button', { name: 'Grid', exact: true }).click();
    pending.resolve(respond(response()));
    await expect
        .element(page.getByTestId('view-state'))
        .toHaveTextContent('grid success same handle');
    await expect.element(page.getByText('Alpha card')).toBeVisible();
    await expect.element(page.getByText('Shared Alpha')).toBeVisible();
    await page.getByRole('button', { name: 'Table', exact: true }).click();
    await expect.element(page.getByRole('cell', { name: 'ALPHAAlpha' })).toBeVisible();
    await expect.element(page.getByRole('cell', { name: 'Product 1' })).toBeVisible();
    await page.getByRole('button', { name: 'List', exact: true }).click();
    await expect.element(page.getByText('Alpha list')).toBeVisible();
    expect(request).toHaveBeenCalledTimes(1);
});
test('renders grid alone without columns or a selector', async () => {
    request.mockResolvedValue(respond(response()));
    mount({ gridOnly: true });
    await expect
        .element(page.getByTestId('view-state'))
        .toHaveTextContent('grid success same handle');
    await expect
        .element(page.getByRole('group', { name: 'Results layout' }))
        .not.toBeInTheDocument();
    expect(request).toHaveBeenCalledTimes(1);
});

test('inherits the app scrollbar variant on the table viewport and preserves horizontal scroll', async () => {
    const style = document.createElement('style');
    style.textContent = themeCss;
    document.head.append(style);
    onTestFinished(() => style.remove());
    request.mockResolvedValue(respond(response()));
    mount({}, (app, container) => {
        container.style.width = '360px';
        container.classList.add('fa-theme', 'wa-light');
        app.use(createFrontAwesome({ scrollbar: { defaultVariant: 'danger' } }));
    });
    const table = page.getByRole('table');
    await expect.element(table).toBeVisible();
    const element = table.element();
    if (!(element instanceof HTMLTableElement) || !element.parentElement) {
        throw new Error('Expected a native table in its scroll viewport.');
    }
    const viewport = element.parentElement;
    element.style.minWidth = '1000px';
    expect(viewport.getAttribute('data-fa-scrollbar')).toBe('danger');
    await expect
        .poll(() => viewport.querySelector('.os-scrollbar-horizontal.os-scrollbar-visible'))
        .not.toBeNull();
    viewport.scrollLeft = 90;
    expect(viewport.scrollLeft).toBe(90);

    await page.getByRole('button', { name: 'Grid', exact: true }).click();
    await expect.element(table).not.toBeInTheDocument();
    expect(viewport.isConnected).toBe(false);
    expect(request).toHaveBeenCalledTimes(1);
});

test('orders through the advertised alias and keeps accepted aria-sort while a request is pending', async () => {
    request.mockResolvedValueOnce(respond(response()));
    mount();
    await expect.element(page.getByText('ALPHA', { exact: true })).toBeVisible();
    const pending = deferred<HttpResponse>();
    request.mockReturnValueOnce(pending.promise);
    await page.getByRole('button', { name: 'Name', exact: true }).click();
    await expect.poll(() => request.mock.calls.length).toBe(2);
    expect(
        page.getByRole('columnheader', { name: /Name/ }).element().getAttribute('aria-sort'),
    ).toBeNull();
    const state = {
        ...intent(),
        order: {
            kind: 'fields',
            terms: [{ field: 'title', direction: 'asc', sortType: 'natural' }],
        },
    } satisfies Parameters<typeof response>[0];
    pending.resolve(respond(response(state)));
    await expect
        .poll(() =>
            page.getByRole('columnheader', { name: /Name/ }).element().getAttribute('aria-sort'),
        )
        .toBe('ascending');
});
test.each(['simple', 'cursor'] as const)(
    'renders %s traversal without invented counts or numbered controls',
    async (mode) => {
        request.mockResolvedValueOnce(
            respond(
                response(
                    intent(
                        mode === 'simple'
                            ? { mode, current: 1, per_page: 2 }
                            : { mode, cursor: null, per_page: 2 },
                    ),
                ),
            ),
        );
        mount();
        await expect.element(page.getByText('ALPHA', { exact: true })).toBeVisible();
        await expect.element(page.getByRole('button', { name: 'Next', exact: true })).toBeEnabled();
        await expect
            .element(page.getByRole('button', { name: 'Last', exact: true }))
            .not.toBeInTheDocument();
        await expect.element(page.getByText('6 results', { exact: true })).not.toBeInTheDocument();
        await expect
            .element(page.getByRole('spinbutton', { name: 'Go to page' }))
            .not.toBeInTheDocument();
    },
);
test('retains authorized rows on recoverable failure and removes them after access denial', async () => {
    request.mockResolvedValueOnce(respond(response()));
    mount();
    await expect.element(page.getByText('ALPHA', { exact: true })).toBeVisible();
    request.mockRejectedValueOnce(new HttpNetworkError('Offline'));
    await page.getByRole('button', { name: 'Reload', exact: true }).click();
    await expect
        .element(page.getByTestId('view-state'))
        .toHaveTextContent('table error same handle');
    await expect.element(page.getByText('ALPHA', { exact: true })).toBeVisible();
    request.mockResolvedValueOnce(
        respond(
            { version: 2, error: { kind: 'access', code: 'forbidden', message: 'Access denied.' } },
            403,
        ),
    );
    await page.getByRole('button', { name: 'Reload', exact: true }).click();
    await expect.element(page.getByText('Access to this data source was denied.')).toBeVisible();
    await expect.element(page.getByText('ALPHA', { exact: true })).not.toBeInTheDocument();
});
test('appends Dapter accumulated rows and retries a paused infinite request', async () => {
    const first = intent({ mode: 'cursor', cursor: null, per_page: 2 });
    request.mockResolvedValueOnce(respond(response(first)));
    mount({ infinite: true });
    await expect.element(page.getByText('ALPHA', { exact: true })).toBeVisible();
    request.mockRejectedValueOnce(new HttpNetworkError('Offline'));
    await page.getByRole('button', { name: 'Load more', exact: true }).click();
    await expect.element(page.getByRole('button', { name: 'Retry loading more' })).toBeVisible();
    request.mockResolvedValueOnce(
        respond(
            response(intent({ mode: 'cursor', cursor: 'next-token', per_page: 2 }), {
                rows: [{ id: 3, name: 'Gamma' }],
                next: false,
            }),
        ),
    );
    await page.getByRole('button', { name: 'Retry loading more' }).click();
    await expect.element(page.getByText('GAMMA', { exact: true })).toBeVisible();
    await expect.element(page.getByText('ALPHA', { exact: true })).toBeVisible();
    await expect
        .element(page.getByRole('button', { name: 'Load more', exact: true }))
        .toBeDisabled();
    await nextTick();
});

test('keeps declaration order and emits the effective fallback when layouts or the external model change', async () => {
    request.mockResolvedValue(respond(response()));
    mount({ layoutChanges: true });
    await expect.element(page.getByText('ALPHA', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Remove table layout' }).click();
    await expect.element(page.getByTestId('external-view')).toHaveTextContent('list');
    const selector = page.getByRole('group', { name: 'Results layout' }).element();
    expect(
        [...selector.querySelectorAll('button')].map((button) => button.textContent?.trim()),
    ).toEqual(['List', 'Grid']);
    await page.getByRole('button', { name: 'Request unavailable layout' }).click();
    await expect.element(page.getByTestId('external-view')).toHaveTextContent('list');
    expect(request).toHaveBeenCalledTimes(1);
});

test('commits global search and page entry with real keyboard controls', async () => {
    request.mockResolvedValueOnce(respond(response()));
    mount();
    await expect.element(page.getByText('ALPHA', { exact: true })).toBeVisible();
    const searchState = { ...intent(), global: { search: { value: 'Notebook' } } };
    request.mockResolvedValueOnce(respond(response(searchState)));
    await page.getByRole('textbox', { name: 'Search results' }).fill('Notebook');
    await expect.poll(() => request.mock.calls.length).toBe(2);
    expect(request.mock.calls[1]?.[0].data).toContain('"search":{"value":"Notebook"}');
    await expect
        .element(page.getByTestId('view-state'))
        .toHaveTextContent('table success same handle');
    request.mockResolvedValueOnce(
        respond(response({ ...searchState, paging: { mode: 'offset', current: 2, per_page: 2 } })),
    );
    await page.getByRole('spinbutton', { name: 'Go to page' }).fill('2');
    await userEvent.keyboard('{Tab}');
    await expect.poll(() => request.mock.calls.length).toBe(3);
    await expect.element(page.getByText('Page 2 of 3')).toBeVisible();
});

test('uses public Select controls for order presets and page sizes', async () => {
    request.mockResolvedValueOnce(respond(response()));
    mount();
    await expect.element(page.getByText('ALPHA', { exact: true })).toBeVisible();
    async function choose(label: string, option: string) {
        const host = document.querySelector(`wa-select[label="${label}"]`);
        if (!host) throw new Error(`Missing ${label} select`);
        const shown = new Promise<void>((resolve) =>
            host.addEventListener('wa-after-show', () => resolve(), { once: true }),
        );
        await page.getByRole('combobox', { name: label, exact: true }).click();
        await shown;
        const hidden = new Promise<void>((resolve) =>
            host.addEventListener('wa-after-hide', () => resolve(), { once: true }),
        );
        await page.getByRole('option', { name: option, exact: true }).click();
        await hidden;
    }
    const ordered = { ...intent(), order: { kind: 'preset', id: 'featured' } } satisfies Parameters<
        typeof response
    >[0];
    request.mockResolvedValueOnce(respond(response(ordered)));
    await choose('Order preset', 'Featured');
    await expect.poll(() => request.mock.calls.length).toBe(2);
    expect(request.mock.calls[1]?.[0].data).toContain('"kind":"preset","id":"featured"');
    request.mockResolvedValueOnce(
        respond(
            response(
                { ...ordered, paging: { mode: 'offset', current: 1, per_page: 3 } },
                {
                    rows: [
                        { id: 1, name: 'Alpha' },
                        { id: 2, name: 'Beta' },
                        { id: 3, name: 'Gamma' },
                    ],
                },
            ),
        ),
    );
    await choose('Rows per page', '3');
    await expect.element(page.getByText('GAMMA', { exact: true })).toBeVisible();
    expect(request.mock.calls[2]?.[0].data).toContain('"per_page":3');
});

test('keeps source owners independent when the source name is the same', async () => {
    const first = deferred<HttpResponse>();
    const second = deferred<HttpResponse>();
    request.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    mount();
    mount();
    await expect.poll(() => request.mock.calls.length).toBe(2);
    first.resolve(
        respond(
            response(intent(), {
                rows: [
                    { id: 1, name: 'First owner' },
                    { id: 3, name: 'First extra' },
                ],
            }),
        ),
    );
    second.resolve(
        respond(
            response(intent(), {
                rows: [
                    { id: 2, name: 'Second owner' },
                    { id: 4, name: 'Second extra' },
                ],
            }),
        ),
    );
    await expect.element(page.getByText('FIRST OWNER', { exact: true })).toBeVisible();
    await expect.element(page.getByText('SECOND OWNER', { exact: true })).toBeVisible();
    expect(request).toHaveBeenCalledTimes(2);
});

test('offers a first-page restart when an invalid cursor withdrew all paging metadata', async () => {
    const first = intent({ mode: 'cursor', cursor: null, per_page: 2 });
    request.mockResolvedValueOnce(respond(response(first)));
    mount();
    await expect.element(page.getByText('ALPHA', { exact: true })).toBeVisible();
    request.mockResolvedValueOnce(
        respond(
            {
                version: 2,
                error: {
                    kind: 'validation',
                    code: 'invalid_cursor',
                    message: 'The cursor is invalid.',
                },
                errors: { _dapter_kind: ['validation'], _dapter_code: ['invalid_cursor'] },
            },
            422,
        ),
    );
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect.element(page.getByRole('alert')).toBeVisible();
    const restart = page.getByRole('button', { name: 'Restart from first page' });
    expect(restart.query()).not.toBeNull();
    request.mockResolvedValueOnce(respond(response(first)));
    await restart.click();
    await expect.element(page.getByText('ALPHA', { exact: true })).toBeVisible();
});

test('reports an exhausted repeated cursor even when the last page advertises a next cursor', async () => {
    const position = (cursor: string | null) => intent({ mode: 'cursor', cursor, per_page: 2 });
    request.mockResolvedValueOnce(respond(response(position(null))));
    mount({ infinite: true });
    await expect.element(page.getByText('ALPHA', { exact: true })).toBeVisible();
    request.mockResolvedValueOnce(
        respond(response(position('next-token'), { rows: [{ id: 3, name: 'Gamma' }] })),
    );
    await page.getByRole('button', { name: 'Load more', exact: true }).click();
    await expect.element(page.getByText('GAMMA', { exact: true })).toBeVisible();
    await nextTick();
    expect(page.getByText('All available results loaded.').query()).not.toBeNull();
    await expect
        .element(page.getByRole('button', { name: 'Load more', exact: true }))
        .toBeDisabled();
});

test('announces updating an accepted empty result outside the busy results region', async () => {
    const empty = response(intent(), { rows: [] });
    request.mockResolvedValueOnce(
        respond({
            ...empty,
            paging: { ...empty.paging, total: 0, filtered: 0, pages: 1, has_next: false },
        }),
    );
    mount();
    await expect.element(page.getByText('No results.')).toBeVisible();
    const pending = deferred<HttpResponse>();
    request.mockReturnValueOnce(pending.promise);
    await page.getByRole('button', { name: 'Reload', exact: true }).click();
    await expect.poll(() => request.mock.calls.length).toBe(2);
    const status = page
        .getByRole('status')
        .all()
        .find((item) => item.element().textContent?.includes('Updating results'));
    expect(status).toBeDefined();
    expect(status?.element().closest('[aria-busy="true"]')).toBeNull();
    pending.resolve(respond(response()));
});

test('groups consecutive occurrences, keeps typed keys across layouts and selects without transport', async () => {
    const rows = ['Apple', 'Apricot', 'Berry', 'Avocado'].map((name) => ({ id: 1, name }));
    const state = intent({ mode: 'offset', current: 1, per_page: 4 });
    const result = response(state, { rows });
    request.mockResolvedValueOnce(
        respond({
            ...result,
            capabilities: {
                ...result.capabilities,
                paging: { mode: 'offset', per_page: 4, per_page_options: [4] },
            },
        }),
    );
    const instance = mount({ grouped: true, joined: true, selection: 'multiple' });
    await expect.element(page.getByText('APPLE', { exact: true })).toBeVisible();
    const groups = [...document.querySelectorAll('tbody')];
    expect(groups.map((group) => group.rows.length)).toEqual([2, 1, 1]);
    expect(
        groups.map((group) => group.querySelector('th[scope="rowgroup"]')?.getAttribute('rowspan')),
    ).toEqual(['2', '1', '1']);
    expect(groups[0]?.querySelector('strong')?.textContent).toBe('APPLE');
    expect(instance.keyCalls()).toBe(4);
    await page.getByRole('checkbox', { name: 'Select Apple', exact: true }).click();
    await page.getByRole('checkbox', { name: 'Select Apricot', exact: true }).click();
    await expect
        .element(page.getByTestId('selection-state'))
        .toHaveTextContent('[1,"1"] Apple,Apricot');
    const all = page.getByRole('checkbox', { name: 'Select all loaded rows' });
    expect((all.element() as HTMLInputElement).indeterminate).toBe(true);
    await all.click();
    expect(instance.emissions.at(-1)).toEqual([1, '1', '2', '3']);
    await page.getByRole('button', { name: 'Grid', exact: true }).click();
    expect(page.getByRole('button', { name: 'Grid', pressed: true }).query()).not.toBeNull();
    await expect
        .element(page.getByRole('checkbox', { name: 'Select Apricot', checked: true }))
        .toBeVisible();
    await page.getByRole('button', { name: 'List', exact: true }).click();
    await page.getByRole('button', { name: 'Clear selection', exact: true }).click();
    expect(instance.emissions.at(-1)).toEqual([]);
    expect(instance.keyCalls()).toBe(4);
    expect(request).toHaveBeenCalledTimes(1);
});

test('uses independent radio groups and accepts only the first supplied live key in single mode', async () => {
    request.mockResolvedValueOnce(respond(response()));
    const owner = mount({ shared: true, selection: 'single', prefill: [7, 2, 1] });
    const first = page.getByRole('region', { name: 'Catalog', exact: true });
    const second = page.getByRole('region', { name: 'Shared catalog', exact: true });
    await expect
        .element(first.getByRole('radio', { name: 'Select Beta', checked: true }))
        .toBeVisible();
    await second.getByRole('radio', { name: 'Select row 1', exact: true }).click();
    await expect
        .element(first.getByRole('radio', { name: 'Select Beta', checked: true }))
        .toBeVisible();
    expect(owner.emissions).toEqual([[2]]);
    expect(request).toHaveBeenCalledTimes(1);
});

test('blocks an ignored selection correction across same-tick context changes and fresh parent arrays', async () => {
    request.mockResolvedValueOnce(respond(response()));
    const owner = mount({ selection: 'multiple', prefill: [1], ignoreSelection: true });
    await expect
        .element(page.getByRole('checkbox', { name: 'Select Alpha', checked: true }))
        .toBeVisible();
    const next = deferred<HttpResponse>();
    request.mockReturnValueOnce(next.promise);
    const reset = owner.catalog.resetContext();
    await expect.element(page.getByTestId('selection-state')).toHaveTextContent('[]');
    owner.model = [1];
    const changed = response(intent(), {
        rows: [
            { id: 1, name: 'New tenant' },
            { id: 2, name: 'Next row' },
        ],
    });
    next.resolve(respond(changed));
    await reset;
    const newer = page.getByRole('checkbox', { name: 'Select New tenant' });
    await expect.element(newer).not.toBeChecked();
    owner.model = [1];
    await nextTick();
    expect(owner.emissions).toEqual([[]]);
    await newer.click();
    await expect.element(newer).toBeChecked();
    request.mockResolvedValueOnce(respond(changed));
    await owner.catalog.resetContext();
    await expect.element(newer).not.toBeChecked();
    expect(owner.emissions).toEqual([[], [1], []]);
    owner.model = [];
    await expect.element(newer).not.toBeChecked();
    owner.model = [1];
    await expect.element(newer).toBeChecked();
    expect(request).toHaveBeenCalledTimes(3);
});

test('withdraws pending initial prefill on an observable idle reset before the first response', async () => {
    const first = deferred<HttpResponse>();
    const second = deferred<HttpResponse>();
    request.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);
    const owner = mount({ selection: 'multiple', prefill: [1], ignoreSelection: true });
    await expect.poll(() => request.mock.calls.length).toBe(1);
    const reset = owner.catalog.resetContext();
    await expect.poll(() => request.mock.calls.length).toBe(2);
    second.resolve(respond(response()));
    await reset;
    await expect.element(page.getByRole('checkbox', { name: 'Select Alpha' })).not.toBeChecked();
    expect(owner.emissions).toEqual([[]]);
    first.resolve(respond(response()));
    owner.revision++;
    await expect.element(page.getByRole('checkbox', { name: 'Select Alpha' })).toBeChecked();
    expect(request).toHaveBeenCalledTimes(2);
});

test.each([
    [true, false],
    [false, true],
    [true, true],
])(
    'preserves toolbar replacement %s and additive filters %s',
    async (customToolbar, customFilters) => {
        request.mockResolvedValueOnce(respond(response()));
        mount({ customToolbar, customFilters, gridOnly: true, selection: 'multiple' });
        await expect.element(page.getByText('Alpha card')).toBeVisible();
        expect(!!page.getByRole('textbox', { name: 'Search results' }).query()).toBe(
            !customToolbar,
        );
        expect(!!page.getByText('Custom toolbar').query()).toBe(customToolbar);
        expect(!!page.getByText('Custom filters').query()).toBe(customFilters);
        expect(page.getByRole('checkbox', { name: 'Select Alpha' }).query()).not.toBeNull();
    },
);

test('keeps page entry editable after validation and disables it during a read', async () => {
    request.mockResolvedValueOnce(respond(response()));
    mount();
    await expect.element(page.getByText('ALPHA', { exact: true })).toBeVisible();
    await expect.element(page.getByText('2 rows loaded')).toBeVisible();
    await expect.element(page.getByText('6 matches')).toBeVisible();
    await expect.element(page.getByText('6 total results')).toBeVisible();
    const jump = page.getByRole('spinbutton', { name: 'Go to page' });
    await jump.fill('7');
    await userEvent.keyboard('{Tab}');
    await expect
        .element(page.getByText('Enter a whole page number between 1 and 3.'))
        .toBeVisible();
    expect(request).toHaveBeenCalledTimes(1);
    const next = deferred<HttpResponse>();
    request.mockReturnValueOnce(next.promise);
    await jump.fill('2');
    await userEvent.keyboard('{Enter}');
    await expect.element(jump).toBeDisabled();
    next.resolve(respond(response(intent({ mode: 'offset', current: 2, per_page: 2 }))));
    await expect.element(page.getByText('Page 2 of 3')).toBeVisible();
    await expect.element(jump).toBeEnabled();
});

test('prunes departed controlled keys, including a repeated key on a later page, and preserves retained rows on failure', async () => {
    request.mockResolvedValueOnce(respond(response()));
    const owner = mount({ selection: 'multiple', prefill: [1], ignoreSelection: true });
    await expect.element(page.getByRole('checkbox', { name: 'Select Alpha' })).toBeChecked();
    request.mockRejectedValueOnce(new HttpNetworkError('Offline'));
    await owner.catalog.paging.reload();
    await expect.element(page.getByRole('checkbox', { name: 'Select Alpha' })).toBeChecked();
    request.mockResolvedValueOnce(
        respond(
            response(intent({ mode: 'offset', current: 2, per_page: 2 }), {
                rows: [
                    { id: 3, name: 'Third' },
                    { id: 4, name: 'Fourth' },
                ],
            }),
        ),
    );
    await owner.catalog.paging.goToNext();
    await expect.element(page.getByTestId('selection-state')).toHaveTextContent('[]');
    request.mockResolvedValueOnce(respond(response()));
    await owner.catalog.paging.goToFirst();
    await expect.element(page.getByRole('checkbox', { name: 'Select Alpha' })).not.toBeChecked();
    expect(owner.emissions).toEqual([[]]);
});

test.each([false, true])(
    'fits nested RTL containers with translated labels and local dark branding, Tailwind %s',
    async (tailwind) => {
        const { createLocalization } = await import('../../resources/js/localization');
        const catalogs = {
            en: { sourceLocale: 'en', label: 'English', messages: {} },
            es: {
                sourceLocale: 'es',
                label: 'Español',
                messages: {
                    'front-awesome::data-view.table':
                        'Resultados tabulares para la revisión del inventario',
                    'front-awesome::data-view.loaded':
                        ':count registro cargado|:count registros cargados',
                },
            },
        };
        const lang = document.documentElement.lang;
        document.documentElement.lang = 'es';
        cleanups.push(() => {
            document.documentElement.lang = lang;
        });
        if (tailwind) {
            const { default: css } =
                await import('@artisan-toolbox/front-awesome/tailwind.css?inline');
            const style = document.createElement('style');
            style.textContent = css;
            document.head.append(style);
            cleanups.push(() => style.remove());
        }
        request.mockResolvedValueOnce(respond(response()));
        mount({ selection: 'multiple' }, (app, container) => {
            app.use(createLocalization({ version: 1, fallbackLocale: 'en', locales: catalogs }));
            container.dir = 'rtl';
            container.className = 'wa-dark';
            container.style.setProperty('--wa-color-brand-fill-normal', 'rgb(44, 79, 102)');
            container.style.width = '320px';
        });
        const button = page.getByRole('button', {
            name: 'Resultados tabulares para la revisión del inventario',
            pressed: true,
        });
        await expect.element(button).toBeVisible();
        await expect.element(page.getByText('2 registros cargados')).toBeVisible();
        const section = page.getByTestId('catalog').element();
        const host = section.parentElement;
        if (!host) throw new Error('Missing DataView host.');
        for (const width of [320, 375]) {
            host.style.width = width + 'px';
            const bounds = section.getBoundingClientRect();
            const overflow = [...section.querySelectorAll('*')]
                .filter(
                    (el) =>
                        !el.closest('table') &&
                        el.getBoundingClientRect().width !== 0 &&
                        (el.getBoundingClientRect().left < bounds.left - 1 ||
                            el.getBoundingClientRect().right > bounds.right + 1),
                )
                .map((el) => [el.tagName, el.className, el.getBoundingClientRect().width]);
            expect(section.scrollWidth, JSON.stringify(overflow)).toBeLessThanOrEqual(width + 1);
            expect(host.scrollWidth).toBeLessThanOrEqual(width + 1);
        }
        expect(getComputedStyle(section).direction).toBe('rtl');
        expect(getComputedStyle(button.element()).backgroundColor).toBe('rgb(44, 79, 102)');
        expect(request).toHaveBeenCalledTimes(1);
    },
);

test('discards an invalid saved reference and retains an explicit reset to defaults', async () => {
    const originalUrl = location.href;
    const saved = new URL(originalUrl);
    saved.searchParams.set('catalog.invalid-snapshot', 'broken');
    history.replaceState(history.state, '', saved.href);
    const replace = vi.spyOn(router, 'replace').mockImplementation((options) => {
        if (typeof options.url === 'string') history.replaceState(history.state, '', options.url);
        if (options.onFinish) Reflect.apply(options.onFinish, undefined, []);
    });
    cleanups.push(() => {
        replace.mockRestore();
        history.replaceState(history.state, '', originalUrl);
    });
    request.mockResolvedValue(
        respond({
            ...response(),
            browserState: {
                key: 'catalog',
                version: 'a'.repeat(64),
                expiration: { minutes: 240 },
            },
        }),
    );
    mount({ historyId: 'invalid-snapshot' });
    await expect.element(page.getByText('ALPHA', { exact: true })).toBeVisible();
    await expect
        .poll(() => new URL(location.href).searchParams.has('catalog.invalid-snapshot'))
        .toBe(false);
    expect(request).toHaveBeenCalledTimes(1);
    expect(JSON.parse(String(request.mock.calls[0]?.[0].data))).toEqual({ version: 2 });
    await page.getByRole('button', { name: 'Reset to source defaults' }).click();
    await expect.element(page.getByText('ALPHA', { exact: true })).toBeVisible();
    expect(request).toHaveBeenCalledTimes(2);
    expect(JSON.parse(String(request.mock.calls[1]?.[0].data))).toEqual({ version: 2 });
});

test('passes protocol-one rows and explicit authorized HTTP actions through a presentation slot', async () => {
    const legacy = corpus.successes[0];
    if (!legacy) throw new Error('The released protocol corpus must include the defaults.');
    const url = new URL('/dapter/actions/Catalog/refresh', location.origin).href;
    request.mockResolvedValueOnce(
        respond({
            ...legacy.response,
            actions: { refresh: { method: 'post', transports: ['http'], target: null, url } },
        }),
    );
    const root = document.createElement('div');
    document.body.append(root);
    const app = createApp({
        setup() {
            const adapter = useDataAdapter('Catalog', {
                decodeRow,
                actionDefinitions: defineActions({ refresh: { transports: ['http'] } }),
            });
            const outcome = shallowRef('');
            return () =>
                h(
                    DataView<typeof adapter>,
                    { adapter, rowKey: 'id', views: { list: {} } },
                    {
                        'list-item': ({ row }: { row: ReturnType<typeof decodeRow> }) => row.name,
                        actions: ({ adapter: live }: { adapter: typeof adapter }) =>
                            live.actions?.available.refresh
                                ? h(
                                      'button',
                                      {
                                          onClick: async () => {
                                              const result = await live.actions?.http(
                                                  'refresh',
                                                  {},
                                              );
                                              outcome.value = result?.status ?? '';
                                          },
                                      },
                                      'Refresh catalog',
                                  )
                                : null,
                        footer: () => h('output', outcome.value),
                    },
                );
        },
    });
    app.mount(root);
    cleanups.push(() => {
        app.unmount();
        root.remove();
    });
    await expect.element(page.getByText('Protocol compass')).toBeVisible();
    expect(page.getByRole('textbox', { name: 'Search results' }).query()).toBeNull();
    expect(request.mock.calls[0]?.[0].data).toBe('{"version":1}');
    request.mockResolvedValueOnce(respond({ refreshed: true }));
    await page.getByRole('button', { name: 'Refresh catalog' }).click();
    await expect.element(page.getByText('completed')).toBeVisible();
    expect(request.mock.calls[1]?.[0]).toMatchObject({ url, method: 'post' });
    expect(request).toHaveBeenCalledTimes(2);
});

test('keeps a departed key withdrawn when the selection controls are temporarily hidden', async () => {
    request.mockResolvedValueOnce(respond(response()));
    const owner = mount({ selection: 'multiple', prefill: [1], ignoreSelection: true });
    await expect.element(page.getByRole('checkbox', { name: 'Select Alpha' })).toBeChecked();
    owner.selectionMode = undefined;
    await nextTick();
    request.mockResolvedValueOnce(
        respond(
            response(intent({ mode: 'offset', current: 2, per_page: 2 }), {
                rows: [
                    { id: 3, name: 'Third' },
                    { id: 4, name: 'Fourth' },
                ],
            }),
        ),
    );
    await owner.catalog.paging.goToNext();
    request.mockResolvedValueOnce(respond(response()));
    await owner.catalog.paging.goToFirst();
    owner.selectionMode = 'multiple';
    await nextTick();
    expect(
        (page.getByRole('checkbox', { name: 'Select Alpha' }).element() as HTMLInputElement)
            .checked,
    ).toBe(false);
});

test('retires captured selection commands when a mode is disabled and later re-enabled', async () => {
    request.mockResolvedValueOnce(respond(response()));
    const owner = mount({ selection: 'multiple', captureScope: true });
    const first = page.getByRole('checkbox', { name: 'Select Alpha' });
    const second = page.getByRole('checkbox', { name: 'Select Beta' });
    await expect.element(first).toBeVisible();
    await page.getByRole('button', { name: 'Capture selection' }).click();
    const old = owner.saved;
    if (old?.mode !== 'multiple') throw new Error('Expected a captured multiple selection.');
    owner.selectionMode = undefined;
    await nextTick();
    owner.selectionMode = 'multiple';
    await first.click();
    const before = owner.emissions.length;
    old.clear();
    old.set(2, true);
    old.setAllLoaded(true);
    expect(owner.emissions.length).toBe(before);
    await expect.element(first).toBeChecked();
    await expect.element(second).not.toBeChecked();
    expect(request).toHaveBeenCalledTimes(1);
});

function hostForm() {
    const form = document.createElement('form');
    const save = document.createElement('button');
    save.type = 'submit';
    save.textContent = 'Save application';
    const submit = vi.fn((event: SubmitEvent) => event.preventDefault());
    form.addEventListener('submit', submit);
    form.append(save);
    document.body.append(form);
    cleanups.push(() => form.remove());
    return {
        form,
        submit,
        attach: (_app: App, container: HTMLDivElement) => form.append(container),
    };
}

test('retains focused infinite search editors while a cursor window is replaced', async () => {
    const cursor = intent({ mode: 'cursor', cursor: null, per_page: 2 });
    request.mockResolvedValueOnce(respond(response(cursor)));
    const owner = mount({ infinite: true });
    const toggle = page.getByRole('button', { name: 'Search and filters' });
    await toggle.click();
    const field = page.getByRole('textbox', { name: 'Search title' });
    const global = page.getByRole('textbox', { name: 'Search results' });
    await field.fill('unapplied');
    const delayed = deferred<HttpResponse>();
    request.mockReturnValue(delayed.promise);
    await global.click();
    await userEvent.keyboard('a');
    await expect.poll(() => owner.catalog.ready).toBe(false);
    await userEvent.keyboard('bcdef');
    await expect.element(global).toHaveValue('abcdef');
    expect(global.element().matches(':focus')).toBe(true);
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect.element(field).toHaveValue('unapplied');
    await field.click();
    await userEvent.keyboard('{End} title{Enter}');
    await expect
        .poll(() => owner.catalog.requested?.fields.title?.search?.value)
        .toBe('unapplied title');
    await userEvent.keyboard(' draft');
    const applied = owner.catalog.requested;
    if (applied?.version !== 2) throw new Error('Missing cursor search intent.');
    delayed.resolve(respond(response(applied)));
    await expect.poll(() => owner.catalog.ready).toBe(true);
    await expect.element(field).toHaveValue('unapplied title draft');
    expect(field.element().matches(':focus')).toBe(true);
    request.mockResolvedValueOnce(respond(response(cursor)));
    await owner.catalog.resetContext();
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();
    await expect.element(field).toHaveValue('');
});

test('keeps search and jump commands inside an enclosing application form', async () => {
    const { submit, attach } = hostForm();
    request.mockImplementation(async (config) =>
        respond(response(JSON.parse(String(config.data)).state)),
    );
    const owner = mount({}, attach);
    const global = page.getByRole('textbox', { name: 'Search results' });
    await global.fill('desk');
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => owner.catalog.status).toBe('success');
    expect(request).toHaveBeenCalledTimes(2);
    await page.getByRole('button', { name: 'Search and filters' }).click();
    const field = page.getByRole('textbox', { name: 'Search title' });
    await field.fill('chair');
    const composing = new KeyboardEvent('keydown', {
        key: 'Enter',
        isComposing: true,
        bubbles: true,
        composed: true,
        cancelable: true,
    });
    field.element().dispatchEvent(composing);
    expect(composing.defaultPrevented).toBe(false);
    await nextTick();
    expect(owner.catalog.requested?.fields.title).toBeUndefined();
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => owner.catalog.requested?.fields.title?.search?.value).toBe('chair');
    await expect.poll(() => owner.catalog.status).toBe('success');
    expect(request).toHaveBeenCalledTimes(3);
    await page.getByRole('spinbutton', { name: 'Go to page' }).fill('2');
    await userEvent.keyboard('{Enter}{Tab}');
    await expect.element(page.getByText('Page 2 of 3')).toBeVisible();
    expect(request).toHaveBeenCalledTimes(4);
    expect(submit).not.toHaveBeenCalled();
    await page.getByRole('button', { name: 'Save application' }).click();
    expect(submit).toHaveBeenCalledTimes(1);
});

test('keeps a rejected controlled selection out of every occurrence and action scope', async () => {
    request.mockResolvedValueOnce(respond(response()));
    const owner = mount({
        selection: 'multiple',
        prefill: [],
        ignoreSelection: true,
        captureScope: true,
    });
    const alpha = page.getByRole('checkbox', { name: 'Select Alpha' });
    const all = page.getByRole('checkbox', { name: 'Select all loaded rows' });
    await alpha.click();
    expect(owner.emissions).toEqual([[1]]);
    await expect.element(page.getByTestId('selection-state')).toHaveTextContent('[]');
    await expect.element(alpha).not.toBeChecked();
    await alpha.click();
    expect(owner.emissions).toEqual([[1], [1]]);
    owner.model = [];
    await nextTick();
    await expect.element(alpha).not.toBeChecked();
    await page.getByRole('button', { name: 'Capture selection' }).click();
    const scope = owner.saved;
    if (scope?.mode !== 'multiple') throw new Error('Missing multiple selection.');
    scope.setAllLoaded(true);
    scope.setAllLoaded(true);
    expect(owner.emissions).toEqual([[1], [1], [1, 2]]);
    expect(scope.has(1)).toBe(false);
    owner.model = [2];
    await nextTick();
    await all.click();
    expect((all.element() as HTMLInputElement).indeterminate).toBe(true);
    await expect.element(all).not.toBeChecked();
    owner.selectionMode = 'single';
    await nextTick();
    await page.getByRole('radio', { name: 'Select Alpha' }).click();
    await expect.element(page.getByRole('radio', { name: 'Select Beta' })).toBeChecked();
    await expect.element(page.getByRole('radio', { name: 'Select Alpha' })).not.toBeChecked();
    await expect.element(page.getByTestId('selection-state')).toHaveTextContent('[2] Beta');
    expect(request).toHaveBeenCalledTimes(1);
});

test('keeps native row radio groups independent across Vue apps inside the same form', async () => {
    const { form, attach } = hostForm();
    request.mockResolvedValue(respond(response()));
    const first = mount({ selection: 'single' }, attach);
    mount({ selection: 'single' }, attach);
    const alpha = page.getByRole('radio', { name: 'Select Alpha' });
    await alpha.nth(0).click();
    await alpha.nth(1).click();
    const toggles = [...form.querySelectorAll<HTMLButtonElement>('button[aria-controls]')];
    expect(toggles).toHaveLength(4);
    for (const toggle of toggles) {
        expect(toggle.ariaControlsElements).toEqual([toggle.nextElementSibling]);
    }
    const ids = [...form.querySelectorAll('[id]')].map((element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
    await expect.element(alpha.nth(0)).toBeChecked();
    await expect.element(alpha.nth(1)).toBeChecked();
    await userEvent.keyboard('{ArrowDown}');
    await expect
        .element(page.getByRole('radio', { name: 'Select Beta', checked: true }))
        .toBeVisible();
    await expect.element(alpha.nth(0)).toBeChecked();
    expect([...new FormData(form)]).toEqual([]);
    expect((alpha.nth(0).element() as HTMLInputElement).form).toBeNull();
    first.selectionMode = 'multiple';
    await nextTick();
    expect(
        (page.getByRole('checkbox', { name: 'Select Alpha' }).element() as HTMLInputElement).form,
    ).toBeNull();
    expect(
        (
            page
                .getByRole('checkbox', { name: 'Select all loaded rows' })
                .element() as HTMLInputElement
        ).form,
    ).toBeNull();
    expect([...new FormData(form)]).toEqual([]);
});

test('displays no preset when the table header requests manual ordering', async () => {
    request.mockImplementation(async (config) =>
        respond(response(JSON.parse(String(config.data)).state)),
    );
    const owner = mount();
    await page.getByRole('button', { name: 'Name', exact: true }).click();
    await expect.poll(() => owner.catalog.requested?.order.kind).toBe('fields');
    await expect
        .element(page.getByRole('combobox', { name: 'Order preset' }))
        .toHaveValue('No preset');
});
