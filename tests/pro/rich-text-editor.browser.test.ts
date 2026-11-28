import { useForm } from '@inertiajs/vue3';
import { Button } from '@artisan-toolbox/front-awesome/components/WebAwesome';
import { RichTextEditor } from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
import type { RichTextEditorProps } from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
import { expect, onTestFinished, test, vi } from 'vite-plus/test';
import { page } from 'vitest/browser';
import { createApp, h, ref, shallowRef } from 'vue';
import {
    exerciseErrors,
    mount,
    part,
    ready as readyControl,
    required,
    surface,
    userEvent,
} from '../frontend/fixtures/form-errors-matrix/browser';
import '@artisan-toolbox/front-awesome/web-awesome.css';

const tag = 'wa-rich-text-editor';
const contentPart = '[part~="content"]';

async function ready(editor: HTMLElement) {
    await vi.dynamicImportSettled();
    await readyControl(editor);
}

function editorIn(container: ParentNode) {
    const editor = container.querySelector(tag);
    if (!editor) throw new Error('Expected the rich text editor.');
    return editor;
}

function submittedValue(form: HTMLFormElement) {
    return new FormData(form).get('body');
}

async function replaceText(editor: HTMLElement, text: string) {
    await userEvent.fill(part(editor, contentPart), text);
}

test('RichTextEditor mounts before registration, preserves slots and listeners, and keeps a separate reset default', async () => {
    expect(customElements.get(tag)).toBeUndefined();
    const abandoned = document.createElement('div');
    document.body.append(abandoned);
    const app = createApp({ render: () => h(RichTextEditor, { label: 'Abandoned editor' }) });
    app.mount(abandoned);
    app.unmount();
    abandoned.remove();
    const exposed = shallowRef<{ $el: HTMLElement }>();
    const current = ref<string | null>('<p>Draft</p>');
    const update = ref(0);
    const submitted = ref<string | null>('Submitted HTML');
    const callbacks = {
        onInput: vi.fn<(event: InputEvent) => void>(),
        onChange: vi.fn<(event: Event) => void>(),
        onFocus: vi.fn<(event: FocusEvent) => void>(),
        onBlur: vi.fn<(event: FocusEvent) => void>(),
        onSelectionchange: vi.fn<(event: Event) => void>(),
    };
    const container = mount(
        {
            render: () => [
                h(
                    RichTextEditor,
                    {
                        ref: exposed,
                        name: 'body',
                        modelValue: current.value,
                        'onUpdate:modelValue': (value) => (current.value = value),
                        toolbar: 'bold | actions',
                        ...callbacks,
                    },
                    {
                        default: () => [
                            h('p', 'Reset text'),
                            h('span', { slot: 'hint' }, 'Available formatting'),
                        ],
                        label: () => h('span', 'Article body'),
                        actions: () => h('button', { type: 'button' }, 'Toolbar action'),
                    },
                ),
                h('button', { type: 'button' }, `Outside ${update.value}`),
                h(Button, { type: 'reset' }, () => 'Reset editor'),
                submitted.value !== null && h('output', submitted.value),
            ],
        },
        'wa-light',
        'block',
    );
    const editor = editorIn(container);
    container.addEventListener('reset', (event) => {
        if (!event.defaultPrevented) submitted.value = null;
    });
    const inputEvent = vi.fn();
    const changeEvent = vi.fn();
    editor.addEventListener('input', inputEvent);
    editor.addEventListener('change', changeEvent);
    await ready(editor);
    expect(abandoned.childElementCount).toBe(0);
    expect(exposed.value?.$el).toBe(editor);
    expect(editor.defaultValue).toBe('<p>Reset text</p>');
    expect(submittedValue(container)).toBe('<p>Draft</p>');
    await expect
        .element(page.getByRole('textbox', { name: 'Article body' }))
        .toHaveAccessibleDescription('Available formatting');
    await expect.element(page.getByRole('button', { name: 'Toolbar action' })).toBeVisible();

    await replaceText(editor, 'Edited');
    await expect.poll(() => current.value).toBe('<p>Edited</p>');
    expect(submittedValue(container)).toBe('<p>Edited</p>');
    expect(callbacks.onInput.mock.lastCall?.[0]).toBe(inputEvent.mock.lastCall?.[0]);
    expect(callbacks.onInput.mock.lastCall?.[0]).toBeInstanceOf(InputEvent);
    expect(callbacks.onFocus.mock.lastCall?.[0]).toBeInstanceOf(FocusEvent);
    editor.selectAll();
    expect(editor.selectedText).toBe('Edited');
    expect(editor.runCommand('bold')).toBe(true);
    expect(editor.isActive('bold')).toBe(true);
    expect(editor.getSelection().empty).toBe(false);
    expect(editor.runCommand('unknown-command')).toBe(false);
    await expect.poll(() => callbacks.onSelectionchange.mock.calls.length).toBeGreaterThan(0);
    await userEvent.click(required(container, 'button:not([slot])'));
    expect(callbacks.onChange.mock.lastCall?.[0]).toBe(changeEvent.mock.lastCall?.[0]);
    expect(callbacks.onBlur.mock.lastCall?.[0]).toBeInstanceOf(FocusEvent);

    update.value += 1;
    await ready(editor);
    expect(current.value).toBe('<p><strong>Edited</strong></p>');
    expect(editor.value).toBe(current.value);
    container.addEventListener('reset', (event) => event.preventDefault(), { once: true });
    await page.getByRole('button', { name: 'Reset editor' }).click();
    await ready(editor);
    expect(current.value).toBe('<p><strong>Edited</strong></p>');
    submitted.value = 'Submitted HTML';
    await page.getByRole('button', { name: 'Reset editor' }).click();
    await expect.poll(() => current.value).toBe('<p>Reset text</p>');
    expect(submittedValue(container)).toBe('<p>Reset text</p>');
    expect(container.querySelector('output')).toBeNull();
    expect(editor.dirty).toBe(false);
    await replaceText(editor, 'Saved text');
    await expect.poll(() => editor.dirty).toBe(true);
    editor.defaultValue = editor.value;
    expect(editor.dirty).toBe(false);
    current.value = null;
    await ready(editor);
    expect(editor.value).toBe('');
    expect(editor.defaultValue).toBe('<p>Saved text</p>');
});

