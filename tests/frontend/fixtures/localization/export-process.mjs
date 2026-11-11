import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const hold = resolve(root, 'hold-export');

if (existsSync(hold)) {
    let stopping = false;
    process.on('SIGTERM', () => {
        stopping = true;
        writeFileSync(resolve(root, 'export-stopping'), '1');
    });
    const timer = setInterval(() => {
        if (!stopping || existsSync(hold)) return;
        clearInterval(timer);
    }, 10);
    writeFileSync(resolve(root, 'export-pid'), String(process.pid));
}

const output = resolve(root, 'generated/catalog.json');
const types = resolve(root, 'generated/catalog.d.ts');
mkdirSync(resolve(root, 'generated'), { recursive: true });
writeFileSync(output, '{}');
writeFileSync(types, 'export {};');
process.stdout.write(JSON.stringify({ output, types, watchPaths: [resolve(root, 'lang')] }));
