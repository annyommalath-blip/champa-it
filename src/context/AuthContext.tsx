import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User } from "@supabase/supabase-js";

type AppRole = "customer" | "pending_admin" | "approved_admin" | "super_admin";

interface AuthState {
  user: User | null;
  role: AppRole | null;
  profile: { full_name: string; avatar_url: string; email: string; phone?: string | null; address?: string | null } | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (email: string, password: string, fullName: string, phone: string, isAdminRequest: boolean, adminReason: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthState | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};

async function fetchRole(userId: string): Promise<AppRole | null> {
  const { data } = await supabase.rpc("get_user_role", { _user_id: userId });
  return (data as AppRole) || null;
}

async function fetchProfile(userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, email, phone, address")
    .eq("user_id", userId)
    .single();
  return data;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [profile, setProfile] = useState<AuthState["profile"]>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUserData = useCallback(async (u: User) => {
    const [r, p] = await Promise.all([fetchRole(u.id), fetchProfile(u.id)]);
    setRole(r);
    setProfile(p);
  }, []);

  useEffect(() => {
    // Set up listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        // Use setTimeout to avoid Supabase deadlock
        setTimeout(() => loadUserData(u), 0);
      } else {
        setRole(null);
        setProfile(null);
      }
      setIsLoading(false);
    });

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        loadUserData(u).then(() => setIsLoading(false));
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadUserData]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string, phone: string, isAdminRequest: boolean, adminReason: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: {
          full_name: fullName,
          phone,
          is_admin_request: isAdminRequest,
          admin_reason: adminReason,
        },
      },
    });
    return { error: error?.message ?? null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
    setProfile(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { error: error?.message ?? null };
  }, []);

  const updatePassword = useCallback(async (password: string) => {
    const { error } = await supabase.auth.updateUser({ password });
    return { error: error?.message ?? null };
  }, []);

  return (
    <AuthContext.Provider value={{ user, role, profile, isLoading, signIn, signUp, signOut, resetPassword, updatePassword }}>
      {children}
    </AuthContext.Provider>
  );
};
