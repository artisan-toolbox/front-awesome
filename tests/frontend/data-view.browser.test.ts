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
import {
    DataView,
    DataViewStatus,
    DataViewPagination,
} from '@artisan-toolbox/front-awesome/data-view';
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
async function openOptionsSection(section: 'Sort' | 'Filters' | 'Search' | 'Page settings') {
    await page
        .getByTestId('catalog')
        .getByRole('button', { name: 'View options', exact: true })
        .click();
    await expect
        .element(page.getByRole('dialog', { name: 'View options', exact: true }))
        .toBeVisible();
    await page.getByRole('button', { name: section, exact: true }).click();
}
async function chooseLayout(layout: 'Table' | 'Grid' | 'List') {
    const choice = page
        .getByTestId('catalog')
        .getByRole('group', { name: 'Results layout' })
        .getByRole('button', { name: layout, exact: true });
    await choice.click();
    await expect.element(choice).toHaveAttribute('aria-pressed', 'true');
}
test('keeps the exact shared handle and pending read when switching layouts with real controls', async () => {
    const pending = deferred<HttpResponse>();
    request.mockReturnValueOnce(pending.promise);
    mount({ shared: true });
    await expect.poll(() => request.mock.calls.length).toBe(1);
    await chooseLayout('Grid');
    pending.resolve(respond(response()));
    await expect
        .element(page.getByTestId('view-state'))
        .toHaveTextContent('grid success same handle');
    await expect.element(page.getByText('Alpha card')).toBeVisible();
    await expect.element(page.getByText('Shared Alpha')).toBeVisible();
    await chooseLayout('Table');
    await expect.element(page.getByRole('cell', { name: 'ALPHAAlpha' })).toBeVisible();
    await expect.element(page.getByRole('cell', { name: 'Product 1' })).toBeVisible();
    await chooseLayout('List');
    await expect.element(page.getByText('Alpha list')).toBeVisible();
    expect(request).toHaveBeenCalledTimes(1);
});
test.each([
    { hideHeader: true, hideFooter: false },
    { hideHeader: false, hideFooter: true },
    { hideHeader: true, hideFooter: true },
])(
    'composes independent regions in a narrow results panel ($hideHeader, $hideFooter)',
    async (regions) => {
        request.mockResolvedValue(respond(response()));
        mount(
            { ...regions, customToolbar: true, customFilters: true, selection: 'multiple' },
            (_, host) => {
                host.style.width = '284px';
            },
        );
        const catalog = page.getByTestId('catalog');
        await expect.element(catalog.getByRole('cell', { name: 'ALPHAAlpha' })).toBeVisible();
        expect(catalog.element().textContent?.includes('Custom toolbar')).toBe(!regions.hideHeader);
        expect(catalog.element().textContent?.includes('Custom filters')).toBe(!regions.hideHeader);
        expect(catalog.element().querySelector('[aria-label="Results layout"]') !== null).toBe(
            !regions.hideHeader,
        );
        expect(catalog.element().querySelector('[data-testid="view-state"]') !== null).toBe(
            !regions.hideFooter,
        );
        await catalog.getByRole('checkbox', { name: 'Select Alpha' }).click();
        await expect.element(catalog.getByRole('checkbox', { name: 'Select Alpha' })).toBeChecked();
        expect(catalog.element().scrollWidth).toBeLessThanOrEqual(catalog.element().clientWidth);
        expect(request).toHaveBeenCalledTimes(1);
    },
);

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

