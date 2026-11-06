import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import manifest from '../package.json' with { type: 'json' };

const npm = process.env.npm_execpath;
assert.ok(npm, 'Run this check through npm run test:theme.');
const names = ['primevue', '@primeuix/themes'];
const relevant = (entries = {}) =>
    Object.fromEntries(Object.entries(entries).filter(([name]) => names.includes(name)));
const root = await mkdtemp(join(tmpdir(), 'front-awesome-peers-'));
try {
    const packages = {
        bridge: {
            name: 'front-awesome-peer-consumer',
            version: '1.0.0',
            dependencies: relevant(manifest.dependencies),
            peerDependencies: relevant(manifest.peerDependencies),
            peerDependenciesMeta: relevant(manifest.peerDependenciesMeta),
        },
        primevue: { name: 'primevue', version: '4.1.0' },
        themes: { name: '@primeuix/themes', version: '1.0.0' },
        '.': {
            name: 'existing-primevue-application',
            version: '1.0.0',
            private: true,
            dependencies: {
                'front-awesome-peer-consumer': 'file:./bridge',
                primevue: 'file:./primevue',
                '@primeuix/themes': 'file:./themes',
            },
        },
    };
    for (const [directory, metadata] of Object.entries(packages)) {
        await mkdir(join(root, directory), { recursive: true });
        await writeFile(join(root, directory, 'package.json'), JSON.stringify(metadata));
    }
    await promisify(execFile)(
        process.execPath,
        [
            npm,
            'install',
            '--package-lock-only',
            '--install-links',
            '--ignore-scripts',
            '--offline',
            '--no-audit',
            '--no-fund',
            '--cache',
            join(root, 'cache'),
        ],
        { cwd: root, timeout: 30000 },
    );
    console.log('Base installation preserves existing PrimeVue and theme versions.');
} finally {
    await rm(root, { recursive: true, force: true });
}
