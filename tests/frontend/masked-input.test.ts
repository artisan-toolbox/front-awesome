import { describe, expect, it } from 'vite-plus/test';
import { editMask, formatMask } from '../../resources/js/masked-input/mask';
import type { MaskOptions } from '../../resources/js/masked-input/mask';

describe('masked input', () => {
    it('uses punctuation to disambiguate preformatted values with the same editable characters', () => {
        const options = { mask: ['##-##', '##.##'] };
        expect(formatMask('0123', options).formatted).toBe('01-23');
        expect(formatMask('01.23', options, 'formatted')).toMatchObject({
            raw: '0123',
            formatted: '01.23',
            complete: true,
        });
    });

    it('distinguishes raw data, formatted values and the visible guide', () => {
        const options: MaskOptions = {
            mask: '(##) ##',
            prefix: '+55 ',
            suffix: ' ext',
            guide: 'focus',
            guideChar: '·',
        };
        expect(formatMask('', options)).toMatchObject({
            raw: '',
            formatted: '',
            display: '',
            complete: false,
        });
        expect(formatMask('', options, 'raw', true).display).toBe('+55 (··) ·· ext');
        expect(formatMask('123', options, 'raw', true)).toMatchObject({
            raw: '123',
            formatted: '+55 (12) 3 ext',
            display: '+55 (12) 3· ext',
            complete: false,
        });
        expect(formatMask('+55 (12) 34 ext', options, 'formatted')).toMatchObject({
            raw: '1234',
            formatted: '+55 (12) 34 ext',
            complete: true,
        });
    });

    it('supports escaped literal tokens, named definitions and position-specific restrictions', () => {
        const flags = /[1-3]/gy;
        flags.lastIndex = 2;
        expect(formatMask('x321', { mask: '\\#TT-T', tokens: { T: flags } })).toMatchObject({
            raw: '321',
            formatted: '#32-1',
            complete: true,
        });
        expect(flags.lastIndex).toBe(2);
        const options: MaskOptions = {
            mask: {
                parts: [
                    'CPU ',
                    /[1-2]/,
                    { accept: /[A-Z]/, transform: (char) => char.toUpperCase() },
                    '-',
                    /[\p{L}]/u,
                ],
            },
        };
        expect(formatMask('90x2ßz猫', options)).toMatchObject({
            raw: '2Z猫',
            formatted: 'CPU 2Z-猫',
            complete: true,
        });
        expect(formatMask('12', { mask: { parts: [/(?:|1)/, /2/] } }).raw).toBe('12');
    });

    it('reserves required positions and validates every cell in an activated optional group', () => {
        expect(formatMask('1', { mask: '[#]#' })).toMatchObject({ raw: '1', complete: true });
        const options = { mask: '##[-AA[.##]]' };
        expect(formatMask('12', options)).toMatchObject({ formatted: '12', complete: true });
        expect(formatMask('12x', options)).toMatchObject({ formatted: '12-x', complete: false });
        expect(formatMask('12xy', options)).toMatchObject({ formatted: '12-xy', complete: true });
        expect(formatMask('12xy1', options)).toMatchObject({
            formatted: '12-xy.1',
            complete: false,
        });
        const structured = { mask: { parts: [/[A-Z]/, { optional: ['/', /[0-9]/, /[0-9]/] }] } };
        expect(formatMask('X1', structured)).toMatchObject({ formatted: 'X/1', complete: false });
    });

    it('normalizes named tokens in every CNPJ position and picks up changes to the rule', () => {
        const alphanumeric = {
            accept: /[A-Z0-9]/,
            transform: (char: string) => char.toUpperCase(),
        };
        const options = {
            mask: ['###.###.###-##', 'XX.XXX.XXX/XXXX-##'],
            tokens: { X: alphanumeric },
        };
        expect(formatMask('00.000.000/e08g-12', options, 'formatted')).toMatchObject({
            raw: '00000000E08G12',
            formatted: '00.000.000/E08G-12',
            complete: true,
        });
        alphanumeric.transform = (char) => char.toLowerCase();
        alphanumeric.accept = /[a-z0-9]/;
        expect(formatMask('00.000.000/E08G-12', options, 'formatted').raw).toBe('00000000e08g12');
    });

    it('chooses the first best candidate again after a paste or a deletion', () => {
        const options = { mask: ['##-##', '###/##'] };
        const previous = formatMask('1234', options);
        expect(previous.formatted).toBe('12-34');
        const longer = editMask(
            previous,
            { selection: [5, 5], data: '5', inputType: 'insertText' },
            options,
        );
        expect(longer.state.formatted).toBe('123/45');
        expect(longer.caret).toBe(6);
        expect(
            editMask(
                longer.state,
                { selection: [6, 6], inputType: 'deleteContentBackward' },
                options,
            ).state.formatted,
        ).toBe('12-34');
        expect(
            editMask(
                previous,
                { selection: [0, 5], data: '987/65', inputType: 'insertFromPaste' },
                options,
            ).state.raw,
        ).toBe('98765');
    });

    it('passes the untruncated proposed value and the previous selection to a live resolver', () => {
        const observations: unknown[] = [];
        const options: MaskOptions = {
            mask: (proposed, context) => {
                observations.push([proposed, context]);
                return proposed.length > 2 ? '##-#' : '##';
            },
        };
        const prior = formatMask('12', options);
        expect(
            editMask(prior, { selection: [2, 2], inputType: 'insertText', data: '3' }, options)
                .state.formatted,
        ).toBe('12-3');
        expect(observations.at(-1)).toEqual([
            '123',
            { raw: '12', formatted: '12', selection: [2, 2] },
        ]);
    });

    it('maps UTF-16 browser offsets to raw Unicode code points around literals and affixes', () => {
        const options: MaskOptions = {
            mask: 'A-A#',
            prefix: '📌',
            suffix: '🚀',
            guide: 'always',
            guideChar: '◻',
        };
        const prior = formatMask('𐐀é5', options);
        expect(prior.display).toBe('📌𐐀-é5🚀');
        const backspace = editMask(
            prior,
            { selection: [5, 5], inputType: 'deleteContentBackward' },
            options,
        );
        expect(backspace.state.raw).toBe('é5');
        const replacement = editMask(
            prior,
            { selection: [2, 4], inputType: 'insertText', data: '𐐁' },
            options,
        );
        expect(replacement).toMatchObject({ state: { display: '📌𐐁-é5🚀' }, caret: 5 });
        const forward = editMask(
            prior,
            { selection: [4, 4], inputType: 'deleteContentForward' },
            options,
        );
        expect(forward.state.raw).toBe('𐐀5');
    });

    it('preserves a selection on rejected input and protects literals while editing', () => {
        const options = { mask: '##-##' };
        const prior = formatMask('1234', options);
        expect(
            editMask(prior, { selection: [1, 4], data: 'x', inputType: 'insertText' }, options)
                .state.raw,
        ).toBe('1234');
        expect(
            editMask(prior, { selection: [1, 4], data: '9', inputType: 'insertText' }, options),
        ).toMatchObject({ state: { formatted: '19-4' }, caret: 3 });
        expect(
            editMask(prior, { selection: [2, 3], inputType: 'deleteByCut' }, options).state.raw,
        ).toBe('1234');
        expect(
            editMask(prior, { selection: [3, 3], inputType: 'deleteContentBackward' }, options)
                .state.formatted,
        ).toBe('13-4');
        expect(
            editMask(prior, { selection: [2, 2], inputType: 'deleteContentForward' }, options).state
                .formatted,
        ).toBe('12-4');
    });

    it('overwrites accepted characters while ignoring paste noise, affixes and literals', () => {
        const options: MaskOptions = { mask: '##-##', prefix: '$', suffix: ' kg' };
        const prior = formatMask('1234', options);
        const edit = { selection: [2, 2] as const, inputType: 'insertFromPaste', data: '$x9 kg' };
        expect(editMask(prior, edit, options).state.raw).toBe('1923');
        expect(editMask(prior, edit, { ...options, overwrite: true }).state.raw).toBe('1934');
        expect(
            editMask(
                prior,
                { selection: [0, 9], inputType: 'insertFromPaste', data: '$98-76 kg' },
                options,
            ).state.raw,
        ).toBe('9876');
        expect(formatMask('3124', { mask: '#12#' }, 'formatted').raw).toBe('34');
        expect(formatMask('31', { mask: '#12#' }, 'raw').formatted).toBe('3121');
    });

    it('recompiles changed named definitions, structured cells and nested optional groups', () => {
        const tokens = { T: /[0-9]/ };
        const options = { mask: 'T', tokens };
        expect(formatMask('q', options).raw).toBe('');
        tokens.T = /[a-z]/;
        expect(formatMask('q', options).raw).toBe('q');
        const token = { accept: /[0-9]/ };
        const group = { optional: [/y/] };
        const parts = [token, group];
        const structured = { mask: { parts } };
        expect(formatMask('2y', structured).raw).toBe('2y');
        group.optional = [/x/];
        token.accept = /[A-Z]/;
        expect(formatMask('Ax', structured).raw).toBe('Ax');
        structured.mask.parts = [token];
        expect(formatMask('Ax', structured).raw).toBe('A');
    });

    it('restores the caret to an emptied letter cell and retains digits under overwrite', () => {
        const options: MaskOptions = { mask: 'AA-##', guide: 'always', overwrite: true };
        const initial = formatMask('AB12', options);
        const cleared = editMask(initial, { selection: [1, 2], inputType: 'deleteByCut' }, options);
        expect(cleared).toMatchObject({
            state: { display: 'A_-12', formatted: 'A-12', raw: 'A12', complete: false },
            caret: 1,
        });
        const filled = editMask(
            cleared.state,
            { selection: [1, 1], inputType: 'insertText', data: 'C' },
            options,
        );
        expect(filled.state).toMatchObject({ formatted: 'AC-12', raw: 'AC12', complete: true });
        expect(formatMask(cleared.state.formatted, options, 'formatted').display).toBe('A_-12');
    });

    it('resolves the final value length after overwriting a digit', () => {
        const options: MaskOptions = {
            mask: (proposed) => (proposed.length > 2 ? '#-##' : '##'),
            overwrite: true,
        };
        const initial = formatMask('12', options);
        const overwritten = editMask(
            initial,
            { selection: [1, 1], inputType: 'insertText', data: '9' },
            options,
        );
        expect(overwritten.state).toMatchObject({ formatted: '19', complete: true });
    });

    it('keeps the middle of a mixed mask when the same token occurs again after it', () => {
        const options: MaskOptions = { mask: 'AA-##-AA', guide: 'always', overwrite: true };
        const initial = formatMask('AB12CD', options);
        const deleted = editMask(initial, { selection: [1, 2], inputType: 'deleteByCut' }, options);
        expect(deleted).toMatchObject({
            state: { raw: 'A12CD', display: 'A_-12-CD', complete: false },
            caret: 1,
        });
        expect(formatMask(deleted.state.raw, options).display).toBe('A_-12-CD');
        const filled = editMask(
            deleted.state,
            { selection: [1, 1], inputType: 'insertText', data: 'Z' },
            options,
        );
        expect(filled.state.raw).toBe('AZ12CD');
    });

    it('edits around earlier guide holes without overwriting an unrelated cell', () => {
        const options: MaskOptions = { mask: 'AAA-##-AA', guide: 'always', overwrite: true };
        const initial = formatMask('A12CD', options);
        expect(initial.display).toBe('A__-12-CD');
        const type = (at: number, data: string) =>
            editMask(initial, { selection: [at, at], inputType: 'insertText', data }, options)
                .state;
        expect(type(2, 'B').display).toBe('AB_-12-CD');
        expect(type(4, '9').display).toBe('A__-92-CD');
        expect(type(8, 'Z').display).toBe('A__-12-CZ');
    });

    it('recognizes numeric literals when parsing a formatted value around an optional digit', () => {
        const options = { mask: '0[#]1#' };
        for (const raw of ['0', '1', '00', '01', '10', '11']) {
            const value = formatMask(raw, options);
            expect(formatMask(value.formatted, options, 'formatted')).toMatchObject({
                raw,
                formatted: value.formatted,
                complete: true,
            });
        }
    });

    it('keeps single-line values during multi-line paste even with a permissive token', () => {
        const options = { mask: { parts: [/./s, /./s] } };
        expect(formatMask('a\r\nb', options).raw).toBe('ab');
        expect(() => formatMask('', { ...options, prefix: 'Area\n' })).toThrow('one line');
        expect(() => formatMask('', { mask: '#\n#' })).toThrow('one line');
        expect(() => formatMask('', { ...options, guideChar: '\r' })).toThrow('guideChar');
    });

    it('bounds checking work per cell when optional paths share a noisy paste', () => {
        let calls = 0;
        const digit = {
            accept: /[0-9]/,
            transform: (value: string) => {
                calls++;
                return value;
            },
        };
        const cells = 16;
        const mask = {
            parts: [...Array.from({ length: cells - 1 }, () => ({ optional: [digit] })), digit],
        };
        const text = '12345678' + 'x'.repeat(5_000) + '9';
        const { raw, complete } = formatMask(text, { mask });
        expect(raw).toBe('123456789');
        expect(complete).toBe(true);
        expect(calls).toBeGreaterThan(5_000);
        expect(calls).toBeLessThanOrEqual(cells * text.length);
    });

    it('handles independently optional positions without enumerating their combinations', () => {
        const options = { mask: '[#]'.repeat(70) + '##' };
        expect(formatMask('1'.repeat(37), options)).toMatchObject({
            raw: '1'.repeat(37),
            complete: true,
        });
    });

    it('reports malformed patterns, empty candidate lists and invalid guide glyphs', () => {
        for (const mask of [']', '[#', '#\\', 'fixed', []])
            expect(() => formatMask('', { mask })).toThrow();
        expect(() => formatMask('', { mask: '#', guideChar: '..' })).toThrow('guideChar');
    });
});
