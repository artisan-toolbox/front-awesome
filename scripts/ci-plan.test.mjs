import assert from 'node:assert/strict';
import { test } from 'node:test';
import { planChecks } from './ci-plan.mjs';

await test('a Markdown-only change records a run without scheduling package checks', () => {
    const files = ['README.md', 'resources/boost/skills/front-awesome-development/SKILL.md'];
    assert.deepEqual(planChecks('push', 'docs: fix a link', files), {
        checks: false,
        compatibility: false,
        browsers: false,
        coverage: false,
    });
});

await test('a Markdown release candidate still needs the complete release checks', () => {
    assert.deepEqual(planChecks('push', 'chore(release): prepare 1.0.0-beta.6', ['CHANGELOG.md']), {
        checks: true,
        compatibility: true,
        browsers: true,
        coverage: false,
    });
});

await test('runtime changes run package checks and Composer changes also test compatibility', () => {
    assert.deepEqual(
        planChecks('pull_request', '', ['tests/fixtures/README.md', 'src/Toast.php']),
        {
            checks: true,
            compatibility: false,
            browsers: false,
            coverage: false,
        },
    );
    assert.equal(planChecks('pull_request', '', ['composer.lock']).compatibility, true);
    assert.equal(
        planChecks('pull_request', '', ['.github/workflows/tests.yml']).compatibility,
        true,
    );
});

await test('an unavailable diff cannot skip package or compatibility checks', () => {
    assert.deepEqual(planChecks('push', 'Initial push', null), {
        checks: true,
        compatibility: true,
        browsers: false,
        coverage: false,
    });
});

await test('manual and scheduled runs check everything, with scheduled coverage reports', () => {
    assert.deepEqual(planChecks('workflow_dispatch', '', null), {
        checks: true,
        compatibility: true,
        browsers: true,
        coverage: false,
    });
    assert.deepEqual(planChecks('schedule', '', null), {
        checks: true,
        compatibility: true,
        browsers: true,
        coverage: true,
    });
});
