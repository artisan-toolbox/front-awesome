import { createCommentVNode, Fragment } from 'vue';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { expect, test } from 'vite-plus/test';
import Checkbox from '@artisan-toolbox/front-awesome/components/WebAwesome/Checkbox.vue';
import Textarea from '@artisan-toolbox/front-awesome/components/WebAwesome/Textarea.vue';
import Select from '@artisan-toolbox/front-awesome/components/WebAwesome/Select.vue';
import TagInput from '@artisan-toolbox/front-awesome/components/WebAwesome/TagInput.vue';

async function render(component: Parameters<typeof h>[0], attrs: Record<string, unknown> = {}) {
    return renderToString(createSSRApp({ render: () => h(component, attrs) }));
}

test.each([
    { name: 'Select', component: Select, options: { multiple: true, options: ['one', 'two'] } },
    { name: 'TagInput', component: TagInput, options: {} },
])(
    'rejects a sparse $name model before assigning it to the native control',
    async ({ component, options }) => {
        const value = ['one', 'two'];
        Reflect.deleteProperty(value, '0');
        await expect(
            render(component, { ...options, modelValue: value, 'onUpdate:modelValue': () => {} }),
        ).rejects.toThrow('unsupported value');
    },
);

test('renders absent defaults without adding classes, styles or boolean values', async () => {
    expect(await render(Checkbox)).toBe('<wa-checkbox><!--[--><!--]--></wa-checkbox>');
    const html = await render(Checkbox, { checked: '', disabled: false, required: true });
    expect(html).toContain(' checked');
    expect(html).toContain(' required');
    expect(html).not.toContain('disabled');
    expect(html).not.toContain('class');
    expect(html).not.toContain('style');
});

test('renders explicit defaults separately from deferred current properties', async () => {
    const html = await render(Textarea, {
        value: 'Current',
        defaultValue: 'Reset',
        autocorrect: false,
        spellcheck: 'false',
    });
    expect(html).toContain('value="Reset"');
    expect(html).not.toContain('Current');
    expect(html).toContain('autocorrect="off"');
    expect(html).toContain('spellcheck="false"');
    expect(await render(Checkbox, { checked: true, defaultChecked: false })).not.toContain(
        ' checked',
    );
});

test('renders data-driven options and ignores the Select default slot during SSR', async () => {
    const html = await renderToString(
        createSSRApp({
            render: () =>
                h(
                    Select,
                    {
                        value: ['one'],
                        getTag: () => 'One',
                        grouped: true,
                        options: [
                            { label: 'Group heading', options: [{ value: 'one', label: 'One' }] },
                            { label: 'Empty group', options: [] },
                        ],
                        optionValue: 'value',
                        optionLabel: 'label',
                    },
                    {
                        default: () => [h('wa-option', { value: 'ignored' }, 'Ignored')],
                    },
                ),
        }),
    );
    expect(html).toMatch(/<wa-select\b[^>]*>[\s\S]*<wa-option\b[^>]*value="one"/);
    expect(html).toMatch(/<small\b[^>]*>Group heading<\/small>/);
    expect(html.match(/<small\b/g)).toHaveLength(1);
    expect(html.match(/<wa-option\b/g)).toHaveLength(1);
    expect(html).not.toContain('ignored');
    expect(html).not.toContain('get-tag');
    expect(html).not.toContain('getTag');
});

test('rejects flat options and invalid group labels in grouped mode at runtime', async () => {
    const message =
        'Grouped options must contain objects with an options array and an optional string label.';
    await expect(render(Select, { grouped: true, options: ['Vue'] })).rejects.toThrow(message);
    await expect(
        render(Select, { grouped: true, options: [{ label: 1, options: ['Vue'] }] }),
    ).rejects.toThrow(message);
});

test('rejects conflicting aliases while accepting equivalent aliases', async () => {
    await expect(
        render(Checkbox, { defaultChecked: true, 'default-checked': false }),
    ).rejects.toThrow('conflicting aliases');
    expect(await render(Checkbox, { defaultChecked: true, 'default-checked': true })).toContain(
        ' checked',
    );
});

test('does not turn conditional empty named slots into assigned elements that suppress fallback content', async () => {
    const app = createSSRApp({
        render: () =>
            h(Checkbox, { hint: 'Fallback hint' }, { hint: () => createCommentVNode('v-if') }),
    });
    const html = await renderToString(app);
    expect(html).toContain('hint="Fallback hint"');
    expect(html).not.toContain('slot="hint"');
    expect(html).toContain('<!--v-if-->');
});

test('preserves mixed fragment text and functional content in Vue named slots', async () => {
    const Hint = () => h('small', 'Functional hint');
    const html = await renderToString(
        createSSRApp({
            render: () =>
                h(
                    Checkbox,
                    {},
                    {
                        hint: () => h(Fragment, null, [0, ' hints ', null, false, h(Hint)]),
                    },
                ),
        }),
    );
    expect(html).toContain('<span slot="hint">0</span>');
    expect(html).toContain('<span slot="hint"> hints </span>');
    expect(html).toContain('<span slot="hint"><small>Functional hint</small></span>');
    expect(html).not.toContain('null');
    expect(html).not.toContain('false');
});
