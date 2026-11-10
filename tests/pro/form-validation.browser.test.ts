import { expect, onTestFinished, test } from 'vite-plus/test';
import { createApp, h, nextTick, reactive } from 'vue';
import type WaDatePicker from '@web.awesome.me/webawesome-pro/dist/components/date-picker/date-picker.js';
import { useForm } from '@inertiajs/vue3';
import { DatePicker } from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
import '@artisan-toolbox/front-awesome/web-awesome.css';

test('retains the responsive calendar host and focused day through errors in a stable block frame', async () => {
    const form = useForm({ dates: '2026-11-09/2026-11-12' });
    const state = reactive({ width: '680px' });
    const container = document.createElement('div');
    document.body.append(container);
    const app = createApp({
        render: () =>
            h('div', { style: { width: state.width } }, [
                h('wa-date-picker', { mode: 'range', months: 2, value: form.dates }),
                h(DatePicker<{ dates: string }>, {
                    form,
                    field: 'dates',
                    mode: 'range',
                    months: 2,
                    'aria-label': 'Booking dates',
                }),
            ]),
    });
    app.mount(container);
    onTestFinished(() => {
        app.unmount();
        container.remove();
    });
    const [native, bound] = container.querySelectorAll<WaDatePicker>('wa-date-picker');
    if (!native || !bound) throw new Error('Expected native and bound calendars.');
    await customElements.whenDefined('wa-date-picker');
    await expect.poll(() => bound.value).toBe(form.dates);
    await bound.updateComplete;
    const frame = bound.parentElement;
    expect(frame?.classList.contains('fa-form-field-frame--block')).toBe(true);
    const focusedDay = bound.shadowRoot?.querySelector<HTMLElement>('[part~="day"][tabindex="0"]');
    if (!focusedDay) throw new Error('Expected a focusable public calendar day.');
    focusedDay.focus();
    form.setError('dates', 'Choose available dates. '.repeat(20));
    await nextTick();
    await bound.updateComplete;
    expect(bound.parentElement).toBe(frame);
    expect(bound.shadowRoot?.activeElement).toBe(focusedDay);
    expect(bound.getAttribute('aria-invalid')).toBe('true');
    expect(bound.dataset.faFormErrorStyle).toBe('calendar');
    const error = frame?.querySelector<HTMLElement>('[role="alert"]');
    expect(error?.id).toBe(bound.getAttribute('aria-errormessage'));
    expect(bound.querySelector('[role="alert"]')).toBeNull();
    const expected = document.createElement('span');
    expected.style.borderColor = 'var(--wa-color-danger-border-loud)';
    expected.style.backgroundColor = 'var(--wa-color-danger-fill-loud)';
    container.append(expected);
    const calendar = bound.shadowRoot?.querySelector<HTMLElement>('[part~="date-picker"]');
    const selected = bound.shadowRoot?.querySelector<HTMLElement>('[part~="day-selected"]');
    if (!calendar || !selected) throw new Error('Expected public calendar and selected-day parts.');
    expect(getComputedStyle(calendar).borderColor).toBe(getComputedStyle(expected).borderColor);
    expect(getComputedStyle(selected).backgroundColor).toBe(
        getComputedStyle(expected).backgroundColor,
    );
    for (const width of ['680px', '300px']) {
        state.width = width;
        await nextTick();
        await bound.updateComplete;
        expect(bound.getBoundingClientRect().width).toBe(native.getBoundingClientRect().width);
        expect(bound.getBoundingClientRect().width).toBe(Number.parseInt(width));
        const boundMonths = bound.shadowRoot?.querySelector<HTMLElement>('[part~="months"]');
        const nativeMonths = native.shadowRoot?.querySelector<HTMLElement>('[part~="months"]');
        if (!boundMonths || !nativeMonths) throw new Error('Expected public months parts.');
        expect(getComputedStyle(boundMonths).flexDirection).toBe(
            getComputedStyle(nativeMonths).flexDirection,
        );
    }
    form.clearErrors();
    await nextTick();
    await bound.updateComplete;
    expect(bound.parentElement).toBe(frame);
    expect(bound.classList.contains('fa-form-invalid')).toBe(false);
    expect(bound.hasAttribute('aria-errormessage')).toBe(false);
    expect(bound.shadowRoot?.activeElement).toBe(focusedDay);
});