test('RichTextEditor matches native interactions and parts without Tailwind after prior registration', async () => {
    const state = ref<{ disabled?: boolean | null; readonly?: boolean | null }>({});
    const native = document.createElement(tag);
    native.setAttribute('label', 'Native article');
    native.setAttribute('value', '<p>Format this text.</p>');
    native.setAttribute('toolbar', 'bold italic | link');
    native.setAttribute('toolbar-placement', 'bottom');
    native.setAttribute('appearance', 'filled-outlined');
    const nativeContainer = document.createElement('form');
    nativeContainer.append(native);
    document.body.append(nativeContainer);
    onTestFinished(() => nativeContainer.remove());

    const wrapped = mount(
        {
            render: () =>
                h(RichTextEditor, {
                    label: 'Wrapped article',
                    defaultValue: '<p>Format this text.</p>',
                    toolbar: 'bold italic | link',
                    'toolbar-placement': 'bottom',
                    appearance: 'filled-outlined',
                    ...Object.fromEntries(Object.entries(state.value)),
                }),
        },
        'wa-light',
        'block',
    );
    const editor = editorIn(wrapped);
    nativeContainer.style.cssText = wrapped.style.cssText;
    await ready(editor);
    await ready(native);

    for (const mode of ['wa-light', 'wa-dark']) {
        for (const width of [260, 620]) {
            nativeContainer.className = wrapped.className = mode;
            nativeContainer.style.width = wrapped.style.width = `${width}px`;
            for (const selector of [
                '[part~="rich-text-editor"]',
                '[part~="toolbar"]',
                contentPart,
            ]) {
                const actual = part(editor, selector);
                const expected = part(native, selector);
                expect(actual.getBoundingClientRect().width, selector).toBeCloseTo(
                    expected.getBoundingClientRect().width,
                    0,
                );
                expect(actual.getBoundingClientRect().height, selector).toBeCloseTo(
                    expected.getBoundingClientRect().height,
                    0,
                );
                for (const property of [
                    'backgroundColor',
                    'borderColor',
                    'color',
                    'fontFamily',
                    'padding',
                ] as const)
                    expect(getComputedStyle(actual)[property]).toBe(
                        getComputedStyle(expected)[property],
                    );
            }
        }
    }
    for (const control of [native, editor]) {
        control.focus();
        control.selectAll();
        const modifier = navigator.platform.startsWith('Mac') ? 'Meta' : 'Control';
        await userEvent.keyboard(`{${modifier}>}b{/${modifier}}`);
        expect(control.value).toBe('<p><strong>Format this text.</strong></p>');
        expect(control.undo()).toBe(true);
        expect(control.value).toBe('<p>Format this text.</p>');
        expect(control.redo()).toBe(true);
    }
    const nativeFlags = [true, false, null, undefined];
    for (const value of nativeFlags) {
        state.value = value === undefined ? {} : { disabled: value, readonly: value };
        native.toggleAttribute('disabled', value === true);
        native.toggleAttribute('readonly', value === true);
        await ready(native);
        await ready(editor);
        expect(editor.disabled).toBe(native.disabled);
        expect(editor.readonly).toBe(native.readonly);
        expect(part(editor, contentPart).contentEditable).toBe(
            part(native, contentPart).contentEditable,
        );
    }
});

