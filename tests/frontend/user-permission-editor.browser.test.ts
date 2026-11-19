import { App as InertiaApp, http, router, usePage } from '@inertiajs/vue3';
import { HttpNetworkError, type HttpRequestConfig, type HttpResponse } from '@inertiajs/core';
import { afterEach, beforeEach, expect, test, vi } from 'vite-plus/test';
import { page, userEvent } from 'vitest/browser';
import { createApp, h, type App, type Component } from 'vue';
import Fixture from './PermissionEditorFixture.vue';
import { createFrontAwesome } from '@artisan-toolbox/front-awesome';
import { createLocalization } from '@artisan-toolbox/front-awesome/localization';
import '@artisan-toolbox/front-awesome/web-awesome.css';

const inertiaRoot: Component = InertiaApp;
const original = http.getClient();
const transport = vi.fn<(config: HttpRequestConfig) => Promise<HttpResponse>>();
const cleanups: VoidFunction[] = [];

beforeEach(() => {
    transport.mockReset();
    http.setClient({ request: transport });
});

afterEach(() => {
    router.cancelAll();
    cleanups.splice(0).forEach((cleanup) => cleanup());
    http.setClient(original);
    vi.restoreAllMocks();
});

function reply(status: number, data?: unknown): HttpResponse {
    return { status, data: data === undefined ? '' : JSON.stringify(data), headers: {} };
}

function permissions({
    subject = '42',
    revision = 'one',
    read = false,
    approve = false,
    canUpdate = true,
    isCurrentUser = false,
    many = 0,
} = {}) {
    const list = [
        { key: 'reports::read', name: 'Review invoices', description: 'Open the billing ledger.' },
        { key: 'reports::approve', name: 'Approve submissions', description: 'Confirm a deposit.' },
        ...Array.from({ length: many }, (_, index) => ({
            key: `reports::item${index}`,
            name: `Permission ${String(index).padStart(3, '0')}`,
            description: 'Additional actions.',
        })),
    ];
    return {
        subject,
        revision,
        canUpdate,
        isCurrentUser,
        sections: [
            {
                id: 'reports',
                kind: 'permissions',
                order: 'locked',
                name: 'Órdenes',
                description: 'Billing and order changes.',
                abilities: list,
            },
            {
                id: 'roles',
                kind: 'roles',
                order: 'alphabetical',
                name: 'Roles',
                description: '',
                abilities: [
                    { key: 'role::operator', name: 'Operator', description: 'Manage requests.' },
                ],
            },
        ],
        values: Object.fromEntries([
            ...list.map(({ key }) => [
                key,
                key === 'reports::read' ? read : key === 'reports::approve' && approve,
            ]),
            ['role::operator', false],
        ]),
    };
}

function mount(
    capability: unknown = { version: 1, endpoint: '/user-permissions' },
    prepare?: (app: App) => void,
) {
    const host = document.createElement('div');
    document.body.append(host);
    const app = createApp({
        render: () =>
            h(inertiaRoot, {
                initialPage: {
                    component: 'PermissionEditorFixture',
                    props: { errors: {}, userPermissionEditor: capability },
                    url: location.pathname,
                    version: null,
                    flash: {},
                    rescuedProps: [],
                    rememberedState: {},
                },
                initialComponent: Fixture,
                resolveComponent: () => Fixture,
            }),
    });
    prepare?.(app);
    app.mount(host);
    cleanups.push(() => {
        app.unmount();
        host.remove();
    });
}

const readPermission = () => page.getByRole('checkbox', { name: 'Review invoices' });
const toggleReadPermission = async () => {
    await expect.element(readPermission()).toBeVisible();
    const input = readPermission().element();
    if (input instanceof HTMLElement) input.focus();
    await userEvent.keyboard(' ');
};
const find = () => page.getByRole('searchbox', { name: 'Find a permission' });
const save = () => page.getByRole('button', { name: 'Save changes', exact: true });
const open = async (button = 'Show Jordan') =>
    page.getByRole('button', { name: button, exact: true }).click();

