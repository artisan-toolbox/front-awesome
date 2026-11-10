import { expect, onTestFinished, test } from 'vite-plus/test';
import { page, userEvent } from 'vitest/browser';
import { createApp, h, nextTick, reactive, shallowRef } from 'vue';
import type { Component, ComponentPublicInstance } from 'vue';
import type WaPopover from '@awesome.me/webawesome/dist/components/popover/popover.js';
import Button from '@artisan-toolbox/front-awesome/components/WebAwesome/Button.vue';
import Popover from '@artisan-toolbox/front-awesome/components/WebAwesome/Popover.vue';
import BareBooleanPopover from './BareBooleanPopover.vue';

function mount(component: Component) {
    const container = document.createElement('div');
    document.body.append(container);
    const app = createApp(component);
    app.mount(container);
    onTestFinished(() => {
        app.unmount();
        container.remove();
    });
    const popover = container.querySelector<WaPopover>('wa-popover');
    if (!popover) throw new Error('Expected the public Popover component.');
    return { popover, container };
}

async function ready(popover: WaPopover) {
    await customElements.whenDefined('wa-popover');
    await nextTick();
    await popover.updateComplete;
}

async function shown(popover: WaPopover, open: boolean) {
    await expect.poll(() => popover.open).toBe(open);
    await expect.poll(() => popover.dialog.open).toBe(open);
    await expect.poll(() => popover.popup.active).toBe(open);
}

test('preserves presence booleans and numeric offsets before registration, after registration and during updates', async () => {
    expect(customElements.get('wa-popover')).toBeUndefined();
    const state = reactive({ enabled: false, offset: 12 });
    const { popover } = mount({
        render: () =>
            h(Popover, {
                open: state.enabled,
                withoutArrow: state.enabled,
                distance: state.offset,
                skidding: state.offset,
            }),
    });
    const bare = mount(BareBooleanPopover).popover;
    const kebab = mount({ render: () => h(Popover, { 'without-arrow': state.enabled }) }).popover;
    const defaults = mount({ render: () => h(Popover) }).popover;
    expect(popover.hasAttribute('open')).toBe(false);
    expect(popover.hasAttribute('without-arrow')).toBe(false);
    expect(bare.hasAttribute('open')).toBe(true);
    expect(bare.hasAttribute('without-arrow')).toBe(true);
    expect(defaults.hasAttribute('distance')).toBe(false);
    await ready(popover);
    await ready(bare);
    await ready(kebab);
    await ready(defaults);
    expect(bare.open).toBe(true);
    expect(bare.withoutArrow).toBe(true);
    expect(defaults.distance).toBe(8);
    expect(defaults.skidding).toBe(0);
    const after = mount({
        render: () =>
            h(Popover, {
                'without-arrow': state.enabled,
                distance: state.offset,
                skidding: state.offset,
            }),
    }).popover;
    for (const enabled of [true, false]) {
        state.enabled = enabled;
        state.offset = enabled ? 0 : -3;
        await ready(popover);
        await ready(after);
        await ready(kebab);
        for (const element of [popover, after]) {
            if (element === popover) await shown(element, enabled);
            expect(element.withoutArrow).toBe(enabled);
            expect(element.hasAttribute('without-arrow')).toBe(enabled);
            expect(element.distance).toBe(state.offset);
            expect(element.skidding).toBe(state.offset);
            expect(element.hasAttribute('withoutarrow')).toBe(false);
        }
        expect(kebab.withoutArrow).toBe(enabled);
    }
});

test('keeps initial open separate from ordinary transitions', async () => {
    const events: Event[] = [];
    const { popover } = mount({
        render: () =>
            h(
                Popover,
                { open: true, onWaShow: (event: Event) => events.push(event) },
                () => 'Initially visible',
            ),
    });
    await ready(popover);
    await shown(popover, true);
    expect(events).toEqual([]);
    expect(popover.textContent).toContain('Initially visible');
    await popover.hide();
    await shown(popover, false);
});

