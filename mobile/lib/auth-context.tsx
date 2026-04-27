import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { supabase, type Session } from "./supabase";
import { initRevenueCat, logoutRevenueCat } from "./revenuecat";
import { identify, reset, track, Event } from "./analytics";

interface AuthState {
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  session: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
      if (data.session?.user.id) {
        identify(data.session.user.id);
        void initRevenueCat(data.session.user.id);
      }
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      setSession(next);
      if (event === "SIGNED_IN" && next?.user.id) {
        identify(next.user.id);
        void initRevenueCat(next.user.id);
        track(Event.Signup, { provider: next.user.app_metadata.provider });
      }
      if (event === "SIGNED_OUT") {
        reset();
        void logoutRevenueCat();
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      session,
      loading,
      signOut: async () => {
        await supabase.auth.signOut();
      },
    }),
    [session, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
