import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';

const CATEGORIES  = ['Referral','Content','Event','Social'];
const DIFFICULTIES = ['Easy','Medium','Hard'];
const PROOF_TYPES  = ['link','text','image'];
const DIFF_CLS     = { Easy:'badge-green', Medium:'badge-amber', Hard:'badge-red' };

const EMPTY = { title:'', description:'', points:50, deadline:'', category:'Referral', difficulty:'Easy', proof_type:'link' };

export default function AdminTasks() {
  const { user }   = useAuth();
  const [tasks, setTasks]       = useState([]);
  const [form, setForm]         = useState(EMPTY);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('tasks').select('*').order('created_at', { ascending:false });
    setTasks(data || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    await supabase.from('tasks').insert({
      title:       form.title,
      description: form.description,
      points:      Number(form.points),
      deadline:    form.deadline || null,
      category:    form.category,
      difficulty:  form.difficulty,
      proof_type:  form.proof_type,
      created_by:  user.id,
    });
    setForm(EMPTY);
    setShowForm(false);
    await load();
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this task?')) return;
    await supabase.from('tasks').delete().eq('id', id);
    setTasks(t => t.filter(x => x.id !== id));
  };

  return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1>✏️ Manage Tasks</h1>
            <p>Create and manage ambassador missions</p>
          </div>
          <button className="btn btn-primary" onClick={()=>setShowForm(s=>!s)}>
            {showForm ? '✕ Cancel' : '＋ New Mission'}
          </button>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom:28, borderColor:'rgba(124,58,237,0.3)' }}>
          <h3 style={{ fontSize:16, marginBottom:20 }}>🎯 Create New Mission</h3>
          <form onSubmit={handleCreate}>
            <div className="grid-2" style={{ marginBottom:16 }}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input className="form-input" placeholder="Post on LinkedIn about us" value={form.title} onChange={set('title')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Points *</label>
                <input className="form-input" type="number" min="1" max="1000" value={form.points} onChange={set('points')} required />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom:16 }}>
              <label className="form-label">Description *</label>
              <textarea className="form-textarea" placeholder="Describe what the ambassador needs to do..." value={form.description} onChange={set('description')} required />
            </div>
            <div className="grid-4" style={{ marginBottom:20 }}>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-select" value={form.category} onChange={set('category')}>
                  {CATEGORIES.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Difficulty</label>
                <select className="form-select" value={form.difficulty} onChange={set('difficulty')}>
                  {DIFFICULTIES.map(d=><option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Proof Type</label>
                <select className="form-select" value={form.proof_type} onChange={set('proof_type')}>
                  {PROOF_TYPES.map(p=><option key={p}>{p}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Deadline</label>
                <input className="form-input" type="date" value={form.deadline} onChange={set('deadline')} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" /> : '🚀 Create Mission'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:300 }}><div className="spinner" style={{ width:40, height:40 }} /></div>
      ) : tasks.length === 0 ? (
        <div className="empty-state"><div className="icon">🎯</div><p>No tasks yet. Create your first mission!</p></div>
      ) : (
        <div className="table-container">
          <table>
            <thead><tr><th>Mission</th><th>Category</th><th>Difficulty</th><th>Points</th><th>Proof</th><th>Deadline</th><th>Actions</th></tr></thead>
            <tbody>
              {tasks.map(t => (
                <tr key={t.id}>
                  <td>
                    <div style={{ fontWeight:600 }}>{t.title}</div>
                    <div style={{ fontSize:12, color:'var(--text-muted)', marginTop:2 }}>{t.description?.slice(0,60)}...</div>
                  </td>
                  <td><span className="badge badge-cyan">{t.category}</span></td>
                  <td><span className={`badge ${DIFF_CLS[t.difficulty]||'badge-gray'}`}>{t.difficulty}</span></td>
                  <td><span className="point-pill">⭐ {t.points}</span></td>
                  <td><span className="badge badge-gray">{t.proof_type}</span></td>
                  <td style={{ color:'var(--text-muted)', fontSize:13 }}>{t.deadline ? new Date(t.deadline).toLocaleDateString() : '—'}</td>
                  <td><button className="btn btn-danger btn-sm" onClick={()=>handleDelete(t.id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
