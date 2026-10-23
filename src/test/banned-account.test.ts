import { expect, it } from "vitest";

it("rejects re-registration of the owner-banned email", async () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Backend configuration is required for the ban regression check");
  const response = await fetch(`${url}/auth/v1/signup`, {
    method: "POST",
    headers: { apikey: key, "Content-Type": "application/json" },
    body: JSON.stringify({
      email: "divs_daks@yahoo.co.in",
      password: `Ban-check-${crypto.randomUUID()}`,
    }),
  });
  const result = await response.json();
  expect(response.ok).toBe(false);
  expect(result.access_token).toBeUndefined();
  expect(result.user).toBeUndefined();
  expect(result.msg ?? result.message).toMatch(/database error saving new user|not permitted to register/i);
}, 20000);