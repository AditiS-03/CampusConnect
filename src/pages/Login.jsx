import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true); setStatus('Signing in...');
    
    // Create a timeout promise
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Login timed out. Please check your connection.')), 15000)
    );

    try {
      await Promise.race([
        login(email, password),
        timeout
      ]);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message.includes('Invalid login') ? 'Invalid email or password' : err.message);
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
      <div style={{ position:'absolute', top:'-20%', left:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-20%', right:'-10%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(6,182,212,0.1) 0%, transparent 70%)', pointerEvents:'none' }} />

      <div style={{ width:'100%', maxWidth:420 }} className="animate-fade-in">
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ fontSize:48, marginBottom:12 }} className="animate-float">🎓</div>
          <h1 style={{ fontSize:28, fontWeight:800 }}><span className="gradient-text">CampusConnect</span></h1>
          <p style={{ marginTop:8, color:'var(--text-muted)' }}>Your campus ambassador command centre</p>
        </div>

        <div className="card">
          <h2 style={{ fontSize:20, marginBottom:4 }}>Welcome back 👋</h2>
          <p style={{ fontSize:14, marginBottom:24 }}>Sign in to your account</p>

          {error && (
            <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'var(--radius-md)', padding:'12px 16px', color:'#F87171', fontSize:14, marginBottom:16 }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="you@college.edu" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} required />
            </div>
             <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ width:'100%', justifyContent:'center', marginTop:4 }}>
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className="spinner" style={{ width: 16, height: 16 }} />
                  {status || 'Please wait...'}
                </div>
              ) : '🚀 Sign In'}
            </button>
          </form>

          <p style={{ textAlign:'center', marginTop:20, fontSize:14, color:'var(--text-muted)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color:'var(--accent-purple-light)', fontWeight:600, textDecoration:'none' }}>Sign up</Link>
          </p>
          <p style={{ textAlign:'center', marginTop:12, fontSize:13 }}>
            <Link to="/admin-register" style={{ color:'var(--text-muted)', textDecoration:'none' }}>🏢 Register as Organization Admin</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
