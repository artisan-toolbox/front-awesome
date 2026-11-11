import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { createSSRApp, h } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { expect, test } from 'vite-plus/test';
import { createLocalization, useLocalization } from '../../resources/js/localization';
import { canonicalLocale } from '../../resources/js/localization/catalog';
import { chooseMessage, replaceMessage } from '../../resources/js/localization/laravelMessages';
import { pluralIndex } from '../../resources/js/localization/pluralRules';
import Language from '../../resources/js/preferences/Language.vue';

const catalog = {
    version: 1,
    fallbackLocale: 'en',
    locales: {
        en: {
            sourceLocale: 'en',
            label: 'English',
            messages: {
                'fixture.welcome': 'Hello, :name. :Name. :NAME.',
                'fixture.choice': '{0} None|{1} One|[2,*] :count items',
                'fixture.base': 'one|many',
                'A literal. @email {braces}': 'email@example.com @:linked {literal} :name',
            },
        },
        es: { sourceLocale: 'es', label: 'Español', messages: {} },
        'pt-BR': { sourceLocale: 'pt_BR', label: 'Português (Brasil)', messages: {} },
    },
};

test('uses supported Vue I18n functions for Laravel syntax, exact keys and count overloads', async () => {
    const localization = createLocalization(catalog);
    const app = createSSRApp({
        setup() {
            expect(useLocalization()).toBe(localization);
            return () => h('output', localization.t('fixture.welcome', { name: 'ana' }));
        },
    }).use(localization);
    expect(await renderToString(app)).toBe('<output>Hello, ana. Ana. ANA.</output>');
    expect(localization.t('fixture.choice', { count: 0 })).toBe('None');
    expect(localization.t('fixture.choice', 1)).toBe('One');
    expect(localization.t('fixture.choice', 2)).toBe('2 items');
    expect(localization.t('fixture.choice', { count: 3 }, 4)).toBe('3 items');
    expect(localization.t('fixture.base')).toBe('one|many');
    expect(localization.t('A literal. @email {braces}', { name: ':NAME' })).toBe(
        'email@example.com @:linked {literal} :NAME',
    );
    expect(localization.t('Missing @email {braces}.')).toBe('Missing @email {braces}.');
    expect(localization.locale.value).toBe('en');
    expect(() => localization.setLocale('es')).toThrow('browser document');
});

test('renders a wrapper-free selector under SSR and reports missing installation', async () => {
    const app = createSSRApp({
        render: () =>
            h(Language, {}, { default: ({ locale }: { locale: string }) => h('output', locale) }),
    }).use(createLocalization(catalog));
    expect(await renderToString(app)).toMatch(/^(?:<!--\[-->)?<output>en<\/output>(?:<!--\]-->)?$/);
    const missing = createSSRApp(Language);
    missing.config.warnHandler = () => {};
    await expect(renderToString(missing)).rejects.toThrow('createLocalization(catalog)');
});

test('derives selectable languages from generated availability while retaining fallback catalogs', async () => {
    const localization = createLocalization({ ...catalog, availableLocales: ['es'] });
    expect(localization.locales.map(({ locale }) => locale)).toEqual(['es']);
    expect(localization.t('fixture.welcome', { name: 'Ana' })).toBe('Hello, Ana. Ana. ANA.');
    expect(() => localization.setLocale('en')).toThrow(RangeError);
    const app = createSSRApp({
        render: () =>
            h(
                Language,
                {},
                {
                    default: ({ locales }: { locales: readonly { locale: string }[] }) =>
                        h('output', locales.map(({ locale }) => locale).join(',')),
                },
            ),
    }).use(localization);
    expect(await renderToString(app)).toContain('<output>es</output>');
    expect(createLocalization(catalog).locales.map(({ locale }) => locale)).toEqual([
        'en',
        'es',
        'pt-BR',
    ]);
    expect(
        createLocalization({ ...catalog, availableLocales: ['pt_BR', 'es'] }).locales.map(
            ({ locale }) => locale,
        ),
    ).toEqual(['pt-BR', 'es']);
});

