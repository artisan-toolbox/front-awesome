import { expect, onTestFinished, test } from 'vite-plus/test';
import { createApp, h, nextTick, reactive, shallowReactive } from 'vue';
import type { Component } from 'vue';
import { Card } from '@artisan-toolbox/front-awesome/components/WebAwesome';
import * as controls from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
import '@artisan-toolbox/front-awesome/web-awesome.css';
function mount(component: Component) {
    const container = document.createElement('div');
    document.body.append(container);
    const app = createApp(component);
    app.mount(container);
    onTestFinished(() => {
        app.unmount();
        container.remove();
    });
    return container;
}
function host(container: HTMLElement, tag: string) {
    const element = container.querySelector<HTMLElement>(tag);
    if (!element) throw new Error(`Expected ${tag}.`);
    return element;
}
function component(name: keyof typeof controls): Component {
    return controls[name];
}
async function ready(element: HTMLElement) {
    await customElements.whenDefined(element.localName);
    await nextTick();
    await new Promise(requestAnimationFrame);
    const update: unknown = Reflect.get(element, 'updateComplete');
    if (update instanceof Promise) await update;
    await nextTick();
}
for (const item of [
    {
        name: 'Combobox',
        tag: 'wa-combobox',
        property: 'value',
        initial: ['one'],
        next: ['two'],
        attrs: { multiple: true },
        event: 'input',
    },
    {
        name: 'DateInput',
        tag: 'wa-date-input',
        property: 'value',
        initial: new Date(2026, 10, 9),
        next: '2026-11-10',
        event: 'input',
    },
    {
        name: 'DatePicker',
        tag: 'wa-date-picker',
        property: 'value',
        initial: { from: new Date(2026, 10, 9), to: new Date(2026, 10, 10) },
        next: '2026-11-11/2026-11-12',
        attrs: { mode: 'range' },
        event: 'input',
    },
    {
        name: 'FileInput',
        tag: 'wa-file-input',
        property: 'files',
        initial: [new File(['one'], 'one.txt')],
        next: [new File(['two'], 'two.txt')],
        event: 'change',
    },
] satisfies {
    name: keyof typeof controls;
    tag: string;
    property: string;
    initial: unknown;
    next: unknown;
    attrs?: object;
    event: string;
}[]) {
    test(`${item.name} preserves rich setters and commits its canonical getter domain`, async () => {
        const state = shallowReactive<{ value: unknown; count: number }>({
            value: item.initial,
            count: 0,
        });
        const nativeEvents: Event[] = [];
        const container = mount({
            render: () =>
                h(component(item.name), {
                    ...('attrs' in item ? item.attrs : {}),
                    modelValue: state.value,
                    'onUpdate:modelValue': (value: unknown) => {
                        state.value = value;
                    },
                    [item.event === 'input' ? 'onInput' : 'onChange']: (event: Event) =>
                        nativeEvents.push(event),
                    'data-count': state.count,
                }),
        });
        const element = host(container, item.tag);
        await ready(element);
        if (item.name === 'DatePicker')
            await expect
                .poll(() => Reflect.get(element, 'value'), { timeout: 10000 })
                .toBe('2026-11-09/2026-11-10');
        const initial: unknown = Reflect.get(element, item.property);
        state.count++;
        await ready(element);
        expect(Reflect.get(element, item.property)).toEqual(initial);
        Reflect.set(element, item.property, item.next);
        await ready(element);
        const next: unknown = Reflect.get(element, item.property);
        const event = new Event(item.event, { bubbles: true, composed: true });
        element.dispatchEvent(event);
        expect(state.value).toEqual(next);
        expect(nativeEvents.at(-1)).toBe(event);
    });
}

