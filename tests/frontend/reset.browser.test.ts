/// <reference types="vite/client" />
import { beforeAll, expect, onTestFinished, test } from 'vite-plus/test';
import { page, userEvent } from 'vite-plus/test/browser';
import { Rating } from '@artisan-toolbox/front-awesome/components/WebAwesome';
import { createApp, h } from 'vue';

import preflight from 'tailwindcss/preflight.css?raw';
import {
    coreTags,
    fixture,
    hostReset,
    registerNativeComponents,
    settle,
    stylesheet,
} from './fixtures/host-reset';

beforeAll(registerNativeComponents);

function geometrySnapshot(root: HTMLElement) {
    return [...root.querySelectorAll<HTMLElement>('*')]
        .filter((host) => coreTags.has(host.localName))
        .map((host) => [host, ...(host.shadowRoot?.querySelectorAll<HTMLElement>('[part]') ?? [])])
        .flat()
        .map((element) => ({
            name: `${element.localName} ${element.getAttribute('part') ?? ''}`,
            width: Math.round(element.getBoundingClientRect().width * 10) / 10,
            height: Math.round(element.getBoundingClientRect().height * 10) / 10,
        }));
}

async function expectNativeGeometry(root: HTMLElement, style: HTMLStyleElement) {
    style.remove();
    await settle(root);
    const native = geometrySnapshot(root);
    document.head.append(style);
    await settle(root);
    expect(geometrySnapshot(root)).toEqual(native);
}

function required<T extends keyof HTMLElementTagNameMap>(root: HTMLElement, tag: T) {
    const result = root.querySelector(tag);
    if (!result) throw new Error(`Missing ${tag}`);
    return result;
}

function shadowButton(host: HTMLElement) {
    const button = host.shadowRoot?.querySelector('button');
    if (!(button instanceof HTMLButtonElement)) throw new Error(`Missing ${host.localName} button`);
    return button;
}

function correctedPreflight() {
    const style = stylesheet(`@layer base { ${preflight} }\n${hostReset}`);
    onTestFinished(() => style.remove());
    return style;
}

test('compares the final shadow-part color after a theme transition', async () => {
    const style = stylesheet(`
        .color-transition wa-button::part(base) {
            background-color: rgb(255, 0, 0);
            transition: background-color 5s linear;
        }
        .color-transition.changed wa-button::part(base) { background-color: rgb(0, 0, 255); }
    `);
    onTestFinished(() => style.remove());
    const root = await fixture(
        '<div class="color-transition"><wa-button>Preview</wa-button></div>',
    );
    onTestFinished(() => root.remove());
    const host = required(root, 'wa-button');
    const part = shadowButton(host);
    expect(getComputedStyle(part).backgroundColor).toBe('rgb(255, 0, 0)');
    required(root, 'div').classList.add('changed');
    await settle(root);
    expect(getComputedStyle(part).backgroundColor).toBe('rgb(0, 0, 255)');
});

test('detects the broken open dropdown without the correction and restores its native dimensions', async () => {
    const root = await fixture(
        '<wa-dropdown><wa-button slot="trigger">Actions</wa-button><wa-dropdown-item value="edit">Edit</wa-dropdown-item><wa-dropdown-item disabled value="delete">Delete</wa-dropdown-item></wa-dropdown>',
    );
    onTestFinished(() => root.remove());
    const dropdown = required(root, 'wa-dropdown');
    const item = required(root, 'wa-dropdown-item');
    required(root, 'wa-button').click();
    await settle(root);
    expect(dropdown.open).toBe(true);
    await expect.element(page.getByText('Edit', { exact: true })).toBeVisible();
    const nativePadding = getComputedStyle(item).padding;
    const nativeHeight = item.getBoundingClientRect().height;
    expect(parseFloat(getComputedStyle(item).paddingBlockStart)).toBeGreaterThan(0);
    expect(nativeHeight).toBeGreaterThan(20);
    const broken = stylesheet(`@layer base { ${preflight} }`);
    onTestFinished(() => broken.remove());
    await settle(root);
    expect(getComputedStyle(item).padding).toBe('0px');
    expect(item.getBoundingClientRect().height).toBeLessThan(nativeHeight);
    const correction = stylesheet(hostReset);
    onTestFinished(() => correction.remove());
    await settle(root);
    expect(getComputedStyle(item).padding).toBe(nativePadding);
    expect(item.getBoundingClientRect().height).toBeCloseTo(nativeHeight, 1);
    let selected = '';
    dropdown.addEventListener('wa-select', (event) => {
        if (!('detail' in event)) throw new Error('Missing dropdown selection detail');
        const detail: unknown = event.detail;
        if (
            !detail ||
            typeof detail !== 'object' ||
            !('item' in detail) ||
            !(detail.item instanceof HTMLElement)
        )
            throw new Error('Missing selected item');
        selected = detail.item.getAttribute('value') ?? '';
    });
    await userEvent.click(page.getByText('Delete', { exact: true }), { force: true });
    expect(selected).toBe('');
    expect(dropdown.open).toBe(true);
    await userEvent.click(page.getByText('Edit', { exact: true }));
    await settle(root);
    expect(selected).toBe('edit');
    expect(dropdown.open).toBe(false);
});

