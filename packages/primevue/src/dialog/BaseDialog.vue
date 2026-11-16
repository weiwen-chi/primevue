<script>
import BaseComponent from '@primevue/core/basecomponent';
import DialogStyle from 'primevue/dialog/style';

export default {
    name: 'BaseDialog',
    extends: BaseComponent,
    props: {
        header: {
            type: null,
            default: null
        },
        footer: {
            type: null,
            default: null
        },
        visible: {
            type: Boolean,
            default: false
        },
        modal: {
            type: Boolean,
            default: null
        },
        contentStyle: {
            type: null,
            default: null
        },
        contentClass: {
            type: String,
            default: null
        },
        contentProps: {
            type: null,
            default: null
        },
        maximizable: {
            type: Boolean,
            default: false
        },
        dismissableMask: {
            type: Boolean,
            default: false
        },
        closable: {
            type: Boolean,
            default: true
        },
        closeOnEscape: {
            type: Boolean,
            default: true
        },
        showHeader: {
            type: Boolean,
            default: true
        },
        blockScroll: {
            type: Boolean,
            default: false
        },
        baseZIndex: {
            type: Number,
            default: 0
        },
        autoZIndex: {
            type: Boolean,
            default: true
        },
        position: {
            type: String,
            default: 'center'
        },
        breakpoints: {
            type: Object,
            default: null
        },
        draggable: {
            type: Boolean,
            default: true
        },
        keepInViewport: {
            type: Boolean,
            default: true
        },
        minX: {
            type: Number,
            default: 0
        },
        minY: {
            type: Number,
            default: 0
        },
        appendTo: {
            type: [String, Object],
            default: 'body'
        },
        closeIcon: {
            type: String,
            default: undefined
        },
        maximizeIcon: {
            type: String,
            default: undefined
        },
        minimizeIcon: {
            type: String,
            default: undefined
        },
        closeButtonProps: {
            type: Object,
            default: () => {
                return {
                    severity: 'secondary',
                    text: true,
                    rounded: true
                };
            }
        },
        maximizeButtonProps: {
            type: Object,
            default: () => {
                return {
                    severity: 'secondary',
                    text: true,
                    rounded: true
                };
            }
        },
        maximized: {
            type: Boolean,
            default: false
        },
        resizable: {
            type: Boolean,
            default: false
        },
        minWidth: {
            type: Number,
            default: 150
        },
        minHeight: {
            type: Number,
            default: 100
        },
        beforeClose: {
            type: Function,
            default: null
        },
        destroyOnClose: {
            type: Boolean,
            default: true
        },
        restoreFocus: {
            type: Boolean,
            default: true
        },
        _instance: null
    },
    style: DialogStyle,
    provide() {
        return {
            $pcDialog: this,
            $parentInstance: this
        };
    }
};
</script>
