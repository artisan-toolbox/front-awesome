import { expect, onTestFinished, test } from 'vite-plus/test';
import { createApp, defineComponent, h, nextTick, reactive, shallowReactive } from 'vue';
import type { Component } from 'vue';
import { useWebAwesome } from '../../resources/js/WebAwesome/useWebAwesome';
import { useWebAwesomeModel } from '../../resources/js/WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../resources/js/WebAwesome/modelDomains';
import { checkboxDefinition } from '../../resources/js/WebAwesome/componentDefinitions';
import { useForm } from '@inertiajs/vue3';
import * as controls from '@artisan-toolbox/front-awesome/components/WebAwesome';
import '@artisan-toolbox/front-awesome/web-awesome.css';

function component(name: keyof typeof controls): Component {
    return controls[name];
}
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
async function ready(element: HTMLElement) {
    await customElements.whenDefined(element.localName);
    await nextTick();
    await new Promise(requestAnimationFrame);
    const update: unknown = Reflect.get(element, 'updateComplete');
    if (update instanceof Promise) await update;
    await nextTick();
}
const primaryCases = [
    {
        name: 'Checkbox',
        tag: 'wa-checkbox',
        property: 'checked',
        event: 'change',
        initial: true,
        next: false,
    },
    {
        name: 'Switch',
        tag: 'wa-switch',
        property: 'checked',
        event: 'change',
        initial: false,
        next: true,
    },
    {
        name: 'Textarea',
        tag: 'wa-textarea',
        property: 'value',
        event: 'input',
        initial: 'First',
        next: 'Second',
    },
    {
        name: 'NumberInput',
        tag: 'wa-number-input',
        property: 'value',
        event: 'input',
        initial: '1.50',
        next: '2.75',
    },
    {
        name: 'RadioGroup',
        tag: 'wa-radio-group',
        property: 'value',
        event: 'input',
        initial: 1,
        next: 2,
    },
    { name: 'Slider', tag: 'wa-slider', property: 'value', event: 'input', initial: 5, next: 8 },
    { name: 'Rating', tag: 'wa-rating', property: 'value', event: 'change', initial: 2, next: 4 },
    {
        name: 'OtpInput',
        tag: 'wa-otp-input',
        property: 'value',
        event: 'input',
        initial: '123456',
        next: '654321',
    },
    {
        name: 'ColorPicker',
        tag: 'wa-color-picker',
        property: 'value',
        event: 'input',
        initial: '#112233',
        next: '#445566',
    },
    {
        name: 'Select',
        tag: 'wa-select',
        property: 'value',
        event: 'input',
        initial: ['one'],
        next: ['two'],
        attrs: { multiple: true },
    },
    {
        name: 'TagInput',
        tag: 'wa-tag-input',
        property: 'value',
        event: 'change',
        initial: ['one'],
        next: ['two'],
    },
    {
        name: 'KnownDate',
        tag: 'wa-known-date',
        property: 'value',
        event: 'input',
        initial: new Date(2026, 10, 9),
        next: '2026-11-10',
    },
    {
        name: 'TimeInput',
        tag: 'wa-time-input',
        property: 'value',
        event: 'input',
        initial: new Date(2026, 10, 9, 12, 30),
        next: '13:45',
    },
] satisfies {
    name: keyof typeof controls;
    tag: string;
    property: string;
    event: string;
    initial: unknown;
    next: unknown;
    attrs?: object;
}[];

