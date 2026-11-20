import assert from 'node:assert/strict';
import { test } from 'node:test';
import { planChecks } from './ci-plan.mjs';

await test('a Markdown-only change records a run without scheduling package checks', () => {
    const files = [
        'README.md',
        '.github/actions/setup/README.md',
        'resources/boost/skills/front-awesome-development/SKILL.md',
    ];
    assert.deepEqual(planChecks('push', 'docs: fix a link', files), {
        checks: false,
        compatibility: false,
        browsers: false,
        fullBrowsers: false,
        coverage: false,
    });
});

await test('a Markdown release candidate still needs the complete release checks', () => {
    assert.deepEqual(planChecks('push', 'chore(release): prepare 1.0.0-beta.6', ['CHANGELOG.md']), {
        checks: true,
        compatibility: true,
        browsers: true,
        fullBrowsers: true,
        coverage: false,
    });
});

await test('PHP test changes need package checks but no browser installation', () => {
    assert.deepEqual(
        planChecks('pull_request', '', ['tests/Feature/ToastTest.php', 'phpunit.xml.dist']),
        {
            checks: true,
            compatibility: false,
            browsers: false,
            fullBrowsers: false,
            coverage: false,
        },
    );
});

await test('PHP runtime and ordinary frontend test changes exercise Chromium', () => {
    for (const file of [
        'tests/frontend/user-permission-editor.browser.test.ts',
        'src/Localization/ExportTranslations.php',
        'tests/fixtures/README.md',
    ]) {
        assert.deepEqual(planChecks('pull_request', '', [file]), {
            checks: true,
            compatibility: false,
            browsers: true,
            fullBrowsers: false,
            coverage: false,
        });
    }
});

await test('frontend sources, theme and scrollbar fixtures, and tooling run every browser check', () => {
    for (const file of [
        'resources/js/vite.mjs',
        'resources/js/index.ts',
        'resources/js/components/Tag.vue',
        'resources/js/user-permission-editor/UserPermissionEditor.vue',
        'resources/css/branding.css',
        'resources/js/theme/tokens.css',
        'resources/js/tailwind.css',
        'resources/js/scrollbar.ts',
        'tests/frontend/scrollbar.browser.test.ts',
        'tests/frontend/ScrollbarFixture.vue',
        'tests/theme-consumer/main.ts',
        'tests/theme-consumer/app.css',
        'package-lock.json',
        'vite.config.ts',
        'scripts/test-theme-consumer.mjs',
    ]) {
        assert.deepEqual(planChecks('pull_request', '', [file]), {
            checks: true,
            compatibility: false,
            browsers: true,
            fullBrowsers: true,
            coverage: false,
        });
    }
});

await test('Composer, Node.js version, and CI changes run PHP compatibility and every browser check', () => {
    for (const file of [
        'composer.lock',
        '.nvmrc',
        '.github/workflows/tests.yml',
        '.github/actions/setup/action.yml',
        'scripts/ci-plan.mjs',
    ]) {
        assert.deepEqual(planChecks('pull_request', '', [file]), {
            checks: true,
            compatibility: true,
            browsers: true,
            fullBrowsers: true,
            coverage: false,
        });
    }
});

await test('an unavailable diff runs all checks except scheduled coverage', () => {
    assert.deepEqual(planChecks('push', 'Initial push', null), {
        checks: true,
        compatibility: true,
        browsers: true,
        fullBrowsers: true,
        coverage: false,
    });
});

await test('manual and scheduled runs check everything, with scheduled coverage reports', () => {
    assert.deepEqual(planChecks('workflow_dispatch', '', null), {
        checks: true,
        compatibility: true,
        browsers: true,
        fullBrowsers: true,
        coverage: false,
    });
    assert.deepEqual(planChecks('schedule', '', null), {
        checks: true,
        compatibility: true,
        browsers: true,
        fullBrowsers: true,
        coverage: true,
    });
});