test('opens from a native button and supports real link navigation, Tab, Escape focus return and outside dismissal', async () => {
    let linkClicks = 0;
    const { popover, container } = mount({
        render: () =>
            h('div', [
                h(
                    'button',
                    {
                        id: 'popover-native',
                        type: 'button',
                        'aria-label': 'About native component',
                        'aria-haspopup': 'dialog',
                    },
                    'About native component',
                ),
                h(
                    Popover,
                    { id: 'native-help', for: 'popover-native', placement: 'bottom-start' },
                    () => [
                        h('h2', 'Component help'),
                        h(
                            'a',
                            {
                                href: '#guide',
                                onClick: (event: MouseEvent) => {
                                    event.preventDefault();
                                    linkClicks++;
                                },
                            },
                            'Read component guide',
                        ),
                        h(
                            'button',
                            { type: 'button', 'data-popover': 'close' },
                            'Close component help',
                        ),
                    ],
                ),
                h('button', { type: 'button' }, 'Outside panel'),
            ]),
    });
    await ready(popover);
    const trigger = container.querySelector<HTMLButtonElement>('#popover-native');
    const link = popover.querySelector('a');
    if (!trigger || !link) throw new Error('Expected focusable trigger and slotted link.');
    expect(popover.anchor).toBe(trigger);
    expect(popover.id).toBe('native-help');
    expect(popover.className).toBe('');
    expect(popover.getAttribute('style')).toBeNull();
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.hasAttribute('aria-expanded')).toBe(false);
    expect(trigger.hasAttribute('aria-controls')).toBe(false);
    await page.getByRole('button', { name: 'About native component' }).click();
    await shown(popover, true);
    await expect.poll(() => popover.shadowRoot?.activeElement).toBe(popover.dialog);
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(link);
    await page.getByRole('link', { name: 'Read component guide' }).click();
    expect(linkClicks).toBe(1);
    expect(popover.open).toBe(true);
    await userEvent.keyboard('{Escape}');
    await shown(popover, false);
    expect(document.activeElement).toBe(trigger);
    await userEvent.keyboard('{Enter}');
    await shown(popover, true);
    await page.getByRole('button', { name: 'Close component help' }).click();
    await shown(popover, false);
    trigger.focus();
    await userEvent.keyboard(' ');
    await shown(popover, true);
    await page.getByRole('button', { name: 'Outside panel' }).click();
    await shown(popover, false);
});

test('accepts the public Button trigger and preserves autofocus and native close links', async () => {
    let followed = false;
    const state = reactive({ disabled: false, loading: false });
    const { popover, container } = mount({
        render: () =>
            h('div', [
                h(
                    Button,
                    {
                        id: 'popover-public',
                        type: 'button',
                        disabled: state.disabled,
                        loading: state.loading,
                    },
                    () => 'Public help',
                ),
                h(Popover, { for: 'popover-public' }, () => [
                    h(
                        'a',
                        {
                            href: '#details',
                            autofocus: true,
                            'data-popover': 'close',
                            onClick: (event: MouseEvent) => {
                                event.preventDefault();
                                followed = true;
                            },
                        },
                        'Details and close',
                    ),
                ]),
            ]),
    });
    await ready(popover);
    await customElements.whenDefined('wa-button');
    const trigger = container.querySelector('wa-button');
    expect(popover.anchor).toBe(trigger);
    await page.getByRole('button', { name: 'Public help' }).click();
    await shown(popover, true);
    await expect.poll(() => document.activeElement).toBe(popover.querySelector('a'));
    await page.getByRole('link', { name: 'Details and close' }).click();
    expect(followed).toBe(true);
    await shown(popover, false);
    for (const flag of ['disabled', 'loading'] as const) {
        state[flag] = true;
        await nextTick();
        if (!trigger) throw new Error('Expected public Button host.');
        trigger.click();
        await ready(popover);
        expect(popover.open).toBe(false);
        state[flag] = false;
        await nextTick();
    }
});

test('retains original cancelable native events, callback casing and successful host methods through Vue $el', async () => {
    const instance = shallowRef<ComponentPublicInstance | null>(null);
    const events: Event[] = [];
    const observed: Event[] = [];
    const state = reactive({ cancelShow: false, cancelHide: false, open: false });
    const record = (event: Event) => {
        events.push(event);
        if (
            (event.type === 'wa-show' && state.cancelShow) ||
            (event.type === 'wa-hide' && state.cancelHide)
        )
            event.preventDefault();
    };
    const { popover } = mount({
        render: () =>
            h('div', [
                h('button', { id: 'popover-manual', type: 'button' }, 'Manual target'),
                h(
                    Popover,
                    {
                        ref: instance,
                        for: 'popover-manual',
                        open: state.open,
                        onWaShow: record,
                        onWaAfterShow: record,
                        onWaHide: record,
                        onWaAfterHide: record,
                    },
                    () => 'Manual content',
                ),
            ]),
    });
    for (const name of ['wa-show', 'wa-after-show', 'wa-hide', 'wa-after-hide'])
        popover.addEventListener(name, (event) => observed.push(event));
    await ready(popover);
    const host: unknown = instance.value?.$el;
    const { default: NativePopover } =
        await import('#front-awesome-webawesome/components/popover/popover.js');
    if (!(host instanceof NativePopover)) throw new Error('Expected native Popover host.');
    expect(host).toBe(popover);
    await host.show();
    await shown(popover, true);
    await host.hide();
    await shown(popover, false);
    expect(events.map((event) => event.type)).toEqual([
        'wa-show',
        'wa-after-show',
        'wa-hide',
        'wa-after-hide',
    ]);
    for (const [index, event] of events.entries()) {
        expect(event).toBe(observed[index]);
        expect(event.target).toBe(popover);
    }
    state.cancelShow = true;
    void host.show();
    await expect
        .poll(() => events.some((event) => event.type === 'wa-show' && event.defaultPrevented))
        .toBe(true);
    await ready(popover);
    expect(popover.open).toBe(false);
    expect(events.filter((event) => event.type === 'wa-after-show')).toHaveLength(1);
    state.cancelShow = false;
    await host.show();
    state.cancelHide = true;
    void host.hide();
    await expect
        .poll(() => events.some((event) => event.type === 'wa-hide' && event.defaultPrevented))
        .toBe(true);
    await ready(popover);
    expect(popover.open).toBe(true);
    state.cancelHide = false;
    await host.hide();
    state.open = true;
    await ready(popover);
    await shown(popover, true);
    state.open = false;
    await ready(popover);
    await shown(popover, false);
    for (const [index, event] of events.entries()) expect(event).toBe(observed[index]);
});

