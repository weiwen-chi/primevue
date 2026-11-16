/**
 *
 * Dialog is a container to display content in an overlay window.
 *
 * [Live Demo](https://www.primevue.org/dialog)
 *
 * @module dialog
 *
 */
import type { DefineComponent, DesignToken, EmitFn, HintedString, PassThrough } from '@primevue/core';
import type { ComponentHooks } from '@primevue/core/basecomponent';
import type { ButtonPassThroughOptions, ButtonProps } from 'primevue/button';
import type { PassThroughOptions } from 'primevue/passthrough';
import { HTMLAttributes, TransitionProps, VNode } from 'vue';

export declare type DialogPassThroughOptionType<T = any> = DialogPassThroughAttributes | ((options: DialogPassThroughMethodOptions<T>) => DialogPassThroughAttributes | string) | string | null | undefined;

export declare type DialogPassThroughTransitionType<T = any> = TransitionProps | ((options: DialogPassThroughMethodOptions<T>) => TransitionProps) | undefined;

/**
 * Custom passthrough(pt) option method.
 */
export interface DialogPassThroughMethodOptions<T> {
    /**
     * Defines instance.
     */
    instance: any;
    /**
     * Defines valid properties.
     */
    props: DialogProps;
    /**
     * Defines current inline state.
     */
    state: DialogState;
    /**
     * Defines current options, only available for the resize handles.
     */
    context: DialogContext;
    /**
     * Defines parent instance.
     */
    parent: T;
    /**
     * Defines passthrough(pt) options in global config.
     */
    global: object | undefined;
}

/**
 * Custom shared passthrough(pt) option method.
 */
export interface DialogSharedPassThroughMethodOptions {
    /**
     * Defines valid properties.
     */
    props: DialogProps;
    /**
     * Defines current inline state.
     */
    state: DialogState;
}

/**
 * Custom passthrough(pt) options.
 * @see {@link DialogProps.pt}
 */
export interface DialogPassThroughOptions<T = any> {
    /**
     * Used to pass attributes to the root's DOM element.
     */
    root?: DialogPassThroughOptionType<T>;
    /**
     * Used to pass attributes to the header's DOM element.
     */
    header?: DialogPassThroughOptionType<T>;
    /**
     * Used to pass attributes to the header title's DOM element.
     */
    title?: DialogPassThroughOptionType<T>;
    /**
     * Used to pass attributes to the header actions' DOM element.
     */
    headerActions?: DialogPassThroughOptionType<T>;
    /**
     * Used to pass attributes to the maximize Button component.
     * @see {@link ButtonPassThroughOptions}
     */
    pcMaximizeButton?: ButtonPassThroughOptions<DialogSharedPassThroughMethodOptions>;
    /**
     * Used to pass attributes to the close Button component.
     * @see {@link ButtonPassThroughOptions}
     */
    pcCloseButton?: ButtonPassThroughOptions<DialogSharedPassThroughMethodOptions>;
    /**
     * Used to pass attributes to the content's DOM element.
     */
    content?: DialogPassThroughOptionType<T>;
    /**
     * Used to pass attributes to the footer's DOM element.
     */
    footer?: DialogPassThroughOptionType<T>;
    /**
     * Used to pass attributes to the mask's DOM element.
     */
    mask?: DialogPassThroughOptionType<T>;
    /**
     * Used to pass attributes to the resize handle DOM elements. The handle direction is available as `context.direction`.
     */
    resizeHandle?: DialogPassThroughOptionType<T>;
    /**
     * Used to manage all lifecycle hooks.
     * @see {@link BaseComponent.ComponentHooks}
     */
    hooks?: ComponentHooks;
    /**
     * Used to control Vue Transition API.
     */
    transition?: DialogPassThroughTransitionType<T>;
}

/**
 * Custom passthrough attributes for each DOM elements
 */
export interface DialogPassThroughAttributes {
    [key: string]: any;
}

/**
 * Defines current inline state in Dialog component.
 */
export interface DialogState {
    /**
     * Current visible state of the container as a boolean.
     * @defaultValue false
     */
    containerVisible: boolean;
    /**
     * Current maximized state as a boolean.
     * @defaultValue false
     */
    d_maximized: boolean;
    /**
     * Whether the dialog has been displayed at least once, used to keep the content alive when `destroyOnClose` is false.
     * @defaultValue false
     */
    rendered: boolean;
}

