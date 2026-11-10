/// <reference types="vite/client" />
import { expect, test, vi } from 'vite-plus/test';
import { scenarioScripts } from '../frontend/upstream-scripts';
import { createApp, h, nextTick } from 'vue';
import type { Component } from 'vue';
import inventory from './upstream-scenarios.json';
import coreDefinitions from '../../resources/js/WebAwesome/components.json';
import proDefinitions from '../../resources/js/WebAwesome/proComponents.json';
const definitions = [...coreDefinitions, ...proDefinitions];
import '../frontend/app.css';
import '@artisan-toolbox/front-awesome/web-awesome.css';
import '@artisan-toolbox/front-awesome/tailwind.css';

const fixtures = import.meta.glob<{ default: Component }>('./upstream/*.vue');

const byTag = new Map(definitions.map((definition) => [definition.tag, definition]));

async function settle(root: HTMLElement) {
    await nextTick();
    const elements = [...root.querySelectorAll<HTMLElement>('[data-upstream-index]')].filter(
        (element) => byTag.has(element.localName),
    );
    await Promise.all(elements.map((element) => customElements.whenDefined(element.localName)));
    for (let round = 0; round < 3; round++) {
        await Promise.all(elements.map((element) => Reflect.get(element, 'updateComplete')));
        await nextTick();
    }
    return elements;
}

function scalarState(element: HTMLElement) {
    const definition = byTag.get(element.localName);
    const properties = new Set([
        ...(definition?.attributes.map((attribute) => attribute.property) ?? []),
        ...(definition?.properties ?? []),
    ]);
    return Object.fromEntries(
        [...properties].flatMap((property) => {
            if (!property || property === 'form') return [];
            let value: unknown = Reflect.get(element, property);
            if (
                ['min', 'max', 'step'].includes(property) &&
                typeof value === 'string' &&
                value !== '' &&
                Number.isFinite(Number(value))
            )
                value = Number(value);
            return value === null || ['string', 'boolean', 'number'].includes(typeof value)
                ? [[property, value]]
                : [];
        }),
    );
}

for (const component of inventory.components) {
    const scenarios = inventory.scenarios.filter(
        (scenario) => scenario.component === component.name,
    );
    if (!scenarios.length) continue;
    test(`matches native upstream Pro ${component.name} examples with Tailwind Preflight`, async () => {
        const load = fixtures[`./upstream/${component.name}.vue`];
        if (!load) throw new Error(`Missing compiled fixture for ${component.name}`);
        const fixture = (await load()).default;
        for (const scenario of scenarios) {
            const native = document.createElement('section');
            const wrapped = document.createElement('section');
            const host = document.createElement('div');
            host.style.cssText = 'display:flex;align-items:flex-start;gap:24px';
            native.style.cssText = wrapped.style.cssText =
                'width:720px;flex-shrink:0;position:relative';
            const style = document.createElement('style');
            style.textContent = scenario.styles.join('\n');
            host.append(style, native, wrapped);
            document.body.append(host);
            const scripts = scenarioScripts();
            const randomness = vi.spyOn(Math, 'random').mockReturnValue(0.5);
            native.innerHTML = `<div>${scenario.markup}</div>`;
            const app = createApp({ render: () => h(fixture, { scenario: scenario.id }) });
            app.mount(wrapped);
            try {
                await settle(native);
                await settle(wrapped);
                randomness.mockRestore();
                if (scenario.scriptExecution === 'scoped') {
                    await scripts.run(native, scenario.scripts);
                    await scripts.run(wrapped, scenario.scripts);
                    await scripts.flush();
                }
                const nativeElements = await settle(native);
                const wrappedElements = await settle(wrapped);
                expect(
                    wrappedElements.map((element) => element.localName),
                    scenario.id,
                ).toEqual(nativeElements.map((element) => element.localName));
                for (const [index, expected] of nativeElements.entries()) {
                    const actual = wrappedElements[index];
                    if (!actual) throw new Error(`Missing ${expected.localName} in ${scenario.id}`);
                    expect(scalarState(actual), `${scenario.id} ${expected.localName}`).toEqual(
                        scalarState(expected),
                    );
                    const nativeStyle = getComputedStyle(expected);
                    const wrapperStyle = getComputedStyle(actual);
                    for (const property of [
                        'display',
                        'boxSizing',
                        'fontFamily',
                        'fontSize',
                        'color',
                    ]) {
                        expect(
                            Reflect.get(wrapperStyle, property),
                            `${scenario.id} ${property}`,
                        ).toBe(Reflect.get(nativeStyle, property));
                    }
                    const nativeBounds = expected.getBoundingClientRect();
                    const wrapperBounds = actual.getBoundingClientRect();
                    expect
                        .soft(wrapperBounds.width, `${scenario.id} ${expected.localName} width`)
                        .toBeCloseTo(nativeBounds.width, 0);
                    expect
                        .soft(wrapperBounds.height, `${scenario.id} ${expected.localName} height`)
                        .toBeCloseTo(nativeBounds.height, 0);
                    const expectedParts = [
                        ...(expected.shadowRoot?.querySelectorAll('[part]') ?? []),
                    ];
                    const actualParts = [...(actual.shadowRoot?.querySelectorAll('[part]') ?? [])];
                    expect(
                        actualParts.map((part) => part.getAttribute('part')),
                        scenario.id,
                    ).toEqual(expectedParts.map((part) => part.getAttribute('part')));
                }
            } finally {
                randomness.mockRestore();
                app.unmount();
                scripts.dispose();
                host.remove();
            }
        }
    }, 120_000);
}
