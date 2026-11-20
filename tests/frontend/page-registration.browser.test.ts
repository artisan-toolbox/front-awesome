import { expect, test } from 'vite-plus/test';
import { h, reactive } from 'vue';
import Page from '@artisan-toolbox/front-awesome/components/WebAwesome/Page.vue';
import BareBooleanPage from './BareBooleanPage.vue';
import { webAwesomeFixture, ready } from './fixtures/web-awesome';

const mount = webAwesomeFixture('wa-page', 'width:390px');

test('preserves booleans and native options before registration, after registration, and through live updates', async () => {
    expect(customElements.get('wa-page')).toBeUndefined();
    const state = reactive({
        open: false,
        disabled: false,
        breakpoint: '48rem',
        placement: 'end' as const,
    });
    const { element: page } = mount({
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
    const { element: bare } = mount(BareBooleanPage);
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

    const { element: after } = mount({
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
