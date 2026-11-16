import { addClass, createElement, fadeIn, findSingle, getAttribute, getOuterHeight, getOuterWidth, getViewport, getWindowScrollLeft, getWindowScrollTop, hasClass, isExist, removeClass } from '@primeuix/utils/dom';
import { isEmpty } from '@primeuix/utils/object';
import { uuid } from '@primeuix/utils/uuid';
import { ZIndex } from '@primeuix/utils/zindex';
import { ConnectedOverlayScrollHandler } from '@primevue/core/utils';
import BaseTooltip from './BaseTooltip';

const Tooltip = BaseTooltip.extend('tooltip', {
    beforeMount(el, options) {
        let target = this.getTarget(el);

        target.$_ptooltipModifiers = this.getModifiers(options);

        if (!options.value) return;
        else if (typeof options.value === 'string') {
            target.$_ptooltipValue = options.value;
            target.$_ptooltipDisabled = false;
            target.$_ptooltipEscape = true;
            target.$_ptooltipClass = null;
            target.$_ptooltipFitContent = true;
            target.$_ptooltipIdAttr = uuid('pv_id') + '_tooltip';
            target.$_ptooltipShowDelay = 0;
            target.$_ptooltipHideDelay = 0;
            target.$_ptooltipAutoHide = true;
            this.setPositionOptions(target);
        } else if (typeof options.value === 'object' && options.value) {
            if (isEmpty(options.value.value) || options.value.value.trim() === '') return;
            else {
                target.$_ptooltipValue = options.value.value;
                target.$_ptooltipDisabled = !!options.value.disabled === options.value.disabled ? options.value.disabled : false;
                target.$_ptooltipEscape = !!options.value.escape === options.value.escape ? options.value.escape : true;
                target.$_ptooltipClass = options.value.class || '';
                target.$_ptooltipFitContent = !!options.value.fitContent === options.value.fitContent ? options.value.fitContent : true;
                target.$_ptooltipIdAttr = options.value.id || uuid('pv_id') + '_tooltip';
                target.$_ptooltipShowDelay = options.value.showDelay || 0;
                target.$_ptooltipHideDelay = options.value.hideDelay || 0;
                target.$_ptooltipAutoHide = !!options.value.autoHide === options.value.autoHide ? options.value.autoHide : true;
                this.setPositionOptions(target, options.value);
            }
        }

        target.$_ptooltipZIndex = options.instance.$primevue?.config?.zIndex?.tooltip;

        this.bindEvents(target, options);

        el.setAttribute('data-pd-tooltip', true);
    },
    updated(el, options) {
        let target = this.getTarget(el);

        target.$_ptooltipModifiers = this.getModifiers(options);
        this.unbindEvents(target);

        if (!options.value) {
            return;
        }

        if (typeof options.value === 'string') {
            target.$_ptooltipValue = options.value;
            target.$_ptooltipDisabled = false;
            target.$_ptooltipEscape = true;
            target.$_ptooltipClass = null;
            target.$_ptooltipIdAttr = target.$_ptooltipIdAttr || uuid('pv_id') + '_tooltip';
            target.$_ptooltipShowDelay = 0;
            target.$_ptooltipHideDelay = 0;
            target.$_ptooltipAutoHide = true;
            this.setPositionOptions(target);

            this.bindEvents(target, options);
        } else if (typeof options.value === 'object' && options.value) {
            if (isEmpty(options.value.value) || options.value.value.trim() === '') {
                this.unbindEvents(target, options);

                return;
            } else {
                target.$_ptooltipValue = options.value.value;
                target.$_ptooltipDisabled = !!options.value.disabled === options.value.disabled ? options.value.disabled : false;
                target.$_ptooltipEscape = !!options.value.escape === options.value.escape ? options.value.escape : true;
                target.$_ptooltipClass = options.value.class || '';
                target.$_ptooltipFitContent = !!options.value.fitContent === options.value.fitContent ? options.value.fitContent : true;
                target.$_ptooltipIdAttr = options.value.id || target.$_ptooltipIdAttr || uuid('pv_id') + '_tooltip';
                target.$_ptooltipShowDelay = options.value.showDelay || 0;
                target.$_ptooltipHideDelay = options.value.hideDelay || 0;
                target.$_ptooltipAutoHide = !!options.value.autoHide === options.value.autoHide ? options.value.autoHide : true;
                this.setPositionOptions(target, options.value);

                this.bindEvents(target, options);
            }
        }
    },
    unmounted(el, options) {
        let target = this.getTarget(el);

        this.hide(el, 0);
        this.remove(target);
        this.unbindEvents(target, options);

        if (target.$_ptooltipScrollHandler) {
            target.$_ptooltipScrollHandler.destroy();
            target.$_ptooltipScrollHandler = null;
        }
    },
    methods: {
        setPositionOptions(target, value = {}) {
            target.$_ptooltipOffset = Number.isFinite(value.offset) ? value.offset : 0;
            target.$_ptooltipViewportPadding = Number.isFinite(value.viewportPadding) && value.viewportPadding >= 0 ? value.viewportPadding : 4;
            target.$_ptooltipFlip = !!value.flip === value.flip ? value.flip : true;
        },
        bindEvents(el, options) {
            const modifiers = el.$_ptooltipModifiers;

            if (modifiers.focus) {
                el.$_ptooltipFocusEvent = (event) => this.onFocus(event, options);
                el.$_ptooltipBlurEvent = this.onBlur.bind(this);

                el.addEventListener('focus', el.$_ptooltipFocusEvent);
                el.addEventListener('blur', el.$_ptooltipBlurEvent);
            } else {
                el.$_ptooltipMouseEnterEvent = (event) => this.onMouseEnter(event, options);
                el.$_ptooltipMouseLeaveEvent = this.onMouseLeave.bind(this);
                el.$_ptooltipClickEvent = this.onClick.bind(this);

                el.addEventListener('mouseenter', el.$_ptooltipMouseEnterEvent);
                el.addEventListener('mouseleave', el.$_ptooltipMouseLeaveEvent);
                el.addEventListener('click', el.$_ptooltipClickEvent);
            }

            el.$_ptooltipKeydownEvent = this.onKeydown.bind(this);
            el.addEventListener('keydown', el.$_ptooltipKeydownEvent);

            el.$_pWindowResizeEvent = this.onWindowResize.bind(this, el);
        },
        unbindEvents(el) {
            const modifiers = el.$_ptooltipModifiers;

            if (modifiers.focus) {
                el.removeEventListener('focus', el.$_ptooltipFocusEvent);
                el.$_ptooltipFocusEvent = null;

                el.removeEventListener('blur', el.$_ptooltipBlurEvent);
                el.$_ptooltipBlurEvent = null;
            } else {
                el.removeEventListener('mouseenter', el.$_ptooltipMouseEnterEvent);
                el.$_ptooltipMouseEnterEvent = null;

                el.removeEventListener('mouseleave', el.$_ptooltipMouseLeaveEvent);
                el.$_ptooltipMouseLeaveEvent = null;

                el.removeEventListener('click', el.$_ptooltipClickEvent);
                el.$_ptooltipClickEvent = null;
            }

            el.removeEventListener('keydown', el.$_ptooltipKeydownEvent);
            window.removeEventListener('resize', el.$_pWindowResizeEvent);

            if (el.$_ptooltipId) {
                this.remove(el);
            }
        },
        bindScrollListener(el) {
            if (!el.$_ptooltipScrollHandler) {
                el.$_ptooltipScrollHandler = new ConnectedOverlayScrollHandler(el, () => this.onScroll(el));
            }

            el.$_ptooltipScrollHandler.bindScrollListener();
        },
        unbindScrollListener(el) {
            if (el.$_ptooltipScrollHandler) {
                el.$_ptooltipScrollHandler.unbindScrollListener();
            }
        },
        onMouseEnter(event, options) {
            const el = event.currentTarget;
            const showDelay = el.$_ptooltipShowDelay;

            this.show(el, options, showDelay);
        },
        onMouseLeave(event) {
            const el = event.currentTarget;
            const hideDelay = el.$_ptooltipHideDelay;
            const autoHide = el.$_ptooltipAutoHide;

            if (!autoHide) {
                const valid =
                    getAttribute(event.target, 'data-pc-name') === 'tooltip' ||
                    getAttribute(event.target, 'data-pc-section') === 'arrow' ||
                    getAttribute(event.target, 'data-pc-section') === 'text' ||
                    getAttribute(event.relatedTarget, 'data-pc-name') === 'tooltip' ||
                    getAttribute(event.relatedTarget, 'data-pc-section') === 'arrow' ||
                    getAttribute(event.relatedTarget, 'data-pc-section') === 'text';

                !valid && this.hide(el, hideDelay);
            } else {
                this.hide(el, hideDelay);
            }
        },
        onFocus(event, options) {
            const el = event.currentTarget;
            const showDelay = el.$_ptooltipShowDelay;

            this.show(el, options, showDelay);
        },
        onBlur(event) {
            const el = event.currentTarget;
            const hideDelay = el.$_ptooltipHideDelay;

            this.hide(el, hideDelay);
        },
        onClick(event) {
            const el = event.currentTarget;
            const hideDelay = el.$_ptooltipHideDelay;

            this.hide(el, hideDelay);
        },
        onKeydown(event) {
            const el = event.currentTarget;
            const hideDelay = el.$_ptooltipHideDelay;

            event.code === 'Escape' && this.hide(event.currentTarget, hideDelay);
        },
        onScroll(el) {
            if (!this.getTooltipElement(el)) return;

            // hide when the host was scrolled out of the viewport, otherwise follow it
            const rect = el.getBoundingClientRect();
            const { width, height } = getViewport();

            if (rect.bottom < 0 || rect.top > height || rect.right < 0 || rect.left > width) {
                this.hide(el);
            } else {
                this.align(el);
            }
        },
        onWindowResize(el) {
            if (this.getTooltipElement(el)) {
                this.align(el);
            }
        },
        bindResizeObserver(el, tooltipElement) {
            if (typeof ResizeObserver === 'undefined') return;

            el.$_ptooltipResizeObserver = new ResizeObserver(() => {
                // only react to content changes, not to the ones caused by our own alignment
                if (this.getTooltipElement(el) === tooltipElement && el.$_ptooltipSize !== this.getSizeKey(tooltipElement)) {
                    this.align(el);
                }
            });
            el.$_ptooltipResizeObserver.observe(tooltipElement);
        },
        tooltipActions(el, options) {
            if (el.$_ptooltipDisabled || !isExist(el) || !el.$_ptooltipPendingShow) {
                return;
            }

            el.$_ptooltipPendingShow = false;
            this.remove(el);
            let tooltipElement = this.create(el, options);

            this.align(el);
            !this.isUnstyled() && fadeIn(tooltipElement, 250);

            const $this = this;

            window.addEventListener('resize', el.$_pWindowResizeEvent);

            tooltipElement.addEventListener('mouseleave', function onTooltipLeave() {
                $this.hide(el);

                tooltipElement.removeEventListener('mouseleave', onTooltipLeave);
                el.removeEventListener('mouseenter', el.$_ptooltipMouseEnterEvent);
                setTimeout(() => el.addEventListener('mouseenter', el.$_ptooltipMouseEnterEvent), 50);
            });

            this.bindScrollListener(el);
            this.bindResizeObserver(el, tooltipElement);
            ZIndex.set('tooltip', tooltipElement, el.$_ptooltipZIndex);
        },
        show(el, options, showDelay) {
            clearTimeout(el.$_ptooltipShowTimer);
            clearTimeout(el.$_ptooltipHideTimer);

            if (showDelay !== undefined) {
                el.$_ptooltipShowTimer = setTimeout(() => this.tooltipActions(el, options), showDelay);
                el.$_ptooltipPendingShow = true;
            } else {
                this.tooltipActions(el, options);
                el.$_ptooltipPendingShow = false;
            }
        },
        tooltipRemoval(el) {
            this.remove(el);
            this.unbindScrollListener(el);
            window.removeEventListener('resize', el.$_pWindowResizeEvent);
        },
        hide(el, hideDelay) {
            clearTimeout(el.$_ptooltipShowTimer);
            clearTimeout(el.$_ptooltipHideTimer);
            el.$_ptooltipPendingShow = false;

            if (hideDelay !== undefined) {
                el.$_ptooltipHideTimer = setTimeout(() => this.tooltipRemoval(el), hideDelay);
            } else {
                this.tooltipRemoval(el);
            }
        },
        getTooltipElement(el) {
            return document.getElementById(el.$_ptooltipId);
        },
        getArrowElement(el) {
            let tooltipElement = this.getTooltipElement(el);

            return findSingle(tooltipElement, '[data-pc-section="arrow"]');
        },
        create(el) {
            const modifiers = el.$_ptooltipModifiers;

            const tooltipArrow = createElement('div', {
                class: !this.isUnstyled() && this.cx('arrow'),
                'p-bind': this.ptm('arrow', {
                    context: modifiers
                })
            });

            const tooltipText = createElement('div', {
                class: !this.isUnstyled() && this.cx('text'),
                'p-bind': this.ptm('text', {
                    context: modifiers
                })
            });

            if (!el.$_ptooltipEscape) {
                tooltipText.innerHTML = el.$_ptooltipValue;
            } else {
                tooltipText.innerHTML = '';
                tooltipText.appendChild(document.createTextNode(el.$_ptooltipValue));
            }

            const container = createElement(
                'div',
                {
                    id: el.$_ptooltipIdAttr,
                    role: 'tooltip',
                    style: {
                        display: 'inline-block',
                        width: el.$_ptooltipFitContent ? 'fit-content' : undefined,
                        pointerEvents: !this.isUnstyled() && el.$_ptooltipAutoHide && 'none'
                    },
                    class: [!this.isUnstyled() && this.cx('root'), el.$_ptooltipClass],
                    [this.$attrSelector]: '',
                    'p-bind': this.ptm('root', {
                        context: modifiers
                    })
                },
                tooltipArrow,
                tooltipText
            );

            document.body.appendChild(container);

            el.$_ptooltipId = container.id;
            this.$el = container;

            return container;
        },
        remove(el) {
            if (el) {
                if (el.$_ptooltipResizeObserver) {
                    el.$_ptooltipResizeObserver.disconnect();
                    el.$_ptooltipResizeObserver = null;
                }

                let tooltipElement = this.getTooltipElement(el);

                if (tooltipElement && tooltipElement.parentElement) {
                    ZIndex.clear(tooltipElement);
                    document.body.removeChild(tooltipElement);
                }

                el.$_ptooltipId = null;
            }
        },
        getRequestedPosition(el) {
            const modifiers = el.$_ptooltipModifiers || {};

            return modifiers.top ? 'top' : modifiers.left ? 'left' : modifiers.bottom ? 'bottom' : 'right';
        },
        getFallbackOrder(position) {
            switch (position) {
                case 'top':
                    return ['top', 'bottom', 'right', 'left'];
                case 'bottom':
                    return ['bottom', 'top', 'right', 'left'];
                case 'left':
                    return ['left', 'right', 'top', 'bottom'];
                default:
                    return ['right', 'left', 'top', 'bottom'];
            }
        },
        clamp(value, min, max) {
            // when the range is empty (content larger than the viewport) favor the start edge
            return max < min ? min : Math.min(Math.max(value, min), max);
        },
        /**
         * Returns the ideal tooltip position in viewport coordinates for a side and how many pixels
         * it overflows the viewport on the main axis (0 when it fits).
         */
        computePosition(position, host, size, viewport, padding, offset) {
            const hostCenterX = host.left + host.width / 2;
            const hostCenterY = host.top + host.height / 2;
            let left;
            let top;
            let overflow;

            switch (position) {
                case 'top':
                    left = hostCenterX - size.width / 2;
                    top = host.top - size.height - offset;
                    overflow = Math.max(0, padding - top);
                    break;
                case 'bottom':
                    left = hostCenterX - size.width / 2;
                    top = host.bottom + offset;
                    overflow = Math.max(0, top + size.height - (viewport.height - padding));
                    break;
                case 'left':
                    left = host.left - size.width - offset;
                    top = hostCenterY - size.height / 2;
                    overflow = Math.max(0, padding - left);
                    break;
                default:
                    left = host.right + offset;
                    top = hostCenterY - size.height / 2;
                    overflow = Math.max(0, left + size.width - (viewport.width - padding));
                    break;
            }

            return { left, top, overflow };
        },
        align(el) {
            const tooltipElement = this.getTooltipElement(el);

            if (!tooltipElement) return;

            const arrowElement = this.getArrowElement(el);
            const requested = this.getRequestedPosition(el);
            const padding = el.$_ptooltipViewportPadding;
            const offset = el.$_ptooltipOffset;

            // measure the tooltip at the origin so that its size does not depend on a previous position
            this.preAlign(el, requested);

            const size = { width: getOuterWidth(tooltipElement), height: getOuterHeight(tooltipElement) };
            const viewport = getViewport();
            const host = el.getBoundingClientRect();
            const order = el.$_ptooltipFlip ? this.getFallbackOrder(requested) : [requested];

            let best = null;
            let position = requested;

            for (const side of order) {
                const candidate = this.computePosition(side, host, size, viewport, padding, offset);

                if (!best || candidate.overflow < best.overflow) {
                    best = candidate;
                    position = side;
                }

                if (candidate.overflow === 0) break;
            }

            const vertical = position === 'top' || position === 'bottom';
            const minLeft = padding;
            const maxLeft = viewport.width - size.width - padding;
            const minTop = padding;
            const maxTop = viewport.height - size.height - padding;
            let { left, top } = best;

            // shift along the cross axis (and along the main axis only when no side has enough room)
            if (vertical) {
                left = this.clamp(left, minLeft, maxLeft);
                best.overflow > 0 && (top = this.clamp(top, minTop, maxTop));
            } else {
                top = this.clamp(top, minTop, maxTop);
                best.overflow > 0 && (left = this.clamp(left, minLeft, maxLeft));
            }

            this.preAlign(el, position);

            tooltipElement.style.left = left + getWindowScrollLeft() + 'px';
            tooltipElement.style.top = top + getWindowScrollTop() + 'px';

            if (arrowElement) {
                // the arrow keeps pointing at the host center, but stays inside the tooltip body
                if (vertical) {
                    const inset = Math.min(8, size.width / 2);

                    arrowElement.style.top = position === 'bottom' ? '0' : null;
                    arrowElement.style.bottom = position === 'top' ? '0' : null;
                    arrowElement.style.right = null;
                    arrowElement.style.left = this.clamp(host.left + host.width / 2 - left, inset, size.width - inset) + 'px';
                } else {
                    const inset = Math.min(8, size.height / 2);

                    arrowElement.style.top = this.clamp(host.top + host.height / 2 - top, inset, size.height - inset) + 'px';
                    arrowElement.style.bottom = null;
                    arrowElement.style.right = position === 'left' ? '0' : null;
                    arrowElement.style.left = position === 'right' ? '0' : null;
                }
            }

            el.$_ptooltipSize = this.getSizeKey(tooltipElement);
        },
        getSizeKey(tooltipElement) {
            return `${tooltipElement.offsetWidth}x${tooltipElement.offsetHeight}`;
        },
        getHostOffset(el) {
            let offset = el.getBoundingClientRect();
            let targetLeft = offset.left + getWindowScrollLeft();
            let targetTop = offset.top + getWindowScrollTop();

            return { left: targetLeft, top: targetTop };
        },
        preAlign(el, position) {
            let tooltipElement = this.getTooltipElement(el);

            tooltipElement.style.left = '0px';
            tooltipElement.style.top = '0px';
            removeClass(tooltipElement, `p-tooltip-${tooltipElement.$_ptooltipPosition}`);
            !this.isUnstyled() && addClass(tooltipElement, `p-tooltip-${position}`);
            tooltipElement.$_ptooltipPosition = position;
            tooltipElement.setAttribute('data-p-position', position);
        },
        getTarget(el) {
            return hasClass(el, 'p-inputwrapper') ? (findSingle(el, 'input') ?? el) : el;
        },
        getModifiers(options) {
            // modifiers
            if (options.modifiers && Object.keys(options.modifiers).length) {
                return options.modifiers;
            }

            // arg
            if (options.arg && typeof options.arg === 'object') {
                return Object.entries(options.arg).reduce((acc, [key, val]) => {
                    if (key === 'event' || key === 'position') acc[val] = true;

                    return acc;
                }, {});
            }

            return {};
        }
    }
});

export default Tooltip;
