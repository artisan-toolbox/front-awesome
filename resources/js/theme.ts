import { shallowRef } from 'vue';
import type { App, InjectionKey, Ref } from 'vue';

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeController {
    theme: Readonly<Ref<ThemePreference>>;
    setTheme: (preference: ThemePreference) => void;
    toggle: () => void;
}

export const themeKey: InjectionKey<ThemeController> = Symbol('Front Awesome theme');

const storageKey = 'appearance';
const activeThemes = new WeakMap<Document, ReturnType<typeof createTheme>>();

function storedTheme(view: Window | null | undefined): ThemePreference {
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

function createTheme(document?: Document) {
    const view = document?.defaultView;
    const media = view?.matchMedia?.('(prefers-color-scheme: dark)');
    const theme = shallowRef(storedTheme(view));
    const isDark = (): boolean =>
        theme.value === 'system' ? media?.matches === true : theme.value === 'dark';

    function applyTheme(): void {
        const classes = document?.documentElement.classList;
        const dark = isDark();

        classes?.toggle('dark', dark);
        classes?.toggle('wa-dark', dark);
        classes?.toggle('wa-light', !dark);
    }

    function systemChanged(): void {
        if (theme.value === 'system') {
            applyTheme();
        }
    }

    const controller: ThemeController = {
        theme,
        setTheme(preference) {
            theme.value = preference;
            applyTheme();

            try {
                view?.localStorage.setItem(storageKey, preference);
            } catch {
                return;
            }
        },
        toggle() {
            controller.setTheme(isDark() ? 'light' : 'dark');
        },
    };

    applyTheme();
    media?.addEventListener('change', systemChanged);

    return {
        controller,
        owners: 0,
        disconnect: () => media?.removeEventListener('change', systemChanged),
    };
}

export function initializeTheme(app: App): void {
    if (typeof document === 'undefined') {
        app.provide(themeKey, createTheme().controller);
        return;
    }

    const ownerDocument = document;
    const active = activeThemes.get(ownerDocument) ?? createTheme(ownerDocument);
    activeThemes.set(ownerDocument, active);
    active.owners++;
    app.provide(themeKey, active.controller);

    let released = false;
    app.onUnmount(() => {
        if (released) {
            return;
        }

        released = true;
        active.owners--;

        if (active.owners === 0) {
            active.disconnect();
            activeThemes.delete(ownerDocument);
        }
    });
}
