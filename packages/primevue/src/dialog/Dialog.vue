<template>
    <Portal :appendTo="appendTo">
        <div
            v-if="containerVisible || keepRendered"
            v-show="containerVisible"
            :ref="maskRef"
            :class="cx('mask')"
            :style="sx('mask', true, { position, modal })"
            @mousedown="onMaskMouseDown"
            @mouseup="onMaskMouseUp"
            :data-p="dataP"
            v-bind="ptm('mask')"
        >
            <transition name="p-dialog" @enter="onEnter" @after-enter="onAfterEnter" @before-leave="onBeforeLeave" @leave="onLeave" @after-leave="onAfterLeave" appear v-bind="ptm('transition')">
                <div
                    v-if="visible || keepRendered"
                    v-show="visible"
                    :ref="containerRef"
                    v-focustrap="{ disabled: !modal }"
                    :class="cx('root')"
                    :style="sx('root')"
                    role="dialog"
                    :aria-labelledby="ariaLabelledById"
                    :aria-modal="modal"
                    :data-p="dataP"
                    v-bind="ptmi('root')"
                >
                    <slot v-if="$slots.container" name="container" :closeCallback="close" :maximizeCallback="(event) => maximize(event)" :initDragCallback="initDrag"></slot>
                    <template v-else>
                        <div v-if="showHeader" :ref="headerContainerRef" :class="cx('header')" @mousedown="initDrag" v-bind="ptm('header')">
                            <slot name="header" :class="cx('title')">
                                <span v-if="header" :id="ariaLabelledById" :class="cx('title')" v-bind="ptm('title')">{{ header }}</span>
                            </slot>
                            <div :class="cx('headerActions')" v-bind="ptm('headerActions')">
                                <slot v-if="maximizable" name="maximizebutton" :maximized="d_maximized" :maximizeCallback="(event) => maximize(event)">
                                    <Button
                                        :ref="maximizableRef"
                                        :autofocus="focusableMax"
                                        :class="cx('pcMaximizeButton')"
                                        @click="maximize"
                                        :tabindex="maximizable ? '0' : '-1'"
                                        :unstyled="unstyled"
                                        v-bind="maximizeButtonProps"
                                        :pt="ptm('pcMaximizeButton')"
                                        data-pc-group-section="headericon"
                                    >
                                        <template #icon="slotProps">
                                            <slot name="maximizeicon" :maximized="d_maximized">
                                                <component :is="maximizeIconComponent" :class="[slotProps.class, d_maximized ? minimizeIcon : maximizeIcon]" v-bind="ptm('pcMaximizeButton')['icon']" />
                                            </slot>
                                        </template>
                                    </Button>
                                </slot>
                                <slot v-if="closable" name="closebutton" :closeCallback="close">
                                    <Button
                                        :ref="closeButtonRef"
                                        :autofocus="focusableClose"
                                        :class="cx('pcCloseButton')"
                                        @click="close"
                                        :aria-label="closeAriaLabel"
                                        :unstyled="unstyled"
                                        v-bind="closeButtonProps"
                                        :pt="ptm('pcCloseButton')"
                                        data-pc-group-section="headericon"
                                    >
                                        <template #icon="slotProps">
                                            <slot name="closeicon">
                                                <component :is="closeIcon ? 'span' : 'TimesIcon'" :class="[closeIcon, slotProps.class]" v-bind="ptm('pcCloseButton')['icon']"></component>
                                            </slot>
                                        </template>
                                    </Button>
                                </slot>
                            </div>
                        </div>
                        <div :ref="contentRef" :class="[cx('content'), contentClass]" :style="contentStyle" :data-p="dataP" v-bind="{ ...contentProps, ...ptm('content') }">
                            <slot></slot>
                        </div>
                        <div v-if="footer || $slots.footer" :ref="footerContainerRef" :class="cx('footer')" v-bind="ptm('footer')">
                            <slot name="footer">{{ footer }}</slot>
                        </div>
                    </template>
                    <template v-if="resizable && !d_maximized">
                        <div
                            v-for="direction in resizeDirections"
                            :key="direction"
                            :class="cx('resizeHandle', { direction })"
                            aria-hidden="true"
                            :data-p-direction="direction"
                            @pointerdown="initResize($event, direction)"
                            v-bind="ptm('resizeHandle', { context: { direction } })"
                        ></div>
                    </template>
                </div>
            </transition>
        </div>
    </Portal>
