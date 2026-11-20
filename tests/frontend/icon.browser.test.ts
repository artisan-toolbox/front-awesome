import { expect, onTestFinished, test } from 'vite-plus/test';
import { h, reactive } from 'vue';
import Icon from '@artisan-toolbox/front-awesome/components/WebAwesome/Icon.vue';
import { webAwesomeFixture, ready } from './fixtures/web-awesome';

const mount = webAwesomeFixture('wa-icon');

function svgUrl(id: string) {
    return `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path id="${id}" fill="currentColor" d="M0 0h16v16H0z"/></svg>`)}`;
}

test('loads real SVGs, forwards original events, and inherits application styling and accessibility', async () => {
    const state = reactive({ label: 'Saved', src: svgUrl('loaded-icon') });
    const loads: Event[] = [];
    const errors: Event[] = [];
    const clicks: MouseEvent[] = [];
    const { element: icon } = mount({
        render: () =>
            h('div', { style: { color: 'rgb(42, 60, 90)', fontSize: '27px' } }, [
                h(Icon, {
                    src: state.src,
                    label: state.label,
                    canvas: 'square',
                    flip: 'both',
                    animation: 'spin',
                    slot: 'start',
                    class: 'caller-icon',
                    style: { marginLeft: '3px' },
                    'data-purpose': 'status',
                    onWaLoad: (event: Event) => loads.push(event),
                    onWaError: (event: Event) => errors.push(event),
                    onClick: (event: MouseEvent) => clicks.push(event),
                }),
            ]),
    });
    await ready(icon);
    await expect.poll(() => loads.length).toBe(1);
    await ready(icon);
    expect(icon.shadowRoot?.querySelector('svg #loaded-icon')).not.toBeNull();
    expect(loads[0]?.type).toBe('wa-load');
    expect(loads[0]?.target).toBe(icon);
    expect(icon.getAttribute('role')).toBe('img');
    expect(icon.getAttribute('aria-label')).toBe('Saved');
    expect(icon.hasAttribute('aria-hidden')).toBe(false);
    expect(getComputedStyle(icon).color).toBe('rgb(42, 60, 90)');
    expect(getComputedStyle(icon).fontSize).toBe('27px');
    expect(icon.className).toBe('caller-icon');
    expect(icon.style.marginLeft).toBe('3px');
    expect(icon.dataset.purpose).toBe('status');
    expect(icon.slot).toBe('start');
    expect(icon.canvas).toBe('square');
    expect(icon.flip).toBe('both');
    expect(icon.animation).toBe('spin');
    icon.click();
    expect(clicks).toHaveLength(1);
    expect(clicks[0]?.target).toBe(icon);

    state.label = '';
    await ready(icon);
    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(icon.hasAttribute('role')).toBe(false);
    expect(icon.hasAttribute('aria-label')).toBe(false);
    state.src = 'data:text/plain,not-an-svg-icon';
    await ready(icon);
    await expect.poll(() => errors.length).toBe(1);
    await ready(icon);
    expect(errors[0]?.type).toBe('wa-error');
    expect(errors[0]?.target).toBe(icon);
    expect(icon.shadowRoot?.querySelector('svg')).toBeNull();
    expect(loads).toHaveLength(1);
});

test('retains native custom library options and name precedence over src', async () => {
    const { registerIconLibrary, unregisterIconLibrary } =
        await import('#front-awesome-webawesome/components/icon/library.js');
    const requests: string[][] = [];
    registerIconLibrary('front-awesome-test', {
        resolver: (name, family, variant) => {
            requests.push([name, family, variant]);
            return svgUrl('library-icon');
        },
    });
    onTestFinished(() => unregisterIconLibrary('front-awesome-test'));
    const state = reactive({ library: 'front-awesome-test' });
    const loads: Event[] = [];
    const { element: icon } = mount({
        render: () =>
            h(Icon, {
                name: 'custom-home',
                family: 'hand-drawn',
                variant: 'pencil',
                library: state.library,
                src: svgUrl('fallback-icon'),
                onWaLoad: (event: Event) => loads.push(event),
            }),
    });
    await ready(icon);
    await expect.poll(() => loads.length).toBe(1);
    await ready(icon);
    expect(requests).toContainEqual(['custom-home', 'hand-drawn', 'pencil']);
    expect(icon.shadowRoot?.querySelector('#library-icon')).not.toBeNull();
    expect(icon.shadowRoot?.querySelector('#fallback-icon')).toBeNull();
    expect(icon.className).toBe('');
    expect(icon.style.color).toBe('');
    expect(icon.style.fontSize).toBe('');
    expect(icon.getAttribute('aria-hidden')).toBe('true');

    state.library = 'unregistered-library';
    await ready(icon);
    await expect.poll(() => loads.length).toBe(2);
    await ready(icon);
    expect(icon.shadowRoot?.querySelector('#fallback-icon')).not.toBeNull();
});
