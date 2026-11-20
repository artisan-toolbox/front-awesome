import { expect, test } from 'vite-plus/test';
import { page } from 'vitest/browser';
import { h, nextTick, reactive } from 'vue';
import Input from '@artisan-toolbox/front-awesome/components/WebAwesome/Input.vue';
import '@artisan-toolbox/front-awesome/web-awesome.css';
import { webAwesomeFixture, inputReady as ready } from './fixtures/web-awesome';

const mount = webAwesomeFixture('wa-input');

test('preserves false booleans before registration and live bindings, attrs, slots, and native events after upgrade', async () => {
    expect(customElements.get('wa-input')).toBeUndefined();
    const state = reactive({ value: 'Ada', enabled: false });
    const events: Event[] = [];
    const observedValues: string[] = [];
    const { element: input } = mount({
        render: () =>
            h(
                Input,
                {
                    modelValue: state.value,
                    'onUpdate:modelValue': (value: string | null | undefined) =>
                        (state.value = value ?? ''),
                    disabled: state.enabled,
                    required: state.enabled,
                    readonly: state.enabled,
                    pill: state.enabled,
                    autofocus: state.enabled,
                    withClear: true,
                    passwordToggle: state.enabled,
                    passwordVisible: state.enabled,
                    withoutSpinButtons: state.enabled,
                    withLabel: state.enabled,
                    withHint: state.enabled,
                    spellcheck: state.enabled,
                    autocorrect: state.enabled,
                    label: 'Name',
                    'data-testid': 'name',
                    'data-purpose': 'profile',
                    class: 'caller-class',
                    style: { marginTop: '3px' },
                    onInput: (event: Event) => {
                        events.push(event);
                        observedValues.push(state.value);
                    },
                    onChange: (event: Event) => events.push(event),
                    onWaClear: (event: Event) => events.push(event),
                },
                {
                    start: () => h('span', '+'),
                    default: () => h('span', { slot: 'end' }, 'end'),
                    'clear-icon': () => h('span', 'clear'),
                },
            ),
    });
    for (const key of [
        'disabled',
        'required',
        'readonly',
        'pill',
        'autofocus',
        'password-toggle',
        'password-visible',
        'without-spin-buttons',
        'with-label',
        'with-hint',
    ])
        expect(input.hasAttribute(key)).toBe(false);
    state.value = 'Latest before import';
    await ready(input);
    await expect.poll(() => input.value).toBe('Latest before import');
    expect(Object.hasOwn(input, 'value')).toBe(false);
    expect(input.disabled).toBe(false);
    expect(input.spellcheck).toBe(false);
    expect(input.autocorrect).toBe(false);
    expect(input.withClear).toBe(true);
    expect(input.classList.contains('caller-class')).toBe(true);
    expect(input.style.marginTop).toBe('3px');
    expect(input.dataset.purpose).toBe('profile');
    for (const slot of ['start', 'end', 'clear-icon'])
        expect(
            input.shadowRoot
                ?.querySelector<HTMLSlotElement>(`slot[name="${slot}"]`)
                ?.assignedElements(),
        ).toHaveLength(1);
    await page.getByTestId('name').getByRole('textbox').fill('Grace');
    await nextTick();
    expect(state.value).toBe('Grace');
    expect(events[0]).toBeInstanceOf(InputEvent);
    expect(observedValues.at(-1)).toBe('Grace');
    expect(events.filter((event) => event.type === 'input')).toHaveLength(1);
    const clear = input.shadowRoot?.querySelector<HTMLButtonElement>('[part="clear-button"]');
    clear?.click();
    await ready(input);
    expect(state.value).toBe('');
    expect(events.filter((event) => event.type === 'wa-clear')).toHaveLength(1);
    expect(events.filter((event) => event.type === 'input')).toHaveLength(2);
    expect(events.filter((event) => event.type === 'change')).toHaveLength(1);
    for (const enabled of [true, false]) {
        state.enabled = enabled;
        await ready(input);
        expect(input.disabled).toBe(enabled);
        expect(input.required).toBe(enabled);
        expect(input.passwordToggle).toBe(enabled);
        expect(input.spellcheck).toBe(enabled);
        expect(input.autocorrect).toBe(enabled);
    }
});
