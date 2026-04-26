import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const COLLEGES = ['IIT Delhi','IIT Bombay','IIT Madras','NIT Trichy','BITS Pilani','Delhi University','Mumbai University','VIT Vellore','SRM Chennai','Other'];
const ORGANIZATIONS = ['Unstop', 'UnsaidTalks', 'Visteon', 'Google Developer Groups', 'Microsoft Learn Student Ambassadors', 'Postman', 'GeeksforGeeks', 'Other'];
const STUDY_YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year', 'Masters'];

export default function Register() {
  const { register, uploadFile } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ 
    name:'', email:'', college:'', organization: '', course: '', current_year: '', graduation_year: '', password:'', confirm:'' 
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [files, setFiles] = useState({ avatar: null, college_id: null, resume: null });

  const set = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));
  const handleFile = (key) => (e) => setFiles(f => ({ ...f, [key]: e.target.files[0] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setError(''); setLoading(true); 
    try {
      const profileData = { 
        name: form.name, 
        college: form.college, 
        organization: form.organization, 
        course: form.course, 
        current_year: form.current_year, 
        graduation_year: form.graduation_year 
      };
      
      await register(form.email, form.password, profileData, files, setStatus);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally { 
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <div style={{
      minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
      background:'var(--bg-primary)', padding:20, position:'relative', overflow:'hidden',
    }}>
      <div style={{ position:'absolute', top:'-20%', right:'-10%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.12) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-10%', left:'-10%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:600 }} className="animate-fade-in">
        <div style={{ textAlign:'center', marginBottom:28 }}>
          <div style={{ fontSize:40, marginBottom:10 }}>🚀</div>
          <h1 style={{ fontSize:26, fontWeight:800 }}><span className="gradient-text">Join CampusConnect</span></h1>
          <p style={{ marginTop:6, color:'var(--text-muted)', fontSize:14 }}>Start your ambassador journey</p>
        </div>

        <div className="card">
          {error && (
            <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'var(--radius-md)', padding:'12px 16px', color:'#F87171', fontSize:14, marginBottom:16 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div className="grid-2" style={{ gap:12 }}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" type="text" placeholder="Aditi Sharma" value={form.name} onChange={set('name')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" type="email" placeholder="you@college.edu" value={form.email} onChange={set('email')} required />
              </div>
            </div>

            <div className="grid-2" style={{ gap:12 }}>
              <div className="form-group">
                <label className="form-label">College</label>
                <select className="form-select" value={form.college} onChange={set('college')} required>
                  <option value="">Select your college</option>
                  {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Organization</label>
                <select className="form-select" value={form.organization} onChange={set('organization')} required>
                  <option value="">Select Organization</option>
                  {ORGANIZATIONS.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Course / Degree</label>
              <input className="form-input" type="text" placeholder="B.Tech Computer Science" value={form.course} onChange={set('course')} required />
            </div>

            <div className="grid-2" style={{ gap:12 }}>
              <div className="form-group">
                <label className="form-label">Current Year</label>
                <select className="form-select" value={form.current_year} onChange={set('current_year')} required>
                  <option value="">Select Year</option>
                  {STUDY_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Graduation Year</label>
                <input className="form-input" type="number" placeholder="2026" min="2024" max="2030" value={form.graduation_year} onChange={set('graduation_year')} required />
              </div>
            </div>

            <div className="grid-3" style={{ gap:12 }}>
              <div className="form-group">
                <label className="form-label">Profile Photo</label>
                <input className="form-input" type="file" accept="image/*" onChange={handleFile('avatar')} required />
              </div>
              <div className="form-group">
                <label className="form-label">College ID</label>
                <input className="form-input" type="file" accept="image/*" onChange={handleFile('college_id')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Resume (Opt)</label>
                <input className="form-input" type="file" accept=".pdf,.doc,.docx" onChange={handleFile('resume')} />
              </div>
            </div>

            <div className="grid-2" style={{ gap:12 }}>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input className="form-input" type="password" placeholder="••••••••" value={form.password} onChange={set('password')} required />
              </div>
              <div className="form-group">
                <label className="form-label">Confirm</label>
                <input className="form-input" type="password" placeholder="••••••••" value={form.confirm} onChange={set('confirm')} required />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width:'100%', justifyContent:'center', marginTop:4 }}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="spinner" style={{ width: 16, height: 16 }} />
                  {status}
                </div>
              ) : '🎓 Create Account'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:18, fontSize:14, color:'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color:'var(--accent-purple-light)', fontWeight:600, textDecoration:'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

