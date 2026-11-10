import { expect, onTestFinished, test } from 'vite-plus/test';
import { createApp, defineComponent, h, nextTick, shallowReactive } from 'vue';
import { useForm } from '@inertiajs/vue3';
import {
    useWebAwesomeModel,
    type WebAwesomeModelPort,
} from '../../resources/js/WebAwesome/useWebAwesomeModel';
import { modelDomains } from '../../resources/js/WebAwesome/modelDomains';

type ModelOptions<W, R> = Parameters<typeof useWebAwesomeModel<W, R>>[1];

function mountModel<W, R>(props: object, options: ModelOptions<W, R>) {
    let model: WebAwesomeModelPort | undefined;
    const Harness = defineComponent({
        setup() {
            model = useWebAwesomeModel(props, options);
            return () => h('div');
        },
    });
    const container = document.createElement('div');
    document.body.append(container);
    const app = createApp({ render: () => h(Harness, { ...props }) });
    app.mount(container);
    onTestFinished(() => {
        app.unmount();
        container.remove();
    });
    if (!model) throw new Error('Expected a mounted model adapter.');
    return model;
}

const booleanOptions = {
    name: 'modelValue',
    property: 'checked',
    events: ['change'],
    form: true,
    componentName: 'Checkbox',
    acceptsWrite: modelDomains.boolean,
    acceptsRead: modelDomains.boolean,
    emitValue: () => {},
} satisfies ModelOptions<boolean, boolean>;

test('rejects an unsupported native commit without emitting or mutating its Inertia field', () => {
    const form = useForm({ accepted: false });
    const model = mountModel({ form, field: 'accepted' }, booleanOptions);
    const element = document.createElement('div');
    Reflect.set(element, 'checked', 'true');
    expect(() => model.commit(element)).toThrow('unsupported native "checked" value');
    expect(form.accepted).toBe(false);
    Reflect.set(element, 'checked', true);
    expect(model.commit(element)).toEqual({ value: true });
    expect(form.accepted).toBe(true);
});

test('requires the declared native writer instead of silently assigning a method-owned value', () => {
    const model = mountModel(
        { currentSlide: 2, 'onUpdate:currentSlide': () => {} },
        {
            ...booleanOptions,
            name: 'currentSlide',
            property: 'currentSlide',
            componentName: 'Carousel',
            acceptsWrite: modelDomains.number,
            acceptsRead: modelDomains.number,
            writer: { kind: 'method', method: 'goToSlide' },
        },
    );
    const element = document.createElement('div');
    expect(() => model.current()?.apply(element)).toThrow('requires native method "goToSlide"');
    expect(Reflect.has(element, 'currentSlide')).toBe(false);
    const positions: number[] = [];
    Reflect.set(element, 'goToSlide', function (this: HTMLElement, value: number) {
        expect(this).toBe(element);
        positions.push(value);
    });
    model.current()?.apply(element);
    expect(positions).toEqual([2]);
});

test('requires both native playback methods when their corresponding state is requested', () => {
    const props = shallowReactive({ playing: true, 'onUpdate:playing': () => {} });
    const model = mountModel(props, {
        ...booleanOptions,
        name: 'playing',
        property: 'paused',
        componentName: 'Video',
        writer: { kind: 'boolean-method', on: 'play', off: 'pause' },
    });
    const element = document.createElement('div');
    expect(() => model.current()?.apply(element)).toThrow('requires native method "play"');
    props.playing = false;
    expect(() => model.current()?.apply(element)).toThrow('requires native method "pause"');
    expect(Reflect.has(element, 'paused')).toBe(false);
});

test.each(['field', 'form'] as const)(
    'drops a captured commit when its Inertia %s owner changes',
    (owner) => {
        const first = useForm({ accepted: false, other: false });
        const second = useForm({ accepted: false, other: false });
        const props = shallowReactive({ form: first, field: 'accepted' });
        const model = mountModel(props, booleanOptions);
        const element = document.createElement('div');
        Reflect.set(element, 'checked', true);
        const commit = model.captureCommit();
        if (owner === 'field') props.field = 'other';
        else props.form = second;
        expect(commit(element)).toBeUndefined();
        expect(first.accepted).toBe(false);
        expect(first.other).toBe(false);
        expect(second.accepted).toBe(false);
        expect(model.commit(element)).toEqual({ value: true });
        expect(owner === 'field' ? first.other : second.accepted).toBe(true);
    },
);

test('drops a captured model commit when its value binding is removed', async () => {
    const updates: boolean[] = [];
    const props = shallowReactive<Record<string, unknown>>({
        modelValue: false,
        'onUpdate:modelValue': () => {},
    });
    const model = mountModel(props, {
        ...booleanOptions,
        emitValue: (value) => updates.push(value),
    });
    const element = document.createElement('div');
    Reflect.set(element, 'checked', true);
    const commit = model.captureCommit();
    delete props.modelValue;
    delete props['onUpdate:modelValue'];
    await nextTick();
    expect(commit(element)).toBeUndefined();
    expect(model.current()).toBeUndefined();
    expect(model.commit(element)).toBeUndefined();
    expect(updates).toEqual([]);
});

test('validates event detail without falling back to an unrelated native property', () => {
    const updates: string[] = [];
    const model = mountModel(
        { active: 'first', 'onUpdate:active': () => {} },
        {
            ...booleanOptions,
            name: 'active',
            property: 'active',
            componentName: 'Stepper',
            acceptsWrite: modelDomains.string,
            acceptsRead: modelDomains.string,
            reader: { kind: 'detail', key: 'step' },
            emitValue: (value) => updates.push(value),
        },
    );
    const element = document.createElement('div');
    Reflect.set(element, 'active', 'native-property');
    expect(() => model.commit(element, new CustomEvent('wa-step-change', { detail: {} }))).toThrow(
        'unsupported native "active" value',
    );
    expect(updates).toEqual([]);
    model.commit(element, new CustomEvent('wa-step-change', { detail: { step: 'second' } }));
    expect(updates).toEqual(['second']);
});
