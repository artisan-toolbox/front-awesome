---
name: front-awesome-development
description: Use Front Awesome Vue and Inertia form controls, layouts, icons, Laravel-source translations, backend display and currency preferences, optional Dapter DataView, QZ printing, and theme integrations in Laravel applications.
---

# Front Awesome development

Front Awesome provides reusable Vue components and Laravel frontend integrations that complement Inertia.

## Install and use

Use Laravel 13.36 or later within Laravel 13.x, PHP 8.5, Inertia 3, Vue 3.5, Tailwind 4, Vite, and Node.js 24.11 or later. Front Awesome `1.x` is in beta. Its API can change before the first stable release. Check the installed Composer version and its `package.json` exports before choosing an API.

For applications on Laravel 13.0 through 13.35, update Laravel within 13.x before upgrading Front Awesome. It requires Illuminate Translation `^13.36` because earlier releases renumber numeric JSON translation keys.

1. To install the `1.x` beta, run `composer require 'artisan-toolbox/front-awesome:^1.0@beta' 'artisan-toolbox/dapter:^1.0.0-beta.1'` in the application root before installing frontend dependencies. Both prereleases need an explicit root requirement on a default-stable Composer host. Keep these stability exceptions scoped to the two packages. Dapter's JavaScript package is needed only for DataView. When compatible stable releases are available, use their documented stable constraints instead.
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

## Persist appearance, language, timezone, and currency

The beta includes backend preferences through `createPreferences`, `Timezone`, `make:preferences-store`, and `install:user-preferences`. Start after the installation and localization setup below, with Laravel sessions and the application's Inertia middleware enabled.

Append `ArtisanToolbox\FrontAwesome\Preferences\Http\Middleware\HandlePreferences::class` to the `web` middleware group in `bootstrap/app.php`. It resolves the active store, sets the request locale, and always shares `preferences`, including selectable `locales` and supported `timezones`, on Inertia responses. Render the request locale on `<html lang>` and put `@frontAwesomePreferences` before CSS in the root Blade head. The optional directive argument is a CSP nonce. Remove competing theme cookies and localStorage initialization from the application.

Inside `createInertiaApp`'s `withApp(app, { page })`, create `const preferences = createPreferences(page.props.preferences)` and pass it to `app.use(createFrontAwesome({ preferences, localization }))`. Import `createPreferences` from the package root or `@artisan-toolbox/front-awesome/preferences`. For an application that already owns transport and toast setup, `app.use(preferences); app.use(localization);` is supported in that order. A custom `preferences.key` requires the corresponding initial `page.props` key.

Import `Appearance`, `Language`, `Timezone`, and `Currency` from `@artisan-toolbox/front-awesome/components`. Direct `components/<Name>.vue` and `preferences/<Name>.vue` exports are available. These components add no markup. Appearance exposes `appearance`, `system()`, `light()`, `dark()`, and `toggle()`. Language exposes `locale`, `locales`, and `setLocale(locale)`. Timezone exposes `timezone`, `timezones`, and `setTimezone(timezone)`. All four expose `pending` and `error`; disable controls while pending and render errors accessibly. For example, `<Timezone v-slot="{ timezone, timezones, setTimezone, pending }"><select :value="timezone" :disabled="pending" @change="setTimezone($event.target.value)"><option v-for="zone in timezones" :key="zone" :value="zone">{{ zone }}</option></select></Timezone>` saves a selected zone. Supply a visible label in the application's complete form.

Actions send serial, CSRF-protected Inertia PATCH requests and return to the current page with component state, scroll, query, and fragment preserved. The server validates exactly one preference before calling a store setter. Currency accepts a supported ISO 4217 code or null, with null as its default. Currency exposes `currency`, `currencies`, `setCurrency(currency)`, `pending`, and `error`. Only confirmed values update the document's appearance and HTML language, which drives Vue I18n and Web Awesome. `useLocalization().setLocale()` also persists when preferences are installed. A failed network response may follow a committed write; `usePreferences().refresh()` reconciles with the server. Cached/history visits reconcile the full server page, including translated PHP props, on supported Inertia 3.0 versions; explicit refresh reloads only the preference prop. Reconciliation preserves the current query, fragment, and browser history entry. Standalone localization and `appearance: true` retain browser-only behavior when preferences are absent.

The unreleased 1.x default `CookiePreferenceStore` saves each preference in a separate persistent cookie, independently of session expiry and login duration. Earlier betas default to `SessionPreferenceStore`; check that the installed source contains the cookie store before selecting it. Keep Laravel's `EncryptCookies` and `AddQueuedCookiesToResponse` web middleware enabled. Cookies are encrypted and signed, always HttpOnly, and inherit the cookie jar's path, domain, secure, and SameSite defaults from session configuration. `preferences.cookie_lifetime` is a positive integer number of minutes, defaulting to 525600 (365 days) after a write; reads do not renew it. Names use `{session.cookie}_front_awesome_{preferences.key}_{field}`. Keep application cookie names distinct within a shared scope. Null currency expires its cookie. Clearing site data, browser policies, or expiration removes saved choices.

On first reading an active legacy session, the cookie store moves its saved string fields into cookies and removes those session fields. Existing cookies take priority. Lost sessions cannot be recovered. If published configuration still selects `SessionPreferenceStore`, change `preferences.store` to `CookiePreferenceStore::class` to enable persistence. Explicitly select `SessionPreferenceStore` to keep temporary storage: regeneration retains choices, while invalidation or expiry clears them. That store still requires Laravel session blocking on all participating routes to prevent stale whole-session writes between tabs. Cookie writes affect only the selected field; concurrent writes to the same field follow response arrival order. Missing values resolve to system appearance, quality-negotiated supported `Accept-Language` with `app.locale` fallback, and `app.timezone`, without saving defaults.

For account storage, run `php artisan install:user-preferences --model='App\Models\User'` from the application root. Review the generated nullable JSON migration before running `php artisan migrate`. The installer never migrates or edits the model. Add `Preferences\Contracts\HasPreferences` and `Preferences\Concerns\InteractsWithPreferences` to the authenticatable model, then register it with `FrontAwesome::setPreferenceStore(User::class)` in `AppServiceProvider::boot()`. For an alternate account guard such as auth:staff, set preferences.guard to staff so reads and writes resolve the same user. Guests use persistent cookies; guest settings never overwrite account settings automatically. The trait merges one field using a fresh-row transaction, preserves unrelated JSON values, and hides the storage column from ordinary model serialization. Review production database behavior separately from SQLite coverage.

