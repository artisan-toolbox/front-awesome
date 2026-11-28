export const spacingHosts = [
    'wa-accordion-item',
    'wa-card',
    'wa-details',
    'wa-dialog',
    'wa-divider',
    'wa-drawer',
    'wa-lightbox',
];

export const spacingHostSelector = `:where(${spacingHosts.join(', ')})`;
export const utilitySpacing = 'var(--fa-utility-spacing, var(--spacing))';