test('allows application utilities to override the shared host correction', async () => {
    correctedPreflight();
    const utility = stylesheet(
        '@layer utilities { .reset-spacing-utility { padding: 13px; margin: 7px; border: 3px solid red; box-sizing: content-box; } }',
    );
    onTestFinished(() => utility.remove());
    const root = await fixture(
        '<wa-dropdown-item class="reset-spacing-utility">Custom item</wa-dropdown-item><wa-tag class="reset-spacing-utility">Custom tag</wa-tag>',
    );
    onTestFinished(() => root.remove());
    for (const host of [required(root, 'wa-dropdown-item'), required(root, 'wa-tag')]) {
        const style = getComputedStyle(host);
        expect(style.padding).toBe('13px');
        expect(style.margin).toBe('7px');
        expect(style.borderTopWidth).toBe('3px');
        expect(style.boxSizing).toBe('content-box');
    }
});

test('preserves interactive open states, content geometry and focus with corrected Preflight', async () => {
    const corrected = correctedPreflight();
    const root = await fixture(`
        <wa-details summary="Details">Visible details content</wa-details>
        <wa-accordion><wa-accordion-item label="Accordion">Visible accordion content</wa-accordion-item></wa-accordion>
        <wa-tab-group><wa-tab panel="first">First</wa-tab><wa-tab panel="second">Second</wa-tab><wa-tab-panel name="first">First content</wa-tab-panel><wa-tab-panel name="second">Second content</wa-tab-panel></wa-tab-group>
        <wa-tree><wa-tree-item>Parent<wa-tree-item>Child</wa-tree-item></wa-tree>
        <wa-select label="Fruit"><wa-option value="apple">Apple</wa-option><wa-option value="pear">Pear</wa-option></wa-select>
        <wa-color-picker label="Color" value="#ff0000"></wa-color-picker>
        <wa-dialog label="Dialog">Dialog content</wa-dialog>
        <wa-drawer label="Drawer">Drawer content</wa-drawer>
    `);
    onTestFinished(() => root.remove());
    const details = required(root, 'wa-details');
    details.shadowRoot?.querySelector<HTMLElement>('[part~="header"]')?.click();
    await settle(root);
    expect(details.open).toBe(true);
    await expectNativeGeometry(root, corrected);
    const accordion = required(root, 'wa-accordion-item');
    shadowButton(accordion).click();
    await settle(root);
    expect(accordion.expanded).toBe(true);
    await expectNativeGeometry(root, corrected);
    const tabs = root.querySelectorAll('wa-tab');
    tabs[1]?.click();
    await settle(root);
    expect(required(root, 'wa-tab-group').active).toBe('second');
    await expectNativeGeometry(root, corrected);
    expect(
        root.querySelector('wa-tab-panel[name="second"]')?.getBoundingClientRect().height,
    ).toBeGreaterThan(0);
    const treeItem = required(root, 'wa-tree-item');
    await userEvent.click(treeItem);
    await settle(root);
    expect(treeItem.selected).toBe(true);
    treeItem.expanded = true;
    await settle(root);
    expect(treeItem.querySelector('wa-tree-item')?.getBoundingClientRect().height).toBeGreaterThan(
        0,
    );
    const select = required(root, 'wa-select');
    const combobox = select.shadowRoot?.querySelector<HTMLElement>('[part~="combobox"]');
    if (!combobox) throw new Error('Missing select combobox');
    await userEvent.click(combobox);
    await settle(root);
    expect(select.open).toBe(true);
    await expectNativeGeometry(root, corrected);
    await userEvent.click(required(root, 'wa-option'));
    await settle(root);
    expect(select.value).toBe('apple');
    expect(select.open).toBe(false);
    const color = root.querySelector('wa-color-picker');
    if (!(color instanceof HTMLElement)) throw new Error('Missing color picker');
    const colorTrigger = color.shadowRoot?.querySelector<HTMLElement>('[part~="trigger"]');
    if (!colorTrigger) throw new Error('Missing color picker trigger');
    colorTrigger.click();
    await settle(root);
    const colorDialog = color.shadowRoot?.querySelector<HTMLElement>('[part~="color-picker"]');
    expect(colorDialog?.getBoundingClientRect().height).toBeGreaterThan(0);
    await expectNativeGeometry(root, corrected);
    for (const overlay of [required(root, 'wa-dialog'), required(root, 'wa-drawer')]) {
        const shown = new Promise<void>((resolve) =>
            overlay.addEventListener('wa-after-show', () => resolve(), { once: true }),
        );
        overlay.open = true;
        await shown;
        await settle(root);
        const panel = overlay.shadowRoot?.querySelector<HTMLElement>('[part~="dialog"]');
        expect(panel?.getBoundingClientRect().width).toBeGreaterThan(100);
        expect(panel?.getBoundingClientRect().height).toBeGreaterThan(0);
        await expectNativeGeometry(root, corrected);
        const hidden = new Promise<void>((resolve) =>
            overlay.addEventListener('wa-after-hide', () => resolve(), { once: true }),
        );
        overlay.open = false;
        await hidden;
        await settle(root);
        expect(overlay.open).toBe(false);
    }
    Reflect.set(color, 'open', false);
    await settle(root);
    select.focus();
    await settle(root);
    expect(document.activeElement).toBe(select);
    await userEvent.keyboard('{ArrowDown}');
    await settle(root);
    expect(select.open).toBe(true);
    await expectNativeGeometry(root, corrected);
    await userEvent.keyboard('{Escape}');
    await settle(root);
    expect(select.open).toBe(false);
});

