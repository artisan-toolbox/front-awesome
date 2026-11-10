import { expect, onTestFinished, test } from 'vite-plus/test';
import { createApp, h, nextTick, reactive, shallowRef } from 'vue';
import type { Component, ComponentPublicInstance } from 'vue';
import type WaTooltip from '@awesome.me/webawesome/dist/components/tooltip/tooltip.js';
import Tooltip from '@artisan-toolbox/front-awesome/components/WebAwesome/Tooltip.vue';
import BareBooleanTooltip from './BareBooleanTooltip.vue';

function mount(component: Component) {
    const container = document.createElement('div');
    document.body.append(container);
    const app = createApp(component);
    app.mount(container);
    onTestFinished(() => {
        app.unmount();
        container.remove();
    });
    const tooltip = container.querySelector<WaTooltip>('wa-tooltip');
    if (!tooltip) throw new Error('Expected the public Tooltip component.');
    return { tooltip, container, app };
}

async function ready(tooltip: WaTooltip) {
    await customElements.whenDefined('wa-tooltip');
    await nextTick();
    await tooltip.updateComplete;
}

test('preserves booleans and numeric aliases before registration, after registration and through updates', async () => {
    expect(customElements.get('wa-tooltip')).toBeUndefined();
    const state = reactive({ enabled: false, delay: 25, offset: 12 });
    const { tooltip } = mount({
        render: () =>
            h(Tooltip, {
                disabled: state.enabled,
                open: state.enabled,
                withoutArrow: state.enabled,
                showDelay: state.delay,
                hideDelay: state.delay,
                distance: state.offset,
                skidding: state.offset,
            }),
    });
    const bare = mount(BareBooleanTooltip).tooltip;
    const kebab = mount({
        render: () =>
            h(Tooltip, {
                'without-arrow': state.enabled,
                'show-delay': state.delay,
                'hide-delay': state.delay,
            }),
    }).tooltip;
    const initiallyOpen = mount({
        render: () => h(Tooltip, { open: true, trigger: 'manual' }, () => 'Open help'),
    }).tooltip;
    expect(initiallyOpen.hasAttribute('open')).toBe(true);
    expect(kebab.getAttribute('show-delay')).toBe('25');
    expect(kebab.getAttribute('hide-delay')).toBe('25');
    const defaults = mount({ render: () => h(Tooltip) }).tooltip;
    expect(tooltip.hasAttribute('disabled')).toBe(false);
    expect(tooltip.hasAttribute('open')).toBe(false);
    expect(tooltip.hasAttribute('without-arrow')).toBe(false);
    expect(tooltip.getAttribute('show-delay')).toBe('25');
    expect(tooltip.getAttribute('hide-delay')).toBe('25');
    expect(tooltip.hasAttribute('showdelay')).toBe(false);
    expect(defaults.hasAttribute('show-delay')).toBe(false);
    expect(defaults.hasAttribute('hide-delay')).toBe(false);
    for (const name of ['disabled', 'open', 'without-arrow'])
        expect(bare.hasAttribute(name)).toBe(true);
    await ready(tooltip);
    await ready(bare);
    await ready(defaults);
    await ready(kebab);
    await ready(initiallyOpen);
    await expect.poll(() => initiallyOpen.body.hidden).toBe(false);
    expect(initiallyOpen.open).toBe(true);
    await initiallyOpen.hide();
    expect(defaults.showDelay).toBe(150);
    expect(defaults.hideDelay).toBe(0);
    expect(bare.disabled).toBe(true);
    expect(bare.withoutArrow).toBe(true);
    const after = mount({
        render: () =>
            h(Tooltip, {
                disabled: state.enabled,
                open: state.enabled,
                'without-arrow': state.enabled,
                'show-delay': state.delay,
                'hide-delay': state.delay,
                distance: state.offset,
                skidding: state.offset,
            }),
    }).tooltip;
    for (const enabled of [true, false]) {
        state.enabled = enabled;
        state.delay = enabled ? 0 : 30;
        state.offset = enabled ? 0 : -3;
        await ready(tooltip);
        await ready(after);
        for (const element of [tooltip, after]) {
            expect(element.disabled).toBe(enabled);
            expect(element.withoutArrow).toBe(enabled);
            expect(element.hasAttribute('disabled')).toBe(enabled);
            expect(element.hasAttribute('without-arrow')).toBe(enabled);
            expect(element.showDelay).toBe(state.delay);
            expect(element.hideDelay).toBe(state.delay);
            expect(element.distance).toBe(state.offset);
            expect(element.skidding).toBe(state.offset);
            expect(element.getAttribute('show-delay')).toBe(String(state.delay));
        }
    }
});

