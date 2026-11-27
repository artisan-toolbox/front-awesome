import { localizedTemplate } from './localizedTemplate';

const uppercaseHex = Object.freeze({
    H: Object.freeze({ accept: /[0-9A-F]/, transform: (char: string) => char.toUpperCase() }),
});
const lowercaseHex = Object.freeze({
    H: Object.freeze({ accept: /[0-9a-f]/, transform: (char: string) => char.toLowerCase() }),
});

function isIPv4(raw: string) {
    const octets = raw.split('.');
    return (
        octets.length === 4 &&
        octets.every((octet) => /^(?:0|[1-9][0-9]{0,2})$/.test(octet) && Number(octet) <= 255)
    );
}

function isIPv6(raw: string) {
    return raw.includes(':') && /^[0-9a-f:.]+$/i.test(raw) && URL.canParse(`http://[${raw}]/`);
}

const addressCharacters = Object.freeze({ P: /[^\r\n]/u });

function addressTemplate(name: string, maxLength: number, isComplete: (raw: string) => boolean) {
    // Nested optional cells let the user end at any position. One overflow cell
    // keeps an overlong paste from becoming a different, complete address.
    return localizedTemplate(`incomplete.${name}`, {
        mask: 'P' + '[P'.repeat(maxLength) + ']'.repeat(maxLength),
        tokens: addressCharacters,
        inputMode: 'url',
        valueMode: 'formatted',
        isComplete,
    });
}

export const sharedMaskTemplates = Object.freeze({
    ipv4: addressTemplate('ipv4', 15, isIPv4),
    ipv6: addressTemplate('ipv6', 45, isIPv6),
    ip: addressTemplate('ip', 45, (raw) => (raw.includes(':') ? isIPv6(raw) : isIPv4(raw))),
    hexColor: localizedTemplate('incomplete.hexColor', {
        mask: Object.freeze(['HHH', 'HHHH', 'HHHHHH', 'HHHHHHHH']),
        tokens: uppercaseHex,
        prefix: '#',
        valueMode: 'formatted',
    }),
    uuid: localizedTemplate('incomplete.uuid', {
        mask: 'HHHHHHHH-HHHH-HHHH-HHHH-HHHHHHHHHHHH',
        tokens: lowercaseHex,
        valueMode: 'formatted',
    }),
    macAddress: localizedTemplate('incomplete.macAddress', {
        mask: 'HH:HH:HH:HH:HH:HH',
        tokens: uppercaseHex,
        valueMode: 'formatted',
    }),
});