for (const item of primaryCases) {
    test(`${item.name} synchronizes its public value domain without altering native event identity`, async () => {
        const state = shallowReactive<{ value: unknown; count: number }>({
            value: item.initial,
            count: 0,
        });
        const events: Event[] = [];
        const listener = item.event === 'change' ? 'onChange' : 'onInput';
        const wasRegistered = customElements.get(item.tag);
        const container = mount({
            render: () =>
                h(component(item.name), {
                    ...('attrs' in item ? item.attrs : {}),
                    modelValue: state.value,
                    'onUpdate:modelValue': (value: unknown) => {
                        state.value = value;
                    },
                    [listener]: (event: Event) => events.push(event),
                    'data-count': state.count,
                }),
        });
        const element = host(container, item.tag);
        if (!wasRegistered) expect(Object.hasOwn(element, item.property)).toBe(false);
        await ready(element);
        const initialNative: unknown = Reflect.get(element, item.property);
        state.count++;
        await ready(element);
        expect(Reflect.get(element, item.property)).toEqual(initialNative);
        Reflect.set(element, item.property, item.next);
        await ready(element);
        const committed: unknown = Reflect.get(element, item.property);
        const event = new Event(item.event, { bubbles: true, composed: true, cancelable: true });
        element.dispatchEvent(event);
        expect(state.value).toEqual(committed);
        expect(events.at(-1)).toBe(event);
        state.count++;
        await ready(element);
        expect(Reflect.get(element, item.property)).toEqual(committed);
    });
}

for (const item of [
    {
        name: 'Pagination',
        tag: 'wa-pagination',
        property: 'page',
        event: 'wa-page-change',
        initial: 1,
        next: 2,
        attrs: { total: 100 },
    },
    {
        name: 'Stepper',
        tag: 'wa-stepper',
        property: 'active',
        event: 'wa-step-change',
        initial: 'first',
        next: 'second',
    },
    {
        name: 'TabGroup',
        tag: 'wa-tab-group',
        property: 'active',
        event: 'wa-tab-show',
        initial: 'first',
        next: 'second',
    },
    {
        name: 'Comparison',
        tag: 'wa-comparison',
        property: 'position',
        event: 'change',
        initial: 40,
        next: 60,
    },
    {
        name: 'SplitPanel',
        tag: 'wa-split-panel',
        property: 'position',
        event: 'wa-reposition',
        initial: 40,
        next: 60,
    },
] satisfies {
    name: keyof typeof controls;
    tag: string;
    property: string;
    event: string;
    initial: unknown;
    next: unknown;
    attrs?: object;
}[]) {
    test(`${item.name} supports its named state model independently of form binding`, async () => {
        const state = shallowReactive<{ value: unknown }>({ value: item.initial });
        const container = mount({
            render: () =>
                h(component(item.name), {
                    ...('attrs' in item ? item.attrs : {}),
                    [item.property]: state.value,
                    [`onUpdate:${item.property}`]: (value: unknown) => {
                        state.value = value;
                    },
                }),
        });
        const element = host(container, item.tag);
        await ready(element);
        expect(Reflect.get(element, item.property)).toBe(item.initial);
        Reflect.set(element, item.property, item.next);
        element.dispatchEvent(new CustomEvent(item.event, { bubbles: true, composed: true }));
        expect(state.value).toBe(item.next);
    });
}

