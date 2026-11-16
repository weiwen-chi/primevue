import PrimeVue from 'primevue/config';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import Dialog from './Dialog.vue';

describe('Dialog.vue', () => {
    it('is Dialog element exist', async () => {
        const wrapper = mount(Dialog, {
            global: {
                plugins: [PrimeVue],
                stubs: {
                    teleport: true,
                    transition: false
                }
            },
            props: {
                visible: false
            },
            data() {
                return {
                    containerVisible: true
                };
            }
        });

        expect(wrapper.find('.p-dialog.p-component').exists()).toBe(false);

        await wrapper.setProps({ visible: true });

        expect(wrapper.find('.p-dialog.p-component').exists()).toBe(true);
    });

    it('slot checks', async () => {
        const wrapper = mount(Dialog, {
            global: {
                plugins: [PrimeVue],
                stubs: {
                    teleport: true
                }
            },
            slots: {
                default: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit</p>',
                footer: '<p>Dialog Footer</p>'
            },
            data() {
                return {
                    containerVisible: true
                };
            }
        });

        await wrapper.setProps({ visible: true });

        expect(wrapper.find('.p-dialog-content').exists()).toBe(true);
        expect(wrapper.find('.p-dialog-footer').exists()).toBe(true);
    });
});

describe('closable', () => {
    it('should have custom close icon when provided', async () => {
        const wrapper = mount(Dialog, {
            global: {
                plugins: [PrimeVue],
                stubs: {
                    teleport: true
                }
            },
            props: {
                closable: true,
                closeIcon: 'pi pi-discord',
                showHeader: true,
                visible: false
            },
            data() {
                return {
                    containerVisible: true
                };
            }
        });

        await wrapper.setProps({ visible: true });

        const icon = wrapper.find('.p-dialog-close-button .p-button-icon');

        expect(icon.classes()).toContain('pi-discord');
    });
});

describe('maximizable', () => {
    it('should have custom maximize and minimize icons when provided', async () => {
        const wrapper = mount(Dialog, {
            global: {
                plugins: [PrimeVue],
                stubs: {
                    teleport: true
                }
            },
            props: {
                maximizable: true,
                maximizeIcon: 'pi pi-discord',
                minimizeIcon: 'pi pi-facebook',
                showHeader: true,
                visible: false
            },
            data() {
                return {
                    containerVisible: true
                };
            }
        });

        await wrapper.setProps({ visible: true });

        let icon = wrapper.find('.p-dialog-maximize-button .p-button-icon');

        expect(icon.classes()).toContain('pi-discord');

        await wrapper.setProps({ maximized: true });

        icon = wrapper.find('.p-dialog-maximize-button .p-button-icon');

        expect(icon.classes()).toContain('pi-facebook');
    });
});

const mountDialog = async (props = {}, options = {}) => {
    const wrapper = mount(Dialog, {
        attachTo: document.body,
        global: {
            plugins: [PrimeVue],
            stubs: {
                teleport: true
            }
        },
        slots: {
            default: '<p class="dialog-body">Content</p>'
        },
        ...options,
        props: {
            header: 'Header',
            ...props
        }
    });

    // Portal renders its content after it has been mounted
    await nextTick();

    return wrapper;
};

const flushPromises = () => new Promise((resolve) => setTimeout(resolve));

