import type WaAccordion from '@awesome.me/webawesome/dist/components/accordion/accordion.js';
import type WaAccordionItem from '@awesome.me/webawesome/dist/components/accordion-item/accordion-item.js';
import type WaAnimatedImage from '@awesome.me/webawesome/dist/components/animated-image/animated-image.js';
import type WaAnimation from '@awesome.me/webawesome/dist/components/animation/animation.js';
import type WaAvatar from '@awesome.me/webawesome/dist/components/avatar/avatar.js';
import type WaBadge from '@awesome.me/webawesome/dist/components/badge/badge.js';
import type WaBreadcrumb from '@awesome.me/webawesome/dist/components/breadcrumb/breadcrumb.js';
import type WaBreadcrumbItem from '@awesome.me/webawesome/dist/components/breadcrumb-item/breadcrumb-item.js';
import type WaCallout from '@awesome.me/webawesome/dist/components/callout/callout.js';
import type WaCard from '@awesome.me/webawesome/dist/components/card/card.js';
import type WaCarousel from '@awesome.me/webawesome/dist/components/carousel/carousel.js';
import type WaCarouselItem from '@awesome.me/webawesome/dist/components/carousel-item/carousel-item.js';
import type WaCheckbox from '@awesome.me/webawesome/dist/components/checkbox/checkbox.js';
import type WaCheckboxGroup from '@awesome.me/webawesome/dist/components/checkbox-group/checkbox-group.js';
import type WaColorPicker from '@awesome.me/webawesome/dist/components/color-picker/color-picker.js';
import type WaComparison from '@awesome.me/webawesome/dist/components/comparison/comparison.js';
import type WaCopyButton from '@awesome.me/webawesome/dist/components/copy-button/copy-button.js';
import type WaDetails from '@awesome.me/webawesome/dist/components/details/details.js';
import type WaDialog from '@awesome.me/webawesome/dist/components/dialog/dialog.js';
import type WaDivider from '@awesome.me/webawesome/dist/components/divider/divider.js';
import type WaDrawer from '@awesome.me/webawesome/dist/components/drawer/drawer.js';
import type WaDropdown from '@awesome.me/webawesome/dist/components/dropdown/dropdown.js';
import type WaDropdownItem from '@awesome.me/webawesome/dist/components/dropdown-item/dropdown-item.js';
import type WaFormatBytes from '@awesome.me/webawesome/dist/components/format-bytes/format-bytes.js';
import type WaFormatDate from '@awesome.me/webawesome/dist/components/format-date/format-date.js';
import type WaFormatNumber from '@awesome.me/webawesome/dist/components/format-number/format-number.js';
import type WaInclude from '@awesome.me/webawesome/dist/components/include/include.js';
import type WaIntersectionObserver from '@awesome.me/webawesome/dist/components/intersection-observer/intersection-observer.js';
import type WaKnownDate from '@awesome.me/webawesome/dist/components/known-date/known-date.js';
import type WaMarkdown from '@awesome.me/webawesome/dist/components/markdown/markdown.js';
import type WaMutationObserver from '@awesome.me/webawesome/dist/components/mutation-observer/mutation-observer.js';
import type WaNumberInput from '@awesome.me/webawesome/dist/components/number-input/number-input.js';
import type WaOption from '@awesome.me/webawesome/dist/components/option/option.js';
import type WaOtpInput from '@awesome.me/webawesome/dist/components/otp-input/otp-input.js';
import type WaPage from '@awesome.me/webawesome/dist/components/page/page.js';
import type WaPagination from '@awesome.me/webawesome/dist/components/pagination/pagination.js';
import type WaPopover from '@awesome.me/webawesome/dist/components/popover/popover.js';
import type WaPopup from '@awesome.me/webawesome/dist/components/popup/popup.js';
import type WaProgressBar from '@awesome.me/webawesome/dist/components/progress-bar/progress-bar.js';
import type WaProgressRing from '@awesome.me/webawesome/dist/components/progress-ring/progress-ring.js';
import type WaQrCode from '@awesome.me/webawesome/dist/components/qr-code/qr-code.js';
import type WaRadio from '@awesome.me/webawesome/dist/components/radio/radio.js';
import type WaRadioGroup from '@awesome.me/webawesome/dist/components/radio-group/radio-group.js';
import type WaRandomContent from '@awesome.me/webawesome/dist/components/random-content/random-content.js';
import type WaRating from '@awesome.me/webawesome/dist/components/rating/rating.js';
import type WaRelativeTime from '@awesome.me/webawesome/dist/components/relative-time/relative-time.js';
import type WaResizeObserver from '@awesome.me/webawesome/dist/components/resize-observer/resize-observer.js';
import type WaScroller from '@awesome.me/webawesome/dist/components/scroller/scroller.js';
import type WaSelect from '@awesome.me/webawesome/dist/components/select/select.js';
import type WaSkeleton from '@awesome.me/webawesome/dist/components/skeleton/skeleton.js';
import type WaSlider from '@awesome.me/webawesome/dist/components/slider/slider.js';
import type WaSpinner from '@awesome.me/webawesome/dist/components/spinner/spinner.js';
import type WaSplitPanel from '@awesome.me/webawesome/dist/components/split-panel/split-panel.js';
import type WaStep from '@awesome.me/webawesome/dist/components/step/step.js';
import type WaStepper from '@awesome.me/webawesome/dist/components/stepper/stepper.js';
import type WaSwitch from '@awesome.me/webawesome/dist/components/switch/switch.js';
import type WaTab from '@awesome.me/webawesome/dist/components/tab/tab.js';
import type WaTabGroup from '@awesome.me/webawesome/dist/components/tab-group/tab-group.js';
import type WaTabPanel from '@awesome.me/webawesome/dist/components/tab-panel/tab-panel.js';
import type WaTagInput from '@awesome.me/webawesome/dist/components/tag-input/tag-input.js';
import type WaTextarea from '@awesome.me/webawesome/dist/components/textarea/textarea.js';
import type WaTimeInput from '@awesome.me/webawesome/dist/components/time-input/time-input.js';
import type WaToast from '@awesome.me/webawesome/dist/components/toast/toast.js';
import type WaToastItem from '@awesome.me/webawesome/dist/components/toast-item/toast-item.js';
import type WaTooltip from '@awesome.me/webawesome/dist/components/tooltip/tooltip.js';
import type WaTree from '@awesome.me/webawesome/dist/components/tree/tree.js';
import type WaTreeItem from '@awesome.me/webawesome/dist/components/tree-item/tree-item.js';
import type WaZoomableFrame from '@awesome.me/webawesome/dist/components/zoomable-frame/zoomable-frame.js';
import type { ControlBindingProps } from './useFormBridge';
import type * as Upstream from '@awesome.me/webawesome/dist/custom-elements-jsx.d.ts';
import type { HTMLAttributes } from 'vue';

export interface AccordionNativeProps extends Omit<
    HTMLAttributes,
    | 'mode'
    | 'icon-placement'
    | 'iconPlacement'
    | 'heading-level'
    | 'headingLevel'
    | 'appearance'
    | 'dir'
    | 'lang'
    | 'onWaExpand'
    | 'onWaAfterExpand'
    | 'onWaCollapse'
    | 'onWaAfterCollapse'
> {
    mode?: WaAccordion['mode'];
    'icon-placement'?: WaAccordion['iconPlacement'];
    iconPlacement?: WaAccordion['iconPlacement'];
    'heading-level'?: WaAccordion['headingLevel'];
    headingLevel?: WaAccordion['headingLevel'];
    appearance?: WaAccordion['appearance'];
    dir?: WaAccordion['dir'];
    lang?: WaAccordion['lang'];
    slot?: string;
    onWaExpand?: Upstream.WaAccordionProps['onwa-expand'];
    onWaAfterExpand?: Upstream.WaAccordionProps['onwa-after-expand'];
    onWaCollapse?: Upstream.WaAccordionProps['onwa-collapse'];
    onWaAfterCollapse?: Upstream.WaAccordionProps['onwa-after-collapse'];
}

export interface AccordionProps extends AccordionNativeProps {}

export interface AccordionItemNativeProps extends Omit<
    HTMLAttributes,
    'label' | 'expanded' | 'disabled' | 'dir' | 'lang'
> {
    label?: WaAccordionItem['label'];
    expanded?: WaAccordionItem['expanded'];
    disabled?: WaAccordionItem['disabled'];
    dir?: WaAccordionItem['dir'];
    lang?: WaAccordionItem['lang'];
    slot?: string;
}

export interface AccordionItemProps extends AccordionItemNativeProps {
    'onUpdate:expanded'?: (value: WaAccordionItem['expanded']) => void;
}

export interface AnimatedImageNativeProps extends Omit<
    HTMLAttributes,
    'src' | 'alt' | 'play' | 'dir' | 'lang' | 'onWaLoad' | 'onWaError'
> {
    src?: WaAnimatedImage['src'];
    alt?: WaAnimatedImage['alt'];
    play?: WaAnimatedImage['play'];
    dir?: WaAnimatedImage['dir'];
    lang?: WaAnimatedImage['lang'];
    slot?: string;
    onWaLoad?: Upstream.WaAnimatedImageProps['onwa-load'];
    onWaError?: Upstream.WaAnimatedImageProps['onwa-error'];
}

export interface AnimatedImageProps extends AnimatedImageNativeProps {
    'onUpdate:play'?: (value: WaAnimatedImage['play']) => void;
}

export interface AnimationNativeProps extends Omit<
    HTMLAttributes,
    | 'name'
    | 'play'
    | 'delay'
    | 'direction'
    | 'duration'
    | 'easing'
    | 'end-delay'
    | 'endDelay'
    | 'fill'
    | 'iterations'
    | 'iteration-start'
    | 'iterationStart'
    | 'playback-rate'
    | 'playbackRate'
    | 'dir'
    | 'lang'
    | 'keyframes'
    | 'currentTime'
    | 'onWaCancel'
    | 'onWaFinish'
    | 'onWaStart'
> {
    name?: WaAnimation['name'];
    play?: WaAnimation['play'];
    delay?: WaAnimation['delay'];
    direction?: WaAnimation['direction'];
    duration?: WaAnimation['duration'];
    easing?: WaAnimation['easing'];
    'end-delay'?: WaAnimation['endDelay'];
    endDelay?: WaAnimation['endDelay'];
    fill?: WaAnimation['fill'];
    iterations?: WaAnimation['iterations'];
    'iteration-start'?: WaAnimation['iterationStart'];
    iterationStart?: WaAnimation['iterationStart'];
    'playback-rate'?: WaAnimation['playbackRate'];
    playbackRate?: WaAnimation['playbackRate'];
    dir?: WaAnimation['dir'];
    lang?: WaAnimation['lang'];
    keyframes?: WaAnimation['keyframes'];
    currentTime?: number;
    slot?: string;
    onWaCancel?: Upstream.WaAnimationProps['onwa-cancel'];
    onWaFinish?: Upstream.WaAnimationProps['onwa-finish'];
    onWaStart?: Upstream.WaAnimationProps['onwa-start'];
}

export interface AnimationProps extends AnimationNativeProps {
    'onUpdate:play'?: (value: WaAnimation['play']) => void;
}

export interface AvatarNativeProps extends Omit<
    HTMLAttributes,
    'image' | 'label' | 'initials' | 'loading' | 'shape' | 'dir' | 'lang' | 'onWaError'
> {
    image?: WaAvatar['image'];
    label?: WaAvatar['label'];
    initials?: WaAvatar['initials'];
    loading?: WaAvatar['loading'];
    shape?: WaAvatar['shape'];
    dir?: WaAvatar['dir'];
    lang?: WaAvatar['lang'];
    slot?: string;
    onWaError?: Upstream.WaAvatarProps['onwa-error'];
}

export interface AvatarProps extends AvatarNativeProps {}

export interface BadgeNativeProps extends Omit<
    HTMLAttributes,
    'variant' | 'appearance' | 'pill' | 'attention' | 'dir' | 'lang'
> {
    variant?: WaBadge['variant'];
    appearance?: WaBadge['appearance'];
    pill?: WaBadge['pill'];
    attention?: WaBadge['attention'];
    dir?: WaBadge['dir'];
    lang?: WaBadge['lang'];
    slot?: string;
}

