import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseFragment } from 'parse5';
import { format } from 'vite-plus/fmt';

const root = resolve(import.meta.dirname, '..');
const pro = process.argv.includes('--pro');
const core = resolve(root, 'node_modules/@awesome.me/webawesome/dist');
const upstream = pro ? resolve(root, 'node_modules/@web.awesome.me/webawesome-pro/dist') : core;
const fixtureRoot = pro ? 'tests/pro' : 'tests/frontend';
const coreManifest = JSON.parse(readFileSync(resolve(core, 'custom-elements.json'), 'utf8'));
const coreTags = new Set(
    coreManifest.modules
        .flatMap((module) => module.declarations ?? [])
        .filter((declaration) => declaration.tagName)
        .map((declaration) => declaration.tagName),
);
const manifest = JSON.parse(readFileSync(resolve(upstream, 'custom-elements.json'), 'utf8'));
const declarations = manifest.modules
    .flatMap((module) => module.declarations ?? [])
    .filter((declaration) => declaration.tagName);
const components = declarations
    .filter((declaration) => !pro || !coreTags.has(declaration.tagName))
    .map((declaration) => ({ name: declaration.name.replace(/^Wa/, ''), tag: declaration.tagName }))
    .sort((left, right) => left.name.localeCompare(right.name));
