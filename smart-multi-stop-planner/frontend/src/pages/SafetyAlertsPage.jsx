import { useState } from 'react';
import '../Pages.css';

const initialAlerts = [
  {
    id: 1,
    type: 'restricted',
    title: 'Wildlife zone',
    message: 'This area has reported wildlife activity. Visit during daytime only.',
    location: 'Ranthambore border',
  },
  {
    id: 2,
    type: 'warning',
    title: 'Trail closure',
    message: 'This trail is temporarily closed due to landslide risk.',
    location: 'Manali pass route',
  },
];

const initialZones = [
  {
    id: 1,
    type: 'red',
    name: 'Restricted forest area',
    reason: 'Conservation zone — entry restricted without permission.',
  },
  {
    id: 2,
    type: 'yellow',
    name: 'River crossing area',
    reason: 'Dangerous during the monsoon season.',
  },
];

const initialClosures = [
  { id: 1, placeName: 'Red Fort', status: 'open', reason: '', reopening: null },
  { id: 2, placeName: "Humayun's Tomb", status: 'open', reason: '', reopening: null },
  { id: 3, placeName: 'Manali Pass Trail', status: 'closed', reason: 'Landslide risk', reopening: '2026-11-15' },
];

function alertTone(type) {
  if (type === 'restricted' || type === 'closed') return 'pill-red';
  if (type === 'warning' || type === 'limited') return 'pill-yellow';
  return 'pill-green';
}

function SafetyAlertsPage() {
  const [alerts] = useState(initialAlerts);
  const [zones] = useState(initialZones);
  const [closures, setClosures] = useState(initialClosures);

  const setClosureStatus = (id, status) => {
    setClosures((current) =>
      current.map((closure) => (closure.id === id ? { ...closure, status } : closure))
    );
  };

  return (
    <main className="main-content">
      <div className="page-heading">
        <div>
          <p className="section-kicker">Safety &amp; alerts</p>
          <h1>Know before you go</h1>
          <p>
            Check active alerts, restricted zones, and current place status. Always confirm
            with local authorities before travelling.
          </p>
        </div>
      </div>

      <section className="planner-card" aria-labelledby="alerts-heading">
        <div className="card-heading">
          <div>
            
            <p className="section-kicker">Live alerts</p>
            <h2 id="alerts-heading">Active alerts</h2>
            <p>Sample alerts for planning awareness. They are not a live feed.</p>
          </div>
          <span className="pill pill-yellow">{alerts.length} active</span>
        </div>

        <div className="table-list">
          {alerts.map((alert) => (
            <article className="alert-row" key={alert.id}>
              <span className={`pill ${alertTone(alert.type)}`}>{alert.type}</span>
              <div className="alert-body">
                <strong>{alert.title}</strong>
                <p>{alert.message}</p>
              </div>
              <span className="alert-meta">{alert.location}</span>
            </article>
          ))}
          {alerts.length === 0 && <p className="empty-note">No active alerts.</p>}
        </div>
      </section>

      <section className="planner-card" aria-labelledby="zones-heading">
        <div className="card-heading">
          <div>
            <p className="section-kicker">Zones</p>
            <h2 id="zones-heading">Safety zones</h2>
            <p>Red zones restrict access; yellow zones need extra care.</p>
          </div>
        </div>

        <div className="feature-grid">
          {zones.map((zone) => (
            <article className="feature-card" key={zone.id}>
              <span className={`pill ${zone.type === 'red' ? 'pill-red' : 'pill-yellow'}`}>
                {zone.type === 'red' ? 'Restricted' : 'Caution'}
              </span>
              <h3>{zone.name}</h3>
              <p>{zone.reason}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="planner-card" aria-labelledby="closures-heading">
        <div className="card-heading">
          <div>
            <p className="section-kicker">Place status</p>
            <h2 id="closures-heading">Openings &amp; closures</h2>
            <p>Update the status of places you plan to visit. Changes are kept for this session.</p>
          </div>
        </div>

        <div className="table-list">
          {closures.map((closure) => (
            <article className="alert-row" key={closure.id}>
              <span className={`pill ${alertTone(closure.status)}`}>{closure.status}</span>
              <div className="alert-body">
                <strong>{closure.placeName}</strong>
                <p>
                  {closure.status === 'open'
                    ? 'No reported closure. Verify opening hours before visiting.'
                    : `${closure.reason || 'Closure reported.'}${closure.reopening ? ` Expected reopening: ${closure.reopening}.` : ''}`}
                </p>
              </div>
              <div className="form-group">
                <label htmlFor={`status-${closure.id}`}>Status</label>
                <select
                  id={`status-${closure.id}`}
                  value={closure.status}
                  onChange={(event) => setClosureStatus(closure.id, event.target.value)}
                >
                  <option value="open">Open</option>
                  <option value="limited">Limited</option>
                  <option value="closed">Closed</option>
                </select>
              </div>
            </article>
          ))}
        </div>
        <p className="helper-text">
          Statuses are user-managed for this session and are not verified against official
          sources.
        </p>
      </section>
    </main>
  );
}

export default SafetyAlertsPage;
