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

  const register = async (email, password, name, college, organization, course, current_year, graduation_year, files, onStatus) => {
    try {
      onStatus('Creating account...');
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;
      if (!authData.user) throw new Error('Account creation failed. Please try again.');
      
      const userId = authData.user.id;

      onStatus('Uploading files...');
      const upload = async (file, folder, label) => {
        if (!file) return '';
        onStatus(`Uploading ${label}...`);
        const ext = file.name.split('.').pop();
        const path = `${folder}/${userId}.${ext}`;
        
        const { error } = await supabase.storage.from('uploads').upload(path, file, { upsert: true });
        if (error) {
          console.error(`Upload error (${label}):`, error);
          // If storage fails, we might still want to continue with a default URL
          return '';
        }
        return supabase.storage.from('uploads').getPublicUrl(path).data.publicUrl;
      };

      const [avatar_url, college_id_url, resume_url] = await Promise.all([
        upload(files.avatar, 'avatars', 'Profile Photo'),
        upload(files.college_id, 'ids', 'College ID'),
        upload(files.resume, 'resumes', 'Resume')
      ]);

      onStatus('Finalizing profile...');
      const { error: dbError } = await supabase.from('users').insert({
        id: userId,
        name, email, college, organization, course, current_year, graduation_year,
        avatar_url, college_id_url, resume_url,
        points: 0, streak: 0, rank: 999,
        role: 'ambassador', badges: [], tasks_completed: 0,
      });
      
      if (dbError) {
        console.error('DB Insert Error:', dbError);
        throw new Error('Profile creation failed: ' + dbError.message);
      }

      await fetchProfile(userId);
    } catch (err) {
      console.error('Registration Error:', err);
      throw err;
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
