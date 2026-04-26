import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';

export default function AdminAmbassadors() {
  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('users')
        .select('*')
        .order('points', { ascending: false });
      setUsers(
        (data || [])
          .filter(u => u.role !== 'admin')
          .map((u, i) => ({ ...u, rank: i + 1 }))
      );
      setLoading(false);
    }
    load();
  }, []);

  const filtered = users.filter(u =>
    !search ||
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.college?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>👥 Ambassadors</h1>
        <p>View and manage all registered campus ambassadors</p>
      </div>

      <div style={{ display:'flex', gap:12, marginBottom:20, alignItems:'center', flexWrap:'wrap' }}>
        <input className="form-input" style={{ maxWidth:300 }} placeholder="🔍 Search by name or college..." value={search} onChange={e=>setSearch(e.target.value)} />
        <span style={{ color:'var(--text-muted)', fontSize:14 }}>{filtered.length} ambassadors</span>
      </div>

      {loading ? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300 }}><div className="spinner" style={{ width:40, height:40 }} /></div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr><th>Rank</th><th>Ambassador</th><th>College</th><th>Org</th><th>Course</th><th>Points</th><th>Tasks</th><th>Streak</th></tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td style={{ fontWeight:700, color:u.rank<=3?'var(--accent-amber)':'var(--text-muted)' }}>#{u.rank}</td>
                  <td>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <div style={{ width:34, height:34, borderRadius:'50%', background:'var(--gradient-hero)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'white', fontSize:13, flexShrink:0 }}>{u.name?.[0]}</div>
                      <div>
                        <div style={{ fontWeight:600, fontSize:14 }}>{u.name}</div>
                        <div style={{ fontSize:12, color:'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ color:'var(--text-muted)', fontSize:13 }}>{u.college||'—'}</td>
                  <td><span className="badge badge-cyan" style={{ fontSize:11 }}>{u.organization||'—'}</span></td>
                  <td>
                    <div style={{ fontSize:12, fontWeight:500 }}>{u.course||'—'}</div>
                    <div style={{ fontSize:11, color:'var(--text-muted)' }}>{u.current_year} ({u.graduation_year})</div>
                  </td>
                  <td><span className="point-pill">⭐ {u.points||0}</span></td>
                  <td style={{ color:'var(--text-secondary)' }}>{u.tasks_completed||0}</td>
                  <td><span style={{ color:'var(--accent-amber)' }}>🔥 {u.streak||0}d</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length===0 && <div className="empty-state" style={{ padding:40 }}><div className="icon">👥</div><p>No ambassadors found.</p></div>}
        </div>
      )}
    </div>
  );
}
