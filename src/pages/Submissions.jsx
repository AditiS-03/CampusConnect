import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';

const STATUS_CONFIG = {
  pending:  { label:'Pending',  cls:'badge-amber', icon:'⏳' },
  approved: { label:'Approved', cls:'badge-green', icon:'✅' },
  rejected: { label:'Rejected', cls:'badge-red',   icon:'❌' },
};

export default function Submissions() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [filter, setFilter]           = useState('all');

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending:false });
      setSubmissions(data || []);
      setLoading(false);
    }
    load();
  }, [user]);

  const filtered = filter === 'all' ? submissions : submissions.filter(s => s.status === filter);
  const counts = {
    all:      submissions.length,
    pending:  submissions.filter(s=>s.status==='pending').length,
    approved: submissions.filter(s=>s.status==='approved').length,
    rejected: submissions.filter(s=>s.status==='rejected').length,
  };
  const totalEarned = submissions.filter(s=>s.status==='approved').reduce((a,s)=>a+(s.task_points||0),0);

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>📋 My Submissions</h1>
        <p>Track your proof submissions and approval status</p>
      </div>

      <div className="grid-4" style={{ marginBottom:24 }}>
        {[
          { label:'Total Submitted', value:counts.all,      color:'var(--accent-purple)' },
          { label:'Pending Review',  value:counts.pending,   color:'var(--accent-amber)' },
          { label:'Approved',        value:counts.approved,  color:'var(--accent-green)' },
          { label:'Points Earned',   value:`⭐ ${totalEarned}`, color:'var(--accent-cyan)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign:'center' }}>
            <div style={{ fontSize:26, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {['all','pending','approved','rejected'].map(f => (
          <button key={f} onClick={()=>setFilter(f)} className={`btn btn-sm ${filter===f?'btn-primary':'btn-secondary'}`}>
            {f.charAt(0).toUpperCase()+f.slice(1)} ({counts[f]})
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300 }}><div className="spinner" style={{ width:40, height:40 }} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><div className="icon">📭</div><p>No submissions found.</p></div>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr><th>Task</th><th>Points</th><th>Proof</th><th>Submitted</th><th>Status</th></tr></thead>
            <tbody>
              {filtered.map(s => {
                const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.pending;
                const date = s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : '—';
                return (
                  <tr key={s.id}>
                    <td style={{ fontWeight:600 }}>{s.task_title || 'Task'}</td>
                    <td><span className="point-pill">⭐ {s.task_points||'—'}</span></td>
                    <td>
                      {s.proof?.startsWith('http')
                        ? <a href={s.proof} target="_blank" rel="noreferrer" style={{ color:'var(--accent-cyan)', fontSize:13 }}>🔗 View</a>
                        : <span style={{ fontSize:13, color:'var(--text-muted)', maxWidth:200, display:'inline-block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.proof}</span>}
                    </td>
                    <td style={{ color:'var(--text-muted)', fontSize:13 }}>{date}</td>
                    <td><span className={`badge ${cfg.cls}`}>{cfg.icon} {cfg.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
