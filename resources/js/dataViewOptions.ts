import { inject, type InjectionKey } from 'vue';
import type { IconProps } from './WebAwesome/iconProps';

export type DataViewMultiSortKey = 'auto' | 'meta' | 'ctrl' | 'shift' | 'alt';
export type DataViewSortIcon =
    | string
    | {
          readonly name: NonNullable<IconProps['name']>;
          readonly family?: IconProps['family'];
          readonly variant?: IconProps['variant'];
      };
export interface DataViewOptions {
    readonly multiSortKey?: DataViewMultiSortKey;
    readonly sortIcons?: {
        readonly family?: IconProps['family'];
        readonly variant?: IconProps['variant'];
        readonly ascending?: DataViewSortIcon;
        readonly descending?: DataViewSortIcon;
        readonly unsorted?: DataViewSortIcon;
    };
}
type ResolvedIcon = string | Readonly<{ name: string; family: string; variant: string }>;
export interface ResolvedDataViewOptions {
    readonly multiSortKey: DataViewMultiSortKey;
    readonly sortIcons: Readonly<{
        ascending: ResolvedIcon;
        descending: ResolvedIcon;
        unsorted: ResolvedIcon;
    }>;
}
export const dataViewOptionsKey: InjectionKey<ResolvedDataViewOptions> = Symbol('dataViewOptions');

export function resolveDataViewOptions(options: DataViewOptions = {}): ResolvedDataViewOptions {
    const multiSortKey = options.multiSortKey ?? 'auto';
    if (!['auto', 'meta', 'ctrl', 'shift', 'alt'].includes(multiSortKey))
        throw new TypeError('DataView multiSortKey must be auto, meta, ctrl, shift, or alt.');
    const icons = options.sortIcons;
    const family = iconText(icons?.family ?? 'classic', 'family');
    const variant = iconText(icons?.variant ?? 'solid', 'variant');
    function icon(value: DataViewSortIcon | undefined, name: string): ResolvedIcon {
        if (typeof value === 'string') return value;
        if (value !== undefined && (!value || typeof value !== 'object'))
            throw new TypeError('DataView sort icons must be characters or icon descriptors.');
        return Object.freeze({
            name: iconText(value === undefined ? name : value.name, 'name'),
            family: iconText(value?.family ?? family, 'family'),
            variant: iconText(value?.variant ?? variant, 'variant'),
        });
    }
    return Object.freeze({
        multiSortKey,
        sortIcons: Object.freeze({
            ascending: icon(icons?.ascending, 'sort-up'),
            descending: icon(icons?.descending, 'sort-down'),
            unsorted: icon(icons?.unsorted, 'sort'),
        }),
    });
}
function iconText(value: unknown, property: string): string {
    if (typeof value !== 'string' || !value.trim())
        throw new TypeError(`DataView sort icon ${property} must be a nonempty string.`);
    return value;
}
const defaults = resolveDataViewOptions();

/** Read the installed application's immutable DataView options, or the built-in defaults. */
export function useDataViewOptions(): ResolvedDataViewOptions {
    return inject(dataViewOptionsKey, defaults);
}
