import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';
import '../Pages.css';

export default function ProfilePage() {
  const { user, setUser, logout } = useAuth();
  const [name, setName] = useState(user?.name||'');
  const [msg,setMsg]=useState(''); const [err,setErr]=useState('');
  const [currentPassword,setCurrentPassword]=useState(''); const [newPassword,setNewPassword]=useState('');
  async function saveProfile(e){ e.preventDefault(); setErr(''); setMsg(''); try{ const d=await authApi.profile({ name }); setUser(d.user); setMsg('Profile updated.'); }catch(e){ setErr(e.message);} }
  async function changePw(e){ e.preventDefault(); setErr(''); setMsg(''); try{ await authApi.changePassword({ currentPassword, newPassword }); setMsg('Password changed. Please login again.'); await logout(); }catch(e){ setErr(e.message);} }
  return (<main className="main-content"><div className="page-heading"><div><p className="section-kicker">Account</p><h1>Profile</h1><p>Manage your profile and password.</p></div></div>
    <section className="planner-card"><h2>Profile information</h2>
      <form onSubmit={saveProfile} className="ai-brief-form"><div className="form-group"><label>Name</label><input value={name} onChange={e=>setName(e.target.value)} /></div>
      <div className="form-group"><label>Email</label><input value={user?.email||''} disabled /></div>
      <div className="form-group"><label>Role</label><input value={user?.role||'user'} disabled /></div>
      <button className="plan-button" type="submit">Save profile</button></form>
    </section>
    <section className="planner-card"><h2>Change password</h2>
      <form onSubmit={changePw} className="ai-brief-form"><div className="form-group"><label>Current password</label><input type="password" value={currentPassword} onChange={e=>setCurrentPassword(e.target.value)} required /></div>
      <div className="form-group"><label>New password</label><input type="password" minLength={6} value={newPassword} onChange={e=>setNewPassword(e.target.value)} required /></div>
      <button className="plan-button" type="submit">Change password</button></form>
    </section>
    {err && <p className="error-message">{err}</p>} {msg && <p className="ai-status">{msg}</p>}
  </main>);
}
