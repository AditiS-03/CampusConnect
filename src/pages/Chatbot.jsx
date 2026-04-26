import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Chatbot() {
  const { profile } = useAuth();
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hey ${profile?.name}! I'm the CampusConnect AI. Ask me anything about your tasks, rewards, or how to grow as an ambassador.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const scrollToBottom = () => endRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);

    try {
      // Note: This is a placeholder for real Gemini API call. 
      // In a real app, you'd call a backend function or use the SDK with your key.
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `As your AI assistant for ${profile?.organization}, I recommend focusing on "Social" tasks this week to boost your visibility. Based on your current ${profile?.points} points, you're on track for the Rising Star badge!` 
        }]);
        setLoading(false);
      }, 1000);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting right now." }]);
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in" style={{ height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div className="page-header">
        <h1>💬 Query Chatbot</h1>
        <p>Powered by Gemini AI — Get instant answers and career advice</p>
      </div>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ 
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              background: m.role === 'user' ? 'var(--accent-purple)' : 'var(--bg-elevated)',
              color: 'white',
              padding: '12px 16px',
              borderRadius: m.role === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0',
              fontSize: 14,
              lineHeight: 1.5,
              border: m.role === 'user' ? 'none' : '1px solid var(--border)'
            }}>
              {m.content}
            </div>
          ))}
          {loading && (
            <div style={{ alignSelf: 'flex-start', background: 'var(--bg-elevated)', padding: '12px 16px', borderRadius: '16px 16px 16px 0', border: '1px solid var(--border)' }}>
              <span className="spinner" style={{ width: 16, height: 16 }} />
            </div>
          )}
          <div ref={endRef} />
        </div>

        <form onSubmit={handleSend} style={{ padding: 20, borderTop: '1px solid var(--border)', display: 'flex', gap: 12 }}>
          <input 
            className="form-input" 
            placeholder="Ask about tasks, rewards, or strategy..." 
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" disabled={loading}>Send</button>
        </form>
      </div>
    </div>
  );
}
