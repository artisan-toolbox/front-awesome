import { expectTypeOf, test } from 'vite-plus/test';
import type {
    KnownDateProps,
    CheckboxProps,
    SelectProps,
    TextareaProps,
    PopupProps,
    RatingProps,
    TagInputProps,
    NumberInputProps,
    AnimationProps,
} from '@artisan-toolbox/front-awesome';
import type * as Elements from '@artisan-toolbox/front-awesome/components/WebAwesome';
import type WaSelect from '@awesome.me/webawesome/dist/components/select/select.js';
import type WaCheckbox from '@awesome.me/webawesome/dist/components/checkbox/checkbox.js';

test('keeps native unions and value domains optional and hides implementation state', () => {
    expectTypeOf<{}>().toExtend<CheckboxProps>();
    expectTypeOf<CheckboxProps['checked']>().toEqualTypeOf<WaCheckbox['checked'] | undefined>();
    expectTypeOf<SelectProps['value']>().toEqualTypeOf<WaSelect['value'] | undefined>();
    expectTypeOf<
        Extract<keyof CheckboxProps, '_checked' | 'internals' | 'didSSR' | 'states' | 'input'>
    >().toBeNever();
    expectTypeOf<Elements.CheckboxProps>().toEqualTypeOf<CheckboxProps>();
    const checkbox = {
        checked: false,
        form: 'profile',
        'custom-error': null,
    } satisfies CheckboxProps;
    const select = { multiple: true, value: ['one', 'two'] } satisfies SelectProps;
    const enumerated = { autocorrect: 'off', spellcheck: 'false' } satisfies TextareaProps;
    void enumerated;
    const text = { value: null, resize: 'auto' } satisfies TextareaProps;
    const numeric = { value: '2.5', step: 'any' } satisfies NumberInputProps;
    const tags = { value: ['one', 'two'] } satisfies TagInputProps;
    const date = {
        value: new Date(2026, 10, 9),
    } satisfies KnownDateProps;
    const time = {
        value: new Date(2026, 10, 9, 14, 30),
    } satisfies import('@artisan-toolbox/front-awesome').TimeInputProps;
    const tagForm = { value: new FormData() } satisfies TagInputProps;
    const numericRadio = {
        value: 3,
    } satisfies import('@artisan-toolbox/front-awesome').RadioGroupProps;
    const clearedSlider = {
        value: null,
    } satisfies import('@artisan-toolbox/front-awesome').SliderProps;
    const readOnly: KnownDateProps = {
        // @ts-expect-error The native date observation is not an assignable input.
        valueAsDate: new Date(),
    };
    void [date, time, tagForm, numericRadio, clearedSlider, readOnly];
    const animation = { keyframes: [{ opacity: 0 }, { opacity: 1 }] } satisfies AnimationProps;
    // @ts-expect-error Native select values are strings or string arrays.
    const invalidValue: SelectProps = { value: 3 };
    // @ts-expect-error Native textarea resize retains its literal union.
    const invalidResize: TextareaProps = { resize: 'diagonal' };
    // @ts-expect-error Presence booleans do not accept arbitrary strings.
    const invalidBoolean: CheckboxProps = { disabled: 'false' };
    // @ts-expect-error Internal queried elements are not component inputs.
    const invalidInternal: CheckboxProps = { input: null };
    // @ts-expect-error Popup placement keeps the upstream union.
    const invalidPlacement: PopupProps = { placement: 'middle' };
    // @ts-expect-error Rating callback keeps the upstream numeric argument.
    const invalidCallback: RatingProps = { getSymbol: (_value: string) => '' };
    void [
        checkbox,
        select,
        text,
        numeric,
        tags,
        animation,
        invalidValue,
        invalidResize,
        invalidBoolean,
        invalidInternal,
        invalidPlacement,
        invalidCallback,
    ];
});
