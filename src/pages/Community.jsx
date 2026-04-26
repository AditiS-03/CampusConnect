import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';

export default function Community() {
  const { profile } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('posts')
        .select(`*, author:users(name)`)
        .eq('org_name', profile?.organization || 'CampusConnect')
        .order('created_at', { ascending: false });
      setPosts(data || []);
      setLoading(false);
    }
    if (profile?.organization) load();
  }, [profile]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;
    setPosting(true);
    await supabase.from('posts').insert({
      org_name: profile.organization,
      content: newPost,
      author_id: profile.id
    });
    setNewPost('');
    // Reload
    const { data } = await supabase
      .from('posts')
      .select(`*, author:users(name)`)
      .eq('org_name', profile.organization)
      .order('created_at', { ascending: false });
    setPosts(data || []);
    setPosting(false);
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>🏠 {profile?.organization} Community</h1>
        <p>Updates and discussions from your organization</p>
      </div>

      <div className="grid-2" style={{ alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {profile?.role === 'admin' && (
            <div className="card">
              <h3 style={{ fontSize: 16, marginBottom: 12 }}>Create Update</h3>
              <form onSubmit={handlePost}>
                <textarea 
                  className="form-textarea" 
                  placeholder="Share something with your ambassadors..." 
                  value={newPost}
                  onChange={e => setNewPost(e.target.value)}
                  required
                />
                <button className="btn btn-primary" style={{ marginTop: 12 }} disabled={posting}>
                  {posting ? 'Posting...' : 'Post Update'}
                </button>
              </form>
            </div>
          )}

          {loading ? (
            <div className="spinner" />
          ) : posts.length === 0 ? (
            <div className="empty-state"><p>No posts yet. Wait for updates from {profile?.organization}!</p></div>
          ) : (
            posts.map(post => (
              <div key={post.id} className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: 'white', fontSize: 12 }}>
                    {post.author?.name?.[0] || 'O'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{post.author?.name || 'Organization Admin'}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{new Date(post.created_at).toLocaleString()}</div>
                  </div>
                </div>
                <p style={{ fontSize: 15, lineHeight: 1.5 }}>{post.content}</p>
              </div>
            ))
          )}
        </div>

        <div className="card" style={{ position: 'sticky', top: 20 }}>
          <h3 style={{ fontSize: 16, marginBottom: 12 }}>📢 About {profile?.organization}</h3>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Welcome to the official community hub for {profile?.organization} ambassadors. 
            Stay tuned for exclusive tasks, rewards, and program announcements.
          </p>
          <div style={{ marginTop: 20, paddingTop: 20, borderTop: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <span>Total Ambassadors</span>
              <span style={{ fontWeight: 600 }}>24</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
              <span>Program Status</span>
              <span style={{ color: 'var(--accent-green)', fontWeight: 600 }}>Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
