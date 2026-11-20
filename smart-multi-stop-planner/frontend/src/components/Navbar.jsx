import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const iconProps = { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' };

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: (<svg {...iconProps}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>) },
  { to: '/planner', label: 'Planner', icon: (<svg {...iconProps}><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z" /><path d="M9 4v14" /><path d="M15 6v14" /></svg>) },
  { to: '/discover-places', label: 'Discover', icon: (<svg {...iconProps}><circle cx="12" cy="12" r="9" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></svg>) },
  { to: '/near-me', label: 'Near Me', icon: (<svg {...iconProps}><circle cx="12" cy="12" r="3" /><path d="M12 2v3m0 14v3M2 12h3m14 0h3" /><circle cx="12" cy="12" r="8" /></svg>) },
  { to: '/saved-trips', label: 'Trips', icon: (<svg {...iconProps}><path d="M7 3h10v18l-5-4-5 4V3Z" /></svg>) },
  { to: '/wishlist', label: 'Wishlist', icon: (<svg {...iconProps}><path d="M12 21s-7-4.35-9-8.5C1.5 9 3.5 6 7 6c2 0 3.5 1 5 3 1.5-2 3-3 5-3 3.5 0 5.5 3 4 6.5-2 4.15-9 8.5-9 8.5Z"/></svg>) },
  { to: '/travel-history', label: 'History', icon: (<svg {...iconProps}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>) },
];

function Navbar() {
  const { user, logout } = useAuth() || {};
  const navigate = useNavigate();
  async function handleLogout() { await logout(); navigate('/login'); }
  return (
    <header className="navbar">
      <NavLink className="brand" to={user ? '/dashboard' : '/login'} aria-label="Yatra Mitra home">
        <span className="brand-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none"><path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" stroke="currentColor" strokeWidth="1.8" /><circle cx="12" cy="10" r="2.6" fill="currentColor" /></svg></span>
        <span className="brand-text">Yatra Mitra <small>Smart trips</small></span>
      </NavLink>
      {user && <nav className="nav-links" aria-label="Primary">{links.map((link) => (
        <NavLink key={link.to} to={link.to} title={link.label} className={({ isActive }) => (isActive ? 'active' : undefined)}>{link.icon}<span className="nav-label">{link.label}</span></NavLink>
      ))}</nav>}
      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        {user && <NavLink to="/profile" className="nav-label" style={{ fontSize: 12, textDecoration:'none' }}>{user.name}</NavLink>}
        {user ? <button type="button" className="nav-cta" onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</button> : <NavLink className="nav-cta" to="/login">Login</NavLink>}
      </div>
    </header>
  );
}
export default Navbar;
