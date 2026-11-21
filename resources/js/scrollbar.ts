import type {
    Options,
    OverlayScrollbars,
    PartialOptions,
    ScrollbarsAutoHideBehavior,
} from 'overlayscrollbars';
import { inject, type DirectiveModifiers, type InjectionKey, type ObjectDirective } from 'vue';

const variants = ['neutral', 'brand', 'success', 'warning', 'danger'] as const;

export type ScrollbarVariant = (typeof variants)[number];
export type ScrollbarOptions = PartialOptions & {
    /** Show a fade at each edge where more content can be scrolled into view. */
    shadows?: boolean;
};

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
    | {
          kind: 'overlay';
          instance: OverlayScrollbars;
          autoHide: ScrollbarsAutoHideBehavior;
          shadows?: ScrollShadows;
      }
    | { kind: 'unavailable' };

interface ScrollbarLifecycle {
    update: (options?: ScrollbarOptions) => void;
    dispose: () => void;
}

interface ScrollShadows {
    update: () => void;
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

function shadowOpacity(distance: number, range: number): string {
    return range > 0 && distance > 0.5 ? String(Math.min(1, distance / (range * 0.05))) : '0';
}

function mountScrollShadows(
    element: HTMLElement,
    instance: OverlayScrollbars,
    view: Window & typeof globalThis,
): ScrollShadows {
    const layer = element.ownerDocument.createElement('span');
    layer.className = 'fa-scrollbar-shadows';
    layer.setAttribute('aria-hidden', 'true');
    let viewport = instance.state();

    function paint(): void {
        const { overflowStyle, scrollCoordinates } = viewport;
        const { start, end } = scrollCoordinates;
        const left = Math.min(start.x, end.x);
        const right = Math.max(start.x, end.x);
        const top = Math.min(start.y, end.y);
        const bottom = Math.max(start.y, end.y);
        const x = Math.min(right, Math.max(left, element.scrollLeft));
        const y = Math.min(bottom, Math.max(top, element.scrollTop));
        const width = overflowStyle.x === 'scroll' ? right - left : 0;
        const height = overflowStyle.y === 'scroll' ? bottom - top : 0;

        layer.style.translate = `${x}px ${y}px`;
        layer.style.setProperty('--fa-shadow-left', shadowOpacity(x - left, width));
        layer.style.setProperty('--fa-shadow-right', shadowOpacity(right - x, width));
        layer.style.setProperty('--fa-shadow-top', shadowOpacity(y - top, height));
        layer.style.setProperty('--fa-shadow-bottom', shadowOpacity(bottom - y, height));
    }

    const unsubscribe = instance.on({
        scroll: paint,
        updated() {
            viewport = instance.state();
            paint();
        },
    });
    const { scrollbarHorizontal, scrollbarVertical } = instance.elements();
    const decorations: Node[] = [layer, scrollbarHorizontal.scrollbar, scrollbarVertical.scrollbar];
    const refresh = () => instance.update(true);
    const observer = new view.MutationObserver((records) => {
        const changed = records.some((record) => {
            if (
                record.target instanceof view.Element &&
                record.target.closest('.fa-scrollbar-shadows, .os-scrollbar')
            ) {
                return false;
            }
            if (record.type !== 'childList') return true;
            return [...record.addedNodes, ...record.removedNodes].some(
                (node) => !decorations.includes(node),
            );
        });
        // The translated layer can keep the old scroll extent until measurement hides it.
        if (changed) refresh();
    });
    observer.observe(element, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
        attributeFilter: ['class', 'dir', 'hidden', 'open', 'style'],
    });
    element.addEventListener('load', refresh, true);

    return {
        update() {
            if (layer.parentNode !== element) {
                element.insertBefore(layer, scrollbarHorizontal.scrollbar);
            }
            paint();
        },
        dispose() {
            observer.disconnect();
            element.removeEventListener('load', refresh, true);
            unsubscribe();
            layer.remove();
        },
    };
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
    ): PartialOptions {
        const { shadows: _shadows, ...overlay } = requestedOptions ?? {};
        const overrides = overlay.scrollbars;
        return {
            ...overlay,
            overflow: {
                x: overlay.overflow?.x ?? overflow.x,
                y: overlay.overflow?.y ?? overflow.y,
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
            state.shadows?.dispose();
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

    const synchronizeShadows = (): void => {
        if (state.kind !== 'overlay') return;

        if (requestedOptions?.shadows) {
            state.shadows ??= mountScrollShadows(element, state.instance, view);
            state.shadows.update();
        } else if (state.shadows) {
            state.shadows.dispose();
            delete state.shadows;
        }
    };

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
            synchronizeShadows();
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
                synchronizeShadows();
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
