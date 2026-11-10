import { expect, onTestFinished, test, vi } from 'vite-plus/test';
import { createApp, h, nextTick } from 'vue';
import OtpExamples from './upstream/OtpInput.vue';
import inventory from './upstream-scenarios.json';
import { scenarioScripts } from './upstream-scripts';
import './app.css';
import '@artisan-toolbox/front-awesome/web-awesome.css';
import '@artisan-toolbox/front-awesome/tailwind.css';

async function otpFixture() {
    const scenario = inventory.scenarios.find((scenario) => scenario.id === 'otp-input-17');
    if (!scenario) throw new Error('Missing upstream WebOTP example');
    const root = document.createElement('div');
    document.body.append(root);
    const app = createApp({ render: () => h(OtpExamples, { scenario: scenario.id }) });
    app.mount(root);
    const scripts = scenarioScripts();
    onTestFinished(() => {
        app.unmount();
        scripts.dispose();
        root.remove();
    });
    await customElements.whenDefined('wa-otp-input');
    await nextTick();
    const input = root.querySelector('wa-otp-input');
    if (!input) throw new Error('Missing upstream OTP input');
    await input.updateComplete;
    return { root, input, scripts, scenario };
}

test('runs the original WebOTP example against a synthetic credential service response', async () => {
    const credential = { id: 'sms-fixture', type: 'otp', code: '314159' };
    const get = vi.spyOn(navigator.credentials, 'get').mockResolvedValue(credential);
    vi.stubGlobal('OTPCredential', class SyntheticOtpCredential {});
    onTestFinished(() => {
        get.mockRestore();
        vi.unstubAllGlobals();
    });
    const { root, input, scripts, scenario } = await otpFixture();
    await scripts.run(root, scenario.scripts);
    await expect.poll(() => input.value).toBe('314159');
    expect(get).toHaveBeenCalledExactlyOnceWith({ otp: { transport: ['sms'] } });
});

test('runs the original WebOTP cancellation branch without changing the input', async () => {
    const get = vi
        .spyOn(navigator.credentials, 'get')
        .mockRejectedValue(new DOMException('User dismissed SMS prompt', 'AbortError'));
    vi.stubGlobal('OTPCredential', class SyntheticOtpCredential {});
    onTestFinished(() => {
        get.mockRestore();
        vi.unstubAllGlobals();
    });
    const { root, input, scripts, scenario } = await otpFixture();
    await scripts.run(root, scenario.scripts);
    await Promise.resolve();
    expect(get).toHaveBeenCalledExactlyOnceWith({ otp: { transport: ['sms'] } });
    expect(input.value).toBe('');
});
