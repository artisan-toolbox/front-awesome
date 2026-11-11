/// <reference types="vite/client" />
import { expect, onTestFinished, test, vi } from 'vite-plus/test';
import { page, userEvent } from 'vite-plus/test/browser';
import { createApp, h, nextTick, shallowReactive } from 'vue';
import type { Component } from 'vue';
import * as Pro from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
import { Option } from '@artisan-toolbox/front-awesome/components/WebAwesome';
import videoUrl from './fixtures/color-test.mp4?url';
import '../frontend/app.css';
import '@artisan-toolbox/front-awesome/web-awesome.css';
import '@artisan-toolbox/front-awesome/tailwind.css';

type Props = Record<string, unknown>;

async function settle(host: HTMLElement) {
    await customElements.whenDefined(host.localName);
    await nextTick();
    for (let round = 0; round < 4; round++) {
        await Reflect.get(host, 'updateComplete');
        await nextTick();
    }
}

function shadow<T extends Element = HTMLElement>(host: HTMLElement, selector: string) {
    const element = host.shadowRoot?.querySelector<T>(selector);
    if (!element) throw new Error(`Missing ${selector} in ${host.localName}`);
    return element;
}

async function fixture<T extends keyof HTMLElementTagNameMap>(
    tag: T,
    component: Component,
    initial: Props,
    children?: () => ReturnType<typeof h>[],
) {
    const props = shallowReactive(initial);
    const root = document.createElement('form');
    root.style.cssText =
        'width:700px;margin:20px;--wa-transition-fast:0ms;--wa-transition-normal:0ms;--wa-transition-slow:0ms';
    document.body.append(root);
    const app = createApp({
        render: () => h(component, props, children ? { default: children } : undefined),
    });
    app.mount(root);
    onTestFinished(() => {
        app.unmount();
        root.remove();
    });
    const host = root.querySelector(tag);
    if (!host) throw new Error(`Missing ${tag}`);
    await settle(host);
    for (const [key, value] of Object.entries(initial)) {
        if (key in host && value !== null && ['object', 'function'].includes(typeof value)) {
            await vi.waitFor(() => expect(Reflect.get(host, key), `${tag}.${key}`).toBe(value));
        }
    }
    await settle(host);
    return { host, root, props };
}

async function nativeFixture<T extends keyof HTMLElementTagNameMap>(tag: T, props: Props) {
    await customElements.whenDefined(tag);
    const root = document.createElement('form');
    root.style.cssText =
        'width:700px;margin:20px;--wa-transition-fast:0ms;--wa-transition-normal:0ms;--wa-transition-slow:0ms';
    const host = document.createElement(tag);
    root.append(host);
    document.body.append(root);
    onTestFinished(() => root.remove());
    for (const [key, value] of Object.entries(props)) {
        if (key.startsWith('on') && typeof value === 'function') {
            const name = key
                .slice(2)
                .replace(/([a-z])([A-Z])/g, '$1-$2')
                .toLowerCase();
            host.addEventListener(name, (event) => value(event));
        } else {
            if (key === 'value' && 'defaultValue' in host && typeof value === 'string') {
                host.setAttribute('value', value);
            }
            Reflect.set(host, key, value);
        }
    }
    await settle(host);
    return { host, root };
}

const options = () => [
    h(Option, { value: 'apple' }, () => 'Apple'),
    h(Option, { value: 'apricot', disabled: true }, () => 'Apricot'),
    h(Option, { value: 'banana' }, () => 'Banana'),
];

test('Pro Combobox filters text, skips disabled options, selects with the keyboard and clears FormData', async () => {
    const change = vi.fn();
    const { host, root, props } = await fixture(
        'wa-combobox',
        Pro.Combobox,
        { label: 'Fruit', name: 'fruit', withClear: true, onchange: change },
        options,
    );
    const input = shadow<HTMLInputElement>(host, 'input[role="combobox"]');
    await userEvent.fill(input, 'ap');
    await vi.waitFor(() =>
        expect(host.querySelector<HTMLElement>('wa-option[value="banana"]')?.hidden).toBe(true),
    );
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await vi.waitFor(() => expect(host.value).toBe('apple'));
    expect(new FormData(root).get('fruit')).toBe('apple');
    expect(change).toHaveBeenCalled();
    props.label = 'Updated fruit';
    await settle(host);
    expect(host.value).toBe('apple');
    await userEvent.click(shadow(host, '[part="clear-button"]'));
    await vi.waitFor(() => expect(host.value).toBeNull());
    expect(new FormData(root).get('fruit')).toBe('');
    props.disabled = true;
    await settle(host);
    expect(input.disabled).toBe(true);
});

