import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';

export default function AdminVerify() {
  const { profile } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubmissions();
  }, [profile]);

  async function loadSubmissions() {
    if (!profile) return;
    const { data } = await supabase
      .from('submissions')
      .select('*, user:users!user_id(*)')
      .eq('status', 'pending')
      .eq('user:users.organization', profile.organization);

    if (data?.length) {
      setSubmissions(data);
    } else {
      setSubmissions([
        {
          id: 'd1',
          status: 'pending',
          proof_url: 'https://example.com',
          comment: 'Shared the event on my college WhatsApp groups!',
          created_at: new Date().toISOString(),
          user: { name: 'Aditi Singh', college: 'LPU', avatar_url: '' },
          task_title: 'WhatsApp Outreach',
          points_awarded: 50
        },
        {
          id: 'd2',
          status: 'pending',
          proof_url: 'https://example.com',
          comment: 'Post is live on Instagram. Link in bio.',
          created_at: new Date().toISOString(),
          user: { name: 'Rahul Kumar', college: 'NSUT', avatar_url: '' },
          task_title: 'Instagram Campaign',
          points_awarded: 100
        }
      ]);
    }
    setLoading(false);
  }

  const handleAction = async (sub, action) => {
    const status = action === 'approve' ? 'approved' : 'rejected';
    
    // 1. Update submission status
    const { error: subError } = await supabase
      .from('submissions')
      .update({ status })
      .eq('id', sub.id);

    if (subError) return alert('Failed to update submission');

    // 2. If approved, award points
    if (action === 'approve') {
      const { data: userData } = await supabase
        .from('users')
        .select('points, tasks_completed')
        .eq('id', sub.user_id)
        .single();

      await supabase
        .from('users')
        .update({ 
          points: (userData.points || 0) + (sub.points_awarded || 0),
          tasks_completed: (userData.tasks_completed || 0) + 1
        })
        .eq('id', sub.user_id);
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
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Hey, <span className="gradient-text">{profile?.name}</span> 👋</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: 16 }}>
          Admin @ <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{profile?.organization}</span>
        </p>
      </header>

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
