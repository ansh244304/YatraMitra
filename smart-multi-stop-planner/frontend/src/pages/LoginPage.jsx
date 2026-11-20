import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';
import '../Pages.css';

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // login | register | forgot | reset
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault(); setError(''); setMessage(''); setLoading(true);
    try {
      if (mode === 'register') { await register(name, email, password); navigate('/dashboard'); }
      else if (mode === 'login') { await login(email, password); navigate('/dashboard'); }
      else if (mode === 'forgot') {
        const r = await authApi.forgotPassword(email);
        setMessage(r.resetToken ? `Reset token (dev): ${r.resetToken}` : r.message || 'If email exists, reset token generated.');
        setMode('reset');
      } else if (mode === 'reset') {
        await authApi.resetPassword(resetToken, password);
        setMessage('Password reset successful. Please login.');
        setMode('login'); setPassword('');
      }
    } catch (err) { setError(err.message || 'Request failed'); }
    finally { setLoading(false); }
  }

  return (
    <main className="main-content" style={{ maxWidth: 460, margin: '2rem auto' }}>
      <section className="planner-card">
        <div className="card-heading"><div>
          <p className="section-kicker">Yatra Mitra</p>
          <h1>{mode==='register'?'Create account':mode==='forgot'?'Forgot password':mode==='reset'?'Reset password':'Login'}</h1>
          <p>Secure access to your trips, wishlist, history, and dashboard.</p>
        </div></div>
        <form onSubmit={handleSubmit} className="ai-brief-form">
          {mode==='register' && <div className="form-group"><label>Name</label><input value={name} onChange={e=>setName(e.target.value)} required /></div>}
          {(mode==='login'||mode==='register'||mode==='forgot') && <div className="form-group"><label>Email</label><input type="email" value={email} onChange={e=>setEmail(e.target.value)} required /></div>}
          {(mode==='login'||mode==='register'||mode==='reset') && <div className="form-group"><label>{mode==='reset'?'New password':'Password'}</label><input type="password" value={password} onChange={e=>setPassword(e.target.value)} required minLength={6} /></div>}
          {mode==='reset' && <div className="form-group"><label>Reset token</label><input value={resetToken} onChange={e=>setResetToken(e.target.value)} required /></div>}
          {error && <p className="error-message" role="alert">{error}</p>}
          {message && <p className="ai-status" role="status" style={{wordBreak:'break-all'}}>{message}</p>}
          <button type="submit" className="plan-button" disabled={loading}>{loading?'Please wait...':mode==='register'?'Register':mode==='forgot'?'Get reset token':mode==='reset'?'Reset password':'Login'}</button>
        </form>
        <div style={{marginTop:'1rem',display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
          {(mode==='login'||mode==='register') && <button type="button" className="remove-button" onClick={()=>{setMode(mode==='login'?'register':'login');setError('');}}>{mode==='login'?'Create account':'Have an account? Login'}</button>}
          {mode==='login' && <button type="button" className="remove-button" onClick={()=>{setMode('forgot');setError('');}}>Forgot password</button>}
          {(mode==='forgot'||mode==='reset') && <button type="button" className="remove-button" onClick={()=>{setMode('login');setError('');}}>Back to login</button>}
        </div>
      </section>
    </main>
  );
}
