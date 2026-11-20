import { execFileSync } from 'node:child_process';
import { appendFileSync, readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const documentation =
    /^(?:README|CHANGELOG|LICENSE|AGENTS|AGENTS_PACKAGE|CLAUDE)\.md$|^(?:\.github|resources\/boost\/skills)\/.*\.md$/;
const compatibilityInputs = /^(?:composer\.(?:json|lock)|\.nvmrc)$/;
const workflow = /^(?:\.github\/(?:workflows|actions)\/|scripts\/ci-plan(?:\.test)?\.mjs$)/;
const phpTests =
    /^(?:tests\/(?:(?:Feature|Unit)\/.+|ArchTest)\.php|phpunit\.xml\.dist|phpstan\.neon\.dist|pint\.json|rector\.php)$/;
const browserInputs =
    /^(?:package(?:-lock)?\.json|\.npmrc|vite\.config\.ts)$|^(?:resources\/(?:js|css)\/|scripts\/|tests\/theme-consumer\/|tests\/frontend\/scrollbar)/i;

export function planChecks(event, subject, files) {
    const extended =
        event === 'schedule' ||
        event === 'workflow_dispatch' ||
        (event === 'push' && subject.startsWith('chore(release): prepare ')) ||
        files?.some((file) => !documentation.test(file) && workflow.test(file)) === true;
    const full = extended || files === null;
    const fullBrowsers =
        full || files.some((file) => compatibilityInputs.test(file) || browserInputs.test(file));

    return {
        checks: full || files.some((file) => !documentation.test(file)),
        compatibility: full || files.some((file) => compatibilityInputs.test(file)),
        browsers:
            fullBrowsers || files.some((file) => !documentation.test(file) && !phpTests.test(file)),
        fullBrowsers,
        coverage: event === 'schedule',
    };
}

function changedPaths(base) {
    if (!/^[0-9a-f]{40}$/i.test(base ?? '') || /^0+$/.test(base)) return null;

    try {
        return execFileSync(
            'git',
            ['diff', '--name-only', '--no-renames', '-z', base, 'HEAD', '--'],
            {
                encoding: 'utf8',
                maxBuffer: 8 * 1024 * 1024,
                stdio: ['ignore', 'pipe', 'ignore'],
            },
        )
            .split('\0')
            .filter(Boolean);
    } catch {
        return null;
    }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
    const event = process.env.GITHUB_EVENT_NAME;
    const payload = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, 'utf8'));
    const subject = execFileSync('git', ['show', '-s', '--format=%s', 'HEAD'], {
        encoding: 'utf8',
    });
    const base = event === 'pull_request' ? payload.pull_request?.base.sha : payload.before;
    const outputs = planChecks(event, subject, changedPaths(base));

    for (const [name, required] of Object.entries(outputs)) {
        appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${required}\n`);
        console.log(`${name}=${required}`);
    }

    if (outputs.browsers) {
        const lock = JSON.parse(readFileSync('package-lock.json', 'utf8'));
        const version = lock.packages['node_modules/playwright']?.version;
        if (!/^\d+\.\d+\.\d+$/.test(version ?? '')) {
            throw new Error(
                'The browser job requires a stable Playwright version in package-lock.json.',
            );
        }
        appendFileSync(process.env.GITHUB_OUTPUT, `playwright=${version}\n`);
    }
}
