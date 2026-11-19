import { fileURLToPath } from 'node:url';
import { mkdtemp, readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const root = resolve(import.meta.dirname, '..');
const npmPackage =
    process.argv[2] ??
    dirname(fileURLToPath(import.meta.resolve('@artisan-toolbox/dapter/package.json')));
const composerSource = resolve(root, 'vendor/artisan-toolbox/dapter/resources/js');
const npmSource = resolve(npmPackage, 'resources/js');
async function sources(directory) {
    const entries = await readdir(directory, { recursive: true, withFileTypes: true });
    return entries
        .filter((entry) => entry.isFile())
        .map((entry) => relative(directory, join(entry.parentPath, entry.name)))
        .sort();
}
const paths = new Set([...(await sources(composerSource)), ...(await sources(npmSource))]);
const differences = [];
for (const path of paths) {
    const files = await Promise.allSettled([
        readFile(join(composerSource, path)),
        readFile(join(npmSource, path)),
    ]);
    if (
        files[0].status === 'rejected' ||
        files[1].status === 'rejected' ||
        !files[0].value.equals(files[1].value)
    )
        differences.push(path);
}
if (differences.length)
    throw new Error(
        `The npm copy of Dapter differs from its Composer source in ${differences.join(', ')}. Run composer install, move the stale node_modules/@artisan-toolbox/dapter directory aside, then run npm install --install-links to refresh the file dependency.`,
    );
const directory = await mkdtemp(resolve(root, 'node_modules/.data-view-types-'));
try {
    await writeFile(
        resolve(directory, 'Invalid.vue'),
        await readFile(resolve(root, 'tests/frontend/data-view-types/Invalid.vue.txt'), 'utf8'),
    );
    await writeFile(
        resolve(directory, 'tsconfig.json'),
        JSON.stringify({
            compilerOptions: {
                target: 'ES2022',
                module: 'ESNext',
                moduleResolution: 'bundler',
                strict: true,
                skipLibCheck: true,
                noEmit: true,
                resolveJsonModule: true,
            },
            include: ['Invalid.vue'],
        }),
    );
    const result = spawnSync(
        process.execPath,
        [
            resolve(root, 'node_modules/vue-tsc/bin/vue-tsc.js'),
            '--noEmit',
            '-p',
            resolve(directory, 'tsconfig.json'),
        ],
        { cwd: root, encoding: 'utf8' },
    );
    if (result.error) throw result.error;
    const diagnostics = (result.stdout ?? '') + (result.stderr ?? '');
    const checks = [
        /Type 'string' is not assignable to type '(undefined|never)'/,
        /Property 'missing' does not exist/,
        /Type '"invalid-mode"' is not assignable/,
        /Property 'toFixed' does not exist on type 'string'/,
        /Property 'toUpperCase' does not exist on type 'number'/,
        /Argument of type 'number' is not assignable to parameter of type 'string'/,
        /Type 'true' is not assignable to type '(undefined|never)'/,
        /Type 'number' is not assignable to type '"active" \| "archived"'/,
        /Type 'string' is not assignable to type 'number'/,
        /Type '"missing"' is not assignable to type 'DataViewRowKey/,
        /Property 'toUpperCase' does not exist on type '(?:0 \| 1 \| -1|0)'/,
        /Argument of type 'string' is not assignable to parameter of type 'number'/,
    ];
    if (result.status === 0 || checks.some((check) => !check.test(diagnostics))) {
        process.stderr.write(diagnostics);
        throw new Error(
            'DataView negative Vue fixtures did not reject every invalid public contract.',
        );
    }
    const fixture = await readFile(resolve(directory, 'Invalid.vue'), 'utf8');
    const keyLine = fixture.split('\n').findIndex((line) => line.includes('invalid-key')) + 1;
    if (
        !diagnostics
            .split('\n')
            .some(
                (line) =>
                    line.includes(`Invalid.vue(${keyLine},`) &&
                    line.includes("Type 'string' is not assignable to type 'number'"),
            )
    ) {
        throw new Error('selectedKeys widened a numeric row key.');
    }
    const errors = diagnostics.split('\n').filter((line) => /error TS/.test(line));
    if (errors.some((line) => !line.includes('Invalid.vue'))) throw new Error(diagnostics);
    process.stdout.write(
        'DataView negative Vue fixtures rejected invalid owner props, rows, keys, selection modes, groups, formatter types, filter values, and action operands.\n',
    );
} finally {
    await rm(directory, { recursive: true, force: true });
}
