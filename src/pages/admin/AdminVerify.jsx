import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';

export default function AdminVerify() {
  const { user }   = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState('pending');
  const [processing, setProc]   = useState(null);

  const load = async () => {
    // Fetch submissions joined with user info
    const { data } = await supabase
      .from('submissions')
      .select(`*, user:users!user_id(name, email, college, avatar_url, college_id_url, resume_url)`)
      .order('submitted_at', { ascending: false });
    setSubmissions(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleAction = async (sub, status) => {
    setProc(sub.id);
    // Update submission status
    await supabase.from('submissions').update({
      status,
      reviewed_at: new Date().toISOString(),
      reviewed_by: user.id,
    }).eq('id', sub.id);

    // If approved → award points + increment streak & tasks_completed
    if (status === 'approved') {
      const { data: u } = await supabase.from('users').select('points,tasks_completed,streak').eq('id', sub.user_id).single();
      if (u) {
        await supabase.from('users').update({
          points:          (u.points          || 0) + (sub.task_points || 0),
          tasks_completed: (u.tasks_completed || 0) + 1,
          streak:          (u.streak          || 0) + 1,
        }).eq('id', sub.user_id);
      }
    }

    setSubmissions(prev => prev.map(s => s.id === sub.id ? { ...s, status } : s));
    setProc(null);
  };

  const filtered = submissions.filter(s => filter === 'all' || s.status === filter);
  const counts = {
    all:      submissions.length,
    pending:  submissions.filter(s=>s.status==='pending').length,
    approved: submissions.filter(s=>s.status==='approved').length,
    rejected: submissions.filter(s=>s.status==='rejected').length,
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <h1>✅ Verify Submissions</h1>
        <p>Review ambassador proof submissions and award points</p>
      </div>

      <div className="grid-4" style={{ marginBottom:24 }}>
        {[
          { label:'Pending',  value:counts.pending,  color:'var(--accent-amber)' },
          { label:'Approved', value:counts.approved, color:'var(--accent-green)' },
          { label:'Rejected', value:counts.rejected, color:'var(--accent-red)' },
          { label:'Total',    value:counts.all,      color:'var(--accent-cyan)' },
        ].map(s => (
          <div key={s.label} className="card" style={{ textAlign:'center', cursor:'pointer' }} onClick={()=>setFilter(s.label.toLowerCase())}>
            <div style={{ fontSize:28, fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:13, color:'var(--text-muted)', marginTop:4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {['all','pending','approved','rejected'].map(f => (
          <button key={f} onClick={()=>setFilter(f)} className={`btn btn-sm ${filter===f?'btn-primary':'btn-secondary'}`}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300 }}><div className="spinner" style={{ width:40, height:40 }} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><div className="icon">📭</div><p>No {filter} submissions.</p></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {filtered.map(s => (
            <div key={s.id} className="card" style={{ borderLeft:`3px solid ${s.status==='approved'?'var(--accent-green)':s.status==='rejected'?'var(--accent-red)':'var(--accent-amber)'}` }}>
              <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:16, flexWrap:'wrap' }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:8, flexWrap:'wrap' }}>
                    {s.user?.avatar_url ? (
                      <img src={s.user.avatar_url} alt="Avatar" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <div style={{ width:32, height:32, borderRadius:'50%', background:'var(--gradient-hero)', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, color:'white', fontSize:13 }}>
                        {s.user?.name?.[0]||'?'}
                      </div>
                    )}
                    <div>
                      <span style={{ fontWeight:600 }}>{s.user?.name||'Unknown'}</span>
                      <span style={{ fontSize:12, color:'var(--text-muted)', marginLeft:8 }}>{s.user?.college}</span>
                    </div>
                    <span className={`badge ${s.status==='approved'?'badge-green':s.status==='rejected'?'badge-red':'badge-amber'}`}>{s.status}</span>
                  </div>
                  <div style={{ fontWeight:600, marginBottom:4 }}>📌 {s.task_title}</div>
                  <div style={{ fontSize:13, color:'var(--text-muted)', marginBottom:8 }}>
                    Submitted: {s.submitted_at ? new Date(s.submitted_at).toLocaleDateString() : '—'}
                  </div>

                  <div style={{ background:'var(--bg-elevated)', borderRadius:8, padding:16, marginBottom:12, border:'1px solid var(--border)' }}>
                    <div style={{ marginBottom:10 }}>
                      <strong style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:4 }}>WORK SUMMARY</strong>
                      <p style={{ fontSize:14 }}>{s.summary || 'No summary provided.'}</p>
                    </div>
                    
                    <div className="grid-2" style={{ gap:16 }}>
                      <div>
                        <strong style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:4 }}>PROOF CONTENT</strong>
                        {s.proof?.startsWith('http')
                          ? <a href={s.proof} target="_blank" rel="noreferrer" style={{ color:'var(--accent-cyan)', fontSize:14 }}>🔗 View Proof Link</a>
                          : <div style={{ fontSize:14 }}>{s.proof}</div>}
                      </div>
                      {s.image_url && (
                        <div>
                          <strong style={{ fontSize:12, color:'var(--text-muted)', display:'block', marginBottom:4 }}>SCREENSHOT</strong>
                          <a href={s.image_url} target="_blank" rel="noreferrer">
                            <img src={s.image_url} alt="Proof" style={{ width:'100%', maxHeight:100, borderRadius:4, objectFit:'cover', border:'1px solid var(--border)' }} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ display:'flex', gap:12, fontSize:12 }}>
                    <span style={{ color:'var(--text-muted)' }}>Student Docs:</span>
                    {s.user?.college_id_url && <a href={s.user.college_id_url} target="_blank" rel="noreferrer" style={{ color:'var(--accent-purple-light)' }}>🪪 College ID</a>}
                    {s.user?.resume_url && <a href={s.user.resume_url} target="_blank" rel="noreferrer" style={{ color:'var(--accent-purple-light)' }}>📄 Resume</a>}
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
                  <span className="point-pill">⭐ {s.task_points}</span>
                  {s.status === 'pending' && (
                    <>
                      <button className="btn btn-green btn-sm" disabled={!!processing} onClick={()=>handleAction(s,'approved')} style={{ color:'white' }}>
                        {processing===s.id ? <span className="spinner" /> : '✅ Approve'}
                      </button>
                      <button className="btn btn-danger btn-sm" disabled={!!processing} onClick={()=>handleAction(s,'rejected')}>
                        ❌ Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
