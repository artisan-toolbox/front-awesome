function decimalIdentity(text: string) {
    const match = /^([+-]?)(\d+(?:\.\d*)?|\.\d+)(?:e([+-]?\d+))?$/i.exec(text);
    if (!match) return null;
    const [whole, fraction = ''] = match[2].split('.');
    const digits = whole + fraction;
    const first = digits.search(/[1-9]/);
    if (first < 0) return '0';
    let end = digits.length;
    while (digits[end - 1] === '0') end--;
    const significant = digits.slice(first, end);
    const exponent = Number(match[3] ?? 0) + whole.length - first - 1;
    return (match[1] === '-' ? '-' : '') + significant + 'e' + exponent;
}

export function parseSearchNumber(draft: string, type: 'number' | 'integer'): number | null {
    const value = Number(draft);
    if (
        !Number.isFinite(value) ||
        Math.abs(value) > Number.MAX_SAFE_INTEGER ||
        (type === 'integer' && !Number.isSafeInteger(value))
    )
        return null;
    // Dapter sends a JSON number. Its decimal spelling must still describe the user's value.
    return decimalIdentity(draft) === decimalIdentity(String(value)) ? value : null;
}
