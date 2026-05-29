import { Component, createEffect, onCleanup, onMount } from 'solid-js';
import StateGlobal from './state/StateGlobal';

const THEME_SYSTEM = 0;
const THEME_DARK = 1;
const THEME_LIGHT = 2;

type ResolvedTheme = 'dark' | 'light';

let installed = false;

function getSystemTheme(): ResolvedTheme {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return 'dark';
  }

  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

function resolveTheme(setting: unknown): ResolvedTheme {
  if (setting === THEME_LIGHT) {
    return 'light';
  }

  if (setting === THEME_SYSTEM) {
    return getSystemTheme();
  }

  return 'dark';
}

function getPrepaintThemeSetting(): unknown {
  const source = document.documentElement.dataset.themeSource;

  if (source === 'light') {
    return THEME_LIGHT;
  }

  if (source === 'system') {
    return THEME_SYSTEM;
  }

  if (source === 'dark') {
    return THEME_DARK;
  }

  return undefined;
}

function getThemeSetting(): unknown {
  return StateGlobal.settings$()?.object?.appearance?.theme ?? getPrepaintThemeSetting();
}

function applyTheme(setting: unknown) {
  const theme = resolveTheme(setting);
  const root = document.documentElement;

  root.dataset.theme = theme;
  root.dataset.themeSource = setting === THEME_LIGHT ? 'light' : setting === THEME_DARK ? 'dark' : 'system';
  root.style.colorScheme = theme;
}

const NativeTheme: Component = () => {
  onMount(() => {
    if (installed) {
      return;
    }

    installed = true;
    const media = typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-color-scheme: light)')
      : undefined;
    const onSystemThemeChanged = () => applyTheme(getThemeSetting());

    applyTheme(getThemeSetting());

    if (media?.addEventListener) {
      media.addEventListener('change', onSystemThemeChanged);
      onCleanup(() => media.removeEventListener('change', onSystemThemeChanged));
    } else if (media?.addListener) {
      media.addListener(onSystemThemeChanged);
      onCleanup(() => media.removeListener(onSystemThemeChanged));
    }
  });

  createEffect(() => {
    applyTheme(getThemeSetting());
  });

  return null;
};

export default NativeTheme;