test('Pro Combobox submits multiple choices and removes a selected tag', async () => {
    const { host, root } = await fixture(
        'wa-combobox',
        Pro.Combobox,
        { label: 'Fruit', name: 'fruit', multiple: true },
        options,
    );
    const input = shadow<HTMLInputElement>(host, 'input[role="combobox"]');
    await userEvent.fill(input, 'app');
    await vi.waitFor(() =>
        expect(host.querySelector<HTMLElement>('wa-option[value="banana"]')?.hidden).toBe(true),
    );
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await vi.waitFor(() => expect(host.value).toEqual(['apple']));
    await userEvent.fill(input, 'ban');
    await vi.waitFor(() =>
        expect(host.querySelector<HTMLElement>('wa-option[value="apple"]')?.hidden).toBe(true),
    );
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await vi.waitFor(() => expect(host.value).toEqual(['apple', 'banana']));
    expect(new FormData(root).getAll('fruit')).toEqual(['apple', 'banana']);
    const tag = shadow(host, 'wa-tag');
    await userEvent.click(shadow(tag, '[part="remove-button"]'));
    await vi.waitFor(() => expect(host.value).toEqual(['banana']));
});

test('Pro Combobox matches native server callback requests and keyboard selection', async () => {
    const dataSource = vi.fn(async ({ query }: { query: string }) => [
        { value: 'server', label: `Server ${query}` },
    ]);
    const initial = { label: 'Remote fruit', server: true, filterDebounce: 0, dataSource };
    const wrapped = await fixture('wa-combobox', Pro.Combobox, initial);
    const native = await nativeFixture('wa-combobox', initial);
    for (const { host } of [native, wrapped]) {
        expect(host.dataSource).toBe(dataSource);
        const input = shadow<HTMLInputElement>(host, 'input[role="combobox"]');
        await userEvent.fill(input, 'pear');
        await vi.waitFor(() =>
            expect(host.querySelector('wa-option')?.textContent).toContain('Server pear'),
        );
        await userEvent.keyboard('{ArrowDown}{Enter}');
        await vi.waitFor(() => expect(host.value).toBe('server'));
    }
    expect(dataSource.mock.calls.filter(([request]) => request.query === 'pear')).toHaveLength(2);
});

test('Pro DatePicker enforces constraints and callbacks, selects a Date, and navigates with the keyboard', async () => {
    const isDateDisabled = vi.fn((date: Date) => date.getDate() === 12);
    const dayContent = vi.fn((date: Date) =>
        date.getDate() === 15 ? '<strong>Payday</strong>' : null,
    );
    const initial = {
        today: '2026-11-09',
        focusedDate: '2026-11-09',
        min: '2026-11-05',
        max: '2026-11-25',
        disabledDates: ['2026-11-11'],
        isDateDisabled,
        dayContent,
    };
    const wrapped = await fixture('wa-date-picker', Pro.DatePicker, initial);
    const native = await nativeFixture('wa-date-picker', initial);
    for (const { host } of [native, wrapped]) {
        expect(host.isDateDisabled).toBe(isDateDisabled);
        expect(host.dayContent).toBe(dayContent);
        for (const date of ['2026-11-04', '2026-11-11', '2026-11-12', '2026-11-26']) {
            expect(
                shadow<HTMLButtonElement>(host, `[data-date="${date}"]`).getAttribute(
                    'aria-disabled',
                ),
                date,
            ).toBe('true');
        }
        expect(shadow(host, '[data-date="2026-11-15"]').textContent).toContain('Payday');
        shadow<HTMLButtonElement>(host, '[data-date="2026-11-12"]').focus();
        await userEvent.keyboard('{Enter}');
        expect(host.value).toBe('');
        await userEvent.click(shadow(host, '[data-date="2026-11-09"]'));
        expect(host.value).toBe('2026-11-09');
        expect(host.valueAsDate?.getFullYear()).toBe(2026);
        expect(host.valueAsDate?.getMonth()).toBe(10);
        await userEvent.keyboard('{ArrowRight}{Enter}');
        expect(host.value).toBe('2026-11-10');
    }
});

