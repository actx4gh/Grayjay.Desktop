import { Component, createMemo, JSX, Show } from 'solid-js'

import styles from './index.module.css';
import { FocusableOptions } from '../../../nav';
import { focusable } from '../../../focusable'; void focusable;

interface ButtonProps {
    icon?: string;
    text: string;
    color?: string;
    focusColor?: string;
    textColor?: string;
    focusTextColor?: string;
    onClick?: (event: MouseEvent) => void;
    small?: boolean;
    style?: JSX.CSSProperties;
    focusableOpts?: FocusableOptions;
    autofocus?: boolean;
    disabled?: boolean;
}

const Button: Component<ButtonProps> = (props) => {
    const handleClick = (event: MouseEvent) => {
        if (props.disabled) {
            event.preventDefault();
            event.stopPropagation();
            return;
        }
        if (props.onClick) {
            props.onClick(event);
        }
    };

    const focusableOpts = createMemo(() => {
        if (!props.focusableOpts) {
            return undefined;
        }

        if (!props.disabled) {
            return props.focusableOpts;
        }

        return {
            ...props.focusableOpts,
            disabled: true,
            onPress: undefined,
            onAction: undefined,
            onOptions: undefined,
        } as FocusableOptions;
    });

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
            '--btn-bg': bg,
            '--btn-bg-focus': bgFocus,
            '--btn-text': text,
            '--btn-text-focus': textFocus,
            '--btn-icon-filter-focus': iconFilterFocus,
            width: props.style?.width ?? 'fit-content',
        } as JSX.CSSProperties & Record<string, string>;
    });

    return (
        <div class={styles.container} classList={{[styles.small]: props.small, [styles.disabled]: props.disabled}} style={style()} onClick={handleClick} use:focusable={focusableOpts()} data-autofocus={props.autofocus ? '' : undefined} aria-disabled={props.disabled ? 'true' : undefined}>
            <Show when={props.icon}>
                <img src={props.icon} class={styles.icon} alt={props.text} />
            </Show>
            <div class={styles.text}>{props.text}</div>
        </div>
    );
};

export default Button;