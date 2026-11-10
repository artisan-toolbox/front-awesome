<template>
    <div>
        <template v-if="scenario === 'pagination-1'">
            <Pagination
                data-upstream-index="0"
                :total="237"
                :page-size="10"
                :page="3"
                label="Search results"
            ></Pagination>
        </template>
        <template v-if="scenario === 'pagination-2'">
            <div class="wa-stack">
                <Pagination
                    data-upstream-index="0"
                    :total="237"
                    :page-size="10"
                    :page="3"
                    appearance="outlined"
                ></Pagination>
                <Pagination
                    data-upstream-index="1"
                    :total="237"
                    :page-size="10"
                    :page="3"
                    appearance="filled"
                ></Pagination>
                <Pagination
                    data-upstream-index="2"
                    :total="237"
                    :page-size="10"
                    :page="3"
                    appearance="plain"
                ></Pagination>
            </div>
        </template>
        <template v-if="scenario === 'pagination-3'">
            <div class="wa-stack">
                <Pagination
                    data-upstream-index="0"
                    :total="237"
                    :page-size="10"
                    :page="3"
                    style="font-size: var(--wa-font-size-s)"
                ></Pagination>
                <Pagination
                    data-upstream-index="1"
                    :total="237"
                    :page-size="10"
                    :page="3"
                ></Pagination>
                <Pagination
                    data-upstream-index="2"
                    :total="237"
                    :page-size="10"
                    :page="3"
                    style="font-size: var(--wa-font-size-l)"
                ></Pagination>
            </div>
        </template>
        <template v-if="scenario === 'pagination-4'">
            <div class="wa-stack">
                <Pagination
                    data-upstream-index="0"
                    :total="1000"
                    :page-size="10"
                    :page="50"
                    :sibling-count="1"
                    :boundary-count="1"
                ></Pagination>
                <Pagination
                    data-upstream-index="1"
                    :total="1000"
                    :page-size="10"
                    :page="50"
                    :sibling-count="3"
                    :boundary-count="2"
                ></Pagination>
            </div>
        </template>
        <template v-if="scenario === 'pagination-5'">
            <Pagination
                data-upstream-index="0"
                :total="237"
                :page-size="10"
                :page="10"
                with-edges
            ></Pagination>
        </template>
        <template v-if="scenario === 'pagination-6'">
            <Pagination
                data-upstream-index="0"
                :total="237"
                :page-size="10"
                :page="3"
                without-nav
            ></Pagination>
        </template>
        <template v-if="scenario === 'pagination-7'">
            <Pagination
                data-upstream-index="0"
                :total="237"
                :page-size="10"
                :page="1"
                with-summary
            ></Pagination>
        </template>
        <template v-if="scenario === 'pagination-8'">
            <Pagination
                data-upstream-index="0"
                :total="237"
                :page-size="10"
                :page="1"
                format="compact"
            ></Pagination>
        </template>
        <template v-if="scenario === 'pagination-9'">
            <Pagination
                data-upstream-index="0"
                :total="237"
                :page-size="10"
                :page="1"
                format="compact"
                with-summary
            ></Pagination>
        </template>
        <template v-if="scenario === 'pagination-10'">
            <Pagination data-upstream-index="0" :total="237" :page-size="10" :page="5" with-edges>
                <Icon data-upstream-index="1" slot="previous-icon" name="backward-step"></Icon>
                <Icon data-upstream-index="2" slot="next-icon" name="forward-step"></Icon>
                <Icon data-upstream-index="3" slot="first-icon" name="backward-fast"></Icon>
                <Icon data-upstream-index="4" slot="last-icon" name="forward-fast"></Icon>
            </Pagination>
        </template>
        <template v-if="scenario === 'pagination-11'">
            <Pagination
                data-upstream-index="0"
                :total="237"
                :page-size="10"
                :page="3"
                disabled
            ></Pagination>
        </template>
        <template v-if="scenario === 'pagination-12'">
            <Pagination
                data-upstream-index="0"
                :total="5"
                :page-size="10"
                hide-single-page
            ></Pagination>
        </template>
        <template v-if="scenario === 'pagination-13'">
            <div class="pagination-page-size">
                <Pagination
                    data-upstream-index="0"
                    :total="237"
                    :page-size="10"
                    :page="1"
                ></Pagination>

                <Select data-upstream-index="1" label="Items per page" value="10" size="s">
                    <Option data-upstream-index="2" value="10">10</Option>
                    <Option data-upstream-index="3" value="20">20</Option>
                    <Option data-upstream-index="4" value="50">50</Option>
                    <Option data-upstream-index="5" value="100">100</Option>
                </Select>
            </div>
        </template>
        <template v-if="scenario === 'pagination-14'">
            <div class="pagination-change-demo">
                <Pagination
                    data-upstream-index="0"
                    class="pagination-change"
                    :total="237"
                    :page-size="10"
                    :page="1"
                ></Pagination>

                <Divider data-upstream-index="1"></Divider>

                <small class="pagination-change-output" style="display: block"
                    >Showing page 1</small
                >
            </div>
        </template>
        <template v-if="scenario === 'pagination-15'">
            <div class="pagination-set-demo">
                <Pagination
                    data-upstream-index="0"
                    class="pagination-set"
                    :total="237"
                    :page-size="10"
                    :page="1"
                ></Pagination>

                <Divider data-upstream-index="1"></Divider>

                <div class="wa-cluster">
                    <Button data-upstream-index="2" appearance="filled" data-page="1"
                        >Page 1</Button
                    >
                    <Button data-upstream-index="3" appearance="filled" data-page="5"
                        >Page 5</Button
                    >
                    <Button data-upstream-index="4" appearance="filled" data-page="10"
                        >Page 10</Button
                    >
                </div>
            </div>
        </template>
        <template v-if="scenario === 'pagination-16'">
            <Pagination
                data-upstream-index="0"
                class="pagination-guard"
                :total="237"
                :page-size="10"
                :page="1"
            ></Pagination>
        </template>
        <template v-if="scenario === 'pagination-17'">
            <Pagination
                data-upstream-index="0"
                :total="237"
                :page-size="10"
                :page="3"
                href-template="?page={page}"
            ></Pagination>
        </template>
        <template v-if="scenario === 'pagination-18'">
            <Pagination
                data-upstream-index="0"
                class="pagination-href-fn"
                :total="237"
                :page-size="10"
                :page="3"
                href-template="?page={page}#results"
            ></Pagination>
        </template>
        <template v-if="scenario === 'pagination-19'">
            <Pagination
                data-upstream-index="0"
                class="custom-pagination"
                :total="237"
                :page-size="10"
                :page="3"
                appearance="plain"
                with-edges
                :sibling-count="1"
            >
                <Icon data-upstream-index="1" slot="previous-icon" name="chevron-left"></Icon>
                <Icon data-upstream-index="2" slot="next-icon" name="chevron-right"></Icon>
                <Icon data-upstream-index="3" slot="first-icon" name="angles-left"></Icon>
                <Icon data-upstream-index="4" slot="last-icon" name="angles-right"></Icon>
            </Pagination>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    Button,
    Divider,
    Icon,
    Option,
    Pagination,
    Select,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