/**
 * Defines current options in Dialog component.
 */
export interface DialogContext {
    /**
     * Direction of the resize handle, `e` (right edge), `s` (bottom edge) or `se` (bottom right corner).
     */
    direction: 'e' | 's' | 'se';
}

/**
 * Source of a close request.
 * - `close`: the close button or the `closeCallback` of a template
 * - `escape`: the escape key
 * - `mask`: a click on the modal mask when `dismissableMask` is enabled
 */
export type DialogCloseSource = 'close' | 'escape' | 'mask';

/**
 * Parameter of the `beforeClose` callback.
 */
export interface DialogBeforeCloseEvent {
    /**
     * Browser event that triggered the close request, if any.
     */
    originalEvent: Event | undefined;
    /**
     * What triggered the close request.
     */
    source: DialogCloseSource;
}

/**
 * Signature of the `beforeClose` callback, returning `false` or a promise resolving to `false` cancels closing.
 */
export type DialogBeforeCloseHandler = (event: DialogBeforeCloseEvent) => boolean | void | Promise<boolean | void>;

/**
 * Custom resize event.
 * @see {@link DialogEmitsOptions.resizestart}
 * @see {@link DialogEmitsOptions.resize}
 * @see {@link DialogEmitsOptions.resizeend}
 */
export interface DialogResizeEvent {
    /**
     * Browser event.
     */
    originalEvent: Event | undefined;
    /**
     * Width of the dialog in pixels.
     */
    width: number;
    /**
     * Height of the dialog in pixels.
     */
    height: number;
}

/**
 * Custom breakpoint metadata.
 */
export interface DialogBreakpoints {
    /**
     * Breakpoint for responsive mode.
     *
     * Example:
     *
     * <Dialog :breakpoints="{'960px': '75vw', '640px': '100vw'}" ... />
     *
     * Result:
     *
     * @media screen and (max-width: ${breakpoint[key]}) {
     *      .p-dialog[attributeSelector] {
     *          width: ${breakpoint[value]} !important;
     *      }
     * }
     */
    [key: string]: string;
}

/**
 * Defines valid properties in Dialog component.
 */
