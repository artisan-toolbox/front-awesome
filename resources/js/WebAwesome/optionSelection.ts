import { computed, inject, toDisplayString, toRaw, type InjectionKey } from 'vue';
import type { FrontAwesomeOptionTypes } from '../index';
import { modelSnapshot, sameModelSnapshot } from './modelSnapshot';

export interface OptionDefaults {
    optionValue?: string | null;
    optionLabel?: string | null;
}

export const optionDefaultsKey: InjectionKey<OptionDefaults> = Symbol('front-awesome.options');

export interface OptionGroup<O> {
    label?: string;
    options: readonly O[];
}

export interface OptionSelectionProps<O, K extends string | null | undefined, G extends boolean> {
    grouped?: G;
    options?: G extends true ? readonly OptionGroup<O>[] : readonly O[];
    optionValue?: K;
    optionLabel?: string | null;
}

type ApplicationValueKey = FrontAwesomeOptionTypes extends { optionValue: infer K extends string }
    ? K
    : undefined;

type ValueAt<O, K> = K extends string ? (K extends keyof O ? O[K] : undefined) : O;

export type OptionValue<O, K> = Exclude<
    O extends unknown ? ValueAt<O, K extends undefined ? ApplicationValueKey : K> : never,
    undefined
>;

export type OptionModel<V, M extends boolean> = M extends true ? V[] | null : V | null;

type SelectionRow<O, V> = {
    option: O;
    value: V;
    label: string;
    nativeValue: string;
    disabled: boolean;
};

function isOptionGroup<O>(group: O | OptionGroup<O>): group is OptionGroup<O> {
    return (
        group !== null &&
        typeof group === 'object' &&
        'options' in group &&
        Array.isArray(group.options) &&
        (!('label' in group) || group.label === undefined || typeof group.label === 'string')
    );
}

export function optionGroupVisibility<O, V>(
    groups: readonly { label?: string; options: readonly SelectionRow<O, V>[] }[],
    matching: ReadonlySet<string> | undefined,
) {
    let hasVisibleGroup = false;
    return groups.map(({ label, options }) => {
        const visible = options.some((option) => !matching || matching.has(option.nativeValue));
        const divider = visible && hasVisibleGroup;
        hasVisibleGroup ||= visible;
        return { label, options, visible, divider };
    });
}

function propertyOf(value: unknown, key: string | null | undefined): unknown {
    if (key == null) return value;
    return value !== null &&
        typeof value === 'object' &&
        Reflect.has(value, key) &&
        Object.hasOwn(value, key)
        ? Reflect.get(value, key)
        : undefined;
}

function textValue(value: unknown): string {
    return typeof value === 'string' ? value : toDisplayString(value);
}

export function useOptionSelection<
    O,
    K extends string | null | undefined,
    M extends boolean,
    G extends boolean,
>(props: OptionSelectionProps<O, K, G> & { multiple?: M }) {
    type Value = OptionValue<O, K>;
    type Model = OptionModel<Value, M>;
    const defaults = inject(optionDefaultsKey, {});
    const multiple = () => props.multiple != null && props.multiple !== false;
    const grouped = () => props.grouped != null && props.grouped !== false;

    const groups = computed(() => {
        const source = props.options ?? [];
        let input: readonly OptionGroup<O>[];
        if (grouped()) {
            if (!Array.isArray(source) || !Array.from(source).every(isOptionGroup<O>)) {
                throw new TypeError(
                    'Grouped options must contain objects with an options array and an optional string label.',
                );
            }
            input = source;
        } else {
            input = [{ options: source as readonly O[] }];
        }

        const valueKey = props.optionValue === undefined ? defaults.optionValue : props.optionValue;
        const labelKey = props.optionLabel === undefined ? defaults.optionLabel : props.optionLabel;
        const values = input.map(({ label, options }) => ({
            label,
            options: options.flatMap((option) => {
                const value = propertyOf(option, valueKey);
                if (value === undefined) return [];
                return [
                    {
                        option,
                        value: value as Value,
                        label: textValue(propertyOf(option, labelKey)),
                        disabled: propertyOf(option, 'disabled') === true,
                    },
                ];
            }),
        }));
        const stringValues = new Set<string>(
            values.flatMap((group) =>
                group.options.flatMap(({ value }) => (typeof value === 'string' ? [value] : [])),
            ),
        );
        const assigned = new Set<string>();
        return values
            .filter(({ options }) => options.length > 0)
            .map(({ label, options }) => ({
                label,
                options: options.map((row): SelectionRow<O, Value> => {
                    const base = textValue(row.value);
                    let nativeValue = base;
                    let suffix = 0;
                    while (
                        assigned.has(nativeValue) ||
                        (typeof row.value !== 'string' && stringValues.has(nativeValue))
                    ) {
                        nativeValue = `${base}~${++suffix}`;
                    }
                    assigned.add(nativeValue);
                    return { ...row, nativeValue };
                }),
            }));
    });
    const choices = computed(() => groups.value.flatMap((group) => group.options));
    const nativeValues = computed(
        () => new Map(choices.value.map((row) => [row.nativeValue, row])),
    );
    const lookup = computed(
        () =>
            new Map<unknown, string>(
                choices.value.map((row) => [toRaw(row.value), row.nativeValue]),
            ),
    );
    function encodeValue(value: unknown) {
        const raw = toRaw(value);
        const exact = lookup.value.get(raw);
        if (exact !== undefined) return exact;
        if (raw !== null && typeof raw === 'object') {
            const snapshot = modelSnapshot(raw);
            const match = choices.value.find((row) =>
                sameModelSnapshot(modelSnapshot(toRaw(row.value)), snapshot),
            );
            if (match) return match.nativeValue;
        }
        const serialized = textValue(raw);
        if (!nativeValues.value.has(serialized)) return serialized;
        let missing = 'fa-unmatched';
        while (nativeValues.value.has(missing)) missing += '~';
        return missing;
    }
    const empty: string[] = [];
    let encoded: string[] = empty;
    function write(value: Model) {
        if (value === null) return empty;
        if (!multiple() || !Array.isArray(value)) return encodeValue(value);

        const next = value.map(encodeValue);
        if (next.length !== encoded.length || next.some((item, index) => encoded[index] !== item))
            encoded = next;
        return encoded;
    }
    function decodeValue(value: string): unknown {
        const row = nativeValues.value.get(value);
        return row ? row.value : value;
    }
    function read(value: unknown): unknown {
        if (typeof value === 'string') return decodeValue(value);
        if (Array.isArray(value))
            return value.map((item: unknown) =>
                typeof item === 'string' ? decodeValue(item) : item,
            );
        return value;
    }
    function accepts(value: unknown): value is Model {
        return (
            value === null ||
            (!multiple() && value !== undefined) ||
            (Array.isArray(value) &&
                Array.from(value.keys()).every(
                    (index) => Object.hasOwn(value, index) && value[index] !== undefined,
                ))
        );
    }
    return { groups, choices, accepts, codec: { write, read } };
}
