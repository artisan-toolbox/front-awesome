import { expectTypeOf, test } from 'vite-plus/test';
import { defineComponent } from 'vue';
import Button from '@artisan-toolbox/front-awesome/components/Button.vue';
import ButtonGroup from '@artisan-toolbox/front-awesome/components/ButtonGroup.vue';
import Icon from '@artisan-toolbox/front-awesome/components/WebAwesome/Icon.vue';
import Appearance from '@artisan-toolbox/front-awesome/components/Appearance.vue';
import type { AppearancePreference as ComponentAppearancePreference } from '@artisan-toolbox/front-awesome/components';
import type {
    WaButtonGroupProps,
    WaButtonProps,
    WaIconProps,
} from '@awesome.me/webawesome/dist/custom-elements-jsx.d.ts';
import { createFrontAwesome, useToast } from '@artisan-toolbox/front-awesome';
import type {
    AppearancePreference,
    FlashToastOptions,
    FrontAwesomeOptions,
    ToastIconOptions,
    ToastOptions,
    ToastService,
    IconProps,
} from '@artisan-toolbox/front-awesome';

test('derives the Icon contract and native event types from Web Awesome', () => {
    type Attributes = InstanceType<typeof Icon>['$props'];
    type ComponentProps = import('@artisan-toolbox/front-awesome/components').IconProps;
    type WebAwesomeProps = import('@artisan-toolbox/front-awesome/components/WebAwesome').IconProps;
    expectTypeOf<ComponentProps>().toEqualTypeOf<IconProps>();
    expectTypeOf<WebAwesomeProps>().toEqualTypeOf<IconProps>();
    expectTypeOf<Partial<Attributes>>().toMatchTypeOf<Attributes>();
    expectTypeOf<Attributes['canvas']>().toEqualTypeOf<WaIconProps['canvas']>();
    expectTypeOf<Attributes['flip']>().toEqualTypeOf<WaIconProps['flip']>();
    expectTypeOf<Attributes['animation']>().toEqualTypeOf<WaIconProps['animation']>();
    expectTypeOf<Attributes['rotate']>().toEqualTypeOf<WaIconProps['rotate']>();
    expectTypeOf<Attributes['onWaLoad']>().toEqualTypeOf<WaIconProps['onwa-load']>();
    expectTypeOf<Attributes['onWaError']>().toEqualTypeOf<WaIconProps['onwa-error']>();
    expectTypeOf<Attributes['autoWidth']>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<Attributes['auto-width']>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<Attributes['swapOpacity']>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<Attributes['swap-opacity']>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<
        Extract<
            keyof Attributes,
            | 'did-ssr'
            | 'didSSR'
            | 'initialReflectedProperties'
            | 'internals'
            | 'onwa-load'
            | 'onwa-error'
        >
    >().toBeNever();
    const custom = {
        name: 'home',
        src: '/fallback.svg',
        family: 'custom-family',
        variant: 'custom-variant',
        library: 'custom-library',
        class: 'caller',
        style: { color: 'purple' },
        slot: 'start',
    } satisfies IconProps;
    // @ts-expect-error The upstream canvas union rejects unknown layouts.
    const canvas: IconProps = { canvas: 'wide' };
    // @ts-expect-error Flip only accepts the upstream axes.
    const flip: IconProps = { flip: 'vertical' };
    // @ts-expect-error Animation values come from Web Awesome.
    const animation: IconProps = { animation: 'shuffle' };
    // @ts-expect-error Rotation is numeric.
    const rotate: IconProps = { rotate: '45' };
    // @ts-expect-error Native load events do not promise a detail payload.
    const event: IconProps = { onWaLoad: (_event: CustomEvent<string>) => {} };
    void [custom, canvas, flip, animation, rotate, event];
});

