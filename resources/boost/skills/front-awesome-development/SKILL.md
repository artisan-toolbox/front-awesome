---
name: front-awesome-development
description: Use Front Awesome Vue components in a Laravel and Inertia application with Vite, Web Awesome, Tailwind CSS, VueUse, and Mosaicast.
---

# Front Awesome development

Front Awesome provides reusable Vue components and Laravel frontend integrations that complement Inertia.

## Install and use

Start in an existing Laravel 13 application with PHP 8.5, Inertia 3, Vue 3.5, Tailwind 4, Vite, and Node.js 24.11 or later. Front Awesome's `1.x` branch is a development preview without a stable Composer release. Check the installed Composer version and its `package.json` exports before choosing an API. Older preview revisions may not include the Vite plugin or shared branding entries below.

1. To opt into the `1.x` preview, run `composer require 'artisan-toolbox/front-awesome:^1.0@dev'` in the application root before installing frontend dependencies. Keep the stability exception scoped to this package. When a compatible stable release is available, use its documented stable constraint instead.
2. Declare both frontend packages in the application's `package.json`. Mosaicast is a peer dependency of Front Awesome. Run `npm install --install-links ./vendor/artisan-toolbox/front-awesome ./vendor/artisan-toolbox/mosaicast` from the application root. Keep `install-links=true` in the application's `.npmrc` so `npm ci` uses the same mode.
3. Add `frontAwesome()` from `@artisan-toolbox/front-awesome/vite` alongside `@vitejs/plugin-vue` in the application's Vite plugins. It recognizes `wa-` custom elements automatically and preserves existing custom element matchers and Vue compiler options.
4. Import `@artisan-toolbox/front-awesome/styles.css` after Tailwind in the application's CSS entry. If the application needs the standard Web Awesome stylesheet, import `@artisan-toolbox/front-awesome/web-awesome.css` from the JavaScript entry.
5. Import `@artisan-toolbox/front-awesome/components/Button.vue` from a Vue page. Pass the label through the default slot and use Web Awesome attributes such as `variant="brand"`.

Run the application's `npm run build`, open the page with the button, and confirm that its label and brand styling appear. The application compiles the Vue and CSS sources through Vite. For SSR, include `@artisan-toolbox/front-awesome` in `ssr.noExternal` so Vite processes the Vue files. The button loads its Web Awesome element in the browser.

Use the application's Web Awesome theme and `--wa-*` tokens. Keep theme selection and token overrides in the application.

Add `frontAwesome()` from `@artisan-toolbox/front-awesome/vite` to the application's Vite plugins. It uses `@web.awesome.me/webawesome-pro` for Front Awesome imports when the application has Pro installed and uses Core otherwise. Keep the application's direct Web Awesome imports pointed at the edition it uses.

## Integrations

Import `createFrontAwesome` from `@artisan-toolbox/front-awesome` and register it with `app.use(createFrontAwesome())` in Inertia's `withApp` hook. It registers Mosaicast, adds the Web Awesome toast stack to `document.body`, and listens for Mosaicast events and Inertia flash. To receive private broadcasts, pass the configured Echo instance in `createFrontAwesome({ mosaicast: { echo } })`.

To show a toast from Vue, import `useToast` from `@artisan-toolbox/front-awesome` and call `useToast().show(message, options)` from a component. Use `$frontAwesome.toast.show(message, options)` in templates or `this.$frontAwesome.toast.show(message, options)` in the Options API. Front Awesome registers its Vue global services under `$frontAwesome`.

The root package import provides the Vue types. If a separate TypeScript project does not include the app entry point, import `@artisan-toolbox/front-awesome` in a `.d.ts` file included in that project. See the documentation for editor and ESLint setup.

In Laravel, use the `ArtisanToolbox\FrontAwesome\Facades\Toast` methods `brand($message)`, `success($message)`, `warning($message)`, `danger($message)`, or `neutral($message)` to start a toast factory. Chain `duration()`, `icon()`, `size()`, or `allowHtml()` to set options. Finish with `dispatch()` for Mosaicast or `flash()` for the next Inertia response after a redirect. For example, use `Toast::success($message)->flash()`. Use `WebAwesome\Size` for size and a `WebAwesome\ToastIcon` for structured icons. Enable HTML only for trusted markup.

