/// <reference types="vite/client" />
import { beforeAll, expect, test, vi } from 'vite-plus/test';
import '#front-awesome-webawesome/styles/themes/default.css';
import preflight from 'tailwindcss/preflight.css?raw';
import coreHostReset from '../../../resources/js/theme/core-host-reset.css?raw';
import proHostReset from '../../../resources/js/theme/pro-host-reset.css?raw';
import inventory from '../upstream-scenarios.json';

export const hostReset = coreHostReset + proHostReset;
const nativeComponents = import.meta.glob('#front-awesome-webawesome/components/*/*.js');
export const coreTags = new Set(inventory.components.map((component) => component.tag));

export async function registerNativeComponents() {
    await Promise.all(
        Object.entries(nativeComponents)
            .filter(([path]) => path.split('/').at(-1) === `${path.split('/').at(-2)}.js`)
            .map(([, load]) => load()),
    );
}

const resetProperties = [
    'margin-top',
    'margin-right',
    'margin-bottom',
    'margin-left',
    'padding-top',
    'padding-right',
    'padding-bottom',
    'padding-left',
    'border-top-width',
    'border-right-width',
    'border-bottom-width',
    'border-left-width',
    'border-top-style',
    'border-right-style',
    'border-bottom-style',
    'border-left-style',
    'border-top-color',
    'border-right-color',
    'border-bottom-color',
    'border-left-color',
    'border-radius',
    'box-sizing',
    'display',
    'font-family',
    'font-size',
    'font-weight',
    'line-height',
    'color',
    'background-color',
    'opacity',
] as const;

export function stylesheet(css: string) {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.append(style);
    return style;
}

export async function settle(root: HTMLElement) {
    await vi.dynamicImportSettled();
    const hosts = [...root.querySelectorAll<HTMLElement>('*')].filter((host) =>
        coreTags.has(host.localName),
    );
    await Promise.all(hosts.map((host) => customElements.whenDefined(host.localName)));
    for (let round = 0; round < 3; round++) {
        await Promise.all(hosts.map((host) => Reflect.get(host, 'updateComplete')));
    }
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    const animations = [
        ...document.getAnimations(),
        ...hosts.flatMap((host) => host.shadowRoot?.getAnimations() ?? []),
    ];
    for (const animation of animations) {
        const endTime = animation.effect?.getComputedTiming().endTime;
        if (typeof endTime === 'number' && Number.isFinite(endTime)) animation.finish();
        else {
            animation.pause();
            animation.currentTime = 0;
        }
    }
    await Promise.all(hosts.map((host) => Reflect.get(host, 'updateComplete')));
    return hosts;
}

type ThemeMode = 'wa-light' | 'wa-dark';

export async function fixture(markup: string, mode?: ThemeMode) {
    const root = document.createElement('section');
    if (mode) root.classList.add(mode);
    root.style.cssText =
        'width:720px;font:16px/1.5 Arial,sans-serif;position:relative;--wa-transition-fast:0ms;--wa-transition-normal:0ms;--wa-transition-slow:0ms;--show-duration:0ms;--hide-duration:0ms;';
    root.innerHTML = markup;
    document.body.append(root);
    await settle(root);
    if (root.querySelector('wa-carousel')) {
        await new Promise<void>((resolve) => setTimeout(resolve, 150));
    }
    await settle(root);
    return root;
}

function resetSnapshot(root: HTMLElement) {
    return [...root.querySelectorAll<HTMLElement>('*')]
        .filter((host) => coreTags.has(host.localName))
        .map((host) => ({
            tag: host.localName,
            styles: Object.fromEntries(
                resetProperties.map((property) => [
                    property,
                    getComputedStyle(host).getPropertyValue(property),
                ]),
            ),
            parts: [...(host.shadowRoot?.querySelectorAll<HTMLElement>('[part]') ?? [])].map(
                (part) => ({
                    name: part.getAttribute('part'),
                    styles: Object.fromEntries(
                        resetProperties.map((property) => [
                            property,
                            getComputedStyle(part).getPropertyValue(property),
                        ]),
                    ),
                }),
            ),
        }));
}

export function testHostResetExamples(mode: ThemeMode) {
    beforeAll(registerNativeComponents);
    test(`restores native host and shadow-part styles in every Core upstream example in ${mode}`, async () => {
        const checked = new Set<string>();
        for (const scenario of inventory.scenarios) {
            const style = stylesheet(scenario.styles.join('\n'));
            const root = await fixture(scenario.markup, mode);
            let baseline = resetSnapshot(root);
            const preflightStyle = stylesheet(`@layer base { ${preflight} }\n${hostReset}`);
            try {
                await settle(root);
                let actual = resetSnapshot(root);
                for (
                    let attempt = 0;
                    attempt < 3 && JSON.stringify(actual) !== JSON.stringify(baseline);
                    attempt++
                ) {
                    preflightStyle.remove();
                    await settle(root);
                    baseline = resetSnapshot(root);
                    document.head.append(preflightStyle);
                    await settle(root);
                    actual = resetSnapshot(root);
                }
                expect(actual, scenario.id).toEqual(baseline);
                for (const snapshot of baseline) checked.add(snapshot.tag);
            } finally {
                root.remove();
                style.remove();
                preflightStyle.remove();
            }
        }
        expect([...checked].sort()).toEqual(
            inventory.components.map((component) => component.tag).sort(),
        );
    }, 120_000);
}
