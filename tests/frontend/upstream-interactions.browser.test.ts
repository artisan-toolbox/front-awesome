import { expect, onTestFinished, test, vi } from 'vite-plus/test';
import { userEvent } from 'vitest/browser';
import { createApp, h, nextTick } from 'vue';
import type { VNode } from 'vue';
import type WaColorPicker from '@awesome.me/webawesome/dist/components/color-picker/color-picker.js';
import {
    Accordion,
    AccordionItem,
    Button,
    Checkbox,
    Dialog,
    Drawer,
    Dropdown,
    DropdownItem,
    Step,
    Stepper,
    Switch,
    Tab,
    TabGroup,
    TabPanel,
    Tree,
    TreeItem,
    Select,
    Option,
    Radio,
    RadioGroup,
    Rating,
    Slider,
    Textarea,
    NumberInput,
    OtpInput,
    TagInput,
    KnownDate,
    TimeInput,
    Pagination,
    ColorPicker,
    RandomContent,
    Details,
    Carousel,
    CarouselItem,
    SplitPanel,
    Animation,
    Include,
    Markdown,
    MutationObserver,
    ResizeObserver,
    IntersectionObserver,
    CopyButton,
    Toast,
    AnimatedImage,
    ZoomableFrame,
    Scroller,
    CheckboxGroup,
    Comparison,
    Breadcrumb,
    BreadcrumbItem,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
import './app.css';
import '@artisan-toolbox/front-awesome/web-awesome.css';
import '@artisan-toolbox/front-awesome/tailwind.css';

function element<T extends keyof HTMLElementTagNameMap>(root: HTMLElement, tag: T) {
    const result = root.querySelector(tag);
    if (!result) throw new Error(`Missing interactive ${tag}`);
    return result;
}

async function settle(root: HTMLElement) {
    await vi.dynamicImportSettled();
    await nextTick();
    const elements = [...root.querySelectorAll('*')].filter((entry) =>
        entry.localName.startsWith('wa-'),
    );
    await Promise.all(elements.map((entry) => customElements.whenDefined(entry.localName)));
    for (let round = 0; round < 3; round++) {
        await Promise.all(elements.map((entry) => Reflect.get(entry, 'updateComplete')));
        await nextTick();
    }
}

async function mount(render: () => VNode[]) {
    const root = document.createElement('div');
    document.body.append(root);
    const app = createApp({ render });
    app.mount(root);
    onTestFinished(() => {
        app.unmount();
        root.remove();
    });
    await settle(root);
    return root;
}

test('toggles public checkbox and switch controls and emits their user input events', async () => {
    let changes = 0;
    const root = await mount(() => [
        h(Checkbox, { onChange: () => changes++ }, () => 'Accept terms'),
        h(Switch, { onChange: () => changes++ }, () => 'Enable alerts'),
        h(Checkbox, { disabled: true, id: 'disabled-choice' }, () => 'Unavailable'),
    ]);
    const checkbox = element(root, 'wa-checkbox');
    const toggle = element(root, 'wa-switch');
    expect(checkbox.checked).toBe(false);
    checkbox.click();
    toggle.click();
    await settle(root);
    expect(checkbox.checked).toBe(true);
    expect(toggle.checked).toBe(true);
    expect(changes).toBe(2);
    const disabled = root.querySelector('#disabled-choice');
    if (!(disabled instanceof HTMLElement)) throw new Error('Missing disabled choice');
    disabled.click();
    expect(Reflect.get(disabled, 'checked')).toBe(false);
});

test('opens a dropdown from its projected trigger and forwards item selection', async () => {
    let selected = '';
    const root = await mount(() => [
        h(
            Dropdown,
            {
                'onWa-select': (event: CustomEvent<{ item: HTMLElement }>) => {
                    selected = event.detail.item.getAttribute('value') ?? '';
                },
            },
            () => [
                h(Button, { slot: 'trigger' }, () => 'Actions'),
                h(DropdownItem, { value: 'edit' }, () => 'Edit'),
                h(DropdownItem, { value: 'delete', disabled: true }, () => 'Delete'),
            ],
        ),
    ]);
    const dropdown = element(root, 'wa-dropdown');
    element(root, 'wa-button').click();
    await settle(root);
    expect(dropdown.open).toBe(true);
    element(root, 'wa-dropdown-item').click();
    await settle(root);
    expect(selected).toBe('edit');
    expect(dropdown.open).toBe(false);
});

test('activates tab panels and clickable steps through their public slotted children', async () => {
    const root = await mount(() => [
        h(TabGroup, {}, () => [
            h(Tab, { panel: 'first' }, () => 'First'),
            h(Tab, { panel: 'second' }, () => 'Second'),
            h(TabPanel, { name: 'first' }, () => 'First content'),
            h(TabPanel, { name: 'second' }, () => 'Second content'),
        ]),
        h(Stepper, { active: 'one', clickable: true }, () => [
            h(Step, { name: 'one' }, () => 'First step'),
            h(Step, { name: 'two' }, () => 'Second step'),
        ]),
    ]);
    const secondTab = root.querySelector('wa-tab[panel="second"]');
    if (!(secondTab instanceof HTMLElement)) throw new Error('Missing second tab');
    secondTab.click();
    await settle(root);
    expect(element(root, 'wa-tab-group').active).toBe('second');
    expect(root.querySelector('wa-tab-panel[name="second"]')?.hasAttribute('active')).toBe(true);
    const secondStep = root.querySelector('wa-step[name="two"]');
    const stepButton = secondStep?.shadowRoot?.querySelector('button');
    if (!(stepButton instanceof HTMLButtonElement)) throw new Error('Missing clickable step');
    stepButton.click();
    await settle(root);
    expect(element(root, 'wa-stepper').active).toBe('two');
});

test('expands accordion sections and selects tree items without losing nested content', async () => {
    const root = await mount(() => [
        h(Accordion, {}, () => [h(AccordionItem, { label: 'About' }, () => 'More information')]),
        h(Tree, {}, () => [h(TreeItem, {}, () => ['Parent', h(TreeItem, {}, () => 'Child')])]),
    ]);
    const section = element(root, 'wa-accordion-item');
    const header = section.shadowRoot?.querySelector('button');
    if (!(header instanceof HTMLButtonElement)) throw new Error('Missing accordion header');
    header.click();
    await settle(root);
    expect(section.expanded).toBe(true);
    expect(section.textContent).toContain('More information');
    const treeItem = element(root, 'wa-tree-item');
    treeItem.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, composed: true }));
    treeItem.click();
    await settle(root);
    expect(treeItem.selected).toBe(true);
    expect(treeItem.querySelector('wa-tree-item')?.textContent).toBe('Child');
});

