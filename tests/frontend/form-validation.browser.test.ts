import { expect, onTestFinished, test } from 'vite-plus/test';
import { createApp, h, nextTick, reactive, shallowRef } from 'vue';
import type { Component, ComponentPublicInstance } from 'vue';
import type WaRating from '@awesome.me/webawesome/dist/components/rating/rating.js';
import type WaInput from '@awesome.me/webawesome/dist/components/input/input.js';
import { useForm } from '@inertiajs/vue3';
import { Card, Input, Rating } from '@artisan-toolbox/front-awesome/components/WebAwesome';
import '@artisan-toolbox/front-awesome/web-awesome.css';

function mount(component: Component) {
    const container = document.createElement('div');
    document.body.append(container);
    const app = createApp(component);
    app.mount(container);
    onTestFinished(() => {
        app.unmount();
        container.remove();
    });
    return container;
}

async function ready(element: WaRating | WaInput) {
    await customElements.whenDefined(element.localName);
    await nextTick();
    await element.updateComplete;
    await nextTick();
    await element.updateComplete;
}

test.each(['block', 'flex', 'grid'])(
    'keeps a bound Rating hit rectangle and native ref stable through long errors in %s',
    async (display) => {
        const form = useForm({ score: 2 });
        const exposed = shallowRef<ComponentPublicInstance | Element | null>(null);
        const container = mount({
            render: () =>
                h(
                    'div',
                    { style: { display, width: '420px', gap: '16px', justifyItems: 'start' } },
                    [
                        h('wa-rating', { label: 'Native rating', value: 2 }),
                        h(Rating<{ score: number }>, {
                            ref: (value) => (exposed.value = value),
                            form,
                            field: 'score',
                            label: 'Bound rating',
                            class: 'caller-rating',
                            'data-purpose': 'rating-test',
                        }),
                    ],
                ),
        });
        const [native, bound] = container.querySelectorAll<WaRating>('wa-rating');
        if (!native || !bound) throw new Error('Expected native and bound Rating controls.');
        await ready(bound);
        await expect.poll(() => bound.value).toBe(2);
        const before = bound.getBoundingClientRect();
        expect(before.width).toBe(native.getBoundingClientRect().width);
        const frame = bound.parentElement;
        expect(frame?.classList.contains('fa-form-field-frame')).toBe(true);
        expect(frame?.classList.contains('caller-rating')).toBe(false);
        expect(bound.dataset.purpose).toBe('rating-test');
        bound.focus();
        form.setError('score', '<b>Choose a rating.</b> '.repeat(30));
        await ready(bound);
        expect(bound.value).toBe(2);
        expect(container.querySelectorAll('wa-rating')[1]).toBe(bound);
        expect(bound.getBoundingClientRect().width).toBe(before.width);
        expect(document.activeElement).toBe(bound);
        expect(exposed.value && '$el' in exposed.value ? exposed.value.$el : null).toBe(bound);
        expect(bound.classList.contains('fa-form-invalid')).toBe(true);
        expect(bound.getAttribute('aria-invalid')).toBe('true');
        const error = frame?.querySelector<HTMLElement>('[role="alert"]');
        expect(error?.textContent).toContain('<b>Choose a rating.</b>');
        expect(error?.querySelector('b')).toBeNull();
        expect(bound.querySelector('[role="alert"]')).toBeNull();
        expect(error?.id).toBe(bound.getAttribute('aria-errormessage'));
        expect(error?.getBoundingClientRect().width).toBe(before.width);
        expect(frame?.getBoundingClientRect().width).toBeLessThanOrEqual(420);
        bound.dispatchEvent(
            new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, composed: true }),
        );
        await ready(bound);
        expect(bound.value).toBe(3);
        await expect.poll(() => form.score).toBe(3);
        form.clearErrors();
        await ready(bound);
        expect(bound.parentElement).toBe(frame);
        expect(bound.getBoundingClientRect().width).toBe(before.width);
        expect(document.activeElement).toBe(bound);
        expect(bound.classList.contains('fa-form-invalid')).toBe(false);
        expect(bound.hasAttribute('aria-invalid')).toBe(false);
    },
);

test('retains explicit Rating width and restores caller ARIA after errors clear', async () => {
    const state = reactive<{ score: number; failed: boolean | string }>({
        score: 2,
        failed: false,
    });
    const container = mount({
        render: () =>
            h(Rating, {
                modelValue: state.score,
                'onUpdate:modelValue': (value: number) => (state.score = value),
                failed: state.failed,
                label: 'Rating',
                style: { width: '240px' },
                'aria-errormessage': 'application-error',
                'aria-invalid': 'grammar',
            }),
    });
    const rating = container.querySelector<WaRating>('wa-rating');
    if (!rating) throw new Error('Expected Rating.');
    await ready(rating);
    await expect.poll(() => rating.value).toBe(2);
    state.failed = 'Choose a rating.';
    await ready(rating);
    expect(rating.getBoundingClientRect().width).toBe(240);
    expect(rating.getAttribute('aria-errormessage')).toContain('application-error');
    expect(rating.getAttribute('aria-errormessage')?.split(/\s+/)).toHaveLength(2);
    state.failed = false;
    await ready(rating);
    expect(rating.getAttribute('aria-errormessage')).toBe('application-error');
    expect(rating.getAttribute('aria-invalid')).toBe('grammar');
});

