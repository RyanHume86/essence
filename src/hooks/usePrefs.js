// usePrefs — the local preferences domain store (AD-1 / AD-6).
//
// The single funnel for reading/writing the user's name, colour scheme,
// creature, and `onboarded` flag. Backed by localStorage only (never Base44);
// the pure storage/normalization logic lives in `@/lib/prefs`. A context
// provider so a scheme change both persists and re-skins the whole tree, and
// applies the active scheme to the document root before paint.
//
// Written with React.createElement (no JSX) so the file keeps the `useX.js`
// hook naming convention without needing the JSX loader.

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import { readPrefs, writePrefs, schemeMode } from '@/lib/prefs';

const PrefsContext = createContext(/** @type {any} */ (null));

export function PrefsProvider({ children }) {
  // Initialized synchronously from storage — no network, no loading state.
  const [prefs, setPrefs] = useState(readPrefs);

  // Reflect the active scheme onto <html> before paint so every token resolves.
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset.scheme = prefs.scheme;
    root.style.colorScheme = schemeMode(prefs.scheme);
    // Keep the browser/OS chrome colour (address bar, PWA status bar) in step
    // with the scheme's background — derived from the resolved token.
    const bg = getComputedStyle(root).getPropertyValue('--background').trim();
    const meta = document.querySelector('meta[name="theme-color"]');
    if (bg && meta) meta.setAttribute('content', `rgb(${bg})`);
  }, [prefs.scheme]);

  const updatePrefs = useCallback((patch) => {
    setPrefs(writePrefs(patch));
  }, []);

  const value = useMemo(
    () => ({
      ...prefs,
      updatePrefs,
      setName: (name) => updatePrefs({ name }),
      setScheme: (scheme) => updatePrefs({ scheme }),
      setCreature: (creature) => updatePrefs({ creature }),
      setOnboarded: (onboarded) => updatePrefs({ onboarded }),
      setNotifications: (notifications) => updatePrefs({ notifications }),
    }),
    [prefs, updatePrefs],
  );

  return createElement(PrefsContext.Provider, { value }, children);
}

/**
 * Access the local prefs store. Must be called within <PrefsProvider>.
 * @returns {{name: string, scheme: string, creature: string, onboarded: boolean,
 *   notifications: boolean, updatePrefs: (patch: object) => void,
 *   setName: (v: string) => void, setScheme: (v: string) => void,
 *   setCreature: (v: string) => void, setOnboarded: (v: boolean) => void,
 *   setNotifications: (v: boolean) => void}}
 */
export function usePrefs() {
  const ctx = useContext(PrefsContext);
  if (!ctx) throw new Error('usePrefs must be used within <PrefsProvider>');
  return ctx;
}