test('opens and closes dialogs and drawers through the documented public native methods', async () => {
    const root = await mount(() => [
        h(Dialog, { label: 'Confirm' }, () => 'Dialog content'),
        h(Drawer, { label: 'Settings' }, () => 'Drawer content'),
    ]);
    for (const overlay of [element(root, 'wa-dialog'), element(root, 'wa-drawer')]) {
        const shown = new Promise<void>((resolve) =>
            overlay.addEventListener('wa-after-show', () => resolve(), { once: true }),
        );
        overlay.open = true;
        await settle(root);
        expect(overlay.open).toBe(true);
        expect(overlay.shadowRoot?.querySelector('dialog')).not.toBeNull();
        await shown;
        const hidden = new Promise<void>((resolve) =>
            overlay.addEventListener('wa-after-hide', () => resolve(), { once: true }),
        );
        overlay.open = false;
        await hidden;
        await settle(root);
        expect(overlay.open).toBe(false);
    }
});

test('selects multiple options with a custom tag callback and preserves radio selection', async () => {
    let tags = 0;
    const root = await mount(() => [
        h(
            Select,
            {
                multiple: true,
                value: ['email'],
                getTag: (option: HTMLElement) => {
                    tags++;
                    const tag = document.createElement('span');
                    tag.textContent = `Selected ${option.textContent}`;
                    return tag;
                },
            },
            () => [
                h(Option, { value: 'email' }, () => 'Email'),
                h(Option, { value: 'chat' }, () => 'Chat'),
            ],
        ),
        h(RadioGroup, { value: 'first' }, () => [
            h(Radio, { value: 'first' }, () => 'First'),
            h(Radio, { value: 'second' }, () => 'Second'),
        ]),
    ]);
    const select = element(root, 'wa-select');
    const nativeSelect = document.createElement('wa-select');
    nativeSelect.multiple = true;
    nativeSelect.innerHTML =
        '<wa-option value="email">Email</wa-option><wa-option value="chat">Chat</wa-option>';
    root.append(nativeSelect);
    nativeSelect.value = ['email'];
    await settle(root);
    expect(nativeSelect.value).toEqual(['email']);
    await expect.poll(() => select.value).toEqual(['email']);
    select.open = true;
    await settle(root);
    const chat = root.querySelector('wa-option[value="chat"]');
    if (!(chat instanceof HTMLElement)) throw new Error('Missing chat option');
    await userEvent.click(chat);
    await settle(root);
    expect(select.value).toEqual(['email', 'chat']);
    expect(tags).toBeGreaterThan(0);
    const second = root.querySelector('wa-radio[value="second"]');
    if (!(second instanceof HTMLElement)) throw new Error('Missing second radio');
    second.click();
    await settle(root);
    expect(element(root, 'wa-radio-group').value).toBe('second');
});

