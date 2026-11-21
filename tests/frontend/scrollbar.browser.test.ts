import { expect, onTestFinished, test } from 'vite-plus/test';
import { page, userEvent } from 'vitest/browser';
import { createApp } from 'vue';
import { createFrontAwesome, type ScrollbarPluginOptions } from '@artisan-toolbox/front-awesome';
import Fixture from './ScrollbarFixture.vue';
import '../theme-consumer/app.css';
import '@artisan-toolbox/front-awesome/web-awesome-tailwind';

function mountFixture(scrollbar?: ScrollbarPluginOptions) {
    const container = document.createElement('div');
    document.body.append(container);
    const app = createApp(Fixture).use(createFrontAwesome({ scrollbar }));
    app.mount(container);
    onTestFinished(() => {
        app.unmount();
        container.remove();
    });
}

test('applies the configured default from the local theme and honors an explicit neutral variant', async () => {
    mountFixture({ defaultVariant: 'brand' });

    const brand = page.getByTestId('default-scrollbar').element();
    const neutral = page.getByTestId('neutral-scrollbar').element();
    await expect.poll(() => thumbColor(brand)).toBe('rgb(15, 60, 130)');
    await expect.poll(() => thumbColor(neutral)).toBe(themeColor(neutral, '--wa-color-text-quiet'));

    await page.getByRole('button', { name: 'Change theme' }).click();
    await expect.poll(() => thumbColor(brand)).toBe('rgb(135, 190, 245)');
    await expect.poll(() => thumbColor(neutral)).toBe(themeColor(neutral, '--wa-color-text-quiet'));
});

function thumbColor(region: Element) {
    const handle = region.querySelector('.os-scrollbar-vertical .os-scrollbar-handle');
    return handle ? getComputedStyle(handle).backgroundColor : '';
}

function themeColor(region: Element, token: string) {
    const probe = document.createElement('span');
    probe.hidden = true;
    probe.style.color = `var(${token})`;
    region.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();
    return color;
}

test('updates the overlay thumb from the local theme for all five variants', async () => {
    mountFixture();

    const region = page.getByRole('region', { name: 'Notifications' }).element();
    const neutral = page.getByTestId('default-scrollbar').element();
    const unmarked = page.getByTestId('unmarked-scrollbar').element();
    const brandClass = page.getByTestId('brand-class').element();
    const select = page.getByRole('combobox', { name: 'Scrollbar variant' });

    await expect.poll(() => thumbColor(neutral)).toBe(themeColor(neutral, '--wa-color-text-quiet'));
    expect(getComputedStyle(brandClass).scrollbarColor).toBe('rgb(15, 60, 130) rgb(255, 255, 255)');
    expect(unmarked.querySelector('.os-scrollbar')).toBeNull();
    expect(getComputedStyle(unmarked).scrollbarColor).toBe('auto');

    for (const theme of ['light', 'dark']) {
        if (theme === 'dark') await page.getByRole('button', { name: 'Change theme' }).click();
        for (const role of ['neutral', 'brand', 'success', 'warning', 'danger']) {
            await select.selectOptions(role);
            const token =
                role === 'neutral' ? '--wa-color-text-quiet' : `--wa-color-${role}-fill-loud`;
            await expect.poll(() => thumbColor(region)).toBe(themeColor(region, token));
        }
    }
    await select.selectOptions('brand');
    await expect.poll(() => thumbColor(region)).toBe('rgb(135, 190, 245)');
});

test('keeps the same scroll element and responds to a change of overflow axis', async () => {
    mountFixture();

    const region = page.getByRole('region', { name: 'Notifications' }).element();
    if (!(region instanceof HTMLElement)) throw new TypeError('Expected an HTML scroll region');
    await expect
        .poll(() => region.querySelector('.os-scrollbar-vertical.os-scrollbar-visible'))
        .not.toBeNull();
    expect(region.querySelector('.os-scrollbar-horizontal.os-scrollbar-visible')).toBeNull();
    expect(getComputedStyle(region).position).toBe('sticky');
    expect(region.tabIndex).toBe(0);

    let scrollTarget: EventTarget | null = null;
    region.addEventListener('scroll', (event) => (scrollTarget = event.target), { once: true });
    region.focus();
    await userEvent.keyboard('{End}');
    await expect.poll(() => region.scrollTop).toBeGreaterThan(0);
    await expect.poll(() => scrollTarget).toBe(region);
    await page.getByRole('combobox', { name: 'Scrollbar variant' }).selectOptions('brand');
    expect(region.scrollTop).toBeGreaterThan(0);

    await page.getByRole('button', { name: 'Change scroll axis' }).click();
    await expect
        .poll(() => region.querySelector('.os-scrollbar-horizontal.os-scrollbar-visible'))
        .not.toBeNull();
    expect(region.querySelector('.os-scrollbar-vertical.os-scrollbar-visible')).toBeNull();
    region.scrollTo({ left: 120 });
    await expect.poll(() => region.scrollLeft).toBe(120);
});

