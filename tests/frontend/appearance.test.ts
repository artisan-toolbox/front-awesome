import { createRenderer, createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { expect, onTestFinished, test, vi } from 'vite-plus/test';
import { createFrontAwesome } from '@artisan-toolbox/front-awesome';
import { Appearance as NamedAppearance } from '@artisan-toolbox/front-awesome/components';
import Appearance from '@artisan-toolbox/front-awesome/components/Appearance.vue';

vi.mock('#front-awesome-webawesome/components/toast/toast.js', () => ({}));

const renderer = createRenderer<object, object>({
    createElement: () => ({}),
    createText: () => ({}),
    createComment: () => ({}),
    insert() {},
    remove() {},
    setText() {},
    setElementText() {},
    patchProp() {},
    parentNode: () => null,
    nextSibling: () => null,
});

interface AppearanceSlot {
    appearance: 'system' | 'dark' | 'light';
    toggle: () => void;
    system: () => void;
    dark: () => void;
    light: () => void;
}

async function mountSelector() {
    let slot: AppearanceSlot | undefined;
    let serverRender = true;
    const app = renderer
        .createApp({
            render: () => {
                if (!serverRender) {
                    return null;
                }

                return h(
                    Appearance,
                    {},
                    {
                        default: (appearanceSlot: AppearanceSlot) => {
                            slot = appearanceSlot;
                            return h('output', appearanceSlot.appearance);
                        },
                    },
                );
            },
        })
        .use(createFrontAwesome({ appearance: true }));

    // Vitest compiles Vue templates for SSR. Mount the app shell to exercise its cleanup.
    await renderToString(app);
    serverRender = false;
    app.mount({});
    let mounted = true;
    const unmount = () => {
        app.unmount();
        mounted = false;
    };
    onTestFinished(() => {
        if (mounted) {
            unmount();
        }
    });

    if (slot === undefined) {
        throw new Error('Appearance did not render its default slot.');
    }

    return { slot, unmount };
}

function useBrowser({
    dark = false,
    stored,
    storageBlocked = false,
}: { dark?: boolean; stored?: string; storageBlocked?: boolean } = {}) {
    const htmlClasses = new Set(['wa-theme-custom', 'wa-palette-custom', 'page', 'wa-light']);
    const bodyClasses = new Set(['wa-light', 'body']);
    const storage = new Map<string, string>();
    if (stored !== undefined) {
        storage.set('appearance', stored);
    }
    const media = Object.assign(new EventTarget(), { matches: dark });
    const view = {
        matchMedia: () => media,
        get localStorage() {
            if (storageBlocked) {
                throw new DOMException('Storage is blocked.', 'SecurityError');
            }

            return { getItem: storage.get.bind(storage), setItem: storage.set.bind(storage) };
        },
    };
    const browserDocument = Object.assign(new EventTarget(), {
        defaultView: view,
        documentElement: {
            classList: {
                toggle: (name: string, enabled: boolean) =>
                    enabled ? htmlClasses.add(name) : htmlClasses.delete(name),
            },
        },
        body: { append() {}, classList: bodyClasses },
        createElement: () => ({ remove() {}, updateComplete: Promise.resolve() }),
    });
    vi.stubGlobal('document', browserDocument);
    vi.stubGlobal('window', view);
    onTestFinished(() => {
        vi.unstubAllGlobals();
    });

    return {
        htmlClasses,
        bodyClasses,
        storage,
        setSystemDark(dark: boolean) {
            media.matches = dark;
            media.dispatchEvent(new Event('change'));
        },
    };
}

test('exports the same appearance component through named and direct imports', () => {
    expect(NamedAppearance).toBe(Appearance);
});

test('renders the default slot with the system preference during SSR', async () => {
    const app = createSSRApp({
        render: () =>
            h(
                Appearance,
                {},
                {
                    default: ({ appearance }: AppearanceSlot) => h('output', appearance),
                },
            ),
    }).use(createFrontAwesome({ appearance: true }));

    const html = await renderToString(app);

    expect(html).toMatch(/^(?:<!--\[-->)?<output>system<\/output>(?:<!--\]-->)?$/);
});

test('explains how to enable the plugin when a selector is rendered without appearance support', async () => {
    const app = createSSRApp({ render: () => h(Appearance) }).use(createFrontAwesome());
    app.config.warnHandler = () => {};

    await expect(renderToString(app)).rejects.toThrow('createFrontAwesome({ appearance: true })');
});

test('applies the stored appearance before the Vue app mounts without changing the host theme or palette', () => {
    const browser = useBrowser({ stored: 'dark' });
    const app = renderer
        .createApp({ render: () => null })
        .use(createFrontAwesome({ appearance: true }));
    const beforeMount = new Set(browser.htmlClasses);
    app.mount({});
    onTestFinished(() => app.unmount());

    expect(beforeMount).toEqual(
        new Set(['wa-theme-custom', 'wa-palette-custom', 'page', 'dark', 'wa-dark']),
    );
    expect(browser.bodyClasses).toEqual(new Set(['wa-light', 'body']));
});

test('leaves the document classes alone when appearance support is disabled', () => {
    const browser = useBrowser({ stored: 'dark', dark: true });
    const app = renderer.createApp({ render: () => null }).use(createFrontAwesome());
    app.mount({});
    onTestFinished(() => app.unmount());
    browser.setSystemDark(false);

    expect(browser.htmlClasses).toEqual(
        new Set(['wa-theme-custom', 'wa-palette-custom', 'page', 'wa-light']),
    );
});

test('uses the effective mode for toggles and follows system changes only in system mode', async () => {
    const browser = useBrowser({ dark: true, stored: 'invalid' });
    const { slot } = await mountSelector();
    expect(browser.htmlClasses.has('wa-dark')).toBe(true);

    slot.toggle();
    expect(browser.storage.get('appearance')).toBe('light');
    expect(browser.htmlClasses.has('dark')).toBe(false);
    expect(browser.htmlClasses.has('wa-dark')).toBe(false);
    expect(browser.htmlClasses.has('wa-light')).toBe(true);

    slot.dark();
    browser.setSystemDark(false);
    expect(browser.htmlClasses.has('dark')).toBe(true);
    expect(browser.storage.get('appearance')).toBe('dark');

    slot.system();
    expect(browser.htmlClasses.has('wa-light')).toBe(true);
    expect(browser.storage.get('appearance')).toBe('system');
    browser.setSystemDark(true);
    expect(browser.htmlClasses.has('wa-dark')).toBe(true);
});

test('shares the in-memory preference and keeps tracking the system until the last app unmounts', async () => {
    const browser = useBrowser({ dark: true, storageBlocked: true });
    const first = await mountSelector();
    first.slot.dark();
    browser.setSystemDark(false);
    const second = await mountSelector();
    expect(browser.htmlClasses.has('wa-dark')).toBe(true);

    second.slot.light();
    expect(browser.htmlClasses.has('wa-light')).toBe(true);

    first.slot.toggle();
    expect(browser.htmlClasses.has('wa-dark')).toBe(true);

    first.unmount();
    first.unmount();
    second.slot.system();
    expect(browser.htmlClasses.has('wa-light')).toBe(true);
    browser.setSystemDark(true);
    expect(browser.htmlClasses.has('wa-dark')).toBe(true);

    second.unmount();
    browser.setSystemDark(false);
    expect(browser.htmlClasses.has('wa-dark')).toBe(true);
    await mountSelector();
    expect(browser.htmlClasses.has('wa-light')).toBe(true);
});
