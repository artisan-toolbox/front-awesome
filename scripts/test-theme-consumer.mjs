import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { build, preview, createServer } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import vue from '@vitejs/plugin-vue';
import { chromium } from 'playwright';
import { frontAwesome } from '../resources/js/vite.mjs';
import { hues, roles, stops } from './theme-tokens.mjs';
import { verifyBranding } from './verify-theme-branding.mjs';
import { measureContrast } from './browser-contrast.mjs';

const root = resolve(import.meta.dirname, '../tests/theme-consumer');
const executablePath =
    process.env.CHROMIUM_EXECUTABLE ??
    (existsSync('/Applications/Chromium.app/Contents/MacOS/Chromium')
        ? '/Applications/Chromium.app/Contents/MacOS/Chromium'
        : undefined);
const browser = await chromium.launch({ executablePath, headless: true });
const results = [];
console.log(`Chromium ${browser.version()}`);
try {
    for (const prime of [false, true]) {
        const plugins = [
            vue(),
            frontAwesome({ webAwesome: 'core' }),
            tailwindcss(),
            {
                name: 'theme-consumer-entry',
                transformIndexHtml: {
                    order: 'pre',
                    handler: (html) => (prime ? html.replace('/main.ts', '/primevue.ts') : html),
                },
                resolveId(source) {
                    if (!prime && /^(primevue|@primeuix)\//.test(source))
                        throw new Error(`Base consumer imported optional dependency ${source}`);
                },
            },
        ];
        const outDir = resolve(
            import.meta.dirname,
            `../build/theme-${prime ? 'primevue' : 'base'}`,
        );
        await build({
            configFile: false,
            root,
            plugins,
            logLevel: 'warn',
            build: { outDir, emptyOutDir: true },
        });
        const server = await preview({
            configFile: false,
            root,
            build: { outDir },
            preview: { host: '127.0.0.1', port: 0 },
            logLevel: 'error',
        });
        const page = await browser.newPage({
            viewport: { width: 1100, height: 800 },
            colorScheme: 'dark',
        });
        const errors = [];
        page.on('pageerror', (error) => errors.push(error.message));
        try {
            await page.addInitScript(() => localStorage.setItem('appearance', 'light'));
            await page.goto(server.resolvedUrls.local[0]);
            await page.waitForFunction(() =>
                document.querySelector('#wa')?.shadowRoot?.querySelector('button'),
            );
            const first = await page.evaluate(() => {
                const native = getComputedStyle(document.querySelector('#native'));
                const wa = getComputedStyle(
                    document.querySelector('#wa').shadowRoot.querySelector('button'),
                );
                const main = document.querySelector('main');
                const padding = [getComputedStyle(main).padding];
                main.className = 'p-0';
                padding.push(getComputedStyle(main).padding);
                main.className = 'p-4';
                padding.push(getComputedStyle(main).padding);
                main.className = '';
                return {
                    nativeFont: native.fontFamily,
                    waFont: wa.fontFamily,
                    nativeRadius: native.borderRadius,
                    waRadius: wa.borderRadius,
                    nativeColor: native.color,
                    scheme: wa.colorScheme,
                    padding,
                    slots: ['header', 'navigation', 'aside', 'footer'].map(
                        (slot) =>
                            getComputedStyle(document.querySelector(`[slot='${slot}']`)).padding,
                    ),
                    reset: ['html', 'body'].map((tag) => {
                        const css = getComputedStyle(document.querySelector(tag));
                        return [css.margin, css.padding, css.minHeight];
                    }),
                    toggle: getComputedStyle(document.querySelector('[data-toggle-nav]')).display,
                };
            });
            assert.equal(first.nativeFont, first.waFont);
            assert.equal(first.waFont, 'Georgia, serif');
            assert.equal(first.nativeRadius, first.waRadius);
            assert.equal(first.waRadius, '10px');
            assert.equal(first.nativeColor, 'rgb(0, 0, 0)');
            assert.equal(first.scheme, 'light');
            assert.deepEqual(first.padding, ['48px', '0px', '16px']);
            assert.deepEqual(first.slots, ['16px', '16px', '16px', '48px']);
            assert.deepEqual(first.reset, [
                ['0px', '0px', '100%'],
                ['0px', '0px', '100%'],
            ]);
            assert.equal(first.toggle, 'none');
            await page.waitForFunction(() =>
                [...document.querySelectorAll('wa-tag')].every(
                    (tag) =>
                        tag.shadowRoot?.querySelector('slot') &&
                        tag.querySelector('wa-icon')?.shadowRoot?.querySelector('svg'),
                ),
            );
            const tags = await page.evaluate(() =>
                ['native', 'wrapper'].map((kind) =>
                    [0, 1, 2].map((index) => {
                        const tag = document.querySelector(`#tag-${kind}-${index}`);
                        const css = getComputedStyle(tag);
                        const bounds = tag.getBoundingClientRect();
                        const content = tag.firstElementChild.getBoundingClientRect();
                        const icon = tag.querySelector('wa-icon').getBoundingClientRect();
                        return {
                            padding: [css.paddingLeft, css.paddingRight].map(parseFloat),
                            border: parseFloat(css.borderLeftWidth),
                            iconInset: icon.left - bounds.left,
                            contentFits:
                                content.top >= bounds.top && content.bottom <= bounds.bottom,
                        };
                    }),
                ),
            );
            for (const [index, [native, zero, custom]] of tags.entries()) {
                const kind = index === 0 ? 'native' : 'wrapper';
                assert.ok(
                    native.padding.every((padding) => padding > 0),
                    `${kind} Tag retains native horizontal padding`,
                );
                assert.ok(native.border > 0, `${kind} Tag retains its native border`);
                assert.ok(
                    native.iconInset > native.border,
                    `${kind} Tag insets its icon from the border`,
                );
                assert.ok(native.contentFits, `${kind} Tag contains the icon and label`);
                assert.deepEqual(zero.padding, [0, 0]);
                assert.equal(zero.border, 0);
                assert.deepEqual(custom.padding, [16, 16]);
                assert.equal(custom.border, 4);
            }
            const foundations = await page.evaluate(() => {
                const scope = document.createElement('section');
                scope.className = 'fa-theme';
                scope.style.cssText =
                    '--wa-space-scale:2; --wa-border-radius-scale:2; --wa-font-size-scale:1.25; --font-sans:monospace';
                const sample = document.createElement('div');
                sample.style.cssText =
                    'width:var(--wa-space-m);border-radius:var(--wa-border-radius-m);font-size:var(--wa-font-size-m);font-family:var(--wa-font-family-body)';
                scope.append(sample);
                document.body.append(scope);
                const css = getComputedStyle(sample);
                const result = {
                    space: css.width,
                    radius: css.borderRadius,
                    size: css.fontSize,
                    font: css.fontFamily,
                };
                scope.remove();
                const native = document.createElement('div');
                native.className = 'shadow-md';
                const wa = document.createElement('div');
                wa.style.boxShadow = 'var(--wa-shadow-m)';
                document.body.append(native, wa);
                result.shadowNative = getComputedStyle(native).boxShadow;
                result.shadowWa = getComputedStyle(wa).boxShadow;
                native.remove();
                wa.remove();
                return result;
            });
            assert.deepEqual(
                [foundations.space, foundations.radius, foundations.size, foundations.font],
                ['32px', '20px', '20px', 'monospace'],
            );
            assert.ok(foundations.shadowNative.endsWith(foundations.shadowWa));
            assert.notEqual(foundations.shadowWa, 'none');
            await page.waitForFunction(
                () =>
                    parseFloat(
                        getComputedStyle(document.querySelector('#target')).scrollMarginTop,
                    ) > 0,
            );
            const layout = await page.evaluate(() => {
                const main = document.querySelector('main');
                main.style.minHeight = '200vh';
                const header = document
                    .querySelector('wa-page')
                    .shadowRoot.querySelector('[part~="header"]');
                window.scrollTo(0, 200);
                return {
                    sticky: getComputedStyle(header).position,
                    top: header.getBoundingClientRect().top,
                };
            });
            assert.equal(layout.sticky, 'sticky');
            assert.equal(layout.top, 0);
            await page.locator('#target').evaluate((element) => element.scrollIntoView());
            assert.ok(
                await page.evaluate(
                    () =>
                        document.querySelector('#target').getBoundingClientRect().top >=
                        document
                            .querySelector('wa-page')
                            .shadowRoot.querySelector('[part~="header"]')
                            .getBoundingClientRect().bottom -
                            1,
                ),
            );
            await page.evaluate(() => {
                document.querySelector('main').style.minHeight = '';
                window.scrollTo(0, 0);
            });
            const contrasts = await page.evaluate(
                ({ hues, roles, stops }) => {
                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d', { willReadFrequently: true });
                    const rgb = (color) => {
                        context.clearRect(0, 0, 1, 1);
                        context.fillStyle = color;
                        context.fillRect(0, 0, 1, 1);
                        const pixel = context.getImageData(0, 0, 1, 1).data;
                        if (pixel[3] !== 255) throw new Error(`Nonopaque color ${color}`);
                        return [...pixel]
                            .slice(0, 3)
                            .map((channel) => {
                                const n = channel / 255;
                                return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
                            })
                            .reduce(
                                (n, channel, index) =>
                                    n + channel * [0.2126, 0.7152, 0.0722][index],
                                0,
                            );
                    };
                    const contrast = (element, foreground, background) => {
                        element.style.color = `var(--wa-${foreground})`;
                        element.style.backgroundColor = `var(--wa-${background})`;
                        const css = getComputedStyle(element);
                        for (const token of [foreground, background])
                            if (!css.getPropertyValue(`--wa-${token}`).trim())
                                throw new Error(`Missing token ${token}`);
                        const a = rgb(css.color);
                        const b = rgb(css.backgroundColor);
                        return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
                    };
                    const observations = [];
                    const originalRootClasses = document.documentElement.className;
                    for (const classes of [
                        'wa-light wa-brand-yellow',
                        'wa-dark wa-brand-yellow',
                        'wa-light fa-theme custom-brand wa-brand-yellow',
                    ]) {
                        document.documentElement.className = classes;
                        const child = document.createElement('span');
                        document.body.append(child);
                        const rootCss = getComputedStyle(document.documentElement);
                        {
                            if (
                                rootCss.getPropertyValue('--wa-color-brand-30').trim() !==
                                rootCss.getPropertyValue('--color-yellow-700').trim()
                            )
                                throw new Error(`Root role lost to default aliases ${classes}`);
                        }
                        observations.push({
                            mode: classes,
                            role: 'brand',
                            hue: 'root yellow',
                            state: 'root',
                            ratio: contrast(child, 'color-brand-on-loud', 'color-brand-fill-loud'),
                        });
                        child.remove();
                    }
                    document.documentElement.className = originalRootClasses;

                    for (const mode of ['wa-light', 'wa-dark']) {
                        for (const role of Object.keys(roles))
                            for (const hue of hues) {
                                const parent = document.createElement('section');
                                parent.className = `${mode} wa-${role}-${hue}`;
                                document.querySelector('#scopes').append(parent);
                                const child = document.createElement('span');
                                parent.append(child);
                                for (const state of ['quiet', 'normal', 'loud'])
                                    observations.push({
                                        mode,
                                        role,
                                        hue,
                                        state,
                                        ratio: contrast(
                                            child,
                                            `color-${role}-on-${state}`,
                                            `color-${role}-fill-${state}`,
                                        ),
                                    });
                                observations.push({
                                    mode,
                                    role,
                                    hue,
                                    state: 'key',
                                    ratio: contrast(child, `color-${hue}-on`, `color-${hue}`),
                                });
                                parent.remove();
                            }
                    }
                    for (const classes of ['wa-dark', 'wa-dark wa-invert', 'wa-light']) {
                        const container = document.createElement('section');
                        container.className = 'fa-theme custom-brand';
                        const mode = document.createElement('div');
                        mode.className = classes;
                        container.append(mode);
                        const local = document.createElement('div');
                        local.className = 'wa-brand-yellow';
                        mode.append(local);
                        document.querySelector('#scopes').append(container);
                        for (const element of [container, mode, local])
                            observations.push({
                                mode: classes,
                                role: 'brand',
                                hue: element.className,
                                state: 'nested',
                                ratio: contrast(
                                    element,
                                    'color-brand-on-loud',
                                    'color-brand-fill-loud',
                                ),
                            });
                        const css = getComputedStyle(container);
                        if (
                            css.getPropertyValue('--wa-color-brand-30').trim() !==
                            css.getPropertyValue('--color-indigo-700').trim()
                        )
                            throw new Error('Custom branding did not rebind');
                        container.remove();
                    }
                    for (const [, stop] of stops)
                        if (
                            !getComputedStyle(document.documentElement)
                                .getPropertyValue(`--color-brand-${stop}`)
                                .trim()
                        )
                            throw new Error(`Pruned brand ${stop}`);
                    return observations;
                },
                { hues, roles, stops },
            );
            for (const observation of contrasts)
                assert.ok(observation.ratio >= 4.5, JSON.stringify(observation));
            const interactionPairs = [];
            if (!prime) {
                await page.locator('#wa').evaluate((element) => {
                    element.shadowRoot.querySelector('button').style.transition = 'none';
                });
                for (const mode of ['wa-light', 'wa-dark'])
                    for (const hue of hues) {
                        await page.evaluate(
                            ({ mode, hue }) => {
                                document.documentElement.className = mode;
                                document.querySelector('#wa').className = `wa-brand-${hue}`;
                            },
                            { mode, hue },
                        );
                        await page.locator('#wa').hover();
                        interactionPairs.push({
                            mode,
                            hue,
                            state: 'hover',
                            ...(await page.evaluate(measureContrast, {
                                selector: '#wa',
                                part: 'button',
                            })),
                        });
                        await page.mouse.down();
                        interactionPairs.push({
                            mode,
                            hue,
                            state: 'active',
                            ...(await page.evaluate(measureContrast, {
                                selector: '#wa',
                                part: 'button',
                            })),
                        });
                        await page.mouse.up();
                    }
                for (const pair of interactionPairs)
                    assert.ok(pair.ratio >= 4.5, JSON.stringify(pair));
            }
            await page.evaluate(() => {
                document.querySelector('#wa').className = '';
            });
            await page.evaluate(() => {
                document.documentElement.className = 'dark wa-dark';
            });
            await page.emulateMedia({ colorScheme: 'light' });
            assert.equal(
                await page
                    .locator('#native')
                    .evaluate((element) => getComputedStyle(element).color),
                'rgb(255, 255, 255)',
            );
            const dark = await page.evaluate(() => ({
                scheme: getComputedStyle(document.querySelector('#wa')).colorScheme,
                background: getComputedStyle(document.body).backgroundColor,
                color: getComputedStyle(document.querySelector('#native-text')).color,
            }));
            assert.equal(dark.scheme, 'dark');
            assert.notEqual(dark.background, 'rgb(255, 255, 255)');
            assert.notEqual(dark.color, 'rgb(0, 0, 0)');
            if (prime) {
                await page.waitForSelector('#prime-button.p-button');
                await page.locator('#prime-button').evaluate((element) => {
                    element.style.transition = 'none';
                });
                assert.deepEqual(
                    await page.locator('#prime-input').evaluate((element) => {
                        const css = getComputedStyle(element);
                        return [css.borderRadius, css.paddingInline, css.paddingBlock];
                    }),
                    ['10px', '12px', '8px'],
                );
                const read = () =>
                    page.locator('#prime-button').evaluate((element) => ({
                        background: getComputedStyle(element).backgroundColor,
                        color: getComputedStyle(element).color,
                        radius: getComputedStyle(element).borderRadius,
                        primary: getComputedStyle(element)
                            .getPropertyValue('--p-primary-color')
                            .trim(),
                    }));
                const primeDark = await read();
                const primeDarkContrast = await page.evaluate(measureContrast, {
                    selector: '#prime-button',
                    expectedBackground: '--color-brand-300',
                });
                assert.ok(primeDarkContrast.ratio >= 4.5, JSON.stringify(primeDarkContrast));
                assert.equal(primeDark.radius, '10px');
                assert.ok(
                    primeDark.primary.includes('var(--color-brand-300)') ||
                        primeDark.primary.includes('oklch'),
                );
                await page.evaluate(() => {
                    document.documentElement.className = 'wa-light';
                });
                const primeLight = await read();
                assert.ok(
                    (
                        await page.evaluate(measureContrast, {
                            selector: '#prime-button',
                            expectedBackground: '--color-brand-800',
                        })
                    ).ratio >= 4.5,
                );
                assert.notEqual(primeDark.background, primeLight.background);
                assert.notEqual(primeDark.color, primeLight.color);
                assert.notEqual(primeLight.background, 'rgba(0, 0, 0, 0)');
                await page.locator('#prime-select').click();
                const overlay = page.locator('.p-select-overlay');
                await overlay.waitFor({ state: 'visible' });
                assert.equal(await overlay.evaluate((element) => element.closest('#prime')), null);
                const overlayLight = await overlay.evaluate((element) => ({
                    background: getComputedStyle(element).backgroundColor,
                    radius: getComputedStyle(element).borderRadius,
                    font: getComputedStyle(element).fontFamily,
                }));
                assert.equal(overlayLight.radius, '10px');
                assert.equal(overlayLight.font, 'Georgia, serif');
                await page.evaluate(() => {
                    document.documentElement.className = 'dark wa-dark';
                });
                const overlayDark = await overlay.evaluate(
                    (element) => getComputedStyle(element).backgroundColor,
                );
                assert.notEqual(overlayDark, overlayLight.background);
                assert.ok(
                    (
                        await page.evaluate(measureContrast, {
                            selector: '.p-select-overlay',
                        })
                    ).ratio >= 4.5,
                );
                await page.keyboard.press('Escape');
                await overlay.waitFor({ state: 'hidden' });
            }
            await verifyBranding(page, { prime });
            await page.setViewportSize({ width: 390, height: 800 });
            await page.waitForFunction(
                () => document.querySelector('wa-page')?.getAttribute('view') === 'mobile',
            );
            assert.notEqual(
                await page
                    .locator('[data-toggle-nav]')
                    .evaluate((element) => getComputedStyle(element).display),
                'none',
            );
            await page.locator('[data-toggle-nav]').click();
            await page.waitForFunction(() => document.querySelector('wa-page').navOpen === true);
            await page.locator('[data-drawer="close"]').click();
            await page.waitForFunction(() => document.querySelector('wa-page').navOpen === false);
            await page.locator('[data-toggle-nav]').focus();
            await page.keyboard.press('Enter');
            await page.waitForFunction(() => document.querySelector('wa-page').navOpen === true);
            await page.keyboard.press('Escape');
            await page.waitForFunction(() => document.querySelector('wa-page').navOpen === false);
            await page.waitForFunction(
                () => document.activeElement === document.querySelector('[data-toggle-nav]'),
            );
            assert.ok(
                await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
            );
            await page.evaluate(() => {
                document.body.innerHTML =
                    '<wa-page id="empty-page"><header slot="header">Standalone page</header><main>No navigation.</main></wa-page>';
            });
            await page.waitForFunction(
                () => document.querySelector('#empty-page')?.disableNavigationToggle === true,
            );
            assert.equal(
                await page
                    .locator('#empty-page')
                    .evaluate(
                        (element) =>
                            element.shadowRoot
                                .querySelector('slot[name="navigation-toggle"]')
                                .getBoundingClientRect().width,
                    ),
                0,
            );
            assert.deepEqual(errors, []);
            results.push({
                consumer: prime ? 'PrimeVue' : 'base without optional imports',
                contrastPairs: contrasts.length,
                interactionPairs: interactionPairs.length,
                minimumContrast: Math.min(...contrasts.map((value) => value.ratio)),
                page: 'desktop/mobile/padding/menu passed',
            });
        } finally {
            await page.close();
            await new Promise((resolve) => server.httpServer.close(resolve));
        }
    }
    const server = await createServer({
        configFile: false,
        root: resolve(root, '../..'),
        server: { middlewareMode: true },
    });
    try {
        const preset = await server.ssrLoadModule('/resources/js/primevue.ts');
        assert.equal(preset.frontAwesomePrimeVueTheme.options.darkModeSelector, '.wa-dark');
    } finally {
        await server.close();
    }
    console.log(JSON.stringify(results, null, 2));
} finally {
    await browser.close();
}
