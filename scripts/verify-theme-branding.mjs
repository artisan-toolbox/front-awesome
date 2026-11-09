import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import Aura from '@primeuix/themes/aura';

const stops = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const paletteHues = Object.entries(Aura.primitive)
    .filter(([, value]) => stops.every((stop) => Object.hasOwn(value, stop)))
    .map(([hue]) => hue);
const roles = { neutral: 'gray', success: 'green', warning: 'yellow', danger: 'red' };

async function assertColor(page, selector, property, variable, part) {
    const colors = await page.locator(selector).evaluate(
        (host, { property, variable, part }) => {
            const sample = document.createElement('span');
            sample.style.color = `var(${variable})`;
            host.append(sample);
            const actual = getComputedStyle(
                part ? host.shadowRoot.querySelector(part) : host,
            ).getPropertyValue(property);
            const expected = getComputedStyle(sample).color;
            const input = getComputedStyle(sample).getPropertyValue(variable).trim();
            sample.remove();
            return { actual, expected, input };
        },
        { property, variable, part },
    );
    assert.notEqual(colors.input, '', `Missing retained Tailwind input ${variable}`);
    assert.equal(colors.actual, colors.expected, `${selector} ${property} must use ${variable}`);
}

export async function verifyBranding(page, { prime }) {
    const original = await page.evaluate(() => ({
        mode: document.documentElement.className,
        style: document.documentElement.getAttribute('style'),
    }));
    if (prime) {
        for (const hue of paletteHues)
            await assertColor(
                page,
                `#prime-palette-${hue}`,
                'background-color',
                `--color-${hue}-500`,
            );
    }
    await page.evaluate(
        ({ paletteHues, stops }) => {
            for (const [index, hue] of paletteHues.entries())
                for (const [step, stop] of stops.entries())
                    document.documentElement.style.setProperty(
                        `--color-${hue}-${stop}`,
                        `rgb(${20 + index * 7} ${30 + step * 15} ${220 - step * 14})`,
                    );
            const scope = document.createElement('section');
            scope.id = 'branding-check';
            for (const role of ['neutral', 'success', 'warning', 'danger']) {
                const button = document.createElement('wa-button');
                button.id = `branding-${role}`;
                button.setAttribute('variant', role);
                button.textContent = role;
                scope.append(button);
            }
            document.body.append(scope);
        },
        { paletteHues, stops },
    );
    await page.waitForFunction(() =>
        document.querySelector('#branding-danger')?.shadowRoot?.querySelector('button'),
    );
    await page.locator('#branding-check wa-button').evaluateAll((elements) => {
        for (const element of elements)
            element.shadowRoot.querySelector('button').style.transition = 'none';
    });
    if (prime)
        await page.locator('#prime button').evaluateAll((elements) => {
            for (const element of elements) element.style.transition = 'none';
        });
    for (const mode of ['wa-light', 'wa-dark']) {
        await page.evaluate((mode) => {
            document.documentElement.className = mode;
        }, mode);
        const dark = mode === 'wa-dark';
        for (const [role, hue] of Object.entries(roles)) {
            const selector = `#branding-${role}`;
            await page.mouse.move(0, 0);
            await assertColor(
                page,
                selector,
                'background-color',
                `--color-${hue}-${dark ? 300 : 800}`,
                'button',
            );
        }
        for (const hue of ['gray', 'green', 'yellow', 'orange', 'red'])
            for (const stop of stops) {
                const selector = '#branding-utility';
                await page.evaluate(
                    ({ hue, stop }) => {
                        document.querySelector('#branding-utility')?.remove();
                        const sample = document.createElement('span');
                        sample.id = 'branding-utility';
                        sample.className = `bg-${hue}-${stop}`;
                        document.querySelector('#branding-check').append(sample);
                    },
                    { hue, stop },
                );
                await assertColor(page, selector, 'background-color', `--color-${hue}-${stop}`);
            }
        if (prime) {
            for (const hue of paletteHues) {
                await page.mouse.move(0, 0);
                await assertColor(
                    page,
                    `#prime-palette-${hue}`,
                    'background-color',
                    `--color-${hue}-500`,
                );
            }
            for (const [severity, hue] of Object.entries({
                success: 'green',
                warn: 'orange',
                danger: 'red',
                info: 'sky',
                help: 'purple',
                secondary: 'gray',
            })) {
                const selector = `#prime-${severity}`;
                const expectedStops =
                    severity === 'secondary'
                        ? dark
                            ? [800, 700, 600]
                            : [100, 200, 300]
                        : dark
                          ? [400, 300, 200]
                          : [500, 600, 700];
                await page.mouse.move(0, 0);
                await assertColor(
                    page,
                    selector,
                    'background-color',
                    `--color-${hue}-${expectedStops[0]}`,
                );
                await page.locator(selector).hover();
                await assertColor(
                    page,
                    selector,
                    'background-color',
                    `--color-${hue}-${expectedStops[1]}`,
                );
                await page.mouse.down();
                await assertColor(
                    page,
                    selector,
                    'background-color',
                    `--color-${hue}-${expectedStops[2]}`,
                );
                await page.mouse.up();
            }
            await assertColor(
                page,
                '#prime-warn-tag',
                'color',
                `--color-orange-${dark ? 300 : 700}`,
            );
            await assertColor(
                page,
                '#prime-warn-badge',
                'background-color',
                `--color-orange-${dark ? 400 : 500}`,
            );
            await assertColor(
                page,
                '#prime-warn-message',
                'color',
                `--color-yellow-${dark ? 500 : 600}`,
            );
        }
    }
    const template = await readFile(
        new URL('../resources/css/branding.css', import.meta.url),
        'utf8',
    );
    const mappings = {
        brand: 'indigo',
        gray: 'slate',
        green: 'emerald',
        yellow: 'amber',
        red: 'rose',
        orange: 'amber',
    };
    const declarations = [
        ...template.matchAll(
            /\/\*\s*(--color-([a-z]+)-(\d+):\s*var\(--color-([a-z]+)-\3\);)\s*\*\//g,
        ),
    ];
    for (const [hue, target] of Object.entries(mappings)) {
        const ramp = declarations.filter((match) => match[2] === hue);
        assert.deepEqual(
            ramp.map((match) => Number(match[3])),
            stops,
            `Complete commented ${hue} ramp`,
        );
        assert.ok(
            ramp.every((match) => match[4] === target),
            `Consistent ${hue} example`,
        );
    }
    await page.evaluate(() => {
        document.documentElement.removeAttribute('style');
        document.documentElement.className = 'wa-light';
    });
    const activatedStyle = await page.addStyleTag({
        content: `:root { ${declarations.map((match) => match[1]).join('\n')} }`,
    });
    for (const [hue, target] of Object.entries(mappings)) {
        for (const stop of stops) {
            const probe = await page.evaluate(
                ({ hue, target, stop }) => {
                    const sample = document.createElement('span');
                    document.body.append(sample);
                    sample.style.color = `var(--color-${hue}-${stop})`;
                    const actual = getComputedStyle(sample).color;
                    sample.style.color = `var(--color-${target}-${stop})`;
                    const expected = getComputedStyle(sample).color;
                    const input = getComputedStyle(sample)
                        .getPropertyValue(`--color-${hue}-${stop}`)
                        .trim();
                    const targetInput = getComputedStyle(sample)
                        .getPropertyValue(`--color-${target}-${stop}`)
                        .trim();
                    sample.remove();
                    return { actual, expected, input, targetInput };
                },
                { hue, target, stop },
            );
            assert.notEqual(probe.input, '', `Activated ${hue}-${stop} input exists`);
            assert.notEqual(probe.targetInput, '', `Target ${target}-${stop} input exists`);
            assert.equal(
                probe.actual,
                probe.expected,
                `Activated published ${hue}-${stop} example`,
            );
        }
    }
    await activatedStyle.evaluate((element) => element.remove());
    await page.locator('#branding-check').evaluate((element) => element.remove());
    await page.evaluate(({ mode, style }) => {
        document.documentElement.className = mode;
        if (style === null) document.documentElement.removeAttribute('style');
        else document.documentElement.setAttribute('style', style);
    }, original);
}