export interface BadgeProps extends BadgeNativeProps {}

export interface BreadcrumbNativeProps extends Omit<HTMLAttributes, 'label' | 'dir' | 'lang'> {
    label?: WaBreadcrumb['label'];
    dir?: WaBreadcrumb['dir'];
    lang?: WaBreadcrumb['lang'];
    slot?: string;
}

export interface BreadcrumbProps extends BreadcrumbNativeProps {}

export interface BreadcrumbItemNativeProps extends Omit<
    HTMLAttributes,
    'href' | 'target' | 'rel' | 'dir' | 'lang'
> {
    href?: WaBreadcrumbItem['href'];
    target?: WaBreadcrumbItem['target'];
    rel?: WaBreadcrumbItem['rel'];
    dir?: WaBreadcrumbItem['dir'];
    lang?: WaBreadcrumbItem['lang'];
    slot?: string;
}

export interface BreadcrumbItemProps extends BreadcrumbItemNativeProps {}

export interface CalloutNativeProps extends Omit<
    HTMLAttributes,
    'variant' | 'appearance' | 'size' | 'dir' | 'lang'
> {
    variant?: WaCallout['variant'];
    appearance?: WaCallout['appearance'];
    size?: WaCallout['size'];
    dir?: WaCallout['dir'];
    lang?: WaCallout['lang'];
    slot?: string;
}

export interface CalloutProps extends CalloutNativeProps {}

export interface CardNativeProps extends Omit<
    HTMLAttributes,
    | 'appearance'
    | 'with-header'
    | 'withHeader'
    | 'with-media'
    | 'withMedia'
    | 'with-footer'
    | 'withFooter'
    | 'with-header-actions'
    | 'withHeaderActions'
    | 'with-footer-actions'
    | 'withFooterActions'
    | 'orientation'
    | 'dir'
    | 'lang'
> {
    appearance?: WaCard['appearance'];
    'with-header'?: WaCard['withHeader'];
    withHeader?: WaCard['withHeader'];
    'with-media'?: WaCard['withMedia'];
    withMedia?: WaCard['withMedia'];
    'with-footer'?: WaCard['withFooter'];
    withFooter?: WaCard['withFooter'];
    'with-header-actions'?: WaCard['withHeaderActions'];
    withHeaderActions?: WaCard['withHeaderActions'];
    'with-footer-actions'?: WaCard['withFooterActions'];
    withFooterActions?: WaCard['withFooterActions'];
    orientation?: WaCard['orientation'];
    dir?: WaCard['dir'];
    lang?: WaCard['lang'];
    slot?: string;
}

export interface CardProps extends CardNativeProps {}

export interface CarouselNativeProps extends Omit<
    HTMLAttributes,
    | 'loop'
    | 'slides'
    | 'currentSlide'
    | 'navigation'
    | 'pagination'
    | 'autoplay'
    | 'autoplay-interval'
    | 'autoplayInterval'
    | 'slides-per-page'
    | 'slidesPerPage'
    | 'slides-per-move'
    | 'slidesPerMove'
    | 'orientation'
    | 'mouse-dragging'
    | 'mouseDragging'
    | 'dir'
    | 'lang'
    | 'onWaSlideChange'
> {
    loop?: WaCarousel['loop'];
    slides?: WaCarousel['slides'];
    currentSlide?: WaCarousel['currentSlide'];
    navigation?: WaCarousel['navigation'];
    pagination?: WaCarousel['pagination'];
    autoplay?: WaCarousel['autoplay'];
    'autoplay-interval'?: WaCarousel['autoplayInterval'];
    autoplayInterval?: WaCarousel['autoplayInterval'];
    'slides-per-page'?: WaCarousel['slidesPerPage'];
    slidesPerPage?: WaCarousel['slidesPerPage'];
    'slides-per-move'?: WaCarousel['slidesPerMove'];
    slidesPerMove?: WaCarousel['slidesPerMove'];
    orientation?: WaCarousel['orientation'];
    'mouse-dragging'?: WaCarousel['mouseDragging'];
    mouseDragging?: WaCarousel['mouseDragging'];
    dir?: WaCarousel['dir'];
    lang?: WaCarousel['lang'];
    slot?: string;
    onWaSlideChange?: Upstream.WaCarouselProps['onwa-slide-change'];
}

export interface CarouselProps extends CarouselNativeProps {
    'onUpdate:currentSlide'?: (value: WaCarousel['currentSlide']) => void;
}

export interface CarouselItemNativeProps extends Omit<HTMLAttributes, 'dir' | 'lang'> {
    dir?: WaCarouselItem['dir'];
    lang?: WaCarouselItem['lang'];
    slot?: string;
}

export interface CarouselItemProps extends CarouselItemNativeProps {}

export interface CheckboxNativeProps extends Omit<
    HTMLAttributes,
    | 'title'
    | 'value'
    | 'size'
    | 'disabled'
    | 'indeterminate'
    | 'checked'
    | 'defaultChecked'
    | 'required'
    | 'hint'
    | 'name'
    | 'custom-error'
    | 'customError'
    | 'dir'
    | 'lang'
    | 'onChange'
    | 'onBlur'
    | 'onFocus'
    | 'onInput'
    | 'onWaInvalid'
> {
    title?: WaCheckbox['title'];
    value?: string | null;
    size?: WaCheckbox['size'];
    disabled?: WaCheckbox['disabled'];
    indeterminate?: WaCheckbox['indeterminate'];
    checked?: boolean;
    defaultChecked?: WaCheckbox['defaultChecked'];
    required?: WaCheckbox['required'];
    hint?: WaCheckbox['hint'];
    name?: WaCheckbox['name'];
    'custom-error'?: WaCheckbox['customError'];
    customError?: WaCheckbox['customError'];
    dir?: WaCheckbox['dir'];
    lang?: WaCheckbox['lang'];
    form?: string;
    slot?: string;
    onChange?: Upstream.WaCheckboxProps['onchange'];
    onBlur?: Upstream.WaCheckboxProps['onblur'];
    onFocus?: Upstream.WaCheckboxProps['onfocus'];
    onInput?: Upstream.WaCheckboxProps['oninput'];
    onWaInvalid?: Upstream.WaCheckboxProps['onwa-invalid'];
}

export type CheckboxProps<T extends object = object> = Omit<CheckboxNativeProps, 'form'> &
    ControlBindingProps<T, boolean, WaCheckbox['checked'], 'checked'> & {
        'onUpdate:modelValue'?: (value: WaCheckbox['checked']) => void;
        'onUpdate:indeterminate'?: (value: WaCheckbox['indeterminate']) => void;
    };

export interface CheckboxGroupNativeProps extends Omit<
    HTMLAttributes,
    | 'label'
    | 'hint'
    | 'orientation'
    | 'size'
    | 'required'
    | 'with-label'
    | 'withLabel'
    | 'with-hint'
    | 'withHint'
    | 'dir'
    | 'lang'
> {
    label?: WaCheckboxGroup['label'];
    hint?: WaCheckboxGroup['hint'];
    orientation?: WaCheckboxGroup['orientation'];
    size?: WaCheckboxGroup['size'];
    required?: WaCheckboxGroup['required'];
    'with-label'?: WaCheckboxGroup['withLabel'];
    withLabel?: WaCheckboxGroup['withLabel'];
    'with-hint'?: WaCheckboxGroup['withHint'];
    withHint?: WaCheckboxGroup['withHint'];
    dir?: WaCheckboxGroup['dir'];
    lang?: WaCheckboxGroup['lang'];
    slot?: string;
}

export interface CheckboxGroupProps extends CheckboxGroupNativeProps {}

export interface ColorPickerNativeProps extends Omit<
    HTMLAttributes,
    | 'value'
    | 'defaultValue'
    | 'with-label'
    | 'withLabel'
    | 'with-hint'
    | 'withHint'
    | 'label'
    | 'hint'
    | 'format'
    | 'size'
    | 'placement'
    | 'without-format-toggle'
    | 'withoutFormatToggle'
    | 'name'
    | 'disabled'
    | 'open'
    | 'opacity'
    | 'uppercase'
    | 'swatches'
    | 'required'
    | 'custom-error'
    | 'customError'
    | 'dir'
    | 'lang'
    | 'onChange'
    | 'onInput'
    | 'onWaShow'
    | 'onWaAfterShow'
    | 'onWaHide'
    | 'onWaAfterHide'
    | 'onBlur'
    | 'onFocus'
    | 'onWaInvalid'
> {
    value?: string | null;
    defaultValue?: WaColorPicker['defaultValue'];
    'with-label'?: WaColorPicker['withLabel'];
    withLabel?: WaColorPicker['withLabel'];
    'with-hint'?: WaColorPicker['withHint'];
    withHint?: WaColorPicker['withHint'];
    label?: WaColorPicker['label'];
    hint?: WaColorPicker['hint'];
    format?: WaColorPicker['format'];
    size?: WaColorPicker['size'];
    placement?: WaColorPicker['placement'];
    'without-format-toggle'?: WaColorPicker['withoutFormatToggle'];
    withoutFormatToggle?: WaColorPicker['withoutFormatToggle'];
    name?: WaColorPicker['name'];
    disabled?: WaColorPicker['disabled'];
    open?: WaColorPicker['open'];
    opacity?: WaColorPicker['opacity'];
    uppercase?: WaColorPicker['uppercase'];
    swatches?: WaColorPicker['swatches'];
    required?: WaColorPicker['required'];
    'custom-error'?: WaColorPicker['customError'];
    customError?: WaColorPicker['customError'];
    dir?: WaColorPicker['dir'];
    lang?: WaColorPicker['lang'];
    form?: string;
    slot?: string;
    onChange?: Upstream.WaColorPickerProps['onchange'];
    onInput?: Upstream.WaColorPickerProps['oninput'];
    onWaShow?: Upstream.WaColorPickerProps['onwa-show'];
    onWaAfterShow?: Upstream.WaColorPickerProps['onwa-after-show'];
    onWaHide?: Upstream.WaColorPickerProps['onwa-hide'];
    onWaAfterHide?: Upstream.WaColorPickerProps['onwa-after-hide'];
    onBlur?: Upstream.WaColorPickerProps['onblur'];
    onFocus?: Upstream.WaColorPickerProps['onfocus'];
    onWaInvalid?: Upstream.WaColorPickerProps['onwa-invalid'];
}

export type ColorPickerProps<T extends object = object> = Omit<ColorPickerNativeProps, 'form'> &
    ControlBindingProps<T, string | null, WaColorPicker['value'], 'value'> & {
        'onUpdate:modelValue'?: (value: WaColorPicker['value']) => void;
        'onUpdate:open'?: (value: WaColorPicker['open']) => void;
    };

export interface ComparisonNativeProps extends Omit<
    HTMLAttributes,
    'position' | 'dir' | 'lang' | 'onChange'
> {
    position?: WaComparison['position'];
    dir?: WaComparison['dir'];
    lang?: WaComparison['lang'];
    slot?: string;
    onChange?: Upstream.WaComparisonProps['onchange'];
}

export interface ComparisonProps extends ComparisonNativeProps {
    'onUpdate:position'?: (value: WaComparison['position']) => void;
}

export interface CopyButtonNativeProps extends Omit<
    HTMLAttributes,
    | 'value'
    | 'from'
    | 'disabled'
    | 'copy-label'
    | 'copyLabel'
    | 'success-label'
    | 'successLabel'
    | 'error-label'
    | 'errorLabel'
    | 'feedback-duration'
    | 'feedbackDuration'
    | 'tooltip-placement'
    | 'tooltipPlacement'
    | 'tooltip'
    | 'dir'
    | 'lang'
    | 'onWaCopy'
    | 'onWaError'