test.each(['s', 'm', 'l'] as const)(
    'aligns %s header controls and gives the layout switch its own row in narrow embeds',
    async (size) => {
        request.mockResolvedValueOnce(
            respond(
                response(intent({ mode: 'offset', current: 2, per_page: 3 }), {
                    rows: [
                        { id: 4, name: 'Delta' },
                        { id: 5, name: 'Echo' },
                        { id: 6, name: 'Foxtrot' },
                    ],
                }),
            ),
        );
        mount({ size }, (_app, host) => {
            host.style.width = '860px';
        });
        await expect
            .element(page.getByRole('button', { name: 'View options', exact: true }))
            .toBeVisible();
        const view = page.getByTestId('catalog').element();
        const search = view.querySelector('wa-input');
        await customElements.whenDefined('wa-input');
        await expect.poll(() => !!search?.shadowRoot?.querySelector('[part~="base"]')).toBe(true);
        const input = search?.shadowRoot?.querySelector('[part~="base"]');
        if (!input || !view.parentElement) throw new Error('Missing visible search field or host.');
        const controls = [
            input,
            ...view.querySelectorAll('header .panel-trigger, header .data-view-layouts'),
        ];
        expect(controls).toHaveLength(3);
        await expect
            .poll(() => {
                const rectangles = controls.map((el) => el.getBoundingClientRect());
                return rectangles.map(
                    (box) =>
                        Math.abs(box.top - rectangles[0].top) <= 1 &&
                        Math.abs(box.height - rectangles[0].height) <= 1,
                );
            })
            .toEqual([true, true, true]);
        await page.getByRole('textbox', { name: 'Search results' }).click();
        const focusStyle = getComputedStyle(input);
        const focusExtent =
            parseFloat(focusStyle.outlineWidth) + parseFloat(focusStyle.outlineOffset);
        expect(focusExtent).toBeGreaterThan(0);
        const wide = controls.map((el) => el.getBoundingClientRect());
        const chips = page.getByRole('group', { name: 'Applied criteria' });
        const chip = chips.getByRole('button', { name: /Remove Rows per page.*3/ });
        await expect.element(chip).toBeVisible();
        expect(chips.getByRole('button').all()).toHaveLength(1);
        const wideChip = chip.element().getBoundingClientRect();
        expect(wideChip.top - wide[0].bottom - focusExtent).toBeGreaterThanOrEqual(4);
        expect(wideChip.left).toBeCloseTo(wide[0].left, 0);
        const toolbar = controls[2].parentElement;
        if (!toolbar) throw new Error('Missing layout toolbar.');
        expect(wide[2].right).toBeCloseTo(toolbar.getBoundingClientRect().right, 0);
        view.parentElement.style.width = '284px';
        const narrow = controls.map((el) => el.getBoundingClientRect());
        expect(narrow[0].width).toBeGreaterThan(narrow[1].width);
        expect(narrow[1].left).toBeGreaterThanOrEqual(narrow[0].right);
        expect(narrow[1].top).toBeCloseTo(narrow[0].top, 0);
        expect(narrow[2].top).toBeGreaterThanOrEqual(narrow[0].bottom);
        expect(narrow[2].left).toBeCloseTo(narrow[0].left, 0);
        expect(narrow[2].right).toBeCloseTo(narrow[1].right, 0);
        const narrowChip = chip.element().getBoundingClientRect();
        expect(narrowChip.top - narrow[0].bottom - focusExtent).toBeGreaterThanOrEqual(4);
        expect(narrowChip.left).toBeCloseTo(narrow[0].left, 0);
        expect(view.scrollWidth).toBeLessThanOrEqual(view.clientWidth);
        expect(request).toHaveBeenCalledTimes(1);
    },
);

test('scrolls sorting fields independently of the close action and aligns the order actions', async () => {
    const originalSize = [window.innerWidth, window.innerHeight] as const;
    await page.viewport(960, 440);
    onTestFinished(() => page.viewport(...originalSize));
    request.mockResolvedValueOnce(respond(response()));
    mount({}, (app, host) => {
        host.style.width = '820px';
        app.use(createFrontAwesome({ scrollbar: { defaultVariant: 'brand' } }));
    });
    const trigger = page.getByRole('button', { name: 'View options', exact: true });
    await openOptionsSection('Sort');
    const region = page.getByRole('region', { name: 'View options', exact: true });
    await expect.element(region).toHaveAttribute('data-fa-scrollbar', 'brand');
    const scroll = region.element();
    await expect.poll(() => scroll.scrollHeight > scroll.clientHeight).toBe(true);
    const actions = [...scroll.querySelectorAll('.order-actions wa-button')];
    expect(actions.length).toBeGreaterThan(1);
    const bounds = actions.map((button) => button.getBoundingClientRect());
    for (const [index, button] of bounds.slice(1).entries()) {
        expect(button.left).toBeCloseTo(bounds[0].left, 0);
        expect(button.width).toBeCloseTo(bounds[0].width, 0);
        expect(button.top).toBeGreaterThan(bounds[index].bottom);
    }
    const close = page.getByRole('button', { name: 'Done' });
    const footerTop = close.element().getBoundingClientRect().top;
    scroll.scrollTop = scroll.scrollHeight;
    expect(scroll.scrollTop).toBeGreaterThan(0);
    expect(close.element().getBoundingClientRect().top).toBeCloseTo(footerTop, 0);
    await close.click();
    await expect.element(trigger).toHaveFocus();
    expect(request).toHaveBeenCalledTimes(1);
});

