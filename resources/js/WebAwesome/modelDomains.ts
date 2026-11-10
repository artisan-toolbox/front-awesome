function record(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
}
const boolean = (value: unknown): value is boolean => typeof value === 'boolean';
const number = (value: unknown): value is number =>
    typeof value === 'number' && Number.isFinite(value);
const string = (value: unknown): value is string => typeof value === 'string';
const nullableString = (value: unknown): value is string | null => value === null || string(value);
const strings = (value: unknown): value is string[] =>
    Array.isArray(value) && Array.from(value).every(string);
const date = (value: unknown): value is string | Date | null =>
    value === null || string(value) || value instanceof Date;
function dateInput(
    value: unknown,
): value is string | Date | { from?: Date | null; to?: Date | null } | null {
    return (
        date(value) ||
        (record(value) &&
            [value.from, value.to].every(
                (part) => part === undefined || part === null || part instanceof Date,
            ))
    );
}
export type DatePickerModelValue =
    | string
    | Date
    | { from?: string | Date | null; to?: string | Date | null }
    | null;
function datePicker(value: unknown): value is DatePickerModelValue {
    return (
        date(value) ||
        (record(value) && [value.from, value.to].every((part) => part === undefined || date(part)))
    );
}
export const modelDomains = {
    boolean,
    number,
    string,
    nullableString,
    strings,
    date,
    dateInput,
    datePicker,
    nullableNumber: (value: unknown): value is number | null => value === null || number(value),
    radio: (value: unknown): value is string | number | null =>
        nullableString(value) || number(value),
    selection: (value: unknown): value is string | string[] | null =>
        nullableString(value) || strings(value),
    tags: (value: unknown): value is string[] | string | FormData | null =>
        nullableString(value) ||
        strings(value) ||
        (typeof FormData !== 'undefined' && value instanceof FormData),
    files: (value: unknown): value is File[] =>
        Array.isArray(value) &&
        Array.from(value).every((file) => typeof File !== 'undefined' && file instanceof File),
    dateView: (value: unknown): value is 'days' | 'months' | 'years' =>
        value === 'days' || value === 'months' || value === 'years',
    sort: (value: unknown): value is { id: string; desc: boolean }[] =>
        Array.isArray(value) &&
        Array.from(value).every((item) => record(item) && string(item.id) && boolean(item.desc)),
    filters: (value: unknown): value is { id: string; value: unknown }[] =>
        Array.isArray(value) &&
        Array.from(value).every(
            (item) => record(item) && string(item.id) && Object.hasOwn(item, 'value'),
        ),
    keys: (value: unknown): value is (string | number)[] =>
        Array.isArray(value) && Array.from(value).every((item) => string(item) || number(item)),
    records: (value: unknown): value is Record<string, unknown>[] =>
        Array.isArray(value) && Array.from(value).every(record),
};