test('DataGrid binds rich state ports independently and reads canonical values from the owned grid', async () => {
    const state = shallowReactive<Record<string, unknown>>({
        page: 0,
        pageSize: 10,
        sort: [],
        filters: [],
        searchTerm: '',
        selectedKeys: [],
        selectedRows: [],
        expandedKeys: [],
        columnOrder: ['name'],
    });
    const container = mount({
        render: () =>
            h(controls.DataGrid, {
                data: [
                    { id: 1, name: 'Ada' },
                    { id: 2, name: 'Grace' },
                ],
                columns: [{ field: 'name', label: 'Name' }],
                rowKey: 'id',
                ...Object.fromEntries(
                    Object.entries(state).flatMap(([key, value]) => [
                        [key, value],
                        [
                            `onUpdate:${key}`,
                            (next: unknown) => {
                                state[key] = next;
                            },
                        ],
                    ]),
                ),
            }),
    });
    const element = host(container, 'wa-data-grid');
    await ready(element);
    for (const [property, value, event] of [
        ['pageSize', 20, 'wa-page-change'],
        ['sort', [{ id: 'name', desc: true }], 'wa-sort-change'],
        ['filters', [{ id: 'name', value: 'Ada' }], 'wa-filter-change'],
        ['searchTerm', 'Ada', 'wa-filter-change'],
        ['selectedKeys', [1], 'wa-row-select'],
        ['expandedKeys', [1], 'wa-row-expand'],
        ['columnOrder', ['name'], 'wa-column-move'],
    ] satisfies [string, unknown, string][]) {
        Reflect.set(element, property, value);
        await ready(element);
        const expected: unknown = Reflect.get(element, property);
        element.dispatchEvent(new CustomEvent(event, { bubbles: true, composed: true }));
        expect(state[property]).toEqual(expected);
    }
});

test('DatePicker focusedDate converts the native local Date detail without a UTC day shift', async () => {
    const state = shallowReactive({ day: '2026-11-09' });
    const container = mount({
        render: () =>
            h(controls.DatePicker, {
                focusedDate: state.day,
                'onUpdate:focusedDate': (value: string) => {
                    state.day = value;
                },
            }),
    });
    const element = host(container, 'wa-date-picker');
    await ready(element);
    element.dispatchEvent(
        new CustomEvent('wa-focus-day', {
            detail: { date: new Date(2026, 10, 10, 23, 59) },
            bubbles: true,
            composed: true,
        }),
    );
    expect(state.day).toBe('2026-11-10');
});

test('Video playing uses real public play and pause methods and emits only after native playback events', async () => {
    const src = new URL('./fixtures/model-video.webm', import.meta.url).href;
    const state = shallowReactive({ playing: false, volume: 0.5, muted: true });
    const events: string[] = [];
    const container = mount({
        render: () =>
            h(controls.Video, {
                src,
                playing: state.playing,
                'onUpdate:playing': (value: boolean) => {
                    events.push(`model:${value}`);
                    state.playing = value;
                },
                volume: state.volume,
                'onUpdate:volume': (value: number) => {
                    state.volume = value;
                },
                muted: state.muted,
                'onUpdate:muted': (value: boolean) => {
                    state.muted = value;
                },
                onPlay: () => events.push('play'),
                onPause: () => events.push('pause'),
                loop: true,
            }),
    });
    const element = host(container, 'wa-video');
    await ready(element);
    await expect
        .poll(() => element.shadowRoot?.querySelector('video')?.readyState ?? 0, { timeout: 10000 })
        .toBeGreaterThan(0);
    state.playing = true;
    await expect.poll(() => Reflect.get(element, 'playing')).toBe(true);
    expect(events.indexOf('model:true')).toBeGreaterThan(events.indexOf('play'));
    const pause: unknown = Reflect.get(element, 'pause');
    if (typeof pause !== 'function') throw new Error('Expected public pause method.');
    Reflect.apply(pause, element, []);
    await expect.poll(() => state.playing).toBe(false);
    expect(Reflect.get(element, 'muted')).toBe(true);
    expect(Reflect.get(element, 'volume')).toBe(0.5);
}, 15000);

test('VideoPlaylist uses goTo and its committed currentIndex detail for activeIndex', async () => {
    const state = shallowReactive({ index: 1 });
    const container = mount({
        render: () =>
            h(
                controls.VideoPlaylist,
                {
                    activeIndex: state.index,
                    'onUpdate:activeIndex': (value: number) => {
                        state.index = value;
                    },
                },
                () => [0, 1, 2].map((index) => h(controls.Video, { title: `Video ${index}` })),
            ),
    });
    const element = host(container, 'wa-video-playlist');
    await ready(element);
    await expect.poll(() => element.querySelectorAll('wa-video:not([hidden])').length).toBe(1);
    state.index = 2;
    await ready(element);
    const goTo: unknown = Reflect.get(element, 'goTo');
    if (typeof goTo !== 'function') throw new Error('Expected public goTo method.');
    Reflect.apply(goTo, element, [0]);
    await expect.poll(() => state.index).toBe(0);
});

