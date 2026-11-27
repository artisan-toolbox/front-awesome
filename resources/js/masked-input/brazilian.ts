import { localizedTemplate } from './localizedTemplate';
import type { MaskTemplate } from './mask';

function template(name: string, options: MaskTemplate) {
    return localizedTemplate(`brazilian.incomplete.${name}`, options);
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

function phone(name: string, shape: PhoneShape) {
    return template(name, {
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

function dynamicPhone(name: string, shape: (digits: string) => PhoneShape) {
    return template(name, {
        mask: (proposed) => shape(proposed.replace(/\D/g, '')).mask,
        inputMode: 'tel',
        isComplete: (raw) => shape(raw).complete.test(raw),
    });
}

function nonGeographicSeries(name: string, prefix: string) {
    return template(name, {
        mask: nonGeographic.mask,
        inputMode: 'tel',
        isComplete: (raw) => raw.startsWith(prefix),
    });
}

export const brazilian = Object.freeze({
    cpf: template('cpf', { mask: '###.###.###-##', inputMode: 'numeric' }),
    cnpjLegacy: template('cnpjLegacy', { mask: '##.###.###/####-##', inputMode: 'numeric' }),
    cnpj: template('cnpj', { mask: 'XX.XXX.XXX/XXXX-##', tokens: cnpjTokens, inputMode: 'text' }),
    cep: template('cep', { mask: '##.###-###', inputMode: 'numeric' }),
    phone: dynamicPhone('phone', domesticShape),
    landline: phone('landline', landline),
    mobile: phone('mobile', mobile),
    regionalLandline: phone('regionalLandline', regionalLandline),
    regionalMobile: phone('regionalMobile', regionalMobile),
    regionalPhone: dynamicPhone('regionalPhone', regionalShape),
    shortCode3: phone('shortCode3', shortCode3),
    shortCode4: phone('shortCode4', shortCode4),
    shortCode5: phone('shortCode5', shortCode5),
    serviceCenter: phone('serviceCenter', { mask: landline.mask, complete: /^[34]00\d{5}$/ }),
    nonGeographicPhone: phone('nonGeographicPhone', nonGeographic),
    tollFree: nonGeographicSeries('tollFree', '0800'),
    sharedCost: nonGeographicSeries('sharedCost', '0300'),
    donation: nonGeographicSeries('donation', '0500'),
    premium: nonGeographicSeries('premium', '0900'),
    telemarketing: nonGeographicSeries('telemarketing', '0303'),
    internationalPhone: template('internationalPhone', {
        mask: (proposed) => '+CC ' + regionalShape(proposed.replace(/\D/g, '').slice(2)).mask,
        tokens: Object.freeze({ C: /5/ }),
        inputMode: 'tel',
        isComplete: (raw) => {
            const national = raw.slice(2);
            return raw.startsWith('55') && regionalShape(national).complete.test(national);
        },
    }),
});
