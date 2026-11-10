/// <reference types="vite/client" />
import { beforeAll, expect, test } from 'vite-plus/test';
import { userEvent } from '@vitest/browser/context';
import '#front-awesome-webawesome/styles/themes/default.css';
import preflight from 'tailwindcss/preflight.css?raw';
import coreReset from '../../resources/js/theme/core-host-reset.css?raw';
import proReset from '../../resources/js/theme/pro-host-reset.css?raw';
import definitions from '../../resources/js/WebAwesome/proComponents.json';

const runtimes = import.meta.glob([
    '../../node_modules/@web.awesome.me/webawesome-pro/dist/components/*/*.js',
    '!../../node_modules/@web.awesome.me/webawesome-pro/dist/components/*/*test*.js',
]);
const available = Object.keys(runtimes).length > 0;
const properties = [
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
];

beforeAll(async () => {
    if (available)
        await Promise.all(
            Object.entries(runtimes)
                .filter(([path]) => path.split('/').at(-1) === `${path.split('/').at(-2)}.js`)
                .map(([, load]) => load()),
        );
});

async function settle(root: HTMLElement) {
    for (let round = 0; round < 3; round++) {
        await Promise.all(
            [...root.querySelectorAll<HTMLElement>('*')].map((host) =>
                Reflect.get(host, 'updateComplete'),
            ),
        );
    }
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

function snapshot(root: HTMLElement) {
    return definitions.map(({ tag }) => {
        const host = root.querySelector(tag);
        if (!(host instanceof HTMLElement)) throw new Error(`Missing licensed ${tag}`);
        return [host, ...(host.shadowRoot?.querySelectorAll<HTMLElement>('[part]') ?? [])].map(
            (element) => ({
                tag,
                part: element.getAttribute('part'),
                styles: Object.fromEntries(
                    properties.map((property) => [
                        property,
                        getComputedStyle(element).getPropertyValue(property),
                    ]),
                ),
                width: Math.round(element.getBoundingClientRect().width * 10) / 10,
                height: Math.round(element.getBoundingClientRect().height * 10) / 10,
            }),
        );
    });
}

for (const mode of ['wa-light', 'wa-dark']) {
    test.skipIf(!available)(
        `preserves licensed Pro host and part geometry with Preflight in ${mode}`,
        async () => {
            const root = document.createElement('section');
            root.className = mode;
            root.style.cssText =
                'width:720px;font:16px/1.5 Arial,sans-serif;--wa-transition-fast:0ms;--wa-transition-normal:0ms;--wa-transition-slow:0ms;';
            for (const definition of definitions) {
                const host = document.createElement(definition.tag);
                host.setAttribute('label', definition.name);
                if (definition.tag === 'wa-combobox')
                    host.innerHTML =
                        '<wa-option value="apple">Apple</wa-option><wa-option value="pear">Pear</wa-option>';
                if (definition.tag === 'wa-date-picker' || definition.tag === 'wa-date-input')
                    host.setAttribute('value', '2026-06-15');
                if (definition.tag === 'wa-sparkline') host.setAttribute('data', '1 3 2 5');
                if (definition.tag === 'wa-data-grid') {
                    Reflect.set(host, 'columns', [{ accessorKey: 'name', header: 'Name' }]);
                    Reflect.set(host, 'data', [{ name: 'Ada' }, { name: 'Grace' }]);
                }
                root.append(host);
            }
            document.body.append(root);
            const style = document.createElement('style');
            try {
                await Promise.all(definitions.map(({ tag }) => customElements.whenDefined(tag)));
                await settle(root);
                const native = snapshot(root);
                style.textContent = `@layer base { ${preflight} }\n${coreReset}\n${proReset}`;
                document.head.append(style);
                await settle(root);
                expect(snapshot(root)).toEqual(native);
                expect(native).toHaveLength(17);
                const combobox = root.querySelector('wa-combobox');
                const dateInput = root.querySelector('wa-date-input');
                if (!(combobox instanceof HTMLElement) || !(dateInput instanceof HTMLElement))
                    throw new Error('Missing licensed popup controls');
                for (const popup of [combobox, dateInput]) {
                    Reflect.set(popup, 'open', true);
                    await settle(root);
                    expect(Reflect.get(popup, 'open')).toBe(true);
                    style.remove();
                    await settle(root);
                    const nativeOpen = snapshot(root);
                    document.head.append(style);
                    await settle(root);
                    expect(snapshot(root)).toEqual(nativeOpen);
                    Reflect.set(popup, 'open', false);
                    await settle(root);
                }
                Reflect.set(combobox, 'open', true);
                await settle(root);
                const option = combobox.querySelector('wa-option');
                if (!(option instanceof HTMLElement))
                    throw new Error('Missing licensed combobox option');
                await userEvent.click(option);
                await settle(root);
                expect(Reflect.get(combobox, 'value')).toBe('apple');
                const datePicker = root.querySelector('wa-date-picker');
                const day = datePicker?.shadowRoot?.querySelector<HTMLElement>(
                    '[part~="day"]:not([disabled])',
                );
                if (!(datePicker instanceof HTMLElement) || !day)
                    throw new Error('Missing licensed date picker day');
                await userEvent.click(day);
                await settle(root);
                expect(Reflect.get(datePicker, 'value')).toBe('2026-06-01');
                style.remove();
                await settle(root);
                const nativeSelected = snapshot(root);
                document.head.append(style);
                await settle(root);
                expect(snapshot(root)).toEqual(nativeSelected);
            } finally {
                style.remove();
                root.remove();
            }
        },
    );
}
