import { router } from '@inertiajs/vue3';
import { computed, onScopeDispose, shallowRef } from 'vue';
import { fieldErrors, readSnapshot, request, responseFailure } from './protocol';
import type { Failure, Snapshot, Subject, Values } from './protocol';

interface Draft {
    endpoint: string;
    snapshot: Snapshot;
    changes: ReadonlyMap<string, boolean>;
}

type Reconciliation =
    | { reason: 'conflict' | 'uncertain' | 'session' | 'forbidden'; draft: Draft }
    | { reason: 'saved'; draft: Draft };

type State =
    | { kind: 'idle' }
    | { kind: 'loading'; pending?: Reconciliation }
    | { kind: 'error'; failure: Failure; pending?: Reconciliation }
    | {
          kind: 'editing';
          draft: Draft;
          saved?: true;
          denied?: true;
          errors?: Record<string, string>;
      }
    | { kind: 'saving'; draft: Draft }
    | { kind: 'review'; draft: Draft; pending: Reconciliation };

function desiredValues(draft: Draft): Values {
    return { ...draft.snapshot.values, ...Object.fromEntries(draft.changes) };
}

function matches(snapshot: Snapshot, desired: Values): boolean {
    return (
        Object.keys(snapshot.values).length === Object.keys(desired).length &&
        Object.entries(desired).every(([key, value]) => snapshot.values[key] === value)
    );
}

