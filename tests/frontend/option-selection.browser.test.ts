import { createApp, h, ref, type Component, type Plugin } from 'vue';
import { page, userEvent, type Locator } from 'vitest/browser';
import { expect, onTestFinished, test, vi } from 'vite-plus/test';
import { createFrontAwesome } from '@artisan-toolbox/front-awesome';
import { Select } from '@artisan-toolbox/front-awesome/components/WebAwesome';
import Fixture from './OptionSelection.vue';
import '@artisan-toolbox/front-awesome/web-awesome.css';

async function mount(component: Component, plugin?: Plugin) {
    const container = document.createElement('div');
    container.style.maxWidth = '24rem';
    document.body.append(container);
    const app = createApp(component);
    if (plugin) app.use(plugin);
    app.mount(container);
    onTestFinished(() => {
        app.unmount();
        container.remove();
    });
    await vi.dynamicImportSettled();
    await customElements.whenDefined('wa-select');
    const select = container.querySelector('wa-select');
    if (!select) throw new Error('Expected a native Select.');
    await select.updateComplete;
    return { container, select };
}

async function expectFocus(locator: Locator) {
    await expect
        .poll(() => {
            let active = document.activeElement;
            while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
            return active === locator.query();
        })
        .toBe(true);
}

test('filters labels, navigates enabled results and commits a numeric Inertia value', async () => {
    const { container, select } = await mount(Fixture);
    const form = container.querySelector('form');
    if (!form) throw new Error('Expected the fixture form.');
    const changes = vi.fn();
    select.addEventListener('change', changes);
    const trigger = page.getByRole('combobox', { name: 'Destination' });
    const search = page.getByRole('searchbox', { name: 'Search options' });

    await trigger.click();
    await expectFocus(search);
    const listbox = select.shadowRoot?.querySelector('[role="listbox"]');
    const searchHost = select.shadowRoot?.querySelector('wa-input');
    expect(listbox?.contains(searchHost ?? null)).toBe(false);
    const header = select.shadowRoot?.querySelector('.fa-select-search');
    if (!header) throw new Error('Expected a search header.');
    expect(parseFloat(getComputedStyle(header).paddingBlockStart)).toBeGreaterThan(0);
    const status = header.querySelector('[role="status"]');
    if (!status) throw new Error('Expected a search status.');
    expect(getComputedStyle(status).position).toBe('absolute');
    expect(searchHost?.getBoundingClientRect().bottom).toBeLessThanOrEqual(
        listbox?.getBoundingClientRect().top ?? 0,
    );
    await search.fill('CAFE');
    await expect.element(page.getByRole('option', { name: 'Café com leite' })).toBeVisible();
    await expect.element(page.getByRole('option', { name: 'Chá' })).not.toBeInTheDocument();
    expect(new FormData(form).get('destination')).toBe('3');
    expect(changes).not.toHaveBeenCalled();

    await userEvent.keyboard('{ArrowDown}');
    await expect.element(page.getByRole('option', { name: 'Café com leite' })).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await expect.element(page.getByRole('option', { name: 'Cafezinho' })).toHaveFocus();
    await userEvent.keyboard('{ArrowUp}{Enter}');
    await expect.poll(() => container.querySelector('output')?.textContent).toBe('1');
    await expectFocus(trigger);
    await expect.poll(() => new FormData(form).get('destination')).toBe('1');
    expect(changes).toHaveBeenCalledTimes(1);

    await expect.element(search).not.toBeInTheDocument();
    form.reset();
    await expect.poll(() => container.querySelector('output')?.textContent).toBe('3');
    await trigger.click();
    await expect.element(search).toHaveValue('');
    await userEvent.keyboard('{Tab}');
    await expect.element(page.getByRole('button', { name: 'After' })).toHaveFocus();
});

