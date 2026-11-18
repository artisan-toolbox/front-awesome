import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readdir, rm, symlink } from 'node:fs/promises';
import { resolve } from 'node:path';
import { expect, test } from 'vite-plus/test';

const root = resolve(import.meta.dirname, '../..');

async function createCheckerFixture() {
    const directory = await mkdtemp(resolve(root, 'node_modules/.data-view checker-'));
    await mkdir(resolve(directory, 'scripts'));
    await mkdir(resolve(directory, 'tests/frontend/data-view-types'), { recursive: true });
    await mkdir(resolve(directory, 'node_modules'));
    await copyFile(
        resolve(root, 'scripts/check-data-view-types.mjs'),
        resolve(directory, 'scripts/check-data-view-types.mjs'),
    );
    await copyFile(
        resolve(root, 'tests/frontend/data-view-types/Invalid.vue.txt'),
        resolve(directory, 'tests/frontend/data-view-types/Invalid.vue.txt'),
    );
    return directory;
}

test('checks real invalid Vue contracts without npm executable shims in a path containing spaces', async () => {
    const directory = await createCheckerFixture();
    try {
        await symlink(
            resolve(root, 'node_modules/vue-tsc'),
            resolve(directory, 'node_modules/vue-tsc'),
            'junction',
        );
        const result = spawnSync(
            process.execPath,
            [resolve(directory, 'scripts/check-data-view-types.mjs')],
            { cwd: root, encoding: 'utf8', timeout: 30_000 },
        );
        expect(result.error).toBeUndefined();
        expect(result.stderr).toBe('');
        expect(result.status).toBe(0);
        expect(result.stdout).toContain('DataView negative Vue fixtures rejected');
        expect(await readdir(resolve(directory, 'node_modules'))).toEqual(['vue-tsc']);
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
}, 30_000);

test('reports a missing compiler and removes temporary Vue fixtures after failure', async () => {
    const directory = await createCheckerFixture();
    try {
        const result = spawnSync(
            process.execPath,
            [resolve(directory, 'scripts/check-data-view-types.mjs')],
            { cwd: root, encoding: 'utf8', timeout: 30_000 },
        );
        expect(result.error).toBeUndefined();
        expect(result.status).toBe(1);
        expect(result.stderr).toContain('MODULE_NOT_FOUND');
        expect(result.stderr).toContain('vue-tsc');
        expect(result.stderr).not.toContain('ERR_INVALID_ARG_TYPE');
        expect(await readdir(resolve(directory, 'node_modules'))).toEqual([]);
    } finally {
        await rm(directory, { recursive: true, force: true });
    }
}, 30_000);