test('exposes appearance preferences, plugin options, and the typed slot consistently', () => {
    type AppearanceSlot = Parameters<InstanceType<typeof Appearance>['$slots']['default']>[0];

    expectTypeOf<AppearancePreference>().toEqualTypeOf<'system' | 'light' | 'dark'>();
    expectTypeOf<ComponentAppearancePreference>().toEqualTypeOf<AppearancePreference>();
    expectTypeOf<FrontAwesomeOptions['appearance']>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<AppearanceSlot['appearance']>().toEqualTypeOf<AppearancePreference>();
    expectTypeOf<Extract<keyof AppearanceSlot, 'theme'>>().toBeNever();
    expectTypeOf<Extract<keyof FrontAwesomeOptions, 'theme'>>().toBeNever();
});

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

test('derives Input options from Web Awesome and enforces a single typed text source', () => {
    type Data = {
        name: string;
        users: { name: string | null }[];
        count: number;
        profile: { name: string };
    };
    type Attributes = import('@artisan-toolbox/front-awesome').InputAttributes;
    type Props = import('@artisan-toolbox/front-awesome').InputProps<Data>;
    type Upstream = import('@awesome.me/webawesome/dist/custom-elements-jsx.d.ts').WaInputProps;
    expectTypeOf<Attributes['type']>().toEqualTypeOf<Upstream['type']>();
    expectTypeOf<Attributes['size']>().toEqualTypeOf<Upstream['size']>();
    expectTypeOf<Attributes['appearance']>().toEqualTypeOf<Upstream['appearance']>();
    expectTypeOf<Attributes['autocorrect']>().toEqualTypeOf<Upstream['autocorrect']>();
    expectTypeOf<Attributes['onWaClear']>().toEqualTypeOf<Upstream['onwa-clear']>();
    expectTypeOf<Extract<keyof Attributes, 'input' | 'internals' | 'states'>>().toBeNever();
    const model = { modelValue: 'Ada' } satisfies Props;
    // @ts-expect-error A binding source is required.
    const missing: Props = { label: 'Name' };
    // @ts-expect-error A native value competes with the controlled source.
    const native: Props = { modelValue: 'Ada', value: 'Grace' };
    // @ts-expect-error Inertia metadata is not a user data field.
    const metadata: import('@artisan-toolbox/front-awesome').TextFieldName<Data> = 'processing';
    // @ts-expect-error Number leaves are not text control sources.
    const number: import('@artisan-toolbox/front-awesome').TextFieldName<Data> = 'count';
    // @ts-expect-error Container fields are not text control sources.
    const container: import('@artisan-toolbox/front-awesome').TextFieldName<Data> = 'profile';
    expectTypeOf(model.modelValue).toBeString();
    void [missing, native, metadata, number, container];
});