`front-awesome.preferences.key` defaults to `preferences` and names both the JSON column and Inertia shared prop, even when model storage is not selected. Choose an unused portable identifier before generating the migration. `preferences.store` selects a concrete store or authenticatable model. Generate a custom eight-method Request-aware implementation with `php artisan make:preferences-store TenantPreferencesStore`, then register its fully qualified class with `FrontAwesome::setPreferenceStore(...)`. The custom contract also includes getCurrency(Request): ?string and setCurrency(Request, ?string): void. The default namespace is `App\Http\Preferences`. All getters and setters receive the current Request; nullable getters use standard defaults. Never retain a request or account in process-global state.

Keep `app.timezone` fixed. The enabled-by-default `toPreferenceTimezone()` Carbon macro returns a converted copy without changing the instant or original object. Existing macros with that name are preserved; disable registration with `preferences.carbon_macro: false`. JavaScript's device zone may differ from the saved zone. `usePreferences().formatDate(date, options)` uses the confirmed locale and timezone; explicit options may override them. With localization installed after preferences, native Vue I18n `d(value, 'preference')` and `n(value, 'currency')` track confirmed timezone and currency. Null currency formats a decimal. Other configured named formats inherit missing timezone/currency properties, while explicit settings win. Unkeyed native d/n retain Vue I18n defaults. Browser ICU must support a chosen zone to format it.