test('preserves the reported order and sends every boolean after an offscreen edit', async () => {
    transport.mockResolvedValueOnce(reply(200, permissions()));
    mount();
    await open('Edit Jordan');
    await expect
        .element(page.getByRole('dialog', { name: /User permissions.*Jordan Lee/ }))
        .toBeVisible();
    await expect.element(readPermission()).toBeVisible();
    const labels = Array.from(document.querySelectorAll('wa-checkbox'), (item) =>
        item.textContent?.trim(),
    );
    expect(labels).toEqual(['Review invoices', 'Approve submissions']);
    await toggleReadPermission();
    await find().fill('confirm a deposit');
    await expect.element(readPermission()).not.toBeInTheDocument();

    transport
        .mockResolvedValueOnce(reply(204))
        .mockResolvedValueOnce(reply(200, permissions({ revision: 'two', read: true })));
    await save().click();
    await expect.element(page.getByText('Permissions saved.', { exact: true })).toBeVisible();
    expect(transport.mock.calls.map(([request]) => request.method)).toEqual(['get', 'put', 'get']);
    expect(JSON.parse(String(transport.mock.calls[1][0].data))).toEqual({
        revision: 'one',
        values: {
            'reports::read': true,
            'reports::approve': false,
            'role::operator': false,
        },
    });
    expect(new URL(transport.mock.calls[1][0].url).searchParams.get('user')).toBe('42');
    await expect.element(save()).toBeDisabled();
});

test('searches an accented group and reaches permissions beyond the progressive limit', async () => {
    await page.viewport(390, 840);
    transport.mockResolvedValueOnce(reply(200, permissions({ many: 1200 })));
    mount();
    await open();
    await expect.element(readPermission()).toBeVisible();
    expect(document.querySelectorAll('wa-checkbox').length).toBe(40);
    await find().fill('ordenes');
    await expect.element(readPermission()).toBeVisible();
    await find().fill('permission 1199');
    await expect.element(page.getByRole('checkbox', { name: 'Permission 1199' })).toBeVisible();
    expect(document.querySelectorAll('wa-checkbox').length).toBe(1);
    const modal = page.getByRole('dialog').element().getBoundingClientRect();
    expect(modal.left).toBeGreaterThanOrEqual(0);
    expect(modal.right).toBeLessThanOrEqual(390);
    await page.viewport(1280, 900);
});

test('grows for long catalogs and fits shorter search results', async () => {
    await page.viewport(1280, 900);
    transport.mockResolvedValueOnce(reply(200, permissions({ many: 120 })));
    mount(undefined, (app) =>
        app.use(createFrontAwesome({ scrollbar: { defaultVariant: 'success' } })),
    );
    await open();
    await expect.element(readPermission()).toBeVisible();
    const dialog = page.getByRole('dialog', { name: /User permissions.*Jordan Lee/ });
    for (const selector of ['.editor-content', '.catalog-index', '.catalog-groups']) {
        expect(document.querySelector(selector)?.getAttribute('data-fa-scrollbar')).toBe('success');
    }
    await expect.poll(() => dialog.element().getBoundingClientRect().height).toBeGreaterThan(770);
    const full = dialog.element().getBoundingClientRect();

    expect(full.top).toBeGreaterThan(0);
    expect(full.bottom).toBeLessThan(900);
    expect(save().element().getBoundingClientRect().bottom).toBeLessThan(full.bottom);

    await page.getByRole('button', { name: 'Show more permissions' }).click();
    await expect
        .element(page.getByRole('checkbox', { name: 'Permission 077' }))
        .toBeInTheDocument();
    await find().fill('Review invoices');
    await expect
        .poll(() => dialog.element().getBoundingClientRect().height)
        .toBeLessThan(full.height - 150);
});

test('confirms discard in a separate dialog and restores keyboard focus', async () => {
    transport.mockResolvedValueOnce(reply(200, permissions()));
    mount();
    await open();
    await toggleReadPermission();
    await find().fill('Review invoices');

    const confirmation = page.getByRole('dialog', { name: 'Discard unsaved changes?' });
    const keepEditing = page.getByRole('button', { name: 'Keep editing' });
    await userEvent.keyboard('{Escape}');
    await expect.poll(() => keepEditing.element().matches(':focus')).toBe(true);
    await userEvent.keyboard('{Escape}');
    await expect.element(confirmation).not.toBeInTheDocument();
    await expect.poll(() => find().element().matches(':focus')).toBe(true);
    await expect.element(find()).toHaveValue('Review invoices');
    await expect.element(readPermission()).toBeChecked();

    const cancel = page.getByRole('button', { name: 'Cancel', exact: true });
    await cancel.click();
    await keepEditing.click();
    await expect.poll(() => cancel.element().matches(':focus')).toBe(true);
    await expect.element(readPermission()).toBeChecked();

    await page.getByRole('button', { name: 'Close', exact: true }).click();
    await page.getByRole('button', { name: 'Discard changes' }).click();
    await expect.element(page.getByRole('dialog')).not.toBeInTheDocument();
    await expect.element(page.getByRole('button', { name: 'Show Jordan' })).toHaveFocus();
});

