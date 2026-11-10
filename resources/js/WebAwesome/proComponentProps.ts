import type WaBarChart from '@web.awesome.me/webawesome-pro/dist/components/bar-chart/bar-chart.js';
import type WaBubbleChart from '@web.awesome.me/webawesome-pro/dist/components/bubble-chart/bubble-chart.js';
import type WaChart from '@web.awesome.me/webawesome-pro/dist/components/chart/chart.js';
import type WaCombobox from '@web.awesome.me/webawesome-pro/dist/components/combobox/combobox.js';
import type WaDataGrid from '@web.awesome.me/webawesome-pro/dist/components/data-grid/data-grid.js';
import type WaDateInput from '@web.awesome.me/webawesome-pro/dist/components/date-input/date-input.js';
import type WaDatePicker from '@web.awesome.me/webawesome-pro/dist/components/date-picker/date-picker.js';
import type WaDoughnutChart from '@web.awesome.me/webawesome-pro/dist/components/doughnut-chart/doughnut-chart.js';
import type WaFileInput from '@web.awesome.me/webawesome-pro/dist/components/file-input/file-input.js';
import type WaLineChart from '@web.awesome.me/webawesome-pro/dist/components/line-chart/line-chart.js';
import type WaPieChart from '@web.awesome.me/webawesome-pro/dist/components/pie-chart/pie-chart.js';
import type WaPolarAreaChart from '@web.awesome.me/webawesome-pro/dist/components/polar-area-chart/polar-area-chart.js';
import type WaRadarChart from '@web.awesome.me/webawesome-pro/dist/components/radar-chart/radar-chart.js';
import type WaScatterChart from '@web.awesome.me/webawesome-pro/dist/components/scatter-chart/scatter-chart.js';
import type WaSparkline from '@web.awesome.me/webawesome-pro/dist/components/sparkline/sparkline.js';
import type WaVideo from '@web.awesome.me/webawesome-pro/dist/components/video/video.js';
import type WaVideoPlaylist from '@web.awesome.me/webawesome-pro/dist/components/video-playlist/video-playlist.js';
import type { ControlBindingProps } from './useFormBridge';
import type { DatePickerModelValue } from './modelDomains';
import type * as Upstream from '@web.awesome.me/webawesome-pro/dist/custom-elements-jsx.d.ts';
import type { HTMLAttributes } from 'vue';

export interface BarChartNativeProps extends Omit<
    HTMLAttributes,
    | 'type'
    | 'orientation'
    | 'label'
    | 'description'
    | 'x-label'
    | 'xLabel'
    | 'y-label'
    | 'yLabel'
    | 'legend-position'
    | 'legendPosition'
    | 'stacked'
    | 'index-axis'
    | 'indexAxis'
    | 'grid'
    | 'min'
    | 'max'
    | 'without-animation'
    | 'withoutAnimation'
    | 'without-legend'
    | 'withoutLegend'
    | 'without-tooltip'
    | 'withoutTooltip'
    | 'plugins'
    | 'dir'
    | 'lang'
    | 'config'
> {
    type?: WaBarChart['type'];
    orientation?: WaBarChart['orientation'];
    label?: WaBarChart['label'];
    description?: WaBarChart['description'];
    'x-label'?: WaBarChart['xLabel'];
    xLabel?: WaBarChart['xLabel'];
    'y-label'?: WaBarChart['yLabel'];
    yLabel?: WaBarChart['yLabel'];
    'legend-position'?: WaBarChart['legendPosition'];
    legendPosition?: WaBarChart['legendPosition'];
    stacked?: WaBarChart['stacked'];
    'index-axis'?: WaBarChart['indexAxis'];
    indexAxis?: WaBarChart['indexAxis'];
    grid?: WaBarChart['grid'];
    min?: WaBarChart['min'];
    max?: WaBarChart['max'];
    'without-animation'?: WaBarChart['withoutAnimation'];
    withoutAnimation?: WaBarChart['withoutAnimation'];
    'without-legend'?: WaBarChart['withoutLegend'];
    withoutLegend?: WaBarChart['withoutLegend'];
    'without-tooltip'?: WaBarChart['withoutTooltip'];
    withoutTooltip?: WaBarChart['withoutTooltip'];
    plugins?: WaBarChart['plugins'];
    dir?: WaBarChart['dir'];
    lang?: WaBarChart['lang'];
    config?: WaBarChart['config'];
    slot?: string;
}

export interface BarChartProps extends BarChartNativeProps {}

export interface BubbleChartNativeProps extends Omit<
    HTMLAttributes,
    | 'type'
    | 'label'
    | 'description'
    | 'x-label'
    | 'xLabel'
    | 'y-label'
    | 'yLabel'
    | 'legend-position'
    | 'legendPosition'
    | 'stacked'
    | 'index-axis'
    | 'indexAxis'
    | 'grid'
    | 'min'
    | 'max'
    | 'without-animation'
    | 'withoutAnimation'
    | 'without-legend'
    | 'withoutLegend'
    | 'without-tooltip'
    | 'withoutTooltip'
    | 'plugins'
    | 'dir'
    | 'lang'
    | 'config'
> {
    type?: WaBubbleChart['type'];
    label?: WaBubbleChart['label'];
    description?: WaBubbleChart['description'];
    'x-label'?: WaBubbleChart['xLabel'];
    xLabel?: WaBubbleChart['xLabel'];
    'y-label'?: WaBubbleChart['yLabel'];
    yLabel?: WaBubbleChart['yLabel'];
    'legend-position'?: WaBubbleChart['legendPosition'];
    legendPosition?: WaBubbleChart['legendPosition'];
    stacked?: WaBubbleChart['stacked'];
    'index-axis'?: WaBubbleChart['indexAxis'];
    indexAxis?: WaBubbleChart['indexAxis'];
    grid?: WaBubbleChart['grid'];
    min?: WaBubbleChart['min'];
    max?: WaBubbleChart['max'];
    'without-animation'?: WaBubbleChart['withoutAnimation'];
    withoutAnimation?: WaBubbleChart['withoutAnimation'];
    'without-legend'?: WaBubbleChart['withoutLegend'];
    withoutLegend?: WaBubbleChart['withoutLegend'];
    'without-tooltip'?: WaBubbleChart['withoutTooltip'];
    withoutTooltip?: WaBubbleChart['withoutTooltip'];
    plugins?: WaBubbleChart['plugins'];
    dir?: WaBubbleChart['dir'];
    lang?: WaBubbleChart['lang'];
    config?: WaBubbleChart['config'];
    slot?: string;
}