export interface DialogProps {
    /**
     * Title content of the dialog.
     */
    header?: string | undefined;
    /**
     * Footer content of the dialog.
     */
    footer?: string | undefined;
    /**
     * Specifies the visibility of the dialog.
     * @defaultValue false
     */
    visible?: boolean | undefined;
    /**
     * Defines if background should be blocked when dialog is displayed.
     * @defaultValue false
     */
    modal?: boolean | undefined;
    /**
     * Style of the content section.
     */
    contentStyle?: any;
    /**
     * Style class of the content section.
     */
    contentClass?: any;
    /**
     * Used to pass all properties of the HTMLDivElement to the overlay Dialog inside the component.
     */
    contentProps?: HTMLAttributes | undefined;
    /**
     * Adds a close icon to the header to hide the dialog.
     * @defaultValue true
     */
    closable?: boolean | undefined;
    /**
     * Specifies if clicking the modal background should hide the dialog.
     * @defaultValue false
     */
    dismissableMask?: boolean | undefined;
    /**
     * Specifies if pressing escape key should hide the dialog.
     * @defaultValue true
     */
    closeOnEscape?: boolean | undefined;
    /**
     * Whether to show the header or not.
     * @defaultValue true
     */
    showHeader?: boolean | undefined;
    /**
     * Whether background scroll should be blocked when dialog is visible.
     * @defaultValue false
     */
    blockScroll?: boolean | undefined;
    /**
     * Base zIndex value to use in layering.
     * @defaultValue 0
     */
    baseZIndex?: number | undefined;
    /**
     * Whether to automatically manage layering.
     * @defaultValue true
     */
    autoZIndex?: boolean | undefined;
    /**
     * Position of the dialog.
     * @defaultValue center
     */
    position?: HintedString<'center' | 'top' | 'bottom' | 'left' | 'right' | 'topleft' | 'topright' | 'bottomleft' | 'bottomright'> | undefined;
    /**
     * Whether the dialog can be displayed full screen.
     * @defaultValue false
     */
    maximizable?: boolean | undefined;
    /**
     * Maximized (full screen) state of the dialog, supports two-way binding with `v-model:maximized`.
     * Can also be used without `maximizable` to display a full screen dialog without a maximize button.
     * @defaultValue false
     */
    maximized?: boolean | undefined;
    /**
     * Enables resizing the dialog with the handles at the right edge, bottom edge and bottom right corner. Not available while maximized.
     * @defaultValue false
     */
    resizable?: boolean | undefined;
    /**
     * Minimum width in pixels when resizing.
     * @defaultValue 150
     */
    minWidth?: number | undefined;
    /**
     * Minimum height in pixels when resizing.
     * @defaultValue 100
     */
    minHeight?: number | undefined;
    /**
     * Guard invoked before the dialog is closed by the user with the close button, the escape key or a mask click.
     * Returning `false`, or a promise resolving to `false` (or rejecting), cancels closing. Any other value closes the dialog.
     * Receives a DialogBeforeCloseEvent with the `originalEvent` and the `source` of the request (`close`, `escape` or `mask`). Not invoked when `visible` is changed by the parent.
     */
    beforeClose?: DialogBeforeCloseHandler | undefined;
    /**
     * Whether the content is destroyed when the dialog is hidden. When false, the content is kept alive (hidden) after the first display, preserving its state.
     * Content is never rendered before the dialog is displayed for the first time.
     * @defaultValue true
     */
    destroyOnClose?: boolean | undefined;
    /**
     * Whether focus returns to the element that was focused before the dialog was displayed when the dialog hides.
     * @defaultValue true
     */
    restoreFocus?: boolean | undefined;
    /**
     * Object literal to define widths per screen size.
     */
    breakpoints?: DialogBreakpoints;
    /**
     * Enables dragging to change the position using header.
     * @defaultValue true
     */
    draggable?: boolean | undefined;
    /**
     * Keeps dialog in the viewport when dragging.
     * @defaultValue true
     */
    keepInViewport?: boolean | undefined;
    /**
     * Minimum value for the left coordinate of dialog in dragging.
     * @defaultValue 0.
     */
    minX?: number | undefined;
    /**
     * Minimum value for the top coordinate of dialog in dragging.
     * @defaultValue 0
     */
    minY?: number | undefined;
    /**
     * A valid query selector or an HTMLElement to specify where the dialog gets attached.
     * @defaultValue body
     */
    appendTo?: HintedString<'body' | 'self'> | undefined | HTMLElement;
    /**
     * Style of the dynamic dialog.
     */
    style?: any;
    /**
     * Icon to display in the dialog close button.
     */
    closeIcon?: string | undefined;
    /**
     * Icon to display in the dialog maximize button when dialog is not maximized.
     */
    maximizeIcon?: string | undefined;
    /**
     * Icon to display in the dialog maximize button when dialog is minimized.
     */
    minimizeIcon?: string | undefined;
    /**
     * Used to pass all properties of the ButtonProps to the Button component.
     * @type {ButtonProps}
     * @defaultValue { severity: 'secondary', rounded: true, text: true }
     */
    closeButtonProps?: object | undefined;
    /**
     * Used to pass all properties of the ButtonProps to the Button component.
     * @type {ButtonProps}
     * @defaultValue { severity: 'secondary', rounded: true, text: true }
     */
    maximizeButtonProps?: object | undefined;
    /**
     * It generates scoped CSS variables using design tokens for the component.
     */
    dt?: DesignToken<any>;
    /**
     * Used to pass attributes to DOM elements inside the component.
     * @type {DialogPassThroughOptions}
     */
    pt?: PassThrough<DialogPassThroughOptions>;
    /**
     * Used to configure passthrough(pt) options of the component.
     * @type {PassThroughOptions}
     */
    ptOptions?: PassThroughOptions;
    /**
     * When enabled, it removes component related styles in the core.
     * @defaultValue false
     */
    unstyled?: boolean;
}

/**
 * Defines valid slots in Dialog component.
 */
