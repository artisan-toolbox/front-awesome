import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { expect, expectTypeOf, test } from 'vite-plus/test';
import Page from '@artisan-toolbox/front-awesome/components/WebAwesome/Page.vue';
import DirectPage from '@artisan-toolbox/front-awesome/components/Page.vue';
import { Page as ComponentPage } from '@artisan-toolbox/front-awesome/components';
import { Page as WebAwesomePage } from '@artisan-toolbox/front-awesome/components/WebAwesome';
import type { PageProps } from '@artisan-toolbox/front-awesome';
import type { WaPageProps } from '@awesome.me/webawesome/dist/custom-elements-jsx.d.ts';
import BareBooleanPage from './BareBooleanPage.vue';
import OptionalPage from './OptionalPage.vue';

test('exports the same unstyled Page through every public component path without browser registration', async () => {
    expect(DirectPage).toBe(Page);
    expect(ComponentPage).toBe(Page);
    expect(WebAwesomePage).toBe(Page);
    expect(await renderToString(createSSRApp({ render: () => h(Page) }))).toBe(
        '<wa-page><!--[--><!--]--></wa-page>',
    );
});

test('preserves native regions, semantic elements, options, and application attributes during SSR', async () => {
    const html = await renderToString(
        createSSRApp({
            render: () =>
                h(
                    Page,
                    {
                        mobileBreakpoint: '48rem',
                        navigationPlacement: 'end',
                        disableSticky: 'header aside',
                        navOpen: false,
                        disableNavigationToggle: true,
                        nonce: 'example-nonce',
                        class: 'project-page',
                        style: { '--menu-width': '16rem' },
                        'data-purpose': 'layout',
                    },
                    () => [
                        h('header', { slot: 'header' }, 'Project'),
                        h('div', { slot: 'navigation' }, [
                            h('a', { href: '#content' }, 'Dashboard'),
                        ]),
                        h('main', { id: 'content' }, 'Dashboard content'),
                        h('footer', { slot: 'footer' }, 'Project footer'),
                    ],
                ),
        }),
    );
    for (const value of [
        'mobile-breakpoint="48rem"',
        'navigation-placement="end"',
        'disable-sticky="header aside"',
        'disable-navigation-toggle',
        'nonce="example-nonce"',
        'class="project-page"',
        '--menu-width:16rem',
        'data-purpose="layout"',
        '<header slot="header">Project</header>',
        '<main id="content">Dashboard content</main>',
        '<footer slot="footer">Project footer</footer>',
    ])
        expect(html).toContain(value);
    expect(html).not.toContain('nav-open');
});

test('normalizes bare and bound kebab-case booleans before custom element registration', async () => {
    expect(await renderToString(createSSRApp(BareBooleanPage))).toBe(
        '<wa-page nav-open disable-navigation-toggle><!--[--><!--]--></wa-page>',
    );
    const html = await renderToString(
        createSSRApp({
            render: () =>
                h(Page, {
                    'nav-open': true,
                    'disable-navigation-toggle': false,
                    'mobile-breakpoint': '600px',
                }),
        }),
    );
    expect(html).toBe('<wa-page mobile-breakpoint="600px" nav-open><!--[--><!--]--></wa-page>');
});

test('derives public page options from upstream and excludes its implementation state', () => {
    type Props = InstanceType<typeof Page>['$props'];
    const noOptions = {} satisfies PageProps;
    const noComponentOptions = {} satisfies Props;
    void [noOptions, noComponentOptions];
    expectTypeOf<
        import('@artisan-toolbox/front-awesome/components').PageProps
    >().toEqualTypeOf<PageProps>();
    expectTypeOf<
        import('@artisan-toolbox/front-awesome/components/WebAwesome').PageProps
    >().toEqualTypeOf<PageProps>();
    expectTypeOf<Props['navigationPlacement']>().toEqualTypeOf<
        WaPageProps['navigationPlacement']
    >();
    expectTypeOf<Props['mobileBreakpoint']>().toEqualTypeOf<WaPageProps['mobileBreakpoint']>();
    expectTypeOf<Props['navOpen']>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<
        Extract<
            keyof Props,
            | 'header'
            | 'main'
            | 'navigationDrawer'
            | 'pageResizeObserver'
            | 'internals'
            | 'didSSR'
            | 'view'
        >
    >().toBeNever();
    // @ts-expect-error Placement follows the upstream start/end union.
    const invalid: PageProps = { navigationPlacement: 'left' };
    void invalid;
});

test('accepts an Options API consumer without optional layout attributes', async () => {
    const html = await renderToString(createSSRApp(OptionalPage));
    expect(html).toContain('<wa-page disable-navigation-toggle>');
    expect(html).toContain('<main>Authentication content</main>');
    expect(html).not.toMatch(/nav-open|mobile-breakpoint|navigation-placement|nonce/);
});
