import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout } from 'node:timers/promises';

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
const input = resolve(root, 'lang/en/app.json');
const catalog = existsSync(input) ? readFileSync(input, 'utf8') : '{}';
const log = resolve(root, 'export-events');
const pause = resolve(root, 'pause-export');
appendFileSync(log, `Started ${catalog}\n`);

while (existsSync(pause)) await setTimeout(10);

mkdirSync(resolve(root, 'generated'), { recursive: true });
writeFileSync(output, catalog);
writeFileSync(types, 'export {};');
appendFileSync(log, `Finished ${catalog}\n`);
process.stdout.write(JSON.stringify({ output, types, watchPaths: [resolve(root, 'lang')] }));