To change the default icons for toasts sent from Laravel, run `php artisan vendor:publish --tag=front-awesome-config` and edit `webawesome.toast.icons` in `config/front-awesome.php`. Set a variant to `null` to disable its default. An explicit toast icon takes priority. For toasts created in Vue, pass `icon` to `show()` when you want one.

[Front Awesome documentation](https://atb.dev.br/docs/front-awesome/)

## Web Awesome component imports

The Web Awesome wrappers live under `components/WebAwesome`. Import `Button`, `ButtonGroup`, `Input`, `Page`, `Icon`, and their prop types from `@artisan-toolbox/front-awesome/components/WebAwesome`, or import an individual wrapper such as `@artisan-toolbox/front-awesome/components/WebAwesome/Input.vue`. Existing `components` named imports and direct `.vue` imports remain available. `Appearance` stays in `@artisan-toolbox/front-awesome/components` because it controls the application appearance.

## Page layouts

Use the `Page` wrapper when arranging a full application layout. It is a source preview; confirm that the Composer-installed package exports `components/Page.vue` before use. The published `1.0.0-alpha.1` archive lacks this wrapper. Refresh the frontend copy after updating Composer.

After installation and Web Awesome style setup, add this to a Vue page:

```vue
<template>
    <Page mobile-breakpoint="600px">
        <header slot="header">
            <button type="button" data-toggle-nav>Menu</button>
            Project
        </header>
        <div slot="navigation"><a href="#content">Dashboard</a></div>
        <main id="content"><h1>Dashboard</h1></main>
        <footer slot="footer">Project footer</footer>
    </Page>
</template>

<script setup>
import { Page } from '@artisan-toolbox/front-awesome/components/WebAwesome';
</script>
```

Build the application and open the page. The header, navigation, main content, and footer share one layout. Below 600px of page width, Menu opens the same navigation in a drawer. Page registers `wa-page` after browser mount and adds no styles, classes, theme, or application layout policy.

Place native `slot="header"`, `slot="navigation"`, and other region attributes on elements inside Vue's default slot. Use semantic `main`, `header`, and `footer` elements. Do not use `slot="main"` or Vue `#header` templates. Keep one navigation tree. Native `menu` replaces the responsive navigation behavior.

Use `mobile-breakpoint` as the layout input and read the native `view` attribute as output. Use `navigation-placement="end"` for the mobile drawer's end placement. Bare `nav-open` and `disable-navigation-toggle` flags and bound false values preserve native boolean presence. Native toggles and dismissal change the element state; there is no `v-model` binding, and view changes close navigation. When `disable-navigation-toggle` is omitted, Web Awesome detects custom toggles and navigation content. `disable-sticky="header aside"` disables those sticky regions, and `nonce` is forwarded for CSP.

Import `PageProps` from the root or either component barrel for upstream-derived options and HTML attributes. Direct `components/Page.vue` and `components/WebAwesome/Page.vue` imports also work. Native drawer methods remain on the rendered `wa-page` element after `customElements.whenDefined('wa-page')` resolves. See the [Page layout guide](https://atb.dev.br/docs/front-awesome/page/) for required styles, all regions, and responsive width recipes.

## Label content and show contextual help

The updated `1.x` development preview exports unstyled `Tag` and `Tooltip` wrappers. Confirm these exports exist in the installed revision. Import both from `@artisan-toolbox/front-awesome/components/WebAwesome`. Each also has direct `components/WebAwesome/<Name>.vue` and `components/<Name>.vue` exports. Import `TagProps` and `TooltipProps` from the package root or either component barrel to type options.

After the installation above, render this in a Vue page:

```vue
<template>
    <a id="order-status" href="/orders">
        <Tag variant="success" size="s" pill>Order ready</Tag>
    </a>
    <Tooltip for="order-status" :show-delay="0">
        The order is ready. Open the order list for details.
    </Tooltip>
</template>

<script setup>
import { Tag, Tooltip } from '@artisan-toolbox/front-awesome/components/WebAwesome';
</script>
```

The page shows a small success tag. Hovering or focusing the link shows the help text. The application owns links, colors, spacing, IDs, and theme tokens. The wrappers add no classes, styles, or visual defaults. Tag's default slot is its label. Setting `with-remove` shows the native remove button and emits the original `wa-remove` Event. Remove the item in application state if desired. The native event alone does not delete the tag.

The opt-in shared Tailwind theme restores the native tag host padding and border that Preflight resets. Application padding and border utilities still take precedence. Keep icon and label spacing in your application composition rather than changing the wrapper's defaults.

Tooltip's default slot is its noninteractive body. Its `for` prop references a separate target ID in the same document or shadow root. Mount the target with the tooltip. If a missing target appears later, change `for` to bind it. Retargeting and unmounting remove the tooltip's `aria-labelledby` contribution from the old target. Keep interactive actions outside the tooltip.

Use bare booleans or bound true and false for `pill`, `with-remove`, `disabled`, `open`, and `without-arrow`. Numeric `showDelay`/`show-delay` and `hideDelay`/`hide-delay` aliases preserve zero. Omitting delays preserves native defaults. Listen for `@wa-show`, `@wa-after-show`, `@wa-hide`, and `@wa-after-hide`; callbacks receive the original native Event and retain cancellation. `open` is a native property, not a `v-model:open` binding.

For manual control, set `trigger="manual"`. A Vue component ref is a Vue instance. Read its `$el`, verify it is an HTMLElement, await `customElements.whenDefined('wa-tooltip')` and the native host's `updateComplete`, then call native `show()` or `hide()`. These methods are not exposed directly on the Vue instance. Do not await a canceled or disabled native transition as though its promise must settle.

Read the [Tag example](https://atb.dev.br/docs/front-awesome/web-awesome/components/feedback#tag) and [Tooltip example](https://atb.dev.br/docs/front-awesome/web-awesome/components/feedback#tooltip).

## Show interactive contextual content

Use the source-preview `Popover` wrapper for contextual content that contains links or buttons. Confirm that the Composer-installed revision exports it. Import `Popover` and `Button` from `@artisan-toolbox/front-awesome/components/WebAwesome`. Direct `components/Popover.vue` and `components/WebAwesome/Popover.vue` imports also work. Import `PopoverProps` from the root or either component barrel.

After the installation and stylesheet setup above, add this to a Vue page:

```vue
<template>
    <Button id="component-help" type="button" aria-haspopup="dialog">About this component</Button>
    <Popover for="component-help" placement="bottom-start">
        <p>Read the component guide before choosing its options.</p>
        <a href="https://atb.dev.br/docs/front-awesome/web-awesome/components/helpers#popover">
            Open the Popover guide
        </a>
        <button type="button" data-popover="close">Close</button>
    </Popover>
</template>

<script setup>
import { Button, Popover } from '@artisan-toolbox/front-awesome/components/WebAwesome';
</script>
```

Build the application and open the page. Clicking the button opens the panel. Tab reaches its link and close button. Escape closes the panel and returns focus to the trigger. The native `data-popover="close"` hook also closes it. Outside clicks dismiss the panel. The application owns the trigger's accessible name, ARIA state, content, and styling. Popover does not set trigger ARIA attributes or add wrapper classes, styles, or visual defaults.

Place the focusable trigger before the Popover in the same document or shadow root. Use `Button` with `type="button"` and no `href`, or a native button. A link trigger also navigates when clicked. The `for` option binds an existing target ID. If a missing target appears later, change `for` to bind it. Retargeting and unmounting remove the old target listener.

The default slot supports interactive content. Native `placement`, numeric `distance` and `skidding`, and bare or bound `open` and `without-arrow` options pass through. Omitting options preserves upstream defaults. The original `@wa-show` and `@wa-hide` Events remain cancelable. `@wa-after-show` and `@wa-after-hide` signal completed transitions. `open` is native state, without a `v-model:open` contract.

For imperative control, use the Vue instance's `$el` after `customElements.whenDefined('wa-popover')` and the native host's `updateComplete`. Call the native `show()` and `hide()` methods on that host. A canceled transition suppresses its after event, so do not await its native promise as though it must settle. Initially open panels follow the installed Web Awesome version's initial-open behavior. Use an ordinary trigger action when relying on normal focus and dismissal lifecycle behavior.

Read the [Popover source preview](https://atb.dev.br/docs/front-awesome/web-awesome/components/helpers#popover) for the public native contract and examples.

## Display an icon

After installation, import `Icon` from `@artisan-toolbox/front-awesome/components/WebAwesome`. It also has direct `components/WebAwesome/Icon.vue` and `components/Icon.vue` exports. Import `IconProps` from the package root or either component barrel when typing options.

For the custom icon example, create `public/icons/status.svg` in the Laravel application with this trusted SVG before opening the page.

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">
    <path fill="currentColor" d="M0 0h16v16H0z" />
</svg>
```

```vue
<template>
    <Icon name="house" label="Home" />
    <Icon src="/icons/status.svg" label="Status" />
</template>

<script setup>
import { Icon } from '@artisan-toolbox/front-awesome/components/WebAwesome';
</script>
```

The first icon uses Web Awesome's default icon library. The second loads a trusted application SVG at `public/icons/status.svg`. Run the application build, open the page, and confirm both SVGs appear. The wrapper registers `wa-icon` after browser mount and adds no classes, styles, theme, or library defaults. It inherits application color and font size. No `createFrontAwesome()` registration is required for the component alone.

Provide `label` for an informative icon. Omit it for a decorative icon next to equivalent text. Pass native options such as `canvas="auto"`, numeric `:rotate="45"`, `flip`, `animation`, `family`, `variant`, and `library`. Custom libraries retain their own family and variant names. Native name and library resolution takes precedence over `src` when both resolve. `swap-opacity` and the upstream deprecated `auto-width` support bare attributes and bound booleans. Prefer `canvas="auto"` over `auto-width` for new code.

Use `@wa-load` and `@wa-error` to receive the original native events. These events do not fire for sprite-sheet libraries. Keep custom library registration in the application using its selected Web Awesome edition. Selecting Web Awesome Pro does not supply Font Awesome Pro icon credentials. Read the [Icon guide](https://atb.dev.br/docs/front-awesome/icon/) for source, styling, and event examples.

## Select the application appearance

After installation, enable the controller with `app.use(createFrontAwesome({ appearance: true }))` in the application's existing plugin setup. Import `Appearance` from `@artisan-toolbox/front-awesome/components` or use the direct `@artisan-toolbox/front-awesome/components/Appearance.vue` export. Import the `AppearancePreference` type from the package root or `components` entry when typing preferences.

For the unreleased preview migration, replace `Theme` with `Appearance`, `components/Theme.vue` with `components/Appearance.vue`, `theme: true` with `appearance: true`, `ThemePreference` with `AppearancePreference`, and the `theme` slot value with `appearance`. Old-name aliases are not available.

```vue
<template>
    <Appearance v-slot="{ appearance, toggle, system }">
        <output>{{ appearance }}</output>
        <button type="button" @click="toggle">Toggle appearance</button>
        <button type="button" @click="system">Use system appearance</button>
    </Appearance>
</template>

<script setup>
import { Appearance } from '@artisan-toolbox/front-awesome/components';
</script>
```

Clicking **Toggle appearance** switches between light and dark and saves the choice under `localStorage.appearance`. Clicking **Use system appearance** follows the operating system. The `appearance` slot value and `AppearancePreference` type accept `system`, `light`, and `dark`. The slot also exposes `dark()` and `light()` actions. Without `appearance: true`, rendering `Appearance` throws an error. During SSR and the first hydration render, the slot reports `system`. After the browser mounts, it reports the current preference. The controller applies `.dark`, `.wa-light`, and `.wa-dark` before mount and shares state between Vue apps in the same document until the last app unmounts.

Run the application build and verify both buttons in the browser. Read the [appearance guide](https://atb.dev.br/docs/front-awesome/vue-plugin#add-a-theme-selector) for the complete contract.

## Bind a text input

Use `Input` from `@artisan-toolbox/front-awesome/components` after completing the installation above. Choose one value owner per input. Use unmodified `v-model` for a Vue value, or pass an Inertia `useForm` object with a dotted `field-name` for an existing text field.

```vue
<template>
    <Input v-model="search" label="Search" with-clear />
    <Input :form="form" field-name="users.0.name" label="Name" required />
</template>

<script setup>
import { ref } from 'vue';
import { useForm } from '@inertiajs/vue3';
import { Input } from '@artisan-toolbox/front-awesome/components';

const search = ref('');
const form = useForm({ users: [{ name: 'Ada' }] });
</script>
```

Typing updates `search` or `form.users[0].name`. External edits, replaced nested data, and `form.reset()` update the rendered value. Text fields accept strings, null, and undefined. Empty displays use an empty string. `type="number"` still produces text. Model modifiers, including `.number` and `.trim`, are unsupported and throw an error. Do not combine `v-model` with an Inertia form or pass a competing native `value`.

Use existing dotted object and array paths such as `users.0.name`. The wrapper rejects missing fields, object or numeric leaves, and Inertia helper or metadata paths. It never creates containers or clears server errors during typing.

Inertia errors use the flat `form.errors[fieldName]` entry. Nonempty string messages, including all messages in a configured string array, replace the hint and put the whole input in its theme's danger colors. Error text is escaped. Clear errors through Inertia to restore the caller's hint and normal appearance. Server errors do not set native custom validity, so a corrected value can be submitted again. Keep required, pattern, and other native constraints as appropriate. Inertia applications that use string-array errors must configure their `InertiaConfig.errorValueType` accordingly.

Pass Web Awesome attributes, native event listeners, and default slotted children through the wrapper. Named Vue slots map to Web Awesome slots, including `label`, `start`, `end`, and `hint`. `form="profile-form"` remains the native HTML form association when used with `v-model`. `defaultValue` sets the independent native reset baseline. A native form reset updates the bound Vue or Inertia value after Web Awesome resets the element.

Run the application's build, type in both inputs, call `form.reset()`, and set then clear a `users.0.name` error. Confirm that the values, hint, and danger appearance follow those changes. Read the [Input guide](https://atb.dev.br/docs/front-awesome/input/) for the full contract and the reusable `useFormBridge` composable.

## Shared application branding

Publish the editable branding file with `php artisan vendor:publish --tag=front-awesome-branding`. Import `@artisan-toolbox/front-awesome/tailwind.css` followed by `./branding.css` in the application's CSS entry. Import that CSS before `@artisan-toolbox/front-awesome/web-awesome-tailwind` in JavaScript. Keep the package adapters imported and edit only application branding. Ordinary republishing preserves your file.

Use the shared `@theme` variables for colors, fonts, spacing, radii, and complete shadows. The class-based dark variant follows `.dark`; `createFrontAwesome({ appearance: true })` manages `.dark`, `.wa-light`, and `.wa-dark`. Use one appearance controller per document. Add `fa-theme` to local branding scopes.

The published template includes complete commented ramps for neutral, success, warning, and danger customization through the physical `gray`, `green`, `yellow`, and `red` Tailwind palettes. Uncomment and replace all eleven stops of a ramp. These changes also affect utilities and other components that use that physical palette. Tailwind's native `neutral` palette remains separate from the gray-backed Web Awesome neutral role. Existing application-owned branding files are preserved when republishing. Compare the updated package template with your file and copy the desired examples without using `--force`.

For optional PrimeVue 4 styled mode, install `primevue` and `@primeuix/themes`, import `frontAwesomePrimeVueTheme` from `@artisan-toolbox/front-awesome/primevue`, and pass it as PrimeVue's `theme` option. Keep its named CSS layer and `.wa-dark` selector. Removing this import removes the optional adapter.

The updated development preview maps all 22 Aura physical color ramps to Tailwind and keeps Aura's component-specific shade choices. Surfaces use gray. Warning buttons, badges, and tags use orange, while warning messages and toasts use yellow. The template includes an orange ramp alongside yellow. Customize both to align their warning families. Recheck the rendered components, interaction states, and contrast in light and dark modes after changing palettes.

Read the [shared theme guide](https://atb.dev.br/docs/front-awesome/shared-theme/), [branding reference](https://atb.dev.br/docs/front-awesome/branding/), and [wa-page guide](https://atb.dev.br/docs/front-awesome/page/) for mappings, shadow limitations, and responsive recipes. Existing `styles.css` and `web-awesome.css` remain available for application-owned theme setups.

Run the application's `npm run build` after changing branding, then check the rendered button and light and dark modes in the browser.
