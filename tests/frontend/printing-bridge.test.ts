import { afterEach, expect, test, vi } from 'vite-plus/test';
import { createQzBridge } from '../../resources/js/printing/bridge';

const document = {
    type: 'pdf',
    format: 'file',
    payload: 'https://example.test/report.pdf',
} as const;

afterEach(() => vi.unstubAllGlobals());

test('prepares authenticated PDF previews with nested PDF request options', async () => {
    const fetch = vi.fn(
        async (_url: string | URL | Request, _options?: RequestInit) => new Response('%PDF-1.4'),
    );
    vi.stubGlobal('fetch', fetch);
    await createQzBridge().prepare?.(document, {
        pdf: { requestInit: { headers: { Authorization: 'Bearer nested' } } },
    });
    expect(fetch).toHaveBeenCalledOnce();
    expect(new Headers(fetch.mock.calls[0]?.[1]?.headers).get('Authorization')).toBe(
        'Bearer nested',
    );
});

test('gives top-level PDF request options priority over nested options', async () => {
    const fetch = vi.fn(
        async (_url: string | URL | Request, _options?: RequestInit) => new Response('%PDF-1.4'),
    );
    vi.stubGlobal('fetch', fetch);
    await createQzBridge().prepare?.(document, {
        requestInit: { headers: { Authorization: 'Bearer top' } },
        pdf: { requestInit: { headers: { Authorization: 'Bearer nested' } } },
    });
    expect(fetch).toHaveBeenCalledOnce();
    expect(new Headers(fetch.mock.calls[0]?.[1]?.headers).get('Authorization')).toBe('Bearer top');
});

test('does not fetch PDF resources while preparing another print format', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    await createQzBridge().prepare?.(
        { type: 'escpos', flavor: 'base64', payload: 'G0A=' },
        {
            pdf: { requestInit: { headers: { Authorization: 'Bearer nested' } } },
        },
    );
    expect(fetch).not.toHaveBeenCalled();
});
