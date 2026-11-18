<template>
    <DocSectionText v-bind="$attrs">
        <p>
            The maximized state can be controlled with the <i>v-model:maximized</i> binding, for example to open a dialog in full screen mode. The binding also works without <i>maximizable</i> to display a full screen dialog that has no maximize
            button.
        </p>
    </DocSectionText>
    <div class="card flex justify-center">
        <Button label="Show" @click="visible = true" />

        <Dialog v-model:visible="visible" v-model:maximized="maximized" maximizable header="Full Screen" :style="{ width: '30rem' }">
            <p class="m-0">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <template #footer>
                <Button :label="maximized ? 'Restore' : 'Maximize'" severity="secondary" @click="maximized = !maximized" />
                <Button label="Close" @click="visible = false" />
            </template>
        </Dialog>
    </div>
    <DocSectionCode :code="code" />
</template>

<script>
export default {
    data() {
        return {
            visible: false,
            maximized: true,
            code: {
                basic: `
<Button label="Show" @click="visible = true" />

<Dialog v-model:visible="visible" v-model:maximized="maximized" maximizable header="Full Screen" :style="{ width: '30rem' }">
    <p class="m-0">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
    </p>
    <template #footer>
        <Button :label="maximized ? 'Restore' : 'Maximize'" severity="secondary" @click="maximized = !maximized" />
        <Button label="Close" @click="visible = false" />
    </template>
</Dialog>
`,
                options: `
<template>
    <div class="card flex justify-center">
        <Button label="Show" @click="visible = true" />
        <Dialog v-model:visible="visible" v-model:maximized="maximized" maximizable header="Full Screen" :style="{ width: '30rem' }">
            <p class="m-0">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <template #footer>
                <Button :label="maximized ? 'Restore' : 'Maximize'" severity="secondary" @click="maximized = !maximized" />
                <Button label="Close" @click="visible = false" />
            </template>
        </Dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            visible: false,
            maximized: true
        };
    }
};
<\/script>
`,
                composition: `
<template>
    <div class="card flex justify-center">
        <Button label="Show" @click="visible = true" />
        <Dialog v-model:visible="visible" v-model:maximized="maximized" maximizable header="Full Screen" :style="{ width: '30rem' }">
            <p class="m-0">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
            </p>
            <template #footer>
                <Button :label="maximized ? 'Restore' : 'Maximize'" severity="secondary" @click="maximized = !maximized" />
                <Button label="Close" @click="visible = false" />
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref } from "vue";

const visible = ref(false);
const maximized = ref(true);
<\/script>
`
            }
        };
    }
};
</script>