export interface BubbleChartProps extends BubbleChartNativeProps {}

export interface ChartNativeProps extends Omit<
    HTMLAttributes,
    | 'label'
    | 'description'
    | 'type'
    | 'x-label'
    | 'xLabel'
    | 'y-label'
    | 'yLabel'
    | 'legend-position'
    | 'legendPosition'
    | 'stacked'
    | 'index-axis'
    | 'indexAxis'
    | 'grid'
    | 'min'
    | 'max'
    | 'without-animation'
    | 'withoutAnimation'
    | 'without-legend'
    | 'withoutLegend'
    | 'without-tooltip'
    | 'withoutTooltip'
    | 'plugins'
    | 'dir'
    | 'lang'
    | 'config'
> {
    label?: WaChart['label'];
    description?: WaChart['description'];
    type?: WaChart['type'];
    'x-label'?: WaChart['xLabel'];
    xLabel?: WaChart['xLabel'];
    'y-label'?: WaChart['yLabel'];
    yLabel?: WaChart['yLabel'];
    'legend-position'?: WaChart['legendPosition'];
    legendPosition?: WaChart['legendPosition'];
    stacked?: WaChart['stacked'];
    'index-axis'?: WaChart['indexAxis'];
    indexAxis?: WaChart['indexAxis'];
    grid?: WaChart['grid'];
    min?: WaChart['min'];
    max?: WaChart['max'];
    'without-animation'?: WaChart['withoutAnimation'];
    withoutAnimation?: WaChart['withoutAnimation'];
    'without-legend'?: WaChart['withoutLegend'];
    withoutLegend?: WaChart['withoutLegend'];
    'without-tooltip'?: WaChart['withoutTooltip'];
    withoutTooltip?: WaChart['withoutTooltip'];
    plugins?: WaChart['plugins'];
    dir?: WaChart['dir'];
    lang?: WaChart['lang'];
    config?: WaChart['config'];
    slot?: string;
}

export interface ChartProps extends ChartNativeProps {}

export interface ComboboxNativeProps extends Omit<
    HTMLAttributes,
    | 'name'
    | 'value'
    | 'defaultValue'
    | 'size'
    | 'placeholder'
    | 'multiple'
    | 'max-options-visible'
    | 'maxOptionsVisible'
    | 'disabled'
    | 'with-clear'
    | 'withClear'
    | 'open'
    | 'appearance'
    | 'pill'
    | 'label'
    | 'placement'
    | 'hint'
    | 'with-label'
    | 'withLabel'
    | 'with-hint'
    | 'withHint'
    | 'required'
    | 'allow-custom-value'
    | 'allowCustomValue'
    | 'allow-create'
    | 'allowCreate'
    | 'server'
    | 'loading'
    | 'filter-debounce'
    | 'filterDebounce'
    | 'autocapitalize'
    | 'autocorrect'
    | 'inputmode'
    | 'enterkeyhint'
    | 'spellcheck'
    | 'custom-error'
    | 'customError'
    | 'dir'
    | 'lang'
    | 'inputValue'
    | 'filter'
    | 'dataSource'
    | 'getTag'
    | 'onInput'
    | 'onChange'
    | 'onRequest'
    | 'onFocus'
    | 'onBlur'
    | 'onWaClear'
    | 'onWaShow'
    | 'onWaAfterShow'
    | 'onWaHide'
    | 'onWaAfterHide'
    | 'onWaCreate'
    | 'onWaInvalid'
    | 'onWaOptionsRequest'
    | 'onWaOptionsError'
> {
    name?: WaCombobox['name'];
    value?: string | string[] | null;
    defaultValue?: null | string | string[];
    size?: WaCombobox['size'];
    placeholder?: WaCombobox['placeholder'];
    multiple?: WaCombobox['multiple'];
    'max-options-visible'?: WaCombobox['maxOptionsVisible'];
    maxOptionsVisible?: WaCombobox['maxOptionsVisible'];
    disabled?: WaCombobox['disabled'];
    'with-clear'?: WaCombobox['withClear'];
    withClear?: WaCombobox['withClear'];
    open?: WaCombobox['open'];
    appearance?: WaCombobox['appearance'];
    pill?: WaCombobox['pill'];
    label?: WaCombobox['label'];
    placement?: WaCombobox['placement'];
    hint?: WaCombobox['hint'];
    'with-label'?: WaCombobox['withLabel'];
    withLabel?: WaCombobox['withLabel'];
    'with-hint'?: WaCombobox['withHint'];
    withHint?: WaCombobox['withHint'];
    required?: WaCombobox['required'];
    'allow-custom-value'?: WaCombobox['allowCustomValue'];
    allowCustomValue?: WaCombobox['allowCustomValue'];
    'allow-create'?: WaCombobox['allowCreate'];
    allowCreate?: WaCombobox['allowCreate'];
    server?: WaCombobox['server'];
    loading?: WaCombobox['loading'];
    'filter-debounce'?: WaCombobox['filterDebounce'];
    filterDebounce?: WaCombobox['filterDebounce'];
    autocapitalize?: WaCombobox['autocapitalize'];
    autocorrect?: boolean | 'on' | 'off';
    inputmode?: WaCombobox['inputmode'];
    enterkeyhint?: WaCombobox['enterkeyhint'];
    spellcheck?: HTMLAttributes['spellcheck'];
    'custom-error'?: WaCombobox['customError'];
    customError?: WaCombobox['customError'];
    dir?: WaCombobox['dir'];
    lang?: WaCombobox['lang'];
    inputValue?: WaCombobox['inputValue'];
    filter?: WaCombobox['filter'];
    dataSource?: WaCombobox['dataSource'];
    getTag?: WaCombobox['getTag'];
    form?: string;
    slot?: string;
    onInput?: Upstream.WaComboboxProps['oninput'];
    onChange?: Upstream.WaComboboxProps['onchange'];
    onRequest?: Upstream.WaComboboxProps['onrequest'];
    onFocus?: Upstream.WaComboboxProps['onfocus'];
    onBlur?: Upstream.WaComboboxProps['onblur'];
    onWaClear?: Upstream.WaComboboxProps['onwa-clear'];
    onWaShow?: Upstream.WaComboboxProps['onwa-show'];
    onWaAfterShow?: Upstream.WaComboboxProps['onwa-after-show'];
    onWaHide?: Upstream.WaComboboxProps['onwa-hide'];
    onWaAfterHide?: Upstream.WaComboboxProps['onwa-after-hide'];
    onWaCreate?: Upstream.WaComboboxProps['onwa-create'];
    onWaInvalid?: Upstream.WaComboboxProps['onwa-invalid'];
    onWaOptionsRequest?: Upstream.WaComboboxProps['onwa-options-request'];
    onWaOptionsError?: Upstream.WaComboboxProps['onwa-options-error'];
}