test('RichTextEditor binds a compatible dotted Inertia field, edits and submits Markdown, and handles native validation', async () => {
    const fields = { article: { body: '**Draft**' } };
    const form = useForm(fields);
    const onWaInvalid = vi.fn();
    const container = mount(
        {
            render: () =>
                h(RichTextEditor<typeof fields>, {
                    form,
                    fieldName: 'article.body',
                    name: 'body',
                    label: 'Draft in Markdown',
                    format: 'markdown',
                    defaultValue: 'Original *value*',
                    toolbar: 'bold',
                    minlength: 5,
                    maxlength: 10,
                    required: true,
                    withCount: true,
                    onWaInvalid,
                }),
        },
        'wa-light',
        'block',
    );
    const editor = editorIn(container);
    await ready(editor);
    expect(editor.textValue).toBe('Draft');
    expect(submittedValue(container)).toBe('**Draft**');
    expect(container.checkValidity()).toBe(true);
    await replaceText(editor, 'Too long here');
    await expect.poll(() => form.article.body).toBe('**Too long here**');
    expect(editor.validity.tooLong).toBe(true);
    expect(container.checkValidity()).toBe(false);
    expect(onWaInvalid).toHaveBeenCalled();
    expect(part(editor, '[part~="count"]').textContent).toContain('-3');
    editor.selectAll();
    editor.deleteSelection();
    await expect.poll(() => form.article.body).toBe('');
    expect(editor.validity.valueMissing).toBe(true);
    form.article.body = '*Updated*';
    await ready(editor);
    expect(editor.textValue).toBe('Updated');
    expect(submittedValue(container)).toBe('*Updated*');
    container.reset();
    await expect.poll(() => form.article.body).toBe('Original *value*');
    expect(editor.defaultValue).toBe('Original *value*');
});

for (const mode of ['wa-light', 'wa-dark']) {
    test(`RichTextEditor restores Inertia errors and failed messages in ${mode}`, async () => {
        const fields = { body: '<p>Draft</p>' };
        const form = useForm(fields);
        const failed = ref<boolean | string | readonly string[]>(false);
        const container = mount(
            {
                render: () =>
                    h(
                        RichTextEditor<typeof fields>,
                        {
                            form,
                            field: 'body',
                            name: 'matrix-value',
                            label: 'Article body',
                            hint: 'Caller attribute hint',
                            failed: failed.value,
                            'aria-invalid': 'grammar',
                            'aria-errormessage': 'application-error',
                            'aria-describedby': 'application-description',
                        },
                        {
                            hint: () =>
                                h('span', { 'data-testid': 'caller-hint' }, 'Caller slot hint'),
                        },
                    ),
            },
            mode,
            'block',
        );
        const editor = editorIn(container);
        await exerciseErrors({
            container,
            host: editor,
            failed,
            hasHint: true,
            paints: surface('rich-text-editor'),
            setError: (messages) => form.setError('body', messages),
            clearErrors: () => form.clearErrors(),
            read: () => form.body,
            initial: '<p>Draft</p>',
            userValue: '<p>Changed</p>',
            externalValue: '<p>External</p>',
            setExternal: () => (form.body = '<p>External</p>'),
            interact: (host) => replaceText(host, 'Changed'),
        });
    });
}