test('DatePicker retains its host, selected value and focused day when validation activates', async () => {
    const state = shallowReactive<{ failed?: string }>({});
    const container = mount({
        render: () =>
            h(controls.DatePicker, {
                value: '2026-11-09',
                ...(state.failed === undefined ? {} : { failed: state.failed }),
            }),
    });
    const picker = host(container, 'wa-date-picker');
    await ready(picker);
    await expect.poll(() => Reflect.get(picker, 'value')).toBe('2026-11-09');
    const day = picker.shadowRoot?.querySelector<HTMLElement>('[part~="day"][tabindex="0"]');
    if (!day) throw new Error('Expected focusable public calendar day.');
    day.focus();
    state.failed = 'Choose a date.';
    await ready(picker);
    expect(host(container, 'wa-date-picker')).toBe(picker);
    expect(Reflect.get(picker, 'value')).toBe('2026-11-09');
    expect(picker.shadowRoot?.activeElement).toBe(day);
    state.failed = undefined;
    await ready(picker);
    expect(host(container, 'wa-date-picker')).toBe(picker);
    expect(picker.shadowRoot?.activeElement).toBe(day);
});

test('DataGrid applies in-place reactive nested filter edits through the original public setter value', async () => {
    const state = reactive({ filters: [{ id: 'name', value: 'Ada' }], count: 0 });
    const container = mount({
        render: () =>
            h(controls.DataGrid, {
                data: [
                    { id: 1, name: 'Ada' },
                    { id: 2, name: 'Grace' },
                ],
                columns: [{ field: 'name', label: 'Name' }],
                filters: state.filters,
                'onUpdate:filters': (value: { id: string; value: unknown }[]) => {
                    state.filters = value.map((item) => ({
                        id: item.id,
                        value: String(item.value),
                    }));
                },
                'data-count': state.count,
            }),
    });
    const grid = host(container, 'wa-data-grid');
    await ready(grid);
    await expect.poll(() => Reflect.get(grid, 'filters')).toEqual([{ id: 'name', value: 'Ada' }]);
    state.filters[0].value = 'Grace';
    await expect.poll(() => Reflect.get(grid, 'filters')).toEqual([{ id: 'name', value: 'Grace' }]);
    state.count++;
    await ready(grid);
    expect(Reflect.get(grid, 'filters')).toEqual([{ id: 'name', value: 'Grace' }]);
});

for (const namedSlot of [false, true]) {
    test(`DatePicker keeps its native slot and stable frame through validation using ${namedSlot ? 'Vue named slots' : 'native slot attributes'}`, async () => {
        const state = shallowReactive<{ failed?: string }>({});
        const picker = () =>
            h(controls.DatePicker, {
                ...(namedSlot ? {} : { slot: 'footer' }),
                value: '2026-11-09',
                class: 'caller-picker',
                ...(state.failed === undefined ? {} : { failed: state.failed }),
            });
        const container = mount({
            render: () => h(Card, {}, namedSlot ? { footer: picker } : { default: picker }),
        });
        const element = host(container, 'wa-date-picker');
        await ready(element);
        const frame = element.parentElement;
        if (!frame) throw new Error('Expected stable presentation element.');
        await expect.poll(() => frame.assignedSlot?.name).toBe('footer');
        expect(element.slot).toBe('footer');
        expect(frame.localName).toBe('fa-form-field-frame');
        expect(element.classList.contains('caller-picker')).toBe(true);
        expect(frame.classList.contains('caller-picker')).toBe(false);
        state.failed = 'Choose a date.';
        await ready(element);
        expect(host(container, 'wa-date-picker')).toBe(element);
        expect(element.parentElement).toBe(frame);
        expect(frame.assignedSlot?.name).toBe('footer');
        state.failed = undefined;
        await ready(element);
        expect(frame.assignedSlot?.name).toBe('footer');
    });
}

test('FileInput renders an in-place File array mutation without replacing its original setter value', async () => {
    const state = reactive({ files: [new File(['one'], 'one.txt')] });
    const container = mount({
        render: () =>
            h(component('FileInput'), {
                modelValue: state.files,
                'onUpdate:modelValue': (value: File[]) => {
                    state.files = value;
                },
            }),
    });
    const element = host(container, 'wa-file-input');
    await ready(element);
    await expect.poll(() => element.shadowRoot?.textContent).toContain('one.txt');
    state.files.push(new File(['two'], 'two.txt'));
    await expect.poll(() => element.shadowRoot?.textContent).toContain('two.txt');
    expect(Reflect.get(element, 'files')).toBe(state.files);
});