describe('maximized v-model', () => {
    it('should render maximized when the maximized prop is true', async () => {
        const wrapper = await mountDialog({ visible: true, maximizable: true, maximized: true });

        expect(wrapper.find('.p-dialog').classes()).toContain('p-dialog-maximized');

        await wrapper.setProps({ maximized: false });

        expect(wrapper.find('.p-dialog').classes()).not.toContain('p-dialog-maximized');

        wrapper.unmount();
    });

    it('should emit update:maximized when the maximize button is clicked', async () => {
        const wrapper = await mountDialog({ visible: true, maximizable: true });

        await wrapper.find('.p-dialog-maximize-button').trigger('click');

        expect(wrapper.emitted('update:maximized')[0]).toEqual([true]);
        expect(wrapper.emitted('maximize')).toHaveLength(1);
        expect(wrapper.find('.p-dialog').classes()).toContain('p-dialog-maximized');

        await wrapper.find('.p-dialog-maximize-button').trigger('click');

        expect(wrapper.emitted('update:maximized')[1]).toEqual([false]);
        expect(wrapper.emitted('unmaximize')).toHaveLength(1);

        wrapper.unmount();
    });

    it('should support maximized without the maximize button', async () => {
        const wrapper = await mountDialog({ visible: true, maximized: true });

        expect(wrapper.find('.p-dialog-maximize-button').exists()).toBe(false);
        expect(wrapper.find('.p-dialog').classes()).toContain('p-dialog-maximized');

        wrapper.unmount();
    });
});

describe('beforeClose', () => {
    it('should close when no guard is provided', async () => {
        const wrapper = await mountDialog({ visible: true });

        await wrapper.find('.p-dialog-close-button').trigger('click');

        expect(wrapper.emitted('update:visible')[0]).toEqual([false]);

        wrapper.unmount();
    });

    it('should cancel closing when the guard returns false', async () => {
        const beforeClose = vi.fn(() => false);
        const wrapper = await mountDialog({ visible: true, beforeClose });

        await wrapper.find('.p-dialog-close-button').trigger('click');

        expect(beforeClose).toHaveBeenCalledTimes(1);
        expect(beforeClose.mock.calls[0][0].source).toBe('close');
        expect(wrapper.emitted('update:visible')).toBeUndefined();

        wrapper.unmount();
    });

    it('should close when the guard returns true or nothing', async () => {
        const wrapper = await mountDialog({ visible: true, beforeClose: () => true });

        await wrapper.find('.p-dialog-close-button').trigger('click');
        expect(wrapper.emitted('update:visible')).toHaveLength(1);

        await wrapper.setProps({ beforeClose: () => undefined });
        await wrapper.find('.p-dialog-close-button').trigger('click');
        expect(wrapper.emitted('update:visible')).toHaveLength(2);

        wrapper.unmount();
    });

    it('should wait for an async guard', async () => {
        let resolveGuard;
        const beforeClose = vi.fn(() => new Promise((resolve) => (resolveGuard = resolve)));
        const wrapper = await mountDialog({ visible: true, beforeClose });

        await wrapper.find('.p-dialog-close-button').trigger('click');
        // repeated clicks while the guard is pending are ignored
        await wrapper.find('.p-dialog-close-button').trigger('click');

        expect(beforeClose).toHaveBeenCalledTimes(1);
        expect(wrapper.emitted('update:visible')).toBeUndefined();

        resolveGuard(true);
        await flushPromises();

        expect(wrapper.emitted('update:visible')[0]).toEqual([false]);

        wrapper.unmount();
    });

    it('should cancel closing when an async guard resolves false or rejects', async () => {
        const wrapper = await mountDialog({ visible: true, beforeClose: () => Promise.resolve(false) });

        await wrapper.find('.p-dialog-close-button').trigger('click');
        await flushPromises();
        expect(wrapper.emitted('update:visible')).toBeUndefined();

        await wrapper.setProps({ beforeClose: () => Promise.reject(new Error('nope')) });
        await wrapper.find('.p-dialog-close-button').trigger('click');
        await flushPromises();
        expect(wrapper.emitted('update:visible')).toBeUndefined();

        wrapper.unmount();
    });

    it('should be called for escape and mask clicks with the matching source', async () => {
        const beforeClose = vi.fn(() => false);
        const wrapper = await mountDialog({ visible: true, modal: true, dismissableMask: true, beforeClose });

        wrapper.vm.registerToStack();
        wrapper.vm.onKeyDown({ code: 'Escape', isComposing: false });

        const mask = wrapper.find('.p-dialog-mask');

        await mask.trigger('mousedown');
        await mask.trigger('mouseup');

        expect(beforeClose.mock.calls.map(([event]) => event.source)).toEqual(['escape', 'mask']);
        expect(wrapper.emitted('update:visible')).toBeUndefined();

        wrapper.unmount();
    });
});