> {
    value?: WaCopyButton['value'];
    from?: WaCopyButton['from'];
    disabled?: WaCopyButton['disabled'];
    'copy-label'?: WaCopyButton['copyLabel'];
    copyLabel?: WaCopyButton['copyLabel'];
    'success-label'?: WaCopyButton['successLabel'];
    successLabel?: WaCopyButton['successLabel'];
    'error-label'?: WaCopyButton['errorLabel'];
    errorLabel?: WaCopyButton['errorLabel'];
    'feedback-duration'?: WaCopyButton['feedbackDuration'];
    feedbackDuration?: WaCopyButton['feedbackDuration'];
    'tooltip-placement'?: WaCopyButton['tooltipPlacement'];
    tooltipPlacement?: WaCopyButton['tooltipPlacement'];
    tooltip?: WaCopyButton['tooltip'];
    dir?: WaCopyButton['dir'];
    lang?: WaCopyButton['lang'];
    slot?: string;
    onWaCopy?: Upstream.WaCopyButtonProps['onwa-copy'];
    onWaError?: Upstream.WaCopyButtonProps['onwa-error'];
}

export interface CopyButtonProps extends CopyButtonNativeProps {}

export interface DetailsNativeProps extends Omit<
    HTMLAttributes,
    | 'open'
    | 'summary'
    | 'name'
    | 'disabled'
    | 'appearance'
    | 'icon-placement'
    | 'iconPlacement'
    | 'dir'
    | 'lang'
    | 'onWaShow'
    | 'onWaAfterShow'
    | 'onWaHide'
    | 'onWaAfterHide'
> {
    open?: WaDetails['open'];
    summary?: WaDetails['summary'];
    name?: WaDetails['name'];
    disabled?: WaDetails['disabled'];
    appearance?: WaDetails['appearance'];
    'icon-placement'?: WaDetails['iconPlacement'];
    iconPlacement?: WaDetails['iconPlacement'];
    dir?: WaDetails['dir'];
    lang?: WaDetails['lang'];
    slot?: string;
    onWaShow?: Upstream.WaDetailsProps['onwa-show'];
    onWaAfterShow?: Upstream.WaDetailsProps['onwa-after-show'];
    onWaHide?: Upstream.WaDetailsProps['onwa-hide'];
    onWaAfterHide?: Upstream.WaDetailsProps['onwa-after-hide'];
}

export interface DetailsProps extends DetailsNativeProps {
    'onUpdate:open'?: (value: WaDetails['open']) => void;
}

export interface DialogNativeProps extends Omit<
    HTMLAttributes,
    | 'open'
    | 'label'
    | 'without-header'
    | 'withoutHeader'
    | 'light-dismiss'
    | 'lightDismiss'
    | 'with-footer'
    | 'withFooter'
    | 'with-label'
    | 'withLabel'
    | 'dir'
    | 'lang'
    | 'onWaShow'
    | 'onWaAfterShow'
    | 'onWaHide'
    | 'onWaAfterHide'
> {
    open?: WaDialog['open'];
    label?: WaDialog['label'];
    'without-header'?: WaDialog['withoutHeader'];
    withoutHeader?: WaDialog['withoutHeader'];
    'light-dismiss'?: WaDialog['lightDismiss'];
    lightDismiss?: WaDialog['lightDismiss'];
    'with-footer'?: WaDialog['withFooter'];
    withFooter?: WaDialog['withFooter'];
    'with-label'?: WaDialog['withLabel'];
    withLabel?: WaDialog['withLabel'];
    dir?: WaDialog['dir'];
    lang?: WaDialog['lang'];
    slot?: string;
    onWaShow?: Upstream.WaDialogProps['onwa-show'];
    onWaAfterShow?: Upstream.WaDialogProps['onwa-after-show'];
    onWaHide?: Upstream.WaDialogProps['onwa-hide'];
    onWaAfterHide?: Upstream.WaDialogProps['onwa-after-hide'];
}

export interface DialogProps extends DialogNativeProps {
    'onUpdate:open'?: (value: WaDialog['open']) => void;
}

export interface DividerNativeProps extends Omit<
    HTMLAttributes,
    | 'orientation'
    | 'with-label'
    | 'withLabel'
    | 'label-placement'
    | 'labelPlacement'
    | 'dir'
    | 'lang'
> {
    orientation?: WaDivider['orientation'];
    'with-label'?: WaDivider['withLabel'];
    withLabel?: WaDivider['withLabel'];
    'label-placement'?: WaDivider['labelPlacement'];
    labelPlacement?: WaDivider['labelPlacement'];
    dir?: WaDivider['dir'];
    lang?: WaDivider['lang'];
    slot?: string;
}

export interface DividerProps extends DividerNativeProps {}

export interface DrawerNativeProps extends Omit<
    HTMLAttributes,
    | 'open'
    | 'label'
    | 'placement'
    | 'without-header'
    | 'withoutHeader'
    | 'light-dismiss'
    | 'lightDismiss'
    | 'with-footer'
    | 'withFooter'
    | 'with-label'
    | 'withLabel'
    | 'dir'
    | 'lang'
    | 'onWaShow'
    | 'onWaAfterShow'
    | 'onWaHide'
    | 'onWaAfterHide'
> {
    open?: WaDrawer['open'];
    label?: WaDrawer['label'];
    placement?: WaDrawer['placement'];
    'without-header'?: WaDrawer['withoutHeader'];
    withoutHeader?: WaDrawer['withoutHeader'];
    'light-dismiss'?: WaDrawer['lightDismiss'];
    lightDismiss?: WaDrawer['lightDismiss'];
    'with-footer'?: WaDrawer['withFooter'];
    withFooter?: WaDrawer['withFooter'];
    'with-label'?: WaDrawer['withLabel'];
    withLabel?: WaDrawer['withLabel'];
    dir?: WaDrawer['dir'];
    lang?: WaDrawer['lang'];
    slot?: string;
    onWaShow?: Upstream.WaDrawerProps['onwa-show'];
    onWaAfterShow?: Upstream.WaDrawerProps['onwa-after-show'];
    onWaHide?: Upstream.WaDrawerProps['onwa-hide'];
    onWaAfterHide?: Upstream.WaDrawerProps['onwa-after-hide'];
}

export interface DrawerProps extends DrawerNativeProps {
    'onUpdate:open'?: (value: WaDrawer['open']) => void;
}

export interface DropdownNativeProps extends Omit<
    HTMLAttributes,
    | 'open'
    | 'size'
    | 'placement'
    | 'distance'
    | 'skidding'
    | 'dir'
    | 'lang'
    | 'onWaShow'
    | 'onWaAfterShow'
    | 'onWaHide'
    | 'onWaAfterHide'
    | 'onWaSelect'
> {
    open?: WaDropdown['open'];
    size?: WaDropdown['size'];
    placement?: WaDropdown['placement'];
    distance?: WaDropdown['distance'];
    skidding?: WaDropdown['skidding'];
    dir?: WaDropdown['dir'];
    lang?: WaDropdown['lang'];
    slot?: string;
    onWaShow?: Upstream.WaDropdownProps['onwa-show'];
    onWaAfterShow?: Upstream.WaDropdownProps['onwa-after-show'];
    onWaHide?: Upstream.WaDropdownProps['onwa-hide'];
    onWaAfterHide?: Upstream.WaDropdownProps['onwa-after-hide'];
    onWaSelect?: Upstream.WaDropdownProps['onwa-select'];
}

export interface DropdownProps extends DropdownNativeProps {
    'onUpdate:open'?: (value: WaDropdown['open']) => void;
}

export interface DropdownItemNativeProps extends Omit<
    HTMLAttributes,
    | 'variant'
    | 'value'
    | 'type'
    | 'checked'
    | 'disabled'
    | 'submenuOpen'
    | 'href'
    | 'target'
    | 'rel'
    | 'download'
    | 'dir'
    | 'lang'
    | 'onBlur'
    | 'onFocus'
> {
    variant?: WaDropdownItem['variant'];
    value?: WaDropdownItem['value'];
    type?: WaDropdownItem['type'];
    checked?: WaDropdownItem['checked'];
    disabled?: WaDropdownItem['disabled'];
    submenuOpen?: WaDropdownItem['submenuOpen'];
    href?: WaDropdownItem['href'];
    target?: WaDropdownItem['target'];
    rel?: WaDropdownItem['rel'];
    download?: WaDropdownItem['download'];
    dir?: WaDropdownItem['dir'];
    lang?: WaDropdownItem['lang'];
    slot?: string;
    onBlur?: Upstream.WaDropdownItemProps['onblur'];
    onFocus?: Upstream.WaDropdownItemProps['onfocus'];
}

export interface DropdownItemProps extends DropdownItemNativeProps {
    'onUpdate:checked'?: (value: WaDropdownItem['checked']) => void;
}

export interface FormatBytesNativeProps extends Omit<
    HTMLAttributes,
    'value' | 'unit' | 'display' | 'dir' | 'lang'
> {
    value?: WaFormatBytes['value'];
    unit?: WaFormatBytes['unit'];
    display?: WaFormatBytes['display'];
    dir?: WaFormatBytes['dir'];
    lang?: WaFormatBytes['lang'];
    slot?: string;
}

export interface FormatBytesProps extends FormatBytesNativeProps {}

export interface FormatDateNativeProps extends Omit<
    HTMLAttributes,
    | 'date'
    | 'weekday'
    | 'era'
    | 'year'
    | 'month'
    | 'day'
    | 'hour'
    | 'minute'
    | 'second'
    | 'time-zone-name'
    | 'timeZoneName'
    | 'time-zone'
    | 'timeZone'
    | 'hour-format'
    | 'hourFormat'
    | 'dir'
    | 'lang'
> {
    date?: WaFormatDate['date'];
    weekday?: WaFormatDate['weekday'];
    era?: WaFormatDate['era'];
    year?: WaFormatDate['year'];
    month?: WaFormatDate['month'];
    day?: WaFormatDate['day'];
    hour?: WaFormatDate['hour'];
    minute?: WaFormatDate['minute'];
    second?: WaFormatDate['second'];
    'time-zone-name'?: WaFormatDate['timeZoneName'];
    timeZoneName?: WaFormatDate['timeZoneName'];
    'time-zone'?: WaFormatDate['timeZone'];
    timeZone?: WaFormatDate['timeZone'];
    'hour-format'?: WaFormatDate['hourFormat'];
    hourFormat?: WaFormatDate['hourFormat'];
    dir?: WaFormatDate['dir'];
    lang?: WaFormatDate['lang'];
    slot?: string;
}

export interface FormatDateProps extends FormatDateNativeProps {}

export interface FormatNumberNativeProps extends Omit<
    HTMLAttributes,
    | 'value'
    | 'type'
    | 'without-grouping'
    | 'withoutGrouping'
    | 'currency'
    | 'currency-display'
    | 'currencyDisplay'
    | 'minimum-integer-digits'
    | 'minimumIntegerDigits'
    | 'minimum-fraction-digits'
    | 'minimumFractionDigits'
    | 'maximum-fraction-digits'
    | 'maximumFractionDigits'
    | 'minimum-significant-digits'
    | 'minimumSignificantDigits'
    | 'maximum-significant-digits'
    | 'maximumSignificantDigits'
    | 'dir'
    | 'lang'
> {
    value?: WaFormatNumber['value'];
    type?: WaFormatNumber['type'];
    'without-grouping'?: WaFormatNumber['withoutGrouping'];
    withoutGrouping?: WaFormatNumber['withoutGrouping'];
    currency?: WaFormatNumber['currency'];
    'currency-display'?: WaFormatNumber['currencyDisplay'];
    currencyDisplay?: WaFormatNumber['currencyDisplay'];
    'minimum-integer-digits'?: WaFormatNumber['minimumIntegerDigits'];
    minimumIntegerDigits?: WaFormatNumber['minimumIntegerDigits'];
    'minimum-fraction-digits'?: WaFormatNumber['minimumFractionDigits'];
    minimumFractionDigits?: WaFormatNumber['minimumFractionDigits'];
    'maximum-fraction-digits'?: WaFormatNumber['maximumFractionDigits'];
    maximumFractionDigits?: WaFormatNumber['maximumFractionDigits'];
    'minimum-significant-digits'?: WaFormatNumber['minimumSignificantDigits'];
    minimumSignificantDigits?: WaFormatNumber['minimumSignificantDigits'];
    'maximum-significant-digits'?: WaFormatNumber['maximumSignificantDigits'];
    maximumSignificantDigits?: WaFormatNumber['maximumSignificantDigits'];
    dir?: WaFormatNumber['dir'];
    lang?: WaFormatNumber['lang'];
    slot?: string;
}

