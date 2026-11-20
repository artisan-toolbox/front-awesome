import { expect, onTestFinished, vi } from 'vite-plus/test';
import { createApp, nextTick, type Component } from 'vue';
import type WaPopover from '@awesome.me/webawesome/dist/components/popover/popover.js';
import type WaInput from '@awesome.me/webawesome/dist/components/input/input.js';

type WebAwesomeElement = HTMLElement & { updateComplete: Promise<boolean> };

export function mountVue(component: Component, container = document.createElement('div')) {
    const app = createApp(component);
    document.body.append(container);
    onTestFinished(() => {
        app.unmount();
        container.remove();
    });
    app.mount(container);
    return { container, app };
}

export function webAwesomeFixture<Tag extends keyof HTMLElementTagNameMap>(tag: Tag, style = '') {
    return (component: Component) => {
        const container = document.createElement('div');
        container.style.cssText = style;
        mountVue(component, container);
        const element = container.querySelector(tag);
        if (!element) throw new Error(`Expected ${tag}.`);
        return { container, element };
    };
}

export async function ready(element: WebAwesomeElement) {
    await vi.dynamicImportSettled();
    await customElements.whenDefined(element.localName);
    await nextTick();
    await element.updateComplete;
}

export async function inputReady(input: WaInput) {
    await ready(input);
    await nextTick();
    await input.updateComplete;
}

export async function readyAfterFrame(element: WebAwesomeElement) {
    await vi.dynamicImportSettled();
    await customElements.whenDefined(element.localName);
    await nextTick();
    await new Promise(requestAnimationFrame);
    await element.updateComplete;
}

export async function expectPopoverOpen(popover: WaPopover, open: boolean) {
    await expect.poll(() => popover.open).toBe(open);
    await expect.poll(() => popover.dialog.open).toBe(open);
    await expect.poll(() => popover.popup.active).toBe(open);
}
