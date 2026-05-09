import { Component, JSX, createMemo } from 'solid-js';

import styles from './index.module.css';
import { focusable } from "../../../focusable"; void focusable;
import { FocusableOptions } from '../../../nav';

interface PillButtonProps {
    icon: string;
    text: string;
    onClick?: () => void;
    focusableOpts?: FocusableOptions;
    color?: string;
    focusColor?: string;
    textColor?: string;
    focusTextColor?: string;
    style?: JSX.CSSProperties;
}

const PillButton: Component<PillButtonProps> = (props) => {
    const style = createMemo(() => {
        const normalizeNeutral = (color: string | undefined, fallback: string) => {
            if (!color) {
                return fallback;
            }
            const normalized = color.trim().toLowerCase();
            return (normalized === 'var(--gj-bg-control)' || normalized === '#2e2e2e' || normalized === '#222' || normalized === '#222222')
                ? fallback
                : color;
        };

        const bg = normalizeNeutral(props.color, 'var(--gj-bg-panel-strong)');
        const isNeutral = bg === 'var(--gj-bg-panel-strong)';
        const bgFocus = props.focusColor ?? (isNeutral ? 'var(--gj-bg-card-hover)' : 'var(--gj-text-primary)');
        const text = props.textColor ?? (isNeutral ? 'var(--gj-text-primary)' : 'var(--gj-text-primary)');
        const textFocus = props.focusTextColor ?? (isNeutral ? 'var(--gj-text-primary)' : (props.focusColor ? text : 'var(--gj-bg-popover)'));
        const iconFilterFocus = props.focusColor ? 'none' : 'brightness(0) saturate(100%)';

        return {
            ...props.style,
            '--pill-bg': bg,
            '--pill-bg-focus': bgFocus,
            '--pill-text': text,
            '--pill-text-focus': textFocus,
            '--pill-icon-filter-focus': iconFilterFocus,
        } as JSX.CSSProperties & Record<string, string>;
    });

    return (
        <div
            class={styles.container}
            style={style()}
            onClick={() => props.onClick?.()}
            use:focusable={props.focusableOpts}
        >
            <img class={styles.icon} src={props.icon} alt={props.text} />
            <div class={styles.text}>{props.text}</div>
        </div>
    );
};

export default PillButton;
