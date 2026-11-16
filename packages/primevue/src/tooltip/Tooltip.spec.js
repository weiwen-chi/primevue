import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, withDirectives } from 'vue';
import Tooltip from './Tooltip';

const VIEWPORT = { width: 1000, height: 800 };
const TOOLTIP_SIZE = { width: 200, height: 40 };

const rect = (left, top, width, height) => ({ left, top, width, height, right: left + width, bottom: top + height, x: left, y: top, toJSON() {} });

let wrapper = null;
const originals = {};

const defineSize = (prop, getter) => {
    originals[prop] = Object.getOwnPropertyDescriptor(HTMLElement.prototype, prop);
    Object.defineProperty(HTMLElement.prototype, prop, { configurable: true, get: getter });
};

const mountHost = (hostRect, modifiers = {}, value = 'Tooltip text') => {
    const Comp = defineComponent({
        render() {
            return withDirectives(h('button', { class: 'host' }, 'host'), [[Tooltip, value, '', modifiers]]);
        }
    });

    wrapper = mount(Comp, { attachTo: document.body });

    const host = wrapper.element;

    host.getBoundingClientRect = () => rect(...hostRect);
    Object.defineProperty(host, 'offsetWidth', { configurable: true, value: hostRect[2] });
    Object.defineProperty(host, 'offsetHeight', { configurable: true, value: hostRect[3] });

    return host;
};

const show = async (host) => {
    host.dispatchEvent(new Event('mouseenter'));
    await new Promise((resolve) => setTimeout(resolve, 0));

    return document.body.querySelector('[role="tooltip"]');
};

const pos = (tooltip) => ({ left: parseFloat(tooltip.style.left), top: parseFloat(tooltip.style.top) });
const arrowOf = (tooltip) => tooltip.querySelector('[data-pc-section="arrow"]');

