import { existsSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { format } from 'vite-plus/fmt';
import ts from 'typescript';
import { compileScript, parse } from 'vue/compiler-sfc';
import { webAwesomeModels } from './web-awesome-models.mjs';

const root = resolve(import.meta.dirname, '..');
const check = process.argv.includes('--check');
const pro = process.argv.includes('--pro');
const editionPackage = pro ? '@web.awesome.me/webawesome-pro' : '@awesome.me/webawesome';
const directory = pro ? 'WebAwesomePro' : 'WebAwesome';
const prefix = pro ? 'proComponent' : 'component';
const coreManifest = JSON.parse(
    readFileSync(
        resolve(root, 'node_modules/@awesome.me/webawesome/dist/custom-elements.json'),
        'utf8',
    ),
);
const coreTags = new Set(
    coreManifest.modules
        .flatMap((module) => module.declarations ?? [])
        .flatMap((declaration) => (declaration.tagName ? [declaration.tagName] : [])),
);
const manifest = JSON.parse(
    readFileSync(resolve(root, `node_modules/${editionPackage}/dist/custom-elements.json`), 'utf8'),
);
const existing = new Set(['Button', 'ButtonGroup', 'Input', 'Icon', 'Tag']);
const propertyInputs = {
    Chart: ['config'],
    BarChart: ['config'],
    BubbleChart: ['config'],
    DoughnutChart: ['config'],
    LineChart: ['config'],
    PieChart: ['config'],
    PolarAreaChart: ['config'],
    RadarChart: ['config'],
    ScatterChart: ['config'],
    Combobox: ['value', 'defaultValue', 'inputValue', 'filter', 'dataSource', 'getTag'],
    DateInput: ['value', 'isDateDisabled', 'dayContent'],
    DatePicker: ['isDateDisabled', 'dayContent'],
    FileInput: ['files'],
    DataGrid: [
        'data',
        'columns',
        'selectableRows',
        'pageSizeOptions',
        'searchTerm',
        'rowDetail',
        'rowClass',
        'dataSource',
        'searchFn',
        'sort',
        'columnOrder',
        'selectedKeys',
        'selectedRows',
        'expandedKeys',
        'filters',
    ],
    Animation: ['keyframes', 'currentTime'],
    Checkbox: ['checked'],
    ColorPicker: ['value'],
    KnownDate: ['value'],
    NumberInput: ['value'],
    Option: ['selected'],
    OtpInput: ['value'],
    RadioGroup: ['value'],
    Select: ['value', 'defaultValue', 'getTag'],
    Slider: ['value', 'valueFormatter'],
    Switch: ['checked'],
    TagInput: ['value', 'inputValue'],
    Textarea: ['value'],
    TimeInput: ['value'],
};
const definitions = manifest.modules
    .flatMap((module) => module.declarations ?? [])
    .filter((declaration) => declaration.tagName && (!pro || !coreTags.has(declaration.tagName)))
    .map((declaration) => {
        const name = declaration.name.replace(/^Wa/, '');
        const attributes = (declaration.attributes ?? [])
            .filter(
                (attribute) =>
                    attribute.name !== 'did-ssr' && !(name === 'Page' && attribute.name === 'view'),
            )
            .map((attribute) => ({
                attribute: attribute.name,
                property:
                    ['Select', 'Combobox'].includes(name) && attribute.name === 'value'
                        ? 'defaultValue'
                        : attribute.fieldName,
                boolean: attribute.type?.text === 'boolean',
                enumerated: ['spellcheck', 'autocorrect'].includes(attribute.name),
            }));
        if (name === 'Page')
            attributes.push({
                attribute: 'disable-sticky',
                property: 'disableSticky',
                boolean: false,
                enumerated: false,
            });
        const properties = propertyInputs[name] ?? [];
        const events = (declaration.events ?? []).map((event) => event.name);
        return {
            name,
            tag: declaration.tagName,
            attributes,
            properties,
            events,
            formAssociated: (declaration.members ?? []).some(
                (member) =>
                    member.name === 'form' &&
                    member.inheritedFrom?.name === 'WebAwesomeFormAssociatedElement',
            ),
            slots: (declaration.slots ?? []).map((slot) => slot.name),
            models: webAwesomeModels[name] ?? [],
            generated: pro || !existing.has(name),
        };
    })
    .sort((a, b) => a.name.localeCompare(b.name));

const outputs = new Map();
function output(file, content) {
    outputs.set(file, content);
}

function writeOutput(file, content) {
    const path = resolve(root, file);
    if (check) {
        let current;
        try {
            current = readFileSync(path, 'utf8');
        } catch {}
        if (file.endsWith('.json') && current) {
            if (isDeepStrictEqual(JSON.parse(current), JSON.parse(content))) return;
        } else if (current === content) return;
        throw new Error(`Generated Web Awesome output is stale: ${file}`);
    }
    writeFileSync(path, content);
}

output(
    `resources/js/WebAwesome/${pro ? 'proComponents' : 'components'}.json`,
    `${JSON.stringify(definitions, null, 4)}\n`,
);
output(
    `resources/js/WebAwesome/${prefix}Definitions.ts`,
    definitions
        .filter((d) => d.generated)
        .map(
            (d) =>
                `export const ${d.name.charAt(0).toLowerCase() + d.name.slice(1)}Definition = ${JSON.stringify(d)};`,
        )
        .join('\n') + '\n',
);
output(
    `resources/js/theme/${pro ? 'pro' : 'core'}-host-reset.css`,
    `@layer base {\n    :where(${definitions.map((d) => d.tag).join(', ')}) {\n        box-sizing: revert-layer;\n        margin: revert-layer;\n        padding: revert-layer;\n        border: revert-layer;\n    }\n}\n`,
);
const declarationProgram = ts.createProgram(
    definitions
        .filter((definition) => definition.generated)
        .map((definition) =>
            realpathSync(
                resolve(
                    root,
                    `node_modules/${editionPackage}/dist/components/${definition.tag.slice(3)}/${definition.tag.slice(3)}.d.ts`,
                ),
            ),
        ),
    {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        skipLibCheck: true,
    },
);
const checker = declarationProgram.getTypeChecker();
function setterInputs(definition) {
    const slug = definition.tag.slice(3);
    const file = resolve(
        root,
        `node_modules/${editionPackage}/dist/components/${slug}/${slug}.d.ts`,
    );
    const source = declarationProgram.getSourceFile(realpathSync(file));
    if (!source) throw new Error(`Missing native declarations for ${definition.name}.`);
    const setters = new Map();
    for (const declaration of source.statements.filter(ts.isClassDeclaration)) {
        const writable = new Set(
            declaration.members
                .filter(ts.isSetAccessorDeclaration)
                .map((member) => member.name.getText(source)),
        );
        for (const getter of declaration.members.filter(ts.isGetAccessorDeclaration)) {
            const property = getter.name.getText(source);
            if (definition.properties.includes(property) && !writable.has(property))
                throw new Error(
                    `Read-only ${definition.name}.${property} cannot be a wrapper input.`,
                );
        }
        for (const setter of declaration.members.filter(ts.isSetAccessorDeclaration)) {
            const type = setter.parameters[0]?.type;
            if (!type) continue;
            let builtin = true;
            function visit(node) {
                if (
                    ts.isTypeReferenceNode(node) &&
                    !['Date', 'FormData'].includes(node.typeName.getText(source))
                )
                    builtin = false;
                ts.forEachChild(node, visit);
            }
            visit(type);
            if (builtin) setters.set(setter.name.getText(source), type.getText(source));
            else {
                const getter = declaration.members.find(
                    (member) =>
                        ts.isGetAccessorDeclaration(member) &&
                        member.name.getText(source) === setter.name.getText(source),
                );
                const input = checker.getTypeAtLocation(type);
                const output = getter?.type && checker.getTypeAtLocation(getter.type);
                if (
                    !output ||
                    input.flags & ts.TypeFlags.Any ||
                    output.flags & ts.TypeFlags.Any ||
                    !checker.isTypeAssignableTo(input, output) ||
                    !checker.isTypeAssignableTo(output, input)
                )
                    throw new Error(
                        `Asymmetric referenced setter ${definition.name}.${setter.name.getText(source)} requires an explicit generated public type.`,
                    );
            }
        }
    }
    return setters;
}
let types = '';
for (const definition of definitions.filter((definition) => definition.generated)) {
    const { name, tag } = definition;
    const slug = tag.slice(3);
    types += `import type Wa${name} from '${editionPackage}/dist/components/${slug}/${slug}.js';\n`;
}
types += `import type { ControlBindingProps } from './useFormBridge';\n${pro ? "import type { DatePickerModelValue } from './modelDomains';\n" : ''}`;
types += `import type * as Upstream from '${editionPackage}/dist/custom-elements-jsx.d.ts';\nimport type { HTMLAttributes } from 'vue';\n\n`;
for (const definition of definitions.filter((definition) => definition.generated)) {
    const { name, tag, attributes, properties, events } = definition;
    const slug = tag.slice(3);
    const setters = setterInputs(definition);
    const keys = new Map();
    for (const attribute of attributes) {
        for (const key of [attribute.attribute, attribute.property])
            keys.set(key, attribute.property);
    }
    for (const property of properties) keys.set(property, property);
    const fieldKeys = [...keys.keys()];
    const listeners = events.map(
        (event) =>
            `on${event
                .split('-')
                .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                .join('')}`,
    );
    const omitted =
        [...new Set([...fieldKeys, ...listeners])].map((key) => `'${key}'`).join(' | ') || 'never';
    const models = definition.models;
    const primary = models.find((model) => model.form);
    for (const model of models) {
        if (!keys.has(model.property) && !(model.type && model.writer))
            throw new Error(`Unreviewed model property ${name}.${model.property}.`);
        if (model.writer && model.writer.kind !== 'nullable-selection') {
            const declaration = declarationProgram.getSourceFile(
                realpathSync(
                    resolve(
                        root,
                        `node_modules/${editionPackage}/dist/components/${slug}/${slug}.d.ts`,
                    ),
                ),
            );
            const methods =
                declaration?.statements
                    .filter(ts.isClassDeclaration)
                    .flatMap((item) =>
                        item.members
                            .filter(ts.isMethodDeclaration)
                            .map((method) => method.name.getText(declaration)),
                    ) ?? [];
            const required =
                model.writer.kind === 'method'
                    ? [model.writer.method]
                    : [model.writer.on, model.writer.off];
            if (required.some((method) => !methods.includes(method)))
                throw new Error(`Missing public method for ${name}.${model.name}.`);
        }
        if (
            model.observeAttribute &&
            !attributes.some(
                (attribute) =>
                    attribute.attribute === model.observeAttribute &&
                    attribute.property === model.property,
            )
        )
            throw new Error(`Undeclared reflected attribute for ${name}.${model.name}.`);
        if (model.ownerEvent) {
            const owner = coreManifest.modules
                .flatMap((module) => module.declarations ?? [])
                .find((declaration) => declaration.tagName === model.ownerEvent.tag);
            if (!owner?.events?.some((event) => event.name === model.ownerEvent.name))
                throw new Error(`Undeclared owner event for ${name}.${model.name}.`);
        }
        for (const event of model.events)
            if (!events.includes(event))
                throw new Error(`Undeclared model event ${name}.${event}.`);
    }
    const selection = ['Select', 'Combobox'].includes(name);
    const readType = (model) =>
        model.type ??
        (selection && model.form
            ? `Extract<Wa${name}['${model.property}'], M extends true ? string[] | null : string | null>`
            : `Wa${name}['${model.property}']`);
    const writeType = (model) =>
        model.type ??
        (name === 'DatePicker' && model.form
            ? 'DatePickerModelValue'
            : (setters.get(model.property) ?? `Wa${name}['${model.property}']`));
    types += `export interface ${name}NativeProps extends Omit<HTMLAttributes, ${omitted}> {\n`;
    for (const [key, property] of keys) {
        const attribute = attributes.find((attribute) => attribute.property === property);
        const type =
            name === 'Page' && property === 'disableSticky'
                ? 'string'
                : property === 'form'
                  ? 'string'
                  : attribute?.enumerated
                    ? property === 'autocorrect'
                        ? "boolean | 'on' | 'off'"
                        : "HTMLAttributes['spellcheck']"
                    : (setters.get(property) ?? `Wa${name}['${property}']`);
        types += `    '${key}'?: ${type};\n`;
    }
    if (definition.formAssociated) types += `    form?: string;\n`;
    types += `    slot?: string;\n`;
    for (const [index, event] of events.entries())
        types += `    ${listeners[index]}?: Upstream.Wa${name}Props['on${event}'];\n`;
    types += `}\n\n`;
    const named = models.filter((model) => !model.form);
    const modelTypes = models
        .map(
            (model) =>
                `${model.type ? `    ${model.name}?: ${model.type};\n` : ''}    'onUpdate:${model.name}'?: (value: ${readType(model)}) => void;\n`,
        )
        .join('');
    if (primary)
        types += `export type ${name}Props<T extends object = object${selection ? ', M extends boolean = boolean' : ''}> = Omit<${name}NativeProps, 'form'${selection ? " | 'multiple'" : ''}> & ControlBindingProps<T, ${writeType(primary)}, ${readType(primary)}, '${primary.property}'> & ${selection ? '{ multiple?: M } & ' : ''}{\n${modelTypes}};\n\n`;
    else types += `export interface ${name}Props extends ${name}NativeProps {\n${modelTypes}}\n\n`;
    const noHint = primary && !definition.slots.includes('hint');
    const noHintLayout = name === 'Rating' ? 'intrinsic' : 'block';
    const propsDeclaration = primary
        ? `interface Attributes extends /* @vue-ignore */ Omit<${name}NativeProps, 'form'${selection ? " | 'multiple'" : ''}> {}\ntype Props = Attributes & ControlBindingProps<T, ${writeType(primary)}, ${readType(primary)}, '${primary.property}'> & {\n${selection ? '    multiple?: M;\n' : ''}\n${named.map((model) => `    ${model.name}?: ${readType(model)};`).join('\n')}\n};`
        : `interface Props extends /* @vue-ignore */ ${name}Props {\n${named.map((model) => `    ${model.name}?: ${readType(model)};`).join('\n')}\n}`;
    const modelPorts = models
        .map(
            (model) =>
                `        useWebAwesomeModel<${writeType(model)}, ${readType(model)}>(props, {\n            name: '${model.name}', property: '${model.property}', events: ${JSON.stringify(model.events)}, ${model.observeAttribute ? `observeAttribute: '${model.observeAttribute}', ` : ''}${model.ownerEvent ? `ownerEvent: ${JSON.stringify(model.ownerEvent)}, ` : ''}${model.writer ? `writer: ${JSON.stringify(model.writer)}, ` : ''}${model.reader ? `reader: ${JSON.stringify(model.reader)}, ` : ''}form: ${model.form}, componentName: '${name}',\n            acceptsWrite: modelDomains.${model.write}, acceptsRead: ${selection && model.form ? `(value): value is ${readType(model)} => props.multiple == null || props.multiple === false ? modelDomains.nullableString(value) : value === null || modelDomains.strings(value)` : `modelDomains.${model.read}`},\n            emitValue: value => emit('update:${model.name}', value),\n        }),`,
        )
        .join('\n');
    const code = `<template>\n${noHint ? `    <FormFieldFrame :active="validationFrame" :invalid="invalid" :errors="errors" :message-id="messageId" :native-slot="nativeSlot" layout="${noHintLayout}">\n` : ''}    <${tag} ref="element" v-bind="bindings()">\n        <component :is="slotContent" :nodes="slotNodes()" />\n    </${tag}>\n${noHint ? '    </FormFieldFrame>\n' : ''}</template>\n\n<script setup lang="ts"${primary ? ` generic="T extends object${selection ? ', M extends boolean = false' : ''}"` : ''}>\nimport type { ${primary ? `${name}NativeProps` : `${name}Props`} } from '../../WebAwesome/${prefix}Props';\nimport { useWebAwesome } from '../../WebAwesome/useWebAwesome';\n${noHint ? "import FormFieldFrame from '../../WebAwesome/FormFieldFrame.vue';\n" : ''}import { ${name.charAt(0).toLowerCase() + name.slice(1)}Definition } from '../../WebAwesome/${prefix}Definitions';\n${models.length ? `import type Wa${name} from '${editionPackage}/dist/components/${slug}/${slug}.js';\nimport { useWebAwesomeModel } from '../../WebAwesome/useWebAwesomeModel';\nimport { modelDomains } from '../../WebAwesome/modelDomains';\n` : ''}${primary ? `import type { ControlBindingProps } from '../../WebAwesome/useFormBridge';\n${name === 'DatePicker' ? "import type { DatePickerModelValue } from '../../WebAwesome/modelDomains';\n" : ''}` : ''}\n${propsDeclaration}\n\ndefineOptions({ inheritAttrs: false });\nconst props = defineProps<Props>();\n${models.length ? `const emit = defineEmits<{\n${models.map((model) => `    'update:${model.name}': [value: ${readType(model)}];`).join('\n')}\n}>();\n` : ''}const { bindings, slotContent, slotNodes${primary ? `, errors, invalid, element${noHint ? ', messageId, validationFrame, nativeSlot' : ''}` : ''} } = useWebAwesome(\n    [${name.charAt(0).toLowerCase() + name.slice(1)}Definition],\n    '${tag}',\n    () => import('#front-awesome-webawesome${pro ? '-pro' : ''}/components/${slug}/${slug}.js'),\n    { props${models.length ? `, models: [\n${modelPorts}\n    ]` : ''} },\n);\n${primary ? 'defineExpose({ errors, invalid, get $el() { return element.value; } });\n' : ''}</script>\n`;
    output(`resources/js/components/${directory}/${name}.vue`, code);
}
output(`resources/js/WebAwesome/${prefix}Props.ts`, types);
const exportFile = pro
    ? 'resources/js/components/WebAwesomePro/index.ts'
    : 'resources/js/components/WebAwesome/generated.ts';
output(
    exportFile,
    definitions
        .filter((definition) => definition.generated)
        .map(
            ({ name }) =>
                `export { default as ${name} } from './${name}.vue';\nexport type { ${name}Props } from '../../WebAwesome/${prefix}Props';`,
        )
        .join('\n') + '\n',
);
output(
    pro ? 'tests/pro/OptionalProComponents.vue' : 'tests/frontend/OptionalComponents.vue',
    `<template>\n${definitions
        .filter((d) => d.generated)
        .map((d) => `    <${d.name} />`)
        .join('\n')}\n</template>\n\n<script setup lang="ts">\nimport { ${definitions
        .filter((d) => d.generated)
        .map((d) => d.name)
        .join(
            ', ',
        )} } from '@artisan-toolbox/front-awesome/components/WebAwesome${pro ? '/Pro' : ''}';\n</script>\n`,
);
for (const [file, content] of outputs) {
    const formatted = await format(file, content, {
        singleQuote: true,
        semi: true,
        tabWidth: file.endsWith('.json') ? 2 : 4,
    });
    if (formatted.errors.length) throw new Error(JSON.stringify(formatted.errors));
    if (file.endsWith('.vue')) {
        const path = resolve(root, file);
        const { descriptor } = parse(formatted.code, { filename: path });
        compileScript(descriptor, {
            id: file,
            fs: {
                fileExists: (filename) =>
                    outputs.has(relative(root, filename)) || existsSync(filename),
                readFile: (filename) =>
                    outputs.get(relative(root, filename)) ?? readFileSync(filename, 'utf8'),
            },
        });
    }
    writeOutput(file, formatted.code);
}
const packageFile = resolve(root, 'package.json');
const pkg = JSON.parse(readFileSync(packageFile, 'utf8'));
for (const { name } of definitions.filter((definition) => definition.generated)) {
    for (const prefix of ['components', 'components/WebAwesome'])
        pkg.exports[`./${prefix}/${name}.vue`] =
            `./resources/js/components/${directory}/${name}.vue`;
}
if (pro) {
    pkg.exports['./components/WebAwesome/Pro'] = './resources/js/components/WebAwesomePro/index.ts';
    pkg.imports['#front-awesome-webawesome-pro/*'] = '@web.awesome.me/webawesome-pro/dist/*';
}
if (!check) writeFileSync(packageFile, `${JSON.stringify(pkg, null, 2)}\n`);
else
    for (const { name } of definitions)
        for (const prefix of ['components', 'components/WebAwesome']) {
            if (
                pkg.exports[`./${prefix}/${name}.vue`] !==
                `./resources/js/components/${directory}/${name}.vue`
            )
                throw new Error(`Missing public export: ${prefix}/${name}.vue`);
        }
console.log(
    `${check ? 'Checked' : 'Generated'} ${definitions.filter((definition) => definition.generated).length} wrappers against ${definitions.length} upstream ${pro ? 'Pro-only' : 'Core'} components.`,
);
