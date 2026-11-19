import { computed } from 'vue';
import { defaultNavigator, useMounted } from '@vueuse/core';
import type { DataViewMultiSortKey } from '../dataViewOptions';

export function useSortModifier(key: DataViewMultiSortKey) {
    const mounted = useMounted();
    return computed(() => {
        if (key !== 'auto') return key;
        const platform = mounted.value
            ? `${defaultNavigator?.platform ?? ''} ${defaultNavigator?.userAgent ?? ''}`
            : '';
        return /Mac|Darwin|iPhone|iPad|iPod/i.test(platform) ? 'meta' : 'ctrl';
    });
}
export function sortModifierPressed(key: Exclude<DataViewMultiSortKey, 'auto'>, event: MouseEvent) {
    switch (key) {
        case 'meta':
            return event.metaKey;
        case 'ctrl':
            return event.ctrlKey;
        case 'shift':
            return event.shiftKey;
        case 'alt':
            return event.altKey;
    }
}