test('keeps editing keys in the search input and announces an empty strict search', async () => {
    await mount({ render: () => h(Fixture, { strict: true }) });
    const trigger = page.getByRole('combobox', { name: 'Destination' });
    const search = page.getByRole('searchbox', { name: 'Search options' });
    await trigger.click();
    await expectFocus(search);
    await search.fill('café');
    await expect.element(page.getByText('No matching results')).toBeVisible();
    await userEvent.keyboard('{ArrowDown}');
    await expectFocus(search);
    await search.fill('Café com');
    await userEvent.keyboard('{End} leite{Backspace}');
    await expect.element(search).toHaveValue('Café com leit');
    await expect.element(page.getByRole('option', { name: 'Café com leite' })).toBeVisible();
    await userEvent.keyboard('{Escape}');
    await expectFocus(trigger);
    await expect.element(search).not.toBeInTheDocument();
});

test('uses app defaults per field and keeps mixed values distinct in a multiple model', async () => {
    const rows = [
        { id: 1, title: 'Number one', caption: 'Numeric' },
        { id: '1', title: 'String one', caption: 'Text' },
        { id: false, title: 'False', caption: 'Off' },
    ];
    const selected = ref<(number | string | boolean)[]>([1]);
    const { select } = await mount(
        {
            render: () =>
                h(Select<object, true, (typeof rows)[number], 'id'>, {
                    name: 'options',
                    label: 'Mixed',
                    multiple: true,
                    options: rows,
                    optionLabel: 'caption',
                    modelValue: selected.value,
                    'onUpdate:modelValue': (value) => (selected.value = value ?? []),
                }),
        },
        createFrontAwesome({ optionValue: 'id', optionLabel: 'title' }),
    );

    await expect
        .poll(() => select.selectedOptions.map((option) => option.label))
        .toEqual(['Numeric']);
    select.focus();
    await userEvent.keyboard('{Enter}');
    const search = page.getByRole('searchbox', { name: 'Search options' });
    await expectFocus(search);
    await search.fill('Text');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect.poll(() => selected.value).toEqual([1, '1']);
    expect(select.open).toBe(true);
    await userEvent.keyboard('{ArrowUp}');
    await expectFocus(search);
    await search.fill('Off');
    await page.getByRole('option', { name: 'Off' }).click();
    await expectFocus(search);
    await expect.poll(() => selected.value).toEqual([1, '1', false]);
});

test('preserves a missing numeric model when the only remaining row has its string representation', async () => {
    const rows = ref([
        { id: 1, name: 'Number' },
        { id: '1', name: 'Text' },
    ]);
    const model = ref<number | string | null>(1);
    const { select } = await mount({
        render: () =>
            h(Select<object, false, (typeof rows.value)[number], 'id'>, {
                options: rows.value,
                optionValue: 'id',
                optionLabel: 'name',
                modelValue: model.value,
                'onUpdate:modelValue': (value) => (model.value = value),
            }),
    });
    await expect
        .poll(() => select.selectedOptions.map((option) => option.label))
        .toEqual(['Number']);
    rows.value = [{ id: '1', name: 'Text' }];
    await expect.poll(() => select.selectedOptions).toEqual([]);
    expect(model.value).toBe(1);
    rows.value = [
        { id: '1', name: 'Text' },
        { id: 1, name: 'Number' },
    ];
    await expect
        .poll(() => select.selectedOptions.map((option) => option.label))
        .toEqual(['Number']);
});

test('applies initial and external arrays with the bare multiple syntax', async () => {
    const { container } = await mount(Fixture);
    const select =
        container.querySelector<HTMLElementTagNameMap['wa-select']>('wa-select[multiple]');
    if (!select) throw new Error('Expected a multiple Select.');
    await expect.poll(() => select.value).toEqual(['1']);
    await page.getByRole('button', { name: 'Update destinations' }).click();
    await expect.poll(() => select.value).toEqual(['2', '3']);
});