export interface DialogSlots {
    /**
     * Default content slot.
     */
    default(): VNode[];
    /**
     * Custom header template.
     */
    header(): VNode[];
    /**
     * Custom footer template.
     */
    footer(): VNode[];
    /**
     * Custom close button template.
     * @param {Object} scope - close button slot's params.
     */
    closebutton(scope: {
        /**
         * Close function.
         */
        closeCallback: () => void;
    }): VNode[];
    /**
     * Custom close icon template.
     * @param {Object} scope - close icon slot's params.
     */
    closeicon(scope: {
        /**
         * Style class of the close icon
         */
        class: any;
    }): VNode[];
    /**
     * Custom maximize button template.
     * @param {Object} scope - maximize button slot's params.
     */
    maximizebutton(scope: {
        /**
         * Maximized state as a boolean
         */
        maximized: boolean;
        /**
         * Toggle maximize function.
         * @param {Event} event - Browser event
         */
        maximizeCallback: (event: Event) => void;
    }): VNode[];
    /**
     * Custom maximize icon template of dialog.
     * @param {Object} scope - maximize icon slot's params.
     */
    maximizeicon(scope: {
        /**
         * Maximized state as a boolean
         */
        maximized: boolean;
        /**
         * Style class of the maximize icon
         */
        class: any;
    }): VNode[];
    /**
     * Custom container slot.
     * @param {Object} scope - container slot's params.
     */
    container(scope: {
        /**
         * Close dialog function.
         */
        closeCallback: () => void;
        /**
         * Maximize/minimize dialog function.
         * @param {Event} event - Browser event
         */
        maximizeCallback: (event: Event) => void;
        /**
         * Initialize drag function for custom container elements.
         * @param {Event} event - Browser event
         */
        initDragCallback: (event: Event) => void;
    }): VNode[];
}

/**
 * Defines valid emits in Dialog component.
 */
export interface DialogEmitsOptions {
    /**
     * Emitted when the visible changes.
     * @param {boolean} value - New value.
     */
    'update:visible'(value: boolean): void;
    /**
     * Callback to invoke when dialog is hidden.
     */
    hide(): void;
    /**
     * Callback to invoke after dialog is hidden.
     */
    'after-hide'(): void;
    /**
     * Callback to invoke when dialog is shown.
     */
    show(): void;
    /**
     * Fired when a dialog gets maximized.
     * @param {event} event - Browser event.
     */
    maximize(event: Event): void;
    /**
     * Fired when a dialog gets unmaximized.
     * @param {event} event - Browser event.
     */
    unmaximize(event: Event): void;
    /**
     * Fired when a dialog drag begins.
     * @param {event} event - Browser event.
     */
    dragstart(event: Event): void;
    /**
     * Fired when a dialog drag completes.
     * @param {event} event - Browser event.
     */
    dragend(event: Event): void;
    /**
     * Emitted when the maximized state is changed by the user.
     * @param {boolean} value - New value.
     */
    'update:maximized'(value: boolean): void;
    /**
     * Fired when a dialog resize begins.
     * @param {DialogResizeEvent} event - Custom resize event.
     */
    resizestart(event: DialogResizeEvent): void;
    /**
     * Fired while a dialog is being resized.
     * @param {DialogResizeEvent} event - Custom resize event.
     */
    resize(event: DialogResizeEvent): void;
    /**
     * Fired when a dialog resize completes.
     * @param {DialogResizeEvent} event - Custom resize event.
     */
    resizeend(event: DialogResizeEvent): void;
}

export declare type DialogEmits = EmitFn<DialogEmitsOptions>;

/**
 * **PrimeVue - Dialog**
 *
 * _Dialog is a container to display content in an overlay window._
 *
 * [Live Demo](https://www.primevue.org/dialog/)
 * --- ---
 * ![PrimeVue](https://primefaces.org/cdn/primevue/images/logo-100.png)
 *
 * @group Component
 *
 */
declare const Dialog: DefineComponent<DialogProps, DialogSlots, DialogEmits>;

declare module 'vue' {
    export interface GlobalComponents {
        Dialog: DefineComponent<DialogProps, DialogSlots, DialogEmits>;
    }
}

export default Dialog;