test('Pro DatePicker selects a range and restores it when a new range is cancelled', async () => {
    const { host } = await fixture('wa-date-picker', Pro.DatePicker, {
        today: '2026-11-09',
        mode: 'range',
        minRange: 2,
        maxRange: 7,
    });
    await userEvent.click(shadow(host, '[data-date="2026-11-09"]'));
    await userEvent.click(shadow(host, '[data-date="2026-11-13"]'));
    expect(host.value).toBe('2026-11-09/2026-11-13');
    expect(host.valueAsRange.from?.getDate()).toBe(9);
    expect(host.valueAsRange.to?.getDate()).toBe(13);
    await userEvent.click(shadow(host, '[data-date="2026-11-16"]'));
    await userEvent.keyboard('{Escape}');
    expect(host.value).toBe('2026-11-09/2026-11-13');
});

test('Pro DateInput selects from its popup, submits, preserves user state and resets to its default', async () => {
    const { host, root, props } = await fixture('wa-date-input', Pro.DateInput, {
        label: 'Delivery',
        name: 'delivery',
        today: '2026-11-09',
        value: '2026-11-09',
        withClear: true,
    });
    await userEvent.click(shadow(host, '[part="expand-button"]'));
    const picker = shadow<HTMLElementTagNameMap['wa-date-picker']>(host, 'wa-date-picker');
    await settle(picker);
    await userEvent.click(shadow(picker, '[data-date="2026-11-13"]'));
    await vi.waitFor(() => expect(host.value).toBe('2026-11-13'));
    expect(new FormData(root).get('delivery')).toBe('2026-11-13');
    expect(host.valueAsDate?.getDate()).toBe(13);
    props.label = 'Delivery date';
    await settle(host);
    expect(host.value).toBe('2026-11-13');
    root.reset();
    await settle(host);
    expect(host.value).toBe('2026-11-09');
    await userEvent.click(shadow(host, '[part="clear-button"]'));
    await vi.waitFor(() => expect(host.value).toBe(''));
});

test('Pro DateInput matches native range selection, constraints and prevented reset', async () => {
    const isDateDisabled = (date: Date) => date.getDate() === 12;
    const initial = {
        label: 'Travel dates',
        name: 'travel',
        mode: 'range',
        today: '2026-11-09',
        value: '2026-11-09/2026-11-13',
        min: '2026-11-05',
        max: '2026-11-25',
        disabledDates: ['2026-11-11'],
        isDateDisabled,
    };
    const wrapped = await fixture('wa-date-input', Pro.DateInput, initial);
    const native = await nativeFixture('wa-date-input', initial);
    for (const { host, root } of [native, wrapped]) {
        expect(host.isDateDisabled).toBe(isDateDisabled);
        await userEvent.click(shadow(host, '[part="expand-button"]'));
        const picker = shadow<HTMLElementTagNameMap['wa-date-picker']>(host, 'wa-date-picker');
        await settle(picker);
        expect(shadow(picker, '[data-date="2026-11-11"]').getAttribute('aria-disabled')).toBe(
            'true',
        );
        expect(shadow(picker, '[data-date="2026-11-12"]').getAttribute('aria-disabled')).toBe(
            'true',
        );
        await userEvent.click(shadow(picker, '[data-date="2026-11-16"]'));
        await userEvent.click(shadow(picker, '[data-date="2026-11-20"]'));
        await vi.waitFor(() => expect(host.value).toBe('2026-11-16/2026-11-20'));
        expect(host.valueAsRange.from?.getDate()).toBe(16);
        expect(host.valueAsRange.to?.getDate()).toBe(20);
        expect(new FormData(root).get('travel')).toBe('2026-11-16/2026-11-20');
        root.addEventListener('reset', (event) => event.preventDefault(), { once: true });
        root.reset();
        await settle(host);
        expect(host.value).toBe('2026-11-16/2026-11-20');
        root.reset();
        await settle(host);
        expect(host.value).toBe('2026-11-09/2026-11-13');
    }
});

test('Pro FileInput accepts matching files, rejects other types, submits File objects and removes them', async () => {
    const change = vi.fn();
    const { host, root } = await fixture('wa-file-input', Pro.FileInput, {
        label: 'Attachments',
        name: 'files',
        accept: '.txt',
        multiple: true,
        onchange: change,
    });
    const input = shadow<HTMLInputElement>(host, 'input[type="file"]');
    const text = new File(['example'], 'readme.txt', { type: 'text/plain' });
    const image = new File(['other'], 'image.png', { type: 'image/png' });
    await page.elementLocator(input).upload([text, image]);
    await vi.waitFor(() => expect(host.files.map((file) => file.name)).toEqual(['readme.txt']));
    expect(host.fileCount).toBe(1);
    const submitted = new FormData(root).get('files');
    expect(submitted).toBeInstanceOf(File);
    if (!(submitted instanceof File)) throw new Error('Expected submitted file');
    expect(await submitted.text()).toBe('example');
    expect(change).toHaveBeenCalled();
    await userEvent.click(shadow(host, '[part="remove-button"]'));
    await vi.waitFor(() => expect(host.fileCount).toBe(0));
    expect(new FormData(root).getAll('files')).toEqual([]);
});

