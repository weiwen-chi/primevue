import { mount } from '@vue/test-utils';
import { defineComponent, h, KeepAlive, nextTick, reactive, ref } from 'vue';
import Column from 'primevue/column';
import DataTable from 'primevue/datatable';
import VirtualScroller from './VirtualScroller.vue';

const VIEWPORT = 200;
const ITEM_SIZE = 50;

// jsdom has no layout engine: emulate the bits the component relies on. An element is considered hidden when it,
// or one of its ancestors, has the `data-hidden` attribute (i.e. "display: none").
const isHiddenNode = (el) => !el.isConnected || !!el.closest('[data-hidden]');
const descriptors = {};
const observers = [];

class ResizeObserverMock {
    constructor(callback) {
        this.callback = callback;
        this.elements = [];
        observers.push(this);
    }

    observe(el) {
        this.elements.push(el);
    }

    disconnect() {
        this.elements = [];
        this.disconnected = true;
    }
}

const triggerResize = () => observers.filter((o) => !o.disconnected && o.elements.length).forEach((o) => o.callback(o.elements.map((target) => ({ target }))));
const nextFrame = () => new Promise((resolve) => (typeof requestAnimationFrame === 'function' ? requestAnimationFrame(() => resolve()) : setTimeout(resolve)));

const createItems = (length) => Array.from({ length }, (_, i) => `Item ${i}`);

const mountScroller = (props = {}, options = {}) =>
    mount(VirtualScroller, {
        attachTo: options.attachTo || document.body,
        props: { items: createItems(1000), itemSize: ITEM_SIZE, ...props },
        slots: {
            item: ({ item, options }) => h('div', { class: 'item', 'data-index': options.index }, item)
        }
    });

const renderedIndexes = (wrapper) => wrapper.findAll('.item').map((w) => Number(w.attributes('data-index')));

beforeAll(() => {
    const proto = HTMLElement.prototype;

    ['offsetParent', 'offsetHeight', 'offsetWidth'].forEach((key) => (descriptors[key] = Object.getOwnPropertyDescriptor(proto, key)));
    descriptors.scrollTo = proto.scrollTo;
    descriptors.ResizeObserver = window.ResizeObserver;

    Object.defineProperty(proto, 'offsetParent', {
        configurable: true,
        get() {
            return isHiddenNode(this) ? null : this.parentElement;
        }
    });
    Object.defineProperty(proto, 'offsetHeight', {
        configurable: true,
        get() {
            // an explicit pixel height wins, like in a browser
            return !isHiddenNode(this) && this.classList.contains('p-virtualscroller') ? (/px$/.test(this.style.height) ? parseFloat(this.style.height) : VIEWPORT) : 0;
        }
    });
    Object.defineProperty(proto, 'offsetWidth', {
        configurable: true,
        get() {
            return !isHiddenNode(this) && this.classList.contains('p-virtualscroller') ? VIEWPORT : 0;
        }
    });
    proto.scrollTo = function (options) {
        this.scrollTop = options?.top || 0;
        this.scrollLeft = options?.left || 0;
    };
    window.ResizeObserver = ResizeObserverMock;

    // jsdom returns '' for unset paddings where browsers return '0px'
    descriptors.getComputedStyle = window.getComputedStyle;
    window.getComputedStyle = (el, pseudo) => {
        const style = descriptors.getComputedStyle.call(window, el, pseudo);

        return new Proxy(style, {
            get: (target, key) => {
                const value = Reflect.get(target, key);

                return typeof value === 'function' ? value.bind(target) : typeof key === 'string' && key.startsWith('padding') && !value ? '0px' : value;
            }
        });
    };
});

afterAll(() => {
    const proto = HTMLElement.prototype;

    ['offsetParent', 'offsetHeight', 'offsetWidth'].forEach((key) => (descriptors[key] ? Object.defineProperty(proto, key, descriptors[key]) : delete proto[key]));
    proto.scrollTo = descriptors.scrollTo;
    window.ResizeObserver = descriptors.ResizeObserver;
    window.getComputedStyle = descriptors.getComputedStyle;
});

afterEach(() => {
    observers.length = 0;
    document.body.innerHTML = '';
});

