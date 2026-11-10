# Documentation component adoption verification

The goal is to make the documentation application consume Front Awesome's public components wherever they preserve the existing reading, navigation and interaction experience. This final adoption phase builds on the completed Web Awesome 3.14 wrapper work. It does not replace the documentation's domain owners or change its page hierarchy.

## Four adoption levels

| Level               | Decision                                                                                                                                   | Preserved boundary                                                                                                                                       |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Obvious             | Use public Icon, Tag and ordinary Button exports in shared presentation and runnable demos.                                                | Uploaded kit markup, canonical package metadata and backend destinations remain owned by their existing components.                                      |
| Logical             | Use public Callout, CopyButton, Select and Option in shared content, source copying and appearance selection.                              | Editorial aside semantics, exact clipboard value, cookie/prepaint/system appearance and one existing state controller remain intact.                     |
| Possible            | Use public Input and Button for sign-in, Checkbox for Core choices and Input for Mosaicast's message.                                      | Exact authentication payloads, leading-zero code entry, server errors, pending states and reader-initiated work remain intact.                           |
| Requires adaptation | Retain search's Reka modal and native field, native source details, ARIA disclosure/preset controls, navigation links and semantic tables. | Runtime probes found spacing and focus-boundary incompatibilities. No Shadow DOM mutation, per-page reset or duplicate modal/focus controller was added. |

The complete decision table and native API constraints live in [the documentation architecture](../../docs/documentation/architecture.md#component-adoption). Inactive starter components are outside this migration.

## Observable changes and defects corrected

- The AST import-graph inventory reports 367 reachable files, 10 explicit native template controls, zero raw WA tags, 235 public wrapper occurrences and 90 component identities. Before adoption it found 41 native controls, one raw WA tag and 196 public occurrences. These counts describe authored reachable templates, not every browser-generated element or interaction. The baseline's default-import identity alias was corrected rather than reported as another component.
- All 90 catalog snippets now contain the complete live Vue demo source. The earlier eight concise-source exceptions were removed. An independent test compares every displayed literal with its owning SFC, and the synchronization command checks drift.
- The sign-in browser test reproduced focus being requested while the next field was still disabled. Watching the step and processing state now focuses the ready public input. Cancellation and disconnected hosts are covered by the shared readiness helper.
- Manual visual interaction found that Show details opened and immediately dismissed Popover. The helper now stops its initiating click at the outside-dismissal boundary. The regression failed before the fix and passed afterward. The browser gate also checks sustained visibility, keyboard reference navigation, Escape and returned trigger focus.
- The demo frame remains discreet, resizable and keyboard operable. Its native presets keep their pressed state on the actual focusable element. Native source details preserves the mounted example and lazy highlighting.

## Evidence and limits

The final complete run passed 67 frontend test files with 649 tests and 475 PHP tests with 33,154 assertions. All six Maintainer checks passed with none skipped, including lint, formatting, vue-tsc and PHPStan. Production assets built and the published search index passed its freshness check. Standards 1.0.6 had zero pending files. The entire browser chain exited successfully with 90 frames, 18 measured Rating selections, one Popover workflow, four application profiles and four login profiles with 28 intercepted POSTs. Both repositories passed `git diff --check`. Front Awesome formatting/lint, Core and Pro generator checks, upstream example inventory and Pro type checks passed; its implementation coverage remains the earlier unchanged 335-test package result. The maintained command `npm run test:browser` chains catalog, application and sign-in browser checks. It cannot pass by running only a rendering smoke test.

| Check                                           | Evidence                                                                |
| ----------------------------------------------- | ----------------------------------------------------------------------- |
| Formatting, lint and 90-source synchronization  | `/tmp/atb-adoption-format-final.log`                                    |
| Complete documentation quality suite            | `/tmp/atb-adoption-quality-final.log`                                   |
| Production assets                               | `/tmp/atb-adoption-build-final.log`                                     |
| Search publication and freshness                | `/tmp/atb-adoption-search-final.log`                                    |
| Catalog, application and sign-in browser chain  | `/tmp/atb-adoption-browser-final.log`                                   |
| Installed standards                             | `/tmp/atb-adoption-standards-final.log`                                 |
| Final public-source inventory                   | `/tmp/atb-docs-usage-after.json`                                        |
| Popover failed-before and passed-after evidence | `/tmp/atb-adoption-demo-before.log`, `/tmp/atb-adoption-demo-after.log` |

Application browser profiles use 1440px and 390px in light and dark modes. They check real clipboard success, denied and unavailable APIs, persisted appearance, search request/focus behavior, responsive menu geometry, Core pending controls and payloads, lazy source spacing and the Mosaicast message field. Sign-in checks intercept all authentication POSTs and send no email. Twenty sign-in screenshots show email, code, errors and expiry across those profiles. Catalog checks render all 90 frames and exercise responsive presets, pointer/keyboard resize and exact Rating hit targets. They do not claim exhaustive interaction permutations for every upstream example. The earlier package coverage report remains separate from this documentation application suite.

Actual screenshots are under `../docs/storage/app/browser-verification/`, including `popover-open.png`, `rating-mobile.png` and the `adoption/` matrix. Manual review also inspected the open Popover at 390px in both themes. Temporary viewport and appearance overrides were restored. The application review found no visual clipping in the inspected control states. A tall Core element screenshot can include the sticky header at its capture edge; it is not a complete-page visual equivalence claim.

## Native boundaries retained deliberately

WA 3.14 container-local `--spacing` collides with Tailwind's numeric unit in slotted content. A Dialog probe changed `pt-4` from 16px to 80px. Proposed capture/reset aliases produced a variable cycle or broke local branding. Mixing Reka's focus scope with WA Input also failed actual Tab containment because the deep active input differs from the host in the scope's traversal. Host ARIA attributes do not guarantee state on Button's internal focusable control. Breadcrumb links, current-page text and independent navigation disclosures therefore retain their existing semantics. These are recorded constraints, not hidden CSS adaptations.

Compatible dependency refreshes were attempted in Composer-before-npm order. Composer dry-run proposed six changes, including two local package aliases; npm dry-run proposed eleven changes. Neither dry-run applied a dependency bump or changed the original lock. Installed frontend wrapper sources match the owning package. The pre-existing local Composer release-lock portability issue remains outside this adoption change.

## Decisions and attention review

Build the Lever shaped the AST inventory, uniform source generator and maintained browser gates. Fix Root Causes shaped the processing-aware focus and Popover event-boundary fixes. Experience First and Laziness Protocol kept native controls where replacing them would require new focus management or repeated CSS adaptations. Test Behavior, Not Implementation preserved payloads, real clipboard writes and keyboard outcomes. Prove It Works required inspection of real open states and screenshots, beyond compilation.

The initial independent review by gpt-6.1-sol found browser targeting, Promise cleanup and duplicated result-label issues. All three were corrected. The final independent review in `/tmp/atb-adoption-final-review.md` reports no unresolved finding. It independently ran 16 focused tests, inspected the complete final logs and opened eight actual screenshots. It did not start a second browser session or repeat the earlier package-wide wrapper audit. The available configured reviewers share the same model family; this is independent-context review, not diverse-family verification. No commit, push or deployment is part of this verification.