test('Pro FileInput handles rich files, unrelated updates, external clearing and required validation', async () => {
    const first = new File(['first'], 'first.txt', { type: 'text/plain' });
    const files = [first];
    const { host, root, props } = await fixture('wa-file-input', Pro.FileInput, {
        label: 'Files',
        name: 'files',
        files,
        multiple: true,
        required: true,
    });
    expect(host.files).toBe(files);
    expect(host.checkValidity()).toBe(true);
    const second = new File(['second'], 'second.txt', { type: 'text/plain' });
    await page.elementLocator(shadow<HTMLInputElement>(host, 'input[type="file"]')).upload(second);
    await vi.waitFor(() =>
        expect(host.files.map((file) => file.name)).toEqual(['first.txt', 'second.txt']),
    );
    props.label = 'Updated files';
    await settle(host);
    expect(host.fileCount).toBe(2);
    props.files = [];
    await vi.waitFor(() => expect(host.fileCount).toBe(0));
    expect(host.checkValidity()).toBe(false);
    expect(new FormData(root).getAll('files')).toEqual([]);
    props.disabled = true;
    await settle(host);
    expect(host.checkValidity()).toBe(true);
    expect(shadow<HTMLInputElement>(host, 'input[type="file"]').disabled).toBe(true);
});

const rows = [
    { id: 1, name: 'Pear', amount: 30 },
    { id: 2, name: 'Apple', amount: 10 },
    { id: 3, name: 'Banana', amount: 20 },
];
const columns = [
    { field: 'name', label: 'Fruit', sortable: true, filterable: true },
    { field: 'amount', label: 'Amount', sortable: true },
];

test('Pro DataGrid sorts, selects, expands details, paginates and filters real rows', async () => {
    const selected = vi.fn();
    const sorted = vi.fn();
    const detail = vi.fn((row: (typeof rows)[number]) => `Detail ${row.name}`);
    const initial = {
        data: rows,
        columns,
        rowKey: 'id',
        selectable: 'multiple',
        paginate: true,
        pageSize: 2,
        withSearch: true,
        filterDebounce: 0,
        rowDetail: detail,
        onWaRowSelect: selected,
        onWaSortChange: sorted,
    };
    const wrapped = await fixture('wa-data-grid', Pro.DataGrid, initial);
    const native = await nativeFixture('wa-data-grid', initial);
    for (const { host } of [native, wrapped]) {
        selected.mockClear();
        sorted.mockClear();
        expect(host.data).toBe(rows);
        expect(host.columns).toBe(columns);
        expect(host.rowDetail).toBe(detail);
        await userEvent.click(shadow(host, '[role="columnheader"][data-col-id="name"]'));
        await vi.waitFor(() =>
            expect(host.getVisibleRows().map((row) => row.name)).toEqual(['Apple', 'Banana']),
        );
        expect(sorted).toHaveBeenCalled();
        const rowCheckbox = shadow(host, '[part~="row"] wa-checkbox');
        await userEvent.click(rowCheckbox);
        expect(selected).toHaveBeenCalled();
        await userEvent.click(shadow(host, '[part="expand-button"]'));
        await vi.waitFor(() =>
            expect(shadow(host, '[part="row-detail"]').textContent).toContain('Detail Apple'),
        );
        const pager = shadow<HTMLElement>(host, '[part="pager"]');
        await settle(pager);
        await userEvent.click(shadow(pager, '[part~="next-button"]'));
        await vi.waitFor(() =>
            expect(host.getVisibleRows().map((row) => row.name)).toEqual(['Pear']),
        );
        const search = shadow<HTMLElement>(host, '[part="search"]');
        await userEvent.fill(shadow<HTMLInputElement>(search, 'input'), 'Banana');
        await vi.waitFor(() =>
            expect(host.getVisibleRows().map((row) => row.name)).toEqual(['Banana']),
        );
    }
});