const names = new Map(
    declarations.map((declaration) => [declaration.tagName, declaration.name.replace(/^Wa/, '')]),
);
const definitions = new Map(declarations.map((declaration) => [declaration.tagName, declaration]));
const check = process.argv.includes('--check');
const scenarios = [];
async function output(file, value) {
    const path = resolve(root, file);
    const formatted = await format(path, value, {
        tabWidth: file.endsWith('.json') ? 2 : 4,
        semi: true,
        singleQuote: true,
    });
    if (formatted.errors.length) throw new Error(JSON.stringify(formatted.errors));
    if (check) {
        if (readFileSync(path, 'utf8') !== formatted.code)
            throw new Error(`Stale upstream scenario output: ${file}`);
    } else writeFileSync(path, formatted.code);
}
function apply(source, replacements) {
    return replacements
        .sort((left, right) => right.start - left.start)
        .reduce(
            (value, edit) => value.slice(0, edit.start) + edit.text + value.slice(edit.end),
            source,
        );
}
if (process.argv.includes('--coverage')) {
    const inventories = [
        'tests/frontend/upstream-scenarios.json',
        'tests/pro/upstream-scenarios.json',
    ].map((file) => JSON.parse(readFileSync(resolve(root, file), 'utf8')));
    const testReferences = [];
    for (const directory of ['tests/frontend', 'tests/pro']) {
        for (const file of readdirSync(resolve(root, directory)).filter(
            (file) => file.endsWith('.browser.test.ts') && file !== 'upstream.browser.test.ts',
        )) {
            const path = `${directory}/${file}`;
            const source = readFileSync(resolve(root, path), 'utf8');
            const tests = [...source.matchAll(/^\s*test\((['"`])(.+?)\1,/gm)];
            for (const [index, test] of tests.entries())
                testReferences.push({
                    file: path,
                    title: test[2],
                    body: source.slice(test.index, tests[index + 1]?.index ?? source.length),
                });
        }
    }
    const all = inventories.flatMap((inventory) => inventory.scenarios);
    const components = inventories.flatMap((inventory) =>
        inventory.components.map((component) => {
            const matched = testReferences.filter(
                (test) =>
                    test.body.includes(`h(${component.name},`) ||
                    test.body.includes(`Pro.${component.name}`) ||
                    test.body.includes(`'${component.tag}'`) ||
                    test.body.includes(`"${component.tag}"`) ||
                    (component.name.endsWith('Chart') &&
                        test.title.includes('${tag}') &&
                        test.title.includes('canvas')),
            );
            return {
                ...component,
                edition: inventory.edition,
                ownReferenceExamples: inventory.scenarios.filter(
                    (scenario) => scenario.component === component.name,
                ).length,
                renderedInExamples: all.filter((scenario) =>
                    new RegExp(`<${component.tag}(?=[\\s>])`).test(scenario.original),
                ).length,
                actionTestReferences: matched.map(({ file, title }) => ({ file, title })),
            };
        }),
    );
    const coverage = {
        upstream: inventories.map((inventory) => ({
            edition: inventory.edition,
            version: inventory.version,
            examples: inventory.scenarios.length,
        })),
        assertions: [
            'Compiled public wrapper imports',
            'Original scalar property state',
            'Host display, font, and color',
            'Host width and height',
            'Shadow part structure',
        ],
        scriptSetup: {
            executedExamples: all.filter((scenario) => scenario.scriptExecution === 'scoped')
                .length,
            examplesWithoutExecutableScripts: all.filter(
                (scenario) => scenario.scriptExecution === 'none',
            ).length,
            additionalPrerequisites: all
                .filter((scenario) => scenario.scriptExecution === 'review-required')
                .map(({ id, component, limitations }) => ({
                    id,
                    component,
                    limitations,
                    isolatedVerification:
                        id === 'otp-input-17'
                            ? {
                                  testFile: 'tests/frontend/upstream-prerequisites.browser.test.ts',
                                  branches: [
                                      'Synthetic credential autofill',
                                      'Credential request cancellation',
                                  ],
                                  environmentLimit:
                                      'Physical SMS transport is outside the synthetic credential service fixture.',
                              }
                            : id === 'data-grid-31'
                              ? {
                                    testFile: 'tests/pro/upstream-prerequisites.browser.test.ts',
                                    branches: [
                                        'Exact request URL and AbortSignal',
                                        'Orders response and loading state',
                                        'Empty search results',
                                    ],
                                    environmentLimit:
                                        'The deterministic orders response verifies the request boundary. Production API availability is outside this fixture.',
                                }
                              : {
                                    testFile: 'tests/pro/upstream-prerequisites.browser.test.ts',
                                    branches: [
                                        'Real Pro Combobox keyboard selection',
                                        'Original placement, distance, and arrow callbacks',
                                        'Native and Vue popup dimensions',
                                    ],
                                    environmentLimit:
                                        'The original Core reference needs a licensed Pro Combobox component.',
                                },
                })),
        },
        interactionScope:
            'Every upstream example renders and its supported setup executes. Dedicated browser tests exercise component families. The examples are not all replayed interaction by interaction.',
        externalAssets:
            'External source URLs remain in the original examples. Parity checks do not assert that every external CDN, remote image, remote document, or media file loads successfully. Dedicated interactions use local content where possible.',
        references:
            'Action test references identify defined behavioral assertions. Run the browser suites to verify their results.',
        components,
    };
    await output('tests/frontend/upstream-coverage.json', `${JSON.stringify(coverage, null, 4)}\n`);
    console.log(
        `Recorded ${all.length} examples, ${components.length} components, and ${coverage.scriptSetup.additionalPrerequisites.length} script prerequisites.`,
    );
    process.exit(0);
}
mkdirSync(resolve(root, `${fixtureRoot}/upstream`), { recursive: true });
for (const { name, tag } of components) {
    const file = `skills/webawesome/references/components/${tag.slice(3)}.md`;
    const source = readFileSync(resolve(upstream, file), 'utf8');
    const examples = [];
    const modelValues = [];
    const markdownContents = [];
    const templateContents = [];
    for (const match of source.matchAll(/```html[^\n]*\n([\s\S]*?)```/g)) {
        const original = match[1].trim();
        const headings = [...source.slice(0, match.index).matchAll(/^#{1,6}\s+(.+)$/gm)];
        const title = headings.at(-1)?.[1] ?? name;
        const scripts = [];
        let dataScripts = 0;
        const styles = [];
        const edits = [];
        const nativeEdits = [];
        const used = new Set();
        const unknownElements = new Set();
        let elementCount = 0;
        function visit(node) {
            const location = node.sourceCodeLocation;
            if (!location && node.tagName === 'tbody' && node.childNodes?.length) {
                const first = node.childNodes[0].sourceCodeLocation;
                const last = node.childNodes.at(-1).sourceCodeLocation;
                if (first && last) {
                    edits.push({
                        start: first.startOffset,
                        end: first.startOffset,
                        text: '<tbody>',
                    });
                    edits.push({ start: last.endOffset, end: last.endOffset, text: '</tbody>' });
                }
            }
            if (location && node.tagName === 'template') {
                const content = original.slice(
                    location.startTag.endOffset,
                    location.endTag.startOffset,
                );
                const attributes = original.slice(
                    location.startTag.startOffset + 9,
                    location.startTag.endOffset - 1,
                );
                const index = templateContents.push(content) - 1;
                edits.push({
                    start: location.startOffset,
                    end: location.endOffset,
                    text: `<component :is="'template'"${attributes} :innerHTML="templateContents[${index}]"></component>`,
                });
                return;
            }
            if (location && (node.tagName === 'script' || node.tagName === 'style')) {
                const content = original.slice(
                    location.startTag.endOffset,
                    location.endTag.startOffset,
                );
                if (
                    node.tagName === 'script' &&
                    node.attrs.some(
                        (attribute) =>
                            attribute.name === 'type' &&
                            !['module', 'text/javascript', 'application/javascript', ''].includes(
                                attribute.value,
                            ),
                    )
                ) {
                    dataScripts++;
                    const scriptType = node.attrs.find(
                        (attribute) => attribute.name === 'type',
                    ).value;
                    const index = markdownContents.push(content) - 1;
                    edits.push({
                        start: location.startOffset,
                        end: location.endOffset,
                        text: `<component :is="'script'" type="${scriptType}" :text-content="markdownContents[${index}]"></component>`,
                    });
                } else {
                    (node.tagName === 'script' ? scripts : styles).push(content.trim());
                    const edit = { start: location.startOffset, end: location.endOffset, text: '' };
                    edits.push(edit);
                    nativeEdits.push(edit);
                }
                return;
            }
            if (location && node.tagName?.startsWith('wa-')) {
                const wrapper = names.get(node.tagName);
                if (!wrapper) unknownElements.add(node.tagName);
                else {
                    used.add(wrapper);
                    const marker = ` data-upstream-index="${elementCount++}"`;
                    nativeEdits.push({
                        start: location.startTag.startOffset + 1 + node.tagName.length,
                        end: location.startTag.startOffset + 1 + node.tagName.length,
                        text: marker,
                    });
                    let attributes = original.slice(
                        location.startTag.startOffset + node.tagName.length + 1,
                        location.startTag.endOffset - 1,
                    );
                    const attributeEdits = [];
                    for (const attribute of node.attrs) {
                        const attributeLocation = location.attrs[attribute.name];
                        const start =
                            attributeLocation.startOffset -
                            (location.startTag.startOffset + node.tagName.length + 1);
                        const end =
                            attributeLocation.endOffset -
                            (location.startTag.startOffset + node.tagName.length + 1);
                        const definition = definitions
                            .get(node.tagName)
                            .attributes?.find((candidate) => candidate.name === attribute.name);
                        if (
                            definition?.type?.text === 'number' ||
                            /^[0-9. |]+$/.test(definition?.type?.text ?? '') ||
                            (definition?.type?.text?.includes('number') &&
                                /^-?(?:\d+(?:\.\d+)?|\.\d+)$/.test(attribute.value))
                        ) {
                            if (Number.isFinite(Number(attribute.value)))
                                attributeEdits.push({
                                    start,
                                    end,
                                    text: `:${attribute.name}="${Number(attribute.value)}"`,
                                });
                        } else if (node.tagName === 'wa-tag-input' && attribute.name === 'value') {
                            attributeEdits.push({
                                start,
                                end,
                                text: `default-value="${attribute.value.replace(/&/g, '&amp;').replace(/"/g, '&quot;')}"`,
                            });
                        } else if (
                            (definition?.type?.text === 'string' ||
                                definition?.type?.text?.includes("''")) &&
                            !attribute.value
                        ) {
                            attributeEdits.push({ start, end, text: `${attribute.name}=""` });
                        }
                    }
                    if (node.tagName === 'wa-input') {
                        const initial = node.attrs.find((attribute) => attribute.name === 'value');
                        if (initial) {
                            const valueLocation = location.attrs.value;
                            attributeEdits.push({
                                start:
                                    valueLocation.startOffset -
                                    (location.startTag.startOffset + node.tagName.length + 1),
                                end:
                                    valueLocation.endOffset -
                                    (location.startTag.startOffset + node.tagName.length + 1),
                                text: '',
                            });
                        }
                        if (!initial)
                            nativeEdits.push({
                                start: location.startTag.endOffset - 1,
                                end: location.startTag.endOffset - 1,
                                text: ' value=""',
                            });
                        const index = modelValues.push(initial?.value ?? '') - 1;
                        attributes = apply(attributes, attributeEdits) + ` v-model="input${index}"`;
                    } else attributes = apply(attributes, attributeEdits);
                    edits.push({
                        start: location.startTag.startOffset,
                        end: location.startTag.endOffset,
                        text: `<${wrapper}${marker}${attributes}>`,
                    });
                    if (location.endTag)
                        edits.push({
                            start: location.endTag.startOffset,
                            end: location.endTag.endOffset,
                            text: `</${wrapper}>`,
                        });
                }
            }
            for (const child of node.childNodes ?? []) visit(child);
            if (node.content) visit(node.content);
        }
        visit(parseFragment(original, { sourceCodeLocationInfo: true }));
        let markup = apply(original, edits);
        let nativeMarkup = apply(original, nativeEdits);
        const fixtureSetup =
            elementCount === 0
                ? `Creates the referenced ${name} before running the standalone API snippet.`
                : null;
        if (fixtureSetup) {
            used.add(name);
            markup = `<${name} data-upstream-index="0"></${name}>\n${markup}`;
            nativeMarkup = `<${tag} data-upstream-index="0"></${tag}>\n${nativeMarkup}`;
            elementCount = 1;
        }
        const blockers = [];
        if (unknownElements.size) blockers.push('unshipped-element');
        const scriptImports = scripts.flatMap((script) =>
            [...script.matchAll(/^\s*import\s*\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]\s*;?/gm)].map(
                (match) => ({
                    names: match[1].split(',').map((name) => name.trim()),
                    source: match[2],
                }),
            ),
        );
        if (
            scriptImports.some(
                (entry) =>
                    !['/dist/webawesome.js', 'https://cdn.jsdelivr.net/npm/lit@3/+esm'].includes(
                        entry.source,
                    ),
            )
        )
            blockers.push('unreviewed-module-import');
        const activeScripts = scripts.map((script) =>
            script
                .split('\n')
                .filter((line) => !line.trim().startsWith('//'))
                .join('\n'),
        );
        if (activeScripts.some((script) => /navigator\.credentials/.test(script)))
            blockers.push('requires-browser-sms-credentials');
        if (activeScripts.some((script) => /\bfetch\s*\(/.test(script)))
            blockers.push('requires-application-api-endpoint');
        const id = `${tag.slice(3)}-${examples.length + 1}`;
        scenarios.push({
            id,
            component: name,
            tag,
            title,
            source: file,
            original,
            markup: nativeMarkup,
            scripts,
            styles,
            scriptImports,
            fixtureSetup,
            counts: {
                scripts: scripts.length,
                dataScripts,
                styles: styles.length,
                elements: elementCount,
            },
            externalResources: [
                ...new Set(original.match(/(?:https?:\/\/|\/assets\/)[^\s"'<>`]+/g) ?? []),
            ],
            scriptExecution:
                scripts.length === 0
                    ? 'none'
                    : blockers.length === 0
                      ? 'scoped'
                      : 'review-required',
            limitations: [
                ...blockers,
                ...[...unknownElements].map(
                    (element) =>
                        `Upstream example references unshipped ${element}; preserved as native markup.`,
                ),
            ],
            inputAdaptation: used.has('Input')
                ? 'Input binds the upstream initial value through v-model to preserve its established controlled API.'
                : null,
        });
        examples.push({ id, markup, used });
    }
    if (examples.length) {
        const used = [...new Set(examples.flatMap((example) => [...example.used]))].sort(
            (left, right) => left.localeCompare(right),
        );
        const coreImports = used.filter((wrapper) =>
            coreTags.has([...names].find(([, candidate]) => candidate === wrapper)?.[0]),
        );
        const proImports = used.filter((wrapper) => !coreImports.includes(wrapper));
        const imports = [
            coreImports.length
                ? `import { ${coreImports.join(', ')} } from '@artisan-toolbox/front-awesome/components/WebAwesome';`
                : '',
            proImports.length
                ? `import { ${proImports.join(', ')} } from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';`
                : '',
        ]
            .filter(Boolean)
            .join('\n');
        const template = examples
            .map(
                (example) =>
                    `<template v-if="scenario === '${example.id}'">\n${example.markup}\n</template>`,
            )
            .join('\n');
        await output(
            `${fixtureRoot}/upstream/${name}.vue`,
            `<template>\n<div>\n${template}\n</div>\n</template>\n\n<script setup lang="ts">\n${modelValues.length ? "import { ref } from 'vue';\n" : ''}${imports}\ndefineProps<{ scenario: string }>();\n${modelValues.length ? modelValues.map((value, index) => `const input${index} = ref(${JSON.stringify(value)});\n`).join('') : ''}${markdownContents.length ? `const markdownContents = ${JSON.stringify(markdownContents)};\n` : ''}${templateContents.length ? `const templateContents = ${JSON.stringify(templateContents)};\n` : ''}</script>\n`,
        );
    }
}
const version = JSON.parse(readFileSync(resolve(upstream, '../package.json'), 'utf8')).version;
await output(
    `${fixtureRoot}/upstream-scenarios.json`,
    `${JSON.stringify({ edition: pro ? 'pro' : 'core', version, components, scenarios }, null, 4)}\n`,
);
console.log(
    `${check ? 'Verified' : 'Generated'} ${scenarios.length} upstream scenarios for ${components.length} ${pro ? 'Pro' : 'Core'} components.`,
);
