export type ModelSnapshot =
    | { kind: 'identity'; value: unknown }
    | { kind: 'date'; value: number }
    | { kind: 'sequence'; values: ModelSnapshot[] }
    | { kind: 'record'; entries: [string, ModelSnapshot][] };

/** Capture supported mutable value contents without changing the value sent to a native setter. */
export function modelSnapshot(value: unknown, seen = new WeakSet<object>()): ModelSnapshot {
    if (value === null || typeof value !== 'object') return { kind: 'identity', value };
    if (seen.has(value)) return { kind: 'identity', value };
    seen.add(value);
    if (value instanceof Date) return { kind: 'date', value: value.getTime() };
    if (Array.isArray(value))
        return { kind: 'sequence', values: Array.from(value, (item) => modelSnapshot(item, seen)) };
    if (typeof FormData !== 'undefined' && value instanceof FormData)
        return {
            kind: 'record',
            entries: [...value.entries()].map(([key, item]) => [key, modelSnapshot(item, seen)]),
        };
    const prototype: unknown = Reflect.getPrototypeOf(value);
    if (prototype === Object.prototype || prototype === null)
        return {
            kind: 'record',
            entries: Object.keys(value)
                .sort()
                .map((key) => [key, modelSnapshot(Reflect.get(value, key), seen)]),
        };
    return { kind: 'identity', value };
}

export function sameModelSnapshot(left: ModelSnapshot | undefined, right: ModelSnapshot): boolean {
    if (!left || left.kind !== right.kind) return false;
    switch (right.kind) {
        case 'identity':
            return left.kind === 'identity' && Object.is(left.value, right.value);
        case 'date':
            return left.kind === 'date' && Object.is(left.value, right.value);
        case 'sequence':
            return (
                left.kind === 'sequence' &&
                left.values.length === right.values.length &&
                right.values.every((value, index) => sameModelSnapshot(left.values[index], value))
            );
        case 'record':
            return (
                left.kind === 'record' &&
                left.entries.length === right.entries.length &&
                right.entries.every(
                    ([key, value], index) =>
                        left.entries[index]?.[0] === key &&
                        sameModelSnapshot(left.entries[index]?.[1], value),
                )
            );
    }
}