export interface FormatNumberProps extends FormatNumberNativeProps {}

export interface IncludeNativeProps extends Omit<
    HTMLAttributes,
    | 'src'
    | 'mode'
    | 'allow-scripts'
    | 'allowScripts'
    | 'dir'
    | 'lang'
    | 'onWaLoad'
    | 'onWaIncludeError'
> {
    src?: WaInclude['src'];
    mode?: WaInclude['mode'];
    'allow-scripts'?: WaInclude['allowScripts'];
    allowScripts?: WaInclude['allowScripts'];
    dir?: WaInclude['dir'];
    lang?: WaInclude['lang'];
    slot?: string;
    onWaLoad?: Upstream.WaIncludeProps['onwa-load'];
    onWaIncludeError?: Upstream.WaIncludeProps['onwa-include-error'];
}

export interface IncludeProps extends IncludeNativeProps {}

export interface IntersectionObserverNativeProps extends Omit<
    HTMLAttributes,
    | 'root'
    | 'root-margin'
    | 'rootMargin'
    | 'threshold'
    | 'intersect-class'
    | 'intersectClass'
    | 'once'
    | 'disabled'
    | 'dir'
    | 'lang'
    | 'onWaIntersect'
> {
    root?: WaIntersectionObserver['root'];
    'root-margin'?: WaIntersectionObserver['rootMargin'];
    rootMargin?: WaIntersectionObserver['rootMargin'];
    threshold?: WaIntersectionObserver['threshold'];
    'intersect-class'?: WaIntersectionObserver['intersectClass'];
    intersectClass?: WaIntersectionObserver['intersectClass'];
    once?: WaIntersectionObserver['once'];
    disabled?: WaIntersectionObserver['disabled'];
    dir?: WaIntersectionObserver['dir'];
    lang?: WaIntersectionObserver['lang'];
    slot?: string;
    onWaIntersect?: Upstream.WaIntersectionObserverProps['onwa-intersect'];
}

export interface IntersectionObserverProps extends IntersectionObserverNativeProps {}

export interface KnownDateNativeProps extends Omit<
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
    | 'min'
    | 'max'
    | 'locale'
    | 'with-label'
    | 'withLabel'
    | 'with-hint'
    | 'withHint'
    | 'custom-error'
    | 'customError'
    | 'dir'
    | 'lang'
    | 'onInput'
    | 'onChange'
    | 'onBlur'
    | 'onFocus'
    | 'onWaInvalid'
> {
    name?: WaKnownDate['name'];
    value?: string | Date | null;
    defaultValue?: WaKnownDate['defaultValue'];
    disabled?: WaKnownDate['disabled'];
    required?: WaKnownDate['required'];
    readonly?: WaKnownDate['readonly'];
    size?: WaKnownDate['size'];
    appearance?: WaKnownDate['appearance'];
    pill?: WaKnownDate['pill'];
    label?: WaKnownDate['label'];
    hint?: WaKnownDate['hint'];
    autocomplete?: WaKnownDate['autocomplete'];
    min?: WaKnownDate['min'];
    max?: WaKnownDate['max'];
    locale?: WaKnownDate['locale'];
    'with-label'?: WaKnownDate['withLabel'];
    withLabel?: WaKnownDate['withLabel'];
    'with-hint'?: WaKnownDate['withHint'];
    withHint?: WaKnownDate['withHint'];
    'custom-error'?: WaKnownDate['customError'];
    customError?: WaKnownDate['customError'];
    dir?: WaKnownDate['dir'];
    lang?: WaKnownDate['lang'];
    form?: string;
    slot?: string;
    onInput?: Upstream.WaKnownDateProps['oninput'];
    onChange?: Upstream.WaKnownDateProps['onchange'];
    onBlur?: Upstream.WaKnownDateProps['onblur'];
    onFocus?: Upstream.WaKnownDateProps['onfocus'];
    onWaInvalid?: Upstream.WaKnownDateProps['onwa-invalid'];
}

export type KnownDateProps<T extends object = object> = Omit<KnownDateNativeProps, 'form'> &
    ControlBindingProps<T, string | Date | null, WaKnownDate['value'], 'value'> & {
        'onUpdate:modelValue'?: (value: WaKnownDate['value']) => void;
    };

export interface MarkdownNativeProps extends Omit<
    HTMLAttributes,
    'tab-size' | 'tabSize' | 'dir' | 'lang'
> {
    'tab-size'?: WaMarkdown['tabSize'];
    tabSize?: WaMarkdown['tabSize'];
    dir?: WaMarkdown['dir'];
    lang?: WaMarkdown['lang'];
    slot?: string;
}

export interface MarkdownProps extends MarkdownNativeProps {}

export interface MutationObserverNativeProps extends Omit<
    HTMLAttributes,
    | 'attr'
    | 'attr-old-value'
    | 'attrOldValue'
    | 'char-data'
    | 'charData'
    | 'char-data-old-value'
    | 'charDataOldValue'
    | 'child-list'
    | 'childList'
    | 'disabled'
    | 'dir'
    | 'lang'
    | 'onWaMutation'
> {
    attr?: WaMutationObserver['attr'];
    'attr-old-value'?: WaMutationObserver['attrOldValue'];
    attrOldValue?: WaMutationObserver['attrOldValue'];
    'char-data'?: WaMutationObserver['charData'];
    charData?: WaMutationObserver['charData'];
    'char-data-old-value'?: WaMutationObserver['charDataOldValue'];
    charDataOldValue?: WaMutationObserver['charDataOldValue'];
    'child-list'?: WaMutationObserver['childList'];
    childList?: WaMutationObserver['childList'];
    disabled?: WaMutationObserver['disabled'];
    dir?: WaMutationObserver['dir'];
    lang?: WaMutationObserver['lang'];
    slot?: string;
    onWaMutation?: Upstream.WaMutationObserverProps['onwa-mutation'];
}

export interface MutationObserverProps extends MutationObserverNativeProps {}

export interface NumberInputNativeProps extends Omit<
    HTMLAttributes,
    | 'title'
    | 'value'
    | 'defaultValue'
    | 'size'
    | 'appearance'
    | 'pill'
    | 'label'
    | 'hint'
    | 'placeholder'
    | 'readonly'
    | 'required'
    | 'min'
    | 'max'
    | 'step'
    | 'without-steppers'
    | 'withoutSteppers'
    | 'autocomplete'
    | 'autofocus'
    | 'enterkeyhint'
    | 'inputmode'
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
    | 'onInput'
    | 'onChange'
    | 'onBlur'
    | 'onFocus'
    | 'onBeforeinput'
    | 'onWaInvalid'
> {
    title?: WaNumberInput['title'];
    value?: string | null;
    defaultValue?: WaNumberInput['defaultValue'];
    size?: WaNumberInput['size'];
    appearance?: WaNumberInput['appearance'];
    pill?: WaNumberInput['pill'];
    label?: WaNumberInput['label'];
    hint?: WaNumberInput['hint'];
    placeholder?: WaNumberInput['placeholder'];
    readonly?: WaNumberInput['readonly'];
    required?: WaNumberInput['required'];
    min?: WaNumberInput['min'];
    max?: WaNumberInput['max'];
    step?: WaNumberInput['step'];
    'without-steppers'?: WaNumberInput['withoutSteppers'];
    withoutSteppers?: WaNumberInput['withoutSteppers'];
    autocomplete?: WaNumberInput['autocomplete'];
    autofocus?: WaNumberInput['autofocus'];
    enterkeyhint?: WaNumberInput['enterkeyhint'];
    inputmode?: WaNumberInput['inputmode'];
    'with-label'?: WaNumberInput['withLabel'];
    withLabel?: WaNumberInput['withLabel'];
    'with-hint'?: WaNumberInput['withHint'];
    withHint?: WaNumberInput['withHint'];
    name?: WaNumberInput['name'];
    disabled?: WaNumberInput['disabled'];
    'custom-error'?: WaNumberInput['customError'];
    customError?: WaNumberInput['customError'];
    dir?: WaNumberInput['dir'];
    lang?: WaNumberInput['lang'];
    form?: string;
    slot?: string;
    onInput?: Upstream.WaNumberInputProps['oninput'];
    onChange?: Upstream.WaNumberInputProps['onchange'];
    onBlur?: Upstream.WaNumberInputProps['onblur'];
    onFocus?: Upstream.WaNumberInputProps['onfocus'];
    onBeforeinput?: Upstream.WaNumberInputProps['onbeforeinput'];
    onWaInvalid?: Upstream.WaNumberInputProps['onwa-invalid'];
}

export type NumberInputProps<T extends object = object> = Omit<NumberInputNativeProps, 'form'> &
    ControlBindingProps<T, string | null, WaNumberInput['value'], 'value'> & {
        'onUpdate:modelValue'?: (value: WaNumberInput['value']) => void;
    };

export interface OptionNativeProps extends Omit<
    HTMLAttributes,
    'value' | 'disabled' | 'selected' | 'defaultSelected' | 'label' | 'dir' | 'lang'
> {
    value?: WaOption['value'];
    disabled?: WaOption['disabled'];
    selected?: WaOption['selected'];
    defaultSelected?: WaOption['defaultSelected'];
    label?: string;
    dir?: WaOption['dir'];
    lang?: WaOption['lang'];
    slot?: string;
}

export interface OptionProps extends OptionNativeProps {}

export interface OtpInputNativeProps extends Omit<
    HTMLAttributes,
    | 'value'
    | 'defaultValue'
    | 'length'
    | 'appearance'
    | 'type'
    | 'mask'
    | 'case'
    | 'size'
    | 'label'
    | 'hint'
    | 'format'
    | 'autocomplete'
    | 'required'
    | 'readonly'
    | 'autosubmit'
    | 'autofocus'
    | 'with-mask'
    | 'withMask'
    | 'name'
    | 'disabled'
    | 'custom-error'
    | 'customError'
    | 'dir'
    | 'lang'
    | 'onInput'
    | 'onChange'
    | 'onFocus'
    | 'onBlur'
    | 'onWaComplete'
    | 'onWaClear'
    | 'onWaInvalid'
> {
    value?: string;
    defaultValue?: WaOtpInput['defaultValue'];
    length?: WaOtpInput['length'];
    appearance?: WaOtpInput['appearance'];
    type?: WaOtpInput['type'];
    mask?: WaOtpInput['mask'];
    case?: WaOtpInput['case'];
    size?: WaOtpInput['size'];
    label?: WaOtpInput['label'];
    hint?: WaOtpInput['hint'];
    format?: WaOtpInput['format'];
    autocomplete?: WaOtpInput['autocomplete'];
    required?: WaOtpInput['required'];
    readonly?: WaOtpInput['readonly'];
    autosubmit?: WaOtpInput['autosubmit'];
    autofocus?: WaOtpInput['autofocus'];
    'with-mask'?: WaOtpInput['withMask'];
    withMask?: WaOtpInput['withMask'];
    name?: WaOtpInput['name'];
    disabled?: WaOtpInput['disabled'];
    'custom-error'?: WaOtpInput['customError'];
    customError?: WaOtpInput['customError'];
    dir?: WaOtpInput['dir'];
    lang?: WaOtpInput['lang'];
    form?: string;
    slot?: string;
    onInput?: Upstream.WaOtpInputProps['oninput'];
    onChange?: Upstream.WaOtpInputProps['onchange'];
    onFocus?: Upstream.WaOtpInputProps['onfocus'];
    onBlur?: Upstream.WaOtpInputProps['onblur'];
    onWaComplete?: Upstream.WaOtpInputProps['onwa-complete'];
    onWaClear?: Upstream.WaOtpInputProps['onwa-clear'];
    onWaInvalid?: Upstream.WaOtpInputProps['onwa-invalid'];
}

export type OtpInputProps<T extends object = object> = Omit<OtpInputNativeProps, 'form'> &
    ControlBindingProps<T, string, WaOtpInput['value'], 'value'> & {
        'onUpdate:modelValue'?: (value: WaOtpInput['value']) => void;
    };