export type ComboboxProps<T extends object = object, M extends boolean = boolean> = Omit<
    ComboboxNativeProps,
    'form' | 'multiple'
> &
    ControlBindingProps<
        T,
        string | string[] | null,
        Extract<WaCombobox['value'], M extends true ? string[] | null : string | null>,
        'value'
    > & { multiple?: M } & {
        'onUpdate:modelValue'?: (
            value: Extract<WaCombobox['value'], M extends true ? string[] | null : string | null>,
        ) => void;
        'onUpdate:open'?: (value: WaCombobox['open']) => void;
    };

export interface DataGridNativeProps extends Omit<
    HTMLAttributes,
    | 'row-key'
    | 'rowKey'
    | 'selectable'
    | 'paginate'
    | 'page-size'
    | 'pageSize'
    | 'page'
    | 'without-sort-removal'
    | 'withoutSortRemoval'
    | 'sort-desc-first'
    | 'sortDescFirst'
    | 'max-multi-sort'
    | 'maxMultiSort'
    | 'with-search'
    | 'withSearch'
    | 'resizable'
    | 'reorderable'
    | 'pinnable'
    | 'with-column-menu'
    | 'withColumnMenu'
    | 'with-columns-menu'
    | 'withColumnsMenu'
    | 'striped'
    | 'child-rows'
    | 'childRows'
    | 'filter-from-leaf-rows'
    | 'filterFromLeafRows'
    | 'group-by'
    | 'groupBy'
    | 'server'
    | 'filter-debounce'
    | 'filterDebounce'
    | 'total'
    | 'loading'
    | 'label'
    | 'appearance'
    | 'size'
    | 'dir'
    | 'lang'
    | 'data'
    | 'columns'
    | 'selectableRows'
    | 'pageSizeOptions'
    | 'searchTerm'
    | 'rowDetail'
    | 'rowClass'
    | 'dataSource'
    | 'searchFn'
    | 'sort'
    | 'columnOrder'
    | 'selectedKeys'
    | 'selectedRows'
    | 'expandedKeys'
    | 'filters'
    | 'onRequest'
    | 'onWaSortChange'
    | 'onWaRowSelect'
    | 'onWaPageChange'
    | 'onWaFilterChange'
    | 'onWaRowExpand'
    | 'onWaRowCollapse'
    | 'onWaDataRequest'
    | 'onWaDataError'
    | 'onWaColumnMove'
    | 'onWaColumnResize'
    | 'onWaColumnVisibilityChange'
    | 'onWaColumnPin'
    | 'onWaCellClick'
    | 'onWaCellContextmenu'
> {
    'row-key'?: WaDataGrid['rowKey'];
    rowKey?: WaDataGrid['rowKey'];
    selectable?: WaDataGrid['selectable'];
    paginate?: WaDataGrid['paginate'];
    'page-size'?: WaDataGrid['pageSize'];
    pageSize?: WaDataGrid['pageSize'];
    page?: WaDataGrid['page'];
    'without-sort-removal'?: WaDataGrid['withoutSortRemoval'];
    withoutSortRemoval?: WaDataGrid['withoutSortRemoval'];
    'sort-desc-first'?: WaDataGrid['sortDescFirst'];
    sortDescFirst?: WaDataGrid['sortDescFirst'];
    'max-multi-sort'?: WaDataGrid['maxMultiSort'];
    maxMultiSort?: WaDataGrid['maxMultiSort'];
    'with-search'?: WaDataGrid['withSearch'];
    withSearch?: WaDataGrid['withSearch'];
    resizable?: WaDataGrid['resizable'];
    reorderable?: WaDataGrid['reorderable'];
    pinnable?: WaDataGrid['pinnable'];
    'with-column-menu'?: WaDataGrid['withColumnMenu'];
    withColumnMenu?: WaDataGrid['withColumnMenu'];
    'with-columns-menu'?: WaDataGrid['withColumnsMenu'];
    withColumnsMenu?: WaDataGrid['withColumnsMenu'];
    striped?: WaDataGrid['striped'];
    'child-rows'?: WaDataGrid['childRows'];
    childRows?: WaDataGrid['childRows'];
    'filter-from-leaf-rows'?: WaDataGrid['filterFromLeafRows'];
    filterFromLeafRows?: WaDataGrid['filterFromLeafRows'];
    'group-by'?: WaDataGrid['groupBy'];
    groupBy?: WaDataGrid['groupBy'];
    server?: WaDataGrid['server'];
    'filter-debounce'?: WaDataGrid['filterDebounce'];
    filterDebounce?: WaDataGrid['filterDebounce'];
    total?: WaDataGrid['total'];
    loading?: WaDataGrid['loading'];
    label?: WaDataGrid['label'];
    appearance?: WaDataGrid['appearance'];
    size?: WaDataGrid['size'];
    dir?: WaDataGrid['dir'];
    lang?: WaDataGrid['lang'];
    data?: WaDataGrid['data'];
    columns?: WaDataGrid['columns'];
    selectableRows?: WaDataGrid['selectableRows'];
    pageSizeOptions?: WaDataGrid['pageSizeOptions'];
    searchTerm?: WaDataGrid['searchTerm'];
    rowDetail?: WaDataGrid['rowDetail'];
    rowClass?: WaDataGrid['rowClass'];
    dataSource?: WaDataGrid['dataSource'];
    searchFn?: WaDataGrid['searchFn'];
    sort?: WaDataGrid['sort'];
    columnOrder?: string[];
    selectedKeys?: (string | number)[];
    selectedRows?: WaDataGrid['selectedRows'];
    expandedKeys?: (string | number)[];
    filters?: {
        id: string;
        value: unknown;
    }[];
    slot?: string;
    onRequest?: Upstream.WaDataGridProps['onrequest'];
    onWaSortChange?: Upstream.WaDataGridProps['onwa-sort-change'];
    onWaRowSelect?: Upstream.WaDataGridProps['onwa-row-select'];
    onWaPageChange?: Upstream.WaDataGridProps['onwa-page-change'];
    onWaFilterChange?: Upstream.WaDataGridProps['onwa-filter-change'];
    onWaRowExpand?: Upstream.WaDataGridProps['onwa-row-expand'];
    onWaRowCollapse?: Upstream.WaDataGridProps['onwa-row-collapse'];
    onWaDataRequest?: Upstream.WaDataGridProps['onwa-data-request'];
    onWaDataError?: Upstream.WaDataGridProps['onwa-data-error'];
    onWaColumnMove?: Upstream.WaDataGridProps['onwa-column-move'];
    onWaColumnResize?: Upstream.WaDataGridProps['onwa-column-resize'];
    onWaColumnVisibilityChange?: Upstream.WaDataGridProps['onwa-column-visibility-change'];
    onWaColumnPin?: Upstream.WaDataGridProps['onwa-column-pin'];
    onWaCellClick?: Upstream.WaDataGridProps['onwa-cell-click'];
    onWaCellContextmenu?: Upstream.WaDataGridProps['onwa-cell-contextmenu'];
}