test('waits for discard confirmation before opening another user', async () => {
    transport.mockResolvedValueOnce(reply(200, permissions()));
    mount();
    await open();
    await toggleReadPermission();
    document.querySelector<HTMLButtonElement>('[data-switch]')?.click();
    const confirmation = page.getByRole('dialog', { name: 'Discard unsaved changes?' });
    await expect.element(confirmation).toBeVisible();
    expect(transport).toHaveBeenCalledTimes(1);

    transport.mockResolvedValueOnce(reply(200, permissions({ subject: '43', canUpdate: false })));
    await page.getByRole('button', { name: 'Discard changes' }).click();
    await expect
        .element(page.getByText('Read only. You can view these permissions.'))
        .toBeVisible();
    expect(
        transport.mock.calls.map(([request]) => new URL(request.url).searchParams.get('user')),
    ).toEqual(['42', '43']);
});

test('discards a late load for a previously selected user', async () => {
    let deliver: (value: HttpResponse) => void = () => {};
    transport.mockReturnValueOnce(
        new Promise((resolve) => {
            deliver = resolve;
        }),
    );
    transport.mockResolvedValueOnce(reply(200, permissions({ subject: '43', canUpdate: false })));
    mount();
    await open();
    await expect.element(page.getByText('Loading permissions…')).toBeVisible();
    document.querySelector<HTMLButtonElement>('[data-switch]')?.click();
    await expect
        .element(page.getByText('Read only. You can view these permissions.'))
        .toBeVisible();
    deliver(reply(200, permissions()));
    await expect.element(page.getByRole('checkbox')).not.toBeInTheDocument();
    expect(
        transport.mock.calls.map(([request]) => new URL(request.url).searchParams.get('user')),
    ).toEqual(['42', '43']);
});

test('reconciles a lost confirmation without resending PUT', async () => {
    transport.mockResolvedValueOnce(reply(200, permissions()));
    mount();
    await open();
    await toggleReadPermission();
    transport
        .mockRejectedValueOnce(new HttpNetworkError('Connection interrupted'))
        .mockResolvedValueOnce(reply(200, permissions({ revision: 'two', read: true })));
    await save().click();
    await expect.element(page.getByText('Permissions saved.', { exact: true })).toBeVisible();
    expect(transport.mock.calls.map(([request]) => request.method)).toEqual(['get', 'put', 'get']);
    await expect.element(readPermission()).toBeChecked();
});

test('uses the refreshed revision only after the user explicitly reviews and reapplies', async () => {
    transport.mockResolvedValueOnce(reply(200, permissions()));
    mount();
    await open();
    await toggleReadPermission();
    transport
        .mockResolvedValueOnce(reply(409))
        .mockResolvedValueOnce(reply(200, permissions({ revision: 'two' })));
    await save().click();
    await expect.element(page.getByText('Your draft', { exact: true })).toBeVisible();
    await expect.element(save()).not.toBeInTheDocument();
    await page.getByRole('button', { name: 'Reapply draft' }).click();
    await expect.element(readPermission()).toBeChecked();
    expect(transport.mock.calls.map(([request]) => request.method)).toEqual(['get', 'put', 'get']);
    transport
        .mockResolvedValueOnce(reply(204))
        .mockResolvedValueOnce(reply(200, permissions({ revision: 'three', read: true })));
    await save().click();
    await expect.element(page.getByText('Permissions saved.', { exact: true })).toBeVisible();
    expect(JSON.parse(String(transport.mock.calls[3][0].data)).revision).toBe('two');
});

test('reveals and focuses a rejected field hidden by the current search', async () => {
    transport.mockResolvedValueOnce(reply(200, permissions()));
    mount();
    await open();
    await toggleReadPermission();
    await find().fill('approve');
    transport.mockResolvedValueOnce(
        reply(422, { errors: { 'values.reports::read': ['This is restricted.'] } }),
    );
    await save().click();
    await page.getByRole('button', { name: 'Review invoices', exact: true }).click();
    await expect
        .poll(() => {
            const control = readPermission().element();
            const root = control.getRootNode();
            return root instanceof ShadowRoot && root.activeElement === control;
        })
        .toBe(true);
    await expect.element(readPermission()).toBeChecked();
    await expect.element(page.getByText('This is restricted.')).toBeVisible();
});

