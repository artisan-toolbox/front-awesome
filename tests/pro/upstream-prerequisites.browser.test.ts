import { expect, onTestFinished, test, vi } from 'vite-plus/test';
import { userEvent } from '@vitest/browser/context';
import { createApp, h, nextTick } from 'vue';
import { Combobox } from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
import PopupExamples from '../frontend/upstream/Popup.vue';
import GridExamples from './upstream/DataGrid.vue';
import coreInventory from '../frontend/upstream-scenarios.json';
import proInventory from './upstream-scenarios.json';
import { scenarioScripts } from '../frontend/upstream-scripts';
import '../frontend/app.css';
import '@artisan-toolbox/front-awesome/web-awesome.css';
import '@artisan-toolbox/front-awesome/tailwind.css';

async function settle(root: HTMLElement) {
    await nextTick();
    const elements = [...root.querySelectorAll('*')].filter((element) =>
        element.localName.startsWith('wa-'),
    );
    await Promise.all(elements.map((element) => customElements.whenDefined(element.localName)));
    for (let round = 0; round < 4; round++) {
        await Promise.all(elements.map((element) => Reflect.get(element, 'updateComplete')));
        await nextTick();
    }
}

for (const id of ['popup-1', 'popup-4', 'popup-7', 'popup-8']) {
    test(`runs original Core ${id} placement controls with licensed Pro Combobox`, async () => {
        const scenario = coreInventory.scenarios.find((scenario) => scenario.id === id);
        if (!scenario) throw new Error(`Missing ${id}`);
        const host = document.createElement('div');
        host.style.cssText = 'display:flex;gap:20px';
        const native = document.createElement('section');
        const wrapped = document.createElement('section');
        native.style.cssText = wrapped.style.cssText = 'width:500px';
        const style = document.createElement('style');
        style.textContent = scenario.styles.join('\n');
        host.append(style, native, wrapped);
        document.body.append(host);
        const app = createApp({
            render: () => [
                h(Combobox, { style: 'display:none' }),
                h(PopupExamples, { scenario: id }),
            ],
        });
        app.mount(wrapped);
        const scripts = scenarioScripts();
        onTestFinished(() => {
            app.unmount();
            scripts.dispose();
            host.remove();
        });
        await customElements.whenDefined('wa-combobox');
        native.innerHTML = `<div>${scenario.markup}</div>`;
        await settle(native);
        await settle(wrapped);
        await scripts.run(native, scenario.scripts);
        await scripts.run(wrapped, scenario.scripts);
        await settle(host);
        const placements = [];
        for (const root of [native, wrapped]) {
            const combo =
                root.querySelector('wa-combobox[name="placement"]') ??
                root.querySelector('wa-combobox:not([style])');
            const popup = root.querySelector('wa-popup');
            const input = combo?.shadowRoot?.querySelector('input[role="combobox"]');
            if (!(input instanceof HTMLInputElement) || !popup || !combo)
                throw new Error(`Missing ${id} controls`);
            expect(combo.querySelectorAll('wa-option')).toHaveLength(12);
            await userEvent.fill(input, 'bottom');
            await userEvent.keyboard('{ArrowDown}{Enter}');
            await expect.poll(() => popup.placement).toBe('bottom');
            placements.push(popup.placement);
            const distance = root.querySelector('wa-input[name="distance"]');
            if (distance) {
                const control = distance.shadowRoot?.querySelector('input');
                if (!(control instanceof HTMLInputElement))
                    throw new Error('Missing distance field');
                await userEvent.fill(control, '12');
                await expect.poll(() => Number(popup.distance)).toBe(12);
            }
            const arrow =
                root.querySelector<HTMLElementTagNameMap['wa-switch']>('wa-switch[name="arrow"]');
            if (arrow) {
                const initial = arrow.checked;
                await userEvent.click(arrow);
                await expect.poll(() => popup.arrow).toBe(!initial);
            }
        }
        expect(placements).toEqual(['bottom', 'bottom']);
        const nativePopup = native.querySelector('wa-popup');
        const wrappedPopup = wrapped.querySelector('wa-popup');
        const expectedBox = nativePopup?.shadowRoot?.querySelector('[part="popup"]');
        const actualBox = wrappedPopup?.shadowRoot?.querySelector('[part="popup"]');
        if (!(expectedBox instanceof HTMLElement) || !(actualBox instanceof HTMLElement))
            throw new Error('Missing rendered popup box');
        expect(actualBox.getBoundingClientRect().width).toBeCloseTo(
            expectedBox.getBoundingClientRect().width,
            0,
        );
        expect(actualBox.getBoundingClientRect().height).toBeCloseTo(
            expectedBox.getBoundingClientRect().height,
            0,
        );
    });
}

test('runs the original event-style grid source with an isolated orders API request boundary', async () => {
    const scenario = proInventory.scenarios.find((scenario) => scenario.id === 'data-grid-31');
    if (!scenario) throw new Error('Missing event-style grid example');
    const orders = [
        { id: 'A-100', customer: 'Ada' },
        { id: 'A-101', customer: 'Grace' },
    ];
    const requests: Array<{ url: string; signal: AbortSignal | null | undefined }> = [];
    const originalFetch = globalThis.fetch.bind(globalThis);
    const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input, init) => {
        const url =
            typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        if (!url.startsWith('/api/orders?')) return originalFetch(input, init);
        requests.push({ url, signal: init?.signal });
        const data =
            new URL(url, location.origin).searchParams.get('q') === 'missing' ? [] : orders;
        return new Response(JSON.stringify({ rows: data, total: data.length }), {
            headers: { 'Content-Type': 'application/json' },
        });
    });
    onTestFinished(() => fetch.mockRestore());
    const host = document.createElement('div');
    const native = document.createElement('section');
    const wrapped = document.createElement('section');
    host.append(native, wrapped);
    document.body.append(host);
    const app = createApp({ render: () => h(GridExamples, { scenario: scenario.id }) });
    app.mount(wrapped);
    const scripts = scenarioScripts();
    onTestFinished(() => {
        app.unmount();
        scripts.dispose();
        host.remove();
    });
    await customElements.whenDefined('wa-data-grid');
    native.innerHTML = scenario.markup;
    await settle(host);
    await scripts.run(native, scenario.scripts);
    await scripts.run(wrapped, scenario.scripts);
    const grids = [native.querySelector('wa-data-grid'), wrapped.querySelector('wa-data-grid')];
    for (const grid of grids) {
        if (!grid) throw new Error('Missing orders grid');
        grid.columns = [
            { field: 'id', label: 'Order' },
            { field: 'customer', label: 'Customer' },
        ];
        grid.reload();
        await expect.poll(() => grid.data).toEqual(orders);
        expect(grid.total).toBe(2);
        await expect.poll(() => grid.loading).toBe(false);
        expect(grid.shadowRoot?.textContent).toContain('Ada');
    }
    expect(requests.map((request) => request.url)).toEqual([
        '/api/orders?page=0&size=20&q=',
        '/api/orders?page=0&size=20&q=',
    ]);
    expect(requests.every((request) => request.signal instanceof AbortSignal)).toBe(true);
    for (const grid of grids) {
        if (!grid) throw new Error('Missing orders grid');
        grid.filterDebounce = 0;
        grid.searchTerm = 'missing';
        await expect.poll(() => grid.data).toEqual([]);
        expect(grid.total).toBe(0);
        await expect.poll(() => grid.loading).toBe(false);
    }
    expect(requests.slice(2).map((request) => request.url)).toEqual([
        '/api/orders?page=0&size=20&q=missing',
        '/api/orders?page=0&size=20&q=missing',
    ]);
});
