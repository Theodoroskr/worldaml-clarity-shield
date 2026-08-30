/**
 * Open an external checkout URL (e.g. Stripe Checkout) reliably.
 *
 * Inside embedded contexts such as the Lovable preview iframe, a same-tab
 * `window.location.href` navigation can fail to render the payment page
 * (Stripe Checkout relies on first-party storage). Opening in a new
 * top-level tab avoids that. If the popup is blocked, fall back to
 * same-tab navigation.
 */
export const openExternalCheckout = (url: string): void => {
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) {
    window.location.href = url;
  }
};

/**
 * Extract a human-readable error message from a Supabase Edge Function
 * invocation error. `FunctionsHttpError` carries the non-2xx response; read
 * its body so the UI can show the server's actual message.
 */
export const readEdgeFunctionError = async (
  error: unknown,
): Promise<string | null> => {
  try {
    const ctx = (error as { context?: Response } | null)?.context;
    if (ctx && typeof ctx.json === "function") {
      const body = (await ctx.json()) as { error?: string; message?: string };
      return body.error ?? body.message ?? null;
    }
  } catch {
    // ignore — fall through
  }
  return null;
};
