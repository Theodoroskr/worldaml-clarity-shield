import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react";
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
  isApproved: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, metadata?: { full_name?: string; company_name?: string }) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const authRequestId = useRef(0);

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
    return data as Profile | null;
  };

  const fetchIsAdmin = async (userId: string) => {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (error) {
      console.error("Error fetching role:", error);
      return false;
    }
    return !!data;
  };

  const refreshProfile = async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      const [profileData, adminStatus] = await Promise.all([
        fetchProfile(currentUser.id),
        fetchIsAdmin(currentUser.id),
      ]);
      setProfile(profileData?.user_id === currentUser.id ? profileData : null);
      setIsAdmin(adminStatus);
    }
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        const requestId = ++authRequestId.current;
        const currentUser = currentSession?.user ?? null;
        setSession(currentSession);
        setUser(currentUser);

        if (currentUser) {
          setProfile((currentProfile) => currentProfile?.user_id === currentUser.id ? currentProfile : null);
          setIsAdmin(false);
          setTimeout(async () => {
            const [profileData, adminStatus] = await Promise.all([
              fetchProfile(currentUser.id),
              fetchIsAdmin(currentUser.id),
            ]);
            if (authRequestId.current !== requestId) return;
            setProfile(profileData?.user_id === currentUser.id ? profileData : null);
            setIsAdmin(adminStatus);
          }, 0);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }

        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      const requestId = ++authRequestId.current;
      const currentUser = initialSession?.user ?? null;
      setSession(initialSession);
      setUser(currentUser);

      if (currentUser) {
        setProfile((currentProfile) => currentProfile?.user_id === currentUser.id ? currentProfile : null);
        Promise.all([
          fetchProfile(currentUser.id),
          fetchIsAdmin(currentUser.id),
        ]).then(([profileData, adminStatus]) => {
          if (authRequestId.current !== requestId) return;
          setProfile(profileData?.user_id === currentUser.id ? profileData : null);
          setIsAdmin(adminStatus);
          setIsLoading(false);
        });
      } else {
        setProfile(null);
        setIsAdmin(false);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
      options: {
        emailRedirectTo: window.location.origin,
        data: metadata,
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
  };

  const isApproved = profile?.status === "approved";

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
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