function viewportResult(current: 1 | 2, query = '') {
    const total = 13;
    const perPage = 12;
    const matching = query ? 1 : total;
    const state = intent({ mode: 'offset', current, per_page: perPage });
    const rows = Array.from(
        { length: Math.min(perPage, matching - (current - 1) * perPage) },
        (_, index) => {
            const id = (current - 1) * perPage + index + 1;
            return { id, name: `Record ${id}` };
        },
    );
    const result = response(query ? { ...state, global: { search: { value: query } } } : state, {
        rows,
    });
    return {
        ...result,
        capabilities: {
            ...result.capabilities,
            paging: { mode: 'offset', per_page: perPage, per_page_options: [perPage] },
        },
        paging: {
            ...result.paging,
            pages: Math.ceil(matching / perPage),
            filtered: matching,
            total,
            has_next: current * perPage < matching,
        },
    };
}
async function scrollFixture(
    surface: 'nested' | 'document',
    { shared = false, nativeAnchoring = false } = {},
) {
    const originalSize = [window.innerWidth, window.innerHeight] as const;
    await page.viewport(1000, 620);
    onTestFinished(() => page.viewport(...originalSize));
    const scrollport = document.createElement('div');
    const documentScroller = document.scrollingElement;
    if (!(documentScroller instanceof HTMLElement))
        throw new Error('Missing document scroll container');
    const originalAnchor = documentScroller.style.overflowAnchor;
    const anchoring = nativeAnchoring ? 'auto' : 'none';
    documentScroller.style.overflowAnchor = anchoring;
    scrollport.style.cssText =
        surface === 'nested' ? 'height: 420px; width: 860px; overflow: auto' : 'width: 860px';
    scrollport.style.overflowAnchor = anchoring;
    document.body.append(scrollport);
    cleanups.push(() => {
        scrollport.remove();
        documentScroller.style.overflowAnchor = originalAnchor;
        window.scrollTo(0, 0);
    });
    const owner = mount({ shared }, (_app, host) => {
        // Leave room at both ends so the browser can keep either page's footer at the same offset.
        host.style.paddingBlock = '1000px 2600px';
        scrollport.append(host);
    });
    return { owner, scroller: surface === 'nested' ? scrollport : documentScroller };
}
const afterPaint = () =>
    new Promise<void>((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
test.each([
    { surface: 'document', nativeAnchoring: true },
    { surface: 'document', nativeAnchoring: false },
    { surface: 'nested', nativeAnchoring: false },
] as const)(
    'keeps the activated footer in place after a shorter final page in a $surface scroller with native anchoring $nativeAnchoring',
    async ({ surface, nativeAnchoring }) => {
        request.mockResolvedValueOnce(respond(viewportResult(1)));
        const { scroller } = await scrollFixture(surface, { nativeAnchoring });
        const next = page.getByRole('button', { name: 'Next page', exact: true });
        await expect.element(next).toBeEnabled();
        next.element().scrollIntoView({ block: 'center', behavior: 'instant' });
        await afterPaint();
        const before = next.element().getBoundingClientRect().top;
        const beforeScroll = scroller.scrollTop;
        const outside = window.scrollY;
        request.mockResolvedValueOnce(respond(viewportResult(2)));
        await next.click();
        await expect.element(page.getByText('13–13 of 13 records')).toBeVisible();
        await afterPaint();
        expect(Math.abs(next.element().getBoundingClientRect().top - before)).toBeLessThanOrEqual(
            3,
        );
        expect(scroller.scrollTop).toBeLessThan(beforeScroll - 100);
        if (surface === 'nested') expect(window.scrollY).toBe(outside);
        expect(request).toHaveBeenCalledTimes(2);
    },
);
test('keeps the active search header in place when the shared view above it shrinks', async () => {
    request.mockResolvedValueOnce(respond(viewportResult(1)));
    await scrollFixture('document', { shared: true });
    const search = page
        .getByRole('region', { name: 'Shared catalog' })
        .getByRole('textbox', { name: 'Search results' });
    await expect.element(search).toBeVisible();
    search.element().scrollIntoView({ block: 'center', behavior: 'instant' });
    await afterPaint();
    const before = search.element().getBoundingClientRect().top;
    const pending = deferred<HttpResponse>();
    request.mockReturnValueOnce(pending.promise);
    await search.fill('Record 1');
    await expect.poll(() => request.mock.calls.length).toBe(2);
    pending.resolve(respond(viewportResult(1, 'Record 1')));
    await expect
        .element(
            page
                .getByRole('region', { name: 'Shared catalog' })
                .getByText('1–1 of 1 match · 13 total'),
        )
        .toBeVisible();
    await afterPaint();
    expect(Math.abs(search.element().getBoundingClientRect().top - before)).toBeLessThanOrEqual(3);
    expect(search.element().matches(':focus')).toBe(true);
    expect(request).toHaveBeenCalledTimes(2);
});
test('leaves the other scroll container alone when a sibling pages the same owner', async () => {
    request.mockResolvedValueOnce(respond(viewportResult(1)));
    const { owner, scroller } = await scrollFixture('nested');
    scroller.style.height = '240px';
    const sibling = document.createElement('div');
    sibling.style.cssText = scroller.style.cssText;
    scroller.after(sibling);
    const contents = document.createElement('div');
    contents.style.paddingBlock = '1000px 2600px';
    sibling.append(contents);
    const app = createApp({
        setup: () => () =>
            h(DataView<typeof owner.catalog>, {
                adapter: owner.catalog,
                rowKey: 'id',
                label: 'Borrowed records',
                views: { table: { columns: [{ field: 'name', label: 'Name' }] } },
            }),
    });
    app.mount(contents);
    cleanups.push(() => {
        app.unmount();
        sibling.remove();
    });
    const borrowed = page.getByRole('region', { name: 'Borrowed records', exact: true });
    const passive = borrowed.getByRole('button', { name: 'Next page', exact: true });
    const next = page
        .getByTestId('catalog')
        .getByRole('button', { name: 'Next page', exact: true });
    await expect.element(passive).toBeEnabled();
    passive.element().scrollIntoView({ block: 'center', behavior: 'instant' });
    passive.element().focus({ preventScroll: true });
    next.element().scrollIntoView({ block: 'center', behavior: 'instant' });
    await afterPaint();
    const passiveScroll = sibling.scrollTop;
    const passiveTop = passive.element().getBoundingClientRect().top;
    expect(passiveTop).toBeGreaterThan(0);
    expect(passiveTop).toBeLessThan(window.innerHeight);
    request.mockResolvedValueOnce(respond(viewportResult(2)));
    await next.click();
    await expect.element(borrowed.getByText('13–13 of 13 records')).toBeVisible();
    await afterPaint();
    expect(sibling.scrollTop).toBe(passiveScroll);
    expect(passive.element().getBoundingClientRect().top).toBeLessThan(passiveTop - 100);
    expect(request).toHaveBeenCalledTimes(2);
});
test('honors scrolling away from the footer while a read is pending', async () => {
    request.mockResolvedValueOnce(respond(viewportResult(1)));
    const { scroller } = await scrollFixture('nested');
    const next = page.getByRole('button', { name: 'Next page', exact: true });
    await expect.element(next).toBeEnabled();
    next.element().scrollIntoView({ block: 'center', behavior: 'instant' });
    await afterPaint();
    const pending = deferred<HttpResponse>();
    request.mockReturnValueOnce(pending.promise);
    await next.click();
    await expect.poll(() => request.mock.calls.length).toBe(2);
    const prior = scroller.scrollTop;
    const scrolling = new Promise<void>((resolve) =>
        scroller.addEventListener('scrollend', () => resolve(), { once: true }),
    );
    await userEvent.keyboard('{PageDown}');
    await expect.poll(() => scroller.scrollTop).toBeGreaterThan(prior + 100);
    await scrolling;
    const chosen = scroller.scrollTop;
    pending.resolve(respond(viewportResult(2)));
    await expect.element(page.getByText('13–13 of 13 records')).toBeVisible();
    await afterPaint();
    expect(scroller.scrollTop).toBe(chosen);
});
test('leaves the viewport alone on first load and external paging even with focus in the footer', async () => {
    const initial = deferred<HttpResponse>();
    request.mockReturnValueOnce(initial.promise);
    const { owner, scroller } = await scrollFixture('nested');
    scroller.scrollTop = 800;
    await afterPaint();
    const initialScroll = scroller.scrollTop;
    initial.resolve(respond(viewportResult(1)));
    const next = page.getByRole('button', { name: 'Next page', exact: true });
    await expect.element(next).toBeEnabled();
    await afterPaint();
    expect(scroller.scrollTop).toBe(initialScroll);
    next.element().scrollIntoView({ block: 'center', behavior: 'instant' });
    next.element().focus({ preventScroll: true });
    await afterPaint();
    const before = scroller.scrollTop;
    request.mockResolvedValueOnce(respond(viewportResult(2)));
    await owner.catalog.paging.goToNext();
    await expect.element(page.getByText('13–13 of 13 records')).toBeVisible();
    await afterPaint();
    expect(scroller.scrollTop).toBe(before);
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

    await chooseLayout('Grid');
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
        await expect
            .element(page.getByText('2 records on this page', { exact: true }))
            .toBeVisible();
        expect(document.querySelector('wa-pagination')).toBeNull();
        expect(request).toHaveBeenCalledTimes(1);
        await expect
            .element(page.getByRole('spinbutton', { name: 'Go to page' }))
            .not.toBeInTheDocument();
    },
);
test.each(['simple', 'cursor'] as const)(
    'retries the same %s boundary after a network failure',
    async (mode) => {
        const first = intent(
            mode === 'simple'
                ? { mode, current: 1, per_page: 2 }
                : { mode, cursor: null, per_page: 2 },
        );
        request.mockResolvedValueOnce(respond(response(first)));
        const owner = mount();
        const next = page.getByRole('button', { name: 'Next', exact: true });
        await expect.element(next).toBeEnabled();
        request.mockRejectedValueOnce(new HttpNetworkError('Offline'));
        await next.click();
        await expect.poll(() => owner.catalog.status).toBe('error');
        const second = intent(
            mode === 'simple'
                ? { mode, current: 2, per_page: 2 }
                : { mode, cursor: 'next-token', per_page: 2 },
        );
        request.mockResolvedValueOnce(
            respond(response(second, { rows: [{ id: 3, name: 'Third' }], next: false })),
        );
        await next.click();
        await expect.element(page.getByText('THIRD', { exact: true })).toBeVisible();
        expect(request.mock.calls[2]?.[0].data).toEqual(request.mock.calls[1]?.[0].data);
        expect(request).toHaveBeenCalledTimes(3);
    },
);
test('moves back from the accepted simple page after the next page failed', async () => {
    const at = (current: number) => intent({ mode: 'simple', current, per_page: 2 });
    request.mockResolvedValueOnce(respond(response(at(3))));
    const owner = mount();
    const navigation = page.getByRole('navigation', { name: 'Results pagination' });
    await expect.element(navigation.getByText('Page 3')).toBeVisible();
    request.mockRejectedValueOnce(new HttpNetworkError('Offline'));
    await page.getByRole('button', { name: 'Next', exact: true }).click();
    await expect.poll(() => owner.catalog.status).toBe('error');
    request.mockResolvedValueOnce(respond(response(at(2))));
    await page.getByRole('button', { name: 'Previous', exact: true }).click();
    await expect.element(navigation.getByText('Page 2')).toBeVisible();
    expect(request.mock.calls[1]?.[0].data).toContain('"current":4');
    expect(request.mock.calls[2]?.[0].data).toContain('"current":2');
    expect(request).toHaveBeenCalledTimes(3);
});

test('shows two numbered neighbors on each side of an accepted page and switches to compact navigation when narrow', async () => {
    const five = response(intent({ mode: 'offset', current: 5, per_page: 2 }));
    request.mockResolvedValueOnce(
        respond({
            ...five,
            paging: {
                ...five.paging,
                total: 20,
                filtered: 20,
                pages: 10,
                has_next: true,
                has_previous: true,
            },
        }),
    );
    mount({}, (_app, host) => {
        host.style.width = '1080px';
    });
    const nav = page.getByRole('navigation', { name: 'Results pagination', exact: true });
    const current = nav.getByRole('button', { name: '5', exact: true });
    await expect.element(current).toHaveAttribute('aria-current', 'page');
    expect(
        nav
            .getByRole('button')
            .all()
            .map((button) => button.element().textContent.trim())
            .filter(Boolean),
    ).toEqual(['1', '3', '4', '5', '6', '7', '10']);
    expect(nav.getByRole('button', { name: /jump/i }).all()).toHaveLength(2);
    const host = page.getByTestId('catalog').element().parentElement;
    if (!host) throw new Error('Missing pager host.');
    host.style.width = '300px';
    await expect
        .element(nav.getByText('5 of 10', { exact: true }))
        .toHaveAttribute('aria-current', 'page');
    await expect.element(nav.getByRole('button', { name: 'Next page' })).toBeEnabled();
    expect(request).toHaveBeenCalledTimes(1);
});
test('navigates a numbered page once with the keyboard and keeps the accepted range after a timeout', async () => {
    const initial = response();
    initial.paging.total = 1030;
    initial.paging.filtered = 5;
    request.mockResolvedValueOnce(respond(initial));
    const owner = mount({}, (_app, container) => {
        container.style.width = '700px';
    });
    const summary = page.getByText('1–2 of 5 matches · 1,030 total', { exact: true });
    await expect.element(summary).toBeVisible();
    const navigation = page.getByRole('navigation', { name: 'Results pagination' });
    const second = navigation.getByRole('button', { name: '2', exact: true });
    const first = navigation.getByRole('button', { name: '1', exact: true });
    await expect.element(navigation).toBeVisible();
    expect(navigation.all()).toHaveLength(1);
    await expect.element(second).toBeVisible();
    await expect
        .element(page.getByRole('button', { name: 'Page settings', exact: true }))
        .not.toBeInTheDocument();
    await expect
        .element(page.getByRole('button', { name: 'View options', exact: true }))
        .toBeVisible();
    const pending = deferred<HttpResponse>();
    request.mockReturnValueOnce(pending.promise);
    second.element().focus();
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => request.mock.calls.length).toBe(2);
    await expect.element(first).toHaveAttribute('aria-current', 'page');
    await expect.element(summary).toBeVisible();
    expect(request.mock.calls[1]?.[0].data).toContain('"current":2');
    pending.resolve(
        respond(
            {
                version: 2,
                error: {
                    kind: 'server',
                    code: 'gateway_timeout',
                    message: 'The source timed out.',
                },
            },
            504,
        ),
    );
    await expect.poll(() => owner.catalog.status).toBe('error');
    await expect.element(first).toHaveAttribute('aria-current', 'page');
    await expect.element(summary).toBeVisible();
    expect(second.element().matches(':focus')).toBe(true);
    const accepted = response(intent({ mode: 'offset', current: 2, per_page: 2 }));
    accepted.paging.filtered = 5;
    accepted.paging.total = 1030;
    request.mockResolvedValueOnce(respond(accepted));
    await userEvent.keyboard('{Enter}');
    await expect.element(second).toHaveAttribute('aria-current', 'page');
    await expect.element(page.getByText('3–4 of 5 matches · 1,030 total')).toBeVisible();
    expect(request).toHaveBeenCalledTimes(3);
    const final = response(intent({ mode: 'offset', current: 3, per_page: 2 }), {
        rows: [{ id: 5, name: 'Last record' }],
    });
    final.paging.filtered = 5;
    final.paging.total = 1030;
    request.mockResolvedValueOnce(respond(final));
    await navigation.getByRole('button', { name: '3', exact: true }).click();
    await expect.element(page.getByText('5–5 of 5 matches · 1,030 total')).toBeVisible();
    await expect.element(navigation.getByRole('button', { name: 'Next page' })).toBeDisabled();
    expect(request).toHaveBeenCalledTimes(4);
});

test.each([
    { total: 0, filtered: 0, rows: [], summary: 'No records yet' },
    { total: 8, filtered: 0, rows: [], summary: 'No matching records' },
    { total: 1, filtered: 1, rows: [{ id: 1, name: 'One' }], summary: '1–1 of 1 record' },
])(
    'keeps settings for a single page with "$summary"',
    async ({ total, filtered, rows, summary }) => {
        const result = response(intent(), { rows });
        request.mockResolvedValueOnce(
            respond({
                ...result,
                paging: { ...result.paging, total, filtered, pages: 1, has_next: false },
            }),
        );
        mount();
        await expect.element(page.getByText(summary)).toBeVisible();
        await expect
            .element(page.getByRole('navigation', { name: 'Results pagination' }))
            .not.toBeInTheDocument();
        await openOptionsSection('Page settings');
        await expect.element(page.getByRole('combobox', { name: 'Rows per page' })).toBeVisible();
        await expect
            .element(page.getByRole('spinbutton', { name: 'Go to page' }))
            .not.toBeInTheDocument();
        expect(request).toHaveBeenCalledTimes(1);
    },
);

test.each(['s', 'm', 'l'] as const)(
    'resizes standalone %s paging settings and keeps native navigation and trigger aligned',
    async (size) => {
        const { createLocalization } = await import('../../resources/js/localization');
        const originalLang = document.documentElement.lang;
        const portuguese = size !== 'm';
        const lang = portuguese ? 'pt-BR' : 'es';
        const labels = portuguese
            ? { pagination: 'Paginação dos resultados', pageSettings: 'Opções de página' }
            : { pagination: 'Paginación de resultados', pageSettings: 'Opciones de página' };
        const catalogs = {
            [lang]: {
                sourceLocale: lang,
                label: lang,
                messages: {
                    'front-awesome::data-view.pageSettings': labels.pageSettings,
                    'front-awesome::data-view.pagination': labels.pagination,
                },
            },
        };
        document.documentElement.lang = lang;
        const container = document.createElement('div');
        container.style.width = '300px';
        document.body.append(container);
        request.mockResolvedValueOnce(respond(response()));
        const app = createApp({
            setup() {
                const adapter = useDataAdapter('Catalog', {
                    protocol: 2,
                    paging: 'source',
                    url: false,
                });
                return () => h(DataViewPagination, { adapter, size });
            },
        });
        app.use(createLocalization({ version: 1, fallbackLocale: lang, locales: catalogs }));
        app.mount(container);
        cleanups.push(() => {
            app.unmount();
            container.remove();
            document.documentElement.lang = originalLang;
        });
        const settings = page.getByRole('button', { name: labels.pageSettings, exact: true });
        const navigation = page.getByRole('navigation', { name: labels.pagination, exact: true });
        const next = navigation.getByRole('button', {
            name: portuguese ? 'Próxima página' : 'Página siguiente',
            exact: true,
        });
        const previous = navigation.getByRole('button', { name: 'Página anterior', exact: true });
        await expect.element(settings).toHaveAttribute('aria-haspopup', 'dialog');
        await expect.element(next).toBeVisible();
        await expect.element(previous).toBeDisabled();
        await expect
            .element(navigation.getByText('1 de 3', { exact: true }))
            .toHaveAttribute('aria-current', 'page');
        const box = (element: Element) => element.getBoundingClientRect();
        expect(box(settings.element()).width).toBeCloseTo(box(container).width, 0);
        expect(box(next.element()).height).toBeCloseTo(box(settings.element()).height, 0);
        expect(box(previous.element()).left - box(container).left).toBeCloseTo(
            box(container).right - box(next.element()).right,
            0,
        );
        expect(box(settings.element()).top).toBeGreaterThanOrEqual(box(next.element()).bottom);
        await settings.click();
        const dialog = page.getByRole('dialog', { name: labels.pageSettings, exact: true });
        await expect.element(dialog).toBeVisible();
        await expect.element(page.getByRole('spinbutton', { name: 'Go to page' })).toBeVisible();
        await userEvent.keyboard('{Escape}');
        await expect.element(settings).toHaveFocus();
        container.style.width = '800px';
        await expect.element(settings).toHaveAttribute('aria-haspopup', 'dialog');
        await expect
            .element(navigation.getByRole('button', { name: '1', exact: true }))
            .toHaveAttribute('aria-current', 'page');
        expect(box(next.element()).height).toBeCloseTo(box(settings.element()).height, 0);
        expect(box(next.element()).top).toBeCloseTo(box(settings.element()).top, 0);
        await settings.click();
        await expect.element(dialog).toBeVisible();
        await expect.element(page.getByRole('combobox', { name: 'Rows per page' })).toBeVisible();
        await page.getByRole('button', { name: 'Done', exact: true }).click();
        await expect.element(settings).toHaveFocus();
        expect(request).toHaveBeenCalledTimes(1);
    },
);
test('lets a custom pagination slot replace navigation and its settings category', async () => {
    request.mockResolvedValueOnce(respond(response()));
    mount({ customPagination: true });
    await expect.element(page.getByText('Host pagination')).toBeVisible();
    await expect
        .element(page.getByRole('navigation', { name: 'Results pagination', exact: true }))
        .not.toBeInTheDocument();
    await openOptionsSection('Search');
    await expect
        .element(page.getByRole('button', { name: 'Page settings', exact: true }))
        .not.toBeInTheDocument();
    await expect
        .element(page.getByRole('spinbutton', { name: 'Go to page' }))
        .not.toBeInTheDocument();
    expect(request).toHaveBeenCalledTimes(1);
});
test('renders a standalone status and cursor navigation from one owner across a source reset', async () => {
    const result = response(intent({ mode: 'cursor', cursor: null, per_page: 2 }));
    const exact = {
        ...result,
        capabilities: {
            ...result.capabilities,
            paging: { ...result.capabilities.paging, counts: 'exact' },
        },
        paging: { ...result.paging, filtered: 30, total: 30 },
    };
    request.mockResolvedValueOnce(respond(exact));
    const container = document.createElement('div');
    document.body.append(container);
    const app = createApp({
        setup() {
            const adapter = useDataAdapter('Catalog', {
                protocol: 2,
                paging: 'source',
                url: false,
            });
            return () =>
                h('div', [
                    h('header', [h(DataViewStatus, { adapter })]),
                    h('footer', [h(DataViewPagination, { adapter })]),
                    h(
                        'button',
                        { type: 'button', onClick: () => adapter.resetContext() },
                        'Reset source',
                    ),
                ]);
        },
    });
    app.mount(container);
    cleanups.push(() => {
        app.unmount();
        container.remove();
    });
    const summary = page.getByText('2 records on this page · 30 matches');
    await expect.element(summary).toBeVisible();
    expect(summary.element().closest('header')).not.toBeNull();
    await expect.element(page.getByRole('button', { name: 'Next', exact: true })).toBeEnabled();
    expect(container.querySelector('wa-pagination')).toBeNull();
    expect(request).toHaveBeenCalledTimes(1);
    const pending = deferred<HttpResponse>();
    request.mockReturnValueOnce(pending.promise);
    await page.getByRole('button', { name: 'Reset source' }).click();
    await expect.element(page.getByText('Loading results…')).toBeVisible();
    await expect.element(summary).not.toBeInTheDocument();
    pending.resolve(respond(response()));
    await expect.element(page.getByText('1–2 of 6 records')).toBeVisible();
    expect(container.querySelector('wa-pagination')).not.toBeNull();
    expect(request).toHaveBeenCalledTimes(2);
});
test.each([{ hideHeader: true }, { customToolbar: true }])(
    'keeps page settings accessible when the built-in toolbar is replaced or hidden: %j',
    async (options) => {
        request.mockResolvedValueOnce(respond(response()));
        mount(options);
        await expect.element(page.getByRole('button', { name: 'Next page' })).toBeEnabled();
        await expect
            .element(page.getByRole('button', { name: 'View options' }))
            .not.toBeInTheDocument();
        const trigger = page.getByRole('button', { name: 'Page settings', exact: true });
        await trigger.click();
        await expect
            .element(page.getByRole('dialog', { name: 'Page settings', exact: true }))
            .toBeVisible();
        await expect.element(page.getByRole('spinbutton', { name: 'Go to page' })).toHaveValue(1);
        await userEvent.keyboard('{Escape}');
        await expect.element(trigger).toHaveFocus();
        expect(request).toHaveBeenCalledTimes(1);
    },
);
test('retains authorized rows on recoverable failure and removes them after access denial', async () => {
    request.mockResolvedValueOnce(respond(response()));
    mount();
    await expect.element(page.getByText('ALPHA', { exact: true })).toBeVisible();
    request.mockRejectedValueOnce(new HttpNetworkError('Offline'));
    await openOptionsSection('Page settings');
    await page.getByRole('button', { name: 'Reload', exact: true }).click();
    await expect
        .element(page.getByTestId('view-state'))
        .toHaveTextContent('table error same handle');
    const panel = page.getByRole('region', { name: 'View options' });
    await expect
        .element(panel.getByRole('alert'))
        .toHaveTextContent('The data source could not be reached.');
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
    await expect.element(page.getByText('2 records in view')).toBeVisible();
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
    await expect.element(page.getByText('3 records in view')).toBeVisible();
    expect(request).toHaveBeenCalledTimes(3);
});

test('keeps declaration order and emits the effective fallback when layouts or the external model change', async () => {
    request.mockResolvedValue(respond(response()));
    mount({ layoutChanges: true });
    await expect.element(page.getByText('ALPHA', { exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'Remove table layout' }).click();
    await expect.element(page.getByTestId('external-view')).toHaveTextContent('list');
    const selector = page.getByRole('group', { name: 'Results layout', exact: true }).element();
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
    await openOptionsSection('Page settings');
    await page.getByRole('spinbutton', { name: 'Go to page' }).fill('2');
    await userEvent.keyboard('{Tab}');
    await expect.poll(() => request.mock.calls.length).toBe(3);
    await expect.element(page.getByText('3–4 of 6 records')).toBeVisible();
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
    await openOptionsSection('Sort');
    await choose('Order preset', 'Featured');
    await page.getByRole('button', { name: 'Done' }).click();
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
    await openOptionsSection('Page settings');
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
    await expect.element(page.getByText('No records yet')).toBeVisible();
    const pending = deferred<HttpResponse>();
    request.mockReturnValueOnce(pending.promise);
    await openOptionsSection('Page settings');
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
    await chooseLayout('Grid');
    await expect
        .element(page.getByRole('checkbox', { name: 'Select Apricot', checked: true }))
        .toBeVisible();
    await chooseLayout('List');
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
    await expect.element(page.getByText('1–2 of 6 records')).toBeVisible();
    await openOptionsSection('Page settings');
    const options = page.getByRole('dialog', { name: 'View options', exact: true });
    await expect
        .element(options.getByRole('button', { name: 'Results layout', exact: true }))
        .not.toBeInTheDocument();
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
    await expect.element(page.getByText('3–4 of 6 records')).toBeVisible();
    await expect.element(jump).toBeEnabled();
    jump.element().focus();
    await userEvent.keyboard('{Escape}');
    await expect.element(jump).not.toBeInTheDocument();
    await expect
        .element(page.getByRole('button', { name: 'View options', exact: true }))
        .toHaveFocus();
    expect(request).toHaveBeenCalledTimes(2);
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
                    'front-awesome::data-view.recordRange':
                        ':first–:last de :number registro|:first–:last de :number registros',
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
        const many = response();
        request.mockResolvedValueOnce(
            respond({
                ...many,
                paging: { ...many.paging, pages: 5000, filtered: 10000, total: 10000 },
            }),
        );
        mount({ selection: 'multiple' }, (app, container) => {
            app.use(createLocalization({ version: 1, fallbackLocale: 'en', locales: catalogs }));
            container.dir = 'rtl';
            container.className = 'wa-dark';
            container.style.setProperty('--wa-color-brand-fill-normal', 'rgb(44, 79, 102)');
            container.style.width = '320px';
        });
        await expect.element(page.getByText('1–2 de 10.000 registros')).toBeVisible();
        const button = page.getByRole('button', {
            name: 'Resultados tabulares para la revisión del inventario',
            pressed: true,
        });
        await expect.element(button).toBeVisible();
        expect(getComputedStyle(button.element()).backgroundColor).toBe('rgb(44, 79, 102)');
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
    await openOptionsSection('Filters');
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
    const owner = mount({ infinite: true, standaloneSearch: true });
    const toggle = page.getByRole('button', { name: 'View options' });
    const field = page.getByRole('textbox', { name: 'Sidebar title' });
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
    await expect.element(toggle).toHaveAttribute('aria-expanded', 'false');
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
    await openOptionsSection('Search');
    const scope = page.getByRole('combobox', { name: 'Search scope' });
    await scope.click();
    await page.getByRole('option', { name: 'Search title', exact: true }).click();
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
    await page.getByRole('button', { name: 'Done' }).click();
    await openOptionsSection('Page settings');
    await page.getByRole('spinbutton', { name: 'Go to page' }).fill('2');
    await userEvent.keyboard('{Enter}{Tab}');
    await expect.element(page.getByText('3–4 of 6 records')).toBeVisible();
    expect(request).toHaveBeenCalledTimes(4);
    expect(submit).not.toHaveBeenCalled();
    await page.getByRole('button', { name: 'Done', exact: true }).click();
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
    expect(toggles).toHaveLength(2);
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
    await openOptionsSection('Sort');
    await expect
        .element(page.getByRole('combobox', { name: 'Order preset' }))
        .toHaveValue('No preset');
});