test('preserves changed and disabled form controls, keyboard sliders and steps under Preflight', async () => {
    const corrected = correctedPreflight();
    const root = await fixture(`
        <wa-input label="Name" name="name"></wa-input>
        <wa-textarea label="Notes" name="notes"></wa-textarea>
        <wa-number-input label="Quantity" value="2" name="quantity"></wa-number-input>
        <wa-otp-input label="Code" length="4"></wa-otp-input>
        <wa-tag-input label="Tags"></wa-tag-input>
        <wa-checkbox>Accept</wa-checkbox><wa-checkbox disabled>Unavailable</wa-checkbox>
        <wa-switch>Alerts</wa-switch>
        <wa-radio-group label="Plan"><wa-radio value="basic">Basic</wa-radio><wa-radio value="plus">Plus</wa-radio></wa-radio-group>
        <wa-slider label="Volume" value="20"></wa-slider>
        <wa-rating label="Score" value="2"></wa-rating>
        <wa-pagination total="100" page-size="10"></wa-pagination>
        <wa-stepper active="first" clickable><wa-step name="first">First step</wa-step><wa-step name="second">Second step</wa-step></wa-stepper>
        <wa-split-panel position="50"><div slot="start">Start</div><div slot="end">End</div></wa-split-panel>
    `);
    onTestFinished(() => root.remove());
    for (const [tag, inputValue] of [
        ['wa-input', 'Ada'],
        ['wa-textarea', 'Notes here'],
        ['wa-number-input', '7'],
    ] as const) {
        const host = required(root, tag);
        const input = host.shadowRoot?.querySelector('input,textarea');
        if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement))
            throw new Error(`Missing ${tag} input`);
        await userEvent.fill(input, inputValue);
        await settle(root);
        expect(String(host.value)).toBe(inputValue);
    }
    const checkbox = required(root, 'wa-checkbox');
    await userEvent.click(checkbox);
    await userEvent.click(required(root, 'wa-switch'));
    await settle(root);
    expect(checkbox.checked).toBe(true);
    expect(required(root, 'wa-switch').checked).toBe(true);
    const disabled = root.querySelector('wa-checkbox[disabled]');
    if (!(disabled instanceof HTMLElement)) throw new Error('Missing disabled checkbox');
    await userEvent.click(disabled, { force: true });
    expect(Reflect.get(disabled, 'checked')).toBe(false);
    const radio = root.querySelector('wa-radio[value="plus"]');
    if (!(radio instanceof HTMLElement)) throw new Error('Missing radio choice');
    await userEvent.click(radio);
    await settle(root);
    expect(required(root, 'wa-radio-group').value).toBe('plus');
    const slider = required(root, 'wa-slider');
    slider.focus();
    await userEvent.keyboard('{ArrowRight}');
    await settle(root);
    expect(slider.value).toBe(21);
    const rating = required(root, 'wa-rating');
    rating.focus();
    await userEvent.keyboard('{ArrowRight}');
    await settle(root);
    expect(rating.value).toBe(3);
    const pagination = required(root, 'wa-pagination');
    const next = pagination.shadowRoot?.querySelector<HTMLElement>('[part~="next-button"]');
    if (!next) throw new Error('Missing pagination next button');
    await userEvent.click(next);
    await settle(root);
    expect(pagination.page).toBe(2);
    const secondStep = root.querySelector('wa-step[name="second"]');
    if (!(secondStep instanceof HTMLElement)) throw new Error('Missing second step');
    await userEvent.click(shadowButton(secondStep));
    await settle(root);
    expect(required(root, 'wa-stepper').active).toBe('second');
    const split = required(root, 'wa-split-panel');
    const divider = split.shadowRoot?.querySelector<HTMLElement>('[part~="divider"]');
    if (!divider) throw new Error('Missing split panel divider');
    divider.focus();
    await userEvent.keyboard('{ArrowRight}');
    await settle(root);
    expect(split.position).toBeGreaterThan(50);
    await expectNativeGeometry(root, corrected);
});

