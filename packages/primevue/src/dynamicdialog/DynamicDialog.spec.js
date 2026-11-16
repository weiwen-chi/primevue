import { mount } from '@vue/test-utils';
import PrimeVue from 'primevue/config';
import DynamicDialogEventBus from 'primevue/dynamicdialogeventbus';
import { markRaw, nextTick } from 'vue';
import DynamicDialog from './DynamicDialog.vue';

const open = async (props = {}) => {
    const instance = {
        content: markRaw({ template: '<p class="dynamic-content">Dynamic</p>' }),
        options: { props: { header: 'Dynamic', ...props } }
    };

    DynamicDialogEventBus.emit('open', { instance });
    await nextTick();
    await nextTick();

    return instance;
};

describe('DynamicDialog.vue', () => {
    let wrapper;

    beforeEach(async () => {
        wrapper = mount(DynamicDialog, {
            attachTo: document.body,
            global: {
                plugins: [PrimeVue],
                stubs: {
                    teleport: true
                }
            }
        });

        await nextTick();
    });

    afterEach(() => {
        wrapper.unmount();
    });

    it('should render the content of an opened dialog', async () => {
        await open();

        expect(wrapper.find('.p-dialog').exists()).toBe(true);
        expect(wrapper.find('.dynamic-content').exists()).toBe(true);
    });

    it('should pass the new Dialog props through the options', async () => {
        const beforeClose = vi.fn(() => false);

        await open({ resizable: true, maximized: true, beforeClose });

        expect(wrapper.find('.p-dialog').classes()).toContain('p-dialog-maximized');

        await wrapper.find('.p-dialog-close-button').trigger('click');

        expect(beforeClose).toHaveBeenCalledTimes(1);
        expect(wrapper.find('.p-dialog').exists()).toBe(true);
    });

    it('should render resize handles when resizable', async () => {
        await open({ resizable: true });

        expect(wrapper.findAll('.p-dialog-resize-handle')).toHaveLength(3);
    });
});