describe('VirtualScroller.vue', () => {
    it('renders only the items of the viewport (plus tolerated items) when visible', async () => {
        const wrapper = mountScroller();

        await nextTick();

        const indexes = renderedIndexes(wrapper);

        expect(wrapper.find('.p-virtualscroller').exists()).toBe(true);
        expect(indexes.length).toBeGreaterThanOrEqual(VIEWPORT / ITEM_SIZE);
        expect(indexes.length).toBeLessThan(50);
        expect(indexes[0]).toBe(0);
        expect(wrapper.find('.item').text()).toBe('Item 0');
        expect(wrapper.find('.p-virtualscroller-spacer').element.style.height).toBe(`${1000 * ITEM_SIZE}px`);

        wrapper.unmount();
    });

    it('updates the rendered range on scroll', async () => {
        const wrapper = mountScroller();

        await nextTick();

        const el = wrapper.find('.p-virtualscroller').element;

        el.scrollTop = 500 * ITEM_SIZE;
        await wrapper.find('.p-virtualscroller').trigger('scroll');

        const indexes = renderedIndexes(wrapper);

        expect(indexes).toContain(500);
        expect(indexes).toContain(500 + VIEWPORT / ITEM_SIZE - 1);
        expect(indexes).not.toContain(0);
        expect(wrapper.emitted('scroll')).toHaveLength(1);
        expect(wrapper.emitted('scroll-index-change')).toHaveLength(1);
        expect(wrapper.vm.getRenderedRange().viewport.first).toBe(500);
        expect(wrapper.find('.p-virtualscroller-content').element.style.transform).toBe(`translate3d(0px, ${wrapper.vm.first * ITEM_SIZE}px, 0)`);

        wrapper.unmount();
    });

    it('does not treat every scroll event as a range change after scrollToIndex', async () => {
        const wrapper = mountScroller();

        await nextTick();

        const scroller = wrapper.find('.p-virtualscroller');

        wrapper.vm.scrollToIndex(300);
        await scroller.trigger('scroll');

        const emitted = wrapper.emitted('scroll-index-change').length;

        // a tiny scroll that stays inside the rendered range must not re-render
        scroller.element.scrollTop += 1;
        await scroller.trigger('scroll');
        scroller.element.scrollTop += 1;
        await scroller.trigger('scroll');

        expect(renderedIndexes(wrapper)).toContain(300);
        expect(wrapper.emitted('scroll-index-change')).toHaveLength(emitted);

        wrapper.unmount();
    });

    it('renders the items once it becomes visible after being mounted hidden', async () => {
        const parent = document.createElement('div');

        parent.setAttribute('data-hidden', '');
        document.body.appendChild(parent);

        const wrapper = mountScroller({ items: [] }, { attachTo: parent });

        await nextTick();
        expect(renderedIndexes(wrapper)).toHaveLength(0);

        // data arrives while still hidden (e.g. lazy loaded data in an inactive tab)
        await wrapper.setProps({ items: createItems(1000) });
        triggerResize();
        await nextFrame();
        await nextTick();

        const el = wrapper.find('.p-virtualscroller').element;

        expect(renderedIndexes(wrapper)).toHaveLength(0);
        // the hidden (0) size must never be written to the element, it would keep the viewport empty forever
        expect(el.style.height).not.toBe('0px');

        // show it
        parent.removeAttribute('data-hidden');
        triggerResize();
        await nextFrame();
        await nextTick();

        const indexes = renderedIndexes(wrapper);

        expect(indexes.length).toBeGreaterThanOrEqual(VIEWPORT / ITEM_SIZE);
        expect(indexes[0]).toBe(0);
        expect(el.style.height).toBe(`${VIEWPORT}px`);

        wrapper.unmount();
    });

    it('renders DataTable rows once a hidden virtual scrolling DataTable becomes visible', async () => {
        const parent = document.createElement('div');

        parent.setAttribute('data-hidden', '');
        document.body.appendChild(parent);

        const wrapper = mount(DataTable, {
            attachTo: parent,
            props: { value: [], scrollable: true, scrollHeight: `${VIEWPORT}px`, virtualScrollerOptions: { itemSize: ITEM_SIZE } },
            slots: { default: () => h(Column, { field: 'name', header: 'Name' }) }
        });

        await nextTick();

        // data loaded while the table is hidden
        await wrapper.setProps({ value: Array.from({ length: 1000 }, (_, i) => ({ name: `Row ${i}` })) });
        triggerResize();
        await nextFrame();
        await nextTick();

        expect(wrapper.findAll('tbody tr').length).toBeLessThanOrEqual(1);
        expect(wrapper.find('.p-virtualscroller').element.style.height).not.toBe('0px');

        parent.removeAttribute('data-hidden');
        triggerResize();
        await nextFrame();
        await nextTick();
        await nextTick();

        const rows = wrapper.findAll('tbody tr');

        expect(rows.length).toBeGreaterThanOrEqual(VIEWPORT / ITEM_SIZE);
        expect(rows[0].text()).toBe('Row 0');

        wrapper.unmount();
    });

    it('renders DataTable rows when data changes while a previously visible table is hidden', async () => {
        const parent = document.createElement('div');

        document.body.appendChild(parent);

        const createRows = (length, prefix) => Array.from({ length }, (_, i) => ({ name: `${prefix} ${i}` }));
        const wrapper = mount(DataTable, {
            attachTo: parent,
            props: { value: createRows(1000, 'Row'), scrollable: true, scrollHeight: `${VIEWPORT}px`, virtualScrollerOptions: { itemSize: ITEM_SIZE } },
            slots: { default: () => h(Column, { field: 'name', header: 'Name' }) }
        });

        await nextTick();
        await nextTick();
        expect(wrapper.findAll('tbody tr').length).toBeGreaterThanOrEqual(VIEWPORT / ITEM_SIZE);

        parent.setAttribute('data-hidden', '');
        triggerResize();

        // e.g. filtered or reloaded while the tab is inactive
        await wrapper.setProps({ value: createRows(500, 'New') });
        await nextTick();

        parent.removeAttribute('data-hidden');
        triggerResize();
        await nextFrame();
        await nextTick();
        await nextTick();

        const rows = wrapper.findAll('tbody tr');

        expect(wrapper.find('.p-virtualscroller').element.style.height).not.toBe('0px');
        expect(rows.length).toBeGreaterThanOrEqual(VIEWPORT / ITEM_SIZE);
        expect(rows[0].text()).toBe('New 0');

        wrapper.unmount();
    });

    it('re-syncs the rendered range when shown again with a reset scroll position', async () => {
        const parent = document.createElement('div');

        document.body.appendChild(parent);

        const wrapper = mountScroller({}, { attachTo: parent });

        await nextTick();

        const scroller = wrapper.find('.p-virtualscroller');

        scroller.element.scrollTop = 600 * ITEM_SIZE;
        await scroller.trigger('scroll');
        expect(renderedIndexes(wrapper)).toContain(600);

        // hide: browsers drop the scroll offset of display:none elements without firing a scroll event
        parent.setAttribute('data-hidden', '');
        triggerResize();
        scroller.element.scrollTop = 0;

        parent.removeAttribute('data-hidden');
        triggerResize();
        await nextFrame();
        await nextTick();

        expect(renderedIndexes(wrapper)[0]).toBe(0);

        wrapper.unmount();
    });

    it('re-syncs when re-activated inside keep-alive', async () => {
        const show = ref(true);
        const Other = defineComponent({ render: () => h('div', 'other') });
        const Host = defineComponent({
            render: () => h(KeepAlive, null, [show.value ? h(VirtualScroller, { items: createItems(1000), itemSize: ITEM_SIZE }, { item: ({ item, options }) => h('div', { class: 'item', 'data-index': options.index }, item) }) : h(Other)])
        });
        const wrapper = mount(Host, { attachTo: document.body });

        await nextTick();

        const scroller = wrapper.find('.p-virtualscroller');
        const el = scroller.element;

        el.scrollTop = 400 * ITEM_SIZE;
        await scroller.trigger('scroll');
        expect(renderedIndexes(wrapper)).toContain(400);

        show.value = false;
        await nextTick();
        el.scrollTop = 0; // detaching the element resets its scroll offset

        show.value = true;
        await nextTick();
        await nextTick();

        expect(renderedIndexes(wrapper)[0]).toBe(0);

        wrapper.unmount();
    });

    it('re-initialises when items are mutated in place', async () => {
        const items = reactive(createItems(10));
        const wrapper = mountScroller({ items });

        await nextTick();

        const spacer = wrapper.find('.p-virtualscroller-spacer').element;

        expect(spacer.style.height).toBe(`${10 * ITEM_SIZE}px`);

        items.push(...createItems(90));
        await nextTick();

        expect(spacer.style.height).toBe(`${100 * ITEM_SIZE}px`);

        wrapper.unmount();
    });

    it('does not deeply traverse the items', async () => {
        let reads = 0;
        const items = reactive(
            Array.from({ length: 100 }, (_, i) => ({
                get label() {
                    i === 99 && reads++;

                    return `Item ${i}`;
                }
            }))
        );
        // items are passed from a host component, so that test-utils' own props inspection doesn't read them
        const Host = defineComponent({ render: () => h(VirtualScroller, { items, itemSize: ITEM_SIZE }, { item: ({ item }) => h('div', { class: 'item' }, item.label) }) });
        const wrapper = mount(Host, { attachTo: document.body });

        await nextTick();

        // the last item is far outside the rendered range, nothing should read it
        expect(reads).toBe(0);

        wrapper.unmount();
    });

    it('observes the element and cleans up on unmount', async () => {
        const wrapper = mountScroller();

        await nextTick();

        const observer = observers.find((o) => o.elements.includes(wrapper.find('.p-virtualscroller').element));

        expect(observer).toBeDefined();

        wrapper.unmount();

        expect(observer.disconnected).toBe(true);
    });

    it('works without ResizeObserver', async () => {
        const original = window.ResizeObserver;

        delete window.ResizeObserver;

        try {
            const wrapper = mountScroller();

            await nextTick();

            expect(renderedIndexes(wrapper).length).toBeGreaterThan(0);

            wrapper.unmount();
        } finally {
            window.ResizeObserver = original;
        }
    });

    it('renders the default slot when disabled', () => {
        const wrapper = mount(VirtualScroller, {
            props: { items: createItems(5), disabled: true },
            slots: { default: () => h('div', { class: 'plain' }, 'plain') }
        });

        expect(wrapper.find('.p-virtualscroller').exists()).toBe(false);
        expect(wrapper.find('.plain').exists()).toBe(true);
    });
});
