<template>
    <DocSectionText v-bind="$attrs">
        <p>There are four choices to position the tooltip, default value is <i>right</i> and alternatives are <i>top</i>, <i>bottom</i>, <i>left</i>.</p>
        <p>
            When there is not enough room on the requested side the tooltip flips to another side and is always shifted to stay inside the viewport, its arrow keeps pointing at the host. Set <i>flip</i> to false to disable flipping, and use
            <i>offset</i> and <i>viewportPadding</i> (in pixels, defaults 0 and 4) to adjust the distance to the host and to the viewport edges.
        </p>
    </DocSectionText>
    <div class="card flex flex-wrap justify-center gap-2">
        <InputText v-tooltip="'Enter your username'" type="text" placeholder="Right" />
        <InputText v-tooltip.top="'Enter your username'" type="text" placeholder="Top" />
        <InputText v-tooltip.bottom="'Enter your username'" type="text" placeholder="Bottom" />
        <InputText v-tooltip.left="'Enter your username'" type="text" placeholder="Left" />
    </div>
    <DocSectionCode :code="code" />
</template>

<script>
export default {
    data() {
        return {
            code: {
                basic: `
<InputText v-tooltip="'Enter your username'" type="text" placeholder="Right" />
<InputText v-tooltip.top="'Enter your username'" type="text" placeholder="Top" />
<InputText v-tooltip.bottom="'Enter your username'" type="text" placeholder="Bottom" />
<InputText v-tooltip.left="'Enter your username'" type="text" placeholder="Left" />
`,
                options: `
<template>
    <div class="card flex flex-wrap justify-center gap-2">
        <InputText v-tooltip="'Enter your username'" type="text" placeholder="Right" />
        <InputText v-tooltip.top="'Enter your username'" type="text" placeholder="Top" />
        <InputText v-tooltip.bottom="'Enter your username'" type="text" placeholder="Bottom" />
        <InputText v-tooltip.left="'Enter your username'" type="text" placeholder="Left" />
    </div>
</template>
`,
                composition: `
<template>
    <div class="card flex flex-wrap justify-center gap-2">
        <InputText v-tooltip="'Enter your username'" type="text" placeholder="Right" />
        <InputText v-tooltip.top="'Enter your username'" type="text" placeholder="Top" />
        <InputText v-tooltip.bottom="'Enter your username'" type="text" placeholder="Bottom" />
        <InputText v-tooltip.left="'Enter your username'" type="text" placeholder="Left" />
    </div>
</template>
`
            }
        };
    }
};
</script>
