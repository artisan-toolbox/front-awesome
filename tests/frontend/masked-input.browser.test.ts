import { useForm } from '@inertiajs/vue3';
import { expect, onTestFinished, test, vi } from 'vite-plus/test';
import { page, userEvent } from 'vitest/browser';
import { createApp, createSSRApp, h, nextTick, reactive, shallowRef } from 'vue';
import { useMaskTemplate, useMaskTemplates } from '@artisan-toolbox/front-awesome';
import type { MaskOptions, MaskTemplate } from '@artisan-toolbox/front-awesome';
import MaskedInput from '@artisan-toolbox/front-awesome/components/MaskedInput.vue';
import { createLocalization } from '@artisan-toolbox/front-awesome/localization';
import '@artisan-toolbox/front-awesome/web-awesome.css';
import { inputReady, webAwesomeFixture } from './fixtures/web-awesome';

const mount = webAwesomeFixture('wa-input');

test('passes the Brazilian CPF template directly to a masked Inertia field', async () => {
    const form = useForm({ cpf: '' });
    const template = useMaskTemplate().brazilian.cpf();
    expect(useMaskTemplates().brazilian.cpf()).toBe(template);
    const { element } = mount({
        render: () =>
            h(MaskedInput<{ cpf: string }>, {
                label: 'Template CPF',
                mask: template,
                form,
                field: 'cpf',
            }),
    });
    await inputReady(element);
    const field = page.getByRole('textbox', { name: 'Template CPF' });
    await expect.element(field).toHaveAttribute('inputmode', 'numeric');
    await field.fill('01234567890');
    await expect.element(field).toHaveValue('012.345.678-90');
    expect(form.data().cpf).toBe('01234567890');
});

test('supports custom template implementations and gives explicit field props precedence', async () => {
    class CustomTemplate implements MaskTemplate {
        readonly mask = '##';
        readonly prefix = '#';
        readonly overwrite = true;
        readonly inputMode = 'numeric';
        readonly valueMode = 'formatted';
        readonly incompleteMessage = 'Enter a complete code.';
        private readonly finalDigit = '8';

        isComplete(raw: string) {
            return raw.endsWith(this.finalDigit);
        }
    }
    const template = new CustomTemplate();
    const message = shallowRef<string>();
    const { element } = mount({
        render: () =>
            h('form', [
                h(MaskedInput, {
                    label: 'Template code',
                    mask: template,
                    name: 'code',
                    inputmode: 'tel',
                    valueMode: 'raw',
                    overwrite: false,
                    incompleteMessage: message.value,
                }),
            ]),
    });
    await inputReady(element);
    const field = page.getByRole('textbox', { name: 'Template code' });
    await expect.element(field).toHaveAttribute('inputmode', 'tel');
    await field.fill('12');
    await expect.element(field).toHaveValue('#12');
    expect(element.validationMessage).toBe('Enter a complete code.');
    message.value = 'End the code with 8.';
    await nextTick();
    expect(element.validationMessage).toBe('End the code with 8.');
    expect(new FormData(element.form ?? undefined).get('code')).toBe('12');
    element.setSelectionRange(1, 1);
    await userEvent.keyboard('8');
    await expect.element(field).toHaveValue('#81');
    message.value = '';
    await nextTick();
    expect(element.checkValidity()).toBe(true);
    message.value = undefined;
    await nextTick();
    expect(element.validationMessage).toBe('Enter a complete code.');
    await field.fill('18');
    expect(element.checkValidity()).toBe(true);
});

