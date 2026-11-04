import { mosaicast } from '@artisan-toolbox/mosaicast';
import type { MosaicastPrivateChannel } from '@artisan-toolbox/mosaicast';
import { expect, test, vi } from 'vite-plus/test';
import { createApp, createRenderer } from 'vue';
import { createFrontAwesome, useToast } from '@artisan-toolbox/front-awesome';
import { initializeFlashToast } from '@artisan-toolbox/front-awesome/WebAwesome/flashToast';

vi.mock('@awesome.me/webawesome/dist/components/toast/toast.js', () => ({}));

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
const createBrowserApp = () => renderer.createApp({ render: () => null });

test('provides the toast service during SSR without touching the DOM', async () => {
    const app = createApp({}).use(createFrontAwesome());
    await expect(app.runWithContext(useToast).show('SSR toast.')).resolves.toBeUndefined();
    expect(() => initializeFlashToast()()).not.toThrow();
});

test('installs one toast host and delivers Inertia and Echo events through the plugin', async () => {
    const create = vi.fn();
    const remove = vi.fn();
    const host = { create, remove, placement: '', updateComplete: Promise.resolve() };
    const append = vi.fn();
    const browserDocument = Object.assign(new EventTarget(), {
        body: { append },
        createElement: vi.fn(() => host),
    });
    let broadcast: Parameters<MosaicastPrivateChannel['listenToAll']>[0] | undefined;
    const channel: MosaicastPrivateChannel = {
        error() {
            return this;
        },
        listenToAll(listener) {
            broadcast = listener;
            return this;
        },
        subscribed() {
            return this;
        },
    };
    const echo = { private: vi.fn(() => channel), leave: vi.fn() };
    const successIcon = { name: 'tick', library: 'custom' };

    vi.stubGlobal('document', browserDocument);
    vi.stubGlobal('window', {});
    const app = createBrowserApp();
    const existingToast = { add: vi.fn() };
    app.config.globalProperties.$toast = existingToast;
    app.use(
        createFrontAwesome({
            mosaicast: { echo, channelPrefix: 'custom.sessions' },
            flashToast: { placement: 'bottom-end' },
        }),
    );
    app.mount({});
    const second = createBrowserApp().use(createFrontAwesome());
    second.mount({});
    let appMounted = true;
    let secondMounted = true;

    try {
        const sessionIdentifier = 'a'.repeat(64);
        const navigateWithToast = () =>
            browserDocument.dispatchEvent(
                new CustomEvent('inertia:navigate', {
                    detail: {
                        page: {
                            props: {
                                mosaicastSessionIdentifier: sessionIdentifier,
                                mosaicast: {
                                    sessionIdentifier,
                                    events: [
                                        {
                                            name: 'front-awesome.toast',
                                            payload: {
                                                message: 'Order <123> saved.',
                                                options: {
                                                    variant: 'success',
                                                    duration: 0,
                                                    allowHtml: false,
                                                    icon: successIcon,
                                                },
                                            },
                                        },
                                    ],
                                },
                            },
                        },
                    },
                }),
            );
        navigateWithToast();
        expect(echo.private).toHaveBeenCalledExactlyOnceWith(
            `custom.sessions.${sessionIdentifier}`,
        );
        broadcast?.('front-awesome.toast', {
            message: 'Background job finished.',
        });
        const richOptions = {
            variant: 'warning',
            size: 'xl',
            icon: {
                name: 'triangle-exclamation',
                library: 'custom',
                family: 'classic',
                variant: 'regular',
            },
            allowHtml: true,
        };
        const flash = [
            { message: '<strong>Inventory is low.</strong>', options: richOptions },
            { message: 'No warning icon.', options: { variant: 'warning' } },
            { message: 'Malformed HTML flag', options: { allowHtml: 'true' } },
            { message: 'Deprecated size', options: { size: 'large' } },
        ];
        for (const detail of [
            { flash: { 'front-awesome.toasts': flash } },
            { flash: { 'front-awesome.toasts': flash, unrelated: true } },
        ]) {
            browserDocument.dispatchEvent(new CustomEvent('inertia:flash', { detail }));
        }

        await vi.waitFor(() => expect(create).toHaveBeenCalledTimes(4));
        expect(browserDocument.createElement).toHaveBeenCalledExactlyOnceWith('wa-toast');
        expect(append).toHaveBeenCalledExactlyOnceWith(host);
        expect(host.placement).toBe('bottom-end');
        expect(create).toHaveBeenNthCalledWith(1, 'Order <123> saved.', {
            allowHtml: false,
            variant: 'success',
            duration: 0,
            icon: successIcon,
        });
        expect(create).toHaveBeenNthCalledWith(2, 'Background job finished.', undefined);
        expect(create).toHaveBeenNthCalledWith(
            3,
            '<strong>Inventory is low.</strong>',
            richOptions,
        );
        expect(create).toHaveBeenNthCalledWith(4, 'No warning icon.', { variant: 'warning' });

        await app.runWithContext(useToast).show('Saved in setup.', { variant: 'success' });
        await app.config.globalProperties.$frontAwesome.toast.show('Saved in template.');
        await expect(
            app.runWithContext(useToast).show('Invalid duration.', { duration: -1 }),
        ).rejects.toThrow(TypeError);
        expect(create).toHaveBeenNthCalledWith(5, 'Saved in setup.', {
            variant: 'success',
        });
        expect(create).toHaveBeenNthCalledWith(6, 'Saved in template.', undefined);
        expect(app.config.globalProperties.$toast).toBe(existingToast);

        app.unmount();
        appMounted = false;
        await second.runWithContext(useToast).show('Still mounted.');
        expect(create).toHaveBeenNthCalledWith(7, 'Still mounted.', undefined);
        expect(remove).not.toHaveBeenCalled();

        mosaicast().emit(
            'front-awesome.toast',
            { message: 'Discard this pending toast.' },
            'broadcast',
        );
        second.unmount();
        secondMounted = false;
        await Promise.resolve();
        expect(remove).toHaveBeenCalledTimes(1);
        expect(create).toHaveBeenCalledTimes(7);

        const third = createBrowserApp().use(createFrontAwesome());
        third.mount({});
        try {
            navigateWithToast();
            await third.runWithContext(useToast).show('Remounted.', { icon: 'bell' });
            expect(create).toHaveBeenCalledTimes(9);
            expect(create).toHaveBeenNthCalledWith(9, 'Remounted.', { icon: 'bell' });
            expect(echo.private).toHaveBeenCalledTimes(1);
        } finally {
            third.unmount();
        }
    } finally {
        if (appMounted) app.unmount();
        if (secondMounted) second.unmount();
        vi.unstubAllGlobals();
    }
});

test('reports host startup failures once and rejects direct calls', async () => {
    const error = new Error('Toast host could not start.');
    const reportError = vi.fn();
    const host = { remove: vi.fn(), create: vi.fn(), placement: '' };
    vi.stubGlobal('reportError', reportError);
    vi.stubGlobal('window', {});
    vi.stubGlobal(
        'document',
        Object.assign(new EventTarget(), {
            body: {
                append: () => {
                    throw error;
                },
            },
            createElement: () => host,
        }),
    );
    const app = createBrowserApp().use(createFrontAwesome());
    app.mount({});

    try {
        const toast = app.runWithContext(useToast);
        mosaicast().emit('front-awesome.toast', { message: 'From Echo.' }, 'broadcast');
        await expect(toast.show('From Vue.')).rejects.toBe(error);
        await expect(toast.show('From Vue again.')).rejects.toBe(error);
        expect(reportError).toHaveBeenCalledExactlyOnceWith(error);
        expect(host.create).not.toHaveBeenCalled();
        expect(host.remove).toHaveBeenCalledOnce();
    } finally {
        app.unmount();
        vi.unstubAllGlobals();
    }
});
