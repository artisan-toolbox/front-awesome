import { describe, expect, it } from 'vite-plus/test';
import { Brazilian } from '../../resources/js/masked-input/brazilian';
import { editMask, formatMask } from '../../resources/js/masked-input/mask';

const phones = [
    ['landline', '34567890', '3456-7890'],
    ['mobile', '987654321', '98765-4321'],
    ['regionalLandline', '5534567890', '(55) 3456-7890'],
    ['regionalMobile', '11987654321', '(11) 98765-4321'],
    ['regionalPhone', '21987654321', '(21) 98765-4321'],
    ['shortCode3', '190', '190'],
    ['shortCode4', '1052', '1052'],
    ['shortCode5', '10315', '10315'],
    ['shortCode5', '10621', '10621'],
    ['serviceCenter', '30030100', '3003-0100'],
    ['serviceCenter', '40040001', '4004-0001'],
    ['tollFree', '08000010000', '0800 001 0000'],
    ['sharedCost', '03001234567', '0300 123 4567'],
    ['donation', '05001234567', '0500 123 4567'],
    ['premium', '09001234567', '0900 123 4567'],
    ['telemarketing', '03031234567', '0303 123 4567'],
    ['nonGeographicPhone', '08008818210', '0800 881 8210'],
] as const;

describe('Brazilian mask templates', () => {
    it.each([
        ['cpf', '00000000000', '000.000.000-00'],
        ['cep', '01001000', '01001-000'],
        ['cnpjLegacy', '00000000000191', '00.000.000/0001-91'],
        ['cnpj', '00000000000191', '00.000.000/0001-91'],
        ['cnpj', '00000000E08G12', '00.000.000/E08G-12'],
    ] as const)('formats %s and preserves the raw identifier', (name, raw, formatted) => {
        const template = Brazilian[name]();
        expect(formatMask(raw, template)).toMatchObject({ raw, formatted, complete: true });
        expect(formatMask(formatted, template, 'formatted')).toMatchObject({ raw, formatted });
        expect(formatMask(raw.slice(0, -1), template).complete).toBe(false);
    });

    it('accepts ASCII letters only in the first twelve alphanumeric CNPJ positions', () => {
        expect(formatMask('ıſß０12.abc.345/01de-35', Brazilian.cnpj(), 'formatted')).toMatchObject({
            raw: '12ABC34501DE35',
            formatted: '12.ABC.345/01DE-35',
            complete: true,
        });
        expect(formatMask('12ABC34501DEz5', Brazilian.cnpj())).toMatchObject({
            raw: '12ABC34501DE5',
            complete: false,
        });
        expect(formatMask('12ABC34501DE35', Brazilian.cnpjLegacy()).complete).toBe(false);
    });

    it.each(phones)('formats %s alone and in a domestic phone field', (name, raw, formatted) => {
        for (const template of [Brazilian[name](), Brazilian.phone()]) {
            const expected = { raw, formatted, complete: true };
            expect(formatMask(raw, template)).toMatchObject(expected);
            expect(formatMask(formatted, template, 'formatted')).toMatchObject(expected);
            let typed = formatMask('', template);
            for (const digit of raw) {
                typed = editMask(
                    typed,
                    {
                        selection: [typed.end, typed.end],
                        inputType: 'insertText',
                        data: digit,
                    },
                    template,
                ).state;
            }
            expect(typed).toMatchObject(expected);
        }
    });

    it.each([
        ['shortCode3', '290'],
        ['shortCode4', '2052'],
        ['shortCode5', '11987'],
        ['phone', '11987'],
        ['tollFree', '03001234567'],
        ['nonGeographicPhone', '01001234567'],
        ['serviceCenter', '34567890'],
        ['regionalLandline', '0134567890'],
        ['regionalMobile', '11345678901'],
        ['regionalPhone', '1198765432'],
        ['landline', '98765432'],
        ['mobile', '345678901'],
        ['phone', '01001234567'],
        ['phone', '234'],
        ['phone', '10987654321'],
    ] as const)('keeps an incompatible %s entry incomplete', (name, input) => {
        expect(formatMask(input, Brazilian[name]()).complete).toBe(false);
    });

    it('reclassifies an ambiguous DDD and local number when the last digit is deleted', () => {
        const template = Brazilian.phone();
        const full = formatMask('9834567890', template);
        expect(full).toMatchObject({
            raw: '9834567890',
            formatted: '(98) 3456-7890',
            complete: true,
        });
        const shorter = editMask(
            full,
            {
                inputType: 'deleteContentBackward',
                selection: [full.end, full.end],
            },
            template,
        );
        expect(shorter.state).toMatchObject({
            raw: '983456789',
            formatted: '98345-6789',
            complete: true,
        });
        expect(shorter.caret).toBe(shorter.state.formatted.length);
    });

    it.each([
        ['553134567890', '+55 (31) 3456-7890'],
        ['5555987654321', '+55 (55) 98765-4321'],
    ])('retains the international country code in raw and formatted input', (raw, formatted) => {
        const template = Brazilian.internationalPhone();
        expect(formatMask(raw, template)).toMatchObject({ raw, formatted, complete: true });
        expect(formatMask(formatted, template, 'formatted')).toMatchObject({
            raw,
            formatted,
            complete: true,
        });
        expect(formatMask('4411987654321', template).complete).toBe(false);
    });
});
