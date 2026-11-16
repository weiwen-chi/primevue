<template>
    <DocSectionText v-bind="$attrs">
        <p>
            The <i>beforeClose</i> callback is invoked when the user attempts to close the dialog with the close button, the escape key or a click on the mask. Returning <i>false</i>, or a promise that resolves to <i>false</i>, cancels closing. The
            callback receives an object with the <i>originalEvent</i> and the <i>source</i> of the request, which is either <i>close</i>, <i>escape</i> or <i>mask</i>.
        </p>
        <p>
            Dialogs can be stacked, in this example a second dialog asks for confirmation when there are unsaved changes. The escape key only closes the top-most dialog and focus returns to the previously focused element when a dialog hides, set
            <i>restoreFocus</i> to <i>false</i> to disable it.
        </p>
    </DocSectionText>
    <div class="card flex justify-center">
        <Button label="Show" @click="visible = true" />

        <Dialog v-model:visible="visible" modal dismissableMask header="Edit Profile" :style="{ width: '25rem' }" :beforeClose="beforeClose">
            <div class="flex items-center gap-4 mb-8">
                <label for="guard-username" class="font-semibold w-24">Username</label>
                <InputText id="guard-username" v-model="username" class="flex-auto" autocomplete="off" />
            </div>
            <div class="flex justify-end gap-2">
                <Button type="button" label="Save" @click="save"></Button>
            </div>
        </Dialog>

        <Dialog v-model:visible="confirmVisible" modal header="Unsaved Changes" :style="{ width: '22rem' }" :closable="false" @hide="resolveConfirm(false)">
            <p class="m-0 mb-8">Discard your changes?</p>
            <div class="flex justify-end gap-2">
                <Button type="button" label="Keep Editing" severity="secondary" @click="resolveConfirm(false)" autofocus></Button>
                <Button type="button" label="Discard" severity="danger" @click="resolveConfirm(true)"></Button>
            </div>
        </Dialog>
    </div>
    <DocSectionCode :code="code" />
</template>

<script>
export default {
    data() {
        return {
            visible: false,
            confirmVisible: false,
            username: '',
            saved: '',
            resolver: null,
            code: {
                basic: `
<Button label="Show" @click="visible = true" />

<Dialog v-model:visible="visible" modal dismissableMask header="Edit Profile" :style="{ width: '25rem' }" :beforeClose="beforeClose">
    <div class="flex items-center gap-4 mb-8">
        <label for="username" class="font-semibold w-24">Username</label>
        <InputText id="username" v-model="username" class="flex-auto" autocomplete="off" />
    </div>
    <div class="flex justify-end gap-2">
        <Button type="button" label="Save" @click="save"></Button>
    </div>
</Dialog>

<Dialog v-model:visible="confirmVisible" modal header="Unsaved Changes" :style="{ width: '22rem' }" :closable="false" @hide="resolveConfirm(false)">
    <p class="m-0 mb-8">Discard your changes?</p>
    <div class="flex justify-end gap-2">
        <Button type="button" label="Keep Editing" severity="secondary" @click="resolveConfirm(false)" autofocus></Button>
        <Button type="button" label="Discard" severity="danger" @click="resolveConfirm(true)"></Button>
    </div>
</Dialog>
`,
                options: `
<template>
    <div class="card flex justify-center">
        <Button label="Show" @click="visible = true" />

        <Dialog v-model:visible="visible" modal dismissableMask header="Edit Profile" :style="{ width: '25rem' }" :beforeClose="beforeClose">
            <div class="flex items-center gap-4 mb-8">
                <label for="username" class="font-semibold w-24">Username</label>
                <InputText id="username" v-model="username" class="flex-auto" autocomplete="off" />
            </div>
            <div class="flex justify-end gap-2">
                <Button type="button" label="Save" @click="save"></Button>
            </div>
        </Dialog>

        <Dialog v-model:visible="confirmVisible" modal header="Unsaved Changes" :style="{ width: '22rem' }" :closable="false" @hide="resolveConfirm(false)">
            <p class="m-0 mb-8">Discard your changes?</p>
            <div class="flex justify-end gap-2">
                <Button type="button" label="Keep Editing" severity="secondary" @click="resolveConfirm(false)" autofocus></Button>
                <Button type="button" label="Discard" severity="danger" @click="resolveConfirm(true)"></Button>
            </div>
        </Dialog>
    </div>
</template>

<script>
export default {
    data() {
        return {
            visible: false,
            confirmVisible: false,
            username: '',
            saved: '',
            resolver: null
        };
    },
    methods: {
        beforeClose() {
            if (this.username === this.saved) {
                return true;
            }

            this.confirmVisible = true;

            return new Promise((resolve) => (this.resolver = resolve));
        },
        resolveConfirm(discard) {
            if (this.resolver) {
                this.resolver(discard);
                this.resolver = null;
                discard && (this.username = this.saved);
            }

            this.confirmVisible = false;
        },
        save() {
            this.saved = this.username;
            this.visible = false;
        }
    }
};
<\/script>
`,
                composition: `
<template>
    <div class="card flex justify-center">
        <Button label="Show" @click="visible = true" />

        <Dialog v-model:visible="visible" modal dismissableMask header="Edit Profile" :style="{ width: '25rem' }" :beforeClose="beforeClose">
            <div class="flex items-center gap-4 mb-8">
                <label for="username" class="font-semibold w-24">Username</label>
                <InputText id="username" v-model="username" class="flex-auto" autocomplete="off" />
            </div>
            <div class="flex justify-end gap-2">
                <Button type="button" label="Save" @click="save"></Button>
            </div>
        </Dialog>

        <Dialog v-model:visible="confirmVisible" modal header="Unsaved Changes" :style="{ width: '22rem' }" :closable="false" @hide="resolveConfirm(false)">
            <p class="m-0 mb-8">Discard your changes?</p>
            <div class="flex justify-end gap-2">
                <Button type="button" label="Keep Editing" severity="secondary" @click="resolveConfirm(false)" autofocus></Button>
                <Button type="button" label="Discard" severity="danger" @click="resolveConfirm(true)"></Button>
            </div>
        </Dialog>
    </div>
</template>

<script setup>
import { ref } from "vue";

const visible = ref(false);
const confirmVisible = ref(false);
const username = ref('');
const saved = ref('');
let resolver = null;

const beforeClose = () => {
    if (username.value === saved.value) {
        return true;
    }

    confirmVisible.value = true;

    return new Promise((resolve) => (resolver = resolve));
};

const resolveConfirm = (discard) => {
    if (resolver) {
        resolver(discard);
        resolver = null;
        discard && (username.value = saved.value);
    }

    confirmVisible.value = false;
};

const save = () => {
    saved.value = username.value;
    visible.value = false;
};
<\/script>
`
            }
        };
    },
    methods: {
        beforeClose() {
            if (this.username === this.saved) {
                return true;
            }

            this.confirmVisible = true;

            return new Promise((resolve) => (this.resolver = resolve));
        },
        resolveConfirm(discard) {
            if (this.resolver) {
                this.resolver(discard);
                this.resolver = null;
                discard && (this.username = this.saved);
            }

            this.confirmVisible = false;
        },
        save() {
            this.saved = this.username;
            this.visible = false;
        }
    }
};
</script>