export interface PageNativeProps extends Omit<
    HTMLAttributes,
    | 'nonce'
    | 'nav-open'
    | 'navOpen'
    | 'mobile-breakpoint'
    | 'mobileBreakpoint'
    | 'navigation-placement'
    | 'navigationPlacement'
    | 'disable-navigation-toggle'
    | 'disableNavigationToggle'
    | 'dir'
    | 'lang'
    | 'disable-sticky'
    | 'disableSticky'
> {
    nonce?: WaPage['nonce'];
    'nav-open'?: WaPage['navOpen'];
    navOpen?: WaPage['navOpen'];
    'mobile-breakpoint'?: WaPage['mobileBreakpoint'];
    mobileBreakpoint?: WaPage['mobileBreakpoint'];
    'navigation-placement'?: WaPage['navigationPlacement'];
    navigationPlacement?: WaPage['navigationPlacement'];
    'disable-navigation-toggle'?: WaPage['disableNavigationToggle'];
    disableNavigationToggle?: WaPage['disableNavigationToggle'];
    dir?: WaPage['dir'];
    lang?: WaPage['lang'];
    'disable-sticky'?: string;
    disableSticky?: string;
    slot?: string;
}

export interface PageProps extends PageNativeProps {
    'onUpdate:navOpen'?: (value: WaPage['navOpen']) => void;
}

export interface PaginationNativeProps extends Omit<
    HTMLAttributes,
    | 'total'
    | 'page-size'
    | 'pageSize'
    | 'page'
    | 'sibling-count'
    | 'siblingCount'
    | 'boundary-count'
    | 'boundaryCount'
    | 'without-nav'
    | 'withoutNav'
    | 'with-edges'
    | 'withEdges'
    | 'with-summary'
    | 'withSummary'
    | 'format'
    | 'href-template'
    | 'hrefTemplate'
    | 'hide-single-page'
    | 'hideSinglePage'
    | 'label'
    | 'appearance'
    | 'disabled'
    | 'dir'
    | 'lang'
    | 'onWaBeforePageChange'
    | 'onWaPageChange'
> {
    total?: WaPagination['total'];
    'page-size'?: WaPagination['pageSize'];
    pageSize?: WaPagination['pageSize'];
    page?: WaPagination['page'];
    'sibling-count'?: WaPagination['siblingCount'];
    siblingCount?: WaPagination['siblingCount'];
    'boundary-count'?: WaPagination['boundaryCount'];
    boundaryCount?: WaPagination['boundaryCount'];
    'without-nav'?: WaPagination['withoutNav'];
    withoutNav?: WaPagination['withoutNav'];
    'with-edges'?: WaPagination['withEdges'];
    withEdges?: WaPagination['withEdges'];
    'with-summary'?: WaPagination['withSummary'];
    withSummary?: WaPagination['withSummary'];
    format?: WaPagination['format'];
    'href-template'?: WaPagination['hrefTemplate'];
    hrefTemplate?: WaPagination['hrefTemplate'];
    'hide-single-page'?: WaPagination['hideSinglePage'];
    hideSinglePage?: WaPagination['hideSinglePage'];
    label?: WaPagination['label'];
    appearance?: WaPagination['appearance'];
    disabled?: WaPagination['disabled'];
    dir?: WaPagination['dir'];
    lang?: WaPagination['lang'];
    slot?: string;
    onWaBeforePageChange?: Upstream.WaPaginationProps['onwa-before-page-change'];
    onWaPageChange?: Upstream.WaPaginationProps['onwa-page-change'];
}

export interface PaginationProps extends PaginationNativeProps {
    'onUpdate:page'?: (value: WaPagination['page']) => void;
}

export interface PopoverNativeProps extends Omit<
    HTMLAttributes,
    | 'placement'
    | 'open'
    | 'distance'
    | 'skidding'
    | 'for'
    | 'without-arrow'
    | 'withoutArrow'
    | 'dir'
    | 'lang'
    | 'onWaShow'
    | 'onWaAfterShow'
    | 'onWaHide'
    | 'onWaAfterHide'
> {
    placement?: WaPopover['placement'];
    open?: WaPopover['open'];
    distance?: WaPopover['distance'];
    skidding?: WaPopover['skidding'];
    for?: WaPopover['for'];
    'without-arrow'?: WaPopover['withoutArrow'];
    withoutArrow?: WaPopover['withoutArrow'];
    dir?: WaPopover['dir'];
    lang?: WaPopover['lang'];
    slot?: string;
    onWaShow?: Upstream.WaPopoverProps['onwa-show'];
    onWaAfterShow?: Upstream.WaPopoverProps['onwa-after-show'];
    onWaHide?: Upstream.WaPopoverProps['onwa-hide'];
    onWaAfterHide?: Upstream.WaPopoverProps['onwa-after-hide'];
}

export interface PopoverProps extends PopoverNativeProps {
    'onUpdate:open'?: (value: WaPopover['open']) => void;
}

export interface PopupNativeProps extends Omit<
    HTMLAttributes,
    | 'anchor'
    | 'active'
    | 'placement'
    | 'boundary'
    | 'distance'
    | 'skidding'
    | 'arrow'
    | 'arrow-placement'
    | 'arrowPlacement'
    | 'arrow-padding'
    | 'arrowPadding'
    | 'flip'
    | 'flip-fallback-placements'
    | 'flipFallbackPlacements'
    | 'flip-fallback-strategy'
    | 'flipFallbackStrategy'
    | 'flipBoundary'
    | 'flip-padding'
    | 'flipPadding'
    | 'shift'
    | 'shiftBoundary'
    | 'shift-padding'
    | 'shiftPadding'
    | 'auto-size'
    | 'autoSize'
    | 'sync'
    | 'autoSizeBoundary'
    | 'auto-size-padding'
    | 'autoSizePadding'
    | 'hover-bridge'
    | 'hoverBridge'
    | 'dir'
    | 'lang'
    | 'onWaReposition'
> {
    anchor?: WaPopup['anchor'];
    active?: WaPopup['active'];
    placement?: WaPopup['placement'];
    boundary?: WaPopup['boundary'];
    distance?: WaPopup['distance'];
    skidding?: WaPopup['skidding'];
    arrow?: WaPopup['arrow'];
    'arrow-placement'?: WaPopup['arrowPlacement'];
    arrowPlacement?: WaPopup['arrowPlacement'];
    'arrow-padding'?: WaPopup['arrowPadding'];
    arrowPadding?: WaPopup['arrowPadding'];
    flip?: WaPopup['flip'];
    'flip-fallback-placements'?: WaPopup['flipFallbackPlacements'];
    flipFallbackPlacements?: WaPopup['flipFallbackPlacements'];
    'flip-fallback-strategy'?: WaPopup['flipFallbackStrategy'];
    flipFallbackStrategy?: WaPopup['flipFallbackStrategy'];
    flipBoundary?: WaPopup['flipBoundary'];
    'flip-padding'?: WaPopup['flipPadding'];
    flipPadding?: WaPopup['flipPadding'];
    shift?: WaPopup['shift'];
    shiftBoundary?: WaPopup['shiftBoundary'];
    'shift-padding'?: WaPopup['shiftPadding'];
    shiftPadding?: WaPopup['shiftPadding'];
    'auto-size'?: WaPopup['autoSize'];
    autoSize?: WaPopup['autoSize'];
    sync?: WaPopup['sync'];
    autoSizeBoundary?: WaPopup['autoSizeBoundary'];
    'auto-size-padding'?: WaPopup['autoSizePadding'];
    autoSizePadding?: WaPopup['autoSizePadding'];
    'hover-bridge'?: WaPopup['hoverBridge'];
    hoverBridge?: WaPopup['hoverBridge'];
    dir?: WaPopup['dir'];
    lang?: WaPopup['lang'];
    slot?: string;
    onWaReposition?: Upstream.WaPopupProps['onwa-reposition'];
}

export interface PopupProps extends PopupNativeProps {}

export interface ProgressBarNativeProps extends Omit<
    HTMLAttributes,
    'value' | 'indeterminate' | 'label' | 'dir' | 'lang'
> {
    value?: WaProgressBar['value'];
    indeterminate?: WaProgressBar['indeterminate'];
    label?: WaProgressBar['label'];
    dir?: WaProgressBar['dir'];
    lang?: WaProgressBar['lang'];
    slot?: string;
}

export interface ProgressBarProps extends ProgressBarNativeProps {}

export interface ProgressRingNativeProps extends Omit<
    HTMLAttributes,
    'value' | 'label' | 'dir' | 'lang'
> {
    value?: WaProgressRing['value'];
    label?: WaProgressRing['label'];
    dir?: WaProgressRing['dir'];
    lang?: WaProgressRing['lang'];
    slot?: string;
}

export interface ProgressRingProps extends ProgressRingNativeProps {}

export interface QrCodeNativeProps extends Omit<
    HTMLAttributes,
    | 'value'
    | 'label'
    | 'size'
    | 'fill'
    | 'background'
    | 'radius'
    | 'error-correction'
    | 'errorCorrection'
    | 'image'
    | 'image-background'
    | 'imageBackground'
    | 'image-coverage'
    | 'imageCoverage'
    | 'image-padding'
    | 'imagePadding'
    | 'dir'
    | 'lang'
> {
    value?: WaQrCode['value'];
    label?: WaQrCode['label'];
    size?: WaQrCode['size'];
    fill?: WaQrCode['fill'];
    background?: WaQrCode['background'];
    radius?: WaQrCode['radius'];
    'error-correction'?: WaQrCode['errorCorrection'];
    errorCorrection?: WaQrCode['errorCorrection'];
    image?: WaQrCode['image'];
    'image-background'?: WaQrCode['imageBackground'];
    imageBackground?: WaQrCode['imageBackground'];
    'image-coverage'?: WaQrCode['imageCoverage'];
    imageCoverage?: WaQrCode['imageCoverage'];
    'image-padding'?: WaQrCode['imagePadding'];
    imagePadding?: WaQrCode['imagePadding'];
    dir?: WaQrCode['dir'];
    lang?: WaQrCode['lang'];
    slot?: string;
}

export interface QrCodeProps extends QrCodeNativeProps {}

export interface RadioNativeProps extends Omit<
    HTMLAttributes,
    | 'value'
    | 'appearance'
    | 'size'
    | 'disabled'
    | 'name'
    | 'custom-error'
    | 'customError'
    | 'dir'
    | 'lang'
    | 'onBlur'
    | 'onFocus'
> {
    value?: WaRadio['value'];
    appearance?: WaRadio['appearance'];
    size?: WaRadio['size'];
    disabled?: WaRadio['disabled'];
    name?: WaRadio['name'];
    'custom-error'?: WaRadio['customError'];
    customError?: WaRadio['customError'];
    dir?: WaRadio['dir'];
    lang?: WaRadio['lang'];
    form?: string;
    slot?: string;
    onBlur?: Upstream.WaRadioProps['onblur'];
    onFocus?: Upstream.WaRadioProps['onfocus'];
}

export interface RadioProps extends RadioNativeProps {}

export interface RadioGroupNativeProps extends Omit<
    HTMLAttributes,
    | 'label'
    | 'hint'
    | 'name'
    | 'disabled'
    | 'orientation'
    | 'value'
    | 'defaultValue'
    | 'size'
    | 'required'
    | 'with-label'
    | 'withLabel'
    | 'with-hint'
    | 'withHint'
    | 'custom-error'
    | 'customError'
    | 'dir'
    | 'lang'
    | 'onInput'
    | 'onChange'
    | 'onWaInvalid'
> {
    label?: WaRadioGroup['label'];
    hint?: WaRadioGroup['hint'];
    name?: WaRadioGroup['name'];
    disabled?: WaRadioGroup['disabled'];
    orientation?: WaRadioGroup['orientation'];
    value?: string | number | null;
    defaultValue?: WaRadioGroup['defaultValue'];
    size?: WaRadioGroup['size'];
    required?: WaRadioGroup['required'];
    'with-label'?: WaRadioGroup['withLabel'];
    withLabel?: WaRadioGroup['withLabel'];
    'with-hint'?: WaRadioGroup['withHint'];
    withHint?: WaRadioGroup['withHint'];
    'custom-error'?: WaRadioGroup['customError'];
    customError?: WaRadioGroup['customError'];
    dir?: WaRadioGroup['dir'];
    lang?: WaRadioGroup['lang'];
    form?: string;
    slot?: string;
    onInput?: Upstream.WaRadioGroupProps['oninput'];
    onChange?: Upstream.WaRadioGroupProps['onchange'];
    onWaInvalid?: Upstream.WaRadioGroupProps['onwa-invalid'];
}

