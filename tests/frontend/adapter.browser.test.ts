import { expect, onTestFinished, test, vi } from 'vite-plus/test';
import {
    createCommentVNode,
    createApp,
    defineComponent,
    Fragment,
    h,
    markRaw,
    nextTick,
    reactive,
} from 'vue';
import type { Component } from 'vue';
import type WaCheckbox from '@awesome.me/webawesome/dist/components/checkbox/checkbox.js';
import type WaSelect from '@awesome.me/webawesome/dist/components/select/select.js';
import type WaTextarea from '@awesome.me/webawesome/dist/components/textarea/textarea.js';
import type WaPopup from '@awesome.me/webawesome/dist/components/popup/popup.js';
import type WaFormatDate from '@awesome.me/webawesome/dist/components/format-date/format-date.js';
import Checkbox from '@artisan-toolbox/front-awesome/components/WebAwesome/Checkbox.vue';
import Select from '@artisan-toolbox/front-awesome/components/WebAwesome/Select.vue';
import Option from '@artisan-toolbox/front-awesome/components/WebAwesome/Option.vue';
import Textarea from '@artisan-toolbox/front-awesome/components/WebAwesome/Textarea.vue';
import Popup from '@artisan-toolbox/front-awesome/components/WebAwesome/Popup.vue';
import FormatDate from '@artisan-toolbox/front-awesome/components/WebAwesome/FormatDate.vue';
import { useWebAwesome } from '../../resources/js/WebAwesome/useWebAwesome';
import { checkboxDefinition } from '../../resources/js/WebAwesome/componentDefinitions';

function mount(component: Component) {
    const container = document.createElement('div');
    document.body.append(container);
    const app = createApp(component);
    app.mount(container);
    onTestFinished(() => {
        app.unmount();
        container.remove();
    });
    return { container, app };
}

function find<T extends HTMLElement>(container: HTMLElement, tag: string): T {
    const element = container.querySelector<T>(tag);
    if (!element) throw new Error(`Expected ${tag}.`);
    return element;
}

async function ready(element: HTMLElement & { updateComplete: Promise<boolean> }) {
    await vi.dynamicImportSettled();
    await customElements.whenDefined(element.localName);
    await nextTick();
    await new Promise(requestAnimationFrame);
    await element.updateComplete;
}

function deferredCheckbox(load: () => Promise<unknown>) {
    return defineComponent({
        inheritAttrs: false,
        setup() {
            const { bindings, slotContent } = useWebAwesome(
                [checkboxDefinition],
                'wa-checkbox',
                async () => {
                    await import('#front-awesome-webawesome/components/checkbox/checkbox.js');
                    await load();
                },
            );
            return () => h('wa-checkbox', { ref: 'element', ...bindings() }, slotContent());
        },
    });
}

test('initializes native checkbox defaults before registration and respects optional presence booleans', async () => {
    expect(customElements.get('wa-checkbox')).toBeUndefined();
    const state = reactive({ enabled: false });
    const bareAttributes: Record<string, unknown> = { checked: '' };
    const { container } = mount({
        render: () =>
            h('div', [
                h(Checkbox, { ...bareAttributes, disabled: state.enabled, 'data-kind': 'bare' }),
                h(Checkbox, { checked: false, required: state.enabled, 'data-kind': 'false' }),
                h(Checkbox, { 'data-kind': 'absent' }),
            ]),
    });
    const [bare, bound, absent] = [...container.querySelectorAll<WaCheckbox>('wa-checkbox')];
    if (!bare || !bound || !absent) throw new Error('Expected three checkboxes.');
    expect(bare.hasAttribute('checked')).toBe(true);
    expect(bound.hasAttribute('checked')).toBe(false);
    expect(absent.hasAttribute('checked')).toBe(false);
    expect(Object.hasOwn(bare, 'checked')).toBe(false);
    await Promise.all([ready(bare), ready(bound), ready(absent)]);
    expect(bare.checked).toBe(true);
    expect(bare.defaultChecked).toBe(true);
    expect(bound.checked).toBe(false);
    expect(absent.checked).toBe(false);
    expect(absent.size).toBe('m');
    for (const enabled of [true, false]) {
        state.enabled = enabled;
        await ready(bare);
        await ready(bound);
        expect(bare.disabled).toBe(enabled);
        expect(bound.required).toBe(enabled);
    }
});

