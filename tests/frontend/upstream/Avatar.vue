<template>
    <div>
        <template v-if="scenario === 'avatar-1'">
            <Avatar data-upstream-index="0" label="User avatar"></Avatar>
        </template>
        <template v-if="scenario === 'avatar-2'">
            <Avatar
                data-upstream-index="0"
                image="https://images.unsplash.com/photo-1529778873920-4da4926a72c2?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
                label="Avatar of a gray tabby kitten looking down"
            ></Avatar>
            <Avatar
                data-upstream-index="1"
                image="https://images.unsplash.com/photo-1591871937573-74dbba515c4c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80"
                label="Avatar of a white and grey kitten on grey textile"
                loading="lazy"
            ></Avatar>
        </template>
        <template v-if="scenario === 'avatar-3'">
            <Avatar data-upstream-index="0" initials="WA" label="Avatar with initials: WA"></Avatar>
        </template>
        <template v-if="scenario === 'avatar-4'">
            <Avatar data-upstream-index="0" label="Avatar with an image icon">
                <Icon data-upstream-index="1" slot="icon" name="image"></Icon>
            </Avatar>

            <Avatar data-upstream-index="2" label="Avatar with an archive icon">
                <Icon data-upstream-index="3" slot="icon" name="archive"></Icon>
            </Avatar>

            <Avatar data-upstream-index="4" label="Avatar with a briefcase icon">
                <Icon data-upstream-index="5" slot="icon" name="briefcase"></Icon>
            </Avatar>
        </template>
        <template v-if="scenario === 'avatar-5'">
            <Avatar data-upstream-index="0" shape="square" label="Square avatar"></Avatar>
            <Avatar data-upstream-index="1" shape="rounded" label="Rounded avatar"></Avatar>
            <Avatar data-upstream-index="2" shape="circle" label="Circle avatar"></Avatar>
        </template>
        <template v-if="scenario === 'avatar-6'">
            <div class="avatar-group">
                <Avatar
                    data-upstream-index="0"
                    image="https://images.unsplash.com/photo-1490150028299-bf57d78394e0?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&q=80&crop=right"
                    label="Avatar 1 of 4"
                ></Avatar>

                <Avatar
                    data-upstream-index="1"
                    image="https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&crop=left&q=80"
                    label="Avatar 2 of 4"
                ></Avatar>

                <Avatar
                    data-upstream-index="2"
                    image="https://images.unsplash.com/photo-1456439663599-95b042d50252?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&crop=left&q=80"
                    label="Avatar 3 of 4"
                ></Avatar>

                <Avatar
                    data-upstream-index="3"
                    image="https://images.unsplash.com/flagged/photo-1554078875-e37cb8b0e27d?ixid=MXwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHw%3D&ixlib=rb-1.2.1&auto=format&fit=crop&w=256&h=256&crop=top&q=80"
                    label="Avatar 4 of 4"
                ></Avatar>
            </div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Avatar, Icon } from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
