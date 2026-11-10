<template>
    <div>
        <template v-if="scenario === 'tree-1'">
            <Tree data-upstream-index="0" style="--indent-guide-width: 1px">
                <TreeItem data-upstream-index="1" expanded>
                    Deciduous
                    <TreeItem data-upstream-index="2">Birch</TreeItem>
                    <TreeItem data-upstream-index="3" expanded>
                        Maple
                        <TreeItem data-upstream-index="4">Field maple</TreeItem>
                        <TreeItem data-upstream-index="5">Red maple</TreeItem>
                        <TreeItem data-upstream-index="6">Sugar maple</TreeItem>
                    </TreeItem>
                    <TreeItem data-upstream-index="7">Oak</TreeItem>
                    <TreeItem data-upstream-index="8">Walnut</TreeItem>
                </TreeItem>

                <TreeItem data-upstream-index="9">
                    Coniferous
                    <TreeItem data-upstream-index="10">Cedar</TreeItem>
                    <TreeItem data-upstream-index="11">
                        Pine
                        <TreeItem data-upstream-index="12">Eastern white pine</TreeItem>
                        <TreeItem data-upstream-index="13">Ponderosa pine</TreeItem>
                        <TreeItem data-upstream-index="14">Scots pine</TreeItem>
                    </TreeItem>
                    <TreeItem data-upstream-index="15">Spruce</TreeItem>
                    <TreeItem data-upstream-index="16">Fir</TreeItem>
                </TreeItem>

                <TreeItem data-upstream-index="17">
                    Tropical
                    <TreeItem data-upstream-index="18">Banyan</TreeItem>
                    <TreeItem data-upstream-index="19">Coconut palm</TreeItem>
                    <TreeItem data-upstream-index="20">Mahogany</TreeItem>
                    <TreeItem data-upstream-index="21">Teak</TreeItem>
                </TreeItem>
            </Tree>
        </template>
        <template v-if="scenario === 'tree-2'">
            <div>
                <Tree data-upstream-index="0" class="tree-selectable">
                    <TreeItem data-upstream-index="1" expanded>
                        Electronics
                        <TreeItem data-upstream-index="2" expanded>
                            Computers
                            <TreeItem data-upstream-index="3">Laptops</TreeItem>
                            <TreeItem data-upstream-index="4">Desktops</TreeItem>
                            <TreeItem data-upstream-index="5">Tablets</TreeItem>
                        </TreeItem>
                        <TreeItem data-upstream-index="6">
                            Phones
                            <TreeItem data-upstream-index="7">Smartphones</TreeItem>
                            <TreeItem data-upstream-index="8">Accessories</TreeItem>
                        </TreeItem>
                    </TreeItem>
                    <TreeItem data-upstream-index="9">
                        Clothing
                        <TreeItem data-upstream-index="10">Shirts</TreeItem>
                        <TreeItem data-upstream-index="11">Pants</TreeItem>
                        <TreeItem data-upstream-index="12">Shoes</TreeItem>
                    </TreeItem>
                    <TreeItem data-upstream-index="13">Books</TreeItem>
                </Tree>

                <Divider data-upstream-index="14"></Divider>

                <Select
                    data-upstream-index="15"
                    id="selection-mode"
                    value="single"
                    label="Selection"
                >
                    <Option data-upstream-index="16" value="single">Single</Option>
                    <Option data-upstream-index="17" value="multiple">Multiple</Option>
                    <Option data-upstream-index="18" value="leaf">Leaf</Option>
                    <Option data-upstream-index="19" value="leaf-multiple">Leaf-multiple</Option>
                </Select>
            </div>
        </template>
        <template v-if="scenario === 'tree-3'">
            <Tree data-upstream-index="0" style="font-size: 0.75rem" selection="multiple">
                <TreeItem data-upstream-index="1" expanded>
                    Small
                    <TreeItem data-upstream-index="2">Newsletters</TreeItem>
                    <TreeItem data-upstream-index="3">
                        Promotions
                        <TreeItem data-upstream-index="4">Weekly deals</TreeItem>
                        <TreeItem data-upstream-index="5">Seasonal sales</TreeItem>
                    </TreeItem>
                </TreeItem>
            </Tree>

            <br />

            <Tree data-upstream-index="6" selection="multiple">
                <TreeItem data-upstream-index="7" expanded>
                    Default
                    <TreeItem data-upstream-index="8">Newsletters</TreeItem>
                    <TreeItem data-upstream-index="9">
                        Promotions
                        <TreeItem data-upstream-index="10">Weekly deals</TreeItem>
                        <TreeItem data-upstream-index="11">Seasonal sales</TreeItem>
                    </TreeItem>
                </TreeItem>
            </Tree>

            <br />

            <Tree data-upstream-index="12" style="font-size: 1.5rem" selection="multiple">
                <TreeItem data-upstream-index="13" expanded>
                    Large
                    <TreeItem data-upstream-index="14">Newsletters</TreeItem>
                    <TreeItem data-upstream-index="15">
                        Promotions
                        <TreeItem data-upstream-index="16">Weekly deals</TreeItem>
                        <TreeItem data-upstream-index="17">Seasonal sales</TreeItem>
                    </TreeItem>
                </TreeItem>
            </Tree>
        </template>
        <template v-if="scenario === 'tree-4'">
            <Tree data-upstream-index="0" class="tree-with-lines">
                <TreeItem data-upstream-index="1" expanded>
                    Design
                    <TreeItem data-upstream-index="2" expanded>
                        Brand
                        <TreeItem data-upstream-index="3">Colors</TreeItem>
                        <TreeItem data-upstream-index="4">Typography</TreeItem>
                        <TreeItem data-upstream-index="5">Logo</TreeItem>
                    </TreeItem>
                    <TreeItem data-upstream-index="6">
                        Components
                        <TreeItem data-upstream-index="7">Buttons</TreeItem>
                        <TreeItem data-upstream-index="8">Forms</TreeItem>
                        <TreeItem data-upstream-index="9">Navigation</TreeItem>
                    </TreeItem>
                </TreeItem>

                <TreeItem data-upstream-index="10" expanded>
                    Development
                    <TreeItem data-upstream-index="11">Frontend</TreeItem>
                    <TreeItem data-upstream-index="12">Backend</TreeItem>
                    <TreeItem data-upstream-index="13">Infrastructure</TreeItem>
                </TreeItem>

                <TreeItem data-upstream-index="14">
                    Marketing
                    <TreeItem data-upstream-index="15">Social Media</TreeItem>
                    <TreeItem data-upstream-index="16">Email Campaigns</TreeItem>
                    <TreeItem data-upstream-index="17">Analytics</TreeItem>
                </TreeItem>
            </Tree>
        </template>
        <template v-if="scenario === 'tree-5'">
            <Tree data-upstream-index="0" class="custom-icons">
                <Icon
                    data-upstream-index="1"
                    name="square-plus"
                    variant="solid"
                    slot="expand-icon"
                ></Icon>
                <Icon
                    data-upstream-index="2"
                    name="square-minus"
                    variant="solid"
                    slot="collapse-icon"
                ></Icon>

                <TreeItem data-upstream-index="3" expanded>
                    Recipes
                    <TreeItem data-upstream-index="4" expanded>
                        Breakfast
                        <TreeItem data-upstream-index="5">Pancakes</TreeItem>
                        <TreeItem data-upstream-index="6">Omelette</TreeItem>
                        <TreeItem data-upstream-index="7">Granola</TreeItem>
                    </TreeItem>
                    <TreeItem data-upstream-index="8">
                        Lunch
                        <TreeItem data-upstream-index="9">Caesar salad</TreeItem>
                        <TreeItem data-upstream-index="10">Grilled chicken wrap</TreeItem>
                    </TreeItem>
                    <TreeItem data-upstream-index="11">
                        Dinner
                        <TreeItem data-upstream-index="12">Pasta carbonara</TreeItem>
                        <TreeItem data-upstream-index="13">Stir fry</TreeItem>
                        <TreeItem data-upstream-index="14">Roasted salmon</TreeItem>
                    </TreeItem>
                </TreeItem>

                <TreeItem data-upstream-index="15">
                    Desserts
                    <TreeItem data-upstream-index="16">Chocolate cake</TreeItem>
                    <TreeItem data-upstream-index="17">Tiramisu</TreeItem>
                    <TreeItem data-upstream-index="18">Fruit tart</TreeItem>
                </TreeItem>
            </Tree>
        </template>
        <template v-if="scenario === 'tree-6'">
            <Tree data-upstream-index="0" class="tree-with-icons">
                <TreeItem data-upstream-index="1" expanded>
                    <Icon data-upstream-index="2" name="folder" variant="regular"></Icon>
                    Documents

                    <TreeItem data-upstream-index="3" expanded>
                        <Icon data-upstream-index="4" name="folder" variant="regular"></Icon>
                        Photos
                        <TreeItem data-upstream-index="5">
                            <Icon data-upstream-index="6" name="image" variant="regular"></Icon>
                            vacation.jpg
                        </TreeItem>
                        <TreeItem data-upstream-index="7">
                            <Icon data-upstream-index="8" name="image" variant="regular"></Icon>
                            family-portrait.png
                        </TreeItem>
                        <TreeItem data-upstream-index="9">
                            <Icon data-upstream-index="10" name="image" variant="regular"></Icon>
                            sunset.jpg
                        </TreeItem>
                    </TreeItem>

                    <TreeItem data-upstream-index="11" expanded>
                        <Icon data-upstream-index="12" name="folder" variant="regular"></Icon>
                        Work
                        <TreeItem data-upstream-index="13">
                            <Icon data-upstream-index="14" name="file-pdf" variant="regular"></Icon>
                            quarterly-report.pdf
                        </TreeItem>
                        <TreeItem data-upstream-index="15">
                            <Icon
                                data-upstream-index="16"
                                name="file-lines"
                                variant="regular"
                            ></Icon>
                            budget.xls
                        </TreeItem>
                        <TreeItem data-upstream-index="17">
                            <Icon data-upstream-index="18" name="file" variant="regular"></Icon>
                            meeting-notes.txt
                        </TreeItem>
                    </TreeItem>

                    <TreeItem data-upstream-index="19">
                        <Icon data-upstream-index="20" name="folder" variant="regular"></Icon>
                        Personal
                        <TreeItem data-upstream-index="21">
                            <Icon data-upstream-index="22" name="file" variant="regular"></Icon>
                            journal.txt
                        </TreeItem>
                        <TreeItem data-upstream-index="23">
                            <Icon data-upstream-index="24" name="file-pdf" variant="regular"></Icon>
                            resume.pdf
                        </TreeItem>
                    </TreeItem>
                </TreeItem>

                <TreeItem data-upstream-index="25">
                    <Icon data-upstream-index="26" name="folder" variant="regular"></Icon>
                    Downloads
                    <TreeItem data-upstream-index="27">
                        <Icon data-upstream-index="28" name="file-zipper" variant="regular"></Icon>
                        archive.zip
                    </TreeItem>
                    <TreeItem data-upstream-index="29">
                        <Icon data-upstream-index="30" name="file" variant="regular"></Icon>
                        readme.txt
                    </TreeItem>
                </TreeItem>
            </Tree>
        </template>
        <template v-if="scenario === 'tree-7'">
            <Tree data-upstream-index="0">
                <TreeItem data-upstream-index="1" lazy>Remote Repositories</TreeItem>
            </Tree>
        </template>
    </div>
</template>

<script setup lang="ts">
import {
    Divider,
    Icon,
    Option,
    Select,
    Tree,
    TreeItem,
} from '@artisan-toolbox/front-awesome/components/WebAwesome';
defineProps<{ scenario: string }>();
</script>
