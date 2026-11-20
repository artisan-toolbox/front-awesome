import { expect, test } from 'vite-plus/test';
import { h } from 'vue';
import Page from '@artisan-toolbox/front-awesome/components/WebAwesome/Page.vue';
import { webAwesomeFixture, ready } from './fixtures/web-awesome';

const mount = webAwesomeFixture('wa-page', 'width:390px');

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
    const { element: page } = mount({
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
    const { element: page } = mount({
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
