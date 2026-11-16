import { style } from '@primeuix/styles/dialog';
import BaseStyle from '@primevue/core/base/style';

/* Resize handles */
const resizeStyle = `
    .p-dialog-resize-handle {
        position: absolute;
        z-index: 1;
        touch-action: none;
    }

    .p-dialog-resize-handle-e {
        top: 0;
        right: -3px;
        width: 6px;
        height: 100%;
        cursor: ew-resize;
    }

    .p-dialog-resize-handle-s {
        left: 0;
        bottom: -3px;
        width: 100%;
        height: 6px;
        cursor: ns-resize;
    }

    .p-dialog-resize-handle-se {
        right: 0;
        bottom: 0;
        width: 14px;
        height: 14px;
        cursor: nwse-resize;
        z-index: 2;
    }

    .p-dialog-resize-handle-se::after {
        content: '';
        position: absolute;
        right: 4px;
        bottom: 4px;
        width: 6px;
        height: 6px;
        border-right: 2px solid dt('dialog.border.color');
        border-bottom: 2px solid dt('dialog.border.color');
    }
`;

/* Position */
const inlineStyles = {
    mask: ({ position, modal }) => ({
        position: 'fixed',
        height: '100%',
        width: '100%',
        left: 0,
        top: 0,
        display: 'flex',
        justifyContent: position === 'left' || position === 'topleft' || position === 'bottomleft' ? 'flex-start' : position === 'right' || position === 'topright' || position === 'bottomright' ? 'flex-end' : 'center',
        alignItems: position === 'top' || position === 'topleft' || position === 'topright' ? 'flex-start' : position === 'bottom' || position === 'bottomleft' || position === 'bottomright' ? 'flex-end' : 'center',
        pointerEvents: modal ? 'auto' : 'none'
    }),
    root: {
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'auto'
    }
};

const classes = {
    mask: ({ props }) => {
        const positions = ['left', 'right', 'top', 'topleft', 'topright', 'bottom', 'bottomleft', 'bottomright'];
        const pos = positions.find((item) => item === props.position);

        return [
            'p-dialog-mask',
            {
                'p-overlay-mask p-overlay-mask-enter-active': props.modal
            },
            pos ? `p-dialog-${pos}` : ''
        ];
    },
    root: ({ props, instance }) => [
        'p-dialog p-component',
        {
            'p-dialog-maximized': instance.d_maximized,
            'p-dialog-resizable': props.resizable
        }
    ],
    header: 'p-dialog-header',
    title: 'p-dialog-title',
    headerActions: 'p-dialog-header-actions',
    pcMaximizeButton: 'p-dialog-maximize-button',
    pcCloseButton: 'p-dialog-close-button',
    content: 'p-dialog-content',
    footer: 'p-dialog-footer',
    resizeHandle: ({ direction }) => ['p-dialog-resize-handle', `p-dialog-resize-handle-${direction}`]
};

export default BaseStyle.extend({
    name: 'dialog',
    style: style + resizeStyle,
    classes,
    inlineStyles
});