test('retargets existing IDs, leaves missing targets unbound and removes old anchor listeners on unmount', async () => {
    const state = reactive({ target: 'popover-first', visible: true, late: false });
    const { popover, container } = mount({
        render: () =>
            h('div', [
                h('button', { id: 'popover-first', type: 'button' }, 'First anchor'),
                h('button', { id: 'popover-second', type: 'button' }, 'Second anchor'),
                state.late
                    ? h('button', { id: 'popover-late', type: 'button' }, 'Late anchor')
                    : null,
                state.visible
                    ? h(Popover, { for: state.target }, () => 'Retargeted content')
                    : null,
            ]),
    });
    await ready(popover);
    const first = container.querySelector<HTMLButtonElement>('#popover-first');
    const second = container.querySelector<HTMLButtonElement>('#popover-second');
    if (!first || !second) throw new Error('Expected both external buttons.');
    expect(popover.anchor).toBe(first);
    state.target = 'popover-second';
    await ready(popover);
    expect(popover.anchor).toBe(second);
    first.click();
    await ready(popover);
    expect(popover.open).toBe(false);
    second.click();
    await shown(popover, true);
    await popover.hide();
    state.target = 'popover-late';
    await ready(popover);
    expect(popover.anchor).toBeNull();
    state.late = true;
    await ready(popover);
    expect(popover.anchor).toBeNull();
    state.target = '';
    await ready(popover);
    state.target = 'popover-late';
    await ready(popover);
    const late = container.querySelector<HTMLButtonElement>('#popover-late');
    expect(popover.anchor).toBe(late);
    state.visible = false;
    await nextTick();
    late?.click();
    await popover.updateComplete;
    expect(popover.open).toBe(false);
});

test('uses the same DOM root, rebinds after reconnect and preserves native one-open behavior', async () => {
    const outside = document.createElement('button');
    outside.id = 'scoped-popover-trigger';
    document.body.append(outside);
    const host = document.createElement('div');
    document.body.append(host);
    const shadow = host.attachShadow({ mode: 'open' });
    const container = document.createElement('div');
    shadow.append(container);
    const app = createApp({
        render: () =>
            h('div', [
                h('button', { id: 'scoped-popover-trigger', type: 'button' }, 'Scoped trigger'),
                h(Popover, { for: 'scoped-popover-trigger' }, () =>
                    h('a', { href: '#scoped' }, 'Scoped guide'),
                ),
                h(
                    'button',
                    { id: 'second-scoped-trigger', type: 'button' },
                    'Second scoped trigger',
                ),
                h(Popover, { for: 'second-scoped-trigger' }, () => 'Second content'),
            ]),
    });
    app.mount(container);
    onTestFinished(() => {
        app.unmount();
        host.remove();
        outside.remove();
    });
    const [first, second] = container.querySelectorAll<WaPopover>('wa-popover');
    const trigger = container.querySelector<HTMLButtonElement>('#scoped-popover-trigger');
    if (!first || !second || !trigger) throw new Error('Expected scoped triggers and panels.');
    await ready(first);
    await ready(second);
    expect(first.anchor).toBe(trigger);
    outside.click();
    await ready(first);
    expect(first.open).toBe(false);
    trigger.click();
    await shown(first, true);
    await second.show();
    await shown(first, false);
    await shown(second, true);
    await second.hide();
    first.remove();
    trigger.click();
    await first.updateComplete;
    expect(first.open).toBe(false);
    container.append(first);
    await ready(first);
    expect(first.anchor).toBe(trigger);
    trigger.click();
    await shown(first, true);
    first
        .querySelector('a')
        ?.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, composed: true }));
    outside.click();
    expect(first.open).toBe(true);
    outside.click();
    await shown(first, false);
});