export interface DataGridProps extends DataGridNativeProps {
    'onUpdate:page'?: (value: WaDataGrid['page']) => void;
    'onUpdate:pageSize'?: (value: WaDataGrid['pageSize']) => void;
    'onUpdate:sort'?: (value: WaDataGrid['sort']) => void;
    'onUpdate:filters'?: (value: WaDataGrid['filters']) => void;
    'onUpdate:searchTerm'?: (value: WaDataGrid['searchTerm']) => void;
    'onUpdate:selectedKeys'?: (value: WaDataGrid['selectedKeys']) => void;
    'onUpdate:selectedRows'?: (value: WaDataGrid['selectedRows']) => void;
    'onUpdate:expandedKeys'?: (value: WaDataGrid['expandedKeys']) => void;
    'onUpdate:columnOrder'?: (value: WaDataGrid['columnOrder']) => void;
}

export interface DateInputNativeProps extends Omit<
    HTMLAttributes,
    | 'name'
    | 'value'
    | 'defaultValue'
    | 'disabled'
    | 'required'
    | 'readonly'
    | 'size'
    | 'appearance'
    | 'pill'
    | 'label'
    | 'hint'
    | 'autocomplete'
    | 'with-clear'
    | 'withClear'
    | 'with-label'
    | 'withLabel'
    | 'with-hint'
    | 'withHint'
    | 'mode'
    | 'min'
    | 'max'
    | 'today'
    | 'first-day-of-week'
    | 'firstDayOfWeek'
    | 'disabled-dates'
    | 'disabledDates'
    | 'disabled-days-of-week'
    | 'disabledDaysOfWeek'
    | 'disable-past'
    | 'disablePast'
    | 'disable-future'
    | 'disableFuture'
    | 'min-range'
    | 'minRange'
    | 'max-range'
    | 'maxRange'
    | 'months'
    | 'page-by'
    | 'pageBy'
    | 'with-outside-days'
    | 'withOutsideDays'
    | 'with-week-numbers'
    | 'withWeekNumbers'
    | 'weekday-format'
    | 'weekdayFormat'
    | 'open'
    | 'placement'
    | 'distance'
    | 'custom-error'
    | 'customError'
    | 'dir'
    | 'lang'
    | 'isDateDisabled'
    | 'dayContent'
    | 'onInput'
    | 'onChange'
    | 'onFocus'
    | 'onBlur'
    | 'onWaClear'
    | 'onWaShow'
    | 'onWaAfterShow'
    | 'onWaHide'
    | 'onWaAfterHide'
    | 'onWaInvalid'
> {
    name?: WaDateInput['name'];
    value?:
        | string
        | Date
        | {
              from?: Date | null;
              to?: Date | null;
          }
        | null;
    defaultValue?: WaDateInput['defaultValue'];
    disabled?: WaDateInput['disabled'];
    required?: WaDateInput['required'];
    readonly?: WaDateInput['readonly'];
    size?: WaDateInput['size'];
    appearance?: WaDateInput['appearance'];
    pill?: WaDateInput['pill'];
    label?: WaDateInput['label'];
    hint?: WaDateInput['hint'];
    autocomplete?: WaDateInput['autocomplete'];
    'with-clear'?: WaDateInput['withClear'];
    withClear?: WaDateInput['withClear'];
    'with-label'?: WaDateInput['withLabel'];
    withLabel?: WaDateInput['withLabel'];
    'with-hint'?: WaDateInput['withHint'];
    withHint?: WaDateInput['withHint'];
    mode?: WaDateInput['mode'];
    min?: WaDateInput['min'];
    max?: WaDateInput['max'];
    today?: WaDateInput['today'];
    'first-day-of-week'?: WaDateInput['firstDayOfWeek'];
    firstDayOfWeek?: WaDateInput['firstDayOfWeek'];
    'disabled-dates'?: WaDateInput['disabledDates'];
    disabledDates?: WaDateInput['disabledDates'];
    'disabled-days-of-week'?: WaDateInput['disabledDaysOfWeek'];
    disabledDaysOfWeek?: WaDateInput['disabledDaysOfWeek'];
    'disable-past'?: WaDateInput['disablePast'];
    disablePast?: WaDateInput['disablePast'];
    'disable-future'?: WaDateInput['disableFuture'];
    disableFuture?: WaDateInput['disableFuture'];
    'min-range'?: WaDateInput['minRange'];
    minRange?: WaDateInput['minRange'];
    'max-range'?: WaDateInput['maxRange'];
    maxRange?: WaDateInput['maxRange'];
    months?: WaDateInput['months'];
    'page-by'?: WaDateInput['pageBy'];
    pageBy?: WaDateInput['pageBy'];
    'with-outside-days'?: WaDateInput['withOutsideDays'];
    withOutsideDays?: WaDateInput['withOutsideDays'];
    'with-week-numbers'?: WaDateInput['withWeekNumbers'];
    withWeekNumbers?: WaDateInput['withWeekNumbers'];
    'weekday-format'?: WaDateInput['weekdayFormat'];
    weekdayFormat?: WaDateInput['weekdayFormat'];
    open?: WaDateInput['open'];
    placement?: WaDateInput['placement'];
    distance?: WaDateInput['distance'];
    'custom-error'?: WaDateInput['customError'];
    customError?: WaDateInput['customError'];
    dir?: WaDateInput['dir'];
    lang?: WaDateInput['lang'];
    isDateDisabled?: WaDateInput['isDateDisabled'];
    dayContent?: WaDateInput['dayContent'];
    form?: string;
    slot?: string;
    onInput?: Upstream.WaDateInputProps['oninput'];
    onChange?: Upstream.WaDateInputProps['onchange'];
    onFocus?: Upstream.WaDateInputProps['onfocus'];
    onBlur?: Upstream.WaDateInputProps['onblur'];
    onWaClear?: Upstream.WaDateInputProps['onwa-clear'];
    onWaShow?: Upstream.WaDateInputProps['onwa-show'];
    onWaAfterShow?: Upstream.WaDateInputProps['onwa-after-show'];
    onWaHide?: Upstream.WaDateInputProps['onwa-hide'];
    onWaAfterHide?: Upstream.WaDateInputProps['onwa-after-hide'];
    onWaInvalid?: Upstream.WaDateInputProps['onwa-invalid'];
}