for (const loading of ['registered', 'pending']) {
    test(`keeps current checked state separate from explicit reset defaults and preserves interaction on unrelated renders with a ${loading} loader`, async () => {
        let release: () => void = () => {};
        const gate = new Promise<void>((resolve) => {
            release = resolve;
        });
        onTestFinished(release);
        const component: Component =
            loading === 'pending' ? deferredCheckbox(() => gate) : Checkbox;
        const state = reactive({ checked: true, count: 0 });
        const { container } = mount({
            render: () =>
                h('form', [
                    h(component, {
                        checked: state.checked,
                        defaultChecked: false,
                        name: 'consent',
                        value: 'yes',
                        'data-count': state.count,
                    }),
                ]),
        });
        const checkbox = find<WaCheckbox>(container, 'wa-checkbox');
        const form = find<HTMLFormElement>(container, 'form');
        await ready(checkbox);
        release();
        await expect
            .poll(() => ({
                checked: checkbox.checked,
                defaultChecked: checkbox.defaultChecked,
                consent: new FormData(form).get('consent'),
            }))
            .toEqual({ checked: true, defaultChecked: false, consent: 'yes' });
        checkbox.click();
        await ready(checkbox);
        expect(checkbox.checked).toBe(false);
        state.count++;
        await ready(checkbox);
        expect(checkbox.checked).toBe(false);
        state.checked = false;
        await ready(checkbox);
        state.checked = true;
        await ready(checkbox);
        expect(checkbox.checked).toBe(true);
        form.addEventListener('reset', (event) => event.preventDefault(), { once: true });
        form.reset();
        await ready(checkbox);
        expect(checkbox.checked).toBe(true);
        form.reset();
        await ready(checkbox);
        expect(checkbox.checked).toBe(false);
        expect(new FormData(form).has('consent')).toBe(false);
    });
}

test('defaultChecked alone initializes the native state without acting as a live checked binding', async () => {
    const state = reactive({ count: 0 });
    const { container } = mount({
        render: () => h(Checkbox, { defaultChecked: true, 'data-count': state.count }),
    });
    const checkbox = find<WaCheckbox>(container, 'wa-checkbox');
    await ready(checkbox);
    expect(checkbox.checked).toBe(true);
    checkbox.click();
    await ready(checkbox);
    state.count++;
    await ready(checkbox);
    expect(checkbox.checked).toBe(false);
    expect(checkbox.defaultChecked).toBe(true);
});

test('stops imposing removed property bindings and applies them again when supplied anew', async () => {
    const state = reactive({ supplied: true, count: 0 });
    const { container } = mount({
        render: () =>
            h(Checkbox, {
                ...(state.supplied ? { checked: true } : {}),
                'data-count': state.count,
            }),
    });
    const checkbox = find<WaCheckbox>(container, 'wa-checkbox');
    await ready(checkbox);
    state.supplied = false;
    await ready(checkbox);
    expect(checkbox.checked).toBe(true);
    checkbox.click();
    await ready(checkbox);
    expect(checkbox.checked).toBe(false);
    state.count++;
    await ready(checkbox);
    expect(checkbox.checked).toBe(false);
    state.supplied = true;
    await ready(checkbox);
    expect(checkbox.checked).toBe(true);
});

