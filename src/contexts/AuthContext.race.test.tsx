import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { ReactNode } from "react";

/**
 * Regression tests guarding against the "wrong user's name appears in
 * dashboard / topbar" race condition.
 *
 * The bug: when sign-in events fired in quick succession, a stale profile
 * fetch from a previous user could resolve last and overwrite the new
 * user's profile in context, making the dashboard / topbar render the
 * wrong name.
 *
 * The fix (AuthContext): each auth event bumps an `authRequestId` ref;
 * resolved profile fetches are dropped if their id is stale, and any
 * profile whose `user_id` doesn't match the current `user.id` is also
 * rejected.
 *
 * The fix (consumers): components only render profile data when
 * `profile.user_id === user.id`.
 */

// ---- Deferred-promise helper ----
function defer<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((res) => { resolve = res; });
  return { promise, resolve };
}

// ---- Mock supabase client ----
type AuthCallback = (event: string, session: any) => void;
const authListeners: AuthCallback[] = [];

const profileDeferreds: Array<ReturnType<typeof defer<any>>> = [];
const roleDeferreds: Array<ReturnType<typeof defer<any>>> = [];

let getSessionResult: any = { data: { session: null } };
let getUserResult: any = { data: { user: null } };

vi.mock("@/integrations/supabase/client", () => {
  const fromBuilder = (table: string) => {
    const builder: any = {
      select: () => builder,
      eq: () => builder,
      maybeSingle: () => {
        if (table === "profiles") {
          const d = defer<any>();
          profileDeferreds.push(d);
          return d.promise;
        }
        if (table === "user_roles") {
          const d = defer<any>();
          roleDeferreds.push(d);
          return d.promise;
        }
        return Promise.resolve({ data: null, error: null });
      },
    };
    return builder;
  };

  return {
    supabase: {
      auth: {
        onAuthStateChange: (cb: AuthCallback) => {
          authListeners.push(cb);
          return { data: { subscription: { unsubscribe: () => {} } } };
        },
        getSession: () => Promise.resolve(getSessionResult),
        getUser: () => Promise.resolve(getUserResult),
        signOut: () => Promise.resolve(),
        signInWithPassword: () => Promise.resolve({ error: null }),
        signUp: () => Promise.resolve({ error: null }),
      },
      from: fromBuilder,
    },
  };
});

// Import AFTER mocks so the provider sees the mocked client.
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

function AuthProbe() {
  const { user, profile } = useAuth();
  const safeName =
    profile && user && profile.user_id === user.id ? profile.full_name : "";
  return (
    <div>
      <span data-testid="user-id">{user?.id ?? ""}</span>
      <span data-testid="profile-user-id">{profile?.user_id ?? ""}</span>
      <span data-testid="display-name">{safeName}</span>
    </div>
  );
}

function renderWithAuth(ui: ReactNode = <AuthProbe />) {
  return render(<AuthProvider>{ui}</AuthProvider>);
}

const sessionFor = (id: string, email = `${id}@example.com`) => ({
  user: { id, email },
  access_token: "t",
});

beforeEach(() => {
  authListeners.length = 0;
  profileDeferreds.length = 0;
  roleDeferreds.length = 0;
  getSessionResult = { data: { session: null } };
  getUserResult = { data: { user: null } };
});

describe("AuthContext race conditions", () => {
  it("ignores a stale profile fetch when a new sign-in arrives first", async () => {
    renderWithAuth();

    // Wait for provider to mount + getSession to resolve.
    await waitFor(() => expect(authListeners.length).toBeGreaterThan(0));
    const onAuth = authListeners[0];

    // Sign in user A → fires fetchProfile(A) (still pending).
    await act(async () => { onAuth("SIGNED_IN", sessionFor("user-A")); });
    await waitFor(() => expect(profileDeferreds.length).toBe(1));

    // Sign in user B before A's profile resolves → fires fetchProfile(B).
    await act(async () => { onAuth("SIGNED_IN", sessionFor("user-B")); });
    await waitFor(() => expect(profileDeferreds.length).toBe(2));

    // Resolve A LAST-style: A first, then B — but the bug shows when A
    // resolves AFTER B. Resolve B first, then A (stale) afterwards.
    await act(async () => {
      profileDeferreds[1].resolve({
        data: {
          id: "p-B", user_id: "user-B", email: "b@example.com",
          full_name: "User B", company_name: null, phone: null, status: "approved",
        },
        error: null,
      });
      roleDeferreds[1]?.resolve({ data: null, error: null });
    });
    await waitFor(() =>
      expect(screen.getByTestId("display-name").textContent).toBe("User B")
    );

    // Now the stale A fetch resolves — must NOT clobber user B.
    await act(async () => {
      profileDeferreds[0].resolve({
        data: {
          id: "p-A", user_id: "user-A", email: "a@example.com",
          full_name: "User A (stale)", company_name: null, phone: null, status: "approved",
        },
        error: null,
      });
      roleDeferreds[0]?.resolve({ data: null, error: null });
    });

    // Give microtasks a tick to flush.
    await act(async () => { await Promise.resolve(); });

    expect(screen.getByTestId("user-id").textContent).toBe("user-B");
    expect(screen.getByTestId("profile-user-id").textContent).toBe("user-B");
    expect(screen.getByTestId("display-name").textContent).toBe("User B");
  });

  it("never exposes a profile whose user_id differs from the current user", async () => {
    renderWithAuth();
    await waitFor(() => expect(authListeners.length).toBeGreaterThan(0));
    const onAuth = authListeners[0];

    await act(async () => { onAuth("SIGNED_IN", sessionFor("user-X")); });
    await waitFor(() => expect(profileDeferreds.length).toBe(1));

    // Backend returns a mismatched profile (e.g. cached row for another user).
    await act(async () => {
      profileDeferreds[0].resolve({
        data: {
          id: "p-Y", user_id: "user-Y", email: "y@example.com",
          full_name: "Wrong Person", company_name: null, phone: null, status: "approved",
        },
        error: null,
      });
      roleDeferreds[0]?.resolve({ data: null, error: null });
    });

    await act(async () => { await Promise.resolve(); });

    expect(screen.getByTestId("user-id").textContent).toBe("user-X");
    // Either profile is null OR its user_id matches — never a foreign profile.
    const profileUserId = screen.getByTestId("profile-user-id").textContent;
    expect(profileUserId === "" || profileUserId === "user-X").toBe(true);
    expect(screen.getByTestId("display-name").textContent).toBe("");
  });

  it("clears profile on sign-out so prior name cannot leak", async () => {
    renderWithAuth();
    await waitFor(() => expect(authListeners.length).toBeGreaterThan(0));
    const onAuth = authListeners[0];

    await act(async () => { onAuth("SIGNED_IN", sessionFor("user-A")); });
    await waitFor(() => expect(profileDeferreds.length).toBe(1));
    await act(async () => {
      profileDeferreds[0].resolve({
        data: {
          id: "p-A", user_id: "user-A", email: "a@example.com",
          full_name: "User A", company_name: null, phone: null, status: "approved",
        },
        error: null,
      });
      roleDeferreds[0]?.resolve({ data: null, error: null });
    });
    await waitFor(() =>
      expect(screen.getByTestId("display-name").textContent).toBe("User A")
    );

    await act(async () => { onAuth("SIGNED_OUT", null); });

    expect(screen.getByTestId("user-id").textContent).toBe("");
    expect(screen.getByTestId("profile-user-id").textContent).toBe("");
    expect(screen.getByTestId("display-name").textContent).toBe("");
  });
});
