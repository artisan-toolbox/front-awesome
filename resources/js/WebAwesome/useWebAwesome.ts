import './formBridge.css';
import {
    computed,
    getCurrentInstance,
    h,
    mergeProps,
    useId,
    onBeforeUnmount,
    onMounted,
    onUpdated,
    useAttrs,
    useSlots,
    useTemplateRef,
} from 'vue';
import { modelSnapshot, sameModelSnapshot, type ModelSnapshot } from './modelSnapshot';
import type { WebAwesomeModelPort } from './useWebAwesomeModel';
import { projectNativeSlot } from './nativeSlots';

interface AttributeDefinition {
    attribute: string;
    property: string;
    boolean: boolean;
    enumerated: boolean;
}

interface ComponentDefinition {
    name: string;
    tag: string;
    attributes: readonly AttributeDefinition[];
    properties: readonly string[];
    formAssociated?: boolean;
    slots?: readonly string[];
}

type BindingTarget =
    | { kind: 'attribute'; definition: AttributeDefinition }
    | { kind: 'property'; property: string; boolean: boolean };

function kebabCase(name: string) {
    return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function attributeValue(definition: AttributeDefinition, value: unknown) {
    if (value == null) return null;
    if (definition.enumerated) {
        if (definition.attribute === 'autocorrect')
            return value === false || value === 'off' ? 'off' : 'on';
        return value === false || value === 'false' ? 'false' : 'true';
    }
    if (definition.boolean) return value === false ? null : '';
    return value;
}

export function useWebAwesome(
    definitions: readonly ComponentDefinition[],
    tag: string,
    load: () => Promise<unknown>,
    options: { props?: object; models?: readonly WebAwesomeModelPort[] } = {},
) {
    const matching = definitions.find((candidate) => candidate.tag === tag);
    if (!matching) throw new Error(`Unknown Web Awesome element "${tag}".`);
    const definition = matching;
    const attrs = useAttrs();
    const instance = getCurrentInstance();
    const models = options.models ?? [];
    const primary = models.find((model) => model.form);
    const errors = computed(() => primary?.errors.value ?? []);
    const invalid = computed(() => primary?.invalid.value ?? false);
    const messageId = useId();
    const nativeSlot = computed(() => {
        const value: unknown =
            options.props && Object.hasOwn(options.props, 'slot')
                ? Reflect.get(options.props, 'slot')
                : attrs.slot;
        return typeof value === 'string' ? value : undefined;
    });
    const validationFrame = computed(() =>
        Boolean(
            primary &&
            !definition.slots?.includes('hint') &&
            (primary.current() || Object.hasOwn(instance?.vnode.props ?? {}, 'failed')),
        ),
    );
    const hasHint = definition.slots?.includes('hint') ?? false;
    const bridgeKeys = new Set([
        'modelValue',
        'model-value',
        'modelModifiers',
        'field',
        'fieldName',
        'field-name',
        'failed',
    ]);
    const removers: (() => void)[] = [];
    const owners = new Map<WebAwesomeModelPort, { element: Element; remove: () => void }>();
    const slots = useSlots();
    const element = useTemplateRef<HTMLElement>('element');
    const targets = new Map<string, BindingTarget>();
    const resetAttributes = new Map<string, AttributeDefinition>();
    const initialAttributes = new Map<string, unknown>();
    const propertyDestinations = new Set<string>();
    let modelWriters = new Map<string, (element: HTMLElement) => void>();
    let pendingSnapshots = new Map<string, ModelSnapshot>();
    let appliedSnapshots = new Map<string, ModelSnapshot>();
    let pendingProperties = new Map<string, unknown>();
    let appliedProperties = new Map<string, unknown>();
    let phase: 'pending' | 'ready' | 'unmounted' = 'pending';

    const isUnmounted = () => phase === 'unmounted';

    for (const attribute of definition.attributes) {
        const target: BindingTarget = { kind: 'attribute', definition: attribute };
        for (const name of [attribute.attribute, attribute.property, kebabCase(attribute.property)])
            targets.set(name, target);
        const live = attribute.property.replace(/^default([A-Z])/, (_, first: string) =>
            first.toLowerCase(),
        );
        if (live !== attribute.property && definition.properties.includes(live))
            resetAttributes.set(live, attribute);
    }
    for (const property of definition.properties) {
        if (property.startsWith('default') && targets.has(property)) continue;
        const attribute = resetAttributes.get(property);
        const target: BindingTarget = {
            kind: 'property',
            property,
            boolean: attribute?.boolean ?? false,
        };
        targets.set(property, target);
        targets.set(kebabCase(property), target);
    }

    function collect() {
        const bindings: Record<string, unknown> = {};
        const properties = new Map<string, unknown>();
        const seen = new Map<string, unknown>();
        const allInputs: Record<string, unknown> = { ...attrs };
        for (const key of Object.keys(instance?.vnode.props ?? {})) {
            const property = key.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase());
            if (options.props && Object.hasOwn(options.props, property))
                allInputs[key] = Reflect.get(options.props, property);
        }
        const suppliedInputs: Record<string, unknown> = {};
        for (const key of Object.keys(instance?.vnode.props ?? {}))
            if (Object.hasOwn(allInputs, key)) suppliedInputs[key] = allInputs[key];
        Object.assign(suppliedInputs, allInputs);
        const boundProperties = new Set(
            models.filter((model) => model.current()).map((model) => model.property),
        );
        for (const [key, supplied] of Object.entries(suppliedInputs)) {
            if (
                primary &&
                (bridgeKeys.has(key) || (key === 'form' && typeof supplied !== 'string'))
            )
                continue;
            if (
                models.some(
                    (model) => key === `${model.name}Modifiers` || key === `onUpdate:${model.name}`,
                )
            )
                continue;
            if (hasHint && errors.value.length && key === 'hint') continue;
            const forcedProperty = key.startsWith('.');
            const forcedAttribute = key.startsWith('^');
            const name = forcedProperty || forcedAttribute ? key.slice(1) : key;
            let target = targets.get(name);
            if (forcedAttribute) {
                const attribute = definition.attributes.find((item) => item.attribute === name);
                if (attribute) target = { kind: 'attribute', definition: attribute };
            }
            if (forcedProperty)
                target = {
                    kind: 'property',
                    property:
                        target?.kind === 'attribute'
                            ? target.definition.property
                            : (target?.property ?? name),
                    boolean:
                        target?.kind === 'attribute'
                            ? target.definition.boolean
                            : (target?.boolean ?? false),
                };
            if (!target) {
                bindings[key] = supplied;
                continue;
            }
            const rich =
                supplied !== null &&
                (typeof supplied === 'object' || typeof supplied === 'function');
            const property =
                target.kind === 'property' ? target.property : target.definition.property;
            if (boundProperties.has(property)) continue;
            if (rich && !forcedAttribute) propertyDestinations.add(property);
            const useProperty =
                target.kind === 'property' ||
                (!forcedAttribute && propertyDestinations.has(property));
            const destination = useProperty
                ? `.${property}`
                : `^${target.kind === 'attribute' ? target.definition.attribute : name}`;
            if (seen.has(destination) && !Object.is(seen.get(destination), supplied))
                throw new Error(
                    `Front Awesome ${definition.name} received conflicting aliases for "${property}".`,
                );
            seen.set(destination, supplied);
            if (useProperty) {
                const boolean =
                    target.kind === 'property' ? target.boolean : target.definition.boolean;
                properties.set(
                    property,
                    boolean && !rich ? supplied !== false && supplied != null : supplied,
                );
            } else if (target.kind === 'attribute')
                bindings[destination] = attributeValue(target.definition, supplied);
        }
        modelWriters = new Map();
        pendingSnapshots = new Map();
        for (const model of models) {
            const current = model.current();
            if (current) {
                properties.set(model.property, current.value);
                modelWriters.set(model.property, current.apply);
                pendingSnapshots.set(model.property, current.snapshot);
            }
        }
        if (errors.value.length) {
            bindings['aria-errormessage'] = [bindings['aria-errormessage'], messageId]
                .filter(Boolean)
                .join(' ');
        }
        if (invalid.value) {
            bindings['aria-invalid'] = 'true';
            bindings['data-fa-invalid'] = '';
            bindings.class = mergeProps(
                { class: bindings.class },
                { class: 'fa-form-invalid' },
            ).class;
            bindings['data-fa-form-error-style'] =
                definition.name === 'Rating'
                    ? 'symbols'
                    : definition.name === 'DatePicker'
                      ? 'calendar'
                      : 'form-control';
        }
        for (const [property, attribute] of resetAttributes) {
            if (!initialAttributes.has(attribute.attribute))
                initialAttributes.set(attribute.attribute, properties.get(property));
            const destination = `^${attribute.attribute}`;
            if (Object.hasOwn(bindings, destination) || properties.has(attribute.property))
                continue;
            const initial = initialAttributes.get(attribute.attribute);
            if (initial !== null && (typeof initial === 'object' || typeof initial === 'function'))
                continue;
            bindings[destination] = attributeValue(attribute, initial);
        }
        pendingProperties = properties;
        return bindings;
    }

    function applyProperties() {
        const root = element.value;
        if (phase !== 'ready' || !root) return;
        collect();
        const ordered = [...pendingProperties].sort(
            ([left], [right]) =>
                Number(right.startsWith('default')) - Number(left.startsWith('default')),
        );
        for (const [property, value] of ordered) {
            const sameIdentity = Object.is(appliedProperties.get(property), value);
            const snapshot = pendingSnapshots.get(property);
            const mutated =
                appliedProperties.has(property) &&
                sameIdentity &&
                snapshot !== undefined &&
                !sameModelSnapshot(appliedSnapshots.get(property), snapshot);
            if (!appliedProperties.has(property) || !sameIdentity || mutated) {
                if (modelWriters.has(property)) modelWriters.get(property)?.(root);
                else Reflect.set(root, property, value);
                if (mutated) {
                    const requestUpdate: unknown = Reflect.get(root, 'requestUpdate');
                    if (typeof requestUpdate === 'function') Reflect.apply(requestUpdate, root, []);
                }
            }
        }
        appliedProperties = new Map(pendingProperties);
        appliedSnapshots = new Map(pendingSnapshots);
    }

    function commitModel(model: WebAwesomeModelPort, root: HTMLElement, event?: Event) {
        const committed = model.commit(root, event);
        if (committed) {
            appliedProperties.set(model.property, committed.value);
            appliedSnapshots.set(model.property, modelSnapshot(committed.value));
        }
    }

    function bindOwners() {
        const root = element.value;
        if (!root) return;
        for (const model of models) {
            const contract = model.ownerEvent;
            if (!contract) continue;
            const owner = root.parentElement?.closest(contract.tag);
            if (owners.get(model)?.element === owner) continue;
            owners.get(model)?.remove();
            owners.delete(model);
            if (!owner) continue;
            const listener = (event: Event) => {
                const detail: unknown = Reflect.get(event, 'detail');
                if (
                    phase !== 'ready' ||
                    event.currentTarget !== owner ||
                    !detail ||
                    typeof detail !== 'object' ||
                    Reflect.get(detail, contract.itemKey) !== root
                )
                    return;
                commitModel(model, root, event);
            };
            owner.addEventListener(contract.name, listener);
            owners.set(model, {
                element: owner,
                remove: () => owner.removeEventListener(contract.name, listener),
            });
        }
    }

    function onReset(event: Event) {
        const root = element.value;
        if (!root || !definition.formAssociated || Reflect.get(root, 'form') !== event.target)
            return;
        const commits = models.map((model) => model.captureCommit());
        queueMicrotask(() => {
            if (phase === 'ready' && !event.defaultPrevented && element.value === root)
                for (const commit of commits) commit(root);
        });
    }

    onMounted(async () => {
        const root = element.value;
        if (root) {
            for (const model of models) {
                if (model.property === 'open') {
                    for (const name of ['wa-show', 'wa-hide']) {
                        const listener = (event: Event) => {
                            if (event.currentTarget !== root || event.target !== root) return;
                            const commit = model.captureCommit();
                            queueMicrotask(() => {
                                if (phase === 'ready' && event.defaultPrevented) commit(root);
                            });
                        };
                        root.addEventListener(name, listener);
                        removers.push(() => root.removeEventListener(name, listener));
                    }
                }
                for (const name of model.events) {
                    const listener = (event: Event) => {
                        if (
                            phase === 'ready' &&
                            event.currentTarget === root &&
                            event.target === root
                        )
                            commitModel(model, root, event);
                    };
                    root.addEventListener(name, listener);
                    removers.push(() => root.removeEventListener(name, listener));
                }
            }
            if (definition.formAssociated && models.length) {
                root.ownerDocument.addEventListener('reset', onReset, true);
                removers.push(() => root.ownerDocument.removeEventListener('reset', onReset, true));
            }
        }
        bindOwners();
        await load();
        if (isUnmounted()) return;
        const update: unknown = element.value && Reflect.get(element.value, 'updateComplete');
        if (update instanceof Promise) await update;
        if (isUnmounted()) return;
        phase = 'ready';
        const rootElement = element.value;
        const observed = models.filter((model) => model.observeAttribute);
        if (rootElement && observed.length) {
            const observer = new MutationObserver((records) => {
                if (phase !== 'ready') return;
                for (const model of observed)
                    if (records.some((record) => record.attributeName === model.observeAttribute))
                        commitModel(model, rootElement);
            });
            observer.observe(rootElement, {
                attributes: true,
                attributeFilter: observed.flatMap((model) =>
                    model.observeAttribute ? [model.observeAttribute] : [],
                ),
            });
            removers.push(() => observer.disconnect());
        }
        applyProperties();
    });
    onUpdated(() => {
        bindOwners();
        applyProperties();
    });
    onBeforeUnmount(() => {
        phase = 'unmounted';
        for (const remove of removers) remove();
        for (const owner of owners.values()) owner.remove();
    });

    const slotNodes = () =>
        Object.entries(slots)
            .flatMap(([name, slot]) =>
                projectNativeSlot(
                    slot?.() ?? [],
                    name === 'default' ? undefined : name,
                    hasHint && errors.value.length ? ['hint'] : [],
                ),
            )
            .concat(
                hasHint && errors.value.length
                    ? [
                          h(
                              'span',
                              { slot: 'hint', role: 'alert', id: messageId },
                              errors.value.map((message) =>
                                  h('span', { class: 'fa-form-error-message' }, message),
                              ),
                          ),
                      ]
                    : [],
            );
    function slotContent(props: { nodes?: ReturnType<typeof slotNodes> } = {}) {
        return props.nodes ?? slotNodes();
    }
    slotContent.props = ['nodes'];
    return {
        bindings: collect,
        errors,
        invalid,
        element,
        messageId,
        validationFrame,
        nativeSlot,
        slotContent,
        slotNodes,
    };
}
