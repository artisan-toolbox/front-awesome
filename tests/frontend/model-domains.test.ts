import { expect, test } from 'vite-plus/test';
import { modelSnapshot, sameModelSnapshot } from '../../resources/js/WebAwesome/modelSnapshot';
import { modelDomains } from '../../resources/js/WebAwesome/modelDomains';

test.each([
    { name: 'strings', accepts: modelDomains.strings, item: 'one' },
    { name: 'selection', accepts: modelDomains.selection, item: 'one' },
    { name: 'tags', accepts: modelDomains.tags, item: 'one' },
    { name: 'files', accepts: modelDomains.files, item: new File(['one'], 'one.txt') },
    { name: 'sort', accepts: modelDomains.sort, item: { id: 'name', desc: false } },
    { name: 'filters', accepts: modelDomains.filters, item: { id: 'name', value: 'one' } },
    { name: 'keys', accepts: modelDomains.keys, item: 1 },
    { name: 'records', accepts: modelDomains.records, item: { id: 1 } },
])(
    'rejects missing entries in the $name array domain while accepting empty arrays',
    ({ accepts, item }) => {
        const values = [item, item];
        expect(accepts(values)).toBe(true);
        expect(accepts([])).toBe(true);
        Reflect.deleteProperty(values, '0');
        expect(accepts(values)).toBe(false);
        Reflect.deleteProperty(values, '1');
        expect(accepts(values)).toBe(false);
    },
);

test('rejects coercions and malformed rich values at the control boundary', () => {
    expect(modelDomains.boolean('true')).toBe(false);
    expect(modelDomains.number('2')).toBe(false);
    expect(modelDomains.number(Number.NaN)).toBe(false);
    expect(modelDomains.number(Number.POSITIVE_INFINITY)).toBe(false);
    expect(modelDomains.nullableString(2)).toBe(false);
    expect(modelDomains.selection(['one', 2])).toBe(false);
    expect(modelDomains.tags({ one: 'two' })).toBe(false);
    expect(modelDomains.dateInput({ from: '2026-11-09' })).toBe(false);
    expect(modelDomains.datePicker({ from: 2 })).toBe(false);
    expect(modelDomains.dateView('weeks')).toBe(false);
    expect(modelDomains.sort([{ id: 'name', desc: 'false' }])).toBe(false);
    expect(modelDomains.filters([{ id: 'name' }])).toBe(false);
    expect(modelDomains.keys([{}])).toBe(false);
    expect(modelDomains.records([[]])).toBe(false);
});

test('accepts supported nullable, normalized and convenience setter domains', () => {
    expect(modelDomains.nullableString(null)).toBe(true);
    expect(modelDomains.radio(2)).toBe(true);
    expect(modelDomains.selection(['one', 'two'])).toBe(true);
    expect(modelDomains.tags(new FormData())).toBe(true);
    expect(modelDomains.date(new Date(2026, 10, 9))).toBe(true);
    expect(modelDomains.dateInput({ from: new Date(2026, 10, 9), to: null })).toBe(true);
    expect(modelDomains.datePicker({ from: '2026-11-09', to: new Date(2026, 10, 10) })).toBe(true);
    expect(modelDomains.dateView('months')).toBe(true);
    expect(modelDomains.sort([{ id: 'name', desc: false }])).toBe(true);
    expect(modelDomains.filters([{ id: 'name', value: undefined }])).toBe(true);
    expect(modelDomains.keys([1, 'two'])).toBe(true);
    expect(modelDomains.records([{ id: 1 }])).toBe(true);
});

test('detects in-place structured changes without rewriting equivalent snapshots or opaque identities', () => {
    const values = ['one'];
    const value = { values, nested: { enabled: true }, day: new Date(2026, 10, 9) };
    const original = modelSnapshot(value);
    expect(sameModelSnapshot(original, modelSnapshot(value))).toBe(true);
    values.push('two');
    expect(sameModelSnapshot(original, modelSnapshot(value))).toBe(false);
    const beforeNested = modelSnapshot(value);
    value.nested.enabled = false;
    expect(sameModelSnapshot(beforeNested, modelSnapshot(value))).toBe(false);
    const beforeDate = modelSnapshot(value);
    value.day.setDate(10);
    expect(sameModelSnapshot(beforeDate, modelSnapshot(value))).toBe(false);
    const callback = () => 'value';
    expect(sameModelSnapshot(modelSnapshot(callback), modelSnapshot(callback))).toBe(true);
    expect(
        sameModelSnapshot(modelSnapshot(new Blob(['one'])), modelSnapshot(new Blob(['one']))),
    ).toBe(false);
    const data = new FormData();
    data.append('tags', 'one');
    const beforeData = modelSnapshot(data);
    data.append('tags', 'two');
    expect(sameModelSnapshot(beforeData, modelSnapshot(data))).toBe(false);
});

test('captures cyclic records and sparse arrays without losing mutation differences', () => {
    const value: { name: string; self?: unknown } = { name: 'First' };
    value.self = value;
    const original = modelSnapshot(value);
    value.name = 'Second';
    expect(sameModelSnapshot(original, modelSnapshot(value))).toBe(false);
    const values = ['one'];
    const before = modelSnapshot(values);
    Reflect.deleteProperty(values, '0');
    expect(sameModelSnapshot(before, modelSnapshot(values))).toBe(false);
});