test('preserves textarea current values, reset values and enumerated boolean converters', async () => {
    const state = reactive({ value: 'Current', defaultValue: 'Reset', enabled: false, count: 0 });
    const { container } = mount({
        render: () =>
            h('form', [
                h(Textarea, {
                    value: state.value,
                    defaultValue: state.defaultValue,
                    autocorrect: state.enabled,
                    spellcheck: state.enabled,
                    'data-count': state.count,
                }),
            ]),
    });
    const textarea = find<WaTextarea>(container, 'wa-textarea');
    await ready(textarea);
    expect(textarea.value).toBe('Current');
    expect(textarea.defaultValue).toBe('Reset');
    expect(textarea.getAttribute('autocorrect')).toBe('off');
    expect(textarea.getAttribute('spellcheck')).toBe('false');
    textarea.value = 'Typed';
    state.count++;
    await ready(textarea);
    expect(textarea.value).toBe('Typed');
    state.enabled = true;
    state.defaultValue = 'New reset';
    await ready(textarea);
    expect(textarea.getAttribute('autocorrect')).toBe('on');
    expect(textarea.getAttribute('spellcheck')).toBe('true');
    expect(textarea.value).toBe('Typed');
    find<HTMLFormElement>(container, 'form').reset();
    await ready(textarea);
    expect(textarea.value).toBe('New reset');
});

test('passes arrays and callbacks as native properties and leaves options as direct children', async () => {
    const values = ['email', 'sms'];
    const getTag: WaSelect['getTag'] = (option) => option.label;
    const { container } = mount({
        render: () =>
            h(Select, { multiple: true, value: values, getTag }, () => [
                h(Fragment, [
                    h(Option, { value: 'email' }, () => 'Email'),
                    h(Option, { value: 'sms' }, () => 'SMS'),
                ]),
            ]),
    });
    const select = find<WaSelect>(container, 'wa-select');
    expect(select.getAttribute('value')).toBeNull();
    expect(Object.hasOwn(select, 'getTag')).toBe(false);
    await ready(select);
    await expect.poll(() => select.value).toEqual(values);
    expect(select.getTag).toBe(getTag);
    expect(select.querySelectorAll(':scope > wa-option')).toHaveLength(2);
});

test('preserves object inputs, exact native attribute names and consumer presentation', async () => {
    const anchor = document.createElement('button');
    const date = new Date('2025-04-10T12:00:00Z');
    const { container } = mount({
        render: () =>
            h('div', [
                h(Popup, {
                    anchor,
                    '^flipBoundary': '[]',
                    '^shiftBoundary': '[]',
                    class: 'consumer',
                    style: { color: 'red' },
                    'aria-label': 'Details',
                    'data-probe': 'popup',
                }),
                h(FormatDate, { date, year: 'numeric', timeZone: 'UTC' }),
            ]),
    });
    const popup = find<WaPopup>(container, 'wa-popup');
    const formatted = find<WaFormatDate>(container, 'wa-format-date');
    expect(popup.getAttribute('anchor')).toBeNull();
    expect(formatted.getAttribute('date')).toBeNull();
    await Promise.all([ready(popup), ready(formatted)]);
    expect(popup.anchor).toBe(anchor);
    expect(popup.flipBoundary).toEqual([]);
    expect(popup.shiftBoundary).toEqual([]);
    expect(popup.className).toBe('consumer');
    expect(popup.style.color).toBe('red');
    expect(popup.getAttribute('aria-label')).toBe('Details');
    expect(popup.getAttribute('data-probe')).toBe('popup');
    expect(formatted.date).toBe(date);
});

