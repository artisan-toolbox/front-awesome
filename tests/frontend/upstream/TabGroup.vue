<template>
    <div>
        <template v-if="scenario === 'tab-group-1'">
            <TabGroup data-upstream-index="0">
                <Tab data-upstream-index="1" panel="general">General</Tab>
                <Tab data-upstream-index="2" panel="custom">Custom</Tab>
                <Tab data-upstream-index="3" panel="advanced">Advanced</Tab>
                <Tab data-upstream-index="4" panel="disabled" disabled>Disabled</Tab>

                <TabPanel data-upstream-index="5" name="general" active
                    >This is the general tab panel.</TabPanel
                >
                <TabPanel data-upstream-index="6" name="custom"
                    >This is the custom tab panel.</TabPanel
                >
                <TabPanel data-upstream-index="7" name="advanced"
                    >This is the advanced tab panel.</TabPanel
                >
                <TabPanel data-upstream-index="8" name="disabled"
                    >This is a disabled tab panel.</TabPanel
                >
            </TabGroup>
        </template>
        <template v-if="scenario === 'tab-group-2'">
            <TabGroup data-upstream-index="0" active="advanced">
                <Tab data-upstream-index="1" panel="general">General</Tab>
                <Tab data-upstream-index="2" panel="custom">Custom</Tab>
                <Tab data-upstream-index="3" panel="advanced">Advanced</Tab>

                <TabPanel data-upstream-index="4" name="general"
                    >This is the general tab panel.</TabPanel
                >
                <TabPanel data-upstream-index="5" name="custom"
                    >This is the custom tab panel.</TabPanel
                >
                <TabPanel data-upstream-index="6" name="advanced"
                    >This is the advanced tab panel.</TabPanel
                >
            </TabGroup>
        </template>
        <template v-if="scenario === 'tab-group-3'">
            <TabGroup data-upstream-index="0" placement="bottom">
                <Tab data-upstream-index="1" panel="general">General</Tab>
                <Tab data-upstream-index="2" panel="custom">Custom</Tab>
                <Tab data-upstream-index="3" panel="advanced">Advanced</Tab>
                <Tab data-upstream-index="4" panel="disabled" disabled>Disabled</Tab>

                <TabPanel data-upstream-index="5" name="general" active
                    >This is the general tab panel.</TabPanel
                >
                <TabPanel data-upstream-index="6" name="custom"
                    >This is the custom tab panel.</TabPanel
                >
                <TabPanel data-upstream-index="7" name="advanced"
                    >This is the advanced tab panel.</TabPanel
                >
                <TabPanel data-upstream-index="8" name="disabled"
                    >This is a disabled tab panel.</TabPanel
                >
            </TabGroup>
        </template>
        <template v-if="scenario === 'tab-group-4'">
            <TabGroup data-upstream-index="0" placement="start">
                <Tab data-upstream-index="1" panel="general">General</Tab>
                <Tab data-upstream-index="2" panel="custom">Custom</Tab>
                <Tab data-upstream-index="3" panel="advanced">Advanced</Tab>
                <Tab data-upstream-index="4" panel="disabled" disabled>Disabled</Tab>

                <TabPanel data-upstream-index="5" name="general" active
                    >This is the general tab panel.</TabPanel
                >
                <TabPanel data-upstream-index="6" name="custom"
                    >This is the custom tab panel.</TabPanel
                >
                <TabPanel data-upstream-index="7" name="advanced"
                    >This is the advanced tab panel.</TabPanel
                >
                <TabPanel data-upstream-index="8" name="disabled"
                    >This is a disabled tab panel.</TabPanel
                >
            </TabGroup>
        </template>
        <template v-if="scenario === 'tab-group-5'">
            <TabGroup data-upstream-index="0" class="tabs-closable">
                <Tab data-upstream-index="1" panel="general">General</Tab>
                <Tab data-upstream-index="2" panel="closable">Closable</Tab>
                <Button
                    data-upstream-index="3"
                    slot="nav"
                    tabindex="-1"
                    appearance="plain"
                    size="s"
                >
                    <Icon
                        data-upstream-index="4"
                        name="xmark"
                        label="Close the closable tab"
                    ></Icon>
                </Button>
                <Tab data-upstream-index="5" panel="advanced">Advanced</Tab>

                <TabPanel data-upstream-index="6" name="general"
                    >This is the general tab panel.</TabPanel
                >
                <TabPanel data-upstream-index="7" name="closable"
                    >This is the closable tab panel.</TabPanel
                >
                <TabPanel data-upstream-index="8" name="advanced"
                    >This is the advanced tab panel.</TabPanel
                >
            </TabGroup>

            <br />

            <Button data-upstream-index="9" disabled>Restore tab</Button>
        </template>
        <template v-if="scenario === 'tab-group-6'">
            <TabGroup data-upstream-index="0">
                <Tab data-upstream-index="1" panel="tab-1">Tab 1</Tab>
                <Tab data-upstream-index="2" panel="tab-2">Tab 2</Tab>
                <Tab data-upstream-index="3" panel="tab-3">Tab 3</Tab>
                <Tab data-upstream-index="4" panel="tab-4">Tab 4</Tab>
                <Tab data-upstream-index="5" panel="tab-5">Tab 5</Tab>
                <Tab data-upstream-index="6" panel="tab-6">Tab 6</Tab>
                <Tab data-upstream-index="7" panel="tab-7">Tab 7</Tab>
                <Tab data-upstream-index="8" panel="tab-8">Tab 8</Tab>
                <Tab data-upstream-index="9" panel="tab-9">Tab 9</Tab>
                <Tab data-upstream-index="10" panel="tab-10">Tab 10</Tab>
                <Tab data-upstream-index="11" panel="tab-11">Tab 11</Tab>
                <Tab data-upstream-index="12" panel="tab-12">Tab 12</Tab>
                <Tab data-upstream-index="13" panel="tab-13">Tab 13</Tab>
                <Tab data-upstream-index="14" panel="tab-14">Tab 14</Tab>
                <Tab data-upstream-index="15" panel="tab-15">Tab 15</Tab>
                <Tab data-upstream-index="16" panel="tab-16">Tab 16</Tab>
                <Tab data-upstream-index="17" panel="tab-17">Tab 17</Tab>
                <Tab data-upstream-index="18" panel="tab-18">Tab 18</Tab>
                <Tab data-upstream-index="19" panel="tab-19">Tab 19</Tab>
                <Tab data-upstream-index="20" panel="tab-20">Tab 20</Tab>

                <TabPanel data-upstream-index="21" name="tab-1">Tab panel 1</TabPanel>
                <TabPanel data-upstream-index="22" name="tab-2">Tab panel 2</TabPanel>
                <TabPanel data-upstream-index="23" name="tab-3">Tab panel 3</TabPanel>
                <TabPanel data-upstream-index="24" name="tab-4">Tab panel 4</TabPanel>
                <TabPanel data-upstream-index="25" name="tab-5">Tab panel 5</TabPanel>
                <TabPanel data-upstream-index="26" name="tab-6">Tab panel 6</TabPanel>
                <TabPanel data-upstream-index="27" name="tab-7">Tab panel 7</TabPanel>
                <TabPanel data-upstream-index="28" name="tab-8">Tab panel 8</TabPanel>
                <TabPanel data-upstream-index="29" name="tab-9">Tab panel 9</TabPanel>
                <TabPanel data-upstream-index="30" name="tab-10">Tab panel 10</TabPanel>
                <TabPanel data-upstream-index="31" name="tab-11">Tab panel 11</TabPanel>
                <TabPanel data-upstream-index="32" name="tab-12">Tab panel 12</TabPanel>
                <TabPanel data-upstream-index="33" name="tab-13">Tab panel 13</TabPanel>
                <TabPanel data-upstream-index="34" name="tab-14">Tab panel 14</TabPanel>
                <TabPanel data-upstream-index="35" name="tab-15">Tab panel 15</TabPanel>
                <TabPanel data-upstream-index="36" name="tab-16">Tab panel 16</TabPanel>
                <TabPanel data-upstream-index="37" name="tab-17">Tab panel 17</TabPanel>
                <TabPanel data-upstream-index="38" name="tab-18">Tab panel 18</TabPanel>
                <TabPanel data-upstream-index="39" name="tab-19">Tab panel 19</TabPanel>
                <TabPanel data-upstream-index="40" name="tab-20">Tab panel 20</TabPanel>
            </TabGroup>
        </template>
        <template v-if="scenario === 'tab-group-7'">
            <TabGroup data-upstream-index="0" activation="manual">
                <Tab data-upstream-index="1" panel="general">General</Tab>
                <Tab data-upstream-index="2" panel="custom">Custom</Tab>
                <Tab data-upstream-index="3" panel="advanced">Advanced</Tab>
                <Tab data-upstream-index="4" panel="disabled" disabled>Disabled</Tab>

                <TabPanel data-upstream-index="5" name="general"
                    >This is the general tab panel.</TabPanel
                >
                <TabPanel data-upstream-index="6" name="custom"
                    >This is the custom tab panel.</TabPanel
                >
                <TabPanel data-upstream-index="7" name="advanced"
                    >This is the advanced tab panel.</TabPanel
                >
                <TabPanel data-upstream-index="8" name="disabled"
                    >This is a disabled tab panel.</TabPanel
                >
            </TabGroup>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    Button,
    Icon,
    Tab,
    TabGroup,
    TabPanel,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