describe('Tooltip directive positioning', () => {
    beforeEach(() => {
        window.innerWidth = VIEWPORT.width;
        window.innerHeight = VIEWPORT.height;

        defineSize('offsetWidth', function () {
            return this.getAttribute('role') === 'tooltip' ? TOOLTIP_SIZE.width : 0;
        });
        defineSize('offsetHeight', function () {
            return this.getAttribute('role') === 'tooltip' ? TOOLTIP_SIZE.height : 0;
        });
    });

    afterEach(() => {
        wrapper && wrapper.unmount();
        wrapper = null;
        document.body.innerHTML = '';

        Object.keys(originals).forEach((prop) => {
            originals[prop] ? Object.defineProperty(HTMLElement.prototype, prop, originals[prop]) : delete HTMLElement.prototype[prop];
            delete originals[prop];
        });
    });

    it('places the tooltip centered above the host when there is room', async () => {
        const host = mountHost([400, 300, 100, 30], { top: true });
        const tooltip = await show(host);

        expect(tooltip.getAttribute('data-p-position')).toBe('top');
        // host center is 450, tooltip is 200 wide
        expect(pos(tooltip)).toEqual({ left: 350, top: 300 - TOOLTIP_SIZE.height });
    });

    it.each(['top', 'bottom'])('keeps a %s tooltip inside the viewport when the host is near the left edge', async (side) => {
        const host = mountHost([2, 300, 40, 30], { [side]: true });
        const tooltip = await show(host);

        expect(tooltip.getAttribute('data-p-position')).toBe(side);
        expect(pos(tooltip).left).toBeGreaterThanOrEqual(4);
        expect(pos(tooltip).left).toBe(4);
    });

    it.each(['top', 'bottom'])('keeps a %s tooltip inside the viewport when the host is near the right edge', async (side) => {
        const host = mountHost([VIEWPORT.width - 42, 300, 40, 30], { [side]: true });
        const tooltip = await show(host);

        expect(tooltip.getAttribute('data-p-position')).toBe(side);
        expect(pos(tooltip).left + TOOLTIP_SIZE.width).toBeLessThanOrEqual(VIEWPORT.width - 4);
        expect(pos(tooltip).left).toBe(VIEWPORT.width - TOOLTIP_SIZE.width - 4);
    });

    it('shifts a left/right tooltip vertically when the host is near the top or bottom edge', async () => {
        let host = mountHost([400, 0, 100, 10], { right: true });
        let tooltip = await show(host);

        expect(tooltip.getAttribute('data-p-position')).toBe('right');
        expect(pos(tooltip).top).toBe(4);

        wrapper.unmount();
        host = mountHost([400, VIEWPORT.height - 10, 100, 10], { right: true });
        tooltip = await show(host);

        expect(pos(tooltip).top + TOOLTIP_SIZE.height).toBe(VIEWPORT.height - 4);
    });

    it('flips to the opposite side when there is no space on the requested one', async () => {
        const host = mountHost([400, 10, 100, 30], { top: true });
        const tooltip = await show(host);

        expect(tooltip.getAttribute('data-p-position')).toBe('bottom');
        expect(pos(tooltip).top).toBe(40);
    });

    it('flips a right tooltip to the left near the right edge, and without clipping on the left edge', async () => {
        const host = mountHost([VIEWPORT.width - 60, 300, 50, 30], {});
        const tooltip = await show(host);

        expect(tooltip.getAttribute('data-p-position')).toBe('left');
        expect(pos(tooltip).left).toBe(VIEWPORT.width - 60 - TOOLTIP_SIZE.width);
        expect(pos(tooltip).left).toBeGreaterThanOrEqual(4);
    });

    it('falls back to a perpendicular side when both horizontal sides are too narrow', async () => {
        const host = mountHost([150, 300, 700, 30], { left: true });
        const tooltip = await show(host);

        expect(['top', 'bottom']).toContain(tooltip.getAttribute('data-p-position'));
        expect(pos(tooltip).left).toBeGreaterThanOrEqual(4);
        expect(pos(tooltip).left + TOOLTIP_SIZE.width).toBeLessThanOrEqual(VIEWPORT.width - 4);
    });

    it('does not flip when value.flip is false but still clamps on the cross axis', async () => {
        const host = mountHost([2, 10, 40, 30], { top: true }, { value: 'Tooltip text', flip: false });
        const tooltip = await show(host);

        expect(tooltip.getAttribute('data-p-position')).toBe('top');
        expect(pos(tooltip).left).toBe(4);
    });

    it('respects the offset and viewportPadding options', async () => {
        const host = mountHost([2, 300, 40, 30], { bottom: true }, { value: 'Tooltip text', offset: 10, viewportPadding: 12 });
        const tooltip = await show(host);

        expect(pos(tooltip)).toEqual({ left: 12, top: 340 });
    });

    it('picks the side with the most room and clamps when it fits nowhere', async () => {
        const host = mountHost([0, 0, VIEWPORT.width, VIEWPORT.height], { top: true });
        const tooltip = await show(host);
        const { left, top } = pos(tooltip);

        expect(left).toBeGreaterThanOrEqual(4);
        expect(left + TOOLTIP_SIZE.width).toBeLessThanOrEqual(VIEWPORT.width - 4);
        expect(top).toBeGreaterThanOrEqual(4);
        expect(top + TOOLTIP_SIZE.height).toBeLessThanOrEqual(VIEWPORT.height - 4);
    });

    describe('arrow', () => {
        it('points at the host center when the tooltip is centered', async () => {
            const host = mountHost([400, 300, 100, 30], { top: true });
            const tooltip = await show(host);

            expect(arrowOf(tooltip).style.left).toBe('100px');
            expect(arrowOf(tooltip).style.bottom).toBe('0px');
        });

        it('follows the host center when the tooltip body is shifted', async () => {
            const host = mountHost([2, 300, 40, 30], { top: true });
            const tooltip = await show(host);

            // tooltip left is clamped to 4, host center is 22
            expect(arrowOf(tooltip).style.left).toBe(22 - 4 + 'px');
        });

        it('stays inside the tooltip when the host center is outside of it', async () => {
            const host = mountHost([VIEWPORT.width - 42, 300, 40, 30], { bottom: true }, 'Tooltip text');
            const tooltip = await show(host);
            const arrowLeft = parseFloat(arrowOf(tooltip).style.left);

            expect(arrowLeft).toBe(VIEWPORT.width - 22 - (VIEWPORT.width - TOOLTIP_SIZE.width - 4));
            expect(arrowLeft).toBeLessThanOrEqual(TOOLTIP_SIZE.width - 8);
            expect(arrowOf(tooltip).style.top).toBe('0px');
        });

        it('follows the host center vertically for left/right tooltips', async () => {
            const host = mountHost([400, 0, 100, 10], { right: true });
            const tooltip = await show(host);

            // tooltip top is clamped to 4, host center is 5 -> arrow clamped to the 8px inset
            expect(arrowOf(tooltip).style.top).toBe('8px');
            expect(arrowOf(tooltip).style.left).toBe('0px');
        });
    });

    describe('window and scroll behaviour', () => {
        it('repositions on window resize instead of hiding', async () => {
            const host = mountHost([VIEWPORT.width - 262, 300, 40, 30], { right: true });
            const tooltip = await show(host);

            expect(tooltip.getAttribute('data-p-position')).toBe('right');

            window.innerWidth = VIEWPORT.width - 100;
            window.dispatchEvent(new Event('resize'));

            expect(document.body.querySelector('[role="tooltip"]')).toBe(tooltip);
            expect(tooltip.getAttribute('data-p-position')).toBe('left');
        });

        it('follows the host on scroll and hides when the host leaves the viewport', async () => {
            const host = mountHost([400, 300, 100, 30], { top: true });
            const tooltip = await show(host);

            host.getBoundingClientRect = () => rect(400, 200, 100, 30);
            host.$_ptooltipScrollHandler.listener();

            expect(pos(tooltip).top).toBe(200 - TOOLTIP_SIZE.height);

            host.getBoundingClientRect = () => rect(400, -100, 100, 30);
            host.$_ptooltipScrollHandler.listener();

            expect(document.body.querySelector('[role="tooltip"]')).toBeNull();
        });
    });
});