test('keeps the overlay after Vue replaces the scroll content and preserves native controls', async () => {
    mountFixture();

    const region = page.getByRole('region', { name: 'Dynamic HTML' }).element();
    const native = page.getByRole('textbox', { name: 'Native text control' }).element();
    const visible = page.getByTestId('visible-content').element();
    await expect.poll(() => region.querySelectorAll('.os-scrollbar').length).toBe(2);
    expect(native.hasAttribute('data-overlayscrollbars')).toBe(false);
    expect(getComputedStyle(visible).overflowY).toBe('visible');
    expect(visible.querySelector('.os-scrollbar')).toBeNull();

    await page.getByRole('button', { name: 'Replace scroll content' }).click();
    expect(region.textContent).toContain('Replacement content');
    await expect.poll(() => region.querySelectorAll('.os-scrollbar').length).toBe(2);
    region.scrollTo({ top: 80 });
    await expect.poll(() => region.scrollTop).toBe(80);

    const visibility = page.getByRole('button', { name: 'Change scrollbar visibility' });
    const visibleRail = () => region.querySelector('.os-scrollbar-vertical.os-scrollbar-visible');
    await expect.poll(visibleRail).not.toBeNull();
    await visibility.click();
    await expect.poll(visibleRail).toBeNull();
    await visibility.click();
    await expect.poll(visibleRail).not.toBeNull();
    expect(region.scrollTop).toBe(80);
});

test('shows edge shadows only where more content can scroll into view', async () => {
    mountFixture();

    const region = page.getByRole('region', { name: 'Shadowed notifications' }).element();
    const toggle = page.getByRole('button', { name: 'Toggle edge shadows' });
    const resize = page.getByRole('button', { name: 'Resize shadowed content' });
    const layer = () => region.querySelector('.fa-scrollbar-shadows');
    const edges = () => {
        const shadow = layer();
        if (!shadow) return null;
        const style = getComputedStyle(shadow);
        return ['top', 'right', 'bottom', 'left'].map((edge) =>
            Number(style.getPropertyValue(`--fa-shadow-${edge}`)),
        );
    };

    expect(layer()).toBeNull();
    await toggle.click();
    await expect.poll(edges).toEqual([0, 1, 1, 0]);
    const shadow = layer();
    if (!shadow) throw new Error('Expected an edge shadow layer');
    expect(getComputedStyle(shadow).backgroundImage).toContain('linear-gradient');
    expect(getComputedStyle(shadow).pointerEvents).toBe('none');
    expect(shadow.getAttribute('aria-hidden')).toBe('true');

    region.scrollTo(100, 100);
    await expect.poll(edges).toEqual([1, 1, 1, 1]);
    const viewport = region.getBoundingClientRect();
    expect(shadow.getBoundingClientRect().top).toBeCloseTo(viewport.top);
    expect(shadow.getBoundingClientRect().left).toBeCloseTo(viewport.left);

    region.scrollTo(region.scrollWidth, region.scrollHeight);
    await expect.poll(edges).toEqual([1, 0, 0, 1]);

    await resize.click();
    await expect.poll(edges).toEqual([0, 0, 0, 0]);
    expect(region.scrollHeight).toBe(region.clientHeight);
    expect(region.scrollWidth).toBe(region.clientWidth);

    await page.getByRole('button', { name: 'Change text direction' }).click();
    await resize.click();
    await expect.poll(edges).toEqual([0, 0, 1, 1]);
    region.scrollTo(-region.scrollWidth, 0);
    await expect.poll(edges).toEqual([0, 1, 1, 0]);
    expect(shadow.getBoundingClientRect().left).toBeCloseTo(region.getBoundingClientRect().left);

    const content = region.firstElementChild;
    if (!(content instanceof HTMLElement)) throw new Error('Expected scroll content');
    content.style.width = 'auto';
    content.style.height = 'auto';
    await expect.poll(edges).toEqual([0, 0, 0, 0]);

    content.removeAttribute('style');
    await expect.poll(edges).toEqual([0, 0, 1, 1]);
    region.scrollTo(-100, 0);
    await expect.poll(edges).toEqual([0, 1, 1, 1]);
    await toggle.click();
    expect(layer()).toBeNull();
    expect(region.scrollLeft).toBeLessThan(0);
});