describe('destroyOnClose', () => {
    it('should not render content before the first open', async () => {
        const wrapper = await mountDialog({ visible: false, destroyOnClose: false, appendTo: 'self' });

        expect(wrapper.find('.dialog-body').exists()).toBe(false);

        wrapper.unmount();
    });

    it('should destroy content on close by default', async () => {
        const wrapper = await mountDialog({ visible: true });

        expect(wrapper.find('.dialog-body').exists()).toBe(true);

        await wrapper.setProps({ visible: false });

        expect(wrapper.find('.dialog-body').exists()).toBe(false);

        wrapper.unmount();
    });

    it('should keep content alive when destroyOnClose is false', async () => {
        const wrapper = await mountDialog({ visible: false, destroyOnClose: false, appendTo: 'self' });

        await wrapper.setProps({ visible: true });

        const content = wrapper.find('.dialog-body');

        expect(content.exists()).toBe(true);

        await wrapper.setProps({ visible: false });

        expect(wrapper.find('.dialog-body').exists()).toBe(true);
        expect(wrapper.find('.dialog-body').element).toBe(content.element);
        expect(wrapper.find('.p-dialog').isVisible()).toBe(false);

        await wrapper.setProps({ visible: true });

        expect(wrapper.find('.dialog-body').element).toBe(content.element);
        expect(wrapper.find('.p-dialog').isVisible()).toBe(true);

        wrapper.unmount();
    });
});

describe('stacked dialogs', () => {
    it('should only close the top-most dialog on escape', async () => {
        const first = await mountDialog({ visible: true });
        const second = await mountDialog({ visible: true });

        first.vm.onEnter();
        second.vm.onEnter();

        document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' }));

        expect(first.emitted('update:visible')).toBeUndefined();
        expect(second.emitted('update:visible')[0]).toEqual([false]);

        second.vm.onLeave();
        second.vm.onAfterLeave();

        document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' }));

        expect(first.emitted('update:visible')[0]).toEqual([false]);

        first.unmount();
        second.unmount();
    });

    it('should not close a lower dialog when the top-most one ignores escape', async () => {
        const first = await mountDialog({ visible: true });
        const second = await mountDialog({ visible: true, closeOnEscape: false });

        first.vm.onEnter();
        second.vm.onEnter();

        document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' }));

        expect(first.emitted('update:visible')).toBeUndefined();
        expect(second.emitted('update:visible')).toBeUndefined();

        first.unmount();
        second.unmount();
    });

    it('should remove an unmounted dialog from the stack', async () => {
        const first = await mountDialog({ visible: true });
        const second = await mountDialog({ visible: true });

        first.vm.onEnter();
        second.vm.onEnter();
        second.unmount();

        document.dispatchEvent(new KeyboardEvent('keydown', { code: 'Escape' }));

        expect(first.emitted('update:visible')[0]).toEqual([false]);

        first.unmount();
    });
});

describe('restoreFocus', () => {
    let trigger;

    beforeEach(() => {
        trigger = document.createElement('button');
        document.body.appendChild(trigger);
        trigger.focus();
    });

    afterEach(() => {
        trigger.remove();
    });

    it('should return focus to the previously focused element on close', async () => {
        const wrapper = await mountDialog({ visible: true });

        wrapper.vm.onEnter();
        wrapper.find('.p-dialog-close-button').element.focus();
        wrapper.vm.onLeave();

        expect(document.activeElement).toBe(trigger);

        wrapper.unmount();
    });

    it('should not restore focus when restoreFocus is false', async () => {
        const wrapper = await mountDialog({ visible: true, restoreFocus: false });

        wrapper.vm.onEnter();
        wrapper.find('.p-dialog-close-button').element.focus();
        wrapper.vm.onLeave();

        expect(document.activeElement).not.toBe(trigger);

        wrapper.unmount();
    });
});

