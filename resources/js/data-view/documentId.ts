import { onMounted, shallowRef } from 'vue';

export function useDocumentId(hydrationId?: string) {
    const id = shallowRef(hydrationId);
    onMounted(() => {
        // Independent Vue roots can share a document and the same app-scoped hydration ID.
        id.value = 'data-view-' + crypto.getRandomValues(new Uint32Array(4)).join('-');
    });
    return id;
}
