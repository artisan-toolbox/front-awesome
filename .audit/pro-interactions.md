# Web Awesome Pro browser interactions

Reference report for the licensed `@web.awesome.me/webawesome-pro` distribution at version 3.14.0. The suite imports wrappers through the public `@artisan-toolbox/front-awesome/components/WebAwesome/Pro` barrel. Core children use the existing Core barrel. `FRONT_AWESOME_PRO=1` selects the licensed runtime through the package Vite plugin.

## Verified behavior

`tests/pro/interactions.browser.test.ts` contains 23 real Chromium tests covering all 17 Pro wrappers. The tests use browser pointer, keyboard and file-upload actions. They read rendered output, native form submission, public component state, callback results and real canvas pixels.

| Family        | Components                                                                                                 | Browser behavior                                                                                                                                                                                                                                       |
| ------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Combobox      | Combobox                                                                                                   | Text filtering, disabled option, keyboard selection, clear, successful FormData, disabled input, multiple selection, tag removal, server callback requests and results.                                                                                |
| Dates         | DatePicker                                                                                                 | Minimum and maximum dates, disabled date arrays, predicate identity and execution, custom day content, rejected disabled-day keyboard activation, keyboard movement, `valueAsDate`, range selection, `valueAsRange`, cancelled range restoration.      |
| Dates         | DateInput                                                                                                  | Popup selection, single and range FormData, Date getters, unrelated Vue updates, reset defaults, prevented reset, clear, forwarded range constraints and predicate.                                                                                    |
| Files         | FileInput                                                                                                  | Accepted and rejected file types, real File submission and contents, remove, rich files identity, user additions, unrelated updates, explicit external clearing, required validation and disabled control.                                             |
| Data          | DataGrid                                                                                                   | Data and column array identity, detail callback identity and output, pointer sorting, row selection events, details expansion, pagination, search, keyboard column reordering and resize, public column filters, state save and restore, filtered CSV. |
| Canvas charts | Chart, BarChart, BubbleChart, DoughnutChart, LineChart, PieChart, PolarAreaChart, RadarChart, ScatterChart | Actual canvas dimensions and painted pixels, config identity, configured click callbacks and visible repaint after reactive dataset color changes. Bubble and scatter fixtures contain real point data.                                                |
| SVG charts    | Sparkline                                                                                                  | Accessible SVG label, generated path, public data and curve updates, rendered dimensions. Sparkline is an SVG component, so the test does not invent a canvas requirement.                                                                             |
| Media         | Video                                                                                                      | Local MP4 metadata, paused initial state, explicit Play and Pause controls and events, volume hover control with keyboard mute, public seek.                                                                                                           |
| Media         | VideoPlaylist                                                                                              | Paused initial clips, visible playlist selection, change event, active clip visibility, explicit Play, previous navigation and inactive clip pause. Selecting a playlist item does not itself autoplay in upstream 3.14.0.                             |

Five cases exercise the native Pro element and the Vue wrapper with the same data, callbacks and action sequence. They cover server Combobox behavior, DatePicker callbacks and keyboard behavior, DateInput range constraints and reset, DataGrid pointer workflows, and DataGrid keyboard and state workflows. Event spies reset between native and wrapper runs.

All fixtures use the same package theme imports, Tailwind Preflight and shared theme. The reset comparison suite and upstream scenario inventory have separate ownership and are not included in the count above.

## Validation

Run from `front-awesome` after installing Composer dependencies, frontend dependencies and the licensed Pro distribution.

```sh
CHROMIUM_EXECUTABLE='/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge' npm run test:pro:browser -- tests/pro/interactions.browser.test.ts
npm run typecheck:pro
./node_modules/.bin/vp lint tests/pro/interactions.browser.test.ts
./node_modules/.bin/vp fmt tests/pro/interactions.browser.test.ts
```

The browser run on 2026-11-09 passed all 23 tests in Microsoft Edge Chromium. Pro type checking and the file-specific lint check also passed. The media fixture is `tests/pro/fixtures/color-test.mp4`, imported through Vite as a package-local asset. No external media CDN is required.

The first browser launch required sandbox escalation because Vitest could not bind a local port. An initial dependency optimizer reload failed test collection. The isolated rerun after optimization collected the tests normally.

## Evidence boundaries

This suite verifies the listed workflows. It does not claim every upstream example, every chart option, every locale, every media capability or every combination of Pro inputs is interactive coverage. In particular, fullscreen and picture-in-picture permissions, hardware capture, drag reordering, downloads, clipboard permission behavior, server request cancellation and error recovery, chart keyboard accessibility, calendar localization, mobile controls and cross-browser engines are outside these 23 cases. Upstream example parity and reset coverage are recorded separately.

Rich properties can arrive after `customElements.whenDefined()` resolves because another component may register the element before the wrapper's own dynamic import finishes. The fixture polls for the supplied object and callback identity, then waits for the resulting Lit render. Initial null values observed before that boundary were test synchronization mistakes, not confirmed wrapper defects.

The native DateInput fixture sets its `value` attribute as well as its current property to model a markup reset default. Merely setting the live property leaves the native reset default empty. DatePicker disabled dates use `aria-disabled`, keep keyboard focus, and reject activation. Desktop Video exposes its volume slider through hover; its Volume button toggles that popover. These distinctions were checked against the installed runtime instead of changing the wrappers to match an incorrect expectation.

No package source changes or per-component CSS patches were made for this suite. Test Behavior, Not Implementation shaped the use of observable selection, FormData, callback output, pixels and playback state. Type System Discipline shaped the DOM helper types derived from `HTMLElementTagNameMap` and the runtime checks before reading submitted File contents.