export type RadioGroupProps<T extends object = object> = Omit<RadioGroupNativeProps, 'form'> &
    ControlBindingProps<T, string | number | null, WaRadioGroup['value'], 'value'> & {
        'onUpdate:modelValue'?: (value: WaRadioGroup['value']) => void;
    };

export interface RandomContentNativeProps extends Omit<
    HTMLAttributes,
    | 'items'
    | 'mode'
    | 'autoplay'
    | 'autoplay-interval'
    | 'autoplayInterval'
    | 'animation'
    | 'dir'
    | 'lang'
    | 'onWaContentChange'
> {
    items?: WaRandomContent['items'];
    mode?: WaRandomContent['mode'];
    autoplay?: WaRandomContent['autoplay'];
    'autoplay-interval'?: WaRandomContent['autoplayInterval'];
    autoplayInterval?: WaRandomContent['autoplayInterval'];
    animation?: WaRandomContent['animation'];
    dir?: WaRandomContent['dir'];
    lang?: WaRandomContent['lang'];
    slot?: string;
    onWaContentChange?: Upstream.WaRandomContentProps['onwa-content-change'];
}

export interface RandomContentProps extends RandomContentNativeProps {}

export interface RatingNativeProps extends Omit<
    HTMLAttributes,
    | 'role'
    | 'name'
    | 'label'
    | 'value'
    | 'default-value'
    | 'defaultValue'
    | 'max'
    | 'precision'
    | 'readonly'
    | 'disabled'
    | 'required'
    | 'getSymbol'
    | 'size'
    | 'custom-error'
    | 'customError'
    | 'dir'
    | 'lang'
    | 'onChange'
    | 'onWaHover'
    | 'onWaInvalid'
> {
    role?: WaRating['role'];
    name?: WaRating['name'];
    label?: WaRating['label'];
    value?: WaRating['value'];
    'default-value'?: WaRating['defaultValue'];
    defaultValue?: WaRating['defaultValue'];
    max?: WaRating['max'];
    precision?: WaRating['precision'];
    readonly?: WaRating['readonly'];
    disabled?: WaRating['disabled'];
    required?: WaRating['required'];
    getSymbol?: WaRating['getSymbol'];
    size?: WaRating['size'];
    'custom-error'?: WaRating['customError'];
    customError?: WaRating['customError'];
    dir?: WaRating['dir'];
    lang?: WaRating['lang'];
    form?: string;
    slot?: string;
    onChange?: Upstream.WaRatingProps['onchange'];
    onWaHover?: Upstream.WaRatingProps['onwa-hover'];
    onWaInvalid?: Upstream.WaRatingProps['onwa-invalid'];
}

export type RatingProps<T extends object = object> = Omit<RatingNativeProps, 'form'> &
    ControlBindingProps<T, WaRating['value'], WaRating['value'], 'value'> & {
        'onUpdate:modelValue'?: (value: WaRating['value']) => void;
    };

export interface RelativeTimeNativeProps extends Omit<
    HTMLAttributes,
    'date' | 'format' | 'numeric' | 'sync' | 'dir' | 'lang'
> {
    date?: WaRelativeTime['date'];
    format?: WaRelativeTime['format'];
    numeric?: WaRelativeTime['numeric'];
    sync?: WaRelativeTime['sync'];
    dir?: WaRelativeTime['dir'];
    lang?: WaRelativeTime['lang'];
    slot?: string;
}

export interface RelativeTimeProps extends RelativeTimeNativeProps {}

export interface ResizeObserverNativeProps extends Omit<
    HTMLAttributes,
    'disabled' | 'dir' | 'lang' | 'onWaResize'
> {
    disabled?: WaResizeObserver['disabled'];
    dir?: WaResizeObserver['dir'];
    lang?: WaResizeObserver['lang'];
    slot?: string;
    onWaResize?: Upstream.WaResizeObserverProps['onwa-resize'];
}

export interface ResizeObserverProps extends ResizeObserverNativeProps {}

export interface ScrollerNativeProps extends Omit<
    HTMLAttributes,
    | 'orientation'
    | 'without-scrollbar'
    | 'withoutScrollbar'
    | 'without-shadow'
    | 'withoutShadow'
    | 'dir'
    | 'lang'
> {
    orientation?: WaScroller['orientation'];
    'without-scrollbar'?: WaScroller['withoutScrollbar'];
    withoutScrollbar?: WaScroller['withoutScrollbar'];
    'without-shadow'?: WaScroller['withoutShadow'];
    withoutShadow?: WaScroller['withoutShadow'];
    dir?: WaScroller['dir'];
    lang?: WaScroller['lang'];
    slot?: string;
}

export interface ScrollerProps extends ScrollerNativeProps {}

export interface SelectNativeProps extends Omit<
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
    | 'custom-error'
    | 'customError'
    | 'dir'
    | 'lang'
    | 'getTag'
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
    name?: WaSelect['name'];
    value?: string | string[] | null;
    defaultValue?: null | string | string[];
    size?: WaSelect['size'];
    placeholder?: WaSelect['placeholder'];
    multiple?: WaSelect['multiple'];
    'max-options-visible'?: WaSelect['maxOptionsVisible'];
    maxOptionsVisible?: WaSelect['maxOptionsVisible'];
    disabled?: WaSelect['disabled'];
    'with-clear'?: WaSelect['withClear'];
    withClear?: WaSelect['withClear'];
    open?: WaSelect['open'];
    appearance?: WaSelect['appearance'];
    pill?: WaSelect['pill'];
    label?: WaSelect['label'];
    placement?: WaSelect['placement'];
    hint?: WaSelect['hint'];
    'with-label'?: WaSelect['withLabel'];
    withLabel?: WaSelect['withLabel'];
    'with-hint'?: WaSelect['withHint'];
    withHint?: WaSelect['withHint'];
    required?: WaSelect['required'];
    'custom-error'?: WaSelect['customError'];
    customError?: WaSelect['customError'];
    dir?: WaSelect['dir'];
    lang?: WaSelect['lang'];
    getTag?: WaSelect['getTag'];
    form?: string;
    slot?: string;
    onInput?: Upstream.WaSelectProps['oninput'];
    onChange?: Upstream.WaSelectProps['onchange'];
    onFocus?: Upstream.WaSelectProps['onfocus'];
    onBlur?: Upstream.WaSelectProps['onblur'];
    onWaClear?: Upstream.WaSelectProps['onwa-clear'];
    onWaShow?: Upstream.WaSelectProps['onwa-show'];
    onWaAfterShow?: Upstream.WaSelectProps['onwa-after-show'];
    onWaHide?: Upstream.WaSelectProps['onwa-hide'];
    onWaAfterHide?: Upstream.WaSelectProps['onwa-after-hide'];
    onWaInvalid?: Upstream.WaSelectProps['onwa-invalid'];
}

export type SelectProps<T extends object = object, M extends boolean = boolean> = Omit<
    SelectNativeProps,
    'form' | 'multiple'
> &
    ControlBindingProps<
        T,
        string | string[] | null,
        Extract<WaSelect['value'], M extends true ? string[] | null : string | null>,
        'value'
    > & { multiple?: M } & {
        'onUpdate:modelValue'?: (
            value: Extract<WaSelect['value'], M extends true ? string[] | null : string | null>,
        ) => void;
        'onUpdate:open'?: (value: WaSelect['open']) => void;
    };

export interface SkeletonNativeProps extends Omit<HTMLAttributes, 'effect' | 'dir' | 'lang'> {
    effect?: WaSkeleton['effect'];
    dir?: WaSkeleton['dir'];
    lang?: WaSkeleton['lang'];
    slot?: string;
}

export interface SkeletonProps extends SkeletonNativeProps {}

export interface SliderNativeProps extends Omit<
    HTMLAttributes,
    | 'label'
    | 'hint'
    | 'name'
    | 'min-value'
    | 'minValue'
    | 'max-value'
    | 'maxValue'
    | 'value'
    | 'defaultValue'
    | 'range'
    | 'disabled'
    | 'readonly'
    | 'orientation'
    | 'size'
    | 'indicator-offset'
    | 'indicatorOffset'
    | 'min'
    | 'max'
    | 'step'
    | 'autofocus'
    | 'tooltip-distance'
    | 'tooltipDistance'
    | 'tooltip-placement'
    | 'tooltipPlacement'
    | 'with-markers'
    | 'withMarkers'
    | 'with-tooltip'
    | 'withTooltip'
    | 'with-label'
    | 'withLabel'
    | 'with-hint'
    | 'withHint'
    | 'custom-error'
    | 'customError'
    | 'dir'
    | 'lang'
    | 'valueFormatter'
    | 'onChange'
    | 'onBlur'
    | 'onFocus'
    | 'onInput'
    | 'onWaInvalid'
> {
    label?: WaSlider['label'];
    hint?: WaSlider['hint'];
    name?: WaSlider['name'];
    'min-value'?: WaSlider['minValue'];
    minValue?: WaSlider['minValue'];
    'max-value'?: WaSlider['maxValue'];
    maxValue?: WaSlider['maxValue'];
    value?: number | null;
    defaultValue?: WaSlider['defaultValue'];
    range?: WaSlider['range'];
    disabled?: WaSlider['disabled'];
    readonly?: WaSlider['readonly'];
    orientation?: WaSlider['orientation'];
    size?: WaSlider['size'];
    'indicator-offset'?: WaSlider['indicatorOffset'];
    indicatorOffset?: WaSlider['indicatorOffset'];
    min?: WaSlider['min'];
    max?: WaSlider['max'];
    step?: WaSlider['step'];
    autofocus?: WaSlider['autofocus'];
    'tooltip-distance'?: WaSlider['tooltipDistance'];
    tooltipDistance?: WaSlider['tooltipDistance'];
    'tooltip-placement'?: WaSlider['tooltipPlacement'];
    tooltipPlacement?: WaSlider['tooltipPlacement'];
    'with-markers'?: WaSlider['withMarkers'];
    withMarkers?: WaSlider['withMarkers'];
    'with-tooltip'?: WaSlider['withTooltip'];
    withTooltip?: WaSlider['withTooltip'];
    'with-label'?: WaSlider['withLabel'];
    withLabel?: WaSlider['withLabel'];
    'with-hint'?: WaSlider['withHint'];
    withHint?: WaSlider['withHint'];
    'custom-error'?: WaSlider['customError'];
    customError?: WaSlider['customError'];
    dir?: WaSlider['dir'];
    lang?: WaSlider['lang'];
    valueFormatter?: WaSlider['valueFormatter'];
    form?: string;
    slot?: string;
    onChange?: Upstream.WaSliderProps['onchange'];
    onBlur?: Upstream.WaSliderProps['onblur'];
    onFocus?: Upstream.WaSliderProps['onfocus'];
    onInput?: Upstream.WaSliderProps['oninput'];
    onWaInvalid?: Upstream.WaSliderProps['onwa-invalid'];
}

export type SliderProps<T extends object = object> = Omit<SliderNativeProps, 'form'> &
    ControlBindingProps<T, number | null, WaSlider['value'], 'value'> & {
        'onUpdate:modelValue'?: (value: WaSlider['value']) => void;
        'onUpdate:minValue'?: (value: WaSlider['minValue']) => void;
        'onUpdate:maxValue'?: (value: WaSlider['maxValue']) => void;
    };

export interface SpinnerNativeProps extends Omit<HTMLAttributes, 'dir' | 'lang'> {
    dir?: WaSpinner['dir'];
    lang?: WaSpinner['lang'];
    slot?: string;
}

export interface SpinnerProps extends SpinnerNativeProps {}

export interface SplitPanelNativeProps extends Omit<
    HTMLAttributes,
    | 'position'
    | 'position-in-pixels'
    | 'positionInPixels'
    | 'orientation'
    | 'disabled'
    | 'primary'
    | 'snap'
    | 'snap-threshold'
    | 'snapThreshold'
    | 'dir'
    | 'lang'
    | 'onWaReposition'
