import { createFrontAwesome, MaskedInput, useMaskTemplate } from '@artisan-toolbox/front-awesome';
import MaskedInputSubpath from '@artisan-toolbox/front-awesome/components/MaskedInput.vue';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { expect, test } from 'vite-plus/test';
import MaskTemplatesGlobal from './MaskTemplatesGlobal.vue';

test('makes the same mask catalog available to Options API and templates', async () => {
    const app = createSSRApp(MaskTemplatesGlobal).use(createFrontAwesome());

    expect(app.config.globalProperties.$maskTemplates).toBe(useMaskTemplate());
    expect(app.config.globalProperties.$maskTemplates.Brazilian).toBe(useMaskTemplate().brazilian);
    const html = await renderToString(app);
    expect(html).toMatch(/<wa-input(?=[^>]*label="CPF")(?=[^>]*value="012\.345\.678-90")[^>]*>/);
    expect(html).toMatch(/<wa-input(?=[^>]*label="Postal code")(?=[^>]*value="01\.310-100")[^>]*>/);
});

test('renders one labeled Web Awesome field with the initial formatted value during SSR', async () => {
    expect(MaskedInputSubpath).toBe(MaskedInput);

    const html = await renderToString(
        createSSRApp({
            render: () =>
                h(MaskedInputSubpath, {
                    mask: '#####-###',
                    modelValue: '01310100',
                    defaultValue: '04000000',
                    'onUpdate:modelValue': () => {},
                    label: 'Postal code',
                    name: 'postal_code',
                    form: 'address',
                    guide: 'always',
                }),
        }),
    );

    expect(html.match(/<wa-input\b/g)).toHaveLength(1);
    expect(html).toContain('label="Postal code"');
    expect(html).toMatch(
        /<wa-input(?=[^>]*name="postal_code")(?=[^>]*form="address")(?=[^>]*value="01310-100")[^>]*>/,
    );
});
