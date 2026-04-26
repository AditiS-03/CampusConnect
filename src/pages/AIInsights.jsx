import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';

function getAISuggestions(profile, tasks, submissions) {
  const suggestions = [];
  const pts    = profile?.points || 0;
  const rank   = profile?.rank   || 999;
  const streak = profile?.streak || 0;
  const approved = submissions.filter(s => s.status === 'approved');

  const catDone = (cat) => approved.filter(s => tasks.find(t => t.id === s.task_id && t.category === cat)).length;

  if (streak === 0)
    suggestions.push({ icon:'🔥', type:'urgent',    title:'Start your streak!',             body:"You haven't completed a task today. Submit one to begin a streak — streak bonuses multiply your points!", cta:'Go to Missions' });
  else if (streak < 5)
    suggestions.push({ icon:'⚡', type:'streak',    title:`Maintain your ${streak}-day streak`, body:'You\'re on a roll! Complete 1 more task today to keep it alive.',                                   cta:'View Tasks' });

  if (catDone('Referral') < 2)
    suggestions.push({ icon:'👥', type:'referral',  title:'Focus on Referral Tasks',        body:`Referral tasks give the highest points. You've only done ${catDone('Referral')} so far.`,              cta:'Filter Referrals' });

  if (rank > 50)
    suggestions.push({ icon:'🏹', type:'rank',      title:'Climb the Leaderboard',          body:`You're at rank #${rank}. Complete 3+ easy tasks this week to enter the Top 50.`,                     cta:'Mission Board' });
  else if (rank > 10)
    suggestions.push({ icon:'🎯', type:'rank',      title:"You're close to Top 10!",        body:`Only ${rank-10} spots away from the elite Top 10. Push hard with medium/hard tasks.`,                cta:'Mission Board' });
  else
    suggestions.push({ icon:'👑', type:'rank',      title:"You're in the Top 10!",          body:'Incredible work. Stay consistent — others are right behind you.',                                       cta:'Leaderboard' });

  if (catDone('Content') < 1)
    suggestions.push({ icon:'✍️', type:'content',   title:'Try a Content Task',             body:'Content tasks are great for steady points and showcasing skills.',                                     cta:'Filter Content' });

  if (pts >= 450 && pts < 500)
    suggestions.push({ icon:'👑', type:'milestone', title:'Almost Campus Legend!',          body:`Just ${500-pts} more points to unlock the Campus Legend badge!`,                                      cta:'Mission Board' });
  else if (pts >= 90 && pts < 100)
    suggestions.push({ icon:'⭐', type:'milestone', title:'Rising Star is close!',          body:`${100-pts} more points to earn the Rising Star badge!`,                                               cta:'Mission Board' });

  return suggestions.slice(0, 4);
}

const TYPE_COLORS = {
  urgent:    { bg:'rgba(239,68,68,0.1)',  border:'rgba(239,68,68,0.3)',  color:'var(--accent-red)' },
  streak:    { bg:'rgba(245,158,11,0.1)', border:'rgba(245,158,11,0.3)', color:'var(--accent-amber)' },
  rank:      { bg:'rgba(124,58,237,0.1)', border:'rgba(124,58,237,0.3)', color:'var(--accent-purple-light)' },
  referral:  { bg:'rgba(6,182,212,0.1)',  border:'rgba(6,182,212,0.3)',  color:'var(--accent-cyan)' },
  content:   { bg:'rgba(16,185,129,0.1)', border:'rgba(16,185,129,0.3)', color:'var(--accent-green)' },
  milestone: { bg:'rgba(245,158,11,0.1)', border:'rgba(245,158,11,0.3)', color:'var(--accent-amber)' },
};