test('updates ratings and sliders through keyboard controls and applies value formatter callbacks', async () => {
    let changes = 0;
    const root = await mount(() => [
        h(Rating, { value: 2, onChange: () => changes++ }),
        h(Slider, {
            value: 20,
            min: 0,
            max: 100,
            step: 10,
            valueFormatter: (value: number) => `${value} percent`,
            onChange: () => changes++,
        }),
    ]);
    const rating = element(root, 'wa-rating');
    rating.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }),
    );
    const slider = element(root, 'wa-slider');
    await expect
        .poll(() => (typeof slider.valueFormatter === 'function' ? slider.valueFormatter(30) : ''))
        .toBe('30 percent');
    const sliderControl = slider.shadowRoot?.querySelector('[role="slider"]');
    if (!(sliderControl instanceof HTMLElement)) throw new Error('Missing slider keyboard control');
    sliderControl.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }),
    );
    await settle(root);
    expect(rating.value).toBe(3);
    expect(slider.value).toBe(30);
    expect(sliderControl.getAttribute('aria-valuetext')).toContain('30 percent');
    expect(changes).toBe(2);
});

test('handles textarea and number input edits and restores their form reset values', async () => {
    const root = await mount(() => [
        h('form', {}, [
            h(Textarea, { name: 'message', value: 'Original', defaultValue: 'Original' }),
            h(NumberInput, { name: 'quantity', value: '4', defaultValue: '4' }),
        ]),
    ]);
    const textarea = element(root, 'wa-textarea');
    textarea.input.value = 'Updated message';
    textarea.input.dispatchEvent(
        new InputEvent('input', {
            bubbles: true,
            composed: true,
            inputType: 'insertText',
            data: 'Updated message',
        }),
    );
    const number = element(root, 'wa-number-input');
    number.input.value = '8';
    number.input.dispatchEvent(
        new InputEvent('input', {
            bubbles: true,
            composed: true,
            inputType: 'insertText',
            data: '8',
        }),
    );
    await settle(root);
    expect(textarea.value).toBe('Updated message');
    expect(number.value).toBe('8');
    const form = element(root, 'form');
    expect(new FormData(form).get('message')).toBe('Updated message');
    expect(new FormData(form).get('quantity')).toBe('8');
    form.reset();
    await settle(root);
    expect(textarea.value).toBe('Original');
    expect(number.value).toBe('4');
});

