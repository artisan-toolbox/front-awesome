const value = (property, write, read = write, events = ['input']) => ({
    name: 'modelValue',
    property,
    write,
    read,
    events,
    form: true,
});
const state = (name, domain, events) => ({
    name,
    property: name,
    write: domain,
    read: domain,
    events,
    form: false,
});
const open = () => state('open', 'boolean', ['wa-after-show', 'wa-after-hide']);
const reflected = (name, attribute = name) => ({
    ...state(name, 'boolean', []),
    observeAttribute: attribute,
});
export const webAwesomeModels = {
    AccordionItem: [reflected('expanded')],
    AnimatedImage: [reflected('play')],
    Carousel: [
        {
            ...state('currentSlide', 'number', ['wa-slide-change']),
            writer: { kind: 'method', method: 'goToSlide' },
            reader: { kind: 'detail', key: 'index' },
        },
    ],
    DropdownItem: [
        {
            ...state('checked', 'boolean', []),
            ownerEvent: { tag: 'wa-dropdown', name: 'wa-select', itemKey: 'item' },
        },
    ],
    Page: [reflected('navOpen', 'nav-open')],
    Animation: [state('play', 'boolean', ['wa-start', 'wa-finish', 'wa-cancel'])],
    Checkbox: [
        value('checked', 'boolean', 'boolean', ['change']),
        state('indeterminate', 'boolean', ['change']),
    ],
    ColorPicker: [value('value', 'nullableString'), open()],
    Comparison: [state('position', 'number', ['change'])],
    Details: [open()],
    Dialog: [open()],
    Drawer: [open()],
    Dropdown: [open()],
    KnownDate: [value('value', 'date', 'string')],
    NumberInput: [value('value', 'nullableString')],
    OtpInput: [value('value', 'string')],
    Pagination: [state('page', 'number', ['wa-page-change'])],
    Popover: [open()],
    RadioGroup: [value('value', 'radio')],
    Rating: [value('value', 'number', 'number', ['change'])],
    Select: [{ ...value('value', 'selection'), writer: { kind: 'nullable-selection' } }, open()],
    Slider: [
        value('value', 'nullableNumber', 'number'),
        state('minValue', 'number', ['input']),
        state('maxValue', 'number', ['input']),
    ],
    SplitPanel: [
        state('position', 'number', ['wa-reposition']),
        state('positionInPixels', 'number', ['wa-reposition']),
    ],
    Stepper: [state('active', 'string', ['wa-step-change'])],
    Switch: [value('checked', 'boolean', 'boolean', ['change'])],
    TabGroup: [state('active', 'string', ['wa-tab-show'])],
    TagInput: [
        value('value', 'tags', 'strings', ['change']),
        state('inputValue', 'string', ['input']),
    ],
    Textarea: [value('value', 'nullableString')],
    TimeInput: [value('value', 'date', 'string'), open()],
    Tooltip: [open()],
    TreeItem: [
        state('expanded', 'boolean', ['wa-after-expand', 'wa-after-collapse']),
        reflected('selected'),
    ],
    Combobox: [{ ...value('value', 'selection'), writer: { kind: 'nullable-selection' } }, open()],
    DataGrid: [
        state('page', 'number', ['wa-page-change']),
        state('pageSize', 'number', ['wa-page-change']),
        state('sort', 'sort', ['wa-sort-change']),
        state('filters', 'filters', ['wa-filter-change']),
        state('searchTerm', 'string', ['wa-filter-change']),
        state('selectedKeys', 'keys', ['wa-row-select']),
        state('selectedRows', 'records', ['wa-row-select']),
        state('expandedKeys', 'keys', ['wa-row-expand', 'wa-row-collapse']),
        state('columnOrder', 'strings', ['wa-column-move']),
    ],
    DateInput: [value('value', 'dateInput', 'string'), open()],
    DatePicker: [
        value('value', 'datePicker', 'string'),
        state('view', 'dateView', ['wa-view-change']),
        {
            ...state('focusedDate', 'string', ['wa-focus-day']),
            reader: { kind: 'local-date-detail', key: 'date' },
        },
    ],
    FileInput: [value('files', 'files', 'files', ['change'])],
    VideoPlaylist: [
        {
            ...state('activeIndex', 'number', ['wa-video-change']),
            type: 'number',
            writer: { kind: 'method', method: 'goTo' },
            reader: { kind: 'detail', key: 'currentIndex' },
        },
    ],
    Video: [
        {
            ...state('playing', 'boolean', ['play', 'pause', 'ended', 'error']),
            writer: { kind: 'boolean-method', on: 'play', off: 'pause' },
        },
        state('currentTime', 'number', ['timeupdate']),
        state('volume', 'number', ['volumechange']),
        state('muted', 'boolean', ['volumechange']),
    ],
};