test('RichTextEditor forwards suggestions by identity and emits the original typed error when a request rejects', async () => {
    const dataSource =
        vi.fn<NonNullable<RichTextEditorProps['suggestions']>[number]['dataSource']>();
    const formatter = vi.fn((item: { label: string }) => {
        const strong = document.createElement('strong');
        strong.textContent = item.label;
        return strong;
    });
    dataSource.mockReturnValue([{ label: 'Ada', value: 'ada' }]);
    const suggestions = [{ trigger: '@', dataSource, formatter }];
    const onWaSuggestionsError = vi.fn<NonNullable<RichTextEditorProps['onWaSuggestionsError']>>();
    const container = mount(
        {
            render: () =>
                h(RichTextEditor, { label: 'Mentions', suggestions, onWaSuggestionsError }),
        },
        'wa-light',
        'block',
    );
    const editor = editorIn(container);
    const nativeError = vi.fn();
    editor.addEventListener('wa-suggestions-error', nativeError);
    await ready(editor);
    expect(editor.suggestions).toBe(suggestions);
    await userEvent.click(part(editor, contentPart));
    await userEvent.keyboard('@');
    await expect.element(page.getByRole('option', { name: 'Ada' })).toBeVisible();
    expect(dataSource.mock.lastCall?.[0]).toEqual({ query: '', signal: expect.any(AbortSignal) });
    expect(formatter).toHaveBeenCalledWith({ label: 'Ada', value: 'ada' });
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => editor.value).toContain('<span data-mention="ada">Ada</span>');
    const error = new Error('Suggestion source unavailable');
    dataSource.mockRejectedValue(error);
    await userEvent.keyboard(' @');
    await expect
        .poll(() => onWaSuggestionsError.mock.lastCall?.[0].detail)
        .toEqual({
            error,
            request: { trigger: '@', query: '' },
        });
    expect(onWaSuggestionsError.mock.lastCall?.[0]).toBe(nativeError.mock.lastCall?.[0]);
});

test('RichTextEditor preserves provider identity and handles accepted, canceled, and rejected media', async () => {
    const imageProvider = vi.fn<NonNullable<RichTextEditorProps['imageProvider']>>();
    imageProvider
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ src: '/local-image.png', alt: 'Local image' });
    const embedProvider = vi.fn<NonNullable<RichTextEditorProps['embedProvider']>>();
    const embedSrc = new URL('/local-embed.html', location.origin).href;
    embedProvider
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ src: embedSrc, title: 'Local embed', width: 320, height: 180 });
    const textColors = [{ color: 'red', label: 'Red' }];
    const highlightColors = ['yellow'];
    const container = mount(
        {
            render: () =>
                h(RichTextEditor, {
                    label: 'Image input',
                    toolbar: 'image embed color',
                    imageProvider,
                    embedProvider,
                    textColors,
                    highlightColors,
                }),
        },
        'wa-light',
        'block',
    );
    const editor = editorIn(container);
    await ready(editor);
    expect(editor.imageProvider).toBe(imageProvider);
    expect(editor.embedProvider).toBe(embedProvider);
    expect(editor.textColors).toBe(textColors);
    expect(editor.highlightColors).toBe(highlightColors);
    const button = page.getByRole('button', { name: 'Insert image', exact: true });
    await button.click();
    expect(imageProvider).toHaveBeenCalledTimes(1);
    expect(editor.value).toBe('');
    await button.click();
    await expect
        .poll(() => editor.value)
        .toContain('<img src="/local-image.png" alt="Local image">');
    expect(imageProvider).toHaveBeenCalledTimes(2);
    await page.getByRole('button', { name: 'Insert embed', exact: true }).click();
    const input = page.getByRole('textbox', { name: 'Embed URL' });
    const apply = page.getByRole('button', { name: 'Apply', exact: true });
    await input.fill('unknown');
    await apply.click();
    expect(embedProvider).toHaveBeenLastCalledWith('unknown');
    expect(editor.value).not.toContain('<iframe');
    await expect.element(input).toBeVisible();
    await input.fill('local');
    await apply.click();
    expect(embedProvider).toHaveBeenLastCalledWith('local');
    await expect.poll(() => editor.value).toContain(`src="${embedSrc}"`);
    expect(editor.value).toContain('title="Local embed"');
});