test('updates a Brazilian postal code validation message as the locale changes', async () => {
    const key = 'front-awesome::mask.brazilian.incomplete.cep';
    const localization = createLocalization({
        version: 1,
        fallbackLocale: 'en',
        locales: {
            en: {
                sourceLocale: 'en',
                label: 'English',
                messages: { [key]: 'Enter all eight digits.' },
            },
            es: {
                sourceLocale: 'es',
                label: 'Español',
                messages: { [key]: 'Ingresa los ocho dígitos.' },
            },
        },
    });
    const originalLocale = document.documentElement.lang;
    document.documentElement.lang = 'en';
    const container = document.createElement('div');
    const submit = vi.fn((event: SubmitEvent) => event.preventDefault());
    const app = createApp({
        render: () =>
            h('form', { onSubmit: submit }, [
                h(MaskedInput, {
                    mask: useMaskTemplate().brazilian.cep(),
                    label: 'CEP',
                    name: 'cep',
                }),
                h('button', { type: 'submit' }, 'Save CEP'),
            ]),
    }).use(localization);
    document.body.append(container);
    onTestFinished(() => {
        app.unmount();
        container.remove();
        document.documentElement.lang = originalLocale;
    });
    app.mount(container);
    const element = container.querySelector('wa-input');
    if (!element) throw new Error('Expected a CEP field.');
    await inputReady(element);
    const field = page.getByRole('textbox', { name: 'CEP' });
    const button = page.getByRole('button', { name: 'Save CEP' });
    expect(element.checkValidity()).toBe(true);
    await field.fill('013');
    expect(element.validationMessage).toBe('Enter all eight digits.');
    localization.setLocale('es');
    await expect.poll(() => element.validationMessage).toBe('Ingresa los ocho dígitos.');
    await button.click();
    expect(submit).not.toHaveBeenCalled();
    await field.fill('01310100');
    await expect.element(field).toHaveValue('01.310-100');
    expect(element.validationMessage).toBe('');
    expect(new FormData(element.form ?? undefined).get('cep')).toBe('01310100');
    await button.click();
    expect(submit).toHaveBeenCalledOnce();
});

test('uses a late raw model assignment on startup and preserves the explicit reset value', async () => {
    const state = reactive<{ value: string | undefined }>({ value: undefined });
    const edits = vi.fn();
    const { element } = mount({
        render: () =>
            h('form', [
                h(MaskedInput, {
                    label: 'Saved postal code',
                    name: 'postal_code',
                    mask: '#####-###',
                    modelValue: state.value,
                    defaultValue: '04000000',
                    'onUpdate:modelValue': (value: string) => {
                        state.value = value;
                    },
                    onMaskChange: edits,
                }),
            ]),
    });
    state.value = '01310100';
    await inputReady(element);
    const field = page.getByRole('textbox', { name: 'Saved postal code' });
    await expect.element(field).toHaveValue('01310-100');
    const form = element.form;
    if (!form) throw new Error('Expected the postal code form.');
    expect(new FormData(form).get('postal_code')).toBe('01310100');
    expect(state.value).toBe('01310100');
    expect(edits).not.toHaveBeenCalled();
    form.reset();
    await expect.element(field).toHaveValue('04000-000');
    expect(state.value).toBe('04000000');
});