describe('resizable', () => {
    let frames;

    const flushFrames = () => {
        const callbacks = [...frames.values()];

        frames.clear();
        callbacks.forEach((callback) => callback());
    };

    // pointer moves are applied on the next animation frame, flush it right away unless asked otherwise
    const pointer = async (type, x, y, flush = true) => {
        document.dispatchEvent(new MouseEvent(type, { clientX: x, clientY: y, bubbles: true }));
        flush && type === 'pointermove' && flushFrames();
        await nextTick();
    };

    beforeEach(() => {
        let id = 0;

        frames = new Map();
        vi.stubGlobal(
            'requestAnimationFrame',
            vi.fn((callback) => {
                frames.set(++id, callback);

                return id;
            })
        );
        vi.stubGlobal(
            'cancelAnimationFrame',
            vi.fn((frameId) => frames.delete(frameId))
        );
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    const mockRect = (wrapper, rect = { left: 100, top: 100, width: 400, height: 300 }) => {
        wrapper.find('.p-dialog').element.getBoundingClientRect = () => ({ ...rect, right: rect.left + rect.width, bottom: rect.top + rect.height, x: rect.left, y: rect.top });
    };

    it('should not render resize handles by default', async () => {
        const wrapper = await mountDialog({ visible: true });

        expect(wrapper.find('.p-dialog-resize-handle').exists()).toBe(false);

        wrapper.unmount();
    });

    it('should render resize handles when resizable', async () => {
        const wrapper = await mountDialog({ visible: true, resizable: true });
        const handles = wrapper.findAll('.p-dialog-resize-handle');

        expect(handles.map((handle) => handle.attributes('data-p-direction'))).toEqual(['e', 's', 'se']);
        expect(wrapper.find('.p-dialog').classes()).toContain('p-dialog-resizable');

        wrapper.unmount();
    });

    it('should resize from the corner handle and emit events', async () => {
        const wrapper = await mountDialog({ visible: true, resizable: true });

        mockRect(wrapper);

        await wrapper.find('.p-dialog-resize-handle-se').trigger('pointerdown', { clientX: 500, clientY: 400, button: 0 });

        expect(wrapper.emitted('resizestart')[0][0]).toMatchObject({ width: 400, height: 300 });

        await pointer('pointermove', 550, 450);

        const element = wrapper.find('.p-dialog').element;

        expect(element.style.width).toBe('450px');
        expect(element.style.height).toBe('350px');
        expect(element.style.position).toBe('fixed');
        expect(wrapper.emitted('resize')[0][0]).toMatchObject({ width: 450, height: 350 });

        await pointer('pointerup', 550, 450);

        expect(wrapper.emitted('resizeend')[0][0]).toMatchObject({ width: 450, height: 350 });

        // listeners are removed after resize end
        await pointer('pointermove', 700, 600);
        expect(element.style.width).toBe('450px');

        wrapper.unmount();
    });

    it('should only change the width from the east handle', async () => {
        const wrapper = await mountDialog({ visible: true, resizable: true });

        mockRect(wrapper);

        await wrapper.find('.p-dialog-resize-handle-e').trigger('pointerdown', { clientX: 500, clientY: 200, button: 0 });
        await pointer('pointermove', 560, 260);

        const element = wrapper.find('.p-dialog').element;

        expect(element.style.width).toBe('460px');
        expect(element.style.height).toBe('300px');

        await pointer('pointerup', 560, 260);
        wrapper.unmount();
    });

    it('should respect minWidth, minHeight and the viewport', async () => {
        const wrapper = await mountDialog({ visible: true, resizable: true, minWidth: 200, minHeight: 150 });

        mockRect(wrapper);

        await wrapper.find('.p-dialog-resize-handle-se').trigger('pointerdown', { clientX: 500, clientY: 400, button: 0 });

        const element = wrapper.find('.p-dialog').element;

        await pointer('pointermove', 0, 0);
        expect(element.style.width).toBe('200px');
        expect(element.style.height).toBe('150px');

        await pointer('pointermove', 5000, 5000);
        expect(element.style.width).toBe(`${window.innerWidth - 100}px`);
        expect(element.style.height).toBe(`${window.innerHeight - 100}px`);

        await pointer('pointerup', 5000, 5000);
        wrapper.unmount();
    });

    it('should hide resize handles while maximized', async () => {
        const wrapper = await mountDialog({ visible: true, resizable: true, maximizable: true, appendTo: 'self' });

        expect(wrapper.find('.p-dialog-resize-handle').exists()).toBe(true);

        await wrapper.find('.p-dialog-maximize-button').trigger('click');

        expect(wrapper.find('.p-dialog-resize-handle').exists()).toBe(false);

        wrapper.unmount();
    });

    it('should write styles and emit resize at most once per frame', async () => {
        const wrapper = await mountDialog({ visible: true, resizable: true });

        mockRect(wrapper);

        await wrapper.find('.p-dialog-resize-handle-se').trigger('pointerdown', { clientX: 500, clientY: 400, button: 0 });

        const element = wrapper.find('.p-dialog').element;

        await pointer('pointermove', 510, 410, false);
        await pointer('pointermove', 520, 420, false);
        await pointer('pointermove', 530, 430, false);

        expect(wrapper.emitted('resize')).toBeUndefined();
        expect(element.style.width).toBe('400px');

        flushFrames();
        await nextTick();

        expect(wrapper.emitted('resize')).toHaveLength(1);
        expect(wrapper.emitted('resize')[0][0]).toMatchObject({ width: 430, height: 330 });
        expect(element.style.width).toBe('430px');

        await pointer('pointerup', 530, 430);
        wrapper.unmount();
    });

    it('should report the final size on resizeend when a frame is pending', async () => {
        const wrapper = await mountDialog({ visible: true, resizable: true });

        mockRect(wrapper);

        await wrapper.find('.p-dialog-resize-handle-se').trigger('pointerdown', { clientX: 500, clientY: 400, button: 0 });
        await pointer('pointermove', 580, 470, false);
        await pointer('pointerup', 580, 470);

        expect(window.cancelAnimationFrame).toHaveBeenCalled();
        expect(wrapper.emitted('resize')).toHaveLength(1);

        // the cancelled frame does not resize again
        flushFrames();
        expect(wrapper.emitted('resize')).toHaveLength(1);
        expect(wrapper.emitted('resizeend')[0][0]).toMatchObject({ width: 480, height: 370 });
        expect(wrapper.find('.p-dialog').element.style.width).toBe('480px');

        wrapper.unmount();
    });

    it('should cancel a pending frame on unmount', async () => {
        const wrapper = await mountDialog({ visible: true, resizable: true });

        mockRect(wrapper);

        await wrapper.find('.p-dialog-resize-handle-se').trigger('pointerdown', { clientX: 500, clientY: 400, button: 0 });
        await pointer('pointermove', 580, 470, false);

        expect(frames.size).toBeGreaterThan(0);

        wrapper.unmount();

        expect(window.cancelAnimationFrame).toHaveBeenCalled();

        flushFrames();
        expect(wrapper.emitted('resize')).toBeUndefined();
    });

    it('should set important inline sizes so that they win over breakpoints', async () => {
        const wrapper = await mountDialog({ visible: true, resizable: true, breakpoints: { '960px': '75vw' } });

        mockRect(wrapper);

        await wrapper.find('.p-dialog-resize-handle-se').trigger('pointerdown', { clientX: 500, clientY: 400, button: 0 });
        await pointer('pointermove', 550, 450);
        await pointer('pointerup', 550, 450);

        const style = wrapper.find('.p-dialog').element.style;

        expect(style.getPropertyValue('width')).toBe('450px');
        expect(style.getPropertyPriority('width')).toBe('important');
        expect(style.getPropertyPriority('height')).toBe('important');
        expect(style.getPropertyValue('max-width')).toBe('none');
        expect(style.getPropertyPriority('max-width')).toBe('important');
        expect(style.getPropertyPriority('max-height')).toBe('important');

        wrapper.unmount();
    });

    it('should remove the resized size while maximized and restore it afterwards', async () => {
        const wrapper = await mountDialog({ visible: true, resizable: true, maximizable: true, appendTo: 'self' });

        mockRect(wrapper);

        await wrapper.find('.p-dialog-resize-handle-se').trigger('pointerdown', { clientX: 500, clientY: 400, button: 0 });
        await pointer('pointermove', 550, 450);
        await pointer('pointerup', 550, 450);

        const style = wrapper.find('.p-dialog').element.style;

        await wrapper.find('.p-dialog-maximize-button').trigger('click');

        expect(wrapper.find('.p-dialog').classes()).toContain('p-dialog-maximized');
        expect(style.getPropertyValue('width')).toBe('');
        expect(style.getPropertyValue('height')).toBe('');
        expect(style.getPropertyValue('max-height')).toBe('');

        await wrapper.find('.p-dialog-maximize-button').trigger('click');

        expect(style.getPropertyValue('width')).toBe('450px');
        expect(style.getPropertyValue('height')).toBe('350px');
        expect(style.getPropertyPriority('width')).toBe('important');

        // also when the maximized state is controlled from outside
        await wrapper.setProps({ maximized: true });
        expect(style.getPropertyValue('width')).toBe('');

        await wrapper.setProps({ maximized: false });
        expect(style.getPropertyValue('width')).toBe('450px');

        wrapper.unmount();
    });

    it('should keep the resized size when the dialog re-renders with a user style', async () => {
        const wrapper = await mountDialog({ visible: true, resizable: true, appendTo: 'self' }, { attrs: { style: { width: '30rem' } } });

        mockRect(wrapper);

        await wrapper.find('.p-dialog-resize-handle-se').trigger('pointerdown', { clientX: 500, clientY: 400, button: 0 });
        await pointer('pointermove', 550, 450);
        await pointer('pointerup', 550, 450);

        await wrapper.setProps({ header: 'Changed' });

        const style = wrapper.find('.p-dialog').element.style;

        expect(wrapper.find('.p-dialog-title').text()).toBe('Changed');
        expect(style.getPropertyValue('width')).toBe('450px');
        expect(style.getPropertyPriority('width')).toBe('important');

        wrapper.unmount();
    });

    it('should reset the resized size when the content is destroyed on close', async () => {
        const wrapper = await mountDialog({ visible: true, resizable: true, appendTo: 'self' });

        mockRect(wrapper);

        await wrapper.find('.p-dialog-resize-handle-se').trigger('pointerdown', { clientX: 500, clientY: 400, button: 0 });
        await pointer('pointermove', 550, 450);
        await pointer('pointerup', 550, 450);

        wrapper.vm.onAfterLeave();
        await wrapper.setProps({ visible: false });
        await wrapper.setProps({ visible: true });

        expect(wrapper.find('.p-dialog').element.style.getPropertyValue('width')).toBe('');

        wrapper.unmount();
    });
});

describe('breakpoints', () => {
    it('should not apply breakpoint widths while maximized', async () => {
        const wrapper = await mountDialog({ visible: true, maximizable: true, breakpoints: { '960px': '75vw' } });
        const css = [...document.head.querySelectorAll('style')].map((style) => style.innerHTML).find((text) => text.includes('75vw'));

        expect(css).toContain(':not(.p-dialog-maximized)');

        wrapper.unmount();
    });
});
