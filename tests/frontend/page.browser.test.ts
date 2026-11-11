import { expect, onTestFinished, test, vi } from 'vite-plus/test';
import { createApp, h, nextTick, reactive } from 'vue';
import type { Component } from 'vue';
import type WaPage from '@awesome.me/webawesome/dist/components/page/page.js';
import Page from '@artisan-toolbox/front-awesome/components/WebAwesome/Page.vue';
import BareBooleanPage from './BareBooleanPage.vue';

function mount(component: Component) {
    const container = document.createElement('div');
    container.style.width = '390px';
    document.body.append(container);
    const app = createApp(component);
    app.mount(container);
    onTestFinished(() => {
        app.unmount();
        container.remove();
    });
    const page = container.querySelector<WaPage>('wa-page');
    if (!page) throw new Error('Expected the public Page component.');
    return page;
}

async function ready(page: WaPage) {
    await vi.dynamicImportSettled();
    await customElements.whenDefined('wa-page');
    await nextTick();
    await page.updateComplete;
}

test('preserves booleans and native options before registration, after registration, and through live updates', async () => {
    expect(customElements.get('wa-page')).toBeUndefined();
    const state = reactive({
        open: false,
        disabled: false,
        breakpoint: '48rem',
        placement: 'end' as const,
    });
    const page = mount({
        render: () =>
            h(
                Page,
                {
                    navOpen: state.open,
                    disableNavigationToggle: state.disabled,
                    mobileBreakpoint: state.breakpoint,
                    navigationPlacement: 'end',
                },
                () => h('div', { slot: 'navigation' }, 'Navigation'),
            ),
    });
    const bare = mount(BareBooleanPage);
    expect(page.hasAttribute('nav-open')).toBe(false);
    expect(page.hasAttribute('disable-navigation-toggle')).toBe(false);
    expect(page.getAttribute('mobile-breakpoint')).toBe('48rem');
    expect(page.getAttribute('navigation-placement')).toBe('end');
    expect(bare.hasAttribute('nav-open')).toBe(true);
    expect(bare.hasAttribute('disable-navigation-toggle')).toBe(true);
    await ready(page);
    await ready(bare);
    expect(page.navOpen).toBe(false);
    expect(page.disableNavigationToggle).toBe(false);
    expect(page.mobileBreakpoint).toBe('48rem');
    expect(page.navigationPlacement).toBe('end');
    expect(bare.navOpen).toBe(false);
    expect(bare.disableNavigationToggle).toBe(true);

    const after = mount({
        render: () =>
            h(
                Page,
                {
                    'nav-open': state.open,
                    'disable-navigation-toggle': state.disabled,
                },
                () => h('div', { slot: 'navigation' }, 'Navigation'),
            ),
    });
    await ready(after);
    await expect.poll(() => page.view).toBe('mobile');
    await expect.poll(() => after.view).toBe('mobile');
    for (const enabled of [true, false]) {
        state.open = enabled;
        state.disabled = enabled;
        state.breakpoint = enabled ? '50em' : '600px';
        await ready(page);
        await ready(after);
        for (const element of [page, after]) {
            expect(element.navOpen).toBe(enabled);
            expect(element.disableNavigationToggle).toBe(enabled);
        }
        expect(page.mobileBreakpoint).toBe(state.breakpoint);
    }
});

test('assigns all native slots without extra elements and preserves application attributes and listeners', async () => {
    const slots = [
        'banner',
        'header',
        'subheader',
        'menu',
        'navigation-header',
        'navigation',
        'navigation-footer',
        'navigation-toggle',
        'navigation-toggle-icon',
        'main-header',
        'main-footer',
        'aside',
        'skip-to-content',
        'footer',
    ];
    const clicks: MouseEvent[] = [];
    const page = mount({
        render: () =>
            h(
                Page,
                {
                    class: 'project-page',
                    style: { '--menu-width': '16rem' },
                    disableSticky: 'header aside',
                    'aria-label': 'Project',
                    'data-purpose': 'layout',
                    onClick: (event: MouseEvent) => clicks.push(event),
                },
                () => [
                    ...slots.map((slot) => h('div', { slot }, slot)),
                    h('main', { id: 'content' }, 'Dashboard'),
                ],
            ),
    });
    await ready(page);
    expect(page.querySelector('main')?.parentElement).toBe(page);
    for (const name of slots) {
        expect(page.querySelector(`[slot="${name}"]`)?.parentElement).toBe(page);
        const slot = page.shadowRoot?.querySelector<HTMLSlotElement>(`slot[name="${name}"]`);
        expect(slot?.assignedElements()).toContain(page.querySelector(`[slot="${name}"]`));
    }
    expect(
        page.shadowRoot?.querySelector<HTMLSlotElement>('slot:not([name])')?.assignedElements(),
    ).toContain(page.querySelector('main'));
    expect(page.className).toBe('project-page');
    expect(page.style.getPropertyValue('--menu-width')).toBe('16rem');
    expect(page.getAttribute('disable-sticky')).toBe('header aside');
    expect(page.getAttribute('aria-label')).toBe('Project');
    expect(page.dataset.purpose).toBe('layout');
    page.querySelector('main')?.click();
    expect(clicks).toHaveLength(1);
    expect(clicks[0]?.target).toBe(page.querySelector('main'));
});

test('uses one navigation tree on desktop and mobile and retains native toggle and drawer methods', async () => {
    const page = mount({
        render: () =>
            h(Page, { mobileBreakpoint: '600px', style: { width: '900px' } }, () => [
                h('header', { slot: 'header' }, [
                    h('button', { 'data-toggle-nav': '', type: 'button' }, 'Menu'),
                ]),
                h('div', { slot: 'navigation' }, [h('a', { href: '#content' }, 'Dashboard')]),
                h('main', { id: 'content' }, 'Dashboard content'),
            ]),
    });
    await ready(page);
    await expect.poll(() => page.view).toBe('desktop');
    const navigation = page.querySelector('[slot="navigation"]');
    expect(
        page.shadowRoot
            ?.querySelector<HTMLSlotElement>('slot[name="navigation"]')
            ?.closest('wa-drawer'),
    ).toBeNull();
    expect(page.disableNavigationToggle).toBe(true);

    page.style.width = '390px';
    await expect.poll(() => page.view).toBe('mobile');
    await ready(page);
    expect(
        page.shadowRoot
            ?.querySelector<HTMLSlotElement>('slot[name="navigation"]')
            ?.closest('wa-drawer'),
    ).not.toBeNull();
    expect(page.querySelector('[slot="navigation"]')).toBe(navigation);
    page.querySelector('button')?.click();
    await expect.poll(() => page.navOpen).toBe(true);
    await expect
        .poll(() => page.shadowRoot?.querySelector('wa-drawer')?.hasAttribute('open'))
        .toBe(true);
    page.hideNavigation();
    await expect.poll(() => page.navOpen).toBe(false);
    page.showNavigation();
    await expect.poll(() => page.navOpen).toBe(true);
    page.toggleNavigation();
    await expect.poll(() => page.navOpen).toBe(false);
});