test('uses the default slot as body and preserves native focus, Escape, events and retarget cleanup', async () => {
    const state = reactive({ target: 'tooltip-first', visible: true });
    const events: Event[] = [];
    const observed: Event[] = [];
    const record = (event: Event) => events.push(event);
    const { tooltip, container } = mount({
        render: () =>
            h('div', [
                h('span', { id: 'existing-label' }, 'Status'),
                h('button', { id: 'tooltip-first', 'aria-labelledby': 'existing-label' }, 'First'),
                h('button', { id: 'tooltip-second' }, 'Second'),
                state.visible
                    ? h(
                          Tooltip,
                          {
                              for: state.target,
                              showDelay: 0,
                              onWaShow: record,
                              onWaAfterShow: record,
                              onWaHide: record,
                              onWaAfterHide: record,
                          },
                          () => [h('strong', 'Ready'), ' for review'],
                      )
                    : null,
            ]),
    });
    for (const name of ['wa-show', 'wa-after-show', 'wa-hide', 'wa-after-hide'])
        tooltip.addEventListener(name, (event) => observed.push(event));
    await ready(tooltip);
    const first = container.querySelector<HTMLButtonElement>('#tooltip-first');
    const second = container.querySelector<HTMLButtonElement>('#tooltip-second');
    if (!first || !second) throw new Error('Expected external focusable targets.');
    expect(tooltip.anchor).toBe(first);
    expect(tooltip.querySelector('strong')?.textContent).toBe('Ready');
    expect(tooltip.className).toBe('');
    expect(tooltip.getAttribute('style')).toBeNull();
    expect(first.getAttribute('aria-labelledby')).toBe(`existing-label ${tooltip.id}`);
    first.focus();
    await expect
        .poll(() => events.map((event) => event.type))
        .toEqual(['wa-show', 'wa-after-show']);
    expect(tooltip.open).toBe(true);
    expect(tooltip.body.hidden).toBe(false);
    document.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true }),
    );
    await expect
        .poll(() => events.map((event) => event.type))
        .toEqual(['wa-show', 'wa-after-show', 'wa-hide', 'wa-after-hide']);
    expect(tooltip.open).toBe(false);
    expect(tooltip.body.hidden).toBe(true);
    expect(events).toEqual(observed);
    for (const [index, event] of events.entries()) {
        expect(event).toBe(observed[index]);
        expect(event.target).toBe(tooltip);
    }
    state.target = 'tooltip-second';
    await ready(tooltip);
    expect(tooltip.anchor).toBe(second);
    expect(first.getAttribute('aria-labelledby')).toBe('existing-label');
    expect(second.getAttribute('aria-labelledby')).toBe(tooltip.id);
    first.blur();
    first.focus();
    await ready(tooltip);
    expect(tooltip.open).toBe(false);
    state.visible = false;
    await nextTick();
    expect(second.hasAttribute('aria-labelledby')).toBe(false);
});

