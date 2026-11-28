import { expect, onTestFinished, test } from 'vite-plus/test';
import { page, userEvent } from 'vitest/browser';
import { useForm } from '@inertiajs/vue3';
import { h, ref } from 'vue';
import { Button, Popup, Slider, Textarea } from '@artisan-toolbox/front-awesome/components';
import { mountVue, readyAfterFrame } from './fixtures/web-awesome';

test('removing an external Popup anchor restores positioning against its slotted anchor', async () => {
    const external = document.createElement('button');
    external.style.cssText = 'position: fixed; left: 320px; top: 20px';
    document.body.append(external);
    onTestFinished(() => external.remove());
    const mode = ref<'external' | 'slotted' | 'null'>('external');
    function anchorBinding(): Record<string, unknown> {
        if (mode.value === 'external') return { anchor: external };
        return mode.value === 'null' ? { anchor: null } : {};
    }
    const { container } = mountVue({
        render: () =>
            h(
                Popup,
                {
                    active: true,
                    placement: 'bottom-start',
                    ...anchorBinding(),
                },
                {
                    anchor: () =>
                        h('button', { style: 'position: fixed; left: 60px; top: 20px' }, 'Local'),
                    default: () => 'Details',
                },
            ),
    });
    const popup = container.querySelector('wa-popup')!;
    await readyAfterFrame(popup);
    const positionedAt = () => Math.round(popup.popup.getBoundingClientRect().left);
    await expect.poll(positionedAt).toBe(320);
    mode.value = 'slotted';
    await expect.poll(positionedAt).toBe(60);
    mode.value = 'external';
    await expect.poll(positionedAt).toBe(320);
    mode.value = 'null';
    await expect.poll(positionedAt).toBe(60);
});

test('projects Button named slots and native slotted children together across updates', async () => {
    const end = ref('Next');
    const { container } = mountVue({
        render: () =>
            h(
                Button,
                {},
                {
                    start: () => h('strong', 'First'),
                    default: () => [h('i', { slot: 'start' }, 'Second'), 'Save'],
                    end: () => end.value,
                },
            ),
    });
    const button = container.querySelector('wa-button')!;
    await readyAfterFrame(button);
    const assigned = (name: string) =>
        button.shadowRoot
            ?.querySelector<HTMLSlotElement>(`slot[name="${name}"]`)
            ?.assignedNodes()
            .map((node) => node.textContent);
    expect(assigned('start')).toEqual(['First', 'Second']);
    expect(assigned('end')).toEqual(['Next']);
    end.value = 'Done';
    await expect.poll(() => assigned('end')).toEqual(['Done']);
});

for (const control of ['Textarea', 'Slider'] as const) {
    test(`${control} submits its reset default after editing and keeps its value when reset is canceled`, async () => {
        const note = ref('First');
        const volume = ref(20);
        const { container } = mountVue({
            render: () =>
                h('form', [
                    control === 'Textarea'
                        ? h(Textarea, {
                              name: 'answer',
                              label: 'Answer',
                              modelValue: note.value,
                              'onUpdate:modelValue': (value: string | null) => {
                                  note.value = value ?? '';
                              },
                          })
                        : h(Slider, {
                              name: 'answer',
                              label: 'Answer',
                              modelValue: volume.value,
                              'onUpdate:modelValue': (value: number) => {
                                  volume.value = value;
                              },
                          }),
                    h('input', { type: 'hidden', name: 'answer', value: 'sibling' }),
                    h('button', { type: 'reset' }, 'Reset answer'),
                ]),
        });
        const host =
            container.querySelector('wa-textarea') ?? container.querySelector('wa-slider')!;
        const form = container.querySelector('form')!;
        const defaults = control === 'Textarea' ? 'First' : '20';
        const edited = control === 'Textarea' ? 'Typed answer' : '21';
        const entries = () => new FormData(form).getAll('answer');
        const model = () => String(control === 'Textarea' ? note.value : volume.value);
        await readyAfterFrame(host);
        expect(entries()).toEqual([defaults, 'sibling']);
        if (control === 'Textarea')
            await page.getByRole('textbox', { name: 'Answer' }).fill(edited);
        else {
            host.focus();
            await userEvent.keyboard('{ArrowRight}');
        }
        await expect.poll(model).toBe(edited);
        expect(entries()).toEqual([edited, 'sibling']);
        form.addEventListener('reset', (event) => event.preventDefault(), { once: true });
        await page.getByRole('button', { name: 'Reset answer' }).click();
        expect(model()).toBe(edited);
        expect(entries()).toEqual([edited, 'sibling']);
        await page.getByRole('button', { name: 'Reset answer' }).click();
        await expect.poll(model).toBe(defaults);
        expect(String(host.value)).toBe(defaults);
        expect(entries()).toEqual([defaults, 'sibling']);
    });
}

test('programmatic reset serializes unbound and Inertia controls after their native update', async () => {
    type ResetFields = { notes: string | null; volume: number };
    const { container } = mountVue({
        setup() {
            const data = useForm<ResetFields>({ notes: 'Inertia', volume: 65 });
            return () =>
                h('div', [
                    h('form', { id: 'reset-owner' }, [
                        h(Textarea<ResetFields>, {
                            name: 'notes',
                            defaultValue: '',
                            form: data,
                            field: 'notes',
                        }),
                        h(Slider<ResetFields>, {
                            name: 'volume',
                            defaultValue: 15,
                            form: data,
                            field: 'volume',
                        }),
                    ]),
                    h(Textarea, {
                        name: 'outside',
                        form: 'reset-owner',
                        defaultValue: 'Outside',
                        value: 'Edited',
                    }),
                    h(Slider, {
                        name: 'outside',
                        form: 'reset-owner',
                        defaultValue: 35,
                        value: 70,
                    }),
                    h('output', `${data.notes}/${data.volume}`),
                ]);
        },
    });
    const form = container.querySelector('form')!;
    const fields = [
        ...container.querySelectorAll('wa-textarea'),
        ...container.querySelectorAll('wa-slider'),
    ];
    await Promise.all(fields.map(readyAfterFrame));
    const entries = () => [...new FormData(form).entries()];
    expect(entries()).toEqual([
        ['notes', 'Inertia'],
        ['volume', '65'],
        ['outside', 'Edited'],
        ['outside', '70'],
    ]);
    form.reset();
    await Promise.all(fields.map((field) => field.updateComplete));
    expect(entries()).toEqual([
        ['notes', ''],
        ['volume', '15'],
        ['outside', 'Outside'],
        ['outside', '35'],
    ]);
    await expect.poll(() => container.querySelector('output')?.textContent).toBe('/15');
});