test('hydrates a formatted v-model and applies late model assignments without emitting edits', async () => {
    const { renderToString } = await import('vue/server-renderer');
    const state = reactive<{ value: string | null | undefined }>({ value: '01.23' });
    const modelUpdates = vi.fn();
    const edits = vi.fn();
    const component = {
        render: () =>
            h('form', [
                h(MaskedInput, {
                    label: 'Saved code',
                    name: 'code',
                    mask: ['##-##', '##.##'],
                    valueMode: 'formatted',
                    guide: 'focus',
                    modelValue: state.value,
                    'onUpdate:modelValue': modelUpdates,
                    onMaskChange: edits,
                }),
                h('button', { type: 'button' }, 'Next'),
            ]),
    };
    const container = document.createElement('div');
    container.innerHTML = await renderToString(createSSRApp(component));
    const element = container.querySelector('wa-input');
    if (!element) throw new Error('Expected the server-rendered masked input.');
    document.body.append(container);
    const app = createSSRApp(component);
    const warnings: string[] = [];
    app.config.warnHandler = (message) => warnings.push(message);
    onTestFinished(() => {
        app.unmount();
        container.remove();
    });
    app.mount(container);
    await inputReady(element);
    const field = page.getByRole('textbox', { name: 'Saved code' });
    await expect.element(field).toHaveValue('01.23');
    expect(container.querySelector('wa-input')).toBe(element);
    expect(new FormData(element.form ?? undefined).get('code')).toBe('01.23');
    await field.click();
    await expect.element(field).toHaveValue('01.23');
    state.value = '04.5';
    await nextTick();
    await expect.element(field).toHaveValue('04.5_');
    expect(new FormData(element.form ?? undefined).get('code')).toBe('04.5');
    await userEvent.keyboard('{Tab}');
    await expect.element(field).toHaveValue('04.5');
    state.value = null;
    await expect.element(field).toHaveValue('');
    expect(new FormData(element.form ?? undefined).get('code')).toBe('');
    state.value = undefined;
    await expect.element(field).toHaveValue('');
    state.value = await Promise.resolve('00-07');
    await expect.element(field).toHaveValue('00-07');
    expect(new FormData(element.form ?? undefined).get('code')).toBe('00-07');
    expect(warnings).toEqual([]);
    expect(modelUpdates).not.toHaveBeenCalled();
    expect(edits).not.toHaveBeenCalled();
});

test('edits a postal code, preserves its initial zero and submits raw text after undo and redo', async () => {
    const state = reactive({ value: '' });
    const changes = vi.fn();
    const { element } = mount({
        render: () =>
            h('form', [
                h(MaskedInput, {
                    label: 'Postal code',
                    hint: 'Enter eight digits.',
                    name: 'postal',
                    mask: '#####-###',
                    modelValue: state.value,
                    'onUpdate:modelValue': (value: string) => {
                        state.value = value;
                    },
                    onMaskChange: changes,
                }),
            ]),
    });
    await inputReady(element);
    const field = page.getByRole('textbox', { name: 'Postal code' });
    await expect.element(field).toHaveAccessibleDescription('Enter eight digits.');
    await field.click();
    await userEvent.keyboard('01310100');
    await expect.element(field).toHaveValue('01310-100');
    expect(state.value).toBe('01310100');
    expect(changes).toHaveBeenLastCalledWith({
        raw: '01310100',
        formatted: '01310-100',
        complete: true,
    });
    expect(new FormData(element.form ?? undefined).get('postal')).toBe('01310100');
    element.setSelectionRange(4, 7);
    await userEvent.keyboard('9');
    await expect.element(field).toHaveValue('01319-00');
    await userEvent.keyboard('{Control>}z{/Control}');
    await expect.element(field).toHaveValue('01310-100');
    await userEvent.keyboard('{Control>}{Shift>}z{/Shift}{/Control}');
    await expect.element(field).toHaveValue('01319-00');
    expect(new FormData(element.form ?? undefined).get('postal')).toBe('0131900');
    state.value = '00000000';
    await expect.element(field).toHaveValue('00000-000');
    element.formStateRestoreCallback('04567-123', 'restore');
    await inputReady(element);
    await expect.element(field).toHaveValue('04567-123');
    expect(state.value).toBe('04567123');
    expect(new FormData(element.form ?? undefined).get('postal')).toBe('04567123');
});

