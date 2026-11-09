import '@inertiajs/core';

declare module '@inertiajs/core' {
    interface InertiaConfig {
        errorValueType: string | string[];
    }
}
