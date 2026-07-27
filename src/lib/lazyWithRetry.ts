import { lazy, type ComponentType } from "react";

const RELOAD_KEY = "chunk-reload-ts";

/**
 * React.lazy wrapper that survives stale chunk hashes after a new deploy.
 * Retries once, then force-reloads the page (at most once per minute).
 */
export function lazyWithRetry<T extends ComponentType<any>>(
  factory: () => Promise<{ default: T }>
) {
  return lazy(async () => {
    try {
      return await factory();
    } catch (err) {
      // one silent retry (handles transient network blips)
      try {
        await new Promise((r) => setTimeout(r, 300));
        return await factory();
      } catch (err2) {
        const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
        if (Date.now() - last > 60_000) {
          sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
          window.location.reload();
          // keep the promise pending while the page reloads
          return new Promise<{ default: T }>(() => {});
        }
        throw err2;
      }
    }
  });
}
