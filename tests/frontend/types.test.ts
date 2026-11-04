import { expectTypeOf, test } from 'vite-plus/test';
import { defineComponent } from 'vue';
import { createFrontAwesome, useToast } from '@artisan-toolbox/front-awesome';
import type {
    FlashToastOptions,
    FrontAwesomeOptions,
    ToastIconOptions,
    ToastOptions,
    ToastService,
} from '@artisan-toolbox/front-awesome';

test('exposes the plugin and toast types from the package entry point', () => {
    expectTypeOf(createFrontAwesome).parameter(0).toEqualTypeOf<FrontAwesomeOptions | undefined>();
    expectTypeOf<FrontAwesomeOptions['flashToast']>().toEqualTypeOf<
        FlashToastOptions | undefined
    >();
    expectTypeOf(useToast).returns.toEqualTypeOf<ToastService>();
    expectTypeOf<ToastOptions['icon']>().toEqualTypeOf<string | ToastIconOptions | undefined>();
    expectTypeOf<ToastOptions['size']>().toEqualTypeOf<'xs' | 's' | 'm' | 'l' | 'xl' | undefined>();

    defineComponent({
        methods: {
            notify() {
                expectTypeOf(this.$frontAwesome.toast).toEqualTypeOf<ToastService>();
                expectTypeOf(this.$frontAwesome.toast.show)
                    .parameter(1)
                    .toEqualTypeOf<ToastOptions | undefined>();
            },
        },
    });
});