test('rejects a cross-origin provider without making a request', async () => {
    mount({ version: 1, endpoint: 'https://untrusted.test/user-permissions' });
    await open();
    await expect.element(page.getByText('This application has no editor provider.')).toBeVisible();
    expect(transport).not.toHaveBeenCalled();
});

test('runs a full retry cycle on expired sessions without submitting automatically', async () => {
    transport.mockResolvedValueOnce(reply(200, permissions()));
    mount();
    await open();
    await toggleReadPermission();
    transport.mockResolvedValueOnce(reply(419));
    await save().click();
    await expect
        .element(page.getByText('Your session could not be verified.', { exact: false }))
        .toBeVisible();
    await expect.element(readPermission()).not.toBeInTheDocument();
    transport.mockResolvedValueOnce(reply(200, permissions({ revision: 'two' })));
    await page.getByRole('button', { name: 'Retry', exact: true }).click();

    await expect
        .element(page.getByText('Your session was restored.', { exact: false }))
        .toBeVisible();
    await page.getByRole('button', { name: 'Reapply draft' }).click();
    await expect.element(readPermission()).toBeChecked();
    expect(transport.mock.calls.map(([request]) => request.method)).toEqual(['get', 'put', 'get']);
});

test('reloads read-only permissions when write access is revoked', async () => {
    transport.mockResolvedValueOnce(reply(200, permissions()));
    mount();
    await open();
    await toggleReadPermission();
    transport
        .mockResolvedValueOnce(reply(403))
        .mockResolvedValueOnce(reply(200, permissions({ revision: 'two', canUpdate: false })));
    await save().click();
    await expect
        .element(page.getByText('You no longer have access to these changes.'))
        .toBeVisible();
    await expect.element(page.getByText('Review invoices', { exact: true })).toBeVisible();
    await expect.element(save()).not.toBeInTheDocument();
});

test('retries refreshing actor access separately when a self-edit is already committed', async () => {
    let edited = false;
    let refreshes = 0;
    const capability = { version: 1, endpoint: '/user-permissions' };
    transport.mockImplementation(async ({ url, method }) => {
        const { pathname } = new URL(url, location.origin);
        if (pathname === '/user-permissions') {
            if (method === 'put') {
                edited = true;
                return reply(204);
            }
            return reply(
                200,
                permissions({
                    revision: edited ? 'two' : 'one',
                    read: edited,
                    isCurrentUser: true,
                }),
            );
        }
        if (++refreshes === 1) throw new HttpNetworkError('Refresh interrupted');
        return {
            ...reply(200, {
                component: 'PermissionEditorFixture',
                props: { errors: {}, userPermissionEditor: capability },
                url: location.pathname,
                version: null,
                flash: {},
                rescuedProps: [],
                rememberedState: {},
            }),
            headers: { 'x-inertia': 'true' },
        };
    });
    mount(capability);
    await open();
    await toggleReadPermission();
    await save().click();
    await expect
        .element(page.getByText('Permissions were saved. Refresh this page', { exact: false }))
        .toBeVisible();
    await page.getByRole('button', { name: 'Refresh page access' }).click();
    await expect.element(page.getByText('Permissions saved.', { exact: true })).toBeVisible();
    expect(refreshes).toBe(2);
    expect(transport.mock.calls.filter(([request]) => request.method === 'put')).toHaveLength(1);
});

test('keeps search and actions visible above a scrollable dark desktop catalog', async () => {
    await page.viewport(1280, 900);
    document.documentElement.classList.add('wa-dark');
    cleanups.push(() => document.documentElement.classList.remove('wa-dark'));
    transport.mockResolvedValueOnce(reply(200, permissions({ many: 40 })));
    mount();
    await open();
    await expect.element(find()).toBeVisible();
    const navigation = page.getByRole('navigation', { name: 'Permission sections' });
    await expect.element(navigation).toBeVisible();
    await expect
        .poll(() => {
            const groupList = document.querySelector('.catalog-groups');
            return groupList ? groupList.scrollHeight > groupList.clientHeight : false;
        })
        .toBe(true);
    await navigation.getByRole('button', { name: 'Roles', exact: true }).click();
    await expect.element(page.getByRole('checkbox', { name: 'Operator' })).toBeVisible();
    await expect.element(find()).toBeVisible();
    await expect.element(save()).toBeVisible();
});

