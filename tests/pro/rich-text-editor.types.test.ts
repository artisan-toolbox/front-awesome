import { expectTypeOf, test } from 'vite-plus/test';
import type { RichTextEditorProps } from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
import type WaRichTextEditor from '@web.awesome.me/webawesome-pro/dist/components/rich-text-editor/rich-text-editor.js';
import type { WaSuggestionsErrorEvent } from '@web.awesome.me/webawesome-pro/dist/events/suggestions-error.js';

test('RichTextEditor exposes editable values and native callback contracts', () => {
    expectTypeOf<RichTextEditorProps['value']>().toEqualTypeOf<string | null | undefined>();
    expectTypeOf<RichTextEditorProps['defaultValue']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<RichTextEditorProps['onUpdate:modelValue']>().toEqualTypeOf<
        ((value: string) => void) | undefined
    >();
    expectTypeOf<NonNullable<RichTextEditorProps['suggestions']>>().toEqualTypeOf<
        NonNullable<WaRichTextEditor['suggestions']>
    >();
    expectTypeOf<Extract<RichTextEditorProps['suggestions'], undefined>>().toBeUndefined();
    expectTypeOf<RichTextEditorProps['onWaSuggestionsError']>().toEqualTypeOf<
        ((event: WaSuggestionsErrorEvent) => void) | undefined
    >();
    expectTypeOf<
        Extract<
            keyof RichTextEditorProps,
            'view' | 'dirty' | 'runCommand' | 'contentElement' | 'internals' | 'onType'
        >
    >().toBeNever();
});
