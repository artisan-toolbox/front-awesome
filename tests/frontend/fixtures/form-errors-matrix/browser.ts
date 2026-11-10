import { expect, onTestFinished } from 'vite-plus/test';
import { userEvent } from 'vitest/browser';
import { createApp, h, nextTick } from 'vue';
import type { Component } from 'vue';

export type FieldValue = string | number | boolean | null | undefined | string[] | File[];

export type Paint = {
    selector: string;
    property: 'color' | 'borderColor' | 'backgroundColor';
    token: 'text' | 'border' | 'active' | 'quiet';
};

export function mount(component: Component, mode: string, display: string) {
    const container = document.createElement('form');
    container.className = mode;
    container.style.cssText = `width:480px;display:${display};gap:12px;align-items:start;justify-items:start;--wa-transition-fast:0ms;--wa-transition-normal:0ms;--wa-transition-slow:0ms`;
    container.addEventListener('submit', (event) => event.preventDefault());
    document.body.append(container);
    const app = createApp(component);
    app.mount(container);
    onTestFinished(() => {
        app.unmount();
        container.remove();
    });
    return container;
}

export async function ready(host: HTMLElement) {
    await customElements.whenDefined(host.localName);
    await Promise.all(
        [...host.querySelectorAll<HTMLElement>('*')]
            .filter((child) => child.localName.includes('-'))
            .map((child) => customElements.whenDefined(child.localName)),
    );
    for (let round = 0; round < 2; round++) {
        await nextTick();
        const update: unknown = Reflect.get(host, 'updateComplete');
        if (update instanceof Promise) await update;
        await new Promise(requestAnimationFrame);
    }
}

export function required(root: ParentNode, selector: string): HTMLElement {
    const element = root.querySelector(selector);
    if (!(element instanceof HTMLElement)) throw new Error(`Expected ${selector}.`);
    return element;
}

export function part(host: HTMLElement, selector: string): HTMLElement {
    let root: ParentNode = host;
    const segments = selector.split(' >>> ');
    for (const [index, segment] of segments.entries()) {
        if (index === 0 && segment.startsWith('light:')) {
            root = required(host, segment.slice(6));
            continue;
        }
        if (!(root instanceof HTMLElement) || !root.shadowRoot)
            throw new Error(`Expected an open native shadow root for ${selector}.`);
        root = required(root.shadowRoot, segment);
    }
    if (!(root instanceof HTMLElement)) throw new Error(`Expected painted part ${selector}.`);
    return root;
}

export async function fill(host: HTMLElement, selector: string, value: string) {
    await userEvent.fill(part(host, selector), value);
}

export async function arrow(host: HTMLElement, selector?: string) {
    (selector ? part(host, selector) : host).focus();
    await userEvent.keyboard('{ArrowUp}');
}

export function paint(selector: string, property: Paint['property'], token: Paint['token']): Paint {
    return { selector, property, token };
}

export function surface(name: string): Paint[] {
    return [
        paint(`[part~="${name}"]`, 'borderColor', 'border'),
        ...(name === 'trigger' ? [] : [paint(`[part~="${name}"]`, 'backgroundColor', 'quiet')]),
    ];
}

