import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface Profile {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  company_name: string | null;
  phone: string | null;
  status: "pending" | "approved" | "rejected";
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  /** True while a profile fetch for the current user is in-flight. */
  profileLoading: boolean;
  /** True when fetch completed but no profile row was found for the current user. */
  profileMissing: boolean;
  /** Last error from the profile fetch, if any. */
  profileError: Error | null;
  isApproved: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    metadata?: { full_name?: string; company_name?: string }
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// ---- Tunables ----
const PROFILE_FETCH_TIMEOUT_MS = 8000;
const PROFILE_FETCH_RETRIES = 1; // one retry on transient failure / timeout

function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    p.then(
      (v) => { clearTimeout(t); resolve(v); },
      (e) => { clearTimeout(t); reject(e); },
    );
  });
}

async function fetchProfileOnce(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as Profile | null) ?? null;
}

async function fetchProfileWithRetry(userId: string): Promise<Profile | null> {
  let lastErr: unknown = null;
  for (let attempt = 0; attempt <= PROFILE_FETCH_RETRIES; attempt++) {
    try {
      return await withTimeout(fetchProfileOnce(userId), PROFILE_FETCH_TIMEOUT_MS, "fetchProfile");
    } catch (err) {
      lastErr = err;
      // small backoff before retry
      if (attempt < PROFILE_FETCH_RETRIES) {
        await new Promise((r) => setTimeout(r, 250 * (attempt + 1)));
      }
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("fetchProfile failed");
}

async function fetchIsAdminSafe(userId: string): Promise<boolean> {
  try {
    const { data, error } = await withTimeout(
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle(),
      PROFILE_FETCH_TIMEOUT_MS,
      "fetchIsAdmin",
    );
    if (error) return false;
    return !!data;
  } catch {
    return false;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMissing, setProfileMissing] = useState(false);
  const [profileError, setProfileError] = useState<Error | null>(null);

  // Monotonic id used to invalidate stale async results.
  const authRequestId = useRef(0);
  // Tracks which user_id the most recent fetch was for, so we can
  // reject results that belong to a previous user even if the request id
  // somehow matches (defence in depth).
  const inFlightUserId = useRef<string | null>(null);

  /** Load profile + admin role for `userId`, gated by `requestId`. */
  const loadFor = useCallback(async (userId: string, requestId: number) => {
    setProfileLoading(true);
    setProfileError(null);
    setProfileMissing(false);
    inFlightUserId.current = userId;

    let profileData: Profile | null = null;
    let err: Error | null = null;
    try {
      profileData = await fetchProfileWithRetry(userId);
    } catch (e) {
      err = e instanceof Error ? e : new Error(String(e));
    }
    const adminStatus = await fetchIsAdminSafe(userId);

    // Drop stale results.
    if (authRequestId.current !== requestId) return;
    if (inFlightUserId.current !== userId) return;

    // Strict identity match — never accept a profile for a different user.
    const matched = profileData && profileData.user_id === userId ? profileData : null;
    setProfile(matched);
    setProfileMissing(!err && !matched);
    setProfileError(err);
    setIsAdmin(adminStatus);
    setProfileLoading(false);
  }, []);

  /** Synchronously clear all user-scoped state. */
  const clearUserState = useCallback(() => {
    setProfile(null);
    setIsAdmin(false);
    setProfileMissing(false);
    setProfileError(null);
    setProfileLoading(false);
    inFlightUserId.current = null;
  }, []);

  const refreshProfile = useCallback(async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (!currentUser) {
      clearUserState();
      return;
    }
    const requestId = ++authRequestId.current;
    await loadFor(currentUser.id, requestId);
  }, [clearUserState, loadFor]);

  useEffect(() => {
    const handleAuth = (currentSession: Session | null) => {
      const requestId = ++authRequestId.current;
      const currentUser = currentSession?.user ?? null;

      setSession(currentSession);
      setUser((prevUser) => {
        // If user identity changed, drop stale profile immediately.
        if (prevUser?.id !== currentUser?.id) {
          clearUserState();
        } else if (currentUser) {
          // Same user — keep existing profile only if it matches.
          setProfile((p) => (p?.user_id === currentUser.id ? p : null));
        }
        return currentUser;
      });

      if (currentUser) {
        // Defer to break out of the auth callback (Supabase guidance).
        setTimeout(() => { void loadFor(currentUser.id, requestId); }, 0);
      } else {
        clearUserState();
      }
      setIsLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, currentSession) => handleAuth(currentSession),
    );

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      handleAuth(initialSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [clearUserState, loadFor]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (
    email: string,
    password: string,
    metadata?: { full_name?: string; company_name?: string }
  ) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin, data: metadata },
    });
    return { error };
  };

  const signOut = async () => {
    // Invalidate any in-flight fetches first.
    ++authRequestId.current;
    inFlightUserId.current = null;
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    clearUserState();
  };

  const isApproved = profile?.status === "approved";

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        profileLoading,
        profileMissing,
        profileError,
        isApproved,
        isAdmin,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
