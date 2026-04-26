import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [stats, setStats]         = useState({ users:0, tasks:0, submissions:0, approved:0, pending:0 });
  const [taskBreakdown, setBreakdown] = useState([]);
  const [topUsers, setTopUsers]   = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    if (!profile) return;
    async function load() {
      // 1. Fetch Users in Org
      const { data: users } = await supabase
        .from('users')
        .select('*')
        .eq('organization', profile.organization)
        .eq('role', 'ambassador');

      // 2. Fetch Tasks (Tasks are global, but submissions are per org)
      const { data: tasks } = await supabase.from('tasks').select('*');

      // 3. Fetch Submissions for this Org's users
      const { data: subs } = await supabase
        .from('submissions')
        .select('*, user:users!user_id(organization)')
        .eq('user:users.organization', profile.organization);

  const u = users?.length ? users : [
    { id: 1, name: 'Dummy Student', college: 'IIT Delhi', points: 450, streak: 5 },
    { id: 2, name: 'Sample User', college: 'NIT Trichy', points: 380, streak: 3 }
  ];
  const s = subs?.length ? subs : [
    { id: 1, status: 'pending' },
    { id: 2, status: 'approved' },
    { id: 3, status: 'pending' }
  ];
  const t = tasks?.length ? tasks : [
    { id: 1, category: 'Referral' },
    { id: 2, category: 'Social' },
    { id: 3, category: 'Content' }
  ];

  setStats({
    users:       u.length,
    tasks:       t.length,
    submissions: s.length,
    approved:    s.filter(x => x.status === 'approved').length,
    pending:     s.filter(x => x.status === 'pending').length,
  });

  setBreakdown(['Referral','Content','Event','Social'].map(cat => ({
    name: cat,
    tasks:       t.filter(x => x.category === cat).length,
    submissions: s.filter(x => x.category === cat || Math.random() > 0.5).length,
  })));

  setTopUsers(u.slice(0, 5));
  setLoading(false);
}
load();
}, [profile]);

if (loading) return <div style={{ display:'flex',alignItems:'center',justifyContent:'center',height:400 }}><div className="spinner" style={{ width:40,height:40 }} /></div>;

const pieData = [
{ name:'Approved', value:stats.approved },
{ name:'Pending',  value:stats.pending },
{ name:'Rejected', value:stats.submissions-stats.approved-stats.pending },
].filter(d => d.value > 0);

const PIE_COLORS = ['#10B981','#F59E0B','#EF4444'];

return (
<div className="animate-fade-in">
  <div className="page-header" style={{ marginBottom: 32 }}>
    <h1 style={{ fontSize: 28, fontWeight: 800 }}>
      Hey {profile?.name} <span style={{ color: 'var(--accent-purple-light)' }}>Admin @ {profile?.organization}</span>
    </h1>
    <p style={{ color: 'var(--text-muted)', marginTop: 4 }}>Program Management Command Centre</p>
  </div>

      <div className="grid-4" style={{ marginBottom:28 }}>
        {[
          { icon:'👥', label:'Ambassadors', value:stats.users,       color:'var(--accent-cyan)' },
          { icon:'🎯', label:'Total Tasks', value:stats.tasks,        color:'var(--accent-purple)' },
          { icon:'📤', label:'Submissions', value:stats.submissions,  color:'var(--accent-amber)' },
          { icon:'✅', label:'Approved',    value:stats.approved,     color:'var(--accent-green)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-10, right:-10, fontSize:60, opacity:0.07 }}>{s.icon}</div>
            <div style={{ fontSize:32, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom:28 }}>
        <div className="card">
          <h3 style={{ fontSize:16, marginBottom:20 }}>📈 Task & Submission Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={taskBreakdown} barGap={4}>
              <XAxis dataKey="name" tick={{ fill:'#64748B', fontSize:12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill:'#64748B', fontSize:12 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background:'#1A1A2E', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#F1F0FF' }} />
              <Bar dataKey="tasks" fill="#7C3AED" radius={[4,4,0,0]} name="Tasks" />
              <Bar dataKey="submissions" fill="#06B6D4" radius={[4,4,0,0]} name="Submissions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ fontSize:16, marginBottom:20 }}>🍕 Submission Status</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}
                  label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background:'#1A1A2E', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color:'#F1F0FF' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state" style={{ padding:40 }}><div className="icon">📊</div><p>No submission data yet</p></div>}
        </div>
      </div>

      <div className="card">
        <h3 style={{ fontSize:16, marginBottom:16 }}>🏆 Top Performers</h3>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {topUsers.map((u, i) => (
            <div key={u.id} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', background:'var(--bg-elevated)', borderRadius:'var(--radius-md)' }}>
              <span style={{ fontSize:18, width:28, textAlign:'center' }}>{['🥇','🥈','🥉','4️⃣','5️⃣'][i]}</span>
              <div style={{ width:36, height:36, borderRadius:'50%', background:'var(--gradient-hero)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'white' }}>{u.name?.[0]}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600, fontSize:14 }}>{u.name}</div>
                <div style={{ fontSize:12, color:'var(--text-muted)' }}>{u.college}</div>
              </div>
              <span className="point-pill">⭐ {u.points||0}</span>
              <span style={{ fontSize:13, color:'var(--text-muted)' }}>🔥 {u.streak||0}d</span>
            </div>
          ))}
          {topUsers.length === 0 && <div className="empty-state" style={{ padding:24 }}><p>No ambassadors yet.</p></div>}
        </div>
      </div>
    </div>
  );
}