test('delegates manual methods through the Vue host and retains cancelable original native events', async () => {
    const instance = shallowRef<ComponentPublicInstance | null>(null);
    const events: Event[] = [];
    const observed: Event[] = [];
    const state = reactive({ cancelShow: false, cancelHide: false, disabled: false, open: false });
    const { tooltip } = mount({
        render: () =>
            h('div', [
                h('button', { id: 'tooltip-manual' }, 'Manual target'),
                h(
                    Tooltip,
                    {
                        ref: instance,
                        for: 'tooltip-manual',
                        trigger: 'manual',
                        disabled: state.disabled,
                        open: state.open,
                        onWaShow: (event: Event) => {
                            events.push(event);
                            if (state.cancelShow) event.preventDefault();
                        },
                        onWaAfterShow: (event: Event) => events.push(event),
                        onWaHide: (event: Event) => {
                            events.push(event);
                            if (state.cancelHide) event.preventDefault();
                        },
                        onWaAfterHide: (event: Event) => events.push(event),
                    },
                    () => 'Manual help',
                ),
            ]),
    });
    for (const name of ['wa-show', 'wa-after-show', 'wa-hide', 'wa-after-hide'])
        tooltip.addEventListener(name, (event) => observed.push(event));
    await ready(tooltip);
    expect(instance.value?.$el).toBe(tooltip);
    const host: unknown = instance.value?.$el;
    const { default: NativeTooltip } =
        await import('#front-awesome-webawesome/components/tooltip/tooltip.js');
    if (!(host instanceof NativeTooltip)) throw new Error('Expected the native tooltip host.');
    await host.show();
    expect(tooltip.open).toBe(true);
    await host.hide();
    expect(tooltip.body.hidden).toBe(true);
    expect(events.map((event) => event.type)).toEqual([
        'wa-show',
        'wa-after-show',
        'wa-hide',
        'wa-after-hide',
    ]);
    for (const [index, event] of events.entries()) expect(event).toBe(observed[index]);
    state.cancelShow = true;
    void tooltip.show();
    await expect
        .poll(() => events.some((event) => event.type === 'wa-show' && event.defaultPrevented))
        .toBe(true);
    await ready(tooltip);
    expect(tooltip.open).toBe(false);
    expect(events.filter((event) => event.type === 'wa-after-show')).toHaveLength(1);
    state.cancelShow = false;
    await tooltip.show();
    state.cancelHide = true;
    void tooltip.hide();
    await expect
        .poll(() => events.some((event) => event.type === 'wa-hide' && event.defaultPrevented))
        .toBe(true);
    await ready(tooltip);
    expect(tooltip.open).toBe(true);
    state.cancelHide = false;
    await tooltip.hide();
    state.open = true;
    await ready(tooltip);
    await expect.poll(() => tooltip.body.hidden).toBe(false);
    state.open = false;
    await ready(tooltip);
    await expect.poll(() => tooltip.body.hidden).toBe(true);
    state.disabled = true;
    await ready(tooltip);
    const completedShows = events.filter((event) => event.type === 'wa-after-show').length;
    void tooltip.show();
    await ready(tooltip);
    expect(tooltip.body.hidden).toBe(true);
    expect(events.filter((event) => event.type === 'wa-after-show')).toHaveLength(completedShows);
});

test('keeps missing targets unbound until for changes and supports same-root target IDs', async () => {
    const state = reactive({ target: 'missing-target', visible: false });
    const { tooltip, container } = mount({
        render: () =>
            h('div', [
                state.visible ? h('button', { id: 'missing-target' }, 'Late target') : null,
                h(Tooltip, { for: state.target }, () => 'Help'),
            ]),
    });
    await ready(tooltip);
    expect(tooltip.anchor).toBeNull();
    state.visible = true;
    await ready(tooltip);
    expect(container.querySelector('#missing-target')).not.toBeNull();
    expect(tooltip.anchor).toBeNull();
    state.target = '';
    await ready(tooltip);
    state.target = 'missing-target';
    await ready(tooltip);
    expect(tooltip.anchor).toBe(container.querySelector('#missing-target'));
});
