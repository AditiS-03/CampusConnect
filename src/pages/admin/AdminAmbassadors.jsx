import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabase';
import { useAuth } from '../../context/AuthContext';

export default function AdminAmbassadors() {
  const { profile } = useAuth();
  const [ambassadors, setAmbassadors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    async function load() {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('organization', profile.organization)
        .eq('role', 'ambassador');
      
      if (data?.length) {
        setAmbassadors(data);
      } else {
        setAmbassadors([
          { id: 'u1', name: 'Aditi Singh', email: 'aditi@lpu.in', college: 'Lovely Professional University', tasks_completed: 12, avatar_url: '', college_id_url: '#', resume_url: '#' },
          { id: 'u2', name: 'Rahul Sharma', email: 'rahul@nsut.ac.in', college: 'NSUT Delhi', tasks_completed: 8, avatar_url: '', college_id_url: '#', resume_url: '#' },
          { id: 'u3', name: 'Priya Verma', email: 'priya@bits.ac.in', college: 'BITS Pilani', tasks_completed: 15, avatar_url: '', college_id_url: '#', resume_url: '#' }
        ]);
      }
      setLoading(false);
    }
    load();
  }, [profile]);

  if (loading) return <div className="loading-screen"><span className="spinner" /></div>;

  return (
    <div className="animate-fade-in">
      <header style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800 }}>Hey, <span className="gradient-text">{profile.name}</span> 👋</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 6, fontSize: 16 }}>
          Admin @ <span style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{profile.organization}</span>
        </p>
      </header>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 18 }}>Ambassador Directory</h2>
          <span className="badge badge-purple">{ambassadors.length} Active Ambassadors</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)' }}>
                <th style={{ padding: '16px 24px', fontSize: 13, color: 'var(--text-muted)' }}>Ambassador</th>
                <th style={{ padding: '16px 24px', fontSize: 13, color: 'var(--text-muted)' }}>College</th>
                <th style={{ padding: '16px 24px', fontSize: 13, color: 'var(--text-muted)' }}>Tasks Done</th>
                <th style={{ padding: '16px 24px', fontSize: 13, color: 'var(--text-muted)' }}>Documents</th>
              </tr>
            </thead>
            <tbody>
              {ambassadors.map((amb, idx) => (
                <tr key={amb.id} style={{ borderBottom: '1px solid var(--border)', transition: '0.2s' }} className="table-row-hover">
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <img src={amb.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${amb.name}`} style={{ width: 36, height: 36, borderRadius: '50%' }} alt="" />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{amb.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{amb.email}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px 24px', fontSize: 14 }}>{amb.college}</td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ fontSize: 14 }}>{amb.tasks_completed || 0} tasks completed</div>
                  </td>
                  <td style={{ padding: '16px 24px' }}>
                    <div style={{ display: 'flex', gap: 12 }}>
                      {amb.college_id_url && <a href={amb.college_id_url} target="_blank" rel="noreferrer" title="College ID" style={{ textDecoration: 'none' }}>🪪 ID</a>}
                      {amb.resume_url && <a href={amb.resume_url} target="_blank" rel="noreferrer" title="Resume" style={{ textDecoration: 'none' }}>📄 CV</a>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