Reload the page after changing each selector and confirm persistence. See the grouped [Preferences guides](https://atb.dev.br/docs/front-awesome/preferences), [language setup](https://atb.dev.br/docs/front-awesome/preferences/language), and [reference](https://atb.dev.br/docs/front-awesome/preferences/reference).

## Web Awesome component imports

The Web Awesome wrappers live under `components/WebAwesome`. The beta includes wrappers for all 73 Web Awesome Core 3.14 components. Confirm the installed revision before use. Import components such as `Checkbox`, `Select`, `Option`, `Dialog`, `Card`, `Button`, `ButtonGroup`, `Input`, `Page`, and `Icon`, and their prop types from `@artisan-toolbox/front-awesome/components/WebAwesome`, or import an individual wrapper such as `@artisan-toolbox/front-awesome/components/WebAwesome/Input.vue`. Existing `components` named imports and direct `.vue` imports remain available. `Appearance` stays in `@artisan-toolbox/front-awesome/components` because it controls the application appearance.

## Page layouts

Use the `Page` wrapper when arranging a full application layout. The beta exports `components/Page.vue`. Refresh the frontend copy after updating Composer.

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

Place native `slot="header"`, `slot="navigation"`, and other region attributes on elements inside Vue's default slot. Use semantic `main`, `header`, and `footer` elements. Do not use `slot="main"`. Vue named region slots such as `#header` are also supported. Keep one navigation tree. Native `menu` replaces the responsive navigation behavior.

Use `mobile-breakpoint` as the layout input and read the native `view` attribute as output. Use `navigation-placement="end"` for the mobile drawer's end placement. Bare `nav-open` and `disable-navigation-toggle` flags and bound false values preserve native boolean presence. Use `v-model:navOpen` to synchronize navigation with Vue state. Native toggles, dismissal, and responsive view changes update that model. The responsive `view` output is read-only. When `disable-navigation-toggle` is omitted, Web Awesome detects custom toggles and navigation content. `disable-sticky="header aside"` disables those sticky regions, and `nonce` is forwarded for CSP.

Import `PageProps` from the root or either component barrel for upstream-derived options and HTML attributes. Direct `components/Page.vue` and `components/WebAwesome/Page.vue` imports also work. Native drawer methods remain on the rendered `wa-page` element after `customElements.whenDefined('wa-page')` resolves. See the [Page layout guide](https://atb.dev.br/docs/front-awesome/web-awesome/components/layout#page) for required styles, all regions, and responsive width recipes.

## Label content and show contextual help

The `1.x` beta exports unstyled `Tag` and `Tooltip` wrappers. Confirm these exports exist in the installed revision. Import both from `@artisan-toolbox/front-awesome/components/WebAwesome`. Each also has direct `components/WebAwesome/<Name>.vue` and `components/<Name>.vue` exports. Import `TagProps` and `TooltipProps` from the package root or either component barrel to type options.

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

The opt-in shared Tailwind theme restores native host margins, padding, and borders across the Core and Pro catalogs where Preflight resets them. Application padding and border utilities still take precedence. Keep icon and label spacing in your application composition rather than changing the wrapper's defaults.

Tooltip's default slot is its noninteractive body. Its `for` prop references a separate target ID in the same document or shadow root. Mount the target with the tooltip. If a missing target appears later, change `for` to bind it. Retargeting and unmounting remove the tooltip's `aria-labelledby` contribution from the old target. Keep interactive actions outside the tooltip.

Use bare booleans or bound true and false for `pill`, `with-remove`, `disabled`, `open`, and `without-arrow`. Numeric `showDelay`/`show-delay` and `hideDelay`/`hide-delay` aliases preserve zero. Omitting delays preserves native defaults. Listen for `@wa-show`, `@wa-after-show`, `@wa-hide`, and `@wa-after-hide`; callbacks receive the original native Event and retain cancellation. Use `v-model:open` to synchronize Vue state with native visibility.

For manual control, set `trigger="manual"`. A Vue component ref is a Vue instance. Read its `$el`, verify it is an HTMLElement, await `customElements.whenDefined('wa-tooltip')` and the native host's `updateComplete`, then call native `show()` or `hide()`. These methods are not exposed directly on the Vue instance. Do not await a canceled or disabled native transition as though its promise must settle.

Read the [Tag example](https://atb.dev.br/docs/front-awesome/web-awesome/components/feedback#tag) and [Tooltip example](https://atb.dev.br/docs/front-awesome/web-awesome/components/feedback#tooltip).

## Show interactive contextual content

Use the `Popover` wrapper for contextual content that contains links or buttons. Confirm that the Composer-installed revision exports it. Import `Popover` and `Button` from `@artisan-toolbox/front-awesome/components/WebAwesome`. Direct `components/Popover.vue` and `components/WebAwesome/Popover.vue` imports also work. Import `PopoverProps` from the root or either component barrel.

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

The default slot supports interactive content. Native `placement`, numeric `distance` and `skidding`, and bare or bound `open` and `without-arrow` options pass through. Omitting options preserves upstream defaults. The original `@wa-show` and `@wa-hide` Events remain cancelable. `@wa-after-show` and `@wa-after-hide` signal completed transitions. Use `v-model:open` for two-way native visibility.

For imperative control, use the Vue instance's `$el` after `customElements.whenDefined('wa-popover')` and the native host's `updateComplete`. Call the native `show()` and `hide()` methods on that host. A canceled transition suppresses its after event, so do not await its native promise as though it must settle. Initially open panels follow the installed Web Awesome version's initial-open behavior. Use an ordinary trigger action when relying on normal focus and dismissal lifecycle behavior.

Read the [Popover guide](https://atb.dev.br/docs/front-awesome/web-awesome/components/helpers#popover) for the public native contract and examples.

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

Use `@wa-load` and `@wa-error` to receive the original native events. These events do not fire for sprite-sheet libraries. Keep custom library registration in the application using its selected Web Awesome edition. Selecting Web Awesome Pro does not supply Font Awesome Pro icon credentials. Read the [Icon guide](https://atb.dev.br/docs/front-awesome/web-awesome/components/media#icon) for source, styling, and event examples.

## Select the application appearance

After installation, enable the controller with `app.use(createFrontAwesome({ appearance: true }))` in the application's existing plugin setup. Import `Appearance` from `@artisan-toolbox/front-awesome/components` or use the direct `@artisan-toolbox/front-awesome/components/Appearance.vue` export. Import the `AppearancePreference` type from the package root or `components` entry when typing preferences.

When migrating from earlier versions, replace `Theme` with `Appearance`, `components/Theme.vue` with `components/Appearance.vue`, `theme: true` with `appearance: true`, `ThemePreference` with `AppearancePreference`, and the `theme` slot value with `appearance`. Old-name aliases are not available.

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

## Bind controls and show validation

Use `Input` from `@artisan-toolbox/front-awesome/components` after completing the installation above. Choose one value owner per control. Use unmodified `v-model` for a Vue value, or pass an Inertia `useForm` object with a dotted `field` for existing form data. `field-name` remains a compatible alias. Input requires one binding; other data-entry wrappers also preserve their native unbound API.

```vue
<template>
    <Input v-model="search" label="Search" with-clear />
    <Input :form="form" field="users.0.name" label="Name" required />
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

Front Awesome 1.0.0-beta.4 introduced synchronization for Input, OtpInput, NumberInput, and Textarea for change-only autofill, Shadow DOM input, restored values, and silent native fills at the next render or ordinary form activation. Switching the bound Inertia form or field discards pending autofill from the previous binding, including when their values are equal. Later edits update the new binding. KnownDate, TimeInput, and Pro DateInput observe accepted public host values without coercing silently edited segments or changing Date setter types. Keep tag drafts and selection search text separate from committed rich values. Custom scripts must update bound Vue or Inertia state directly; `form.submit()` and validation-blocked `requestSubmit()` can bypass observation. Public Web Awesome writes need their normal render before native validation.

For OTP, use OtpInput with a stable `id`, `name`, visible `label`, and `autocomplete="one-time-code"` inside a form. That autocomplete value is already the upstream default. Numeric mode uses one native text input with `inputmode="numeric"`, preserving codes such as `001234`; use `type="alphanumeric"` for letter-and-digit codes. For a plain Input, specify `type="text"`, `inputmode="numeric"`, `autocomplete="one-time-code"`, and your required length and pattern. Never use a numeric data model for OTP. The preview updates bound OTP state before `wa-complete` listeners; native autosubmit remains opt-in and cancelable. Use `username`, `current-password`, and `new-password` for their corresponding login or registration fields. Provider suggestions depend on their capabilities and settings; no extra vendor-specific attributes or automatic WebOTP request are required by these wrappers. Do not claim extension or SMS testing from synthetic events alone. See the [OTP example](https://atb.dev.br/docs/front-awesome/web-awesome/components/forms#otp-input).

Use existing dotted object and array paths such as `users.0.name`. The wrapper rejects missing fields, object or numeric leaves, and Inertia helper or metadata paths. It never creates containers or clears server errors during typing.

Inertia errors use the flat `form.errors[fieldName]` entry. Nonempty string messages, including all messages in a configured string array, replace the hint and put the whole input in its theme's danger colors. Error text is escaped. Clear errors through Inertia to restore the caller's hint and normal appearance. Server errors do not set native custom validity, so a corrected value can be submitted again. Keep required, pattern, and other native constraints as appropriate. Inertia applications that use string-array errors must configure their `InertiaConfig.errorValueType` accordingly.

Pass Web Awesome attributes, native event listeners, and default slotted children through the wrapper. Named Vue slots map to Web Awesome slots, including `label`, `start`, `end`, and `hint`. `form="profile-form"` remains the native HTML form association when used with `v-model`. `defaultValue` sets the independent native reset baseline. A native form reset updates the bound Vue or Inertia value after Web Awesome resets the element.

Run the application's build, type in both inputs, call `form.reset()`, and set then clear a `users.0.name` error. Confirm that the values, hint, and danger appearance follow those changes. Read the [Forms binding guide](https://atb.dev.br/docs/front-awesome/web-awesome/components/forms#use-v-model) for live examples, value domains, manual validation, and the reusable `useFormBridge` composable.

The shared binding covers Input, Checkbox, Switch, RadioGroup, ColorPicker, KnownDate, NumberInput, OtpInput, Rating, Select, Slider, TagInput, Textarea, TimeInput, and the Pro Combobox, DateInput, DatePicker, and FileInput. Bind the owning group, not its Radio or Option children. CheckboxGroup is a grouping container; bind its individual Checkbox controls.

Use boolean fields for Checkbox and Switch, finite numbers for Rating and Slider, and `File[]` for FileInput. NumberInput remains `string | null`. Single Select and Combobox fields must accept `string | null`; multiple fields must accept `string[] | null`. Bound null clears current selection while preserving reset defaults; multiple mode normalizes an empty selection to an empty array. Date controls can accept Dates but commit strings, and TagInput commits string arrays. Field types must accept both the setter input and native output. Collection values must contain supported entries at every array position. Sparse arrays are rejected; an empty array remains valid where the control accepts a collection. Never combine a primary model with `:form`, or supply a competing current `value`, `checked`, or `files` prop. Native reset defaults are separate inputs.

All bound data-entry controls show the flat `form.errors[field]` messages and danger appearance. Errors clear when the application clears them, not automatically on input. For a Vue-only model, pass `:failed="true"` for danger appearance or a nonempty string or string array for appearance and escaped messages. `false` or an empty array clears only manual validation. Vue Boolean prop casting treats a bare `failed` and `:failed="''"` as true. Manual false cannot hide server errors. Rating and DatePicker render messages outside their interactive host because upstream has no hint slot. A stable presentation element preserves their native host and focus when validation is activated later. Its inactive mode uses `display: contents` without group semantics. Their component ref's `$el` still returns the native host. DatePicker contributes no native FormData entry. Some native focused controls do not forward host ARIA attributes to their internal input; inspect actual focused semantics in accessibility-sensitive compositions.

Import `useFormBridge` from `@artisan-toolbox/front-awesome` for a custom text control. Its writable `value` routes edits to the active owner; `errors` and `invalid` expose presentation state. The generic overload accepts separate `acceptsWrite` and `acceptsRead` guards for non-text values. Their predicates infer both value domains even when the emit callback ignores its argument; omitting both guards keeps the legacy text overload. With `optional: true`, inspect the discriminated `source` or `isBound` before accessing `value`. Your custom control owns escaped error rendering, its label, ARIA relationships, and styles. See the runnable custom-control example in the Forms guide.

## Synchronize component state

Use `v-model:page` on Pagination, `v-model:active` on TabGroup or Stepper, `v-model:open` on overlays, and `v-model:navOpen` on Page. Native events and their cancellation remain intact. Modifiers are unsupported. Omitted models preserve native uncontrolled behavior. Read the [complete named model reference](https://atb.dev.br/docs/front-awesome/web-awesome/components#named-models) before choosing other state ports, including DataGrid, media, and secondary form-control state. DataGrid pages are zero-based; Pagination pages are one-based. Browser playback policy still applies to Video.

## Shared application branding

Verify slotted Tailwind utilities as well as native parts. Web Awesome 3.14 AccordionItem, Card, Details, Dialog, Divider and Drawer use a local `--spacing` property. Tailwind uses the same name for numeric spacing. Container values can change padding and gaps in slotted content; the shared theme does not rename either public input. Review local `fa-theme` scopes before adopting those containers, and do not add per-container CSS resets or mutate shadow internals to conceal a mismatch.

Use slotted button text or a labeled Icon for an accessible name. In the installed 3.14 native Button, host attributes are not all forwarded to its internal focusable button. Keep native controls when a custom disclosure or toggle needs `aria-expanded` or `aria-pressed` directly on that focusable element. Check the actual accessible tree rather than assuming a host attribute reaches the control.

Publish the editable branding file with `php artisan vendor:publish --tag=front-awesome-branding`. Import `@artisan-toolbox/front-awesome/tailwind.css` followed by `./branding.css` in the application's CSS entry. Import that CSS before `@artisan-toolbox/front-awesome/web-awesome-tailwind` in JavaScript. Keep the package adapters imported and edit only application branding. Ordinary republishing preserves your file.

Use the shared `@theme` variables for colors, fonts, spacing, radii, and complete shadows. The class-based dark variant follows `.dark`; `createFrontAwesome({ appearance: true })` manages `.dark`, `.wa-light`, and `.wa-dark`. Use one appearance controller per document. Add `fa-theme` to local branding scopes.

To use the scrollbar directive, load the shared theme and install `createFrontAwesome()` to register `v-scrollbar`. Apply it to a named HTML element with a bounded size and `overflow: auto` or `overflow: scroll`. Bare `v-scrollbar` defaults to neutral. In the existing plugin registration, set `createFrontAwesome({ scrollbar: { defaultVariant: 'brand' } })` to choose the default for that app, including the DataView table, print preview, and permission editor. The modifiers `.neutral`, `.brand`, `.success`, `.warning`, and `.danger` override the app default.

Pass optional OverlayScrollbars settings with `v-scrollbar.brand="{ scrollbars: { autoHide: 'leave' } }"`. Import `ScrollbarOptions` for a typed binding. The original element receives native scroll events and keeps its scroll position when options change. The fallback uses the browser scrollbar for server rendering, native form controls, and forced colors. Use `fa-scrollbar` or a variant class such as `fa-scrollbar-brand` for CSS-only styling. See the [scrollbar guide](https://atb.dev.br/docs/front-awesome/scrollbar/).

In the current source preview, pass `v-scrollbar="{ shadows: true }"` on a bounded scroll region to fade the edges with more content. Set `--fa-scrollbar-shadow-color` or `--fa-scrollbar-shadow-size` on the region to override the local surface color or `2rem` fade size.

The published template includes complete commented ramps for neutral, success, warning, and danger customization through the physical `gray`, `green`, `yellow`, and `red` Tailwind palettes. Uncomment and replace all eleven stops of a ramp. These changes also affect utilities and other components that use that physical palette. Tailwind's native `neutral` palette remains separate from the gray-backed Web Awesome neutral role. Existing application-owned branding files are preserved when republishing. Compare the updated package template with your file and copy the desired examples without using `--force`.

For optional PrimeVue 4 styled mode, install `primevue` and `@primeuix/themes`, import `frontAwesomePrimeVueTheme` from `@artisan-toolbox/front-awesome/primevue`, and pass it as PrimeVue's `theme` option. Keep its named CSS layer and `.wa-dark` selector. Removing this import removes the optional adapter.

The beta maps all 22 Aura physical color ramps to Tailwind and keeps Aura's component-specific shade choices. Surfaces use gray. Warning buttons, badges, and tags use orange, while warning messages and toasts use yellow. The template includes an orange ramp alongside yellow. Customize both to align their warning families. Recheck the rendered components, interaction states, and contrast in light and dark modes after changing palettes.

Read the [shared theme guide](https://atb.dev.br/docs/front-awesome/shared-theme/), [branding reference](https://atb.dev.br/docs/front-awesome/branding/), and [wa-page guide](https://atb.dev.br/docs/front-awesome/web-awesome/components/layout#page) for mappings, shadow limitations, and responsive recipes. Existing `styles.css` and `web-awesome.css` remain available for application-owned theme setups.

Run the application's `npm run build` after changing branding, then check the rendered button and light and dark modes in the browser.

## Use the complete Core catalog

The beta includes all Core wrappers. All Core wrappers share the `components/WebAwesome` and `components` barrels and both direct `.vue` export paths. Prop types such as `CheckboxProps` and `SelectProps` are available from the root and component barrels. The 17 Pro-only wrappers use the separate `@artisan-toolbox/front-awesome/components/WebAwesome/Pro` barrel. Their prop types are exported there, and their direct `components/<Name>.vue` and `components/WebAwesome/<Name>.vue` paths remain available. This separation keeps Core imports usable without a Pro installation.

After the installation and style setup above, place this in a Vue page:

```vue
<template>
    <Checkbox v-model="subscribed">
        Email updates
        <template #hint>You can change this later.</template>
    </Checkbox>
    <Select v-model="delivery" label="Delivery">
        <Option value="weekly">Weekly</Option>
        <Option value="monthly">Monthly</Option>
    </Select>
    <p>{{ subscribed ? 'Subscribed' : 'Unsubscribed' }}. Delivery {{ delivery }}.</p>
</template>

<script setup>
import { ref } from 'vue';
import { Checkbox, Select, Option } from '@artisan-toolbox/front-awesome/components/WebAwesome';

const subscribed = ref(false);
const delivery = ref('weekly');
</script>
```

The page shows an unchecked checkbox and a weekly delivery choice. Changing either control updates the paragraph. Native `input` and `change` handlers receive the original event. Check its target type before reading values in TypeScript. Existing `Input` retains its required `v-model` or Inertia form contract. Other wrappers expose native values and events without requiring an Inertia form.

New wrappers accept Vue named slots as well as native `slot` attributes on default-slot children. Named text content receives a span so the browser can assign its slot. For structured content such as options, tabs and tree items, keep the native parent-child arrangement. Use a single native element or single-root component for named slot content.

Use `checked`, `selected` and `value` for current state. When upstream separates these from `defaultChecked`, `defaultSelected` or `defaultValue`, initial scalar inputs establish native reset attributes unless an explicit default overrides them. Complex values such as arrays, Dates, and FormData stay on current properties and retain native property-reset behavior. Supply a supported native default explicitly when the reset must restore a complex current value. Do not pass arrays to a textual `defaultValue`. Subsequent current-state changes do not redefine reset defaults. Pass the native `form` attribute as a form ID string. Rich values, element references and callbacks reach native properties after browser registration. Methods remain on the component ref's `$el`; wait for `customElements.whenDefined()` before invoking them.

The application owns its theme, classes, layout and loading decisions. Browse the [component groups and working Vue examples](https://atb.dev.br/docs/front-awesome/web-awesome/components/).

## Use a licensed Pro component

Configure the official Pro registry and its environment-based token, then install `@web.awesome.me/webawesome-pro` in the consuming application. Keep tokens outside browser code. Select `frontAwesome({ webAwesome: 'pro' })` in Vite and use that same edition for direct upstream imports.

```vue
<template>
    <DatePicker v-model="selected" />
    <p>Selected date {{ selected }}</p>
</template>

<script setup>
import { ref } from 'vue';
import { DatePicker } from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';

const selected = ref('2026-11-09');
</script>
```

The calendar highlights November 9, 2026. Selecting another day updates the paragraph. If the application imports this wrapper without its licensed dependency, Front Awesome reports that the component requires Web Awesome Pro during the build and through Vite's development error reporting. The wrapper does not supply a license or silently substitute a Core element.

## Translate browser UI from Laravel

Localization is optional. The beta exports `./localization`, `components/Language.vue`, and the `front-awesome:export-translations` command. Follow the [Laravel-source localization guide](https://atb.dev.br/docs/front-awesome/localization) for the complete procedure.

Keep messages in Laravel PHP and JSON language files. The package always exports its own English, Spanish, and Brazilian Portuguese messages. In `config/front-awesome.php`, set `translations.include_application` to `true` to include eligible application messages for selected languages and the configured fallback. The default `translations.locales` value is `['*']`, which discovers eligible locale directories, JSON files, and namespace overrides. An explicit ordered list such as `['en', 'es']` offers only English and Spanish, in that order. It does not add to the built-in choices. Empty lists, mixed wildcard and locale lists, and partial globs are invalid. The wildcard must stand alone. Published Front Awesome overrides can add discovered languages even with application export disabled, while application text remains excluded globally. Application locale directories, JSON files, and other namespace overrides participate in discovery when application export is enabled. File and key filters are optional. Treat exported language files as public browser data. Optional `include_files` and `exclude_files` use lang-relative globs. `include_regex` and `exclude_regex` accept `path` and `file` lists of delimited PCRE expressions. `path` matches lang-relative paths and `file` matches basenames. Inclusion rules combine with OR, exclusions win, and application filters cannot remove mandatory package text.

In the root Blade document, render `<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">`. In the existing Vite plugin, enable `frontAwesome({ webAwesome: 'core', translations: true })`, or select the installed licensed Pro edition. A custom executable or directory uses `translations: { php, artisan, cwd }`. Vite automatically exports before normal startup and builds.

Development exports follow creation, edits, atomic replacement, and deletion of language files and `config/front-awesome.php`, including deletion and recreation of their directories. Set `translations.cwd` to the Laravel application root when it differs from the Vite root. Starting in 1.0.0-beta.6, the exporter checks PHP and JSON files under the language roots and the configuration path independently of Vite's notifications. Unrelated configuration files do not trigger translation exports.

On Windows, Front Awesome 1.0.0-beta.6 briefly retries replacing generated translation files when a reader keeps a file open. Close any process that holds a generated file persistently, then run the export again.

For a programmatic Vite server, await `server.close()` before removing its working directory. Shutdown cancels queued exports, aborts the active exporter, and waits for its process and output streams to close. Intentional shutdown cancellation does not report a translation error.

In the frontend entry, install the catalog through the existing Front Awesome plugin call:

```js
import { createFrontAwesome } from '@artisan-toolbox/front-awesome';
import { createLocalization } from '@artisan-toolbox/front-awesome/localization';
import catalog from './generated/front-awesome-translations.json';

const localization = createLocalization(catalog, {
    numberFormats: {
        en: { money: { style: 'currency', currency: 'USD' } },
        es: { money: { style: 'currency', currency: 'EUR' } },
        'pt-BR': { money: { style: 'currency', currency: 'BRL' } },
    },
});
app.use(createFrontAwesome({ localization }));
```

Use canonical browser tags such as `pt-BR` in Vue I18n `numberFormats` and `datetimeFormats`. The catalog and HTML controller own `locale`, `messages`, and `legacy`. The export fallback follows `APP_FALLBACK_LOCALE`, defaulting to `en` when unset; English remains the final package-text fallback. Add `/resources/js/generated/front-awesome-translations.*` to the consuming application's `.gitignore`. Before standalone `vue-tsc` on a clean checkout, run `php artisan front-awesome:export-translations`. Direct Artisan exports also require Node.js 24.11 or later and permission to start a subprocess on the asset host. They validate browser locale IDs with the shared Intl helper before changing either generated artifact, rejecting aliases such as iw/he that resolve to one locale. Configure `translations.node_binary` or pass `--node=/absolute/path/to/node`; Vite automatically supplies its own Node executable. PHP preference requests do not start Node. Its sibling generated declaration augments Vue I18n message keys. Named formats use Vue I18n's native schema augmentation.

Inside Vue setup, use `useLocalization()` from `@artisan-toolbox/front-awesome/localization` for readonly `locale`, locale descriptors, `t`, `n`, `d`, and `setLocale`. For example, an exported `lang/en/app.php` value `'welcome' => 'Welcome, :name!'` renders as `Welcome, Ana!` with `t('app.welcome', { name: 'Ana' })`. Laravel `:name`, `:Name`, and `:NAME` replacements and exact, interval, and implicit choice syntax remain valid. Use `t('app.documents', { count: 2 })` for choices. Source messages use Laravel syntax rather than native Vue I18n interpolation. Replacements are browser scalar values.

Regenerate the translation catalog and rebuild assets after updating Laravel. The exporter records whether the installed Laravel selector accepts whitespace before and inside plural conditions, so the browser matches that version. Older catalogs without this metadata retain the earlier strict condition syntax. Do not edit generated catalog metadata manually.

Compose controls with `Language` from `@artisan-toolbox/front-awesome/components`, or its direct `.vue` export. Its default slot receives `{ locale, locales, setLocale }`. The generated version 1 JSON `availableLocales` field supplies the ordered choices. The parser canonicalizes choices and rejects unknown or duplicate entries. Older version 1 catalogs without this optional field offer every catalog locale. Internal package catalogs always retain `en`, `es`, `pt_BR`, and the configured fallback even when hidden. For `['en', 'es']`, the selector omits Brazilian Portuguese while retaining its internal package data. `setLocale` accepts only selectable choices. Render one named button per descriptor, key it by `choice.locale`, and call `setLocale(choice.locale)`. The component adds no wrapper or style. HTML `lang` is the sole active-locale source, including direct changes and server-rendered languages hidden from the selector. Native Web Awesome follows that same HTML language. Canonical aliases such as `pt_BR` map to `pt-BR`. Standalone locale selection updates only the browser. Install the Preferences integration above for validated Inertia persistence and request locale selection.

Package overrides use `php artisan vendor:publish --tag=front-awesome-lang` and `lang/vendor/front-awesome/{locale}/printing.php`. Native Web Awesome language imports follow the selected edition. Its `pt` catalog supplies native text for `pt-BR`, with European wording and some untranslated strings. Do not describe native controls as fully Brazilian Portuguese.

Printing installed with both `printing` and `localization` translates package defaults, titles, errors, and live views. Explicit message overrides, supplied titles, printer names, and external literal errors remain literal. Settled `handle.finished` strings remain historical snapshots. A language change starts no connection, print job, preparation, submission, or retry. Standalone printing without localization keeps English defaults. See the [localization reference](https://atb.dev.br/docs/front-awesome/localization/reference) for the full contract.

## Review and print documents

The beta includes the printing suite under `@artisan-toolbox/front-awesome/printing`. Use QZ Tray 1.4 or later within 1.x for its `renderPrintRequest` frontend export. Follow the [printing guide](https://atb.dev.br/docs/front-awesome/printing) for installation and setup.

Printing is optional. Install the compatible QZ Tray Composer package first, then install its frontend from `file:vendor/artisan-toolbox/qztray`. Configure QZ certificate/signing endpoints through the QZ Tray package, run the QZ Tray desktop application, and install a printer before submitting real documents. Keep credentials and signing keys on the server. Applications without printing do not need this optional frontend peer.

Create one service for each Vue application and mount one drawer in its persistent layout:

```ts
import { createFrontAwesome } from '@artisan-toolbox/front-awesome';
import { createPrinting, PrintDrawer } from '@artisan-toolbox/front-awesome/printing';

const printing = createPrinting({
    storageKey: 'my-application.printing',
    previewOptions: { escpos: { widthDots: 576 } },
});
app.use(createFrontAwesome({ printing }));
// Render <PrintDrawer /> in the persistent application layout.
```

Use `usePrinting()` inside Vue setup, or retain the service created above. The root package does not import the QZ runtime. `PrintDrawer` also accepts `:service="printing"` for explicit ownership. With explicit ownership, dispose the service when its application unmounts. Drawer dismissal preserves queued jobs and the QZ connection.

For an existing response promise returning `{ invoice: string | string[] | null }`, queue a PDF without an await:

```ts
const handle = printing.pdfBase64(responsePromise, {
    key: 'invoice',
    title: 'Invoice',
    options: { copies: 1 },
});
const result = await handle.finished;
```

The drawer opens while the response loads. It then previews every file/page, lets the reader choose an available printer and settings, and submits only after their action. A selected `null` skips that step. Missing keys, inherited keys, dotted traversal, `undefined`, empty files, and malformed collections fail with a friendly message. `key` selects only an own top-level property. Without `key`, the payload itself must be a document. Do not persist document data.

The default workflow restores the last printer for each format. The operator reviews and clicks Print once for each document. Accepted submissions advance automatically, and successful completed jobs close without a final report. No document prints automatically. Set `autoAdvance: false` to pause after submission or `showSummary: true` to show a final report. Both options work on `createPrinting`, individual `job` calls, and format helpers. `handle.finished` always returns ordered results even when the report is hidden. Failed and unknown outcomes remain visible until reviewed.

Use `pdf(payload, { flavor: 'file' })` for PDF URLs, `escpos(payload)` for Base64 ESC/POS, and `zpl(payload)` for plain ZPL. Set `flavor: 'plain'`, `'hex'`, or `'file'` explicitly when needed. Arrays preserve file order. ESC/POS can mix command strings and QZ image records. PDF `dataOptions`, including page ranges, remain format-specific. Unsupported PDF preview transformations fail explicitly rather than claiming a matching preview.

For a shared response containing multiple document formats, call `job({ title, source: responsePromise, steps: [{ type: 'escpos', flavor: 'base64', key: 'receipt', title: 'Receipt' }, { type: 'pdf', flavor: 'base64', key: 'invoice', title: 'Invoice' }] })`. Jobs remain FIFO. Each step requires its own submission; no batching or automatic print occurs. Results preserve step order and report `submitted`, `skipped`, `cancelled`, `failed`, or `unknown` exactly once. `submitted` means QZ Tray accepted the request, not that paper physically printed.

`handle.cancel()` and service disposal settle pending work. An active send cannot reliably be recalled and therefore settles as `unknown`. Inspect QZ Tray and the physical printer before requesting another copy. The suite never automatically retries an ambiguous submission.

Configure `defaults` by format for printer and QZ options, `previewOptions` for renderer dimensions/density, and per-step `previewOptions` for overrides. Use localization for reactive package translations. Use `messages` on the service for literal overrides of visible interface and error text. The optional Drawer `messages` prop overrides presentation labels. Supply a `PrintBridge` with optional `prepare(document, previewOptions)`, plus `connect`, `getPrinters`, `render(document, previewOptions)`, and `print(request)` to integrate a different transport or simulate submissions. A simulated `print` must be clearly labeled in the application.

The default bridge materializes file URLs and image files into a detached byte snapshot once before review. Custom bridges that omit `prepare` must preserve the same document between preview and submission.

The Drawer exposes `preview`, `settings`, `settings-extra`, `summary`, and `footer` slots. Keep review and transport actions user-triggered. Raw requests show their source commands with a warning rather than pretending to render a page. Optional storage saves only printer/copy preferences by format, respects `storageKey`, and tolerates blocked or malformed browser storage. Set `storage: false` to disable it. The application still owns its branding and Web Awesome theme.

## Present Dapter results with DataView

Use the optional `@artisan-toolbox/front-awesome/data-view` entry when an application needs a table, grid, or list backed by an existing Dapter source. Front Awesome 1.0.0-beta.3 includes the three-layout renderer. Install Dapter 1.0.0-beta.1 through Composer first, then add `"@artisan-toolbox/dapter": "file:vendor/artisan-toolbox/dapter"` and run npm install. Dapter is optional for the other Front Awesome entries.

Start with the Front Awesome Vite and stylesheet setup above and a registered Dapter source named `Catalog` that returns rows such as `{ "id": 1, "name": "Notebook" }`. Complete [Dapter installation](https://atb.dev.br/docs/dapter/installation) before rendering the component.

```vue
<template>
    <DataView :adapter="catalog" :views="views" row-key="id" caption="Products">
        <template #cell-name="{ row }"><strong>{{ row.name }}</strong></template>
        <template #grid-item="{ row }"><article>{{ row.name }}</article></template>
    </DataView>
</template>
<script setup lang="ts">
import { useDataAdapter } from '@artisan-toolbox/dapter';
import { DataView, type DataViewViews } from '@artisan-toolbox/front-awesome/data-view';

function decodeRow(value: unknown) {
    if (!value || typeof value !== 'object' || !('id' in value) ||
        typeof value.id !== 'number' || !('name' in value) || typeof value.name !== 'string') {
        throw new Error('Invalid product');
    }
    return { id: value.id, name: value.name };
}
const catalog = useDataAdapter('Catalog', { decodeRow, protocol: 2, url: false });
const views = {
    table: { columns: [{ field: 'name', label: 'Name', orderBy: 'name' }], striped: true },
    grid: {},
} satisfies DataViewViews<typeof catalog.data[number]>;
</script>
```

The initial table displays Notebook in bold. The Grid control changes presentation without a second read. `orderBy` must name an advertised Dapter field alias. Omitting it leaves a presentation-only column even when its property name matches an orderable field. Use an `id` and `accessor(row)` for computed columns. Use `{ kind: 'display', id: 'actions', label: 'Actions' }` and `#cell-actions` for action cells. Object values need an explicit cell slot.

Declare layouts in display order. Grid and list each require `#grid-item` or `#list-item`. A single layout has no selector. Grid-only and list-only configurations need no columns. Row keys must be unique finite numbers or strings; pass a scalar property name or callback. Use `size="s"`, `"m"`, or `"l"`, table `striped` and `hover`, and column `align` of `start`, `center`, or `end`.

Front Awesome beta.8 renders PostgreSQL vector-only field searches. Enter a JSON array of the advertised number of finite numeric coordinates. For example, `[0, 1, 0]` submits a prepared three-dimensional vector. The hint shows the maximum inclusive L2 distance. Invalid dimensions or coordinates remain a local draft without an HTTP request. DataView preserves the source's declared result order and does not generate embeddings.

URL state and sharing remain owned by Dapter. With protocol 2 and URL persistence enabled, ordinary links hold a UUID whose requested state expires in localStorage. Use `catalog.share()` in an application control or a slot's `adapter.share()` for a portable link. The same borrowed handle supplies that function. Dapter checks the DataStore class version and turns a valid shared snapshot into a new local UUID. Missing or expired local state returns to defaults. DataView does not add another storage policy or share prop.

Front Awesome beta.3 uses Shift-click to add a second sort term. Front Awesome beta.8 uses Command-click on macOS and Control-click on Windows and Linux for header multi-sort. Configure `createFrontAwesome({ dataView: { multiSortKey: 'shift' } })` to select `auto`, `meta`, `ctrl`, `shift`, or `alt`. A plain click in a multi-term order selects that field alone. At its last allowed direction it restarts the clicked field rather than leaving a different column primary. A single-term order still cycles to clear. Modifier clicks at the last direction clear only their own term.

In beta.8, default sort icons use Font Awesome `classic` `solid` with `sort`, `sort-up`, and `sort-down`. In the development checkout, ascending uses `arrow-down-a-z`, descending uses `arrow-up-z-a`, and unsorted uses `up-down`. Configure `dataView.sortIcons.family` and `variant`, and override `ascending`, `descending`, or `unsorted` with `{ name: 'arrow-up' }` or a literal character such as `'↑'`. Icon objects can override their own family and variant. In the development checkout, multiple accepted field sorts show a direction arrow and a numbered square for each priority. The public Icon component requests Font Awesome classic solid square-1 through square-9. A numeric marker also works with a missing icon or a higher priority. The existing public Icon integration owns kit and source resolution. Strings are text, not HTML.

In beta.8, use `#head-name="{ name, sortDirection }"` for a column whose ID is `name`. `name` is its configured label. `sortDirection` is `null` when unavailable, `0` when unsorted, `1` ascending, or `-1` descending. The typed scope also provides `column`, the exact `adapter`, `view`, and `selection`. This content replaces the label, icon, and priority inside the built-in button, retaining keyboard/modifier handling and primary accepted `aria-sort`. The older `#header-name` full replacement remains supported and takes precedence. `useDataViewOptions()` exposes the resolved readonly plugin configuration without requiring Dapter in the base plugin entry.

Configure source, decoders, actions, URL state, live updates, polling, and infinite loading in `useDataAdapter`. Pass its exact handle as `adapter`. DataView rejects creator options and requires a keyed remount when replacing the handle. It has no `source` shorthand or top-level `columns` option. Borrow the same handle for sibling controls or another DataView.

The development checkout adds four standalone exports to the same data-view entry. Use `<DataViewSearch :adapter="catalog" />` for global search or add `field="name"` for a declared field search. Use `<DataViewFilter :adapter="catalog" field="shelf" filter="shelves" label="Shelf" />` when the source advertises the `shelves` filter on its `shelf` field. Omit `field` for a global filter. Controls render when the source offers their operation. Specify `size` for a different control size.

Pair `<DataViewStatus :adapter="catalog" />` with `<DataViewPagination :adapter="catalog" />` beneath your own result list. The summary uses accepted counts. When a reader navigates from a visible DataView footer to a shorter page, the footer keeps its position within the nearest scrolling container when space allows. The header or column headings provide the same reference for searches and sorts. Initial loads, background updates and infinite windows preserve the host application’s scrolling behavior. Numbered pages require offset navigation with a known matching count. Simple and cursor sources expose traversal, and infinite windows offer loading or recovery. In a DataView, set `hide-header` or `hide-footer` when supplying that region elsewhere. Keep a visible layout control in the application if users need to switch a hidden header's view. [Compose a ticket list](https://atb.dev.br/docs/front-awesome/data-view/layouts#compose-controls)

Front Awesome beta.8 includes the criteria editor, selection, grouping and localized paging controls. In the development checkout, the filter icon beside quick search opens **View options**. The dialog includes the search, filter, sort and paging sections the adapter supports. When multiple views are configured, switch among them directly in the toolbar. Use the compact badges below search to remove applied options individually. Read the current page in the footer. Numbered navigation adapts to its available width. Standalone pagination includes its own page settings dialog.

Use the default toolbar for global search, field searches with their permitted operators, all/any search matching, and finite field or global filters. Filter options preserve the value and type advertised by the source. Open the order editor (**Sort** in the development checkout) to replace, add, update, or remove a field term. Select a named preset when the offset source offers one. **Reset to source defaults** restores the initial query and paging. A custom `#toolbar` replaces those controls and keeps page settings available in the default footer. A custom `#filters` adds content after the toolbar.

To select records, add `selection="multiple"` and `v-model:selected-keys="selectedKeys"`, where `selectedKeys` is a ref containing an array of the row-key type. A bound model supplies the effective keys. Handle an update by assigning the keys your application accepts. Single selection uses the same model with `selection="single"`. Without a model the component stores its selection locally. All slots get the exact `adapter`, active `view`, and `selection` or null. Use `selection.keys` and `selection.rows` in accepted row order. `has(key)`, `set(key, selected)`, and `clear()` change only presentation. Multiple mode adds `setAllLoaded(selected)`, `allLoaded`, and `someLoaded`. Item and cell slots receive `row`, `index`, `rowKey`, and `selected`. Cell slots also receive `column` and `value`.

For a joined source, provide a unique occurrence key for each result. The component calls a key function with `(row, index)`. A key derived from the position can identify a different row after sorting. For example, group a category column with `{ field: 'category', label: 'Category', groupBy: true }`, or use a scalar accessor for a complex display value. One data column can span consecutive equal values in the table. Grid and list retain each occurrence.

Keep prefilled keys scoped to the current owner or tenant. The component prunes keys that leave the accepted result and withdraws them across observable authority loss. A newly mounted instance treats its supplied model as fresh preselection. For a write, read the current selection and action capability when the user submits, map the row to the advertised target operand, and supply the application's validated input. Use the Dapter outcome to report confirmation or uncertainty.

Use the optional localization service with the exported Laravel `front-awesome::data-view` messages. Without that service the controls use English. Return a label from `controlLabel(subject)` for a field, filter, typed option, or selectable row. Return `undefined` to use the standard label.

In the development checkout, tables show loading, empty-source, and no-match messages in one full-width row below the headings. Set `state-layout="replace"` to hide the table while displaying a message. To show loading placeholders, use `#skeleton="{ columns, index }"` and supply one `<td>` for each configured data column. DataView creates the row and the selection cell, and keeps the headings in both layouts. The slot index starts at zero. Set `:skeleton-rows="3"` to change the default of five. Enable `preserve-skeleton-rows` to match the last accepted page length during a read. A first load or a read after an empty page uses the configured count. [Show loading and empty table states](https://atb.dev.br/docs/front-awesome/data-view/layouts#table-feedback)

The `#pagination`, `#loading`, `#empty`, `#error`, and `#integration-error` slots replace their own regions. Use `#actions` and `#footer` for application-specific controls. Dapter owns URL restoration, live and polling configuration, and infinite loading. DataView reports available counts, offers a cursor restart when needed, and exposes explicit retry on a paused infinite window. [DataView guides](https://atb.dev.br/docs/front-awesome/data-view)

## User permission editor

Use `@artisan-toolbox/front-awesome/components/UserPermissionEditor.vue` when an Inertia application provides a permission catalog for an authenticated user. Publish the editor capability as the shared `userPermissionEditor` prop with `version: 1` and a same-origin `endpoint`. The backend must authorize every read and write.

Use `v-model:open` with `subject-id` and an optional `subject-label`. To reuse one modal for many rows, type a component ref with the root export `UserPermissionEditorHandle` and call `editor.value?.show({ subjectId: user.id, subjectLabel: user.name })`. Pass integer IDs outside JavaScript's safe range as strings. The editor loads the selected subject when opened and keeps filtered changes in the full draft.

Send permission groups with `kind: 'permissions'` and roles with `kind: 'roles'`. The editor shows them in separate sections and keeps draft changes when the operator selects a section in the sidebar. Permission rows show Allowed or Denied. Role rows show Assigned or Unassigned. The operator saves the draft explicitly.

To show decorative Font Awesome icons, return `iconFamily: 'classic'` on the GET response and an `icon` name such as `file-invoice` on a section or ability. Use lowercase names with hyphens between words. The application must provide the selected Font Awesome family through Web Awesome. Omit `iconFamily` to hide the catalog icons.

Closing the editor or selecting another subject with unsaved changes opens a discard confirmation. Keep editing or press Escape to return to the current draft.

Return a catalog and editable boolean values on GET, keyed by the subject's `user` query parameter. Accept a complete boolean map and its revision on PUT. Return `204` when saved and `409` for a stale revision. The editor loads current values before offering another save if the outcome is uncertain. It uses the application localization service with the `front-awesome::user-permission-editor` catalog and an English fallback. See the [permission editor guide](https://atb.dev.br/docs/front-awesome/user-permission-editor).

In the current source preview, click an editable row or focus it and press Space to change its draft value. Select **Save changes** to submit the draft.
