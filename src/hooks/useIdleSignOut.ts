// Signs the user out after a period without any interaction (Suite security rule).
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useIdleSignOut(minutes = 30) {
  useEffect(() => {
    let timer: number;
    const reset = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(async () => {
        await supabase.auth.signOut();
        window.location.assign("/login?reason=idle");
      }, minutes * 60_000);
    };
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [minutes]);
}
