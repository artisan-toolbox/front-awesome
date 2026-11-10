<template>
    <div>
        <template v-if="scenario === 'dropdown-item-1'">
            <!-- dropdown is an overlay that won't render on a static stage, so the items show among dimmed siblings. -->
            <div style="display: flex; flex-direction: column">
                <DropdownItem data-upstream-index="0"
                    ><Icon data-upstream-index="1" slot="icon" name="copy"></Icon>Copy<span
                        slot="details"
                        >⌘C</span
                    ></DropdownItem
                >
                <DropdownItem data-upstream-index="2" data-anatomy-subject="true"
                    ><Icon data-upstream-index="3" slot="icon" name="scissors"></Icon>Cut<span
                        slot="details"
                        >⌘X</span
                    ></DropdownItem
                >
                <DropdownItem data-upstream-index="4"
                    ><Icon data-upstream-index="5" slot="icon" name="trash"></Icon
                    >Delete</DropdownItem
                >
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { DropdownItem, Icon } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