test.each(
    [[], ['fr'], ['en', 'en'], ['!invalid'], [1], ['pt_BR', 'pt-BR']].map((availableLocales) => ({
        availableLocales,
    })),
)('rejects invalid generated availability $availableLocales', ({ availableLocales }) => {
    expect(() => createLocalization({ ...catalog, availableLocales })).toThrow('availableLocales');
});

test('validates exported catalogs once and canonicalizes Laravel aliases', () => {
    expect(() => createLocalization({ ...catalog, version: 2 })).toThrow('version 1');
    expect(() => createLocalization({ ...catalog, fallbackLocale: 'fr' })).toThrow(
        'exported locale',
    );
    expect(() =>
        createLocalization({ ...catalog, locales: { pt_BR: catalog.locales['pt-BR'] } }),
    ).toThrow();
    expect(() =>
        createLocalization({
            ...catalog,
            locales: { en: { ...catalog.locales.en, messages: { bad: [] } } },
        }),
    ).toThrow('invalid locale entry');
    expect(canonicalLocale('pt_BR')).toBe('pt-BR');
    expect(canonicalLocale('es-ar')).toBe('es-AR');
    expect(canonicalLocale('!bad')).toBeUndefined();
    const localization = createLocalization(catalog);
    const first = createSSRApp({ render: () => null }).use(localization);
    expect(() => createSSRApp({ render: () => null }).use(localization)).toThrow(
        'separate localization service',
    );
    expect(first.config.globalProperties.$frontAwesome.localization).toBe(localization);
});

function oracle(cases: unknown[]) {
    const script = `require $argv[1]; $selector = new Illuminate\\Translation\\MessageSelector; $loader = new Illuminate\\Translation\\ArrayLoader; $translator = new Illuminate\\Translation\\Translator($loader, 'en'); $output = []; foreach (json_decode(stream_get_contents(STDIN), true) as $case) { if ($case['kind'] === 'index') { $output[] = $selector->getPluralIndex($case['locale'], $case['count']); } elseif ($case['kind'] === 'choice') { $output[] = $selector->choose($case['line'], $case['count'], $case['locale']); } else { $translator->addLines(['fixture.line' => $case['line']], 'en'); $output[] = $translator->get('fixture.line', $case['replacements']); } } echo json_encode($output, JSON_THROW_ON_ERROR);`;
    const result = spawnSync(
        process.env.PHP_BINARY ?? 'php',
        ['-r', script, resolve(import.meta.dirname, '../../vendor/autoload.php')],
        { input: JSON.stringify(cases), encoding: 'utf8' },
    );
    if (result.status !== 0)
        throw new Error(
            `Laravel translation oracle failed. Set PHP_BINARY to a supported PHP executable. ${result.stderr}`,
        );
    const output: unknown = JSON.parse(result.stdout);
    if (!Array.isArray(output))
        throw new Error('Laravel translation oracle did not return an array.');
    return output;
}

test('matches the installed Laravel plural selector for every supported locale family', () => {
    const php = readFileSync(
        resolve(
            import.meta.dirname,
            '../../vendor/laravel/framework/src/Illuminate/Translation/MessageSelector.php',
        ),
        'utf8',
    );
    const locales = [...php.matchAll(/case '([^']+)':/g)].map((match) => match[1]);
    const counts = [
        -101, -21, -11, -2, -1, -0.5, 0, 0.5, 1, 1.1, 1.9, 2, 3, 4, 5, 8, 10, 11, 12, 14, 19, 20,
        21, 22, 99, 100, 101,
    ];
    const cases = [...locales, 'unknown'].flatMap((locale) =>
        counts.map((count) => ({ kind: 'index', locale, count })),
    );
    expect(cases.map(({ locale, count }) => pluralIndex(locale, count))).toEqual(oracle(cases));
});