test('completes OTP input and adds tags through native input and keyboard events', async () => {
    let completed = '';
    const root = await mount(() => [
        h(OtpInput, {
            length: 6,
            'onWa-complete': (event: Event) => {
                completed = Reflect.get(event.target ?? {}, 'value');
            },
        }),
        h(TagInput, { value: ['alpha'], defaultValue: 'alpha' }),
    ]);
    const otp = element(root, 'wa-otp-input');
    otp.input.value = '314159';
    otp.input.dispatchEvent(
        new InputEvent('input', {
            bubbles: true,
            composed: true,
            inputType: 'insertText',
            data: '314159',
        }),
    );
    const tags = element(root, 'wa-tag-input');
    tags.input.value = 'beta';
    tags.input.dispatchEvent(
        new InputEvent('input', {
            bubbles: true,
            composed: true,
            inputType: 'insertText',
            data: 'beta',
        }),
    );
    tags.input.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }),
    );
    await settle(root);
    expect(otp.value).toBe('314159');
    expect(completed).toBe('314159');
    expect(tags.value).toEqual(['alpha', 'beta']);
});

test('preserves Date object bindings and editable date/time public values', async () => {
    const date = new Date(2026, 4, 11, 14, 30);
    const root = await mount(() => [h(KnownDate, { value: date }), h(TimeInput, { value: date })]);
    const knownDate = element(root, 'wa-known-date');
    const time = element(root, 'wa-time-input');
    const nativeTime = document.createElement('wa-time-input');
    root.append(nativeTime);
    nativeTime.value = date;
    await settle(root);
    expect(nativeTime.value).toBe('14:30');
    await expect.poll(() => knownDate.value).toBe('2026-05-11');
    await expect.poll(() => time.value).toBe('14:30');
    expect(knownDate.valueAsDate?.getDate()).toBe(11);
    expect(time.valueAsDate?.getHours()).toBe(14);
    knownDate.value = '2026-12-24';
    time.value = '09:15';
    await settle(root);
    expect(knownDate.valueAsDate?.getMonth()).toBe(11);
    expect(time.valueAsDate?.getMinutes()).toBe(15);
});

test('navigates pagination and honors a cancelable page change listener', async () => {
    let page = 0;
    const root = await mount(() => [
        h(Pagination, {
            total: 30,
            pageSize: 10,
            page: 1,
            'onWa-page-change': (event: CustomEvent<{ page: number }>) => {
                page = event.detail.page;
            },
        }),
    ]);
    const pagination = element(root, 'wa-pagination');
    const next = pagination.shadowRoot?.querySelector('[part~="next-button"]');
    if (!(next instanceof HTMLElement)) throw new Error('Missing next page action');
    next.click();
    await settle(root);
    expect(page).toBe(2);
    expect(pagination.page).toBe(2);
    pagination.addEventListener('wa-before-page-change', (event) => event.preventDefault(), {
        once: true,
    });
    next.click();
    await settle(root);
    expect(pagination.page).toBe(2);
});

test('opens a color picker only after activation and keeps random selection count valid', async () => {
    const root = await mount(() => [
        h(ColorPicker, { value: '#ff0000' }),
        h(RandomContent, { items: 2 }, () => [
            h('span', {}, 'One'),
            h('span', {}, 'Two'),
            h('span', {}, 'Three'),
        ]),
    ]);
    const color = root.querySelector<WaColorPicker>('wa-color-picker');
    if (!color) throw new Error('Missing color picker');
    expect(color.open).toBe(false);
    const trigger = color.shadowRoot?.querySelector('[part~="trigger"]');
    if (!(trigger instanceof HTMLElement)) throw new Error('Missing color trigger');
    trigger.click();
    await settle(root);
    expect(color.open).toBe(true);
    const random = element(root, 'wa-random-content');
    for (let sample = 0; sample < 5; sample++) {
        const selected = random.randomize();
        expect(selected).toHaveLength(2);
        expect(new Set(selected).size).toBe(2);
        expect([...random.children].filter((child) => !child.hasAttribute('hidden'))).toHaveLength(
            2,
        );
    }
});

