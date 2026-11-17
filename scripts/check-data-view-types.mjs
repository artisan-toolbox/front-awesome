import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
const root = resolve(import.meta.dirname, '..');
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
        resolve(root, 'node_modules/.bin/vue-tsc'),
        ['--noEmit', '-p', resolve(directory, 'tsconfig.json')],
        { cwd: root, encoding: 'utf8' },
    );
    const diagnostics = result.stdout + result.stderr;
    const checks = [
        /Type 'string' is not assignable to type '(undefined|never)'/,
        /Property 'missing' does not exist/,
        /Type 'number' is not assignable to type '"active" \| "archived"'/,
        /Type 'string' is not assignable to type 'number'/,
        /Type '"missing"' is not assignable to type 'DataViewRowKey/,
    ];
    if (result.status === 0 || checks.some((check) => !check.test(diagnostics))) {
        process.stderr.write(diagnostics);
        throw new Error(
            'DataView negative Vue fixtures did not reject every invalid public contract.',
        );
    }
    const errors = diagnostics.split('\n').filter((line) => /error TS/.test(line));
    if (errors.some((line) => !line.includes('Invalid.vue'))) throw new Error(diagnostics);
    process.stdout.write(
        'DataView negative Vue fixtures rejected owner props, missing row fields and keys, invalid filters, and invalid action operands.\n',
    );
} finally {
    await rm(directory, { recursive: true, force: true });
}