test('Inertia fields, errors and both form resets follow the actual native reset result', async () => {
    const state = shallowReactive({ count: 0 });
    const container = mount(
        defineComponent({
            setup() {
                const form = useForm({ accepted: true, profile: { notes: 'Original' } });
                return () =>
                    h('form', [
                        h(component('Checkbox'), {
                            form,
                            field: 'accepted',
                            defaultChecked: false,
                            'data-count': state.count,
                        }),
                        h(component('Textarea'), {
                            form,
                            fieldName: 'profile.notes',
                            defaultValue: 'Native default',
                            'data-count': state.count,
                        }),
                        h(
                            'button',
                            { type: 'button', onClick: () => form.reset() },
                            'Reset Inertia',
                        ),
                        h(
                            'button',
                            {
                                type: 'button',
                                onClick: () => form.setError('profile.notes', 'Please revise.'),
                            },
                            'Set errors',
                        ),
                        h('output', { id: 'accepted' }, String(form.accepted)),
                        h('output', { id: 'notes' }, form.profile.notes),
                    ]);
            },
        }),
    );
    const checkbox = host(container, 'wa-checkbox');
    const textarea = host(container, 'wa-textarea');
    const nativeForm = container.querySelector('form');
    if (!nativeForm) throw new Error('Expected form.');
    await Promise.all([ready(checkbox), ready(textarea)]);
    await expect.poll(() => Reflect.get(checkbox, 'checked'), { timeout: 10000 }).toBe(true);
    await expect.poll(() => Reflect.get(textarea, 'value'), { timeout: 10000 }).toBe('Original');
    Reflect.set(textarea, 'value', 'Edited');
    textarea.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    await nextTick();
    expect(container.querySelector('#notes')?.textContent).toBe('Edited');
    nativeForm.addEventListener('reset', (event) => event.preventDefault(), { once: true });
    nativeForm.reset();
    await ready(textarea);
    expect(container.querySelector('#notes')?.textContent).toBe('Edited');
    nativeForm.reset();
    await ready(textarea);
    expect(container.querySelector('#notes')?.textContent).toBe('Native default');
    expect(container.querySelector('#accepted')?.textContent).toBe('false');
    container.querySelector<HTMLButtonElement>('button')?.click();
    await ready(textarea);
    expect(Reflect.get(textarea, 'value')).toBe('Original');
    expect(Reflect.get(checkbox, 'checked')).toBe(true);
    container.querySelectorAll<HTMLButtonElement>('button')[1]?.click();
    await ready(textarea);
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
    expect(textarea.querySelector('[slot="hint"]')?.textContent).toBe('Please revise.');
    expect(textarea.hasAttribute('field')).toBe(false);
    expect(textarea.getAttribute('form')).not.toBe('[object Object]');
});

test('cancelled open requests reconcile the model and retain the original cancelable event', async () => {
    const state = shallowReactive({ open: false });
    const events: Event[] = [];
    const container = mount({
        render: () =>
            h(controls.Details, {
                open: state.open,
                'onUpdate:open': (value: boolean) => {
                    state.open = value;
                },
                onWaShow: (event: Event) => {
                    events.push(event);
                    event.preventDefault();
                },
            }),
    });
    const element = host(container, 'wa-details');
    await ready(element);
    state.open = true;
    await ready(element);
    await ready(element);
    expect(events).toHaveLength(1);
    expect(events[0]?.defaultPrevented).toBe(true);
    expect(Reflect.get(element, 'open')).toBe(false);
    expect(state.open).toBe(false);
});

for (const item of [
    { name: 'AccordionItem', tag: 'wa-accordion-item', property: 'expanded' },
    { name: 'TreeItem', tag: 'wa-tree-item', property: 'selected' },
    { name: 'AnimatedImage', tag: 'wa-animated-image', property: 'play' },
    { name: 'Page', tag: 'wa-page', property: 'navOpen' },
] satisfies { name: keyof typeof controls; tag: string; property: string }[]) {
    test(`${item.name} observes its documented reflected state without manufacturing native events`, async () => {
        const state = shallowReactive({ value: false, count: 0, width: '900px' });
        const container = mount({
            render: () =>
                h(
                    component(item.name),
                    {
                        ...(item.name === 'Page'
                            ? { mobileBreakpoint: '600px', style: { width: state.width } }
                            : {}),
                        [item.property]: state.value,
                        [`onUpdate:${item.property}`]: (value: boolean) => {
                            state.value = value;
                        },
                        'data-count': state.count,
                    },
                    () =>
                        item.name === 'Page'
                            ? [h('div', { slot: 'navigation' }, 'Navigation'), h('main', 'Main')]
                            : 'Content',
                ),
        });
        const element = host(container, item.tag);
        await ready(element);
        if (item.name === 'Page') {
            await expect.poll(() => Reflect.get(element, 'view')).toBe('desktop');
            state.width = '390px';
            await expect.poll(() => Reflect.get(element, 'view')).toBe('mobile');
            await ready(element);
        }
        await expect.poll(() => Reflect.get(element, item.property)).toBe(false);
        Reflect.set(element, item.property, true);
        await expect.poll(() => state.value).toBe(true);
        state.count++;
        await ready(element);
        expect(Reflect.get(element, item.property)).toBe(true);
        state.value = false;
        await expect.poll(() => Reflect.get(element, item.property)).toBe(false);
    });
}

