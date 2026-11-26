import { describe, expect, it } from 'vite-plus/test';
import { editMask, formatMask } from '../../resources/js/masked-input/mask';
import { sharedMaskTemplates as templates } from '../../resources/js/masked-input/sharedTemplates';

describe('shared mask templates', () => {
    it.each([
        ['0.0.0.0', true],
        ['127.0.0.1', true],
        ['255.255.255.255', true],
        ['255.255.255.2559', false],
        ['192.0.2', false],
        ['192.0.2.', false],
        ['192.0..1', false],
        ['192.00.2.1', false],
        ['256.0.2.1', false],
    ] as const)('checks the decimal octets in %s', (raw, complete) => {
        for (const template of [templates.ipv4(), templates.ip()]) {
            expect(formatMask(raw, template)).toMatchObject({ raw, formatted: raw, complete });
        }
    });

    it.each([
        ['::', true],
        ['::1', true],
        ['2001:DB8::1', true],
        ['1:2:3:4:5:6:7:8', true],
        ['::ffff:192.0.2.1', true],
        ['ffff:ffff:ffff:ffff:ffff:ffff:255.255.255.255', true],
        ['ffff:ffff:ffff:ffff:ffff:ffff:255.255.255.2559', false],
        ['1:2:3', false],
        ['1:2:3:4:5:6:7:8::', false],
        ['2001:db8::1::2', false],
        ['2001:db8:00000::1', false],
        ['::ffff:192.0.2.256', false],
    ] as const)('checks IPv6 groups and compression in %s', (raw, complete) => {
        for (const template of [templates.ipv6(), templates.ip()]) {
            expect(formatMask(raw, template)).toMatchObject({ raw, formatted: raw, complete });
        }
    });

    it('requires a colon in an IPv6 address', () => {
        expect(formatMask('192.0.2.1', templates.ipv6()).complete).toBe(false);
    });

    it.each([
        ['192.0.2.1/8', templates.ipv4()],
        ['192.0.2.1:80', templates.ipv4()],
        [' 192.0.2.1', templates.ipv4()],
        ['192.a0.2.1', templates.ipv4()],
        ['[::1]:80', templates.ipv6()],
        ['::1]/bad', templates.ipv6()],
        ['2001:db8::1/64', templates.ipv6()],
        ['fe80::1%eth0', templates.ipv6()],
        ['::a\t1', templates.ipv6()],
        ['::g1', templates.ipv6()],
        ['::1 ', templates.ipv6()],
    ] as const)('preserves the invalid text in a pasted %j for correction', (raw, family) => {
        for (const template of [family, templates.ip()]) {
            const { state } = editMask(
                formatMask('', template),
                { data: raw, inputType: 'insertFromPaste', selection: [0, 0] },
                template,
            );
            expect(state).toMatchObject({ raw, formatted: raw, complete: false });
            expect(formatMask(state.raw, template)).toMatchObject({ raw, complete: false });
            expect(template.inputMode).toBe('url');
        }
    });

    it.each(['1.2.3.4', '::1', '2001:db8::14'])('keeps separators while typing %s', (address) => {
        const template = templates.ip();
        let state = formatMask('', template);
        let caret = 0;
        let typed = '';
        for (const data of address) {
            typed += data;
            ({ state, caret } = editMask(
                state,
                { data, inputType: 'insertText', selection: [caret, caret] },
                template,
            ));
            expect(state.display).toBe(typed);
            expect(caret).toBe(typed.length);
        }
        expect(state.complete).toBe(true);
        expect(formatMask(state.raw, template).formatted).toBe(address);
    });

    it('preserves editable separators across pastes, middle edits and changes of address family', () => {
        const template = templates.ip();
        const initial = formatMask('::1', template);
        const { state: pasted } = editMask(
            initial,
            { data: '192.0.2.1', inputType: 'insertFromPaste', selection: [0, 3] },
            template,
        );
        expect(pasted).toMatchObject({ raw: '192.0.2.1', complete: true });
        const { state: joined, caret } = editMask(
            pasted,
            { selection: [4, 4], inputType: 'deleteContentBackward' },
            template,
        );
        expect(joined).toMatchObject({ raw: '1920.2.1', complete: false });
        expect(caret).toBe(3);
        const restored = editMask(
            joined,
            { data: '.', inputType: 'insertText', selection: [caret, caret] },
            template,
        );
        expect(restored.state).toMatchObject({ raw: '192.0.2.1', complete: true });
    });

    it('completes CSS hex colors only at valid RGB and RGBA widths', () => {
        const template = templates.hexColor();
        for (let width = 0; width <= 8; width++) {
            const digits = 'abcdef12'.slice(0, width);
            const formatted = digits ? '#' + digits.toUpperCase() : '';
            expect(formatMask('#' + digits, template, 'formatted')).toMatchObject({
                raw: digits.toUpperCase(),
                formatted,
                complete: [3, 4, 6, 8].includes(width),
            });
        }
        expect(formatMask('#xz12', template, 'formatted')).toMatchObject({
            raw: '12',
            formatted: '#12',
            complete: false,
        });
    });

    it('normalizes UUIDs to lowercase and MAC-48 addresses to uppercase colon notation', () => {
        for (const [template, input, formatted] of [
            [
                templates.uuid(),
                '550E8400E29B41D4A716446655440000',
                '550e8400-e29b-41d4-a716-446655440000',
            ],
            [templates.macAddress(), 'aabbccddeeff', 'AA:BB:CC:DD:EE:FF'],
        ] as const) {
            const raw = formatted.replace(/[-:]/g, '');
            expect(formatMask(input, template)).toMatchObject({ raw, formatted, complete: true });
            expect(formatMask(formatted, template, 'formatted')).toMatchObject({
                raw,
                formatted,
                complete: true,
            });
            expect(formatMask(input.slice(1), template).complete).toBe(false);
        }
    });

    it('returns stable immutable templates with formatted model defaults', () => {
        for (const create of Object.values(templates)) {
            const template = create();
            expect(create()).toBe(template);
            expect(Object.isFrozen(template)).toBe(true);
            expect(template.valueMode).toBe('formatted');
        }
    });
});
