export const hues = [
    'red',
    'orange',
    'yellow',
    'green',
    'cyan',
    'blue',
    'indigo',
    'purple',
    'pink',
    'gray',
];
export const stops = [
    [95, 50],
    [90, 100],
    [80, 200],
    [70, 300],
    [60, 400],
    [50, 500],
    [40, 600],
    [30, 700],
    [20, 800],
    [10, 900],
    ['05', 950],
];
export const roles = {
    brand: 'brand',
    success: 'green',
    warning: 'yellow',
    danger: 'red',
    neutral: 'gray',
};
export const scopes = [
    ':root',
    '.fa-theme',
    '.wa-theme-default',
    '.wa-light',
    '.wa-dark',
    '.wa-invert',
];
export const roleScopes = Object.keys(roles).flatMap((role) =>
    hues.map((hue) => `.wa-${role}-${hue}`),
);
export const layers =
    'theme, base, wa-native, wa-base, wa-utilities, wa-color-palette, wa-color-variant, wa-theme, wa-theme-dimension, wa-theme-overrides, app-branding, primevue, components, utilities';