test('keeps guides and affixes out of required and incomplete validation and formatted submission', async () => {
    const { element } = mount({
        render: () =>
            h('form', [
                h(MaskedInput, {
                    label: 'Code',
                    name: 'code',
                    mask: '##-##',
                    prefix: 'ID ',
                    suffix: ' BR',
                    guide: 'focus',
                    guideChar: '·',
                    required: true,
                    incompleteMessage: 'Enter all four digits.',
                    valueMode: 'formatted',
                }),
            ]),
    });
    await inputReady(element);
    const field = page.getByRole('textbox', { name: 'Code' });
    await field.click();
    await expect.element(field).toHaveAttribute('placeholder', 'ID ··-·· BR');
    expect(element.checkValidity()).toBe(false);
    expect(new FormData(element.form ?? undefined).get('code')).toBe('');
    await userEvent.keyboard('01');
    await expect.element(field).toHaveValue('ID 01-·· BR');
    expect(element.validationMessage).toBe('Enter all four digits.');
    expect(new FormData(element.form ?? undefined).get('code')).toBe('ID 01 BR');
    await userEvent.keyboard('23');
    expect(element.checkValidity()).toBe(true);
    expect(new FormData(element.form ?? undefined).get('code')).toBe('ID 01-23 BR');
});

test('undoes and redoes a dynamic format change when the parent rebuilds equivalent tokens', async () => {
    const state = reactive({ value: '' });
    const { element } = mount({
        render: () =>
            h(MaskedInput, {
                label: 'Phone',
                mask: (text: string) =>
                    text.replace(/\D/g, '').length > 10 ? '(##) #####-####' : '(##) ####-####',
                tokens: { X: /[0-9A-Z]/ },
                valueMode: 'formatted',
                modelValue: state.value,
                'onUpdate:modelValue': (value: string) => {
                    state.value = value;
                },
            }),
    });
    await inputReady(element);
    const field = page.getByRole('textbox', { name: 'Phone' });
    await field.click();
    await userEvent.keyboard('11987654321');
    await expect.element(field).toHaveValue('(11) 98765-4321');
    await userEvent.keyboard('{Control>}z{/Control}');
    await expect.element(field).toHaveValue('(11) 9876-5432');
    expect(state.value).toBe('(11) 9876-5432');
    await userEvent.keyboard('{Control>}{Shift>}z{/Shift}{/Control}');
    await expect.element(field).toHaveValue('(11) 98765-4321');
});

test('preserves duplicate names, external form association, disabled fieldsets and canceled resets', async () => {
    const state = reactive({ disabled: false });
    const { element } = mount({
        render: () =>
            h('div', [
                h('form', { id: 'codes' }, [
                    h('input', { type: 'hidden', name: 'code', value: 'first' }),
                ]),
                h('fieldset', { disabled: state.disabled }, [
                    h(MaskedInput, {
                        label: 'Reference',
                        name: 'code',
                        mask: '##-##',
                        form: 'codes',
                        defaultValue: '0123',
                    }),
                ]),
            ]),
    });
    await inputReady(element);
    const form = element.form;
    if (!form) throw new Error('Expected the external owner form.');
    const field = page.getByRole('textbox', { name: 'Reference' });
    await expect.element(field).toHaveValue('01-23');
    expect(new FormData(form).getAll('code')).toEqual(['first', '0123']);
    state.disabled = true;
    await expect.poll(() => new FormData(form).getAll('code')).toEqual(['first']);
    state.disabled = false;
    await expect.element(field).toBeEnabled();
    await field.fill('9876');
    await expect.element(field).toHaveValue('98-76');
    form.addEventListener('reset', (event) => event.preventDefault(), { once: true });
    form.reset();
    await inputReady(element);
    expect(new FormData(form).getAll('code')).toEqual(['first', '9876']);
    form.reset();
    await expect.element(field).toHaveValue('01-23');
    expect(new FormData(form).getAll('code')).toEqual(['first', '0123']);
});