export type DateInputProps<T extends object = object> = Omit<DateInputNativeProps, 'form'> &
    ControlBindingProps<
        T,
        | string
        | Date
        | {
              from?: Date | null;
              to?: Date | null;
          }
        | null,
        WaDateInput['value'],
        'value'
    > & {
        'onUpdate:modelValue'?: (value: WaDateInput['value']) => void;
        'onUpdate:open'?: (value: WaDateInput['open']) => void;
    };

export interface DatePickerNativeProps extends Omit<
    HTMLAttributes,
    | 'mode'
    | 'value'
    | 'min'
    | 'max'
    | 'today'
    | 'focused-date'
    | 'focusedDate'
    | 'view'
    | 'months'
    | 'page-by'
    | 'pageBy'
    | 'first-day-of-week'
    | 'firstDayOfWeek'
    | 'with-outside-days'
    | 'withOutsideDays'
    | 'with-week-numbers'
    | 'withWeekNumbers'
    | 'weekday-format'
    | 'weekdayFormat'
    | 'disabled'
    | 'readonly'
    | 'disabled-dates'
    | 'disabledDates'
    | 'disabled-days-of-week'
    | 'disabledDaysOfWeek'
    | 'disable-past'
    | 'disablePast'
    | 'disable-future'
    | 'disableFuture'
    | 'min-range'
    | 'minRange'
    | 'max-range'
    | 'maxRange'
    | 'size'
    | 'locale'
    | 'dir'
    | 'lang'
    | 'isDateDisabled'
    | 'dayContent'
    | 'onInput'
    | 'onChange'
    | 'onWaFocusDay'
    | 'onWaViewChange'
> {
    mode?: WaDatePicker['mode'];
    value?: unknown;
    min?: WaDatePicker['min'];
    max?: WaDatePicker['max'];
    today?: WaDatePicker['today'];
    'focused-date'?: WaDatePicker['focusedDate'];
    focusedDate?: WaDatePicker['focusedDate'];
    view?: WaDatePicker['view'];
    months?: WaDatePicker['months'];
    'page-by'?: WaDatePicker['pageBy'];
    pageBy?: WaDatePicker['pageBy'];
    'first-day-of-week'?: WaDatePicker['firstDayOfWeek'];
    firstDayOfWeek?: WaDatePicker['firstDayOfWeek'];
    'with-outside-days'?: WaDatePicker['withOutsideDays'];
    withOutsideDays?: WaDatePicker['withOutsideDays'];
    'with-week-numbers'?: WaDatePicker['withWeekNumbers'];
    withWeekNumbers?: WaDatePicker['withWeekNumbers'];
    'weekday-format'?: WaDatePicker['weekdayFormat'];
    weekdayFormat?: WaDatePicker['weekdayFormat'];
    disabled?: WaDatePicker['disabled'];
    readonly?: WaDatePicker['readonly'];
    'disabled-dates'?: string | string[] | Date[] | null | undefined;
    disabledDates?: string | string[] | Date[] | null | undefined;
    'disabled-days-of-week'?: WaDatePicker['disabledDaysOfWeek'];
    disabledDaysOfWeek?: WaDatePicker['disabledDaysOfWeek'];
    'disable-past'?: WaDatePicker['disablePast'];
    disablePast?: WaDatePicker['disablePast'];
    'disable-future'?: WaDatePicker['disableFuture'];
    disableFuture?: WaDatePicker['disableFuture'];
    'min-range'?: WaDatePicker['minRange'];
    minRange?: WaDatePicker['minRange'];
    'max-range'?: WaDatePicker['maxRange'];
    maxRange?: WaDatePicker['maxRange'];
    size?: WaDatePicker['size'];
    locale?: WaDatePicker['locale'];
    dir?: WaDatePicker['dir'];
    lang?: WaDatePicker['lang'];
    isDateDisabled?: WaDatePicker['isDateDisabled'];
    dayContent?: WaDatePicker['dayContent'];
    slot?: string;
    onInput?: Upstream.WaDatePickerProps['oninput'];
    onChange?: Upstream.WaDatePickerProps['onchange'];
    onWaFocusDay?: Upstream.WaDatePickerProps['onwa-focus-day'];
    onWaViewChange?: Upstream.WaDatePickerProps['onwa-view-change'];
}

export type DatePickerProps<T extends object = object> = Omit<DatePickerNativeProps, 'form'> &
    ControlBindingProps<T, DatePickerModelValue, WaDatePicker['value'], 'value'> & {
        'onUpdate:modelValue'?: (value: WaDatePicker['value']) => void;
        'onUpdate:view'?: (value: WaDatePicker['view']) => void;
        'onUpdate:focusedDate'?: (value: WaDatePicker['focusedDate']) => void;
    };

