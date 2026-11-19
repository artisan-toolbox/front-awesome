<template>
    <button type="button" @click="open = true">Edit Jordan</button>
    <button type="button" @click="editor?.show({ subjectId: 42, subjectLabel: 'Jordan Lee' })">
        Show Jordan
    </button>
    <button
        data-switch
        type="button"
        @click="editor?.show({ subjectId: 43, subjectLabel: 'Casey Chen' })"
    >
        Show Casey
    </button>
    <UserPermissionEditor
        ref="editor"
        v-model:open="open"
        :subject-id="42"
        subject-label="Jordan Lee"
        unavailable-message="This application has no editor provider."
    />
</template>

<script setup lang="ts">
import { shallowRef, useTemplateRef } from 'vue';
import type { UserPermissionEditorHandle } from '@artisan-toolbox/front-awesome';
import UserPermissionEditor from '@artisan-toolbox/front-awesome/components/UserPermissionEditor.vue';

const open = shallowRef(false);
const editor = useTemplateRef<UserPermissionEditorHandle>('editor');
</script>
