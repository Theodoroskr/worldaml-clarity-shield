import { createContext, useContext, useEffect, useRef, useState, useCallback, ReactNode, useMemo } from "react";
import { ACADEMY_PRICING, isPaidCourse } from "@/data/academyPricing";
import { AcademyCurrency, convertEurCents } from "@/lib/academyFx";
import { applyDiscount, computeDiscount } from "@/lib/academyDiscount";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const STORAGE_KEY = "academy-cart";

interface CartTotals {
  subtotal: number;       // cents in chosen currency, before discount
  discountPct: number;    // 0, 5, 10
  discountAmount: number; // cents discounted
  total: number;          // cents after discount
}

interface CartContextValue {
  items: string[];
  count: number;
  has: (slug: string) => boolean;
  add: (slug: string) => void;
  remove: (slug: string) => void;
  toggle: (slug: string) => void;
  clear: () => void;
  isOpen: boolean;
  open: () => void;
  close: () => void;
  computeTotals: (currency: AcademyCurrency) => CartTotals;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

const readStorage = (): string[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((s): s is string => typeof s === "string" && isPaidCourse(s));
  } catch {
    return [];
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<string[]>(() => readStorage());
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const lastSynced = useRef<string | null>(null);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota / privacy-mode errors
    }
  }, [items]);

  /**
   * Mirror the basket server-side so we can send the 3-day and 30-day
   * "you left courses in your basket" reminders. Best-effort only —
   * the local basket always remains the source of truth in the UI.
   */
  useEffect(() => {
    if (!user?.id) return;
    const signature = items.slice().sort().join("|");
    if (lastSynced.current === signature) return;
    const t = setTimeout(async () => {
      lastSynced.current = signature;
      try {
        await supabase.from("academy_basket_snapshots").upsert(
          {
            user_id: user.id,
            email: user.email ?? null,
            full_name:
              (user.user_metadata as any)?.full_name ??
              (user.user_metadata as any)?.name ??
              null,
            items,
            updated_at: new Date().toISOString(),
            // A changed basket restarts the reminder cycle.
            reminder_3d_sent_at: null,
            reminder_30d_sent_at: null,
          },
          { onConflict: "user_id" },
        );
      } catch {
        // non-fatal
      }
    }, 1200);
    return () => clearTimeout(t);
  }, [items, user?.id]);


  const has = useCallback((slug: string) => items.includes(slug), [items]);

  const add = useCallback((slug: string) => {
    if (!isPaidCourse(slug)) return;
    setItems((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
  }, []);

  const remove = useCallback((slug: string) => {
    setItems((prev) => prev.filter((s) => s !== slug));
  }, []);

  const toggle = useCallback((slug: string) => {
    if (!isPaidCourse(slug)) return;
    setItems((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const computeTotals = useCallback(
    (currency: AcademyCurrency): CartTotals => {
      const subtotalEur = items.reduce(
        (sum, slug) => sum + (ACADEMY_PRICING[slug]?.eurCents ?? 0),
        0
      );
      const subtotal = convertEurCents(subtotalEur, currency);
      const { pct } = computeDiscount(items.length);
      const total = applyDiscount(subtotal, pct);
      return {
        subtotal,
        discountPct: pct,
        discountAmount: subtotal - total,
        total,
      };
    },
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.length,
      has,
      add,
      remove,
      toggle,
      clear,
      isOpen,
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
      computeTotals,
    }),
    [items, has, add, remove, toggle, clear, isOpen, computeTotals]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within a CartProvider");
  return ctx;
}