export interface DoughnutChartNativeProps extends Omit<
    HTMLAttributes,
    | 'type'
    | 'label'
    | 'description'
    | 'x-label'
    | 'xLabel'
    | 'y-label'
    | 'yLabel'
    | 'legend-position'
    | 'legendPosition'
    | 'stacked'
    | 'index-axis'
    | 'indexAxis'
    | 'grid'
    | 'min'
    | 'max'
    | 'without-animation'
    | 'withoutAnimation'
    | 'without-legend'
    | 'withoutLegend'
    | 'without-tooltip'
    | 'withoutTooltip'
    | 'plugins'
    | 'dir'
    | 'lang'
    | 'config'
> {
    type?: WaDoughnutChart['type'];
    label?: WaDoughnutChart['label'];
    description?: WaDoughnutChart['description'];
    'x-label'?: WaDoughnutChart['xLabel'];
    xLabel?: WaDoughnutChart['xLabel'];
    'y-label'?: WaDoughnutChart['yLabel'];
    yLabel?: WaDoughnutChart['yLabel'];
    'legend-position'?: WaDoughnutChart['legendPosition'];
    legendPosition?: WaDoughnutChart['legendPosition'];
    stacked?: WaDoughnutChart['stacked'];
    'index-axis'?: WaDoughnutChart['indexAxis'];
    indexAxis?: WaDoughnutChart['indexAxis'];
    grid?: WaDoughnutChart['grid'];
    min?: WaDoughnutChart['min'];
    max?: WaDoughnutChart['max'];
    'without-animation'?: WaDoughnutChart['withoutAnimation'];
    withoutAnimation?: WaDoughnutChart['withoutAnimation'];
    'without-legend'?: WaDoughnutChart['withoutLegend'];
    withoutLegend?: WaDoughnutChart['withoutLegend'];
    'without-tooltip'?: WaDoughnutChart['withoutTooltip'];
    withoutTooltip?: WaDoughnutChart['withoutTooltip'];
    plugins?: WaDoughnutChart['plugins'];
    dir?: WaDoughnutChart['dir'];
    lang?: WaDoughnutChart['lang'];
    config?: WaDoughnutChart['config'];
    slot?: string;
}

export interface DoughnutChartProps extends DoughnutChartNativeProps {}

export interface FileInputNativeProps extends Omit<
    HTMLAttributes,
    | 'size'
    | 'label'
    | 'hint'
    | 'multiple'
    | 'accept'
    | 'required'
    | 'capture'
    | 'with-label'
    | 'withLabel'
    | 'with-hint'
    | 'withHint'
    | 'name'
    | 'disabled'
    | 'custom-error'
    | 'customError'
    | 'dir'
    | 'lang'
    | 'files'
    | 'onInput'
    | 'onChange'
    | 'onFocus'
    | 'onBlur'
    | 'onWaInvalid'
> {
    size?: WaFileInput['size'];
    label?: WaFileInput['label'];
    hint?: WaFileInput['hint'];
    multiple?: WaFileInput['multiple'];
    accept?: WaFileInput['accept'];
    required?: WaFileInput['required'];
    capture?: WaFileInput['capture'];
    'with-label'?: WaFileInput['withLabel'];
    withLabel?: WaFileInput['withLabel'];
    'with-hint'?: WaFileInput['withHint'];
    withHint?: WaFileInput['withHint'];
    name?: WaFileInput['name'];
    disabled?: WaFileInput['disabled'];
    'custom-error'?: WaFileInput['customError'];
    customError?: WaFileInput['customError'];
    dir?: WaFileInput['dir'];
    lang?: WaFileInput['lang'];
    files?: WaFileInput['files'];
    form?: string;
    slot?: string;
    onInput?: Upstream.WaFileInputProps['oninput'];
    onChange?: Upstream.WaFileInputProps['onchange'];
    onFocus?: Upstream.WaFileInputProps['onfocus'];
    onBlur?: Upstream.WaFileInputProps['onblur'];
    onWaInvalid?: Upstream.WaFileInputProps['onwa-invalid'];
}

export type FileInputProps<T extends object = object> = Omit<FileInputNativeProps, 'form'> &
    ControlBindingProps<T, WaFileInput['files'], WaFileInput['files'], 'files'> & {
        'onUpdate:modelValue'?: (value: WaFileInput['files']) => void;
    };

export interface LineChartNativeProps extends Omit<
    HTMLAttributes,
    | 'type'
    | 'label'
    | 'description'
    | 'x-label'
    | 'xLabel'
    | 'y-label'
    | 'yLabel'
    | 'legend-position'
    | 'legendPosition'
    | 'stacked'
    | 'index-axis'
    | 'indexAxis'
    | 'grid'
    | 'min'
    | 'max'
    | 'without-animation'
    | 'withoutAnimation'
    | 'without-legend'
    | 'withoutLegend'
    | 'without-tooltip'
    | 'withoutTooltip'
    | 'plugins'
    | 'dir'
    | 'lang'
    | 'config'
> {
    type?: WaLineChart['type'];
    label?: WaLineChart['label'];
    description?: WaLineChart['description'];
    'x-label'?: WaLineChart['xLabel'];
    xLabel?: WaLineChart['xLabel'];
    'y-label'?: WaLineChart['yLabel'];
    yLabel?: WaLineChart['yLabel'];
    'legend-position'?: WaLineChart['legendPosition'];
    legendPosition?: WaLineChart['legendPosition'];
    stacked?: WaLineChart['stacked'];
    'index-axis'?: WaLineChart['indexAxis'];
    indexAxis?: WaLineChart['indexAxis'];
    grid?: WaLineChart['grid'];
    min?: WaLineChart['min'];
    max?: WaLineChart['max'];
    'without-animation'?: WaLineChart['withoutAnimation'];
    withoutAnimation?: WaLineChart['withoutAnimation'];
    'without-legend'?: WaLineChart['withoutLegend'];
    withoutLegend?: WaLineChart['withoutLegend'];
    'without-tooltip'?: WaLineChart['withoutTooltip'];
    withoutTooltip?: WaLineChart['withoutTooltip'];
    plugins?: WaLineChart['plugins'];
    dir?: WaLineChart['dir'];
    lang?: WaLineChart['lang'];
    config?: WaLineChart['config'];
    slot?: string;
}

export interface LineChartProps extends LineChartNativeProps {}

