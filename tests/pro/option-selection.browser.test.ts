import { useForm } from '@inertiajs/vue3';
import { createApp, h } from 'vue';
import { page, userEvent } from 'vitest/browser';
import { expect, onTestFinished, test, vi } from 'vite-plus/test';
import { Combobox } from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
import '@artisan-toolbox/front-awesome/web-awesome.css';

test('uses the native Combobox filter to retain matching groups and preserves the Inertia value', async () => {
    type Row = { id: number; name: string };
    const groups = [
        { label: 'South', options: [{ id: 1, name: 'São Paulo' }] },
        { label: 'Unmatched', options: [{ id: 3, name: 'Recife' }] },
        { label: 'Northeast', options: [{ id: 2, name: 'Fortaleza' }] },
    ];
    const form = useForm<{ city: number | null }>({ city: 1 });
    const container = document.createElement('div');
    document.body.append(container);
    const app = createApp({
        render: () =>
            h(Combobox<{ city: number | null }, false, Row, 'id', true>, {
                form,
                field: 'city',
                label: 'City',
                grouped: true,
                options: groups,
                optionValue: 'id',
                optionLabel: 'name',
                filter: (option, query) =>
                    query === 'pair'
                        ? option.label !== 'Recife'
                        : option.label.toLowerCase().includes(query.toLowerCase()),
            }),
    });
    app.mount(container);
    onTestFinished(() => {
        app.unmount();
        container.remove();
    });
    await vi.dynamicImportSettled();

    const dividers = () =>
        Array.from(container.querySelectorAll('wa-divider')).filter((divider) =>
            divider.checkVisibility(),
        );
    const input = page.getByRole('combobox', { name: 'City' });
    const south = page.getByText('South', { exact: true });
    const northeast = page.getByText('Northeast', { exact: true });
    const unmatched = page.getByText('Unmatched', { exact: true });
    await expect.element(input).toHaveValue('São Paulo');
    await input.click();
    await expect.element(south).toBeVisible();
    await expect.element(unmatched).toBeVisible();
    expect(dividers()).toHaveLength(2);

    await input.fill('pair');
    await expect.element(south).toBeVisible();
    await expect.element(northeast).toBeVisible();
    await expect.element(unmatched).not.toBeVisible();
    await expect.poll(() => dividers().length).toBe(1);

    await input.fill('Northeast');
    await expect.element(page.getByText('No matching results')).toBeVisible();
    await expect.element(northeast).not.toBeVisible();
    expect(dividers()).toHaveLength(0);

    await input.fill('Forta');
    await expect.element(page.getByRole('option', { name: 'Fortaleza' })).toBeVisible();
    await expect.element(northeast).toBeVisible();
    await expect.element(south).not.toBeVisible();
    expect(dividers()).toHaveLength(0);
    expect(form.city).toBe(1);

    await input.fill('');
    await expect.element(south).toBeVisible();
    await expect.poll(() => dividers().length).toBe(2);
    await input.fill('Forta');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    await expect.poll(() => form.city).toBe(2);
    form.reset();
    await expect.element(input).toHaveValue('São Paulo');
});