test('maps visible rating symbols to their values inside a vertical demo layout', async () => {
    const corrected = correctedPreflight();
    const root = await fixture(
        '<div data-rating-demo style="display:flex;flex-direction:column;gap:24px"></div>',
    );
    const demo = root.querySelector('[data-rating-demo]');
    if (!(demo instanceof HTMLElement)) throw new Error('Missing rating demo');
    const app = createApp({
        render: () => [
            h('div', [h(Rating, { label: 'Interactive score', precision: 1 })]),
            h('div', [h(Rating, { label: 'Disabled score', disabled: true })]),
            h('div', [h(Rating, { label: 'Readonly score', readonly: true, value: 2 })]),
        ],
    });
    app.mount(demo);
    onTestFinished(() => {
        app.unmount();
        root.remove();
    });
    await settle(root);
    const ratings = [...root.querySelectorAll('wa-rating')];
    const active = ratings[0];
    if (!active) throw new Error('Missing interactive rating');
    const visible = active.shadowRoot?.querySelector<HTMLElement>('[part~="rating"]');
    if (!visible) throw new Error('Missing visible rating symbols');
    expect(active.getBoundingClientRect().width).toBeCloseTo(
        visible.getBoundingClientRect().width,
        1,
    );
    for (const [index, rating] of ratings.entries()) {
        const symbol = rating.shadowRoot?.querySelectorAll<HTMLElement>('[role="presentation"]')[2];
        if (!symbol) throw new Error('Missing third visible rating symbol');
        const symbolBounds = symbol.getBoundingClientRect();
        const hostBounds = rating.getBoundingClientRect();
        await userEvent.click(rating, {
            position: {
                x: symbolBounds.left + symbolBounds.width / 2 - hostBounds.left,
                y: symbolBounds.top + symbolBounds.height / 2 - hostBounds.top,
            },
            force: index > 0,
        });
        await settle(root);
        expect(rating.value).toBe(index === 0 ? 3 : index === 1 ? 0 : 2);
    }
    await expectNativeGeometry(root, corrected);
});