test('clears a partial active group on blur only when enabled', async () => {
    const state = reactive<{ value: string; clear?: boolean }>({ value: '' });
    const { element } = mount({
        render: () =>
            h('form', [
                h(MaskedInput, {
                    label: 'Optional code',
                    name: 'code',
                    mask: '##[-##]',
                    guide: 'focus',
                    clearIncompleteOnBlur: state.clear,
                    modelValue: state.value,
                    'onUpdate:modelValue': (value: string) => {
                        state.value = value;
                    },
                }),
                h('button', { type: 'button' }, 'Next'),
            ]),
    });
    await inputReady(element);
    const field = page.getByRole('textbox', { name: 'Optional code' });
    await field.fill('123');
    await userEvent.keyboard('{Tab}');
    await expect.element(field).toHaveValue('12-3');
    expect(state.value).toBe('123');
    state.clear = true;
    await field.click();
    await userEvent.keyboard('{Tab}');
    await expect.element(field).toHaveValue('');
    expect(state.value).toBe('');
    expect(new FormData(element.form ?? undefined).get('code')).toBe('');
    await field.fill('12');
    await userEvent.keyboard('{Tab}');
    await expect.element(field).toHaveValue('12');
    expect(new FormData(element.form ?? undefined).get('code')).toBe('12');
});

test('binds an Inertia field and exposes its server error to the labeled textbox', async () => {
    const form = useForm({ address: { code: '03' } });
    const { element } = mount({
        render: () =>
            h(MaskedInput<{ address: { code: string } }>, {
                label: 'Address code',
                mask: '##-##',
                form,
                field: 'address.code',
            }),
    });
    await inputReady(element);
    const field = page.getByRole('textbox', { name: 'Address code' });
    await field.fill('0567');
    expect(form.address.code).toBe('0567');
    form.setError('address.code', 'Unknown address code.');
    await expect.element(field).toHaveAttribute('aria-invalid', 'true');
    await expect.element(field).toHaveAccessibleDescription('Unknown address code.');
    form.clearErrors();
    await expect.element(field).not.toHaveAttribute('aria-invalid');
    form.reset();
    await expect.element(field).toHaveValue('03');
});

const inertiaValues: (Pick<MaskOptions, 'mask' | 'tokens'> & {
    label: string;
    entered: string;
    displayed: string;
    submitted: string;
    valueMode?: 'formatted';
})[] = [
    {
        label: 'raw postal code',
        mask: '##.###-###',
        entered: '86.870-000',
        displayed: '86.870-000',
        submitted: '86870000',
    },
    {
        label: 'raw CPF with a leading zero',
        mask: '###.###.###-##',
        entered: '012.345.678-90',
        displayed: '012.345.678-90',
        submitted: '01234567890',
    },
    {
        label: 'raw mobile number with an editable country code',
        mask: '+## (##) #####-####',
        entered: '+55 (75) 99876-5432',
        displayed: '+55 (75) 99876-5432',
        submitted: '5575998765432',
    },
    {
        label: 'raw alphanumeric CNPJ',
        mask: 'XX.XXX.XXX/XXXX-##',
        tokens: { X: { accept: /[0-9A-Z]/, transform: (character) => character.toUpperCase() } },
        entered: '00.000.000/e08g-12',
        displayed: '00.000.000/E08G-12',
        submitted: '00000000E08G12',
    },
    {
        label: 'formatted mobile number',
        mask: '(##) #####-####',
        entered: '75998765432',
        displayed: '(75) 99876-5432',
        submitted: '(75) 99876-5432',
        valueMode: 'formatted',
    },
];

test.each(inertiaValues)('writes $label to Inertia and native form data', async (example) => {
    const form = useForm({ contact: { code: '' } });
    const { element } = mount({
        render: () =>
            h('form', [
                h(MaskedInput<{ contact: { code: string } }>, {
                    label: example.label,
                    mask: example.mask,
                    tokens: example.tokens,
                    valueMode: example.valueMode,
                    name: 'code',
                    form,
                    field: 'contact.code',
                }),
            ]),
    });
    await inputReady(element);
    const field = page.getByRole('textbox', { name: example.label });
    await field.fill(example.entered);
    await expect.element(field).toHaveValue(example.displayed);
    expect(form.data().contact.code).toBe(example.submitted);
    expect(new FormData(element.form ?? undefined).get('code')).toBe(example.submitted);
});