test('Carousel uses its public method and native committed event for currentSlide', async () => {
    const state = shallowReactive({ slide: 1 });
    const indexes: unknown[] = [];
    const container = mount({
        render: () =>
            h(
                controls.Carousel,
                {
                    currentSlide: state.slide,
                    'onUpdate:currentSlide': (value: number) => {
                        state.slide = value;
                    },
                    onWaSlideChange: (event: CustomEvent<{ index: number }>) =>
                        indexes.push(event.detail.index),
                    style: { width: '300px' },
                },
                () =>
                    [0, 1, 2].map((index) =>
                        h(controls.CarouselItem, { style: { height: '80px' } }, () =>
                            String(index),
                        ),
                    ),
            ),
    });
    const element = host(container, 'wa-carousel');
    await ready(element);
    await expect.poll(() => indexes.at(-1)).toBe(1);
    expect(state.slide).toBe(1);
    state.slide = 2;
    await expect.poll(() => indexes.at(-1)).toBe(2);
    expect(state.slide).toBe(2);
    const goToSlide: unknown = Reflect.get(element, 'goToSlide');
    if (typeof goToSlide !== 'function') throw new Error('Expected public goToSlide method.');
    Reflect.apply(goToSlide, element, [0, 'auto']);
    await expect.poll(() => state.slide).toBe(0);
});

test('Animation commits actual finish state and unrelated renders do not restart playback', async () => {
    const state = shallowReactive({ play: true, count: 0 });
    const events: string[] = [];
    const container = mount({
        render: () =>
            h(
                controls.Animation,
                {
                    play: state.play,
                    'onUpdate:play': (value: boolean) => {
                        state.play = value;
                    },
                    name: 'fadeIn',
                    duration: 20,
                    iterations: 1,
                    'data-count': state.count,
                    onWaStart: () => events.push('start'),
                    onWaFinish: () => events.push('finish'),
                },
                () => h('div', 'Animation target'),
            ),
    });
    const element = host(container, 'wa-animation');
    await ready(element);
    await expect.poll(() => state.play).toBe(false);
    expect(Reflect.get(element, 'play')).toBe(false);
    expect(events).toContain('finish');
    const started = events.filter((name) => name === 'start').length;
    state.count++;
    await ready(element);
    expect(events.filter((name) => name === 'start')).toHaveLength(started);
});

test('pending registration reads the latest bound model and ignores native initialization events', async () => {
    let finish: (() => void) | undefined;
    const loading = new Promise<void>((resolve) => {
        finish = resolve;
    });
    const state = shallowReactive({ checked: true });
    const updates: boolean[] = [];
    const Harness = defineComponent({
        props: { modelValue: Boolean },
        emits: ['update:modelValue'],
        setup(props, { emit }) {
            const model = useWebAwesomeModel(props, {
                name: 'modelValue',
                property: 'checked',
                events: ['change'],
                form: true,
                componentName: 'Checkbox',
                acceptsWrite: modelDomains.boolean,
                acceptsRead: modelDomains.boolean,
                emitValue: (value) => emit('update:modelValue', value),
            });
            const adapter = useWebAwesome([checkboxDefinition], 'wa-checkbox', () => loading, {
                props,
                models: [model],
            });
            return () => h('wa-checkbox', { ref: 'element', ...adapter.bindings() });
        },
    });
    const container = mount({
        render: () =>
            h(Harness, {
                modelValue: state.checked,
                'onUpdate:modelValue': (value: boolean) => {
                    updates.push(value);
                    state.checked = value;
                },
            }),
    });
    const element = host(container, 'wa-checkbox');
    await ready(element);
    Reflect.set(element, 'checked', false);
    element.dispatchEvent(new Event('change', { bubbles: true }));
    expect(updates).toEqual([]);
    state.checked = false;
    await nextTick();
    finish?.();
    await ready(element);
    expect(Reflect.get(element, 'checked')).toBe(false);
    state.checked = true;
    await ready(element);
    expect(Reflect.get(element, 'checked')).toBe(true);
});

