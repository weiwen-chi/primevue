<template>
    <DocSectionText v-bind="$attrs">
        <p>
            Enabling <i>resizable</i> adds resize handles to the right edge, bottom edge and bottom right corner of the dialog. The <i>minWidth</i> and <i>minHeight</i> properties define the minimum size in pixels and the dialog is kept within the
            viewport when <i>keepInViewport</i> is enabled. Progress is reported with the <i>resizestart</i>, <i>resize</i> and <i>resizeend</i> events.
        </p>
    </DocSectionText>
    <div class="card flex justify-center">
        <Button label="Show" @click="visible = true" />

        <Dialog v-model:visible="visible" resizable maximizable :minWidth="300" :minHeight="200" header="Resizable" :style="{ width: '30rem' }" @resizeend="onResizeEnd">
            <p class="m-0">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <template #footer>
                <span class="text-surface-500 dark:text-surface-400">{{ size }}</span>
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
            size: 'Drag the edges or the corner',
            code: {
                basic: `
<Button label="Show" @click="visible = true" />

<Dialog v-model:visible="visible" resizable maximizable :minWidth="300" :minHeight="200" header="Resizable" :style="{ width: '30rem' }" @resizeend="onResizeEnd">
    <p class="m-0">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
        Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
    </p>
    <template #footer>
        <span class="text-surface-500 dark:text-surface-400">{{ size }}</span>
    </template>
</Dialog>
`,
                options: `
<template>
    <div class="card flex justify-center">
        <Button label="Show" @click="visible = true" />
        <Dialog v-model:visible="visible" resizable maximizable :minWidth="300" :minHeight="200" header="Resizable" :style="{ width: '30rem' }" @resizeend="onResizeEnd">
            <p class="m-0">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <template #footer>
                <span class="text-surface-500 dark:text-surface-400">{{ size }}</span>
            </template>
        </Dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            visible: false,
            size: 'Drag the edges or the corner'
        };
    },
    methods: {
        onResizeEnd({ width, height }) {
            this.size = \`\${Math.round(width)} x \${Math.round(height)}\`;
        }
    }
};
<\/script>
`,
                composition: `
<template>
    <div class="card flex justify-center">
        <Button label="Show" @click="visible = true" />
        <Dialog v-model:visible="visible" resizable maximizable :minWidth="300" :minHeight="200" header="Resizable" :style="{ width: '30rem' }" @resizeend="onResizeEnd">
            <p class="m-0">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
            <template #footer>
                <span class="text-surface-500 dark:text-surface-400">{{ size }}</span>
            </template>
        </Dialog>
    </div>
</template>

<script setup>
import { ref } from "vue";

const visible = ref(false);
const size = ref('Drag the edges or the corner');

const onResizeEnd = ({ width, height }) => {
    size.value = \`\${Math.round(width)} x \${Math.round(height)}\`;
};
<\/script>
`
            }
        };
    },
    methods: {
        onResizeEnd({ width, height }) {
            this.size = `${Math.round(width)} x ${Math.round(height)}`;
        }
    }
};
</script>
