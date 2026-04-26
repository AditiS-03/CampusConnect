import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid) => {
    try {
      const { data, error } = await supabase.from('users').select('*').eq('id', uid).maybeSingle();
      if (error) throw error;
      if (data) setProfile(data);
      return data;
    } catch (err) {
      console.error('Profile fetch error:', err);
      setProfile(null);
      return null;
    }
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
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const register = async (email, password, profileData = {}, files = {}, onStatus = null) => {
    const status = (msg) => onStatus && onStatus(msg);
    
    try {
      status('Creating account...');
      const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
      if (authError) throw authError;
      if (!authData.user) throw new Error('Account creation failed.');
      
      const userId = authData.user.id;

      const upload = async (file, folder, label) => {
        if (!file) return '';
        status(`Uploading ${label}...`);
        const ext = file.name.split('.').pop();
        const path = `${folder}/${userId}.${ext}`;
        const { error } = await supabase.storage.from('uploads').upload(path, file, { upsert: true });
        if (error) return '';
        const { data } = supabase.storage.from('uploads').getPublicUrl(path);
        return data.publicUrl;
      };

      // Run uploads in parallel
      const [avatar_url, college_id_url, resume_url] = await Promise.all([
        files?.avatar ? upload(files.avatar, 'avatars', 'Photo') : Promise.resolve(''),
        files?.college_id ? upload(files.college_id, 'ids', 'ID') : Promise.resolve(''),
        files?.resume ? upload(files.resume, 'resumes', 'Resume') : Promise.resolve('')
      ]);

      status('Saving profile...');
      const { error: dbError } = await supabase.from('users').upsert({
        id: userId,
        email,
        name: profileData.name || 'Ambassador',
        college: profileData.college || 'N/A',
        organization: profileData.organization || 'CampusConnect',
        course: profileData.course || 'N/A',
        current_year: profileData.current_year || 0,
        graduation_year: profileData.graduation_year || 0,
        role: profileData.role || 'ambassador',
        avatar_url,
        college_id_url,
        resume_url,
        points: 0,
        streak: 0,
        rank: 999,
        badges: [],
        tasks_completed: 0,
      }, { onConflict: 'id' });
      
      if (dbError) throw dbError;
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
