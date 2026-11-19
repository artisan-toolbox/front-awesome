import { execFileSync } from 'node:child_process';
import { english } from '../../resources/js/user-permission-editor/messages';
import { expect, test } from 'vite-plus/test';
import {
    fieldErrors,
    normalizeSubject,
    readSnapshot,
    subjectUrl,
} from '../../resources/js/user-permission-editor/protocol';

function response() {
    return {
        subject: '001',
        revision: 'r1',
        canUpdate: true,
        isCurrentUser: false,
        sections: [
            {
                id: 'roles',
                kind: 'permissions',
                name: 'Orders',
                description: '',
                order: 'locked',
                abilities: [
                    { key: 'orders::write', name: 'Write orders', description: '' },
                    { key: 'orders::read', name: 'Read orders', description: '' },
                ],
            },
            {
                id: 'roles',
                kind: 'roles',
                name: 'Roles',
                description: '',
                order: 'alphabetical',
                abilities: [],
            },
        ],
        values: { 'orders::write': false, 'orders::read': true },
    };
}

test('preserves canonical string subjects and rejects unsafe numeric IDs', () => {
    expect(normalizeSubject({ subjectId: '001' })?.id).toBe('001');
    expect(normalizeSubject({ subjectId: 0 })?.id).toBe('0');
    expect(normalizeSubject({ subjectId: '9007199254740993' })?.id).toBe('9007199254740993');
    expect(normalizeSubject({ subjectId: Number.MAX_SAFE_INTEGER + 1 })).toBeUndefined();
    expect(normalizeSubject({ subjectId: 0.5 })).toBeUndefined();
    expect(normalizeSubject({ subjectId: '  ' })).toBeUndefined();
});

test('adds the exact requested ID while preserving other provider parameters', () => {
    const base = new URL('https://app.example/orders/select');
    const url = subjectUrl(
        { version: 1, endpoint: '/access?tab=users&user=old#help' },
        { id: 'a/b &c' },
        base,
    );
    expect(url).toBe('https://app.example/access?tab=users&user=a%2Fb+%26c');
});

test.each([
    undefined,
    { version: 2, endpoint: '/access' },
    { version: 1, endpoint: '//another.example/access' },
    { version: 1, endpoint: 'https://token@app.example/access' },
    { version: 1, endpoint: 'javascript:alert(0)' },
])('rejects unsupported or cross-origin capabilities %#', (capability) => {
    expect(subjectUrl(capability, { id: '1' }, new URL('https://app.example/'))).toBeUndefined();
});

test('reads the complete snapshot without coercing values or imposing a front-end order', () => {
    const parsed = readSnapshot(JSON.stringify(response()), { id: '001' });
    expect(parsed?.sections.map(({ kind }) => kind)).toEqual(['permissions', 'roles']);
    expect(parsed?.sections[0].abilities.map(({ key }) => key)).toEqual([
        'orders::write',
        'orders::read',
    ]);
    expect(parsed?.values).toEqual({ 'orders::write': false, 'orders::read': true });
    expect(
        fieldErrors(
            JSON.stringify({ errors: { 'values.orders::write': ['Denied'], secret: 'Ignore' } }),
            parsed?.values ?? {},
        ),
    ).toEqual({
        'orders::write': 'Denied',
    });
});

test.each([
    { subject: '1' },
    { canUpdate: 'true' },
    { values: { 'orders::write': false } },
    { values: { ...response().values, 'unknown::ability': true } },
    { values: { ...response().values, 'orders::read': 'true' } },
    { sections: [{ ...response().sections[0], order: 'other' }] },
    { sections: [...response().sections, response().sections[0]] },
])('rejects invalid snapshot shape %#', (change) => {
    expect(
        readSnapshot(JSON.stringify({ ...response(), ...change }), { id: '001' }),
    ).toBeUndefined();
});

test.each(['en', 'es', 'pt_BR'])('ships all editor messages in %s', (locale) => {
    const translated: unknown = JSON.parse(
        execFileSync(
            process.env.PHP_BINARY ?? 'php',
            [
                '-r',
                'echo json_encode(require $argv[1], JSON_THROW_ON_ERROR);',
                `lang/${locale}/user-permission-editor.php`,
            ],
            { encoding: 'utf8' },
        ),
    );
    if (locale === 'en') expect(translated).toEqual(english);
    else expect(Object.keys(Object(translated)).sort()).toEqual(Object.keys(english).sort());
});
