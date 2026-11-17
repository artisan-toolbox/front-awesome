import { http, HttpNetworkError, type HttpRequestConfig, type HttpResponse } from '@inertiajs/core';
import { afterEach, beforeEach, expect, test, vi } from 'vite-plus/test';
import { page, userEvent } from 'vitest/browser';
import { createApp, nextTick } from 'vue';
import Fixture from './DataViewFixture.vue';
import { intent, response } from './data-view-fixtures';
import '@artisan-toolbox/front-awesome/web-awesome.css';
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
function mount(props: InstanceType<typeof Fixture>['$props'] = {}) {
    const container = document.createElement('div');
    document.body.append(container);
    const app = createApp(Fixture, { ...props });
    const instance = app.mount(container);
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
        [...selector.querySelectorAll('wa-button')].map((button) => button.textContent?.trim()),
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
    await choose('Order results', 'Featured');
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