test('opens details and resizes split panels with keyboard navigation', async () => {
    const root = await mount(() => [
        h(Details, { summary: 'More information' }, () => 'Details content'),
        h(
            SplitPanel,
            { position: 50, style: 'width:400px;height:100px' },
            { start: () => h('p', {}, 'Start'), end: () => h('p', {}, 'End') },
        ),
    ]);
    const details = element(root, 'wa-details');
    await userEvent.click(details.header);
    await expect.poll(() => details.open).toBe(true);
    const panel = element(root, 'wa-split-panel');
    const divider = panel.shadowRoot?.querySelector('[role="separator"]');
    if (!(divider instanceof HTMLElement)) throw new Error('Missing panel divider');
    divider.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }),
    );
    await expect.poll(() => panel.position).toBeGreaterThan(50);
});

test('navigates carousel slides and starts animation only after an action', async () => {
    const root = await mount(() => [
        h(Carousel, { navigation: true, style: 'width:300px;height:100px' }, () => [
            h(CarouselItem, {}, () => 'First slide'),
            h(CarouselItem, {}, () => 'Second slide'),
        ]),
        h(
            Animation,
            { keyframes: [{ opacity: 0 }, { opacity: 1 }], duration: 10_000, play: false },
            () => h('div', { id: 'animated-target' }, 'Animated content'),
        ),
    ]);
    const carousel = element(root, 'wa-carousel');
    const next = carousel.shadowRoot?.querySelector('[part~="navigation-button-next"]');
    if (!(next instanceof HTMLElement)) throw new Error('Missing carousel next control');
    await userEvent.click(next);
    await expect.poll(() => carousel.activeSlide).toBe(1);
    const animation = element(root, 'wa-animation');
    const target = root.querySelector('#animated-target');
    if (!(target instanceof HTMLElement)) throw new Error('Missing animated target');
    await expect.poll(() => target.getAnimations().length).toBe(1);
    expect(animation.play).toBe(false);
    animation.play = true;
    await expect.poll(() => target.getAnimations()[0]?.playState).toBe('running');
    animation.play = false;
    await expect.poll(() => target.getAnimations()[0]?.playState).toBe('paused');
});

test('loads local include content and renders script-backed Markdown with public wrappers', async () => {
    const root = await mount(() => [
        h('template', { id: 'upstream-include-content', innerHTML: '<p>Included content</p>' }),
        h(Include, { src: '#upstream-include-content' }),
        h(Markdown, {}, () =>
            h('script', { type: 'text/markdown', textContent: '**Ready** to render.' }),
        ),
    ]);
    await expect.poll(() => element(root, 'wa-include').textContent).toContain('Included content');
    await expect
        .poll(() => element(root, 'wa-markdown').querySelector('strong')?.textContent)
        .toBe('Ready');
});