test('keeps an unbound Rating in an inert contents frame without a presentation group', async () => {
    const container = mount({ render: () => h(Rating, { value: 3, label: 'Native rating' }) });
    const rating = container.querySelector<WaRating>('wa-rating');
    if (!rating) throw new Error('Expected Rating.');
    await ready(rating);
    expect(container.children).toHaveLength(1);
    expect(container.firstElementChild).toBe(rating.parentElement);
    expect(getComputedStyle(rating.parentElement ?? rating).display).toBe('contents');
    expect(rating.parentElement?.hasAttribute('role')).toBe(false);
    expect(container.querySelector('.fa-form-field-frame')).toBeNull();
    expect(rating.value).toBe(3);
});

test('keeps a fallback control assigned to its native parent slot while errors activate and clear', async () => {
    const state = reactive<{ score: number; failed: false | string }>({ score: 2, failed: false });
    const container = mount({
        render: () =>
            h(
                Card,
                {},
                {
                    footer: () =>
                        h(Rating, {
                            modelValue: state.score,
                            'onUpdate:modelValue': (value: number) => (state.score = value),
                            failed: state.failed,
                            label: 'Product rating',
                        }),
                },
            ),
    });
    const rating = container.querySelector<WaRating>('wa-rating');
    const card = container.querySelector('wa-card');
    if (!rating || !(card instanceof HTMLElement)) throw new Error('Expected a slotted Rating.');
    await ready(rating);
    await customElements.whenDefined('wa-card');
    await Reflect.get(card, 'updateComplete');
    const footer = card.shadowRoot?.querySelector<HTMLSlotElement>('slot[name="footer"]');
    const frame = rating.parentElement;
    if (!footer || !frame)
        throw new Error('Expected the public Card footer slot and Rating frame.');
    expect(footer.assignedElements()).toEqual([frame]);
    expect(frame.getAttribute('slot')).toBe('footer');
    rating.focus();
    state.failed = 'Choose a rating.';
    await ready(rating);
    expect(footer.assignedElements()).toEqual([frame]);
    expect(frame.querySelector('[role="alert"]')?.textContent).toBe('Choose a rating.');
    expect(document.activeElement).toBe(rating);
    expect(rating.value).toBe(2);
    state.failed = false;
    await ready(rating);
    expect(footer.assignedElements()).toEqual([frame]);
    expect(container.querySelector('wa-rating')).toBe(rating);
    const error = frame.querySelector<HTMLElement>('[role="alert"]');
    if (!error) throw new Error('Expected the retained error announcement.');
    expect(getComputedStyle(error).display).toBe('none');
    expect(rating.value).toBe(2);
});

test('preserves Input hint content for boolean failure and restores caller ARIA after messages', async () => {
    const state = reactive<{ value: string; failed: boolean | string[] }>({
        value: '',
        failed: true,
    });
    const container = mount({
        render: () =>
            h(
                Input,
                {
                    modelValue: state.value,
                    'onUpdate:modelValue': (value: string | null | undefined) =>
                        (state.value = value ?? ''),
                    failed: state.failed,
                    hint: 'Caller hint',
                    'aria-errormessage': 'application-error',
                },
                { hint: () => h('span', 'Caller slot hint') },
            ),
    });
    const input = container.querySelector<WaInput>('wa-input');
    if (!input) throw new Error('Expected Input.');
    await ready(input);
    expect(input.textContent).toContain('Caller slot hint');
    expect(input.hint).toBe('Caller hint');
    expect(input.querySelector('[role="alert"]')).toBeNull();
    expect(input.getAttribute('aria-invalid')).toBe('true');
    state.failed = ['Choose a name.'];
    await ready(input);
    expect(input.textContent).not.toContain('Caller slot hint');
    const error = input.querySelector('[role="alert"]');
    expect(error?.textContent).toBe('Choose a name.');
    expect(input.getAttribute('aria-errormessage')).toBe(`application-error ${error?.id}`);
    state.failed = false;
    await ready(input);
    expect(input.getAttribute('aria-errormessage')).toBe('application-error');
    expect(input.hasAttribute('aria-invalid')).toBe(false);
    expect(input.hint).toBe('Caller hint');
    expect(input.textContent).toContain('Caller slot hint');
});
