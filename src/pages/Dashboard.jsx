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
  const { user, profile } = useAuth();
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

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1>Hey, {profile?.name || 'Ambassador'} 👋</h1>
            <p style={{ color: 'var(--accent-purple-light)', fontWeight: 600 }}>Campus Ambassador @ {profile?.organization || 'CampusConnect'}</p>
          </div>
          <Link to="/tasks" className="btn btn-primary">🎯 View Missions</Link>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 24, gap: 20 }}>
        {/* Profile Card */}
        <div className="card" style={{ display: 'flex', gap: 20, alignItems: 'center', background: 'linear-gradient(135deg, rgba(124,58,237,0.1), rgba(6,182,212,0.05))', border: '1px solid rgba(124,58,237,0.2)' }}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="Profile" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--accent-purple)' }} />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: 'white', flexShrink: 0 }}>
              {profile?.name?.[0]}
            </div>
          )}
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 18, marginBottom: 4 }}>{profile?.name}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', fontSize: 13 }}>
              <div><span style={{ color: 'var(--text-muted)' }}>College:</span> {profile?.college}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Organization:</span> {profile?.organization}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Course:</span> {profile?.course}</div>
              <div><span style={{ color: 'var(--text-muted)' }}>Graduating:</span> {profile?.graduation_year} ({profile?.current_year})</div>
              {profile?.college_id_url && <div><a href={profile.college_id_url} target="_blank" rel="noreferrer" style={{ color:'var(--accent-cyan)', textDecoration:'none' }}>🪪 View College ID</a></div>}
              {profile?.resume_url && <div><a href={profile.resume_url} target="_blank" rel="noreferrer" style={{ color:'var(--accent-cyan)', textDecoration:'none' }}>📄 View Resume</a></div>}
            </div>
          </div>
        </div>

        <div className="card">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <h3 style={{ fontSize:16 }}>🎯 Next Milestone</h3>
            <span style={{ fontSize:13, color:'var(--text-muted)' }}>{profile?.points||0} / {nextMilestone.target} pts</span>
          </div>
          <div className="progress-bar" style={{ marginBottom:10 }}>
            <div className="progress-fill" style={{ width:`${progress}%` }} />
          </div>
          <p style={{ fontSize:13 }}>
            {progress>=100 ? '🎉 Milestone reached!' : `${nextMilestone.target-(profile?.points||0)} points to unlock `}
            <strong style={{ color:'var(--accent-purple-light)' }}>{nextMilestone.label}</strong>
          </p>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom:24 }}>
        <StatCard icon="⭐" label="Total Points"  value={profile?.points||0}              gradient="var(--gradient-amber)" />
        <StatCard icon="🏆" label="Current Rank"  value={`#${profile?.rank||'—'}`}        gradient="var(--gradient-cyan)" />
        <StatCard icon="🔥" label="Streak"         value={`${profile?.streak||0}d`}        gradient="linear-gradient(135deg,#F59E0B,#EF4444)" />
        <StatCard icon="✅" label="Tasks Done"     value={profile?.tasks_completed||0}     gradient="var(--gradient-green)" />
      </div>

      <div className="grid-2" style={{ marginBottom:24, display: 'none' }}>
        {/* Hiding old milestone card as it's moved above */}
      </div>

      <div className="grid-2" style={{ marginBottom:24 }}>
        <div className="card" style={{ display: 'none' }}>
          {/* Hiding old badges card if needed, but keeping it for now if you want it visible */}
        </div>
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
