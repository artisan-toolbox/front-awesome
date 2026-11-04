import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { normalizePath, resolveConfig } from 'vite';
import { expect, test } from 'vite-plus/test';
import { frontAwesome } from '@artisan-toolbox/front-awesome/vite';

test('selects an installed edition for Front Awesome and preserves direct app imports', async () => {
    const root = await realpath(await mkdtemp(join(tmpdir(), 'front-awesome-vite-')));
    const resolve = (plugin = frontAwesome()) =>
        resolveConfig({ root, configFile: false, plugins: [plugin] }, 'serve');
    const imports = '#front-awesome-webawesome';

    try {
        const coreConfig = await resolve();
        expect(coreConfig.resolve.alias).not.toContainEqual(
            expect.objectContaining({ find: imports }),
        );

        const core = '@awesome.me/webawesome';
        const pro = '@web.awesome.me/webawesome-pro';
        const icon = 'dist/components/icon/icon.js';
        const install = async (name: string) => {
            const directory = join(root, 'node_modules', name);
            await mkdir(join(directory, 'dist', 'components', 'icon'), { recursive: true });
            await writeFile(join(directory, 'package.json'), JSON.stringify({ name }));
            const file = join(directory, icon);
            await writeFile(file, '');
            return normalizePath(file);
        };
        const importer = join(root, 'app.ts');
        const coreIcon = await install(core);
        expect(
            await (await resolve()).createResolver()(
                `${imports}/components/icon/icon.js`,
                importer,
            ),
        ).toBe(coreIcon);

        const proIcon = await install(pro);

        const proConfig = await resolve();
        const resolveImport = proConfig.createResolver();
        expect(await resolveImport(`${imports}/components/icon/icon.js`, importer)).toBe(proIcon);
        expect(await resolveImport(`${core}/${icon}`, importer)).toBe(coreIcon);
        expect(await resolveImport(`${pro}/${icon}`, importer)).toBe(proIcon);
        expect(proConfig.optimizeDeps.exclude).toEqual(
            expect.arrayContaining(['@artisan-toolbox/front-awesome', imports, pro]),
        );

        const explicitCore = await resolve(frontAwesome({ webAwesome: 'core' }));
        expect(
            await explicitCore.createResolver()(`${imports}/components/icon/icon.js`, importer),
        ).toBe(coreIcon);
    } finally {
        await rm(root, { recursive: true, force: true });
    }
});
