import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

const stops = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
const hues = [
    'slate',
    'gray',
    'zinc',
    'neutral',
    'stone',
    'red',
    'orange',
    'amber',
    'yellow',
    'lime',
    'green',
    'emerald',
    'teal',
    'cyan',
    'sky',
    'blue',
    'indigo',
    'violet',
    'purple',
    'fuchsia',
    'pink',
    'rose',
];
const palette = (hue: string) =>
    Object.fromEntries(stops.map((stop) => [stop, `var(--color-${hue}-${stop})`]));

/** Aura styled-mode theme sharing the Tailwind entry's retained CSS inputs. */
export const frontAwesomePrimeVueTheme = {
    preset: definePreset(Aura, {
        primitive: {
            ...Object.fromEntries(hues.map((hue) => [hue, palette(hue)])),
            borderRadius: {
                xs: 'var(--radius-sm)',
                sm: 'var(--radius-sm)',
                md: 'var(--radius-md)',
                lg: 'var(--radius-xl)',
                xl: 'var(--radius-xl)',
            },
        },
        semantic: {
            primary: palette('brand'),
            focusRing: { color: 'var(--wa-color-focus)' },
            formField: {
                paddingX: 'calc(var(--spacing) * 3)',
                paddingY: 'calc(var(--spacing) * 2)',
            },
            overlay: {
                select: { shadow: 'var(--shadow-md)' },
                popover: { shadow: 'var(--shadow-md)' },
                modal: { shadow: 'var(--shadow-lg)' },
            },
            colorScheme: {
                light: {
                    primary: {
                        color: 'var(--color-brand-800)',
                        contrastColor: 'white',
                        hoverColor: 'var(--color-brand-900)',
                        activeColor: 'var(--color-brand-950)',
                    },
                    surface: { 0: 'white', ...palette('gray') },
                },
                dark: {
                    primary: {
                        color: 'var(--color-brand-300)',
                        contrastColor: 'var(--color-brand-950)',
                        hoverColor: 'var(--color-brand-200)',
                        activeColor: 'var(--color-brand-100)',
                    },
                    surface: { 0: 'white', ...palette('gray') },
                },
            },
        },
    }),
    options: {
        darkModeSelector: '.wa-dark',
        cssLayer: {
            name: 'primevue',
            order: 'theme, base, wa-native, wa-base, wa-utilities, wa-color-palette, wa-color-variant, wa-theme, wa-theme-dimension, wa-theme-overrides, app-branding, primevue, components, utilities',
        },
    },
};
