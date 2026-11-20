import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../Pages.css';

export default function NearMePage() {
  const [coords, setCoords] = useState(null);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  function locate() {
    setError(''); setPlaces([]);
    if (!navigator.geolocation) { setError('Geolocation is not supported by your browser.'); return; }
    setLoading(true); setStatus('Requesting location permission...');
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const c = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      setCoords(c);
      setStatus('Location found. Searching nearby tourist places and live activity...');
      try {
        const radius = 5000;
        const q = `[out:json][timeout:25];(node(around:${radius},${c.lat},${c.lon})[tourism];node(around:${radius},${c.lat},${c.lon})[amenity~"theatre|cinema|marketplace|events_venue|arts_centre|community_centre"];node(around:${radius},${c.lat},${c.lon})[leisure~"park|garden|amusement_arcade"];);out body 30;`;
        const res = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`);
        if (!res.ok) throw new Error('Nearby search failed.');
        const data = await res.json();
        const items = (data.elements || []).map((el) => ({
          id: `${el.type}-${el.id}`,
          name: el.tags?.name || el.tags?.tourism || el.tags?.amenity || 'Place',
          type: el.tags?.tourism || el.tags?.amenity || el.tags?.leisure || 'point',
          lat: el.lat, lon: el.lon,
        })).filter(p => p.name && p.name !== 'Place');
        setPlaces(items);
        setStatus(items.length ? `Found ${items.length} places near you (live from OpenStreetMap).` : 'No named places found nearby. Try again later or move to a busier area.');
      } catch (e) {
        setError(e.message || 'Could not fetch nearby places.');
      } finally { setLoading(false); }
    }, (err) => {
      setLoading(false);
      setError(err.code === 1 ? 'Location permission denied. Allow location access to use Near Me.' : 'Could not get your location.');
    }, { enableHighAccuracy: true, timeout: 15000 });
  }

  return (
    <main className="main-content">
      <div className="page-heading">
        <div>
          <p className="section-kicker">Live nearby</p>
          <h1>Tourist places & activity near me</h1>
          <p>Allow location access to discover tourist places and live points of interest around you.</p>
        </div>
        <button type="button" className="nav-cta" onClick={locate} disabled={loading}>{loading ? 'Locating...' : 'Use my location'}</button>
      </div>

      <section className="planner-card">
        <div className="card-heading">
          <div>
            <p className="section-kicker">Your location</p>
            <h2>Nearby results</h2>
            {coords && <p>Lat {coords.lat.toFixed(4)}, Lon {coords.lon.toFixed(4)}</p>}
          </div>
        </div>
        {error && <p className="error-message" role="alert">{error}</p>}
        {status && <p className="ai-status" role="status">{status}</p>}

        {places.length > 0 && (
          <div className="table-list">
            {places.map((p) => (
              <article className="alert-row" key={p.id}>
                <div className="alert-body">
                  <strong>{p.name}</strong>
                  <p>Type: {p.type}</p>
                  <span className="alert-meta">{p.lat.toFixed(4)}, {p.lon.toFixed(4)}</span>
                </div>
                <div className="form-actions">
                  <a className="small-primary-button" href={`https://www.openstreetmap.org/?mlat=${p.lat}&mlon=${p.lon}#map=17/${p.lat}/${p.lon}`} target="_blank" rel="noreferrer">View on map</a>
                  <button type="button" className="nav-cta" onClick={() => { window.sessionStorage.setItem('prefill-destination', p.name); navigate('/planner'); }}>Plan trip</button>
                </div>
              </article>
            ))}
          </div>
        )}
        {!loading && !error && !coords && <p className="empty-note">Click "Use my location" and allow permission to see nearby tourist places and live activity.</p>}
      </section>
    </main>
  );
}
