<template>
    <div>
        <template v-if="scenario === 'data-grid-1'">
            <DataGrid
                data-upstream-index="0"
                id="grid-anatomy"
                label="Team directory"
                row-key="id"
                selectable=""
                with-search
                with-columns-menu
                with-column-menu
                resizable
                paginate
                :page-size="2"
            ></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-2'">
            <DataGrid
                data-upstream-index="0"
                id="grid-overview"
                label="Team directory"
                row-key="id"
                selectable=""
                with-search
                with-columns-menu
                with-column-menu
                reorderable
                resizable
                paginate
                :page-size="10"
                style="--max-height: none"
            ></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-3'">
            <DataGrid
                data-upstream-index="0"
                id="grid-columns"
                label="Inventory"
                row-key="sku"
            ></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-4'">
            <DataGrid
                data-upstream-index="0"
                id="grid-format"
                label="Pull requests"
                row-key="id"
            ></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-5'">
            <DataGrid
                data-upstream-index="0"
                id="grid-actions"
                label="Documents"
                row-key="id"
            ></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-6'">
            <DataGrid
                data-upstream-index="0"
                id="grid-striped"
                label="Periodic table"
                row-key="number"
                striped
            ></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-7'">
            <div id="grid-size-demo">
                <Select data-upstream-index="0" value="s" style="max-width: 12rem">
                    <span slot="label" class="wa-visually-hidden">Size</span>
                    <Option data-upstream-index="1" value="xs">Extra Small</Option>
                    <Option data-upstream-index="2" value="s">Small</Option>
                    <Option data-upstream-index="3" value="m">Medium</Option>
                    <Option data-upstream-index="4" value="l">Large</Option>
                    <Option data-upstream-index="5" value="xl">Extra Large</Option>
                </Select>
                <Divider data-upstream-index="6"></Divider>
                <DataGrid
                    data-upstream-index="7"
                    id="grid-size"
                    label="Releases"
                    row-key="id"
                    size="s"
                    with-search
                    selectable=""
                ></DataGrid>
            </div>
        </template>
        <template v-if="scenario === 'data-grid-8'">
            <div id="grid-appearance-demo">
                <Select data-upstream-index="0" value="outlined" style="max-width: 12rem">
                    <span slot="label" class="wa-visually-hidden">Appearance</span>
                    <Option data-upstream-index="1" value="outlined">Outlined</Option>
                    <Option data-upstream-index="2" value="plain">Plain</Option>
                </Select>
                <Divider data-upstream-index="3"></Divider>
                <DataGrid
                    data-upstream-index="4"
                    id="grid-appearance"
                    label="Tickets"
                    row-key="id"
                    appearance="outlined"
                ></DataGrid>
            </div>
        </template>
        <template v-if="scenario === 'data-grid-9'">
            <DataGrid
                data-upstream-index="0"
                id="grid-sort"
                label="Standings"
                row-key="id"
            ></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-10'">
            <DataGrid
                data-upstream-index="0"
                id="grid-comparator"
                label="Incidents"
                row-key="id"
            ></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-11'">
            <DataGrid
                data-upstream-index="0"
                without-sort-removal
                sort-desc-first
                :max-multi-sort="3"
            ></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-12'">
            <DataGrid
                data-upstream-index="0"
                id="grid-select"
                label="Subscribers"
                row-key="id"
                selectable=""
            ></DataGrid>
            <p>Selected: <span id="grid-select-count">0</span></p>
        </template>
        <template v-if="scenario === 'data-grid-13'">
            <DataGrid
                data-upstream-index="0"
                id="grid-single"
                label="Pick a plan"
                row-key="id"
                selectable="single"
            ></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-14'">
            <DataGrid
                data-upstream-index="0"
                id="grid-page"
                label="Transactions"
                row-key="id"
                paginate
                :page-size="10"
            ></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-15'">
            <DataGrid
                data-upstream-index="0"
                id="grid-search"
                label="Countries"
                row-key="code"
                with-search
            ></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-16'">
            <DataGrid
                data-upstream-index="0"
                id="grid-filter"
                label="Products"
                row-key="id"
            ></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-17'">
            <DataGrid
                data-upstream-index="0"
                id="grid-filter-types"
                label="Products"
                row-key="id"
            ></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-18'">
            <DataGrid
                data-upstream-index="0"
                id="grid-filter-options"
                label="Products"
                row-key="id"
                paginate
                :page-size="5"
            ></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-19'">
            <DataGrid
                data-upstream-index="0"
                id="grid-visibility"
                label="Web analytics"
                row-key="id"
                with-columns-menu
            ></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-20'">
            <DataGrid
                data-upstream-index="0"
                id="grid-resize"
                label="Files"
                row-key="id"
                resizable
            ></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-21'">
            <DataGrid
                data-upstream-index="0"
                id="grid-reorder"
                label="Roster"
                row-key="id"
                reorderable
            ></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-22'">
            <DataGrid
                data-upstream-index="0"
                id="grid-pin"
                label="Team"
                row-key="id"
                pinnable
                with-column-menu
                resizable
                style="max-width: 100%"
            ></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-23'">
            <DataGrid
                data-upstream-index="0"
                id="grid-footers"
                label="Invoice"
                row-key="id"
                with-search
            ></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-24'">
            <DataGrid
                data-upstream-index="0"
                id="grid-grouped"
                label="Team compensation"
                group-by="department"
                row-key="id"
                selectable=""
            ></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-25'">
            <DataGrid
                data-upstream-index="0"
                id="grid-detail"
                label="Shipments"
                row-key="id"
            ></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-26'">
            <DataGrid
                data-upstream-index="0"
                id="grid-tree"
                label="Project files"
                child-rows="children"
                row-key="id"
                selectable=""
            ></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-27'">
            <DataGrid
                data-upstream-index="0"
                id="grid-empty"
                label="Invoices"
                row-key="id"
                with-search
            >
                <div
                    slot="empty"
                    class="wa-stack wa-align-items-center"
                    style="padding: var(--wa-space-2xl) 0; text-align: center"
                >
                    <Icon
                        data-upstream-index="1"
                        name="file-invoice"
                        style="font-size: 2.5rem; color: var(--wa-color-text-quiet)"
                    ></Icon>
                    <div>
                        <strong>No invoices yet</strong>
                        <p style="margin: 0.25em 0 0; color: var(--wa-color-text-quiet)">
                            Create your first invoice to see it here.
                        </p>
                    </div>
                    <Button data-upstream-index="2" variant="brand">
                        <Icon data-upstream-index="3" slot="start" name="plus"></Icon>
                        New Invoice
                    </Button>
                </div>
            </DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-28'">
            <div class="wa-cluster" style="margin-block-end: var(--wa-space-m)">
                <Button data-upstream-index="0" id="grid-loading-reload">Reload</Button>
            </div>
            <DataGrid
                data-upstream-index="1"
                id="grid-loading"
                label="Orders"
                row-key="id"
                with-search
            >
                <div slot="loading" class="wa-stack wa-align-items-center">
                    <Spinner data-upstream-index="2" style="font-size: 2rem"></Spinner>
                    <small>Loading orders…</small>
                </div>
            </DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-29'">
            <div class="wa-cluster" style="margin-block-end: var(--wa-space-m)">
                <Button data-upstream-index="0" id="grid-virtual-jump">Jump to Row 5,000</Button>
                <Button data-upstream-index="1" id="grid-virtual-top" appearance="outlined"
                    >Back to Top</Button
                >
            </div>
            <DataGrid
                data-upstream-index="2"
                id="grid-virtual"
                label="Sensor readings"
                row-key="id"
                striped
                style="--max-height: 22rem"
            ></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-30'">
            <DataGrid
                data-upstream-index="0"
                id="grid-server"
                label="Audit log"
                row-key="id"
                paginate
                :page-size="10"
                with-search
            ></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-31'">
            <DataGrid data-upstream-index="0" server paginate label="Orders"></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-32'">
            <DataGrid
                data-upstream-index="0"
                id="grid-click"
                label="Customers"
                row-key="id"
            ></DataGrid>
            <Callout
                data-upstream-index="1"
                id="grid-click-result"
                style="margin-block-start: var(--wa-space-m)"
            >
                <Icon data-upstream-index="2" slot="icon" name="circle-info"></Icon>
                Click a cell to inspect it.
            </Callout>
        </template>
        <template v-if="scenario === 'data-grid-33'">
            <DataGrid
                data-upstream-index="0"
                id="grid-copy"
                label="Monthly expenses"
                row-key="id"
                selectable=""
            ></DataGrid>
            <Button
                data-upstream-index="1"
                id="grid-copy-button"
                style="margin-block-start: var(--wa-space-m)"
            >
                <Icon data-upstream-index="2" slot="start" name="copy"></Icon>
                Copy Selected Rows
            </Button>
        </template>
        <template v-if="scenario === 'data-grid-34'">
            <Button
                data-upstream-index="0"
                id="grid-csv-button"
                appearance="filled"
                variant="brand"
            >
                <Icon data-upstream-index="1" slot="start" name="download"></Icon>
                Export CSV
            </Button>
            <DataGrid
                data-upstream-index="2"
                id="grid-csv"
                label="Sales by region"
                row-key="id"
                with-search
                style="margin-block-start: var(--wa-space-m)"
            ></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-35'">
            <div class="wa-cluster">
                <Button data-upstream-index="0" id="grid-state-save">Save Layout</Button>
                <Button data-upstream-index="1" id="grid-state-restore">Restore Layout</Button>
                <Button data-upstream-index="2" id="grid-state-reset">Reset</Button>
            </div>
            <DataGrid
                data-upstream-index="3"
                id="grid-state"
                label="Settings"
                row-key="id"
                resizable
                reorderable
                with-columns-menu
                style="margin-block-start: var(--wa-space-m)"
            ></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-36'">
            <DataGrid
                data-upstream-index="0"
                id="grid-keyboard"
                label="Try the keyboard"
                row-key="id"
                selectable=""
                resizable
                reorderable
            ></DataGrid>
        </template>
        <template v-if="scenario === 'data-grid-37'">
            <DataGrid data-upstream-index="0"></DataGrid>
            <html data-wa-preload="wa-avatar wa-badge wa-rating">
                <!-- … -->
            </html>
        </template>
        <template v-if="scenario === 'data-grid-38'">
            <DataGrid
                data-upstream-index="0"
                id="grid-theme"
                label="Themed"
                row-key="id"
                selectable=""
                striped
                style="
                    --accent-color: var(--wa-color-purple-60);
                    --border-color: color-mix(
                        in oklab,
                        var(--wa-color-purple-60) 25%,
                        var(--wa-color-surface-border)
                    );
                    --border-radius: var(--wa-border-radius-l);
                    --header-background: color-mix(
                        in oklab,
                        var(--wa-color-purple-60) 10%,
                        var(--wa-color-surface-default)
                    );
                    --header-text-color: color-mix(
                        in oklab,
                        var(--wa-color-purple-60) 35%,
                        var(--wa-color-text-normal)
                    );
                    --stripe-background: color-mix(
                        in oklab,
                        var(--wa-color-purple-60) 6%,
                        var(--wa-color-surface-default)
                    );
                    --row-hover-background: color-mix(
                        in oklab,
                        var(--wa-color-purple-60) 12%,
                        var(--wa-color-surface-default)
                    );
                    --selected-background: color-mix(
                        in oklab,
                        var(--wa-color-purple-60) 20%,
                        var(--wa-color-surface-default)
                    );
                    --focus-ring: solid var(--wa-focus-ring-width) var(--wa-color-purple-60);
                "
            ></DataGrid>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    Button,
    Callout,
    Divider,
    Icon,
    Option,
    Select,
    Spinner,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
import { DataGrid } from '@artisan-toolbox/front-awesome/components/WebAwesome/Pro';
defineProps<{ scenario: string }>();
</script>