for (const item of [
    {
        name: 'KnownDate',
        tag: 'wa-known-date',
        initial: new Date(2026, 10, 9),
        next: new Date(2026, 10, 10),
    },
    { name: 'TagInput', tag: 'wa-tag-input', initial: new FormData(), next: new FormData() },
] satisfies { name: keyof typeof controls; tag: string; initial: unknown; next: unknown }[]) {
    test(`${item.name} writes rich values by identity only when the external value changes`, async () => {
        const state = shallowReactive<{ value: unknown; count: number }>({
            value: item.initial,
            count: 0,
        });
        const container = mount({
            render: () =>
                h(component(item.name), {
                    modelValue: state.value,
                    'onUpdate:modelValue': (value: unknown) => {
                        state.value = value;
                    },
                    'data-count': state.count,
                }),
        });
        const element = host(container, item.tag);
        await ready(element);
        let prototype: object | null = element;
        let descriptor: PropertyDescriptor | undefined;
        while (prototype && !descriptor) {
            descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
            prototype = Reflect.getPrototypeOf(prototype);
        }
        if (!descriptor?.set || !descriptor.get)
            throw new Error('Expected public native value accessors.');
        const getter = descriptor.get.bind(element);
        const setter = descriptor.set.bind(element);
        const writes: unknown[] = [];
        Object.defineProperty(element, 'value', {
            configurable: true,
            get: () => getter(),
            set: (value: unknown) => {
                writes.push(value);
                setter(value);
            },
        });
        state.value = item.next;
        await ready(element);
        expect(writes).toHaveLength(1);
        expect(writes[0]).toBe(item.next);
        state.count++;
        await ready(element);
        expect(writes).toHaveLength(1);
    });
}

test('DropdownItem reads its owning dropdown selection without forwarding unrelated item state', async () => {
    const state = shallowReactive({ first: false, second: false });
    const container = mount({
        render: () =>
            h(controls.Dropdown, { open: true }, () => [
                h('button', { slot: 'trigger' }, 'Options'),
                h(
                    controls.DropdownItem,
                    {
                        type: 'checkbox',
                        checked: state.first,
                        'onUpdate:checked': (value: boolean) => {
                            state.first = value;
                        },
                    },
                    () => 'First',
                ),
                h(
                    controls.DropdownItem,
                    {
                        type: 'checkbox',
                        checked: state.second,
                        'onUpdate:checked': (value: boolean) => {
                            state.second = value;
                        },
                    },
                    () => 'Second',
                ),
            ]),
    });
    const dropdown = host(container, 'wa-dropdown');
    await ready(dropdown);
    const items = [...container.querySelectorAll<HTMLElement>('wa-dropdown-item')];
    const first = items[0];
    const second = items[1];
    if (!first || !second) throw new Error('Expected two checkbox items.');
    await Promise.all([ready(first), ready(second)]);
    first.click();
    await expect.poll(() => state.first).toBe(true);
    expect(state.second).toBe(false);
});

