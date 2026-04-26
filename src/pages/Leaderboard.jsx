import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';

const MEDALS = ['🥇','🥈','🥉'];

export default function Leaderboard() {
  const { user } = useAuth();
  const [users, setUsers]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]       = useState('overall');

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('users')
        .select('*')
        .order('points', { ascending: false });
      setUsers((data || []).map((u, i) => ({ ...u, rank: i + 1 })));
      setLoading(false);
    }
    load();
  }, []);

  const myRank = users.findIndex(u => u.id === user?.id) + 1;

  const colleges = [...new Set(users.map(u => u.college).filter(Boolean))];
  const collegeRanks = colleges.map(college => ({
    college,
    total: users.filter(u => u.college === college).reduce((a, u) => a + (u.points || 0), 0),
    count: users.filter(u => u.college === college).length,
  })).sort((a, b) => b.total - a.total);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1>🏆 Leaderboard</h1>
            <p>See where you stand among all campus ambassadors</p>
          </div>
          {myRank > 0 && (
            <div className="card" style={{ padding:'12px 20px', textAlign:'center', borderColor:'rgba(124,58,237,0.4)' }}>
              <div style={{ fontSize:22, fontWeight:800, color:'var(--accent-purple-light)' }}>#{myRank}</div>
              <div style={{ fontSize:12, color:'var(--text-muted)' }}>Your Rank</div>
            </div>
          )}
        </div>
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:24 }}>
        <button onClick={()=>setTab('overall')} className={`btn btn-sm ${tab==='overall'?'btn-primary':'btn-secondary'}`}>🌍 Overall</button>
        <button onClick={()=>setTab('college')} className={`btn btn-sm ${tab==='college'?'btn-primary':'btn-secondary'}`}>🏫 By College</button>
      </div>

      {loading ? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300 }}><div className="spinner" style={{ width:40, height:40 }} /></div>
      ) : tab === 'overall' ? (
        <>
          {/* Podium top 3 */}
          {users.length >= 3 && (
            <div style={{ display:'flex', gap:16, marginBottom:28, justifyContent:'center', alignItems:'flex-end' }}>
              {[users[1], users[0], users[2]].filter(Boolean).map((u, i) => {
                const pos = i === 1 ? 0 : i === 0 ? 1 : 2;
                const heights = [140, 180, 110];
                const borderColor = pos===0?'#F59E0B':pos===1?'#94A3B8':'#B45309';
                return (
                  <div key={u.id} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
                    <div style={{ fontSize:28 }}>{MEDALS[pos]}</div>
                    <div style={{ width:60, height:60, borderRadius:'50%', background:'var(--gradient-hero)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, fontWeight:800, color:'white', border:`3px solid ${borderColor}`, boxShadow:`0 0 20px ${pos===0?'rgba(245,158,11,0.4)':'rgba(124,58,237,0.2)'}` }}>
                      {u.name?.[0]?.toUpperCase()}
                    </div>
                    <div style={{ fontSize:13, fontWeight:700 }}>{u.name?.split(' ')[0]}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)' }}>{u.college}</div>
                    <div className="point-pill">⭐ {u.points}</div>
                    <div style={{ width:80, height:heights[pos], background:pos===0?'var(--gradient-amber)':pos===1?'var(--gradient-purple)':'linear-gradient(135deg,#B45309,#D97706)', borderRadius:'var(--radius-md) var(--radius-md) 0 0', opacity:0.8 }} />
                  </div>
                );
              })}
            </div>
          )}

          <div className="table-container">
            <table>
              <thead><tr><th>Rank</th><th>Ambassador</th><th>College</th><th>Points</th><th>Tasks</th><th>Streak</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ background: u.id===user?.id ? 'rgba(124,58,237,0.08)' : undefined }}>
                    <td><span style={{ fontWeight:700, color:u.rank<=3?'var(--accent-amber)':'var(--text-muted)' }}>{u.rank<=3?MEDALS[u.rank-1]:`#${u.rank}`}</span></td>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--gradient-hero)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'white' }}>{u.name?.[0]}</div>
                        <div>
                          <div style={{ fontWeight:600, color:u.id===user?.id?'var(--accent-purple-light)':'var(--text-primary)' }}>{u.name} {u.id===user?.id&&'(You)'}</div>
                          <div style={{ fontSize:12, color:'var(--text-muted)' }}>{u.role}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ color:'var(--text-muted)', fontSize:13 }}>{u.college||'—'}</td>
                    <td><span className="point-pill">⭐ {u.points||0}</span></td>
                    <td style={{ color:'var(--text-secondary)' }}>{u.tasks_completed||0}</td>
                    <td><span style={{ color:'var(--accent-amber)' }}>🔥 {u.streak||0}d</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr><th>Rank</th><th>College</th><th>Ambassadors</th><th>Total Points</th></tr></thead>
            <tbody>
              {collegeRanks.map((c, i) => (
                <tr key={c.college}>
                  <td><span style={{ fontWeight:700, color:i<3?'var(--accent-amber)':'var(--text-muted)' }}>{i<3?MEDALS[i]:`#${i+1}`}</span></td>
                  <td style={{ fontWeight:600 }}>{c.college}</td>
                  <td style={{ color:'var(--text-muted)' }}>{c.count}</td>
                  <td><span className="point-pill">⭐ {c.total}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
