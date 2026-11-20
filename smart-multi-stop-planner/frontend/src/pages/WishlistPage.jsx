import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { wishlistApi } from '../api/client';
import '../Pages.css';

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [msg, setMsg] = useState('');
  const load = async () => {
    try {
      const data = await wishlistApi.list();
      setItems(data.items || []);
    } catch (err) {
      setMsg(err.message);
    }
  };
  useEffect(() => {
    let cancelled = false;
    wishlistApi
      .list()
      .then((data) => {
        if (!cancelled) setItems(data.items || []);
      })
      .catch((err) => {
        if (!cancelled) setMsg(err.message);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  async function add(event) {
    event.preventDefault();
    if (!name.trim()) return;
    try {
      await wishlistApi.add({ destinationName: name.trim(), location: location.trim() });
      setName('');
      setLocation('');
      setMsg('Saved to wishlist.');
      load();
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function remove(id) {
    try {
      await wishlistApi.remove(id);
      setItems((current) => current.filter((item) => item._id !== id));
    } catch (err) {
      setMsg(err.message);
    }
  }

  return (
    <main className="main-content">
      <div className="page-heading">
        <div>
          <p className="section-kicker">Saved destinations</p>
          <h1>Wishlist</h1>
          <p>Destinations you want to visit, saved to your account and ready to add to a trip.</p>
        </div>
        <Link className="endpoint-search" to="/discover-places">
          Discover more
        </Link>
      </div>

      <section className="planner-card">
        <h2>Add a destination manually</h2>
        <form onSubmit={add} className="ai-brief-form">
          <div className="form-group">
            <label>Destination name</label>
            <input value={name} onChange={(event) => setName(event.target.value)} required />
          </div>
          <div className="form-group">
            <label>Location (optional)</label>
            <input value={location} onChange={(event) => setLocation(event.target.value)} />
          </div>
          <button className="plan-button" type="submit">
            Save to wishlist
          </button>
        </form>
        {msg && <p className="ai-status">{msg}</p>}
      </section>

      <section className="planner-card">
        <div className="card-heading">
          <div>
            <p className="section-kicker">Your collection</p>
            <h2>Saved destinations</h2>
          </div>
          <span className="saved-trip-count">{items.length}</span>
        </div>
        {items.length === 0 ? (
          <p className="empty-note">
            No wishlist items yet. Open a destination from Discover and choose Save to wishlist.
          </p>
        ) : (
          <div className="wishlist-grid">
            {items.map((item) => {
              const slug = item.data?.slug;
              const href = slug ? `/discover-places/${encodeURIComponent(slug)}` : null;
              return (
                <article className="wishlist-card" key={item._id}>
                  {item.image && (
                    <div className="wishlist-media">
                      {href ? (
                        <Link to={href}>
                          <img
                            src={item.image}
                            alt={item.destinationName}
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.onerror = null;
                              event.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(
                                slug || item.destinationName
                              )}-fallback/600/400`;
                            }}
                          />
                        </Link>
                      ) : (
                        <img
                          src={item.image}
                          alt={item.destinationName}
                          loading="lazy"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(
                              item.destinationName
                            )}-fallback/600/400`;
                          }}
                        />
                      )}
                    </div>
                  )}
                  <div className="wishlist-body">
                    <h3>
                      {href ? <Link to={href}>{item.destinationName}</Link> : item.destinationName}
                    </h3>
                    {item.location && <p className="destination-meta">{item.location}</p>}
                    <div className="wishlist-meta">
                      {item.rating > 0 && <span className="score-pill">{Number(item.rating).toFixed(1)} / 5</span>}
                      {item.data?.budgetTier && <span className="pill pill-neutral">{item.data.budgetTier}</span>}
                    </div>
                    <div className="destination-actions">
                      {href && (
                        <Link className="small-primary-button" to={href}>
                          View details
                        </Link>
                      )}
                      <button type="button" className="remove-button" onClick={() => remove(item._id)}>
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
