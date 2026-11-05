import { expectTypeOf, test } from 'vite-plus/test';
import { defineComponent } from 'vue';
import Button from '@artisan-toolbox/front-awesome/components/Button.vue';
import ButtonGroup from '@artisan-toolbox/front-awesome/components/ButtonGroup.vue';
import type {
    WaButtonGroupProps,
    WaButtonProps,
} from '@awesome.me/webawesome/dist/custom-elements-jsx.d.ts';
import { createFrontAwesome, useToast } from '@artisan-toolbox/front-awesome';
import type {
    FlashToastOptions,
    FrontAwesomeOptions,
    ToastIconOptions,
    ToastOptions,
    ToastService,
} from '@artisan-toolbox/front-awesome';

test('uses Web Awesome option types for the Vue wrappers', () => {
    type ButtonAttributes = InstanceType<typeof Button>['$props'];
    type GroupAttributes = InstanceType<typeof ButtonGroup>['$props'];

    expectTypeOf<Partial<ButtonAttributes>>().toMatchTypeOf<ButtonAttributes>();
    expectTypeOf<Partial<GroupAttributes>>().toMatchTypeOf<GroupAttributes>();
    expectTypeOf<Extract<keyof ButtonAttributes, 'button' | 'internals'>>().toBeNever();
    expectTypeOf<Extract<keyof GroupAttributes, 'defaultSlot' | 'internals'>>().toBeNever();
    expectTypeOf<ButtonAttributes['form']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<ButtonAttributes['appearance']>().toEqualTypeOf<WaButtonProps['appearance']>();
    expectTypeOf<ButtonAttributes['variant']>().toEqualTypeOf<WaButtonProps['variant']>();
    expectTypeOf<ButtonAttributes['with-caret']>().toEqualTypeOf<WaButtonProps['with-caret']>();
    expectTypeOf<GroupAttributes['orientation']>().toEqualTypeOf<
        WaButtonGroupProps['orientation']
    >();
});

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
