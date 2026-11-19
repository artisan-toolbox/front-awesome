import type {
    Options,
    OverlayScrollbars,
    PartialOptions,
    ScrollbarsAutoHideBehavior,
} from 'overlayscrollbars';
import { inject, type DirectiveModifiers, type InjectionKey, type ObjectDirective } from 'vue';

const variants = ['neutral', 'brand', 'success', 'warning', 'danger'] as const;

export type ScrollbarVariant = (typeof variants)[number];
export type ScrollbarOptions = PartialOptions;

export interface ScrollbarPluginOptions {
    defaultVariant?: ScrollbarVariant;
}

type ScrollbarDirective = ObjectDirective<
    HTMLElement,
    ScrollbarOptions | undefined,
    ScrollbarVariant
>;

export const scrollbarDirectiveKey: InjectionKey<ScrollbarDirective> =
    Symbol('front-awesome.scrollbar');

type ScrollbarState =
    | { kind: 'native' }
    | { kind: 'loading' }
    | { kind: 'overlay'; instance: OverlayScrollbars; autoHide: ScrollbarsAutoHideBehavior }
    | { kind: 'unavailable' };

interface ScrollbarLifecycle {
    update: (options?: ScrollbarOptions) => void;
    dispose: () => void;
}

type ScrollbarOverflow = Options['overflow'];

const activeScrollbars = new WeakMap<HTMLElement, ScrollbarLifecycle>();
const attribute = 'data-fa-scrollbar';
let overlayLibrary: Promise<typeof OverlayScrollbars> | undefined;

function loadOverlayScrollbars(): Promise<typeof OverlayScrollbars> {
    return (overlayLibrary ??= import('overlayscrollbars').then(
        ({ ClickScrollPlugin, OverlayScrollbars }) => {
            OverlayScrollbars.plugin(ClickScrollPlugin);
            return OverlayScrollbars;
        },
    ));
}

function resolveVariant(value: unknown): ScrollbarVariant {
    return variants.find((variant) => variant === value) ?? 'neutral';
}

function applyVariant(element: HTMLElement, variant: ScrollbarVariant): void {
    if (element.getAttribute(attribute) !== variant) {
        element.setAttribute(attribute, variant);
    }
}

function overflowBehavior(value: string): ScrollbarOverflow['x'] {
    if (value === 'auto' || value === 'scroll') return 'scroll';
    return value === 'visible' ? 'visible' : 'hidden';
}

function readOverflow(element: HTMLElement, view: Window): ScrollbarOverflow | undefined {
    if (!element.isConnected) return;

    const style = view.getComputedStyle(element);
    if (style.getPropertyValue('--fa-scrollbar-overlay-ready').trim() !== '1') return;

    const x = overflowBehavior(style.overflowX);
    const y = overflowBehavior(style.overflowY);
    if (x === 'scroll' || y === 'scroll') return { x, y };
}

