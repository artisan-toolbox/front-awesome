import { nextTick, onScopeDispose, watch, type Ref } from 'vue';
import { useEventListener } from '@vueuse/core';
import type { DataViewHandle } from './types';

type Anchor = {
    region: HTMLElement;
    scroller: Element;
    top: number;
    scrollTop: number;
    windowY: number;
    hadFocus: boolean;
};

function scrollParent(region: HTMLElement): Element {
    for (let el = region.parentElement; el; el = el.parentElement) {
        if (
            el.scrollHeight > el.clientHeight &&
            /^(auto|scroll|overlay)$/.test(getComputedStyle(el).overflowY)
        ) {
            return el;
        }
    }
    return document.scrollingElement ?? document.documentElement;
}

function capture(region: HTMLElement): Anchor | undefined {
    const scroller = scrollParent(region);
    const bounds = region.getBoundingClientRect();
    const frame = scroller === document.scrollingElement ? null : scroller.getBoundingClientRect();
    const start = Math.max(0, frame?.top ?? 0);
    const end = Math.min(window.innerHeight, frame?.bottom ?? window.innerHeight);
    if (bounds.bottom <= start || bounds.top >= end || end <= start) return;
    return {
        region,
        scroller,
        top: bounds.top,
        scrollTop: scroller.scrollTop,
        windowY: window.scrollY,
        hadFocus: region.contains(document.activeElement),
    };
}

export function useDataViewScrollAnchor(
    root: Readonly<Ref<HTMLElement | null>>,
    adapter: DataViewHandle,
) {
    let gesture: Anchor | undefined;
    let pending: Anchor | undefined;
    let clearGesture: ReturnType<typeof setTimeout> | undefined;
    function remember(event: Event) {
        if (!adapter.ready || adapter.infinite) return;
        const elements = event
            .composedPath()
            .filter((el): el is HTMLElement => el instanceof HTMLElement);
        if (elements.find((el) => el.matches('.data-view')) !== root.value) return;
        const region = elements.find((el) =>
            el.matches('.data-view-header, .data-view-footer, .data-view-table > thead'),
        );
        if (!region) return;
        gesture = capture(region);
        clearTimeout(clearGesture);
        // A click that only opens a popover cannot claim a later background read.
        clearGesture = setTimeout(() => {
            gesture = undefined;
        }, 0);
    }
    useEventListener(
        root,
        ['click', 'keydown', 'input', 'change', 'wa-input', 'wa-change', 'wa-before-page-change'],
        remember,
        { capture: true },
    );
    watch(
        [() => adapter.status, () => adapter.requested],
        ([status]) => {
            if (status === 'loading') {
                pending = gesture;
                gesture = undefined;
            }
            const anchor = pending;
            if (!anchor) return;
            const { region, scroller } = anchor;
            const moved =
                scroller.scrollTop !== anchor.scrollTop || window.scrollY !== anchor.windowY;
            if (
                status === 'idle' ||
                status === 'error' ||
                (anchor.hadFocus &&
                    document.activeElement !== document.body &&
                    !root.value?.contains(document.activeElement)) ||
                (moved && Math.abs(region.getBoundingClientRect().top - anchor.top) > 1)
            ) {
                pending = undefined;
                return;
            }
            void nextTick(() => {
                if (pending !== anchor || !region.isConnected) return;
                const offset = region.getBoundingClientRect().top - anchor.top;
                if (Math.abs(offset) > 1) scroller.scrollBy({ top: offset, behavior: 'instant' });
                anchor.scrollTop = scroller.scrollTop;
                anchor.windowY = window.scrollY;
                if (adapter.status === 'success') {
                    if (anchor.hadFocus && document.activeElement === document.body)
                        region.focus({ preventScroll: true });
                    pending = undefined;
                }
            });
        },
        { flush: 'pre' },
    );
    onScopeDispose(() => {
        clearTimeout(clearGesture);
        pending = undefined;
    });
}