test('uses host localization for its labels and leaves the provider labels intact', async () => {
    transport.mockResolvedValueOnce(reply(200, permissions()));
    mount(undefined, (app) => {
        app.use(
            createLocalization({
                version: 1,
                fallbackLocale: 'es',
                availableLocales: ['es'],
                locales: {
                    es: {
                        sourceLocale: 'es',
                        label: 'Español',
                        messages: {
                            'front-awesome::user-permission-editor.title': 'Permisos del usuario',
                            'front-awesome::user-permission-editor.search': 'Buscar un permiso',
                            'front-awesome::user-permission-editor.save': 'Guardar cambios',
                        },
                    },
                },
            }),
        );
    });
    await open();
    await expect
        .element(page.getByRole('dialog', { name: /Permisos del usuario.*Jordan Lee/ }))
        .toBeVisible();
    await expect.element(page.getByRole('searchbox', { name: 'Buscar un permiso' })).toBeVisible();
    await expect.element(page.getByRole('button', { name: 'Guardar cambios' })).toBeVisible();
    await expect.element(readPermission()).toBeVisible();
});

test('explains differences outside the edited rows when a save cannot be confirmed', async () => {
    transport.mockResolvedValueOnce(reply(200, permissions()));
    mount();
    await open();
    await toggleReadPermission();
    transport
        .mockRejectedValueOnce(new HttpNetworkError('Connection interrupted'))
        .mockResolvedValueOnce(
            reply(200, permissions({ revision: 'two', read: true, approve: true })),
        );
    await save().click();
    await expect
        .element(page.getByRole('row', { name: 'Approve submissions Allowed Denied' }))
        .toBeVisible();
    await page.getByRole('button', { name: 'Reapply draft' }).click();
    await expect.element(page.getByRole('checkbox', { name: 'Approve submissions' })).toBeChecked();
    await expect.element(save()).toBeDisabled();
    expect(transport.mock.calls.map(([request]) => request.method)).toEqual(['get', 'put', 'get']);
});

test('confirms an unacknowledged self-revocation and refreshes page access', async () => {
    let committed = false;
    const capability = { version: 1, endpoint: '/user-permissions' };
    const key = 'access::modify';
    transport.mockImplementation(async ({ url, method }) => {
        const { pathname } = new URL(url, location.origin);
        if (pathname === '/user-permissions') {
            if (method === 'put') {
                committed = true;
                throw new HttpNetworkError('The response was lost after the write');
            }
            const snapshot = permissions({
                revision: committed ? 'two' : 'one',
                canUpdate: !committed,
                isCurrentUser: true,
            });
            snapshot.sections[0].abilities.push({
                key,
                name: 'Manage user access',
                description: 'Edit user assignments.',
            });
            return reply(200, { ...snapshot, values: { ...snapshot.values, [key]: !committed } });
        }
        return {
            ...reply(200, {
                component: 'PermissionEditorFixture',
                props: { errors: {}, userPermissionEditor: capability, actorCanEdit: !committed },
                url: location.pathname,
                version: null,
                flash: {},
                rescuedProps: [],
                rememberedState: {},
            }),
            headers: { 'x-inertia': 'true' },
        };
    });
    mount(capability);
    await open();
    const manage = page.getByRole('checkbox', { name: 'Manage user access' });
    await expect.element(manage).toBeChecked();
    const input = manage.element();
    if (input instanceof HTMLElement) input.focus();
    await userEvent.keyboard(' ');
    await save().click();

    await expect.element(page.getByText('Permissions saved.', { exact: true })).toBeVisible();
    await expect
        .element(page.getByText('Read only. You can view these permissions.'))
        .toBeVisible();
    await expect.element(save()).not.toBeInTheDocument();
    await expect.poll(() => usePage().props.actorCanEdit).toBe(false);
    const writes = transport.mock.calls.filter(([request]) => request.method === 'put');
    expect(writes).toHaveLength(1);
    expect(JSON.parse(String(writes[0][0].data)).values[key]).toBe(false);
});