test('forwards real mutation, resize, and intersection observer events from projected elements', async () => {
    let mutations = 0;
    let resizes = 0;
    let intersections = 0;
    const root = await mount(() => [
        h(
            MutationObserver,
            {
                attr: 'data-state',
                'onWa-mutation': (event: CustomEvent<{ mutationList: MutationRecord[] }>) => {
                    mutations += event.detail.mutationList.length;
                },
            },
            () => h('div', { id: 'mutation-target' }, 'Observe mutations'),
        ),
        h(ResizeObserver, { 'onWa-resize': () => resizes++ }, () =>
            h('div', { id: 'resize-target', style: 'width:100px;height:20px' }, 'Observe resizing'),
        ),
        h(IntersectionObserver, { 'onWa-intersect': () => intersections++ }, () =>
            h('div', { style: 'width:100px;height:20px' }, 'Observe visibility'),
        ),
    ]);
    await expect.poll(() => resizes).toBeGreaterThan(0);
    await expect.poll(() => intersections).toBeGreaterThan(0);
    const mutated = root.querySelector('#mutation-target');
    const resized = root.querySelector('#resize-target');
    if (!(mutated instanceof HTMLElement) || !(resized instanceof HTMLElement))
        throw new Error('Missing observed targets');
    mutated.setAttribute('data-state', 'updated');
    const previous = resizes;
    resized.style.height = '60px';
    await expect.poll(() => mutations).toBeGreaterThan(0);
    await expect.poll(() => resizes).toBeGreaterThan(previous);
});

test('reports copy source errors and creates dismissible toasts after user activation', async () => {
    let errors = 0;
    const root = await mount(() => [
        h(CopyButton, {
            from: 'missing-copy-source',
            'onWa-error': (event: Event) => {
                if (event.composedPath()[0] === event.currentTarget) errors++;
            },
        }),
        h(
            Button,
            {
                id: 'notify',
                onClick: async () => {
                    await element(root, 'wa-toast').create('Saved successfully', { duration: 0 });
                },
            },
            () => 'Notify',
        ),
        h(Toast),
    ]);
    const copy = element(root, 'wa-copy-button');
    const copyControl = copy.shadowRoot?.querySelector('button');
    if (!(copyControl instanceof HTMLElement)) throw new Error('Missing copy control');
    let nativeErrors = 0;
    const nativeCopy = document.createElement('wa-copy-button');
    nativeCopy.from = 'missing-copy-source';
    nativeCopy.addEventListener('wa-error', (event) => {
        if (event.composedPath()[0] === nativeCopy) nativeErrors++;
    });
    root.append(nativeCopy);
    await settle(root);
    const nativeCopyControl = nativeCopy.shadowRoot?.querySelector('button');
    if (!(nativeCopyControl instanceof HTMLElement)) throw new Error('Missing native copy control');
    await userEvent.click(nativeCopyControl);
    await userEvent.click(copyControl);
    await expect.poll(() => nativeErrors).toBe(2);
    await expect.poll(() => errors).toBe(nativeErrors);
    const toast = element(root, 'wa-toast');
    expect(toast.querySelector('wa-toast-item')).toBeNull();
    const notify = root.querySelector('#notify');
    if (!(notify instanceof HTMLElement)) throw new Error('Missing notification action');
    await userEvent.click(notify);
    await expect
        .poll(() => toast.querySelector('wa-toast-item')?.textContent)
        .toContain('Saved successfully');
    const item = element(root, 'wa-toast-item');
    await item.hide();
    expect(toast.querySelector('wa-toast-item')).toBeNull();
});

test('copies text successfully through a trusted browser activation', async () => {
    let copied = '';
    const root = await mount(() => [
        h(CopyButton, {
            value: 'Copied through the public wrapper',
            tooltip: 'none',
            'onWa-copy': (event: CustomEvent<{ value: string }>) => {
                copied = event.detail.value;
            },
        }),
    ]);
    const copy = element(root, 'wa-copy-button');
    const button = copy.shadowRoot?.querySelector('button');
    if (!(button instanceof HTMLElement)) throw new Error('Missing copy button');
    await userEvent.click(button);
    await expect.poll(() => copied).toBe('Copied through the public wrapper');
    expect(copy.status).toBe('success');
    expect(await navigator.clipboard.readText()).toBe('Copied through the public wrapper');
});