</template>

<script>
import { cn } from '@primeuix/utils';
import { addClass, addStyle, focus, removeClass, getOuterHeight, getOuterWidth, getViewport, setAttribute } from '@primeuix/utils/dom';
import { ZIndex } from '@primeuix/utils/zindex';
import TimesIcon from '@primevue/icons/times';
import WindowMaximizeIcon from '@primevue/icons/windowmaximize';
import WindowMinimizeIcon from '@primevue/icons/windowminimize';
import Button from 'primevue/button';
import FocusTrap from 'primevue/focustrap';
import Portal from 'primevue/portal';
import Ripple from 'primevue/ripple';
import { blockBodyScroll, unblockBodyScroll } from 'primevue/utils';
import { computed } from 'vue';
import BaseDialog from './BaseDialog.vue';

/**
 * Dialogs that are currently open (or opening), in the order they were shown.
 * The last entry is the top-most dialog, which is the only one allowed to react to the Escape key.
 */
const dialogStack = [];

export default {
    name: 'Dialog',
    extends: BaseDialog,
    inheritAttrs: false,
    emits: ['update:visible', 'update:maximized', 'show', 'hide', 'after-hide', 'maximize', 'unmaximize', 'dragstart', 'dragend', 'resizestart', 'resize', 'resizeend'],
    provide() {
        return {
            dialogRef: computed(() => this._instance)
        };
    },
    data() {
        return {
            containerVisible: this.visible,
            d_maximized: this.maximized,
            rendered: this.visible,
            focusableMax: null,
            focusableClose: null,
            target: null
        };
    },
    documentKeydownListener: null,
    container: null,
    mask: null,
    content: null,
    headerContainer: null,
    footerContainer: null,
    maximizableButton: null,
    closeButton: null,
    styleElement: null,
    dragging: null,
    documentDragListener: null,
    documentDragEndListener: null,
    lastPageX: null,
    lastPageY: null,
    maskMouseDownTarget: null,
    resizeState: null,
    documentResizeListener: null,
    documentResizeEndListener: null,
    closing: false,
    watch: {
        visible(newValue) {
            if (newValue) {
                this.rendered = true;
            }
        },
        maximized(newValue) {
            this.setMaximized(newValue);
        }
    },
    updated() {
        if (this.visible) {
            this.containerVisible = this.visible;
        }
    },
    beforeUnmount() {
        this.unregisterFromStack();
        this.unbindDocumentState();
        this.unbindGlobalListeners();
        this.unbindDocumentResizeListeners();
        this.destroyStyle();

        if (this.mask && this.autoZIndex) {
            ZIndex.clear(this.mask);
        }

        this.container = null;
        this.mask = null;
    },
    mounted() {
        if (this.breakpoints) {
            this.createStyle();
        }
    },
    methods: {
        close(event) {
            this.requestClose(event, 'close');
        },
        requestClose(originalEvent, source) {
            if (this.closing) {
                return;
            }

            const hide = () => this.$emit('update:visible', false);

            if (!this.beforeClose) {
                hide();

                return;
            }

            let result;

            try {
                result = this.beforeClose({ originalEvent, source });
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error(error);

                return;
            }

            if (result && typeof result.then === 'function') {
                this.closing = true;

                result
                    .then((allowed) => {
                        allowed !== false && hide();
                    })
                    .catch(() => {
                        // a rejected guard cancels closing
                    })
                    .finally(() => {
                        this.closing = false;
                    });
            } else if (result !== false) {
                hide();
            }
        },
        registerToStack() {
            this.unregisterFromStack();
            dialogStack.push(this);
        },
        unregisterFromStack() {
            const index = dialogStack.indexOf(this);

            index > -1 && dialogStack.splice(index, 1);
        },
        isTopMost() {
            return dialogStack[dialogStack.length - 1] === this;
        },
        onEnter() {
            this.$emit('show');
            this.target = document.activeElement;
            this.registerToStack();
            this.mask && removeClass(this.mask, 'p-overlay-mask-leave-active');
            this.enableDocumentSettings();
            this.bindGlobalListeners();

            if (this.autoZIndex) {
                ZIndex.set('modal', this.mask, this.baseZIndex || this.$primevue.config.zIndex.modal);
            }
        },
        onAfterEnter() {
            this.focus();
        },
        onBeforeLeave() {
            if (this.modal) {
                !this.isUnstyled && addClass(this.mask, 'p-overlay-mask-leave-active');
            }

            if (this.dragging && this.documentDragEndListener) {
                this.documentDragEndListener();
            }

            if (this.resizeState) {
                this.onResizeEnd();
            }
        },
        onLeave() {
            this.$emit('hide');
            this.unregisterFromStack();
            this.restoreFocus && focus(this.target);
            this.target = null;
            this.focusableClose = null;
            this.focusableMax = null;
        },
        onAfterLeave() {
            if (this.autoZIndex) {
                ZIndex.clear(this.mask);
            }

            this.containerVisible = false;
            this.unbindDocumentState();
            this.unbindGlobalListeners();
            this.$emit('after-hide');
        },
        onMaskMouseDown(event) {
            this.maskMouseDownTarget = event.target;
        },
        onMaskMouseUp(event) {
            if (this.dismissableMask && this.modal && this.mask === this.maskMouseDownTarget) {
                this.requestClose(event, 'mask');
            }
        },
        focus() {
            const findFocusableElement = (container) => {
                return container && container.querySelector('[autofocus]');
            };

            let focusTarget = this.$slots.footer && findFocusableElement(this.footerContainer);

            if (!focusTarget) {
                focusTarget = this.$slots.header && findFocusableElement(this.headerContainer);

                if (!focusTarget) {
                    focusTarget = this.$slots.default && findFocusableElement(this.content);

                    if (!focusTarget) {
                        if (this.maximizable) {
                            this.focusableMax = true;
                            focusTarget = this.maximizableButton;
                        } else {
                            this.focusableClose = true;
                            focusTarget = this.closeButton;
                        }
                    }
                }
            }

            if (focusTarget) {
                focus(focusTarget, { focusVisible: true });
            }
        },
        maximize(event) {
            const value = !this.d_maximized;

            this.setMaximized(value);
            this.$emit('update:maximized', value);
            this.$emit(value ? 'maximize' : 'unmaximize', event);
        },
        setMaximized(value) {
            if (this.d_maximized === value) {
                return;
            }

            this.d_maximized = value;

            if (!this.modal && !this.blockScroll && this.containerVisible) {
                value ? blockBodyScroll() : unblockBodyScroll();
            }
        },
        enableDocumentSettings() {
            if (this.modal || (!this.modal && this.blockScroll) || this.d_maximized) {
                blockBodyScroll();
            }
        },
        unbindDocumentState() {
            if (this.modal || (!this.modal && this.blockScroll) || this.d_maximized) {
                unblockBodyScroll();
            }
        },
        onKeyDown(event) {
            if (event.code === 'Escape' && this.closeOnEscape && !event.isComposing && this.isTopMost()) {
                this.requestClose(event, 'escape');
            }
        },
        bindDocumentKeyDownListener() {
            if (!this.documentKeydownListener) {
                this.documentKeydownListener = this.onKeyDown.bind(this);
                window.document.addEventListener('keydown', this.documentKeydownListener);
            }
        },
        unbindDocumentKeyDownListener() {
            if (this.documentKeydownListener) {
                window.document.removeEventListener('keydown', this.documentKeydownListener);
                this.documentKeydownListener = null;
            }
        },
        containerRef(el) {
            this.container = el;
        },
        maskRef(el) {
            this.mask = el;
        },
        contentRef(el) {
            this.content = el;
        },
        headerContainerRef(el) {
            this.headerContainer = el;
        },
        footerContainerRef(el) {
            this.footerContainer = el;
        },
        maximizableRef(el) {
            this.maximizableButton = el ? el.$el : undefined;
        },
        closeButtonRef(el) {
            this.closeButton = el ? el.$el : undefined;
        },
        createStyle() {
            if (!this.styleElement && !this.isUnstyled) {
                this.styleElement = document.createElement('style');
                this.styleElement.type = 'text/css';
                setAttribute(this.styleElement, 'nonce', this.$primevue?.config?.csp?.nonce);
                document.head.appendChild(this.styleElement);

                let innerHTML = '';

                for (let breakpoint in this.breakpoints) {
                    innerHTML += `
                        @media screen and (max-width: ${breakpoint}) {
                            .p-dialog[${this.$attrSelector}] {
                                width: ${this.breakpoints[breakpoint]} !important;
                            }
                        }
                    `;
                }

                this.styleElement.innerHTML = innerHTML;
            }
        },
        destroyStyle() {
            if (this.styleElement) {
                document.head.removeChild(this.styleElement);
                this.styleElement = null;
            }
        },
        initDrag(event) {
            if (event.target.closest('div').getAttribute('data-pc-section') === 'headeractions') {
                return;
            }

            if (this.draggable) {
                this.dragging = true;
                this.lastPageX = event.pageX;
                this.lastPageY = event.pageY;

                this.container.style.margin = '0';
                document.body.setAttribute('data-p-unselectable-text', 'true');
                !this.isUnstyled && addStyle(document.body, { 'user-select': 'none' });

                this.$emit('dragstart', event);
            }
        },
        bindGlobalListeners() {
            if (this.draggable) {
                this.bindDocumentDragListener();
                this.bindDocumentDragEndListener();
            }

            if (this.closeOnEscape) {
                this.bindDocumentKeyDownListener();
            }
        },
        unbindGlobalListeners() {
            this.unbindDocumentDragListener();
            this.unbindDocumentDragEndListener();
            this.unbindDocumentKeyDownListener();
        },
        bindDocumentDragListener() {
            this.documentDragListener = (event) => {
                if (this.dragging) {
                    let width = getOuterWidth(this.container);
                    let height = getOuterHeight(this.container);
                    let deltaX = event.pageX - this.lastPageX;
                    let deltaY = event.pageY - this.lastPageY;
                    let offset = this.container.getBoundingClientRect();
                    let leftPos = offset.left + deltaX;
                    let topPos = offset.top + deltaY;
                    let viewport = getViewport();
                    let containerComputedStyle = getComputedStyle(this.container);
                    let marginLeft = parseFloat(containerComputedStyle.marginLeft);
                    let marginTop = parseFloat(containerComputedStyle.marginTop);

                    this.container.style.position = 'fixed';

                    if (this.keepInViewport) {
                        if (leftPos >= this.minX && leftPos + width < viewport.width) {
                            this.lastPageX = event.pageX;
                            this.container.style.left = leftPos - marginLeft + 'px';
                        }

                        if (topPos >= this.minY && topPos + height < viewport.height) {
                            this.lastPageY = event.pageY;
                            this.container.style.top = topPos - marginTop + 'px';
                        }
                    } else {
                        this.lastPageX = event.pageX;
                        this.container.style.left = leftPos - marginLeft + 'px';
                        this.lastPageY = event.pageY;
                        this.container.style.top = topPos - marginTop + 'px';
                    }
                }
            };

            window.document.addEventListener('mousemove', this.documentDragListener);
        },
        unbindDocumentDragListener() {
            if (this.documentDragListener) {
                window.document.removeEventListener('mousemove', this.documentDragListener);
                this.documentDragListener = null;
            }
        },
        bindDocumentDragEndListener() {
            this.documentDragEndListener = (event) => {
                if (this.dragging) {
                    this.dragging = false;
                    document.body.removeAttribute('data-p-unselectable-text');
                    !this.isUnstyled && (document.body.style['user-select'] = '');

                    this.$emit('dragend', event);
                }
            };

            window.document.addEventListener('mouseup', this.documentDragEndListener);
        },
        unbindDocumentDragEndListener() {
            if (this.documentDragEndListener) {
                window.document.removeEventListener('mouseup', this.documentDragEndListener);
                this.documentDragEndListener = null;
            }
        },
        initResize(event, direction) {
            if (!this.resizable || this.d_maximized || !this.container || (event.button !== undefined && event.button !== 0)) {
                return;
            }

            event.preventDefault();
            event.stopPropagation();

            const rect = this.container.getBoundingClientRect();

            this.resizeState = {
                direction,
                startX: event.clientX,
                startY: event.clientY,
                startWidth: rect.width,
                startHeight: rect.height,
                left: rect.left,
                top: rect.top
            };

            // Pin the dialog at its current position so that it grows towards the pointer instead of from the center.
            addStyle(this.container, {
                position: 'fixed',
                margin: '0',
                left: rect.left + 'px',
                top: rect.top + 'px',
                width: rect.width + 'px',
                height: rect.height + 'px',
                'max-width': 'none',
                'max-height': 'none'
            });

            document.body.setAttribute('data-p-unselectable-text', 'true');
            !this.isUnstyled && addStyle(document.body, { 'user-select': 'none' });

            this.bindDocumentResizeListeners();
            this.$emit('resizestart', { originalEvent: event, width: rect.width, height: rect.height });
        },
        onResize(event) {
            const state = this.resizeState;

            if (!state || !this.container) {
                return;
            }

            const deltaX = event.clientX - state.startX;
            const deltaY = event.clientY - state.startY;
            let width = state.direction.includes('e') ? state.startWidth + deltaX : state.startWidth;
            let height = state.direction.includes('s') ? state.startHeight + deltaY : state.startHeight;

            if (this.keepInViewport) {
                const viewport = getViewport();

                width = Math.min(width, viewport.width - state.left);
                height = Math.min(height, viewport.height - state.top);
            }

            width = Math.max(width, this.minWidth);
            height = Math.max(height, this.minHeight);

            this.container.style.width = width + 'px';
            this.container.style.height = height + 'px';

            this.$emit('resize', { originalEvent: event, width, height });
        },
        onResizeEnd(event) {
            if (!this.resizeState) {
                return;
            }

            this.resizeState = null;
            this.unbindDocumentResizeListeners();

            document.body.removeAttribute('data-p-unselectable-text');
            !this.isUnstyled && (document.body.style['user-select'] = '');

            const width = this.container ? parseFloat(this.container.style.width) : undefined;
            const height = this.container ? parseFloat(this.container.style.height) : undefined;

            this.$emit('resizeend', { originalEvent: event, width, height });
        },
        bindDocumentResizeListeners() {
            this.unbindDocumentResizeListeners();
            this.documentResizeListener = this.onResize.bind(this);
            this.documentResizeEndListener = this.onResizeEnd.bind(this);
            window.document.addEventListener('pointermove', this.documentResizeListener);
            window.document.addEventListener('pointerup', this.documentResizeEndListener);
            window.document.addEventListener('pointercancel', this.documentResizeEndListener);
        },
        unbindDocumentResizeListeners() {
            if (this.documentResizeListener) {
                window.document.removeEventListener('pointermove', this.documentResizeListener);
                this.documentResizeListener = null;
            }

            if (this.documentResizeEndListener) {
                window.document.removeEventListener('pointerup', this.documentResizeEndListener);
                window.document.removeEventListener('pointercancel', this.documentResizeEndListener);
                this.documentResizeEndListener = null;
            }
        }
    },
    computed: {
        maximizeIconComponent() {
            return this.d_maximized ? (this.minimizeIcon ? 'span' : 'WindowMinimizeIcon') : this.maximizeIcon ? 'span' : 'WindowMaximizeIcon';
        },
        keepRendered() {
            return !this.destroyOnClose && this.rendered;
        },
        resizeDirections() {
            return ['e', 's', 'se'];
        },
        ariaLabelledById() {
            return this.header != null || this.$attrs['aria-labelledby'] !== null ? this.$id + '_header' : null;
        },
        closeAriaLabel() {
            return this.$primevue.config.locale.aria ? this.$primevue.config.locale.aria.close : undefined;
        },
        dataP() {
            return cn({
                maximized: this.d_maximized,
                modal: this.modal,
                resizable: this.resizable
            });
        }
    },
    directives: {
        ripple: Ripple,
        focustrap: FocusTrap
    },
    components: {
        Button,
        Portal,
        WindowMinimizeIcon,
        WindowMaximizeIcon,
        TimesIcon
    }
};
</script>
