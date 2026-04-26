import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid) => {
    const { data } = await supabase.from('users').select('*').eq('id', uid).single();
    if (data) setProfile(data);
    return data;
  };

  // Create profile row if it doesn't exist (handles OAuth users on first login)
  const ensureProfile = async (authUser, extraData = {}) => {
    const { data } = await supabase.from('users').select('id').eq('id', authUser.id).single();
    if (!data) {
      await supabase.from('users').insert({
        id: authUser.id,
        name: extraData.name || authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'Ambassador',
        email: authUser.email,
        college: extraData.college || '',
        organization: extraData.organization || '',
        course: extraData.course || '',
        current_year: extraData.current_year || '',
        graduation_year: extraData.graduation_year || '',
        points: 0,
        streak: 0,
        rank: 999,
        role: 'ambassador',
        badges: [],
        tasks_completed: 0,
      });
    }
    return fetchProfile(authUser.id);
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        await ensureProfile(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        await ensureProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const register = async (email, password, name, college, organization, course, current_year, graduation_year, avatar_url = '', college_id_url = '', resume_url = '') => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        name, email, college, organization, course, current_year, graduation_year,
        avatar_url, college_id_url, resume_url,
        points: 0, streak: 0, rank: 999,
        role: 'ambassador', badges: [], tasks_completed: 0,
      });
      await fetchProfile(data.user.id);
    }
  };

  const login = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  // Google OAuth — redirects to Google then back to /dashboard
  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    });
    if (error) throw error;
  };

  const logout = () => supabase.auth.signOut();

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  const uploadFile = async (file, folder = 'misc') => {
    if (!file) return null;
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('uploads')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('uploads')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, register, login, loginWithGoogle, logout, refreshProfile, uploadFile }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
