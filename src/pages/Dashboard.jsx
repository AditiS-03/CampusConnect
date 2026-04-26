import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const BADGES_CONFIG = [
  { id:'first_task',    icon:'🌟', label:'First Step',       check: (p,_) => (p?.tasks_completed||0) >= 1 },
  { id:'rising_star',  icon:'⭐', label:'Rising Star',      check: (p,_) => (p?.points||0) >= 100 },
  { id:'consistent',   icon:'🔥', label:'Consistency King', check: (p,_) => (p?.streak||0) >= 5 },
  { id:'campus_legend',icon:'👑', label:'Campus Legend',    check: (p,_) => (p?.points||0) >= 500 },
  { id:'top_performer',icon:'🏆', label:'Top Performer',    check: (p,_) => (p?.rank||999) <= 10 },
];

function StatCard({ icon, label, value, gradient }) {
  return (
    <div className="card" style={{ position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:-20, right:-20, fontSize:80, opacity:0.06 }}>{icon}</div>
      <div style={{ fontSize:13, color:'var(--text-muted)', fontWeight:500, marginBottom:8 }}>{label}</div>
      <div style={{ fontSize:32, fontWeight:800, background:gradient, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{value}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user, profile, logout } = useAuth();
  const [recentSubs, setRecentSubs]     = useState([]);
  const [availTasks, setAvailTasks]     = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    if (!user) return;
    async function load() {
      const [{ data: subs }, { data: tasks }] = await Promise.all([
        supabase.from('submissions').select('*').eq('user_id', user.id).order('submitted_at', { ascending:false }).limit(3),
        supabase.from('tasks').select('*').order('created_at', { ascending:false }).limit(4),
      ]);
      setRecentSubs(subs || []);
      setAvailTasks(tasks || []);
      setLoading(false);
    }
    load();
  }, [user]);

  const earnedBadges = BADGES_CONFIG.filter(b => b.check(profile));
  const lockedBadges = BADGES_CONFIG.filter(b => !b.check(profile)).slice(0, 3);

  const nextMilestone = (profile?.points || 0) < 100 ? { label:'Rising Star', target:100 }
    : (profile?.points || 0) < 500 ? { label:'Campus Legend', target:500 }
    : { label:'Max Tier', target: profile?.points || 1 };
  const progress = Math.min(((profile?.points||0) / nextMilestone.target) * 100, 100);

  if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:400 }}><div className="spinner" style={{ width:40,height:40 }} /></div>;

  if (!profile && !loading) return (
    <div className="animate-fade-in" style={{ textAlign: 'center', padding: '100px 20px' }}>
      <h2 style={{ fontSize: 24, marginBottom: 12 }}>Profile Not Found</h2>
      <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto 24px' }}>
        We found your login account, but your ambassador profile is missing. This happens if registration was interrupted.
      </p>
      <button className="btn btn-primary" onClick={() => logout()}>Logout & Try Again</button>
    </div>
  );

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 44, fontWeight: 800 }}>Hey, <span className="gradient-text">{profile.name}</span> 👋</h1>
        <p style={{ marginTop: 8, fontSize: 18, color: 'var(--text-muted)' }}>
          {profile.role === 'admin' ? 'Admin' : 'Campus Ambassador'} @ <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{profile.organization}</span>
        </p>
      </header>

      <div className="card" style={{ marginBottom: 40, padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <div style={{ 
            width: 120, height: 120, borderRadius: '50%', 
            background: 'var(--gradient-hero)', display: 'flex', 
            alignItems: 'center', justifyContent: 'center', 
            fontSize: 48, fontWeight: 800, color: 'white',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            {profile.name?.[0]}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>{profile.name}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {profile.role !== 'admin' && (
                <>
                  <div><span style={{ color: 'var(--text-muted)' }}>College:</span> {profile.college}</div>
                  <div><span style={{ color: 'var(--text-muted)' }}>Course:</span> {profile.course}</div>
                </>
              )}
              <div><span style={{ color: 'var(--text-muted)' }}>Organization:</span> {profile.organization}</div>
              {profile.role !== 'admin' && (
                <div><span style={{ color: 'var(--text-muted)' }}>Graduating:</span> {profile.graduation_year}</div>
              )}
              <div><span style={{ color: 'var(--text-muted)' }}>Role:</span> {profile.role === 'admin' ? 'Program Manager' : 'Campus Ambassador'}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid-3" style={{ marginBottom: 40 }}>
        <div className="card gradient-card" style={{ background: 'var(--gradient-hero)' }}>
          <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, opacity: 0.8, marginBottom: 8 }}>Missions Completed</div>
          <div style={{ fontSize: 48, fontWeight: 800 }}>{profile.tasks_completed || 0}</div>
          <div style={{ marginTop: 12, fontSize: 12, opacity: 0.9 }}>Way to go, Ambassador!</div>
        </div>
        
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>Organization</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent-purple-light)', marginBottom: 4 }}>{profile.organization}</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Official Campus Program</div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 8 }}>Current Status</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--accent-green)' }}>● Active</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Verified Member</div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom:24 }}>
        <div className="card">
          <h3 style={{ fontSize:16, marginBottom:12 }}>🏅 Badges Earned</h3>
          {earnedBadges.length === 0 ? (
            <p style={{ fontSize:13 }}>No badges yet — complete tasks to earn them!</p>
          ) : (
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {earnedBadges.map(b => (
                <div key={b.id} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:'var(--radius-full)', background:'rgba(124,58,237,0.15)', border:'1px solid rgba(124,58,237,0.3)', fontSize:13, fontWeight:600, color:'var(--accent-purple-light)' }}>
                  {b.icon} {b.label}
                </div>
              ))}
              {lockedBadges.map(b => (
                <div key={b.id} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 12px', borderRadius:'var(--radius-full)', background:'var(--bg-elevated)', border:'1px solid var(--border)', fontSize:13, fontWeight:600, color:'var(--text-muted)', filter:'grayscale(1)' }}>
                  🔒 {b.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h3 style={{ fontSize:16 }}>📋 Recent Submissions</h3>
            <Link to="/submissions" style={{ fontSize:13, color:'var(--accent-purple-light)', textDecoration:'none' }}>View all →</Link>
          </div>
          {recentSubs.length === 0 ? (
            <div className="empty-state" style={{ padding:24 }}><div className="icon">📭</div><p>No submissions yet. <Link to="/tasks" style={{ color:'var(--accent-purple-light)' }}>Start a task!</Link></p></div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {recentSubs.map(s => (
                <div key={s.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', background:'var(--bg-elevated)', borderRadius:'var(--radius-md)' }}>
                  <span style={{ fontSize:13, color:'var(--text-primary)' }}>{s.task_title||'Task'}</span>
                  <span className={`badge ${s.status==='approved'?'badge-green':s.status==='rejected'?'badge-red':'badge-amber'}`}>{s.status}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
            <h3 style={{ fontSize:16 }}>⚡ Quick Missions</h3>
            <Link to="/tasks" style={{ fontSize:13, color:'var(--accent-purple-light)', textDecoration:'none' }}>All missions →</Link>
          </div>
          {availTasks.length === 0 ? (
            <div className="empty-state" style={{ padding:24 }}><div className="icon">🎯</div><p>No tasks yet. Check back soon!</p></div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {availTasks.map(t => (
                <div key={t.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 12px', background:'var(--bg-elevated)', borderRadius:'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:'var(--text-primary)' }}>{t.title}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)' }}>{t.category}</div>
                  </div>
                  <span className="point-pill">⭐ {t.points}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
