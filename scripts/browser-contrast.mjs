export function measureContrast({ selector, part, expectedBackground }) {
    const host = document.querySelector(selector);
    const element = part ? host.shadowRoot.querySelector(part) : host;
    const style = getComputedStyle(element);
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { willReadFrequently: true });
    const pixel = (color) => {
        if (!CSS.supports('color', color)) throw new Error(`Invalid computed color ${color}`);
        context.clearRect(0, 0, 1, 1);
        context.fillStyle = color;
        context.fillRect(0, 0, 1, 1);
        return [...context.getImageData(0, 0, 1, 1).data];
    };
    const foreground = pixel(style.color);
    const background = pixel(style.backgroundColor);
    if (background[3] !== 255)
        throw new Error(`Filled control has transparent background ${style.backgroundColor}`);
    const composite = foreground
        .slice(0, 3)
        .map(
            (channel, index) =>
                (channel * foreground[3]) / 255 + background[index] * (1 - foreground[3] / 255),
        );
    const luminance = (channels) =>
        channels
            .slice(0, 3)
            .map((channel) => {
                const value = channel / 255;
                return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
            })
            .reduce((sum, value, index) => sum + value * [0.2126, 0.7152, 0.0722][index], 0);
    const a = luminance(composite);
    const b = luminance(background);
    if (expectedBackground) {
        const reference = document.createElement('div');
        reference.style.backgroundColor = `var(${expectedBackground})`;
        host.append(reference);
        const expected = pixel(getComputedStyle(reference).backgroundColor);
        reference.remove();
        if (expected.some((channel, index) => Math.abs(channel - background[index]) > 1))
            throw new Error(`Control background does not match ${expectedBackground}`);
    }
    return {
        color: style.color,
        background: style.backgroundColor,
        ratio: (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05),
    };
}