test('matches Laravel conditions, source order, fallback segments, decimals and whitespace', () => {
    const lines = [
        '{0} None|{1} One|[2,*] :count items',
        '[*,0] Low|[0,2] Middle|[1,*] High',
        '{-1} Negative one|{-0.5} Fraction|[0.5,1.5] Range|Rest',
        ' {1} Not a leading condition|Other',
        '{1}  One  |[2,*] Many',
        '{0}\u00a0literal\u00a0| Other ',
        'only',
        'first|second',
        'first|second|third',
    ];
    const cases = ['en', 'es', 'pt_BR', 'ru', 'ar', 'fr', 'sl'].flatMap((locale) =>
        lines.flatMap((line) =>
            [-2, -1, -0.5, 0, 0.5, 1, 1.5, 2, 3, 11, 21].map((count) => ({
                kind: 'choice',
                locale,
                line,
                count,
            })),
        ),
    );
    expect(cases.map(({ line, count, locale }) => chooseMessage(line, count, locale))).toEqual(
        oracle(cases),
    );
});

test('matches Laravel scalar replacement with simultaneous longest names and literal values', () => {
    const cases = [
        {
            line: ':name :Name :NAME :names :name_long :unknown',
            replacements: { name: 'ana', names: 'longest', name_long: 'longer' },
        },
        { line: ':a :b :A :B', replacements: { a: ':b', b: ':a' } },
        {
            line: ':userName :UserName :USERNAME :a-b :A-b :A-B',
            replacements: { userName: 'élise', 'a-b': 'literal' },
        },
        { line: ':name :Name :NAME', replacements: { name: 'élise' } },
        { line: ':value :Value :VALUE', replacements: { value: 'ßeta' } },
        {
            line: ':yes :no :none :zero :number',
            replacements: { yes: true, no: false, none: null, zero: 0, number: 1.25 },
        },
        { line: 'email@example.com @:link {braces} :toString', replacements: {} },
    ];
    expect(cases.map(({ line, replacements }) => replaceMessage(line, replacements))).toEqual(
        oracle(cases.map((item) => ({ kind: 'replace', ...item }))),
    );
});

test('canonicalizes legacy Intl aliases from exported Laravel catalogs without changing source plural rules', () => {
    const localization = createLocalization({
        version: 1,
        fallbackLocale: 'iw',
        locales: {
            iw: { sourceLocale: 'iw', label: 'Hebrew alias', messages: { choice: 'first|second' } },
            in: { sourceLocale: 'in', label: 'Indonesian alias', messages: {} },
            mo: { sourceLocale: 'mo', label: 'Moldavian alias', messages: {} },
        },
    });
    expect(localization.locale.value).toBe('he');
    expect(localization.locales.map((entry) => entry.locale)).toEqual(['he', 'id', 'ro']);
    expect(localization.locales[0].sourceLocale).toBe('iw');
    expect(localization.t('choice', 2)).toBe('first');
    expect(() =>
        createLocalization({
            version: 1,
            fallbackLocale: 'he',
            locales: {
                iw: { sourceLocale: 'iw', label: 'Legacy', messages: {} },
                he: { sourceLocale: 'he', label: 'Canonical', messages: {} },
            },
        }),
    ).toThrow('duplicate canonical locale');
});

test('uses English after the configured fallback and keeps the resolved source plural rules', () => {
    const localization = createLocalization({
        version: 1,
        fallbackLocale: 'fr',
        locales: {
            fr: { sourceLocale: 'fr', label: 'French', messages: { welcome: 'Bonjour' } },
            en: { sourceLocale: 'en', label: 'English', messages: { choice: 'one|many' } },
        },
    });
    expect(localization.locale.value).toBe('fr');
    expect(localization.t('welcome')).toBe('Bonjour');
    expect(localization.t('choice', 0)).toBe('many');
});