test('forwards original cancelable events exactly once and projects named slots without wrapping default children', async () => {
    const events: Event[] = [];
    const currentTargets: (EventTarget | null)[] = [];
    const { container } = mount({
        render: () =>
            h(
                Select,
                {
                    onWaShow: (event: Event) => {
                        events.push(event);
                        currentTargets.push(event.currentTarget);
                        event.preventDefault();
                    },
                    onChange: (event: Event) => events.push(event),
                },
                {
                    default: () => [h(Option, { value: 'one' }, () => 'One')],
                    label: () => [h(Fragment, [h('strong', 'Choose'), 'Text'])],
                    hint: () => [h('small', { slot: 'end' }, 'Explicit slot')],
                },
            ),
    });
    const select = find<WaSelect>(container, 'wa-select');
    await ready(select);
    const event = new CustomEvent('wa-show', {
        detail: { source: 'consumer' },
        bubbles: true,
        composed: true,
        cancelable: true,
    });
    expect(select.dispatchEvent(event)).toBe(false);
    expect(events).toEqual([event]);
    expect(currentTargets).toEqual([select]);
    const change = new Event('change', { bubbles: true });
    select.dispatchEvent(change);
    expect(events).toEqual([event, change]);
    expect(select.querySelector(':scope > wa-option')).not.toBeNull();
    expect(select.querySelector(':scope > strong[slot="label"]')?.textContent).toBe('Choose');
    expect(select.querySelector(':scope > span[slot="label"]')?.textContent).toBe('Text');
    expect(select.querySelector(':scope > small[slot="end"]')?.textContent).toBe('Explicit slot');
});

test('uses the latest queued properties and abandons deferred writes after unmount', async () => {
    let release: () => void = () => {};
    const gate = new Promise<void>((resolve) => {
        release = resolve;
    });
    const delayed = deferredCheckbox(() => gate);
    const state = reactive({ checked: false });
    const { container, app } = mount({ render: () => h(markRaw(delayed), state) });
    const checkbox = find<WaCheckbox>(container, 'wa-checkbox');
    await ready(checkbox);
    state.checked = true;
    await nextTick();
    expect(checkbox.checked).toBe(false);
    release();
    await expect.poll(() => checkbox.checked).toBe(true);

    let finish: () => void = () => {};
    const pending = new Promise<void>((resolve) => {
        finish = resolve;
    });
    const disposable = defineComponent({
        inheritAttrs: false,
        setup() {
            const { bindings } = useWebAwesome([checkboxDefinition], 'wa-checkbox', () => pending);
            return () => h('wa-checkbox', { ref: 'element', ...bindings() });
        },
    });
    const second = mount({ render: () => h(disposable, { checked: false }) });
    const detached = find<WaCheckbox>(second.container, 'wa-checkbox');
    await ready(detached);
    detached.checked = true;
    second.app.unmount();
    app.unmount();
    finish();
    await nextTick();
    await Promise.resolve();
    expect(detached.checked).toBe(true);
});

test('preserves scalar reset attributes and explicitly supplied collection defaults', async () => {
    const initial = ['email', 'sms'];
    const { container } = mount({
        render: () =>
            h('form', [
                h(Select, { value: 'email', name: 'single' }, () => [
                    h(Option, { value: 'email' }, () => 'Email'),
                    h(Option, { value: 'sms' }, () => 'SMS'),
                ]),
                h(
                    Select,
                    { value: initial, defaultValue: initial, multiple: true, name: 'multiple' },
                    () => [
                        h(Option, { value: 'email' }, () => 'Email'),
                        h(Option, { value: 'sms' }, () => 'SMS'),
                    ],
                ),
            ]),
    });
    const [single, multiple] = [...container.querySelectorAll<WaSelect>('wa-select')];
    if (!single || !multiple) throw new Error('Expected both selects.');
    expect(single.getAttribute('value')).toBe('email');
    expect(multiple.getAttribute('value')).toBeNull();
    await Promise.all([ready(single), ready(multiple)]);
    expect(single.defaultValue).toBe('email');
    expect(multiple.defaultValue).toEqual(initial);
    single.value = 'sms';
    multiple.value = ['sms'];
    await Promise.all([ready(single), ready(multiple)]);
    const form = find<HTMLFormElement>(container, 'form');
    expect(new FormData(form).get('single')).toBe('sms');
    expect(new FormData(form).getAll('multiple')).toEqual(['sms']);
    form.reset();
    await Promise.all([ready(single), ready(multiple)]);
    expect(single.value).toBe('email');
    expect(multiple.value).toEqual(initial);
    expect(new FormData(form).getAll('multiple')).toEqual(initial);
});