test('Pro DataGrid matches native keyboard reordering, resizing, column filters and state restoration', async () => {
    const moved = vi.fn();
    const initial = {
        data: rows,
        columns,
        rowKey: 'id',
        reorderable: true,
        resizable: true,
        onWaColumnMove: moved,
    };
    const wrapped = await fixture('wa-data-grid', Pro.DataGrid, initial);
    const native = await nativeFixture('wa-data-grid', initial);
    for (const { host } of [native, wrapped]) {
        moved.mockClear();
        const header = shadow<HTMLElement>(host, '[role="columnheader"][data-col-id="name"]');
        await userEvent.click(header);
        await userEvent.keyboard('{Shift>}{ArrowRight}{/Shift}');
        await vi.waitFor(() => expect(host.getState().columnOrder).toEqual(['amount', 'name']));
        expect(moved).toHaveBeenCalled();
        await settle(host);
        const currentHeader = shadow<HTMLElement>(
            host,
            '[role="columnheader"][data-col-id="name"]',
        );
        const beforeWidth = currentHeader.getBoundingClientRect().width;
        await userEvent.keyboard('{Alt>}{ArrowRight}{/Alt}');
        await vi.waitFor(() =>
            expect(host.getState().columnWidths?.name).toBeGreaterThan(beforeWidth),
        );
        host.filters = [{ id: 'name', value: 'Apple' }];
        await vi.waitFor(() =>
            expect(host.getVisibleRows().map((row) => row.name)).toEqual(['Apple']),
        );
        const saved = host.getState();
        host.resetState();
        await vi.waitFor(() => expect(host.getVisibleRows()).toHaveLength(3));
        host.setState(saved);
        await vi.waitFor(() =>
            expect(host.getVisibleRows().map((row) => row.name)).toEqual(['Apple']),
        );
        expect(host.getState().columnOrder).toEqual(['amount', 'name']);
        expect(host.getDataAsCsv()).toContain('Apple');
        expect(host.getDataAsCsv()).not.toContain('Banana');
    }
});

const charts = [
    ['wa-chart', Pro.Chart, 'bar'],
    ['wa-bar-chart', Pro.BarChart, 'bar'],
    ['wa-bubble-chart', Pro.BubbleChart, 'bubble'],
    ['wa-doughnut-chart', Pro.DoughnutChart, 'doughnut'],
    ['wa-line-chart', Pro.LineChart, 'line'],
    ['wa-pie-chart', Pro.PieChart, 'pie'],
    ['wa-polar-area-chart', Pro.PolarAreaChart, 'polarArea'],
    ['wa-radar-chart', Pro.RadarChart, 'radar'],
    ['wa-scatter-chart', Pro.ScatterChart, 'scatter'],
] as const;

for (const [tag, component, type] of charts) {
    test(`Pro ${tag} paints a real canvas, executes configured click callbacks and updates reactive config`, async () => {
        const onClick = vi.fn();
        const values =
            type === 'bubble'
                ? [
                      { x: 1, y: 2, r: 12 },
                      { x: 2, y: 3, r: 8 },
                  ]
                : type === 'scatter'
                  ? [
                        { x: 1, y: 2 },
                        { x: 2, y: 3 },
                    ]
                  : [12, 24, 8];
        const config = {
            type,
            data: {
                labels: ['A', 'B', 'C'],
                datasets: [
                    {
                        label: 'Sales',
                        data: values,
                        backgroundColor: '#0044ff',
                        borderColor: '#0044ff',
                    },
                ],
            },
            options: { animation: false as const, responsive: false, onClick },
        };
        const { host, props } = await fixture(tag, component, {
            label: 'Sales chart',
            config,
            withoutAnimation: true,
            style: 'display:block;width:400px;height:250px',
        });
        const canvas = shadow<HTMLCanvasElement>(host, 'canvas');
        await vi.waitFor(() => expect(host.chart).toBeTruthy());
        expect(host.config).toBe(config);
        expect(canvas.width).toBeGreaterThan(0);
        expect(canvas.height).toBeGreaterThan(0);
        const context = canvas.getContext('2d');
        if (!context) throw new Error('Expected real canvas context');
        await vi.waitFor(() =>
            expect(
                context
                    .getImageData(0, 0, canvas.width, canvas.height)
                    .data.some((value) => value !== 0),
            ).toBe(true),
        );
        const before = canvas.toDataURL();
        await userEvent.click(canvas);
        await vi.waitFor(() => expect(onClick).toHaveBeenCalled());
        const updated = {
            ...config,
            data: {
                ...config.data,
                datasets: [
                    {
                        ...config.data.datasets[0],
                        backgroundColor: '#ff2200',
                        borderColor: '#ff2200',
                        pointBackgroundColor: '#ff2200',
                        pointBorderColor: '#ff2200',
                    },
                ],
            },
        };
        props.config = updated;
        await vi.waitFor(() => expect(host.config).toBe(updated));
        await settle(host);
        await vi.waitFor(() => expect(canvas.toDataURL()).not.toBe(before));
    });
}

