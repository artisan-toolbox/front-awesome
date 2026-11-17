import type { ComputedRef } from 'vue';
import { modelSnapshot, sameModelSnapshot, type ModelSnapshot } from './modelSnapshot';
import { useFormBridge } from './useFormBridge';
import type { FormBridgeSource } from './useFormBridge';

export interface WebAwesomeModelPort {
    readonly name: string;
    readonly property: string;
    readonly events: readonly string[];
    readonly form: boolean;
    readonly autofill?: 'text' | 'host';
    readonly observeAttribute?: string;
    readonly ownerEvent?: { tag: string; name: string; itemKey: string };
    readonly errors: ComputedRef<readonly string[]>;
    readonly invalid: ComputedRef<boolean>;
    current: () =>
        | {
              value: unknown;
              snapshot: ModelSnapshot;
              sameOwner: () => boolean;
              unchanged: () => boolean;
              apply: (element: HTMLElement) => void;
          }
        | undefined;
    commit: (element: HTMLElement, event?: Event) => { value: unknown } | undefined;
    captureCommit: () => (element: HTMLElement, event?: Event) => { value: unknown } | undefined;
}

interface ModelOptions<W, R> {
    name: string;
    property: string;
    events: readonly string[];
    form: boolean;
    autofill?: 'text' | 'host';
    componentName: string;
    acceptsWrite: (value: unknown) => value is W;
    acceptsRead: (value: unknown) => value is R;
    emitValue: (value: R) => void;
    observeAttribute?: string;
    ownerEvent?: { tag: string; name: string; itemKey: string };
    writer?:
        | { kind: 'method'; method: string }
        | { kind: 'boolean-method'; on: string; off: string }
        | { kind: 'nullable-selection' };
    reader?: { kind: 'detail' | 'local-date-detail'; key: string };
}

/** Capture each value domain before storing heterogeneous, value-free model operations. */
export function useWebAwesomeModel<W, R>(
    props: object,
    options: ModelOptions<W, R>,
): WebAwesomeModelPort {
    const bridge = useFormBridge(props, {
        ...options,
        modelName: options.name,
        optional: true,
        allowForm: options.form,
        nativeAliases: [
            `.${options.property}`,
            `.${options.property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}`,
            options.property,
            options.property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`),
        ],
    });
    function sameOwner(captured: FormBridgeSource<W, R>) {
        const current = bridge.source.value;
        return captured.kind === 'model'
            ? current.kind === 'model' && current.name === captured.name
            : captured.kind === 'form' &&
                  current.kind === 'form' &&
                  current.form === captured.form &&
                  current.path === captured.path;
    }
    function captureCommit() {
        const captured = bridge.source.value;
        return (element: HTMLElement, event?: Event) => {
            if (captured.kind === 'native' || !sameOwner(captured)) return;
            let value: unknown = Reflect.get(element, options.property);
            const detail: unknown = event && Reflect.get(event, 'detail');
            if (options.reader && detail !== null && typeof detail === 'object') {
                value = Reflect.get(detail, options.reader.key);
                if (
                    options.reader.kind === 'local-date-detail' &&
                    value instanceof Date &&
                    Number.isFinite(value.getTime())
                ) {
                    value = `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`;
                }
            }
            if (!options.acceptsRead(value))
                throw new Error(
                    `Front Awesome ${options.componentName} received an unsupported native "${options.property}" value.`,
                );
            captured.commit(value);
            return { value };
        };
    }
    return {
        name: options.name,
        property: options.property,
        events: options.events,
        form: options.form,
        autofill: options.autofill,
        observeAttribute: options.observeAttribute,
        ownerEvent: options.ownerEvent,
        errors: bridge.errors,
        invalid: bridge.invalid,
        current() {
            const source = bridge.source.value;
            if (source.kind === 'native') return undefined;
            const value = source.current();
            const snapshot = modelSnapshot(value);
            return {
                value,
                snapshot,
                sameOwner: () => sameOwner(source),
                unchanged: () =>
                    sameOwner(source) &&
                    Object.is(bridge.value.value, value) &&
                    sameModelSnapshot(modelSnapshot(bridge.value.value), snapshot),
                apply(element) {
                    if (!options.writer) {
                        Reflect.set(element, options.property, value);
                        return;
                    }
                    if (options.writer.kind === 'nullable-selection') {
                        Reflect.set(element, options.property, value === null ? [] : value);
                        return;
                    }
                    const methodName =
                        options.writer.kind === 'method'
                            ? options.writer.method
                            : value
                              ? options.writer.on
                              : options.writer.off;
                    const method: unknown = Reflect.get(element, methodName);
                    if (typeof method !== 'function')
                        throw new Error(
                            `Front Awesome ${options.componentName} requires native method "${methodName}".`,
                        );
                    Reflect.apply(method, element, options.writer.kind === 'method' ? [value] : []);
                },
            };
        },
        captureCommit,
        commit(element, event) {
            return captureCommit()(element, event);
        },
    };
}