test('Rating retains its host, native value and focus when validation activates and the source changes', async () => {
    const state = shallowReactive<{ failed?: string; bound: boolean; value: number }>({
        bound: false,
        value: 2,
    });
    const updates: number[] = [];
    const container = mount({
        render: () =>
            h(component('Rating'), {
                ...(state.failed === undefined ? {} : { failed: state.failed }),
                ...(state.bound
                    ? {
                          modelValue: state.value,
                          'onUpdate:modelValue': (value: number) => {
                              updates.push(value);
                              state.value = value;
                          },
                      }
                    : {}),
            }),
    });
    const rating = host(container, 'wa-rating');
    await ready(rating);
    Reflect.set(rating, 'value', 3);
    rating.focus();
    expect(document.activeElement).toBe(rating);
    state.failed = 'Choose a score.';
    await ready(rating);
    expect(host(container, 'wa-rating')).toBe(rating);
    expect(Reflect.get(rating, 'value')).toBe(3);
    expect(document.activeElement).toBe(rating);
    state.bound = true;
    await expect.poll(() => Reflect.get(rating, 'value')).toBe(2);
    expect(host(container, 'wa-rating')).toBe(rating);
    Reflect.set(rating, 'value', 4);
    rating.dispatchEvent(new Event('change', { bubbles: true }));
    expect(state.value).toBe(4);
    expect(updates.at(-1)).toBe(4);
    state.bound = false;
    state.failed = undefined;
    await ready(rating);
    expect(host(container, 'wa-rating')).toBe(rating);
    expect(Reflect.get(rating, 'value')).toBe(4);
    expect(document.activeElement).toBe(rating);
});

for (const item of [
    { name: 'TagInput', tag: 'wa-tag-input', attrs: {} },
    { name: 'Select', tag: 'wa-select', attrs: { multiple: true } },
] satisfies { name: keyof typeof controls; tag: string; attrs: object }[]) {
    test(`${item.name} applies in-place reactive model array edits without requiring replacement`, async () => {
        const state = reactive({ values: ['one'], count: 0 });
        const container = mount({
            render: () =>
                h(
                    component(item.name),
                    {
                        ...item.attrs,
                        modelValue: state.values,
                        'onUpdate:modelValue': (value: string[] | string | null) => {
                            if (Array.isArray(value)) state.values = value;
                        },
                        'data-count': state.count,
                    },
                    () => ['one', 'two'].map((value) => h(controls.Option, { value }, () => value)),
                ),
        });
        const element = host(container, item.tag);
        await ready(element);
        await expect.poll(() => Reflect.get(element, 'value')).toEqual(['one']);
        state.values.push('two');
        await expect.poll(() => Reflect.get(element, 'value')).toEqual(['one', 'two']);
        state.values.splice(0, 1);
        await expect.poll(() => Reflect.get(element, 'value')).toEqual(['two']);
        state.count++;
        await ready(element);
        expect(Reflect.get(element, 'value')).toEqual(['two']);
    });
}

for (const namedSlot of [false, true]) {
    test(`Rating keeps its native slot and transparent frame assignment through validation using ${namedSlot ? 'Vue named slots' : 'native slot attributes'}`, async () => {
        const state = shallowReactive<{ failed?: string }>({});
        const rating = () =>
            h(component('Rating'), {
                ...(namedSlot ? {} : { slot: 'footer' }),
                value: 3,
                class: 'caller-rating',
                ...(state.failed === undefined ? {} : { failed: state.failed }),
            });
        const container = mount({
            render: () =>
                h(controls.Card, {}, namedSlot ? { footer: rating } : { default: rating }),
        });
        const element = host(container, 'wa-rating');
        await ready(element);
        const frame = element.parentElement;
        if (!frame) throw new Error('Expected stable presentation element.');
        await expect.poll(() => frame.assignedSlot?.name).toBe('footer');
        expect(element.slot).toBe('footer');
        expect(frame.localName).toBe('fa-form-field-frame');
        expect(element.classList.contains('caller-rating')).toBe(true);
        expect(frame.classList.contains('caller-rating')).toBe(false);
        state.failed = 'Choose a rating.';
        await ready(element);
        expect(host(container, 'wa-rating')).toBe(element);
        expect(element.parentElement).toBe(frame);
        expect(frame.assignedSlot?.name).toBe('footer');
        state.failed = undefined;
        await ready(element);
        expect(frame.assignedSlot?.name).toBe('footer');
    });
}
