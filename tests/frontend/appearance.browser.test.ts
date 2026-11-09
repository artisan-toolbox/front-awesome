import { expect, onTestFinished, test } from 'vite-plus/test';
import { page } from 'vitest/browser';
import { createApp } from 'vue';
import { createFrontAwesome } from '@artisan-toolbox/front-awesome';
import Fixture from './Fixture.vue';
import './app.css';
import '@artisan-toolbox/front-awesome/web-awesome.css';

test('mounts the appearance selector and keeps both styling systems in sync with the saved choice', async () => {
    const root = document.documentElement;
    const initialClasses = root.className;
    const initialPreference = localStorage.getItem('appearance');
    const container = document.createElement('div');
    document.body.append(container);
    localStorage.setItem('appearance', 'dark');

    const app = createApp(Fixture).use(createFrontAwesome({ appearance: true }));
    app.mount(container);
    onTestFinished(() => {
        app.unmount();
        container.remove();
        root.className = initialClasses;
        if (initialPreference === null) {
            localStorage.removeItem('appearance');
        } else {
            localStorage.setItem('appearance', initialPreference);
        }
    });

    await Promise.all([
        customElements.whenDefined('wa-button'),
        customElements.whenDefined('wa-button-group'),
        customElements.whenDefined('wa-icon'),
    ]);
    const preference = page.getByTestId('appearance-preference');
    const sample = page.getByTestId('appearance-tailwind').element();
    const group = page.getByTestId('appearance-controls').element();
    const icon = page.getByTestId('fixture-icon').element();
    await expect.poll(() => icon.shadowRoot?.querySelector('svg')).not.toBeNull();
    expect(icon.getAttribute('aria-label')).toBe('Fixture icon');

    await expect.element(preference).toHaveTextContent('dark');
    expect(getComputedStyle(sample).color).toBe('rgb(255, 255, 255)');
    expect(getComputedStyle(group).colorScheme).toBe('dark');

    await page.getByRole('button', { name: 'Light', exact: true }).click();
    await expect.element(preference).toHaveTextContent('light');
    expect(localStorage.getItem('appearance')).toBe('light');
    expect(getComputedStyle(sample).color).toBe('rgb(0, 0, 0)');
    expect(getComputedStyle(group).colorScheme).toBe('light');

    await page.getByRole('button', { name: 'Toggle appearance' }).click();
    await expect.element(preference).toHaveTextContent('dark');
    expect(localStorage.getItem('appearance')).toBe('dark');
});
