import type WaInput from '@awesome.me/webawesome/dist/components/input/input.js';
import { nextTick } from 'vue';

export interface TextAutofillOwner {
    readonly value: unknown;
    sameOwner: () => boolean;
    unchanged: () => boolean;
    commit: () => void;
}

interface TextAutofillOptions {
    nativeProperty?: 'input' | 'validationTarget';
    emptyValue?: 'omit';
    captureOwner: () => TextAutofillOwner | undefined;
}

function textValue(element: HTMLElement) {
    const value: unknown = Reflect.get(element, 'value');
    if (typeof value !== 'string' && value !== null)
        throw new Error('Front Awesome autofill requires a string or null native value.');
    return value;
}

function textHost(element: HTMLElement, options: TextAutofillOptions) {
    const definition = customElements.get(element.localName);
    if (!definition || !(element instanceof definition)) return;
    const addController: unknown = Reflect.get(element, 'addController');
    const removeController: unknown = Reflect.get(element, 'removeController');
    const setValue: unknown = Reflect.get(element, 'setValue');
    const updateValidity: unknown = Reflect.get(element, 'updateValidity');
    if (
        typeof addController !== 'function' ||
        typeof removeController !== 'function' ||
        typeof setValue !== 'function' ||
        typeof updateValidity !== 'function'
    )
        throw new Error('Front Awesome autofill requires supported Web Awesome form APIs.');
    return {
        read: () => textValue(element),
        native() {
            const target: unknown = options.nativeProperty
                ? Reflect.get(element, options.nativeProperty)
                : undefined;
            return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
                ? target
                : undefined;
        },
        form() {
            const form: unknown = Reflect.get(element, 'form');
            return form instanceof HTMLFormElement ? form : undefined;
        },
        adopt(value: string) {
            Reflect.set(element, 'value', value);
            return textValue(element);
        },
        publish() {
            const value = textValue(element);
            const submitted = options.emptyValue === 'omit' ? value || null : (value ?? '');
            Reflect.apply(setValue, element, [submitted, value]);
            Reflect.apply(updateValidity, element, []);
        },
        add(controller: Parameters<WaInput['addController']>[0]) {
            Reflect.apply(addController, element, [controller]);
        },
        remove(controller: Parameters<WaInput['addController']>[0]) {
            Reflect.apply(removeController, element, [controller]);
        },
    };
}

export function observeTextAutofill(options: TextAutofillOptions) {
    let synchronizedValue: unknown = options.captureOwner()?.value;
    let acceptedOwner = options.captureOwner();
    let renderedValue: string | null | undefined;
    let resetPending = false;
    let active = true;
    let root: HTMLElement | undefined;
    let removeObservation: (() => void) | undefined;

    function markApplied(value: unknown) {
        const owner = options.captureOwner();
        const rebound = acceptedOwner
            ? !acceptedOwner.sameOwner()
            : owner !== undefined && root !== undefined;
        synchronizedValue = value;
        acceptedOwner = owner;
        if (rebound) {
            renderedValue = undefined;
            const requestUpdate: unknown = root && Reflect.get(root, 'requestUpdate');
            if (typeof requestUpdate === 'function') Reflect.apply(requestUpdate, root, []);
        }
    }

    function inferenceOwner() {
        const owner = options.captureOwner();
        if (!owner) return;
        if (acceptedOwner && !acceptedOwner.sameOwner()) return;
        if (acceptedOwner && !acceptedOwner.unchanged()) {
            if (!Object.is(owner.value, synchronizedValue)) return;
            acceptedOwner = owner;
        }
        return owner;
    }

    function commit(element: HTMLElement, owner = options.captureOwner()) {
        if (!active || !owner) return;
        const value = textValue(element);
        if (Object.is(value, synchronizedValue)) return;
        synchronizedValue = value;
        owner.commit();
        acceptedOwner = options.captureOwner();
    }

    function reset(event: Event) {
        resetPending = true;
        queueMicrotask(() => {
            const element = root;
            if (!active || !element || event.defaultPrevented) {
                resetPending = false;
                return;
            }
            markApplied(textValue(element));
            void Promise.resolve(Reflect.get(element, 'updateComplete')).then(() => {
                if (active && root === element) resetPending = false;
            });
        });
    }

    async function connect(element: HTMLElement) {
        root = element;
        await customElements.whenDefined(element.localName);
        if (!active || root !== element) return;
        customElements.upgrade(element);
        const candidate = textHost(element, options);
        if (!candidate) return;
        const host = candidate;
        await Reflect.get(element, 'updateComplete');
        if (!active || root !== element) return;
        renderedValue = host.read();

        function reconcile() {
            if (!inferenceOwner()) return;
            const current = host.read();
            const native = host.native();
            if (current === renderedValue && native && native.value !== (current ?? '')) {
                host.adopt(native.value);
                host.publish();
            }
        }

        function onActivation(event: Event) {
            if (
                event instanceof KeyboardEvent &&
                (event.key !== 'Enter' ||
                    event.isComposing ||
                    event.altKey ||
                    event.ctrlKey ||
                    event.metaKey)
            )
                return;
            const owner = inferenceOwner();
            const form = host.form();
            if (!owner || !form || resetPending) return;
            const belongs =
                event.type === 'submit'
                    ? event.target === form
                    : event
                          .composedPath()
                          .some(
                              (node) =>
                                  (node instanceof Node && form.contains(node)) ||
                                  (node instanceof HTMLElement &&
                                      'form' in node &&
                                      node.form === form),
                          );
            if (!belongs) return;
            reconcile();
            host.publish();
            commit(element, owner);
        }

        const controller: Parameters<WaInput['addController']>[0] = {
            hostUpdate() {
                if (active && !resetPending) reconcile();
            },
            hostUpdated() {
                renderedValue = host.read();
                resetPending = false;
                const owner = options.captureOwner();
                queueMicrotask(() => {
                    void nextTick().then(() => {
                        if (
                            active &&
                            !resetPending &&
                            root === element &&
                            owner?.unchanged() &&
                            inferenceOwner()
                        )
                            commit(element, owner);
                    });
                });
            },
        };
        host.add(controller);
        for (const name of ['click', 'keydown', 'submit'])
            element.ownerDocument.addEventListener(name, onActivation, true);
        removeObservation = () => {
            host.remove(controller);
            for (const name of ['click', 'keydown', 'submit'])
                element.ownerDocument.removeEventListener(name, onActivation, true);
        };
    }

    function stop() {
        active = false;
        removeObservation?.();
    }

    return { markApplied, commit, reset, connect, stop };
}
