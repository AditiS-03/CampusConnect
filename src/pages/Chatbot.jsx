import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabase';

export default function Chatbot() {
  const { profile, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  useEffect(() => {
    // Load dummy messages if none in DB
    setMessages([
      { 
        id: 1, 
        sender_id: 'other', 
        sender_name: 'Aditi Singh', 
        content: "Hi Admin! I just completed the LinkedIn task. Could you please review it?", 
        created_at: new Date(Date.now() - 3600000).toISOString() 
      },
      { 
        id: 2, 
        sender_id: user?.id, 
        sender_name: profile?.name, 
        content: "Hey Aditi! Sure, I'll check the verify tab right now. Keep it up!", 
        created_at: new Date(Date.now() - 1800000).toISOString() 
      },
      { 
        id: 3, 
        sender_id: 'other', 
        sender_name: 'Aditi Singh', 
        content: "Thanks! Looking forward to more missions.", 
        created_at: new Date(Date.now() - 600000).toISOString() 
      }
    ]);
  }, [user, profile]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender_id: user?.id,
      sender_name: profile?.name,
      content: input.trim(),
      created_at: new Date().toISOString()
    };

    setMessages([...messages, newMsg]);
    setInput('');
    
    // Simulating a response for student if admin sends
    if (profile?.role === 'admin') {
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: Date.now() + 1,
          sender_id: 'other',
          sender_name: 'Student',
          content: "Got it! Thanks for the quick response.",
          created_at: new Date().toISOString()
        }]);
      }, 1500);
    }
  };

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>💬 Messaging Platform</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
          {profile?.role === 'admin' ? 'Connect with your ambassadors' : 'Chat with your Program Manager'}
        </p>
      </header>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((msg) => (
            <div key={msg.id} style={{
              alignSelf: msg.sender_id === user?.id ? 'flex-end' : 'flex-start',
              maxWidth: '75%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.sender_id === user?.id ? 'flex-end' : 'flex-start'
            }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, padding: '0 4px' }}>
                {msg.sender_name} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <div style={{
                padding: '12px 16px',
                borderRadius: msg.sender_id === user?.id ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                fontSize: 14,
                background: msg.sender_id === user?.id ? 'var(--accent-purple)' : 'var(--bg-elevated)',
                color: 'white',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                border: msg.sender_id === user?.id ? 'none' : '1px solid var(--border)',
                lineHeight: 1.5
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>

        <form onSubmit={handleSend} style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderTop: '1px solid var(--border)', display: 'flex', gap: 12 }}>
          <input 
            className="form-input" 
            placeholder="Type your message..." 
            value={input} 
            onChange={e => setInput(e.target.value)}
            style={{ borderRadius: 24, paddingLeft: 20, background: 'var(--bg-primary)' }}
          />
          <button type="submit" className="btn btn-primary" style={{ borderRadius: '50%', width: 48, height: 48, padding: 0, display:'flex', alignItems:'center', justifyContent: 'center', minWidth: 48 }}>
            <span style={{ fontSize: 20 }}>✈️</span>
          </button>
        </form>
      </div>
    </div>
  );
}