export default function AIInsights() {
  const { user, profile } = useAuth();
  const [tasks, setTasks]           = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    async function load() {
      const [{ data: t }, { data: s }] = await Promise.all([
        supabase.from('tasks').select('*'),
        supabase.from('submissions').select('*').eq('user_id', user.id),
      ]);
      setTasks(t || []);
      setSubmissions(s || []);
      setLoading(false);
    }
    load();
  }, [user]);

  const suggestions = getAISuggestions(profile, tasks, submissions);

  const weakCategory = ['Referral','Content','Event','Social'].find(cat =>
    submissions.filter(s => s.status==='approved' && tasks.find(t=>t.id===s.task_id&&t.category===cat)).length === 0
  );

  const catProgress = ['Referral','Content','Event'].map(cat => {
    const total = tasks.filter(t=>t.category===cat).length;
    const done  = submissions.filter(s=>s.status==='approved'&&tasks.find(t=>t.id===s.task_id&&t.category===cat)).length;
    const pct   = total>0?Math.round((done/total)*100):0;
    return { cat, total, done, pct };
  });

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ fontSize:36 }} className="animate-float">🤖</div>
          <div>
            <h1>AI Insights</h1>
            <p>Personalized recommendations to maximize your performance</p>
          </div>
        </div>
      </div>

      <div style={{ background:'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(6,182,212,0.1))', border:'1px solid rgba(124,58,237,0.2)', borderRadius:'var(--radius-xl)', padding:'24px 28px', marginBottom:28, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:-20, top:-20, fontSize:120, opacity:0.05 }}>🤖</div>
        <h2 style={{ fontSize:18, marginBottom:8 }}>Your Personal Strategy Engine</h2>
        <p style={{ fontSize:14 }}>
          Based on your <strong style={{ color:'var(--text-primary)' }}>{profile?.points||0} points</strong>,{' '}
          <strong style={{ color:'var(--text-primary)' }}>#{profile?.rank||'—'} rank</strong>, and{' '}
          <strong style={{ color:'var(--text-primary)' }}>{profile?.streak||0}-day streak</strong>, here's what the AI recommends:
        </p>
      </div>

      {loading ? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300 }}><div className="spinner" style={{ width:40, height:40 }} /></div>
      ) : (
        <>
          <h3 style={{ fontSize:16, marginBottom:16, color:'var(--text-secondary)' }}>💡 Actionable Recommendations</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:14, marginBottom:32 }}>
            {suggestions.map((s, i) => {
              const style = TYPE_COLORS[s.type] || TYPE_COLORS.rank;
              return (
                <div key={i} style={{ background:style.bg, border:`1px solid ${style.border}`, borderRadius:'var(--radius-lg)', padding:'20px 24px', display:'flex', gap:16, alignItems:'flex-start' }}>
                  <div style={{ fontSize:28, flexShrink:0 }}>{s.icon}</div>
                  <div style={{ flex:1 }}>
                    <h4 style={{ fontSize:15, color:style.color, marginBottom:6 }}>{s.title}</h4>
                    <p style={{ fontSize:14, marginBottom:12 }}>{s.body}</p>
                    <button className="btn btn-sm btn-secondary">{s.cta} →</button>
                  </div>
                  <div style={{ fontSize:12, color:'var(--text-muted)', flexShrink:0, padding:'4px 8px', background:'rgba(0,0,0,0.2)', borderRadius:'var(--radius-sm)' }}>AI</div>
                </div>
              );
            })}
          </div>

          <h3 style={{ fontSize:16, marginBottom:16, color:'var(--text-secondary)' }}>📊 Performance Snapshot</h3>
          <div className="grid-3" style={{ marginBottom:28 }}>
            {catProgress.map(({ cat, total, done, pct }) => (
              <div key={cat} className="card">
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                  <span style={{ fontWeight:600 }}>{cat}</span>
                  <span style={{ fontSize:13, color:'var(--text-muted)' }}>{done}/{total}</span>
                </div>
                <div className="progress-bar" style={{ marginBottom:8 }}>
                  <div className="progress-fill" style={{ width:`${pct}%`, background:pct===0?'var(--bg-elevated)':pct<50?'var(--gradient-amber)':'var(--gradient-green)' }} />
                </div>
                <div style={{ fontSize:12, color:pct===0?'var(--accent-red)':pct<50?'var(--accent-amber)':'var(--accent-green)' }}>
                  {pct===0?'⚠️ Not started':pct<50?'📈 In progress':'✅ On track'}
                </div>
              </div>
            ))}
          </div>

          {weakCategory && (
            <div style={{ background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:'var(--radius-lg)', padding:'16px 20px' }}>
              <strong style={{ color:'var(--accent-red)' }}>⚠️ Weak Area Detected: {weakCategory}</strong>
              <p style={{ fontSize:14, marginTop:6 }}>You have zero approved submissions in <strong>{weakCategory}</strong>. Diversifying task types improves your overall score and badge eligibility.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