export function usePermissionSession(endpointFor: (subject: Subject) => string | undefined) {
    const target = shallowRef<Subject>();
    const state = shallowRef<State>({ kind: 'idle' });
    const refresh = shallowRef<'idle' | 'pending' | 'failed'>('idle');
    let operation: AbortController | undefined;
    let refreshGeneration = 0;

    const draft = computed(() => ('draft' in state.value ? state.value.draft : undefined));
    const changes = computed(() => {
        const current = state.value;
        if (current.kind === 'review') return current.pending.draft.changes.size;
        if ((current.kind === 'loading' || current.kind === 'error') && current.pending) {
            return current.pending.reason === 'saved' ? 0 : current.pending.draft.changes.size;
        }
        return draft.value?.changes.size ?? 0;
    });

    function begin() {
        operation?.abort();
        operation = new AbortController();
        return operation;
    }

    function reset() {
        const current = operation;
        operation = undefined;
        current?.abort();
        refreshGeneration++;
        refresh.value = 'idle';
        state.value = { kind: 'idle' };
        target.value = undefined;
    }

    function open(subject: Subject | undefined) {
        reset();
        target.value = subject;
        void load();
    }

    function updateLabel(label: string | undefined) {
        if (target.value) target.value = { ...target.value, label };
    }

    async function load(pending?: Reconciliation): Promise<void> {
        const subject = target.value;
        const endpoint = subject && endpointFor(subject);
        if (!subject || !endpoint || (pending && pending.draft.endpoint !== endpoint)) {
            state.value = {
                kind: 'error',
                failure: subject ? 'unavailable' : 'invalidSubject',
                pending,
            };
            return;
        }

        const controller = begin();
        state.value = { kind: 'loading', pending };
        try {
            const reply = await request(endpoint, controller);
            if (operation !== controller) return;
            if (reply.status !== 200) {
                state.value = { kind: 'error', failure: responseFailure(reply.status), pending };
                return;
            }
            const snapshot = readSnapshot(reply.data, subject);
            if (!snapshot) {
                state.value = { kind: 'error', failure: 'invalidResponse', pending };
                return;
            }
            const latest: Draft = { endpoint, snapshot, changes: new Map() };
            if (!pending || pending.reason === 'saved') {
                state.value = { kind: 'editing', draft: latest, ...(pending && { saved: true }) };
            } else if (
                pending.reason === 'uncertain' &&
                matches(snapshot, desiredValues(pending.draft))
            ) {
                state.value = { kind: 'editing', draft: latest, saved: true };
                if (snapshot.isCurrentUser) refreshActor();
            } else if (pending.reason === 'forbidden' || !snapshot.canUpdate) {
                state.value = {
                    kind: 'editing',
                    draft: { ...latest, snapshot: { ...snapshot, canUpdate: false } },
                    denied: true,
                };
            } else {
                state.value = { kind: 'review', draft: latest, pending };
            }
        } catch {
            if (operation === controller) {
                state.value = { kind: 'error', failure: 'loadFailure', pending };
            }
        }
    }

    function retry() {
        if (state.value.kind === 'error') void load(state.value.pending);
    }

    function toggle(key: string, allowed: boolean) {
        const current = state.value;
        if (current.kind !== 'editing' || !current.draft.snapshot.canUpdate) return;
        const original = current.draft.snapshot.values;
        if (!Object.hasOwn(original, key)) return;
        const changes = new Map(current.draft.changes);
        if (original[key] === allowed) changes.delete(key);
        else changes.set(key, allowed);
        const errors =
            current.errors &&
            Object.fromEntries(Object.entries(current.errors).filter(([field]) => field !== key));
        state.value = { kind: 'editing', draft: { ...current.draft, changes }, errors };
    }

    function review(keepChanges: boolean) {
        const current = state.value;
        if (current.kind !== 'review') return;
        const { snapshot } = current.draft;
        const changes = keepChanges
            ? new Map(
                  [...current.pending.draft.changes].filter(
                      ([key, value]) =>
                          Object.hasOwn(snapshot.values, key) && snapshot.values[key] !== value,
                  ),
              )
            : current.draft.changes;
        state.value = { kind: 'editing', draft: { ...current.draft, changes } };
    }

    async function save() {
        const current = state.value;
        if (
            current.kind !== 'editing' ||
            !current.draft.snapshot.canUpdate ||
            current.draft.changes.size === 0
        )
            return;
        const { draft } = current;
        if (!target.value || endpointFor(target.value) !== draft.endpoint) {
            state.value = {
                kind: 'error',
                failure: 'unavailable',
                pending: { reason: 'conflict', draft },
            };
            return;
        }
        const controller = begin();
        state.value = { kind: 'saving', draft };
        try {
            const reply = await request(draft.endpoint, controller, {
                revision: draft.snapshot.revision,
                values: desiredValues(draft),
            });
            if (operation !== controller) return;
            switch (reply.status) {
                case 204:
                    if (draft.snapshot.isCurrentUser) refreshActor();
                    await load({ reason: 'saved', draft });
                    return;
                case 422:
                    state.value = {
                        kind: 'editing',
                        draft,
                        errors: fieldErrors(reply.data, draft.snapshot.values),
                    };
                    return;
                case 401:
                case 419:
                    state.value = {
                        kind: 'error',
                        failure: 'session',
                        pending: { reason: 'session', draft },
                    };
                    return;
                case 404:
                    state.value = { kind: 'error', failure: 'missing' };
                    return;
                default:
                    await load({
                        reason:
                            reply.status === 409
                                ? 'conflict'
                                : reply.status === 403
                                  ? 'forbidden'
                                  : 'uncertain',
                        draft,
                    });
                    return;
            }
        } catch {
            if (operation === controller) await load({ reason: 'uncertain', draft });
        }
    }

    function refreshActor() {
        const generation = ++refreshGeneration;
        refresh.value = 'pending';
        let started = false;
        const failed = () => {
            if (generation === refreshGeneration) refresh.value = 'failed';
        };
        try {
            router.reload({
                only: ['userPermissionEditor'],
                showProgress: false,
                preserveUrl: true,
                onStart: () => {
                    started = true;
                },
                onSuccess: () => {
                    if (generation === refreshGeneration) refresh.value = 'idle';
                },
                onCancel: failed,
                onError: failed,
                onHttpException: () => {
                    failed();
                    return false;
                },
                onNetworkError: () => {
                    failed();
                    return false;
                },
                onFinish: () => {
                    if (generation === refreshGeneration && refresh.value === 'pending') failed();
                },
            });
            if (!started) failed();
        } catch {
            failed();
        }
    }

    onScopeDispose(reset);
    return {
        target,
        state,
        changes,
        refresh,
        open,
        updateLabel,
        reset,
        retry,
        toggle,
        save,
        review,
        refreshActor,
    };
}
