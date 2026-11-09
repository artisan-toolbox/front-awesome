import { shallowRef } from 'vue';
import type { App, InjectionKey, Ref } from 'vue';

export type AppearancePreference = 'system' | 'light' | 'dark';

interface AppearanceController {
    appearance: Readonly<Ref<AppearancePreference>>;
    setAppearance: (preference: AppearancePreference) => void;
    toggle: () => void;
}

export const appearanceKey: InjectionKey<AppearanceController> = Symbol('Front Awesome appearance');

const storageKey = 'appearance';
const activeAppearances = new WeakMap<Document, ReturnType<typeof createAppearance>>();

function storedAppearance(view: Window | null | undefined): AppearancePreference {
    try {
        const value = view?.localStorage.getItem(storageKey);

        if (value === 'light' || value === 'dark') {
            return value;
        }
    } catch {
        // The browser may deny access to localStorage.
    }

    return 'system';
}

function createAppearance(document?: Document) {
    const view = document?.defaultView;
    const media = view?.matchMedia?.('(prefers-color-scheme: dark)');
    const appearance = shallowRef(storedAppearance(view));
    const isDark = (): boolean =>
        appearance.value === 'system' ? media?.matches === true : appearance.value === 'dark';

    function applyAppearance(): void {
        const classes = document?.documentElement.classList;
        const dark = isDark();

        classes?.toggle('dark', dark);
        classes?.toggle('wa-dark', dark);
        classes?.toggle('wa-light', !dark);
    }

    function systemChanged(): void {
        if (appearance.value === 'system') {
            applyAppearance();
        }
    }

    const controller: AppearanceController = {
        appearance,
        setAppearance(preference) {
            appearance.value = preference;
            applyAppearance();

            try {
                view?.localStorage.setItem(storageKey, preference);
            } catch {
                return;
            }
        },
        toggle() {
            controller.setAppearance(isDark() ? 'light' : 'dark');
        },
    };

    applyAppearance();
    media?.addEventListener('change', systemChanged);

    return {
        controller,
        owners: 0,
        disconnect: () => media?.removeEventListener('change', systemChanged),
    };
}

export function initializeAppearance(app: App): void {
    if (typeof document === 'undefined') {
        app.provide(appearanceKey, createAppearance().controller);
        return;
    }

    const ownerDocument = document;
    const active = activeAppearances.get(ownerDocument) ?? createAppearance(ownerDocument);
    activeAppearances.set(ownerDocument, active);
    active.owners++;
    app.provide(appearanceKey, active.controller);

    let released = false;
    app.onUnmount(() => {
        if (released) {
            return;
        }

        released = true;
        active.owners--;

        if (active.owners === 0) {
            active.disconnect();
            activeAppearances.delete(ownerDocument);
        }
    });
}
