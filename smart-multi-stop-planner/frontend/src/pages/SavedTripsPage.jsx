import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { tripsApi } from '../api/client';
import '../Pages.css';

const OPEN_KEY = 'yatra-mitra-open-trip';

export default function SavedTripsPage() {
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  async function load() {
    try {
      const data = await tripsApi.list();
      setTrips(Array.isArray(data.trips) ? data.trips : []);
    } catch (err) {
      setMessage(err.message || 'Could not load saved trips.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openTrip(tripId) {
    window.sessionStorage.setItem(OPEN_KEY, tripId);
    navigate('/planner');
  }

  async function deleteTrip(tripId) {
    try {
      await tripsApi.remove(tripId);
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
      setMessage('Saved trip removed.');
    } catch (err) {
      setMessage(err.message || 'Could not delete trip.');
    }
  }

  return (
    <main className="main-content">
      <div className="page-heading">
        <div>
          <p className="section-kicker">Your library</p>
          <h1>Saved trips</h1>
          <p>Open a saved plan to continue working on it in the planner.</p>
        </div>
        <span className="pill pill-blue">{trips.length} saved</span>
      </div>

      <section className="planner-card" aria-labelledby="saved-list-heading">
        <div className="card-heading">
          <div>
            <p className="section-kicker">Stored in database</p>
            <h2 id="saved-list-heading">Your plans</h2>
            <p>Trips are linked to your logged-in account.</p>
          </div>
          <Link className="nav-cta" to="/planner">Plan a new trip</Link>
        </div>

        {message && <p className="ai-status" role="status">{message}</p>}
        {loading ? <p className="empty-note">Loading trips...</p> : trips.length === 0 ? (
          <p className="empty-note">No saved trips yet. Plan a journey and choose "Save trip".</p>
        ) : (
          <div className="table-list">
            {trips.map((trip) => (
              <article className="alert-row" key={trip.id}>
                <div className="alert-body">
                  <strong>{trip.name || 'Untitled trip'}</strong>
                  <p>
                    {trip.selectedStartPlace?.name || trip.startLocation || 'Start'}
                    {' → '}
                    {trip.selectedFinalPlace?.name || trip.finalDestination || 'Finish'}
                  </p>
                  <span className="alert-meta">
                    {trip.stops?.length ?? 0} stop(s)
                    {trip.savedAt ? ` • saved ${new Date(trip.savedAt).toLocaleDateString()}` : ''}
                  </span>
                </div>
                <div className="form-actions">
                  <button type="button" className="small-primary-button" onClick={() => openTrip(trip.id)}>Open in planner</button>
                  <button type="button" className="remove-button" onClick={() => deleteTrip(trip.id)}>Delete</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