test('toggles local animated media and zooms an inline frame through their visible controls', async () => {
    const root = await mount(() => [
        h(AnimatedImage, {
            src: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
            alt: 'Local test image',
            style: 'width:100px;height:100px',
            play: false,
        }),
        h(ZoomableFrame, {
            srcdoc: '<p>Inline frame content</p>',
            zoom: 1,
            zoomLevels: '0.5 1 1.5',
            style: 'width:300px;height:150px',
        }),
    ]);
    const image = element(root, 'wa-animated-image');
    await expect.poll(() => image.isLoaded).toBe(true);
    const imageControl = image.shadowRoot?.querySelector('[role="button"]');
    if (!(imageControl instanceof HTMLElement)) throw new Error('Missing image playback control');
    await userEvent.click(imageControl);
    expect(image.play).toBe(true);
    await userEvent.click(imageControl);
    expect(image.play).toBe(false);
    const frame = element(root, 'wa-zoomable-frame');
    const zoomIn = frame.shadowRoot?.querySelector('[part="zoom-in-button"]');
    if (!(zoomIn instanceof HTMLElement)) throw new Error('Missing zoom-in control');
    await userEvent.click(zoomIn);
    await expect.poll(() => frame.zoom).toBe(1.5);
    expect(frame.iframe.srcdoc).toContain('Inline frame content');
});

test('scrolls overflowing content with End and Home keyboard actions', async () => {
    const root = await mount(() => [
        h(Scroller, { style: 'width:200px' }, () =>
            h('div', { style: 'width:1000px;height:30px' }, 'Overflowing content'),
        ),
    ]);
    const scroller = element(root, 'wa-scroller');
    await expect.poll(() => scroller.canScroll).toBe(true);
    scroller.content.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'End', bubbles: true, composed: true }),
    );
    await expect.poll(() => scroller.content.scrollLeft).toBeGreaterThan(0);
    scroller.content.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Home', bubbles: true, composed: true }),
    );
    await expect.poll(() => scroller.content.scrollLeft).toBe(0);
});

test('keeps grouped checkbox and switch choices independently submittable', async () => {
    const root = await mount(() => [
        h('form', {}, [
            h(CheckboxGroup, { label: 'Preferences', size: 's' }, () => [
                h(Checkbox, { name: 'channel', value: 'email' }, () => 'Email'),
                h(Switch, { name: 'alerts', value: 'enabled' }, () => 'Alerts'),
            ]),
        ]),
    ]);
    const checkbox = element(root, 'wa-checkbox');
    const toggle = element(root, 'wa-switch');
    await expect.poll(() => checkbox.size).toBe('s');
    await expect.poll(() => toggle.size).toBe('s');
    await userEvent.click(checkbox);
    await userEvent.click(toggle);
    const data = new FormData(element(root, 'form'));
    expect(data.get('channel')).toBe('email');
    expect(data.get('alerts')).toBe('enabled');
});

test('adjusts comparison with its keyboard handle and preserves breadcrumb navigation', async () => {
    const previousUrl = location.href;
    const previousState: unknown = history.state;
    onTestFinished(() => history.replaceState(previousState, '', previousUrl));
    const root = await mount(() => [
        h(
            Comparison,
            { position: 50, style: 'width:200px;height:100px' },
            { before: () => h('div', {}, 'Before'), after: () => h('div', {}, 'After') },
        ),
        h(Breadcrumb, {}, () => [
            h(BreadcrumbItem, { href: '#upstream-breadcrumb-target' }, () => 'Parent'),
            h(BreadcrumbItem, {}, () => 'Current'),
        ]),
        h('div', { id: 'upstream-breadcrumb-target' }, 'Destination'),
    ]);
    const comparison = element(root, 'wa-comparison');
    comparison.handle.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }),
    );
    await expect.poll(() => comparison.position).toBeGreaterThan(50);
    const link = element(root, 'wa-breadcrumb-item').shadowRoot?.querySelector('a');
    if (!(link instanceof HTMLAnchorElement)) throw new Error('Missing breadcrumb link');
    await userEvent.click(link);
    await expect.poll(() => location.hash).toBe('#upstream-breadcrumb-target');
});