function mountScrollbar(element: HTMLElement, options?: ScrollbarOptions): void {
    if (activeScrollbars.has(element)) return;

    const view = element.ownerDocument.defaultView;
    if (
        !view ||
        !(element instanceof view.HTMLElement) ||
        element.matches('html, body, input, textarea, select')
    ) {
        return;
    }

    const forcedColors = view.matchMedia('(forced-colors: active)');
    let state: ScrollbarState = { kind: 'native' };
    let requestedOptions = options;

    function overlayOptions(
        overflow: ScrollbarOverflow,
        autoHide: ScrollbarsAutoHideBehavior,
    ): ScrollbarOptions {
        const overrides = requestedOptions?.scrollbars;
        return {
            ...requestedOptions,
            overflow: {
                x: requestedOptions?.overflow?.x ?? overflow.x,
                y: requestedOptions?.overflow?.y ?? overflow.y,
            },
            scrollbars: {
                ...overrides,
                theme: overrides?.theme === undefined ? 'fa-scrollbar-overlay' : overrides.theme,
                autoHide: overrides?.autoHide ?? autoHide,
                autoHideSuspend: overrides?.autoHideSuspend ?? true,
                clickScroll: overrides?.clickScroll ?? 'instant',
            },
        };
    }

    function restoreNativeScrollbar(): void {
        if (state.kind === 'overlay') {
            const tabIndex = element.getAttribute('tabindex');
            state.instance.destroy();
            // The library restores its initial snapshot even when the caller changed tabindex.
            if (tabIndex === null) {
                element.removeAttribute('tabindex');
            } else {
                element.setAttribute('tabindex', tabIndex);
            }
        }
        state = { kind: 'native' };
    }

    const synchronize = (): void => {
        if (state.kind === 'unavailable') return;

        const overflow = forcedColors.matches ? undefined : readOverflow(element, view);
        if (!overflow) {
            restoreNativeScrollbar();
            return;
        }

        if (state.kind === 'overlay') {
            const { scrollbarHorizontal, scrollbarVertical } = state.instance.elements();
            // Vue can replace the element's contents without replacing the scroll region.
            for (const { scrollbar } of [scrollbarHorizontal, scrollbarVertical]) {
                if (scrollbar.parentNode !== element) element.append(scrollbar);
            }
            state.instance.options(overlayOptions(overflow, state.autoHide), true);
            return;
        }

        if (state.kind === 'loading') return;

        const loading: ScrollbarState = { kind: 'loading' };
        state = loading;

        void loadOverlayScrollbars()
            .then((OverlayScrollbars) => {
                if (state !== loading) return;

                const currentOverflow = forcedColors.matches
                    ? undefined
                    : readOverflow(element, view);
                if (!currentOverflow) {
                    state = { kind: 'native' };
                    return;
                }

                const { scrollbarsHiding, scrollbarsOverlaid } = OverlayScrollbars.env();
                if (!scrollbarsHiding || OverlayScrollbars(element)) {
                    state = { kind: 'unavailable' };
                    return;
                }

                const autoHide = scrollbarsOverlaid.x || scrollbarsOverlaid.y ? 'scroll' : 'never';
                const instance = OverlayScrollbars(
                    { target: element, elements: { viewport: element } },
                    overlayOptions(currentOverflow, autoHide),
                );
                state = { kind: 'overlay', instance, autoHide };
            })
            .catch(() => {
                if (state === loading) state = { kind: 'unavailable' };
            });
    };

    activeScrollbars.set(element, {
        update(options) {
            requestedOptions = options;
            synchronize();
        },
        dispose() {
            forcedColors.removeEventListener('change', synchronize);
            view.removeEventListener('resize', synchronize);
            restoreNativeScrollbar();
        },
    });
    forcedColors.addEventListener('change', synchronize);
    view.addEventListener('resize', synchronize);
    synchronize();
}

function unmountScrollbar(element: HTMLElement): void {
    activeScrollbars.get(element)?.dispose();
    activeScrollbars.delete(element);
}

export function createScrollbarDirective(options?: ScrollbarPluginOptions): ScrollbarDirective {
    const defaultVariant = resolveVariant(options?.defaultVariant);
    const variantFor = (modifiers: DirectiveModifiers<ScrollbarVariant>) =>
        variants.find((variant) => modifiers[variant]) ?? defaultVariant;

    return {
        deep: true,
        beforeMount(element, { modifiers }) {
            applyVariant(element, variantFor(modifiers));
        },
        mounted(element, { value }) {
            mountScrollbar(element, value);
        },
        updated(element, { modifiers, value }) {
            applyVariant(element, variantFor(modifiers));
            activeScrollbars.get(element)?.update(value);
        },
        beforeUnmount: unmountScrollbar,
        getSSRProps({ modifiers }) {
            return { [attribute]: variantFor(modifiers) };
        },
    };
}

export const scrollbarDirective = createScrollbarDirective();

export function useScrollbarDirective(): ScrollbarDirective {
    return inject(scrollbarDirectiveKey, scrollbarDirective);
}

export const legacyScrollbarDirective: ObjectDirective<HTMLElement, ScrollbarVariant | undefined> =
    {
        beforeMount(element, { value }) {
            applyVariant(element, resolveVariant(value));
        },
        mounted(element) {
            mountScrollbar(element);
        },
        updated(element, binding) {
            applyVariant(element, resolveVariant(binding.value));
            activeScrollbars.get(element)?.update();
        },
        beforeUnmount: unmountScrollbar,
        getSSRProps({ value }) {
            return { [attribute]: resolveVariant(value) };
        },
    };