export interface PieChartNativeProps extends Omit<
    HTMLAttributes,
    | 'type'
    | 'label'
    | 'description'
    | 'x-label'
    | 'xLabel'
    | 'y-label'
    | 'yLabel'
    | 'legend-position'
    | 'legendPosition'
    | 'stacked'
    | 'index-axis'
    | 'indexAxis'
    | 'grid'
    | 'min'
    | 'max'
    | 'without-animation'
    | 'withoutAnimation'
    | 'without-legend'
    | 'withoutLegend'
    | 'without-tooltip'
    | 'withoutTooltip'
    | 'plugins'
    | 'dir'
    | 'lang'
    | 'config'
> {
    type?: WaPieChart['type'];
    label?: WaPieChart['label'];
    description?: WaPieChart['description'];
    'x-label'?: WaPieChart['xLabel'];
    xLabel?: WaPieChart['xLabel'];
    'y-label'?: WaPieChart['yLabel'];
    yLabel?: WaPieChart['yLabel'];
    'legend-position'?: WaPieChart['legendPosition'];
    legendPosition?: WaPieChart['legendPosition'];
    stacked?: WaPieChart['stacked'];
    'index-axis'?: WaPieChart['indexAxis'];
    indexAxis?: WaPieChart['indexAxis'];
    grid?: WaPieChart['grid'];
    min?: WaPieChart['min'];
    max?: WaPieChart['max'];
    'without-animation'?: WaPieChart['withoutAnimation'];
    withoutAnimation?: WaPieChart['withoutAnimation'];
    'without-legend'?: WaPieChart['withoutLegend'];
    withoutLegend?: WaPieChart['withoutLegend'];
    'without-tooltip'?: WaPieChart['withoutTooltip'];
    withoutTooltip?: WaPieChart['withoutTooltip'];
    plugins?: WaPieChart['plugins'];
    dir?: WaPieChart['dir'];
    lang?: WaPieChart['lang'];
    config?: WaPieChart['config'];
    slot?: string;
}

export interface PieChartProps extends PieChartNativeProps {}

export interface PolarAreaChartNativeProps extends Omit<
    HTMLAttributes,
    | 'type'
    | 'label'
    | 'description'
    | 'x-label'
    | 'xLabel'
    | 'y-label'
    | 'yLabel'
    | 'legend-position'
    | 'legendPosition'
    | 'stacked'
    | 'index-axis'
    | 'indexAxis'
    | 'grid'
    | 'min'
    | 'max'
    | 'without-animation'
    | 'withoutAnimation'
    | 'without-legend'
    | 'withoutLegend'
    | 'without-tooltip'
    | 'withoutTooltip'
    | 'plugins'
    | 'dir'
    | 'lang'
    | 'config'
> {
    type?: WaPolarAreaChart['type'];
    label?: WaPolarAreaChart['label'];
    description?: WaPolarAreaChart['description'];
    'x-label'?: WaPolarAreaChart['xLabel'];
    xLabel?: WaPolarAreaChart['xLabel'];
    'y-label'?: WaPolarAreaChart['yLabel'];
    yLabel?: WaPolarAreaChart['yLabel'];
    'legend-position'?: WaPolarAreaChart['legendPosition'];
    legendPosition?: WaPolarAreaChart['legendPosition'];
    stacked?: WaPolarAreaChart['stacked'];
    'index-axis'?: WaPolarAreaChart['indexAxis'];
    indexAxis?: WaPolarAreaChart['indexAxis'];
    grid?: WaPolarAreaChart['grid'];
    min?: WaPolarAreaChart['min'];
    max?: WaPolarAreaChart['max'];
    'without-animation'?: WaPolarAreaChart['withoutAnimation'];
    withoutAnimation?: WaPolarAreaChart['withoutAnimation'];
    'without-legend'?: WaPolarAreaChart['withoutLegend'];
    withoutLegend?: WaPolarAreaChart['withoutLegend'];
    'without-tooltip'?: WaPolarAreaChart['withoutTooltip'];
    withoutTooltip?: WaPolarAreaChart['withoutTooltip'];
    plugins?: WaPolarAreaChart['plugins'];
    dir?: WaPolarAreaChart['dir'];
    lang?: WaPolarAreaChart['lang'];
    config?: WaPolarAreaChart['config'];
    slot?: string;
}

export interface PolarAreaChartProps extends PolarAreaChartNativeProps {}

export interface RadarChartNativeProps extends Omit<
    HTMLAttributes,
    | 'type'
    | 'label'
    | 'description'
    | 'x-label'
    | 'xLabel'
    | 'y-label'
    | 'yLabel'
    | 'legend-position'
    | 'legendPosition'
    | 'stacked'
    | 'index-axis'
    | 'indexAxis'
    | 'grid'
    | 'min'
    | 'max'
    | 'without-animation'
    | 'withoutAnimation'
    | 'without-legend'
    | 'withoutLegend'
    | 'without-tooltip'
    | 'withoutTooltip'
    | 'plugins'
    | 'dir'
    | 'lang'
    | 'config'
> {
    type?: WaRadarChart['type'];
    label?: WaRadarChart['label'];
    description?: WaRadarChart['description'];
    'x-label'?: WaRadarChart['xLabel'];
    xLabel?: WaRadarChart['xLabel'];
    'y-label'?: WaRadarChart['yLabel'];
    yLabel?: WaRadarChart['yLabel'];
    'legend-position'?: WaRadarChart['legendPosition'];
    legendPosition?: WaRadarChart['legendPosition'];
    stacked?: WaRadarChart['stacked'];
    'index-axis'?: WaRadarChart['indexAxis'];
    indexAxis?: WaRadarChart['indexAxis'];
    grid?: WaRadarChart['grid'];
    min?: WaRadarChart['min'];
    max?: WaRadarChart['max'];
    'without-animation'?: WaRadarChart['withoutAnimation'];
    withoutAnimation?: WaRadarChart['withoutAnimation'];
    'without-legend'?: WaRadarChart['withoutLegend'];
    withoutLegend?: WaRadarChart['withoutLegend'];
    'without-tooltip'?: WaRadarChart['withoutTooltip'];
    withoutTooltip?: WaRadarChart['withoutTooltip'];
    plugins?: WaRadarChart['plugins'];
    dir?: WaRadarChart['dir'];
    lang?: WaRadarChart['lang'];
    config?: WaRadarChart['config'];
    slot?: string;
}