export async function exerciseErrors(options: {
    container: HTMLElement;
    host: HTMLElement;
    hasHint: boolean;
    paints: Paint[];
    failed: { value: boolean | string | readonly string[] };
    setError: (messages: string[]) => void;
    clearErrors: () => void;
    read: () => unknown;
    initial: FieldValue;
    userValue: FieldValue;
    externalValue: FieldValue;
    nativeValues?: (string | File)[];
    setExternal: () => void;
    interact: (host: HTMLElement) => Promise<void>;
}) {
    const { host, container, failed } = options;
    await ready(host);
    expect(options.read()).toEqual(options.initial);
    await expect
        .poll(
            () =>
                Reflect.get(
                    host,
                    host.localName === 'wa-file-input'
                        ? 'files'
                        : ['wa-checkbox', 'wa-switch'].includes(host.localName)
                          ? 'checked'
                          : 'value',
                ),
            { timeout: 10000 },
        )
        .toEqual(options.initial);
    if (options.hasHint)
        expect(required(host, '[data-testid="caller-hint"]').textContent).toBe('Caller slot hint');
    const baseline = options.paints.map(
        (item) => getComputedStyle(part(host, item.selector))[item.property],
    );
    const expected = document.createElement('span');
    expected.style.cssText =
        'color:var(--wa-color-danger-on-quiet);border-color:var(--wa-color-danger-border-loud);background-color:var(--wa-color-danger-fill-loud);outline-color:var(--wa-color-danger-fill-quiet)';
    container.append(expected);
    const tokens = {
        text: getComputedStyle(expected).color,
        border: getComputedStyle(expected).borderColor,
        active: getComputedStyle(expected).backgroundColor,
        quiet: getComputedStyle(expected).outlineColor,
    };
    const messages = ['<b>Choose another value.</b>', 'The server supplied a second message.'];
    options.setError(messages);
    failed.value = false;
    await ready(host);
    expect(host.getAttribute('aria-invalid')).toBe('true');
    const error = required(container, '[role="alert"]');
    expect(error.textContent).toBe(messages.join(''));
    expect(error.querySelector('b')).toBeNull();
    expect(error.children).toHaveLength(2);
    expect(host.getAttribute('aria-errormessage')?.split(/\s+/)).toEqual([
        'application-error',
        error.id,
    ]);
    expect(host.getAttribute('aria-describedby')).toContain('application-description');
    if (options.hasHint) expect(host.querySelector('[data-testid="caller-hint"]')).toBeNull();
    await expect.poll(() => getComputedStyle(error).color).toBe(tokens.text);
    for (const item of options.paints) {
        await expect
            .poll(() => getComputedStyle(part(host, item.selector))[item.property], {
                message: `${host.localName} ${item.selector} ${item.property}`,
            })
            .toBe(tokens[item.token]);
    }
    await options.interact(host);
    await ready(host);
    await expect.poll(options.read).toEqual(options.userValue);
    expect(required(container, '[role="alert"]').textContent).toBe(messages.join(''));
    expect(required(container, '[role="alert"]').checkVisibility()).toBe(true);
    options.setExternal();
    await ready(host);
    expect(
        Reflect.get(
            host,
            host.localName === 'wa-file-input'
                ? 'files'
                : ['wa-checkbox', 'wa-switch'].includes(host.localName)
                  ? 'checked'
                  : 'value',
        ),
    ).toEqual(options.externalValue);
    expect(options.read()).toEqual(options.externalValue);
    expect(required(container, '[role="alert"]').textContent).toBe(messages.join(''));
    expect(container.querySelector(host.localName)).toBe(host);
    host.blur();
    options.clearErrors();
    await ready(host);
    expect(container.querySelector<HTMLElement>('[role="alert"]')?.checkVisibility() ?? false).toBe(
        false,
    );
    expect(host.getAttribute('aria-invalid')).toBe('grammar');
    expect(host.getAttribute('aria-errormessage')).toBe('application-error');
    if (options.hasHint) {
        expect(required(host, '[data-testid="caller-hint"]').textContent).toBe('Caller slot hint');
        expect(Reflect.get(host, 'hint')).toBe('Caller attribute hint');
    }
    if (!(container instanceof HTMLFormElement)) throw new Error('Expected a native form.');
    const expectedValues =
        typeof options.externalValue === 'boolean'
            ? options.externalValue
                ? ['on']
                : []
            : Array.isArray(options.externalValue)
              ? options.externalValue
              : options.externalValue == null
                ? []
                : [String(options.externalValue)];
    expect(new FormData(container).getAll('matrix-value')).toEqual(
        options.nativeValues ?? expectedValues,
    );
    for (const [index, item] of options.paints.entries()) {
        await expect
            .poll(() => getComputedStyle(part(host, item.selector))[item.property])
            .toBe(baseline[index]);
    }
    failed.value = true;
    await ready(host);
    expect(host.getAttribute('aria-invalid')).toBe('true');
    expect(container.querySelector<HTMLElement>('[role="alert"]')?.checkVisibility() ?? false).toBe(
        false,
    );
    failed.value = 'Manual <em>message</em>';
    await ready(host);
    expect(required(container, '[role="alert"]').textContent).toBe('Manual <em>message</em>');
    expect(container.querySelector('em')).toBeNull();
    failed.value = ['First manual message.', 'Second manual message.'];
    await ready(host);
    expect(required(container, '[role="alert"]').children).toHaveLength(2);
    failed.value = false;
    await ready(host);
    expect(container.querySelector<HTMLElement>('[role="alert"]')?.checkVisibility() ?? false).toBe(
        false,
    );
    expect(host.getAttribute('aria-invalid')).toBe('grammar');
    for (const [index, item] of options.paints.entries()) {
        await expect
            .poll(() => getComputedStyle(part(host, item.selector))[item.property])
            .toBe(baseline[index]);
    }
}

export { h, userEvent };
