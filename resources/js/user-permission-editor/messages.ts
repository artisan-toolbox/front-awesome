import { inject } from 'vue';
import { localizationKey } from '../localization/context';
import { chooseMessage, replaceMessage } from '../localization/laravelMessages';

export const english = {
    title: 'User permissions',
    search: 'Find a permission',
    sections: 'Permission sections',
    matching: ':count matching permission|:count matching permissions',
    results: ':count permission|:count permissions',
    noResults: 'No permissions match your search.',
    empty: 'This catalog has no permissions.',
    clearSearch: 'Clear search',
    showMore: 'Show more permissions',
    allowed: 'Allowed',
    denied: 'Denied',
    readOnly: 'Read only. You can view these permissions.',
    loading: 'Loading permissions…',
    reloading: 'Checking the latest permissions…',
    saving: 'Saving changes…',
    saved: 'Permissions saved.',
    savedReload: 'Permissions were saved. Reload to continue editing.',
    refreshFailed: 'Permissions were saved. Refresh this page to update your own access.',
    refresh: 'Refresh page access',
    close: 'Close',
    cancel: 'Cancel',
    save: 'Save changes',
    changes: ':count unsaved change|:count unsaved changes',
    unavailable: 'The permissions editor is unavailable. Check the application configuration.',
    invalidSubject: 'Choose a user to view their permissions.',
    invalidResponse: 'The server returned invalid permission data. Retry to load it again.',
    session: 'Your session could not be verified. Sign in again, then retry.',
    forbidden: 'You no longer have access to these changes.',
    missing: 'This user is no longer available.',
    loadFailure: 'Could not load permissions. Check your connection and retry.',
    retry: 'Retry',
    validation: 'The server rejected these changes. Review your selections before saving again.',
    discardTitle: 'Discard unsaved changes?',
    discardBody: 'Your unsaved changes to permissions and roles will be lost.',
    discard: 'Discard changes',
    keepEditing: 'Keep editing',
    reviewConflict:
        'Permissions changed while you were editing. Compare the current values with your draft.',
    reviewUncertain:
        'The save could not be confirmed. Review the current permissions alongside your draft.',
    reviewSession:
        'Your session was restored. Review the current permissions before applying your draft.',
    current: 'Current',
    draft: 'Your draft',
    removed: 'Removed',
    notInDraft: 'Not in draft',
    applyDraft: 'Reapply draft',
    useCurrent: 'Use current values',
};

type Message = keyof typeof english;

export function useEditorText() {
    const localization = inject(localizationKey, undefined);
    return (key: Message, count?: number): string => {
        const name = `front-awesome::user-permission-editor.${key}`;
        const params = count === undefined ? {} : { count };
        const translated = localization?.t(name, params);
        if (translated && translated !== name) return translated;
        const line = english[key];
        return replaceMessage(
            count === undefined ? line : chooseMessage(line, count, 'en'),
            params,
        );
    };
}