test('supports explicit native property aliases and exposes the custom element through the wrapper ref', async () => {
    let root: unknown;
    const state = reactive({ checked: false });
    const attributes: Record<string, unknown> = { '.default-checked': true };
    const { container } = mount({
        render: () =>
            h(Checkbox, {
                ...attributes,
                '.checked': state.checked,
                ref: (instance) => {
                    if (instance && '$el' in instance) root = instance.$el;
                },
            }),
    });
    const checkbox = find<WaCheckbox>(container, 'wa-checkbox');
    await ready(checkbox);
    expect(root).toBe(checkbox);
    expect(checkbox.defaultChecked).toBe(true);
    expect(checkbox.checked).toBe(false);
    state.checked = true;
    await ready(checkbox);
    expect(checkbox.checked).toBe(true);
});

test('preserves the native hint fallback when a conditional named slot is empty', async () => {
    const visible = reactive({ hint: false });
    const { container } = mount({
        render: () =>
            h(
                Checkbox,
                { hint: 'Fallback hint' },
                {
                    hint: () =>
                        visible.hint ? h('span', 'Conditional hint') : createCommentVNode('v-if'),
                },
            ),
    });
    const checkbox = find<WaCheckbox>(container, 'wa-checkbox');
    await ready(checkbox);
    const slot = checkbox.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="hint"]');
    if (!slot) throw new Error('Missing native hint slot.');
    expect(slot.assignedElements()).toHaveLength(0);
    expect(slot.textContent).toContain('Fallback hint');
    visible.hint = true;
    await ready(checkbox);
    expect(slot.assignedElements()).toHaveLength(1);
    expect(slot.assignedElements()[0]?.textContent).toBe('Conditional hint');
    visible.hint = false;
    await ready(checkbox);
    expect(slot.assignedElements()).toHaveLength(0);
});

test('keeps rich current values out of textual reset defaults and matches native form resets', async () => {
    const { TagInput, TimeInput } =
        await import('@artisan-toolbox/front-awesome/components/WebAwesome');
    const initialTags = ['alpha', 'beta'];
    const initialTime = new Date(2026, 10, 9, 14, 30);
    const { container } = mount({
        render: () =>
            h('form', [h(TagInput, { value: initialTags }), h(TimeInput, { value: initialTime })]),
    });
    const tags = find<
        import('@awesome.me/webawesome/dist/components/tag-input/tag-input.js').default
    >(container, 'wa-tag-input');
    const time = find<
        import('@awesome.me/webawesome/dist/components/time-input/time-input.js').default
    >(container, 'wa-time-input');
    await Promise.all([ready(tags), ready(time)]);
    const nativeForm = document.createElement('form');
    const nativeTags = document.createElement('wa-tag-input');
    const nativeTime = document.createElement('wa-time-input');
    nativeForm.append(nativeTags, nativeTime);
    document.body.append(nativeForm);
    onTestFinished(() => nativeForm.remove());
    nativeTags.value = initialTags;
    nativeTime.value = initialTime;
    await Promise.all([ready(nativeTags), ready(nativeTime)]);
    expect(tags.value).toEqual(nativeTags.value);
    expect(time.value).toBe(nativeTime.value);
    expect(tags.defaultValue).toBe(nativeTags.defaultValue);
    expect(time.defaultValue).toBe(nativeTime.defaultValue);
    container.querySelector('form')?.reset();
    nativeForm.reset();
    await Promise.all([ready(tags), ready(time), ready(nativeTags), ready(nativeTime)]);
    expect(tags.value).toEqual(nativeTags.value);
    expect(time.value).toBe(nativeTime.value);
});
