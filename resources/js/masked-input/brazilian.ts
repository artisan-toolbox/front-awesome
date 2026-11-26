import type { MaskTemplate } from './mask';

function template(options: MaskTemplate): () => Readonly<MaskTemplate> {
    const preset = Object.freeze(options);
    return () => preset;
}

const cnpjTokens = Object.freeze({
    X: Object.freeze({
        accept: /[0-9A-Z]/,
        transform: (character: string) =>
            /[a-z]/.test(character) ? character.toUpperCase() : character,
    }),
});

type PhoneShape = { mask: string; complete: RegExp };

const landline = { mask: '####-####', complete: /^[2-6]\d{7}$/ };
const mobile = { mask: '#####-####', complete: /^[7-9]\d{8}$/ };
const regionalLandline = { mask: '(##) ####-####', complete: /^[1-9]{2}[2-6]\d{7}$/ };
const regionalMobile = { mask: '(##) #####-####', complete: /^[1-9]{2}[7-9]\d{8}$/ };
const shortCode3 = { mask: '###', complete: /^1\d{2}$/ };
const shortCode4 = { mask: '####', complete: /^1\d{3}$/ };
const shortCode5 = { mask: '#####', complete: /^10[36]\d{2}$/ };
const nonGeographic = { mask: '#### ### ####', complete: /^0(?:300|303|500|800|900)\d{7}$/ };

function phone(shape: PhoneShape) {
    return template({
        mask: shape.mask,
        inputMode: 'tel',
        isComplete: (raw) => shape.complete.test(raw),
    });
}

function regionalShape(digits: string) {
    return digits.length > 10 || /[7-9]/.test(digits.charAt(2)) ? regionalMobile : regionalLandline;
}

function domesticShape(digits: string) {
    if (digits.startsWith('0')) return nonGeographic;
    if (digits.startsWith('1')) {
        if (digits.length <= 3) return shortCode3;
        if (digits.length === 4) return shortCode4;
        if (shortCode5.complete.test(digits)) return shortCode5;
        return regionalShape(digits);
    }
    if (digits.length > 9) return regionalShape(digits);
    if (/^[7-9]/.test(digits)) return mobile;
    if (digits.length === 9) return regionalShape(digits);
    return landline;
}

function dynamicPhone(shape: (digits: string) => PhoneShape) {
    return template({
        mask: (proposed) => shape(proposed.replace(/\D/g, '')).mask,
        inputMode: 'tel',
        isComplete: (raw) => shape(raw).complete.test(raw),
    });
}

function nonGeographicSeries(prefix: string) {
    return template({
        mask: nonGeographic.mask,
        inputMode: 'tel',
        isComplete: (raw) => raw.startsWith(prefix),
    });
}

export const Brazilian = Object.freeze({
    cpf: template({ mask: '###.###.###-##', inputMode: 'numeric' }),
    cnpjLegacy: template({ mask: '##.###.###/####-##', inputMode: 'numeric' }),
    cnpj: template({ mask: 'XX.XXX.XXX/XXXX-##', tokens: cnpjTokens, inputMode: 'text' }),
    cep: template({ mask: '#####-###', inputMode: 'numeric' }),
    phone: dynamicPhone(domesticShape),
    landline: phone(landline),
    mobile: phone(mobile),
    regionalLandline: phone(regionalLandline),
    regionalMobile: phone(regionalMobile),
    regionalPhone: dynamicPhone(regionalShape),
    shortCode3: phone(shortCode3),
    shortCode4: phone(shortCode4),
    shortCode5: phone(shortCode5),
    serviceCenter: phone({ mask: landline.mask, complete: /^[34]00\d{5}$/ }),
    nonGeographicPhone: phone(nonGeographic),
    tollFree: nonGeographicSeries('0800'),
    sharedCost: nonGeographicSeries('0300'),
    donation: nonGeographicSeries('0500'),
    premium: nonGeographicSeries('0900'),
    telemarketing: nonGeographicSeries('0303'),
    internationalPhone: template({
        mask: (proposed) => '+CC ' + regionalShape(proposed.replace(/\D/g, '').slice(2)).mask,
        tokens: Object.freeze({ C: /5/ }),
        inputMode: 'tel',
        isComplete: (raw) => {
            const national = raw.slice(2);
            return raw.startsWith('55') && regionalShape(national).complete.test(national);
        },
    }),
});
