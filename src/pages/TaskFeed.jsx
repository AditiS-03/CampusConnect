import React, { useEffect, useState } from 'react';
import { supabase } from '../supabase';
import { useAuth } from '../context/AuthContext';

const CATEGORIES  = ['All','Referral','Content','Event','Social'];
const DIFFICULTIES = ['All','Easy','Medium','Hard'];
const DIFF_COLOR   = { Easy:'badge-green', Medium:'badge-amber', Hard:'badge-red' };
const CAT_ICON     = { Referral:'👥', Content:'✍️', Event:'📅', Social:'📣' };

function TaskCard({ task, onSubmit, alreadySubmitted }) {
  const { uploadFile } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [proof, setProof]       = useState('');
  const [summary, setSummary]   = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const deadlinePassed = task.deadline ? new Date() > new Date(task.deadline) : false;

  const handleSubmit = async () => {
    if (!proof.trim() || !summary.trim()) return;
    setSubmitting(true);
    try {
      const imageUrl = imageFile ? await uploadFile(imageFile, 'proofs') : '';
      await onSubmit(task, proof, summary, imageUrl);
      setProof(''); setSummary(''); setImageFile(null); setExpanded(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ borderLeft:`3px solid ${alreadySubmitted?'var(--accent-green)':'var(--accent-purple)'}` }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:12 }}>
        <div style={{ flex:1 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6, flexWrap:'wrap' }}>
            <span style={{ fontSize:18 }}>{CAT_ICON[task.category]||'📌'}</span>
            <span className={`badge ${DIFF_COLOR[task.difficulty]||'badge-gray'}`}>{task.difficulty}</span>
            <span className="badge badge-cyan">{task.category}</span>
            {alreadySubmitted && <span className="badge badge-green">✓ Submitted</span>}
            {deadlinePassed   && <span className="badge badge-red">Expired</span>}
          </div>
          <h3 style={{ fontSize:16, marginBottom:6 }}>{task.title}</h3>
          <p style={{ fontSize:13, marginBottom:8 }}>{task.description}</p>
          
          {task.resources && (
            <div style={{ fontSize:12, background:'var(--bg-elevated)', padding:'8px 12px', borderRadius:6, marginBottom:10, border:'1px dashed var(--border)' }}>
              <strong>📖 Resources:</strong> <a href={task.resources} target="_blank" rel="noreferrer" style={{ color:'var(--accent-cyan)' }}>{task.resources}</a>
            </div>
          )}

          <div style={{ display:'flex', gap:12, fontSize:13, color:'var(--text-muted)' }}>
            {task.deadline && <span>⏰ Deadline: {new Date(task.deadline).toLocaleDateString()}</span>}
            <span>📋 Proof: {task.proof_type}</span>
          </div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10 }}>
          <span className="point-pill" style={{ fontSize:16 }}>⭐ {task.points}</span>
          {!alreadySubmitted && !deadlinePassed && (
            <button className="btn btn-primary btn-sm" onClick={() => setExpanded(e=>!e)}>
              {expanded ? 'Cancel' : '📤 Submit'}
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div style={{ marginTop:16, paddingTop:16, borderTop:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:12 }}>
          <div className="form-group">
            <label className="form-label">Summary of work *</label>
            <textarea className="form-textarea" placeholder="How did you complete this task?" value={summary} onChange={e=>setSummary(e.target.value)} required />
          </div>
          <div className="grid-2" style={{ gap:12 }}>
            <div className="form-group">
              <label className="form-label">{task.proof_type==='link'?'🔗 Proof Link *':'📝 Proof Detail *'}</label>
              <input className="form-input" type={task.proof_type==='link'?'url':'text'} placeholder={task.proof_type==='link'?'https://...':'Details'} value={proof} onChange={e=>setProof(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">🖼️ Upload Screenshot (Optional)</label>
              <input className="form-input" type="file" accept="image/*" onChange={e=>setImageFile(e.target.files[0])} />
            </div>
          </div>
          <button className="btn btn-primary" disabled={submitting||!proof.trim()||!summary.trim()} onClick={handleSubmit} style={{ alignSelf:'flex-end' }}>
            {submitting ? <span className="spinner" /> : '🚀 Submit Proof'}
          </button>
        </div>
      )}
    </div>
  );
}

export default function TaskFeed() {
  const { user } = useAuth();
  const [tasks, setTasks]           = useState([]);
  const [submittedIds, setSubmitted] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [category, setCategory]     = useState('All');
  const [difficulty, setDiff]       = useState('All');
  const [search, setSearch]         = useState('');
  const [toast, setToast]           = useState('');

  useEffect(() => {
    async function load() {
      const [{ data: tasks }, { data: subs }] = await Promise.all([
        supabase.from('tasks').select('*').order('created_at', { ascending:false }),
        supabase.from('submissions').select('task_id').eq('user_id', user.id),
      ]);
      setTasks(tasks || []);
      setSubmitted((subs||[]).map(s => s.task_id));
      setLoading(false);
    }
    load();
  }, [user]);

  const handleSubmit = async (task, proof, summary, image_url) => {
    await supabase.from('submissions').insert({
      user_id: user.id,
      task_id: task.id,
      task_title: task.title,
      task_points: task.points,
      proof,
      summary,
      image_url,
      status: 'pending',
      submitted_at: new Date().toISOString(),
    });
    setSubmitted(s => [...s, task.id]);
    setToast(`✅ "${task.title}" submitted! Awaiting review.`);
    setTimeout(() => setToast(''), 4000);
  };

  const filtered = tasks.filter(t => {
    if (category !== 'All' && t.category !== category) return false;
    if (difficulty !== 'All' && t.difficulty !== difficulty) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="animate-fade-in">
      {toast && (
        <div style={{ position:'fixed', top:24, right:24, zIndex:100, background:'var(--accent-green)', color:'white', padding:'12px 20px', borderRadius:'var(--radius-md)', fontWeight:600, boxShadow:'0 4px 20px rgba(0,0,0,0.3)', animation:'fadeIn 0.3s ease' }}>
          {toast}
        </div>
      )}

      <div className="page-header">
        <h1>🎯 Mission Board</h1>
        <p>Choose your missions. Earn points. Rise through the ranks.</p>
      </div>

      <div style={{ display:'flex', gap:12, marginBottom:24, flexWrap:'wrap', alignItems:'center' }}>
        <input className="form-input" style={{ maxWidth:260 }} placeholder="🔍 Search missions..." value={search} onChange={e=>setSearch(e.target.value)} />
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {CATEGORIES.map(c => <button key={c} onClick={()=>setCategory(c)} className={`btn btn-sm ${category===c?'btn-primary':'btn-secondary'}`}>{c}</button>)}
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {DIFFICULTIES.map(d => <button key={d} onClick={()=>setDiff(d)} className={`btn btn-sm ${difficulty===d?'btn-cyan':'btn-secondary'}`}>{d}</button>)}
        </div>
      </div>

      {loading ? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300 }}><div className="spinner" style={{ width:40, height:40 }} /></div>
      ) : filtered.length === 0 ? (
        <div className="empty-state"><div className="icon">🎯</div><p>No missions found. Try adjusting filters.</p></div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {filtered.map(t => <TaskCard key={t.id} task={t} onSubmit={handleSubmit} alreadySubmitted={submittedIds.includes(t.id)} />)}
        </div>
      )}
    </div>
  );
}
