<template>
    <DocSectionText v-bind="$attrs">
        <p>
            Content of a dialog is rendered lazily when the dialog is displayed and destroyed by default when it hides. Setting <i>destroyOnClose</i> to <i>false</i> keeps the content alive after the first display so that its state, such as the
            uncontrolled inputs below, is preserved between openings.
        </p>
    </DocSectionText>
    <div class="card flex justify-center">
        <Button label="Show" @click="visible = true" />

        <Dialog v-model:visible="visible" :destroyOnClose="false" header="Draft" :style="{ width: '25rem' }">
            <span class="text-surface-500 dark:text-surface-400 block mb-4">Type something, close the dialog and open it again.</span>
            <InputText class="w-full mb-4" placeholder="Subject" autocomplete="off" />
            <Textarea class="w-full" rows="4" placeholder="Message" />
        </Dialog>
    </div>
    <DocSectionCode :code="code" />
</template>

<script>
export default {
    data() {
        return {
            visible: false,
            code: {
                basic: `
<Button label="Show" @click="visible = true" />

<Dialog v-model:visible="visible" :destroyOnClose="false" header="Draft" :style="{ width: '25rem' }">
    <span class="text-surface-500 dark:text-surface-400 block mb-4">Type something, close the dialog and open it again.</span>
    <InputText class="w-full mb-4" placeholder="Subject" autocomplete="off" />
    <Textarea class="w-full" rows="4" placeholder="Message" />
</Dialog>
`,
                options: `
<template>
    <div class="card flex justify-center">
        <Button label="Show" @click="visible = true" />
        <Dialog v-model:visible="visible" :destroyOnClose="false" header="Draft" :style="{ width: '25rem' }">
            <span class="text-surface-500 dark:text-surface-400 block mb-4">Type something, close the dialog and open it again.</span>
            <InputText class="w-full mb-4" placeholder="Subject" autocomplete="off" />
            <Textarea class="w-full" rows="4" placeholder="Message" />
        </Dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            visible: false
        };
    }
};
<\/script>
`,
                composition: `
<template>
    <div class="card flex justify-center">
        <Button label="Show" @click="visible = true" />
        <Dialog v-model:visible="visible" :destroyOnClose="false" header="Draft" :style="{ width: '25rem' }">
            <span class="text-surface-500 dark:text-surface-400 block mb-4">Type something, close the dialog and open it again.</span>
            <InputText class="w-full mb-4" placeholder="Subject" autocomplete="off" />
            <Textarea class="w-full" rows="4" placeholder="Message" />
        </Dialog>
    </div>
</template>

<script setup>
import { ref } from "vue";

const visible = ref(false);
<\/script>
`
            }
        };
    }
};
</script>