export interface RadarChartProps extends RadarChartNativeProps {}

export interface ScatterChartNativeProps extends Omit<
    HTMLAttributes,
    | 'type'
    | 'label'
    | 'description'
    | 'x-label'
    | 'xLabel'
    | 'y-label'
    | 'yLabel'
    | 'legend-position'
    | 'legendPosition'
    | 'stacked'
    | 'index-axis'
    | 'indexAxis'
    | 'grid'
    | 'min'
    | 'max'
    | 'without-animation'
    | 'withoutAnimation'
    | 'without-legend'
    | 'withoutLegend'
    | 'without-tooltip'
    | 'withoutTooltip'
    | 'plugins'
    | 'dir'
    | 'lang'
    | 'config'
> {
    type?: WaScatterChart['type'];
    label?: WaScatterChart['label'];
    description?: WaScatterChart['description'];
    'x-label'?: WaScatterChart['xLabel'];
    xLabel?: WaScatterChart['xLabel'];
    'y-label'?: WaScatterChart['yLabel'];
    yLabel?: WaScatterChart['yLabel'];
    'legend-position'?: WaScatterChart['legendPosition'];
    legendPosition?: WaScatterChart['legendPosition'];
    stacked?: WaScatterChart['stacked'];
    'index-axis'?: WaScatterChart['indexAxis'];
    indexAxis?: WaScatterChart['indexAxis'];
    grid?: WaScatterChart['grid'];
    min?: WaScatterChart['min'];
    max?: WaScatterChart['max'];
    'without-animation'?: WaScatterChart['withoutAnimation'];
    withoutAnimation?: WaScatterChart['withoutAnimation'];
    'without-legend'?: WaScatterChart['withoutLegend'];
    withoutLegend?: WaScatterChart['withoutLegend'];
    'without-tooltip'?: WaScatterChart['withoutTooltip'];
    withoutTooltip?: WaScatterChart['withoutTooltip'];
    plugins?: WaScatterChart['plugins'];
    dir?: WaScatterChart['dir'];
    lang?: WaScatterChart['lang'];
    config?: WaScatterChart['config'];
    slot?: string;
}

export interface ScatterChartProps extends ScatterChartNativeProps {}

export interface SparklineNativeProps extends Omit<
    HTMLAttributes,
    'label' | 'data' | 'appearance' | 'trend' | 'curve' | 'dir' | 'lang'
> {
    label?: WaSparkline['label'];
    data?: WaSparkline['data'];
    appearance?: WaSparkline['appearance'];
    trend?: WaSparkline['trend'];
    curve?: WaSparkline['curve'];
    dir?: WaSparkline['dir'];
    lang?: WaSparkline['lang'];
    slot?: string;
}

export interface SparklineProps extends SparklineNativeProps {}

export interface VideoNativeProps extends Omit<
    HTMLAttributes,
    | 'controls'
    | 'thumbnails'
    | 'src'
    | 'poster'
    | 'title'
    | 'playing'
    | 'muted'
    | 'volume'
    | 'duration'
    | 'currentTime'
    | 'autoplay'
    | 'loop'
    | 'autoplay-muted'
    | 'autoplayMuted'
    | 'autoplay-on-visible'
    | 'autoplayOnVisible'
    | 'preload'
    | 'icon-library'
    | 'iconLibrary'
    | 'dir'
    | 'lang'
    | 'onTimeupdate'
    | 'onPlay'
    | 'onPause'
    | 'onVolumechange'
    | 'onError'
    | 'onEnded'
    | 'onLoadedmetadata'
> {
    controls?: WaVideo['controls'];
    thumbnails?: WaVideo['thumbnails'];
    src?: WaVideo['src'];
    poster?: WaVideo['poster'];
    title?: WaVideo['title'];
    playing?: WaVideo['playing'];
    muted?: WaVideo['muted'];
    volume?: WaVideo['volume'];
    duration?: WaVideo['duration'];
    currentTime?: WaVideo['currentTime'];
    autoplay?: WaVideo['autoplay'];
    loop?: WaVideo['loop'];
    'autoplay-muted'?: WaVideo['autoplayMuted'];
    autoplayMuted?: WaVideo['autoplayMuted'];
    'autoplay-on-visible'?: WaVideo['autoplayOnVisible'];
    autoplayOnVisible?: WaVideo['autoplayOnVisible'];
    preload?: WaVideo['preload'];
    'icon-library'?: WaVideo['iconLibrary'];
    iconLibrary?: WaVideo['iconLibrary'];
    dir?: WaVideo['dir'];
    lang?: WaVideo['lang'];
    slot?: string;
    onTimeupdate?: Upstream.WaVideoProps['ontimeupdate'];
    onPlay?: Upstream.WaVideoProps['onplay'];
    onPause?: Upstream.WaVideoProps['onpause'];
    onVolumechange?: Upstream.WaVideoProps['onvolumechange'];
    onError?: Upstream.WaVideoProps['onerror'];
    onEnded?: Upstream.WaVideoProps['onended'];
    onLoadedmetadata?: Upstream.WaVideoProps['onloadedmetadata'];
}

export interface VideoProps extends VideoNativeProps {
    'onUpdate:playing'?: (value: WaVideo['playing']) => void;
    'onUpdate:currentTime'?: (value: WaVideo['currentTime']) => void;
    'onUpdate:volume'?: (value: WaVideo['volume']) => void;
    'onUpdate:muted'?: (value: WaVideo['muted']) => void;
}

export interface VideoPlaylistNativeProps extends Omit<
    HTMLAttributes,
    'controls' | 'icon-library' | 'iconLibrary' | 'dir' | 'lang' | 'onWaVideoChange'
> {
    controls?: WaVideoPlaylist['controls'];
    'icon-library'?: WaVideoPlaylist['iconLibrary'];
    iconLibrary?: WaVideoPlaylist['iconLibrary'];
    dir?: WaVideoPlaylist['dir'];
    lang?: WaVideoPlaylist['lang'];
    slot?: string;
    onWaVideoChange?: Upstream.WaVideoPlaylistProps['onwa-video-change'];
}

export interface VideoPlaylistProps extends VideoPlaylistNativeProps {
    activeIndex?: number;
    'onUpdate:activeIndex'?: (value: number) => void;
}