test('restores search focus when an active result is disabled or removed by a reactive update', async () => {
    const rows = ref<{ id: string; label: string; disabled?: boolean }[]>([
        { id: 'a', label: 'Alpha' },
        { id: 'b', label: 'Beta' },
    ]);
    const { select } = await mount({
        render: () =>
            h(Select<object, false, (typeof rows.value)[number], 'id'>, {
                label: 'Choices',
                options: rows.value,
                optionValue: 'id',
                optionLabel: 'label',
            }),
    });
    await page.getByRole('combobox', { name: 'Choices' }).click();
    const search = page.getByRole('searchbox', { name: 'Search options' });
    await expectFocus(search);
    await userEvent.keyboard('{ArrowDown}');
    await expectFocus(page.getByRole('option', { name: 'Alpha' }));

    const alpha = rows.value[0];
    if (!alpha) throw new Error('Expected Alpha in the fixture.');
    alpha.disabled = true;
    await expectFocus(search);
    await userEvent.keyboard('{ArrowDown}');
    await expectFocus(page.getByRole('option', { name: 'Beta' }));

    rows.value.pop();
    await expectFocus(search);
    expect(select.value).toBeNull();
});

test('filters Select groups without changing the model or leaving extra dividers', async () => {
    type Row = { id?: number; name: string };
    const groups = [
        { label: 'Frontend', options: [{ id: 1, name: 'Vue kit' }] },
        { label: 'Empty', options: [] },
        { label: 'Backend', options: [{ id: 2, name: 'Laravel' }, { name: 'Missing value' }] },
        { options: [{ id: 3, name: 'Server kit' }] },
    ];
    const selected = ref<number | null>(2);
    const { select } = await mount({
        render: () =>
            h(
                Select<object, false, Row, 'id', true>,
                {
                    label: 'Framework',
                    grouped: true,
                    options: groups,
                    optionValue: 'id',
                    optionLabel: 'name',
                    modelValue: selected.value,
                    'onUpdate:modelValue': (value) => (selected.value = value),
                },
                {
                    option: ({ label }: { label: string }) => h('span', label),
                },
            ),
    });
    const search = page.getByRole('searchbox', { name: 'Search options' });
    const dividers = () =>
        Array.from(select.querySelectorAll('wa-divider')).filter((divider) =>
            divider.checkVisibility(),
        );
    const frontend = page.getByText('Frontend', { exact: true });
    const backend = page.getByText('Backend', { exact: true });
    const popup = select.popup.popup;
    popup.style.animationPlayState = 'paused';
    const shown = new Promise<void>((resolve) => {
        select.addEventListener('wa-after-show', () => resolve(), { once: true });
    });
    await page.getByRole('combobox', { name: 'Framework' }).click();
    await expect.element(frontend).toBeVisible();
    await expect.element(backend).toBeVisible();
    expect(select.querySelectorAll('wa-option')).toHaveLength(3);
    expect(select.querySelector('wa-option > small')).toBeNull();
    expect(dividers()).toHaveLength(2);
    expect(select.hasAttribute('grouped')).toBe(false);

    await search.fill('Backend');
    await expect.element(page.getByText('No matching results')).toBeVisible();
    expect(dividers()).toHaveLength(0);
    await userEvent.keyboard('{ArrowDown}');
    await expectFocus(search);
    expect(selected.value).toBe(2);
    expect(select.value).toBe('2');

    await search.fill('kit');
    await expect.element(frontend).toBeVisible();
    await expect.element(backend).not.toBeVisible();
    expect(dividers()).toHaveLength(1);

    await search.fill('Lara');
    await expect.element(backend).toBeVisible();
    await expect.element(frontend).not.toBeVisible();
    expect(dividers()).toHaveLength(0);

    await search.fill('');
    await expect.element(frontend).toBeVisible();
    expect(dividers()).toHaveLength(2);
    await search.fill('server');
    const server = page.getByRole('option', { name: 'Server kit' });
    await expect.element(server).toBeVisible();
    await userEvent.keyboard('{ArrowDown}');
    await expectFocus(server);
    const animations = popup.getAnimations();
    expect(animations).not.toHaveLength(0);
    for (const animation of animations) animation.finish();
    await shown;
    popup.style.removeProperty('animation-play-state');
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await expectFocus(server);
    await userEvent.keyboard('{Enter}');
    await expect.poll(() => selected.value).toBe(3);
});
