# Use Front Awesome throughout the documentation application

- [x] Read the Principles section of poteto-mode.
- [x] Phase A: Frame.
- [x] Phase B: Design the workflow.
- [x] Phase C: Run the loop.
- [x] Phase D: Keep the audit trail.
- [x] Phase E: Verify and hand back.

## Definition of done

The active documentation application consumes the public Front Awesome components wherever their native semantics fit. Main shared controls, callouts, clipboard behavior, appearance selection, search and sign-in are reviewed first. Each candidate has one of the user's four adoption levels and a concrete reason. Navigation, backend-owned destinations, prepaint theme and cookie behavior, source/search extraction, authentication and accessible interaction remain correct. Every migrated unit has meaningful tests and a visual browser review in desktop/mobile and light/dark modes. No per-page CSS workaround or duplicate state controller is introduced.

## Data shape

An adoption decision records a feature, owning file, fit level, public component, chosen action, preserved contract and verification result. A compiler-based inventory distinguishes live template controls from authored example strings and unreachable starter files. It is development tooling, not a second application or page registry.

## Designed sequence

1. Trace the active application imports, public APIs and current interaction contracts. Capture the current browser presentation.
2. Classify candidates as obvious, logically preferable, possible or requiring adaptation. Compare two designs for shared control adoption and the modal/form boundary. Keep existing application ownership where the public native API does not fit.
3. Migrate a small shared unit first, run its tests and inspect its real rendering before continuing.
4. Adopt native callout and clipboard behavior, shared controls and appearance selection. Preserve cookie/prepaint and Inertia semantics.
5. Migrate search and sign-in using public modal and form APIs. Preserve cancellation, focus return, validation, authentication payloads and failure handling.
6. Migrate the remaining active demo controls where appropriate. Keep the resize separator's actual ARIA keyboard contract.
7. Review each migrated unit visually, with open and interactive states, in both themes and viewport classes. Correct package defects at their owning source with regressions.
8. Update the existing architecture, authoring guidance, changelog and decision trail. Reuse this run's dependency refresh evidence and inspect installed frontend copies; do not repeat an unchanged failed registry operation to fabricate progress.
9. Run complete documentation quality checks, source synchronization, build, search freshness and application browser checks. Independently review the final diff and evidence before any commit.

## Throughput checkpoint

The shell has shared navigation controls, a theme selector, a search dialog, code-copy controls, editorial callouts and breadcrumb navigation. The active sign-in page has email and six-digit code forms. Other packages' active demos contain two checkbox controls and one message input. The shared demo frame has three preset buttons, a source disclosure and a resize separator. Shared changes reach many pages, so interaction and visual checks are the limiting work. The existing 90-wrapper implementation and its uncommitted changes remain intact. Dead starter components and authored code strings do not count as application migrations.