test('derives Tag and Tooltip props and original native events without implementation fields', () => {
    type TagProps = import('@artisan-toolbox/front-awesome').TagProps;
    type TooltipProps = import('@artisan-toolbox/front-awesome').TooltipProps;
    type TagAttributes = InstanceType<
        typeof import('@artisan-toolbox/front-awesome/components/WebAwesome/Tag.vue').default
    >['$props'];
    type TooltipInstance = InstanceType<
        typeof import('@artisan-toolbox/front-awesome/components/WebAwesome/Tooltip.vue').default
    >;
    type TooltipAttributes = TooltipInstance['$props'];
    type NativeTag = import('@awesome.me/webawesome/dist/custom-elements-jsx.d.ts').WaTagProps;
    type NativeTooltip =
        import('@awesome.me/webawesome/dist/custom-elements-jsx.d.ts').WaTooltipProps;
    expectTypeOf<
        import('@artisan-toolbox/front-awesome/components').TagProps
    >().toEqualTypeOf<TagProps>();
    expectTypeOf<
        import('@artisan-toolbox/front-awesome/components/WebAwesome').TagProps
    >().toEqualTypeOf<TagProps>();
    expectTypeOf<
        import('@artisan-toolbox/front-awesome/components').TooltipProps
    >().toEqualTypeOf<TooltipProps>();
    expectTypeOf<
        import('@artisan-toolbox/front-awesome/components/WebAwesome').TooltipProps
    >().toEqualTypeOf<TooltipProps>();
    expectTypeOf<TagAttributes['variant']>().toEqualTypeOf<NativeTag['variant']>();
    expectTypeOf<TagAttributes['appearance']>().toEqualTypeOf<NativeTag['appearance']>();
    expectTypeOf<TagAttributes['size']>().toEqualTypeOf<NativeTag['size']>();
    expectTypeOf<TagAttributes['with-remove']>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<TagAttributes['onWaRemove']>().toEqualTypeOf<NativeTag['onwa-remove']>();
    expectTypeOf<TooltipAttributes['placement']>().toEqualTypeOf<NativeTooltip['placement']>();
    expectTypeOf<TooltipAttributes['for']>().toEqualTypeOf<string | null | undefined>();
    expectTypeOf<TooltipAttributes['showDelay']>().toEqualTypeOf<NativeTooltip['showDelay']>();
    expectTypeOf<TooltipAttributes['show-delay']>().toEqualTypeOf<NativeTooltip['show-delay']>();
    expectTypeOf<TooltipAttributes['hideDelay']>().toEqualTypeOf<NativeTooltip['hideDelay']>();
    expectTypeOf<TooltipAttributes['hide-delay']>().toEqualTypeOf<NativeTooltip['hide-delay']>();
    expectTypeOf<TooltipAttributes['without-arrow']>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<TooltipAttributes['onWaShow']>().toEqualTypeOf<NativeTooltip['onwa-show']>();
    expectTypeOf<TooltipAttributes['onWaAfterShow']>().toEqualTypeOf<
        NativeTooltip['onwa-after-show']
    >();
    expectTypeOf<TooltipAttributes['onWaHide']>().toEqualTypeOf<NativeTooltip['onwa-hide']>();
    expectTypeOf<TooltipAttributes['onWaAfterHide']>().toEqualTypeOf<
        NativeTooltip['onwa-after-hide']
    >();
    expectTypeOf<
        Extract<
            keyof TagAttributes,
            'did-ssr' | 'didSSR' | 'internals' | 'initialReflectedProperties' | 'onwa-remove'
        >
    >().toBeNever();
    expectTypeOf<
        Extract<
            keyof TooltipAttributes,
            | 'did-ssr'
            | 'didSSR'
            | 'internals'
            | 'initialReflectedProperties'
            | 'defaultSlot'
            | 'body'
            | 'popup'
            | 'anchor'
            | 'content'
            | 'onwa-show'
            | 'onwa-after-show'
            | 'onwa-hide'
            | 'onwa-after-hide'
        >
    >().toBeNever();
    expectTypeOf<Extract<keyof TooltipInstance, 'show' | 'hide'>>().toBeNever();
    const tag = {
        pill: true,
        'with-remove': true,
        onWaRemove: (event: Event) => event.preventDefault(),
    } satisfies TagProps;
    const tooltip = {
        for: 'target',
        showDelay: 0,
        'hide-delay': 25,
        withoutArrow: false,
    } satisfies TooltipProps;
    // @ts-expect-error Tag variants retain the upstream union.
    const variant: TagProps = { variant: 'custom' };
    // @ts-expect-error Tooltip placement retains the upstream union.
    const placement: TooltipProps = { placement: 'center' };
    // @ts-expect-error Tooltip delays are numeric.
    const delay: TooltipProps = { showDelay: '150' };
    // @ts-expect-error Default slot content supplies the body.
    const content: TooltipProps = { content: 'Help' };
    // @ts-expect-error Native events do not promise a detail payload.
    const event: TooltipProps = { onWaShow: (_event: CustomEvent<string>) => {} };
    void [tag, tooltip, variant, placement, delay, content, event];
});