test('Pro Sparkline renders accessible SVG and redraws its public data and curve inputs', async () => {
    const { host, props } = await fixture('wa-sparkline', Pro.Sparkline, {
        label: 'Sales trend',
        data: '10 20 15 40',
        curve: 'linear',
    });
    const path = shadow<SVGPathElement>(host, '[part="line"]');
    expect(shadow(host, 'svg').getAttribute('aria-label')).toBe('Sales trend');
    const original = path.getAttribute('d');
    expect(original).toContain('L');
    props.data = '40 20 35 10';
    props.curve = 'step';
    await settle(host);
    expect(path.getAttribute('d')).not.toBe(original);
    expect(path.getBoundingClientRect().width).toBeGreaterThan(0);
});

test('Pro Video waits for user action, plays local media, pauses, mutes and seeks through its public controls', async () => {
    const played = vi.fn();
    const paused = vi.fn();
    const { host } = await fixture('wa-video', Pro.Video, {
        title: 'Local color test',
        src: videoUrl,
        preload: 'metadata',
        controls: 'standard',
        onplay: played,
        onpause: paused,
        style: 'display:block;width:500px',
    });
    const video = host.getVideoElement();
    if (!video) throw new Error('Expected native video');
    expect(video.paused).toBe(true);
    await vi.waitFor(() => expect(video.readyState).toBeGreaterThanOrEqual(1));
    await userEvent.click(shadow(host, '[aria-label="Play"]'));
    await vi.waitFor(() => expect(video.paused).toBe(false));
    expect(played).toHaveBeenCalled();
    await userEvent.click(shadow(host, '[aria-label="Pause"]'));
    await vi.waitFor(() => expect(video.paused).toBe(true));
    expect(paused).toHaveBeenCalled();
    await userEvent.hover(shadow(host, '[aria-label="Volume"]'));
    await vi.waitFor(() =>
        expect(shadow<HTMLElementTagNameMap['wa-popover']>(host, 'wa-popover').open).toBe(true),
    );
    const volume = shadow<HTMLElement>(host, 'wa-slider[orientation="vertical"]');
    await userEvent.click(shadow(volume, '[role="slider"]'));
    await userEvent.keyboard('{Home}');
    await vi.waitFor(() => expect(video.muted).toBe(true));
    host.seek(0.25);
    await vi.waitFor(() => expect(video.currentTime).toBeCloseTo(0.25, 1));
});

test('Pro VideoPlaylist navigates local videos with visible controls and emits the changed video', async () => {
    const changed = vi.fn();
    const { host } = await fixture(
        'wa-video-playlist',
        Pro.VideoPlaylist,
        { controls: 'standard', onWaVideoChange: changed },
        () => [
            h(Pro.Video, { title: 'First clip', src: videoUrl, preload: 'metadata' }),
            h(Pro.Video, { title: 'Second clip', src: videoUrl, preload: 'metadata' }),
        ],
    );
    const videos = [...host.querySelectorAll('wa-video')];
    await Promise.all(videos.map(settle));
    expect(videos.every((video) => video.getVideoElement()?.paused)).toBe(true);
    const items = host.shadowRoot?.querySelectorAll<HTMLElement>('[part="playlist-item"]');
    if (!items?.[1]) throw new Error('Expected second playlist item');
    await userEvent.click(items[1]);
    await vi.waitFor(() => expect(changed).toHaveBeenCalled());
    expect(videos[0]?.hidden).toBe(true);
    expect(videos[1]?.hidden).toBe(false);
    expect(videos.every((video) => video.getVideoElement()?.paused)).toBe(true);
    const active = videos[1];
    if (!active) throw new Error('Expected active video');
    await userEvent.click(shadow(active, '[aria-label="Play"]'));
    await vi.waitFor(() => expect(active.getVideoElement()?.paused).toBe(false));
    host.previous();
    await vi.waitFor(() => expect(videos[0]?.hidden).toBe(false));
    expect(videos[1]?.getVideoElement()?.paused).toBe(true);
    videos.forEach((video) => video.pause());
});