> {
    position?: WaSplitPanel['position'];
    'position-in-pixels'?: WaSplitPanel['positionInPixels'];
    positionInPixels?: WaSplitPanel['positionInPixels'];
    orientation?: WaSplitPanel['orientation'];
    disabled?: WaSplitPanel['disabled'];
    primary?: WaSplitPanel['primary'];
    snap?: WaSplitPanel['snap'];
    'snap-threshold'?: WaSplitPanel['snapThreshold'];
    snapThreshold?: WaSplitPanel['snapThreshold'];
    dir?: WaSplitPanel['dir'];
    lang?: WaSplitPanel['lang'];
    slot?: string;
    onWaReposition?: Upstream.WaSplitPanelProps['onwa-reposition'];
}

export interface SplitPanelProps extends SplitPanelNativeProps {
    'onUpdate:position'?: (value: WaSplitPanel['position']) => void;
    'onUpdate:positionInPixels'?: (value: WaSplitPanel['positionInPixels']) => void;
}

export interface StepNativeProps extends Omit<
    HTMLAttributes,
    | 'name'
    | 'completed'
    | 'loading'
    | 'disabled'
    | 'variant'
    | 'attention'
    | 'with-description'
    | 'withDescription'
    | 'active'
    | 'role'
    | 'dir'
    | 'lang'
> {
    name?: WaStep['name'];
    completed?: WaStep['completed'];
    loading?: WaStep['loading'];
    disabled?: WaStep['disabled'];
    variant?: WaStep['variant'];
    attention?: WaStep['attention'];
    'with-description'?: WaStep['withDescription'];
    withDescription?: WaStep['withDescription'];
    active?: WaStep['active'];
    role?: WaStep['role'];
    dir?: WaStep['dir'];
    lang?: WaStep['lang'];
    slot?: string;
}

export interface StepProps extends StepNativeProps {}

export interface StepperNativeProps extends Omit<
    HTMLAttributes,
    | 'active'
    | 'orientation'
    | 'linear'
    | 'clickable'
    | 'label'
    | 'dir'
    | 'lang'
    | 'onDetail'
    | 'onWaBeforeStepChange'
    | 'onWaStepChange'
> {
    active?: WaStepper['active'];
    orientation?: WaStepper['orientation'];
    linear?: WaStepper['linear'];
    clickable?: WaStepper['clickable'];
    label?: WaStepper['label'];
    dir?: WaStepper['dir'];
    lang?: WaStepper['lang'];
    slot?: string;
    onDetail?: Upstream.WaStepperProps['ondetail'];
    onWaBeforeStepChange?: Upstream.WaStepperProps['onwa-before-step-change'];
    onWaStepChange?: Upstream.WaStepperProps['onwa-step-change'];
}

export interface StepperProps extends StepperNativeProps {
    'onUpdate:active'?: (value: WaStepper['active']) => void;
}

export interface SwitchNativeProps extends Omit<
    HTMLAttributes,
    | 'title'
    | 'name'
    | 'value'
    | 'size'
    | 'disabled'
    | 'checked'
    | 'defaultChecked'
    | 'required'
    | 'hint'
    | 'with-hint'
    | 'withHint'
    | 'custom-error'
    | 'customError'
    | 'dir'
    | 'lang'
    | 'onChange'
    | 'onInput'
    | 'onBlur'
    | 'onFocus'
    | 'onWaInvalid'
> {
    title?: WaSwitch['title'];
    name?: WaSwitch['name'];
    value?: string | null;
    size?: WaSwitch['size'];
    disabled?: WaSwitch['disabled'];
    checked?: boolean;
    defaultChecked?: WaSwitch['defaultChecked'];
    required?: WaSwitch['required'];
    hint?: WaSwitch['hint'];
    'with-hint'?: WaSwitch['withHint'];
    withHint?: WaSwitch['withHint'];
    'custom-error'?: WaSwitch['customError'];
    customError?: WaSwitch['customError'];
    dir?: WaSwitch['dir'];
    lang?: WaSwitch['lang'];
    form?: string;
    slot?: string;
    onChange?: Upstream.WaSwitchProps['onchange'];
    onInput?: Upstream.WaSwitchProps['oninput'];
    onBlur?: Upstream.WaSwitchProps['onblur'];
    onFocus?: Upstream.WaSwitchProps['onfocus'];
    onWaInvalid?: Upstream.WaSwitchProps['onwa-invalid'];
}

export type SwitchProps<T extends object = object> = Omit<SwitchNativeProps, 'form'> &
    ControlBindingProps<T, boolean, WaSwitch['checked'], 'checked'> & {
        'onUpdate:modelValue'?: (value: WaSwitch['checked']) => void;
    };

export interface TabNativeProps extends Omit<
    HTMLAttributes,
    'panel' | 'disabled' | 'role' | 'dir' | 'lang'
> {
    panel?: WaTab['panel'];
    disabled?: WaTab['disabled'];
    role?: WaTab['role'];
    dir?: WaTab['dir'];
    lang?: WaTab['lang'];
    slot?: string;
}

export interface TabProps extends TabNativeProps {}

export interface TabGroupNativeProps extends Omit<
    HTMLAttributes,
    | 'active'
    | 'placement'
    | 'activation'
    | 'without-scroll-controls'
    | 'withoutScrollControls'
    | 'dir'
    | 'lang'
    | 'onWaTabShow'
    | 'onWaTabHide'
> {
    active?: WaTabGroup['active'];
    placement?: WaTabGroup['placement'];
    activation?: WaTabGroup['activation'];
    'without-scroll-controls'?: WaTabGroup['withoutScrollControls'];
    withoutScrollControls?: WaTabGroup['withoutScrollControls'];
    dir?: WaTabGroup['dir'];
    lang?: WaTabGroup['lang'];
    slot?: string;
    onWaTabShow?: Upstream.WaTabGroupProps['onwa-tab-show'];
    onWaTabHide?: Upstream.WaTabGroupProps['onwa-tab-hide'];
}

export interface TabGroupProps extends TabGroupNativeProps {
    'onUpdate:active'?: (value: WaTabGroup['active']) => void;
}

export interface TabPanelNativeProps extends Omit<
    HTMLAttributes,
    'name' | 'active' | 'role' | 'dir' | 'lang'
> {
    name?: WaTabPanel['name'];
    active?: WaTabPanel['active'];
    role?: WaTabPanel['role'];
    dir?: WaTabPanel['dir'];
    lang?: WaTabPanel['lang'];
    slot?: string;
}

export interface TabPanelProps extends TabPanelNativeProps {}

export interface TagInputNativeProps extends Omit<
    HTMLAttributes,
    | 'value'
    | 'defaultValue'
    | 'delimiter'
    | 'max-tags'
    | 'maxTags'
    | 'min-tags'
    | 'minTags'
    | 'allow-duplicates'
    | 'allowDuplicates'
    | 'with-clear'
    | 'withClear'
    | 'placeholder'
    | 'label'
    | 'hint'
    | 'with-label'
    | 'withLabel'
    | 'with-hint'
    | 'withHint'
    | 'size'
    | 'appearance'
    | 'pill'
    | 'readonly'
    | 'required'
    | 'autocapitalize'
    | 'autocorrect'
    | 'autocomplete'
    | 'enterkeyhint'
    | 'spellcheck'
    | 'inputmode'
    | 'name'
    | 'disabled'
    | 'custom-error'
    | 'customError'
    | 'dir'
    | 'lang'
    | 'inputValue'
    | 'onInput'
    | 'onChange'
    | 'onBlur'
    | 'onFocus'
    | 'onWaCreate'
    | 'onWaClear'
    | 'onWaInvalid'
> {
    value?: string[] | string | FormData | null;
    defaultValue?: WaTagInput['defaultValue'];
    delimiter?: WaTagInput['delimiter'];
    'max-tags'?: WaTagInput['maxTags'];
    maxTags?: WaTagInput['maxTags'];
    'min-tags'?: WaTagInput['minTags'];
    minTags?: WaTagInput['minTags'];
    'allow-duplicates'?: WaTagInput['allowDuplicates'];
    allowDuplicates?: WaTagInput['allowDuplicates'];
    'with-clear'?: WaTagInput['withClear'];
    withClear?: WaTagInput['withClear'];
    placeholder?: WaTagInput['placeholder'];
    label?: WaTagInput['label'];
    hint?: WaTagInput['hint'];
    'with-label'?: WaTagInput['withLabel'];
    withLabel?: WaTagInput['withLabel'];
    'with-hint'?: WaTagInput['withHint'];
    withHint?: WaTagInput['withHint'];
    size?: WaTagInput['size'];
    appearance?: WaTagInput['appearance'];
    pill?: WaTagInput['pill'];
    readonly?: WaTagInput['readonly'];
    required?: WaTagInput['required'];
    autocapitalize?: WaTagInput['autocapitalize'];
    autocorrect?: boolean | 'on' | 'off';
    autocomplete?: WaTagInput['autocomplete'];
    enterkeyhint?: WaTagInput['enterkeyhint'];
    spellcheck?: HTMLAttributes['spellcheck'];
    inputmode?: WaTagInput['inputmode'];
    name?: WaTagInput['name'];
    disabled?: WaTagInput['disabled'];
    'custom-error'?: WaTagInput['customError'];
    customError?: WaTagInput['customError'];
    dir?: WaTagInput['dir'];
    lang?: WaTagInput['lang'];
    inputValue?: WaTagInput['inputValue'];
    form?: string;
    slot?: string;
    onInput?: Upstream.WaTagInputProps['oninput'];
    onChange?: Upstream.WaTagInputProps['onchange'];
    onBlur?: Upstream.WaTagInputProps['onblur'];
    onFocus?: Upstream.WaTagInputProps['onfocus'];
    onWaCreate?: Upstream.WaTagInputProps['onwa-create'];
    onWaClear?: Upstream.WaTagInputProps['onwa-clear'];
    onWaInvalid?: Upstream.WaTagInputProps['onwa-invalid'];
}

export type TagInputProps<T extends object = object> = Omit<TagInputNativeProps, 'form'> &
    ControlBindingProps<T, string[] | string | FormData | null, WaTagInput['value'], 'value'> & {
        'onUpdate:modelValue'?: (value: WaTagInput['value']) => void;
        'onUpdate:inputValue'?: (value: WaTagInput['inputValue']) => void;
    };

export interface TextareaNativeProps extends Omit<
    HTMLAttributes,
    | 'title'
    | 'name'
    | 'value'
    | 'defaultValue'
    | 'size'
    | 'appearance'
    | 'label'
    | 'hint'
    | 'placeholder'
    | 'rows'
    | 'resize'
    | 'disabled'
    | 'readonly'
    | 'required'
    | 'minlength'
    | 'maxlength'
    | 'autocapitalize'
    | 'autocorrect'
    | 'autocomplete'
    | 'autofocus'
    | 'enterkeyhint'
    | 'spellcheck'
    | 'inputmode'
    | 'with-label'
    | 'withLabel'
    | 'with-hint'
    | 'withHint'
    | 'with-count'
    | 'withCount'
    | 'custom-error'
    | 'customError'
    | 'dir'
    | 'lang'
    | 'onBlur'
    | 'onChange'
    | 'onFocus'
    | 'onInput'
    | 'onWaInvalid'
