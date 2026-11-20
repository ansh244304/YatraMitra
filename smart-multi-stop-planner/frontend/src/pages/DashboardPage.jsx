import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, Legend } from 'recharts';
import { dashboardApi, notificationsApi } from '../api/client';
import '../Pages.css';

const COLORS = ['#6366f1','#ec4899','#22c55e','#f59e0b','#06b6d4','#8b5cf6'];

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { dashboardApi.get().then(setData).catch(e=>setError(e.message)).finally(()=>setLoading(false)); }, []);

  const chartData = useMemo(() => {
    const counts = [
      { name: 'Trips', value: data?.stats?.totalTrips || 0 },
      { name: 'Wishlist', value: data?.stats?.totalWishlist || 0 },
      { name: 'History', value: data?.stats?.totalHistory || 0 },
      { name: 'Reviews', value: data?.stats?.totalReviews || 0 },
    ].filter(d=>d.value>0);
    return counts.length ? counts : [{ name: 'No data yet', value: 1 }];
  }, [data]);

  if (loading) return <main className="main-content"><p className="empty-note">Loading dashboard...</p></main>;
  if (error) return <main className="main-content"><p className="error-message">{error}</p></main>;

  const { stats={}, analytics={}, trips=[], wishlist=[], history=[], searches=[], notifications=[], user={} } = data || {};
  return (
    <main className="main-content">
      <div className="page-heading"><div>
        <p className="section-kicker">Your account</p>
        <h1>Welcome, {user.name || 'Traveler'}</h1>
        <p>Your personalized travel dashboard.</p>
      </div><span className="pill pill-blue">{user.role || 'user'}</span></div>

      <section className="planner-card">
        <h2>Overview</h2>
        <div className="summary-grid">
          <div className="summary-tile"><span>Saved trips</span><strong>{stats.totalTrips ?? 0}</strong></div>
          <div className="summary-tile"><span>Wishlist</span><strong>{stats.totalWishlist ?? 0}</strong></div>
          <div className="summary-tile"><span>Travel history</span><strong>{stats.totalHistory ?? 0}</strong></div>
          <div className="summary-tile"><span>Reviews</span><strong>{stats.totalReviews ?? 0}</strong></div>
          <div className="summary-tile"><span>Countries visited</span><strong>{analytics.countriesVisited ?? 0}</strong></div>
          <div className="summary-tile"><span>Total spent (history)</span><strong>₹{Math.round(analytics.totalSpent||0).toLocaleString('en-IN')}</strong><span className="helper-text">From recorded trip history</span></div>
        </div>
      </section>

      <section className="planner-card">
        <h2>Travel stats</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))',gap:16}}>
          <div style={{height:260}}>
            <h3 style={{marginTop:0}}>Activity breakdown</h3>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart><Pie data={chartData} dataKey="value" nameKey="name" outerRadius={80} label>{chartData.map((_,i)=><Cell key={i} fill={COLORS[i%COLORS.length]} />)}</Pie><Tooltip /><Legend /></PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{height:260}}>
            <h3 style={{marginTop:0}}>Monthly expenses (history)</h3>
            {(analytics.monthlyExpenses||[]).length ? (
              <ResponsiveContainer width="100%" height="85%">
                <BarChart data={analytics.monthlyExpenses}><XAxis dataKey="month" /><YAxis /><Tooltip /><Bar dataKey="amount" fill="#6366f1" /></BarChart>
              </ResponsiveContainer>
            ) : <p className="empty-note">Add travel history with expenses to see monthly spending.</p>}
          </div>
        </div>
        <p className="helper-text">Charts reflect your saved travel activity.</p>
      </section>

      <section className="planner-card"><div className="card-heading"><div><p className="section-kicker">Quick access</p><h2>Manage</h2></div></div>
        <div className="form-actions" style={{flexWrap:'wrap'}}>
          <Link className="nav-cta" to="/planner">Plan trip</Link>
          <Link className="nav-cta" to="/saved-trips">Saved trips</Link>
          <Link className="nav-cta" to="/wishlist">Wishlist</Link>
          <Link className="nav-cta" to="/travel-history">Travel history</Link>
          <Link className="nav-cta" to="/discover-places">Discover</Link>
          <Link className="nav-cta" to="/packing">Packing</Link>
          <Link className="nav-cta" to="/near-me">Near me</Link>
          <Link className="nav-cta" to="/profile">Profile</Link>
        </div>
      </section>

      <section className="planner-card"><h2>Recent saved trips</h2>
        {trips.length===0 ? <p className="empty-note">No saved trips yet. <Link to="/planner">Plan one</Link>.</p> :
          <div className="table-list">{trips.slice(0,5).map(t=><article className="alert-row" key={t.id}><div className="alert-body"><strong>{t.name}</strong><p>{t.selectedStartPlace?.name||t.startLocation||'Start'} → {t.selectedFinalPlace?.name||t.finalDestination||'Finish'}</p></div></article>)}</div>}
      </section>

      <section className="planner-card"><h2>Wishlist</h2>
        {wishlist.length===0 ? <p className="empty-note">No wishlist items. Save destinations from Discover.</p> :
          <div className="table-list">{wishlist.slice(0,5).map(w=><article className="alert-row" key={w._id}><div className="alert-body"><strong>{w.destinationName}</strong><p>{w.location}</p></div></article>)}</div>}
      </section>

      <section className="planner-card"><h2>Recent searches</h2>
        {searches.length===0 ? <p className="empty-note">No searches yet.</p> :
          <ul className="notes-list">{searches.slice(0,8).map(s=><li key={s._id}>{s.query}</li>)}</ul>}
      </section>

      <section className="planner-card"><h2>Notifications</h2>
        {notifications.length===0 ? <p className="empty-note">No unread notifications.</p> :
          <div className="table-list">{notifications.map(n=><article className="alert-row" key={n._id}><div className="alert-body"><strong>{n.title}</strong><p>{n.message}</p></div><button className="small-primary-button" onClick={async()=>{await notificationsApi.read(n._id); setData(d=>({...d, notifications:d.notifications.filter(x=>x._id!==n._id)}));}}>Mark read</button></article>)}</div>}
      </section>
    </main>
  );
}
