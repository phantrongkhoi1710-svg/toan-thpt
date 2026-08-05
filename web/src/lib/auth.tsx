import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { joinClassroom } from "./classrooms";
import { supabase, supabaseConfigured } from "./supabase";

export interface Profile {
  id: string;
  email: string | null;
  display_name: string;
  role: "student" | "teacher";
}

interface AuthContextValue {
  configured: boolean;
  loading: boolean;
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  signIn: (
    email: string,
    password: string,
    options?: { classroomId?: string; className?: string; studentNo?: string },
  ) => Promise<string | null>;
  signUp: (email: string, password: string, displayName: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(supabaseConfigured);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  const loadProfile = async (userId: string) => {
    if (!supabase) return;
    const { data } = await supabase.from("profiles").select("id,email,display_name,role").eq("id", userId).maybeSingle();
    if (data) setProfile(data as Profile);
  };

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let alive = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!alive) return;
      setSession(data.session ?? null);
      if (data.session?.user) void loadProfile(data.session.user.id);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next);
      if (next?.user) void loadProfile(next.user.id);
      else setProfile(null);
    });
    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      configured: supabaseConfigured,
      loading,
      session,
      user: session?.user ?? null,
      profile,
      async signIn(email, password, options) {
        if (!supabase) return "Chưa cấu hình Supabase.";
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) return error.message;
        if (options?.classroomId) {
          await joinClassroom(options.classroomId, options.className, options.studentNo);
          const { data } = await supabase.auth.getUser();
          if (data.user) await loadProfile(data.user.id);
        }
        return null;
      },
      async signUp(email, password, displayName) {
        if (!supabase) return "Chưa cấu hình Supabase.";
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { display_name: displayName } },
        });
        return error?.message ?? null;
      },
      async signOut() {
        if (!supabase) return;
        await supabase.auth.signOut();
        setProfile(null);
      },
      async refreshProfile() {
        if (session?.user) await loadProfile(session.user.id);
      },
    }),
    [loading, session, profile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth phải nằm trong AuthProvider");
  return ctx;
}