> {
    title?: WaTextarea['title'];
    name?: WaTextarea['name'];
    value?: string | null;
    defaultValue?: WaTextarea['defaultValue'];
    size?: WaTextarea['size'];
    appearance?: WaTextarea['appearance'];
    label?: WaTextarea['label'];
    hint?: WaTextarea['hint'];
    placeholder?: WaTextarea['placeholder'];
    rows?: WaTextarea['rows'];
    resize?: WaTextarea['resize'];
    disabled?: WaTextarea['disabled'];
    readonly?: WaTextarea['readonly'];
    required?: WaTextarea['required'];
    minlength?: WaTextarea['minlength'];
    maxlength?: WaTextarea['maxlength'];
    autocapitalize?: WaTextarea['autocapitalize'];
    autocorrect?: boolean | 'on' | 'off';
    autocomplete?: WaTextarea['autocomplete'];
    autofocus?: WaTextarea['autofocus'];
    enterkeyhint?: WaTextarea['enterkeyhint'];
    spellcheck?: HTMLAttributes['spellcheck'];
    inputmode?: WaTextarea['inputmode'];
    'with-label'?: WaTextarea['withLabel'];
    withLabel?: WaTextarea['withLabel'];
    'with-hint'?: WaTextarea['withHint'];
    withHint?: WaTextarea['withHint'];
    'with-count'?: WaTextarea['withCount'];
    withCount?: WaTextarea['withCount'];
    'custom-error'?: WaTextarea['customError'];
    customError?: WaTextarea['customError'];
    dir?: WaTextarea['dir'];
    lang?: WaTextarea['lang'];
    form?: string;
    slot?: string;
    onBlur?: Upstream.WaTextareaProps['onblur'];
    onChange?: Upstream.WaTextareaProps['onchange'];
    onFocus?: Upstream.WaTextareaProps['onfocus'];
    onInput?: Upstream.WaTextareaProps['oninput'];
    onWaInvalid?: Upstream.WaTextareaProps['onwa-invalid'];
}

export type TextareaProps<T extends object = object> = Omit<TextareaNativeProps, 'form'> &
    ControlBindingProps<T, string | null, WaTextarea['value'], 'value'> & {
        'onUpdate:modelValue'?: (value: WaTextarea['value']) => void;
    };

export interface TimeInputNativeProps extends Omit<
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
    | 'with-now'
    | 'withNow'
    | 'with-label'
    | 'withLabel'
    | 'with-hint'
    | 'withHint'
    | 'min'
    | 'max'
    | 'step'
    | 'hour-format'
    | 'hourFormat'
    | 'open'
    | 'placement'
    | 'distance'
    | 'custom-error'
    | 'customError'
    | 'dir'
    | 'lang'
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
    name?: WaTimeInput['name'];
    value?: string | Date | null;
    defaultValue?: WaTimeInput['defaultValue'];
    disabled?: WaTimeInput['disabled'];
    required?: WaTimeInput['required'];
    readonly?: WaTimeInput['readonly'];
    size?: WaTimeInput['size'];
    appearance?: WaTimeInput['appearance'];
    pill?: WaTimeInput['pill'];
    label?: WaTimeInput['label'];
    hint?: WaTimeInput['hint'];
    autocomplete?: WaTimeInput['autocomplete'];
    'with-clear'?: WaTimeInput['withClear'];
    withClear?: WaTimeInput['withClear'];
    'with-now'?: WaTimeInput['withNow'];
    withNow?: WaTimeInput['withNow'];
    'with-label'?: WaTimeInput['withLabel'];
    withLabel?: WaTimeInput['withLabel'];
    'with-hint'?: WaTimeInput['withHint'];
    withHint?: WaTimeInput['withHint'];
    min?: WaTimeInput['min'];
    max?: WaTimeInput['max'];
    step?: WaTimeInput['step'];
    'hour-format'?: WaTimeInput['hourFormat'];
    hourFormat?: WaTimeInput['hourFormat'];
    open?: WaTimeInput['open'];
    placement?: WaTimeInput['placement'];
    distance?: WaTimeInput['distance'];
    'custom-error'?: WaTimeInput['customError'];
    customError?: WaTimeInput['customError'];
    dir?: WaTimeInput['dir'];
    lang?: WaTimeInput['lang'];
    form?: string;
    slot?: string;
    onInput?: Upstream.WaTimeInputProps['oninput'];
    onChange?: Upstream.WaTimeInputProps['onchange'];
    onFocus?: Upstream.WaTimeInputProps['onfocus'];
    onBlur?: Upstream.WaTimeInputProps['onblur'];
    onWaClear?: Upstream.WaTimeInputProps['onwa-clear'];
    onWaShow?: Upstream.WaTimeInputProps['onwa-show'];
    onWaAfterShow?: Upstream.WaTimeInputProps['onwa-after-show'];
    onWaHide?: Upstream.WaTimeInputProps['onwa-hide'];
    onWaAfterHide?: Upstream.WaTimeInputProps['onwa-after-hide'];
    onWaInvalid?: Upstream.WaTimeInputProps['onwa-invalid'];
}

export type TimeInputProps<T extends object = object> = Omit<TimeInputNativeProps, 'form'> &
    ControlBindingProps<T, string | Date | null, WaTimeInput['value'], 'value'> & {
        'onUpdate:modelValue'?: (value: WaTimeInput['value']) => void;
        'onUpdate:open'?: (value: WaTimeInput['open']) => void;
    };

export interface ToastNativeProps extends Omit<HTMLAttributes, 'placement' | 'dir' | 'lang'> {
    placement?: WaToast['placement'];
    dir?: WaToast['dir'];
    lang?: WaToast['lang'];
    slot?: string;
}

export interface ToastProps extends ToastNativeProps {}

export interface ToastItemNativeProps extends Omit<
    HTMLAttributes,
    | 'variant'
    | 'size'
    | 'duration'
    | 'with-icon'
    | 'withIcon'
    | 'dir'
    | 'lang'
    | 'onWaShow'
    | 'onWaAfterShow'
    | 'onWaHide'
    | 'onWaAfterHide'
> {
    variant?: WaToastItem['variant'];
    size?: WaToastItem['size'];
    duration?: WaToastItem['duration'];
    'with-icon'?: WaToastItem['withIcon'];
    withIcon?: WaToastItem['withIcon'];
    dir?: WaToastItem['dir'];
    lang?: WaToastItem['lang'];
    slot?: string;
    onWaShow?: Upstream.WaToastItemProps['onwa-show'];
    onWaAfterShow?: Upstream.WaToastItemProps['onwa-after-show'];
    onWaHide?: Upstream.WaToastItemProps['onwa-hide'];
    onWaAfterHide?: Upstream.WaToastItemProps['onwa-after-hide'];
}

export interface ToastItemProps extends ToastItemNativeProps {}

export interface TooltipNativeProps extends Omit<
    HTMLAttributes,
    | 'placement'
    | 'disabled'
    | 'distance'
    | 'open'
    | 'skidding'
    | 'show-delay'
    | 'showDelay'
    | 'hide-delay'
    | 'hideDelay'
    | 'trigger'
    | 'without-arrow'
    | 'withoutArrow'
    | 'for'
    | 'dir'
    | 'lang'
    | 'onWaShow'
    | 'onWaAfterShow'
    | 'onWaHide'
    | 'onWaAfterHide'
> {
    placement?: WaTooltip['placement'];
    disabled?: WaTooltip['disabled'];
    distance?: WaTooltip['distance'];
    open?: WaTooltip['open'];
    skidding?: WaTooltip['skidding'];
    'show-delay'?: WaTooltip['showDelay'];
    showDelay?: WaTooltip['showDelay'];
    'hide-delay'?: WaTooltip['hideDelay'];
    hideDelay?: WaTooltip['hideDelay'];
    trigger?: WaTooltip['trigger'];
    'without-arrow'?: WaTooltip['withoutArrow'];
    withoutArrow?: WaTooltip['withoutArrow'];
    for?: WaTooltip['for'];
    dir?: WaTooltip['dir'];
    lang?: WaTooltip['lang'];
    slot?: string;
    onWaShow?: Upstream.WaTooltipProps['onwa-show'];
    onWaAfterShow?: Upstream.WaTooltipProps['onwa-after-show'];
    onWaHide?: Upstream.WaTooltipProps['onwa-hide'];
    onWaAfterHide?: Upstream.WaTooltipProps['onwa-after-hide'];
}

export interface TooltipProps extends TooltipNativeProps {
    'onUpdate:open'?: (value: WaTooltip['open']) => void;
}

export interface TreeNativeProps extends Omit<
    HTMLAttributes,
    'selection' | 'tabindex' | 'tabIndex' | 'role' | 'dir' | 'lang' | 'onWaSelectionChange'
> {
    selection?: WaTree['selection'];
    tabindex?: WaTree['tabIndex'];
    tabIndex?: WaTree['tabIndex'];
    role?: WaTree['role'];
    dir?: WaTree['dir'];
    lang?: WaTree['lang'];
    slot?: string;
    onWaSelectionChange?: Upstream.WaTreeProps['onwa-selection-change'];
}

export interface TreeProps extends TreeNativeProps {}

export interface TreeItemNativeProps extends Omit<
    HTMLAttributes,
    | 'expanded'
    | 'selected'
    | 'disabled'
    | 'lazy'
    | 'tabindex'
    | 'tabIndex'
    | 'role'
    | 'dir'
    | 'lang'
    | 'onWaExpand'
    | 'onWaAfterExpand'
    | 'onWaCollapse'
    | 'onWaAfterCollapse'
    | 'onWaLazyChange'
    | 'onWaLazyLoad'
> {
    expanded?: WaTreeItem['expanded'];
    selected?: WaTreeItem['selected'];
    disabled?: WaTreeItem['disabled'];
    lazy?: WaTreeItem['lazy'];
    tabindex?: WaTreeItem['tabIndex'];
    tabIndex?: WaTreeItem['tabIndex'];
    role?: WaTreeItem['role'];
    dir?: WaTreeItem['dir'];
    lang?: WaTreeItem['lang'];
    slot?: string;
    onWaExpand?: Upstream.WaTreeItemProps['onwa-expand'];
    onWaAfterExpand?: Upstream.WaTreeItemProps['onwa-after-expand'];
    onWaCollapse?: Upstream.WaTreeItemProps['onwa-collapse'];
    onWaAfterCollapse?: Upstream.WaTreeItemProps['onwa-after-collapse'];
    onWaLazyChange?: Upstream.WaTreeItemProps['onwa-lazy-change'];
    onWaLazyLoad?: Upstream.WaTreeItemProps['onwa-lazy-load'];
}

export interface TreeItemProps extends TreeItemNativeProps {
    'onUpdate:expanded'?: (value: WaTreeItem['expanded']) => void;
    'onUpdate:selected'?: (value: WaTreeItem['selected']) => void;
}

export interface ZoomableFrameNativeProps extends Omit<
    HTMLAttributes,
    | 'src'
    | 'srcdoc'
    | 'allow'
    | 'allowfullscreen'
    | 'loading'
    | 'name'
    | 'referrerpolicy'
    | 'sandbox'
    | 'label'
    | 'zoom'
    | 'zoom-levels'
    | 'zoomLevels'
    | 'without-controls'
    | 'withoutControls'
    | 'without-interaction'
    | 'withoutInteraction'
    | 'with-theme-sync'
    | 'withThemeSync'
    | 'dir'
    | 'lang'
    | 'onLoad'
    | 'onError'
> {
    src?: WaZoomableFrame['src'];
    srcdoc?: WaZoomableFrame['srcdoc'];
    allow?: WaZoomableFrame['allow'];
    allowfullscreen?: WaZoomableFrame['allowfullscreen'];
    loading?: WaZoomableFrame['loading'];
    name?: WaZoomableFrame['name'];
    referrerpolicy?: WaZoomableFrame['referrerpolicy'];
    sandbox?: WaZoomableFrame['sandbox'];
    label?: WaZoomableFrame['label'];
    zoom?: WaZoomableFrame['zoom'];
    'zoom-levels'?: WaZoomableFrame['zoomLevels'];
    zoomLevels?: WaZoomableFrame['zoomLevels'];
    'without-controls'?: WaZoomableFrame['withoutControls'];
    withoutControls?: WaZoomableFrame['withoutControls'];
    'without-interaction'?: WaZoomableFrame['withoutInteraction'];
    withoutInteraction?: WaZoomableFrame['withoutInteraction'];
    'with-theme-sync'?: WaZoomableFrame['withThemeSync'];
    withThemeSync?: WaZoomableFrame['withThemeSync'];
    dir?: WaZoomableFrame['dir'];
    lang?: WaZoomableFrame['lang'];
    slot?: string;
    onLoad?: Upstream.WaZoomableFrameProps['onload'];
    onError?: Upstream.WaZoomableFrameProps['onerror'];
}

export interface ZoomableFrameProps extends ZoomableFrameNativeProps {}
