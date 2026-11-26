import { MaskedInput } from '@artisan-toolbox/front-awesome';
import MaskedInputSubpath from '@artisan-toolbox/front-awesome/components/MaskedInput.vue';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { expect, test } from 'vite-plus/test';

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
