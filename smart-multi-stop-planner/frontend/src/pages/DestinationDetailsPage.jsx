import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { destinationsApi, bookingsApi, recentlyViewedApi, reviewsApi, wishlistApi } from '../api/client';
import { formatRs } from '../utils/format.js';
import '../Pages.css';

function HotelResults({ hotels, onBook }) {
  if (!hotels.length) return <p className="empty-note">No named hotels were found in the searched area. Try a nearby attraction or another location.</p>;

  return (
    <div className="hotel-results-grid">
      {hotels.map((hotel) => (
        <article className="hotel-result-card" key={hotel.id}>
          <div className="hotel-result-heading">
            <div>
              <h3>{hotel.name}</h3>
              <p>{hotel.type}{hotel.address ? ` · ${hotel.address}` : ''}</p>
            </div>
            <span className="destination-rating">★ {Number(hotel.rating).toFixed(1)}</span>
          </div>
          <div className="hotel-result-meta">
            <span>{hotel.priceLabel}</span>
            <span>{hotel.distanceKm} km away</span>
          </div>
          {hotel.amenities?.length > 0 && (
            <p className="hotel-amenities">{hotel.amenities.join(' · ')}</p>
          )}
          <div className="hotel-result-actions">
            <a href={hotel.mapUrl} target="_blank" rel="noreferrer">View map</a>
            <button type="button" className="small-primary-button" onClick={() => onBook(hotel)}>
              Book this hotel
            </button>
          </div>
        </article>
      ))}
    </div>
  );
}

function BookingForm({ hotel, form, onChange, onSubmit, saving, error }) {
  return (
    <form className="hotel-booking-form" onSubmit={onSubmit}>
      <h3>Save your stay at {hotel.name}</h3>
      <p className="helper-text">
        Estimated price: {hotel.priceLabel}. Saving this stay records it in your trip; it does not confirm availability with the hotel.
      </p>
      {error && <p className="error-message" role="alert">{error}</p>}
      <div className="filter-grid">
        <div className="form-group">
          <label htmlFor="hotel-check-in">Check-in</label>
          <input id="hotel-check-in" type="date" required value={form.checkIn} onChange={(event) => onChange('checkIn', event.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="hotel-check-out">Check-out</label>
          <input id="hotel-check-out" type="date" required min={form.checkIn} value={form.checkOut} onChange={(event) => onChange('checkOut', event.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="hotel-guests">Guests</label>
          <input id="hotel-guests" type="number" min="1" value={form.guests} onChange={(event) => onChange('guests', event.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="hotel-rooms">Rooms</label>
          <input id="hotel-rooms" type="number" min="1" value={form.rooms} onChange={(event) => onChange('rooms', event.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="hotel-contact-name">Name</label>
          <input id="hotel-contact-name" value={form.contactName} onChange={(event) => onChange('contactName', event.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="hotel-contact-email">Email</label>
          <input id="hotel-contact-email" type="email" value={form.contactEmail} onChange={(event) => onChange('contactEmail', event.target.value)} />
        </div>
      </div>
      <div className="form-actions">
        <button className="small-primary-button" type="submit" disabled={saving}>
          {saving ? 'Saving stay...' : 'Save stay to my trip'}
        </button>
      </div>
    </form>
  );
}

export default function DestinationDetailsPage() {
  const { slug } = useParams();
  return <DestinationDetails key={slug} slug={slug} />;
}

function DestinationDetails({ slug }) {
  const [destination, setDestination] = useState(null);
  const [externalDetails, setExternalDetails] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [saved, setSaved] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [activeAttraction, setActiveAttraction] = useState(null);
  const [attractionInfo, setAttractionInfo] = useState(null);
  const [attractionLoading, setAttractionLoading] = useState(false);
  const [attractionError, setAttractionError] = useState('');
  const [hotelData, setHotelData] = useState(null);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [hotelsError, setHotelsError] = useState('');
  const [hotelSort, setHotelSort] = useState('best');
  const [exploreTab, setExploreTab] = useState('attractions');
  const [bookingHotel, setBookingHotel] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    checkIn: '',
    checkOut: '',
    guests: 2,
    rooms: 1,
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    notes: '',
  });
  const [bookingSaving, setBookingSaving] = useState(false);
  const [bookingError, setBookingError] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const data = await destinationsApi.get(slug);
        if (cancelled) return;
        const item = data.destination;
        setDestination(item);
        recentlyViewedApi.record(item.slug).catch(() => {});

        const [wishlistResult, reviewResult] = await Promise.allSettled([
          wishlistApi.list(),
          reviewsApi.list(item.placeId || item.slug),
        ]);
        if (cancelled) return;
        if (wishlistResult.status === 'fulfilled') {
          setSaved(
            (wishlistResult.value.items || []).some(
              (entry) =>
                (entry.placeId && (entry.placeId === item.slug || entry.placeId === item.placeId)) ||
                entry.destinationName === item.name
            )
          );
        }
        if (reviewResult.status === 'fulfilled') {
          setReviews(reviewResult.value.items || []);
        }

        if (item.source !== 'curated' && item.lat != null && item.lon != null) {
          destinationsApi
            .details({ name: item.name, lat: item.lat, lon: item.lon })
            .then((details) => {
              if (!cancelled) setExternalDetails(details);
            })
            .catch(() => {});
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!activeAttraction) return undefined;
    function handleEscape(event) {
      if (event.key === 'Escape') closeAttraction();
    }
    document.addEventListener('keydown', handleEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeAttraction]);

  function closeAttraction() {
    setActiveAttraction(null);
    setAttractionInfo(null);
    setAttractionError('');
    setAttractionLoading(false);
    setHotelData(null);
    setHotelsError('');
    setHotelsLoading(false);
    setBookingHotel(null);
    setBookingError('');
    setConfirmedBooking(null);
  }

  function defaultStayDates() {
    const today = new Date();
    const checkOut = new Date(today);
    checkOut.setDate(checkOut.getDate() + 2);
    return {
      checkIn: today.toISOString().slice(0, 10),
      checkOut: checkOut.toISOString().slice(0, 10),
    };
  }

  async function loadHotels(lat, lon, label) {
    setHotelsLoading(true);
    setHotelsError('');
    try {
      const data = await destinationsApi.nearbyHotels({ lat, lon, name: label, radius: 3 });
      setHotelData(data);
    } catch (err) {
      setHotelsError(err.message);
    } finally {
      setHotelsLoading(false);
    }
  }

  async function openAttraction(attraction) {
    if (!destination) return;
    setActiveAttraction(attraction);
    setAttractionInfo(null);
    setAttractionError('');
    setAttractionLoading(true);
    setHotelData(null);
    setHotelsError('');
    setHotelsLoading(false);
    setBookingHotel(null);
    setBookingError('');
    setConfirmedBooking(null);
    setHotelSort('best');
    try {
      const data = await destinationsApi.attractionDetails({
        name: attraction.name,
        city: destination.city,
        country: destination.country,
        category: attraction.category || attraction.type || '',
        lat: attraction.lat != null ? attraction.lat : '',
        lon: attraction.lon != null ? attraction.lon : '',
      });
      setAttractionInfo(data.attraction || null);
      const resolvedLat = data.attraction?.lat ?? attraction.lat ?? destination.lat;
      const resolvedLon = data.attraction?.lon ?? attraction.lon ?? destination.lon;
      if (
        resolvedLat != null &&
        resolvedLon != null &&
        Number.isFinite(Number(resolvedLat)) &&
        Number.isFinite(Number(resolvedLon))
      ) {
        loadHotels(Number(resolvedLat), Number(resolvedLon), attraction.name);
      } else {
        setHotelsError('Location coordinates are not available for this attraction.');
      }
    } catch (err) {
      setAttractionError(err.message);
      if (
        destination.lat != null &&
        destination.lon != null &&
        Number.isFinite(Number(destination.lat)) &&
        Number.isFinite(Number(destination.lon))
      ) {
        loadHotels(Number(destination.lat), Number(destination.lon), attraction.name);
      } else {
        setHotelsError('Location coordinates are not available for this destination.');
      }
    } finally {
      setAttractionLoading(false);
    }
  }

  async function submitBooking(event) {
    event.preventDefault();
    if (!bookingHotel) return;
    setBookingSaving(true);
    setBookingError('');
    try {
      const data = await bookingsApi.create({
        hotelId: bookingHotel.id,
        hotelName: bookingHotel.name,
        hotelType: bookingHotel.type,
        hotelAddress: bookingHotel.address,
        hotelLat: bookingHotel.lat,
        hotelLon: bookingHotel.lon,
        hotelRating: bookingHotel.rating,
        attractionName: activeAttraction?.name || '',
        destinationName: destination.name,
        checkIn: bookingForm.checkIn,
        checkOut: bookingForm.checkOut,
        guests: Number(bookingForm.guests) || 1,
        rooms: Number(bookingForm.rooms) || 1,
        pricePerNight: bookingHotel.pricePerNight,
        contactName: bookingForm.contactName,
        contactEmail: bookingForm.contactEmail,
        contactPhone: bookingForm.contactPhone,
        notes: bookingForm.notes,
      });
      setConfirmedBooking(data.booking);
      setBookingHotel(null);
    } catch (err) {
      setBookingError(err.message);
    } finally {
      setBookingSaving(false);
    }
  }

  function startHotelBooking(hotel) {
    setBookingHotel(hotel);
    setBookingError('');
    setConfirmedBooking(null);
    setBookingForm((current) => ({ ...current, ...defaultStayDates() }));
  }

  function updateBookingField(field, value) {
    setBookingForm((current) => ({ ...current, [field]: value }));
  }

  function showHotels() {
    setExploreTab('hotels');
    if (hotelsLoading || hotelData?.area?.name === destination.name) return;
    if (
      destination?.lat == null ||
      destination?.lon == null ||
      !Number.isFinite(Number(destination.lat)) ||
      !Number.isFinite(Number(destination.lon))
    ) {
      setHotelsError('Location coordinates are not available for this destination.');
      return;
    }
    setHotelData(null);
    setHotelsError('');
    loadHotels(Number(destination.lat), Number(destination.lon), destination.name);
  }

  async function saveToWishlist() {
    if (!destination) return;
    try {
      await wishlistApi.add({
        destinationName: destination.name,
        placeId: destination.slug || destination.placeId || '',
        location: [destination.city, destination.country].filter(Boolean).join(', '),
        image: destination.image || destination.images?.[0] || '',
        rating: destination.rating || 0,
        data: {
          slug: destination.slug,
          city: destination.city,
          country: destination.country,
          category: destination.category,
          budgetTier: destination.budgetTier,
          dailyBudget: destination.dailyBudget,
          description: destination.description,
        },
      });
      setSaved(true);
      setMsg(`Saved "${destination.name}" to your wishlist.`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function submitReview(event) {
    event.preventDefault();
    if (!destination) return;
    try {
      await reviewsApi.add({
        destinationKey: destination.placeId || destination.slug,
        destinationName: destination.name,
        rating: reviewRating,
        comment: reviewComment,
      });
      setReviewComment('');
      setReviewRating(5);
      setMsg('Your review was saved.');
      const data = await reviewsApi.list(destination.placeId || destination.slug);
      setReviews(data.items || []);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return (
      <main className="main-content">
        <p className="empty-note">Loading destination details...</p>
      </main>
    );
  }

  if (error && !destination) {
    return (
      <main className="main-content">
        <p className="error-message">{error}</p>
        <Link className="endpoint-search" to="/discover-places">
          Back to discover
        </Link>
      </main>
    );
  }

  if (!destination) return null;

  const location = [destination.city, destination.region, destination.country].filter(Boolean).join(', ');
  const attractions = destination.attractions?.length
    ? destination.attractions
    : externalDetails?.nearbyAttractions || [];
  const nearbyRestaurants = externalDetails?.nearbyRestaurants || [];
  const maps = destination.maps || externalDetails?.maps || null;

  return (
    <main className="main-content">
      <Link className="back-link" to="/discover-places">
        Back to destination discovery
      </Link>

      <section className="destination-hero">
        <div className="destination-hero-media">
          <img
            src={destination.image || destination.images?.[0]}
            alt={destination.name}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(
                destination.slug
              )}-fallback/1200/800`;
            }}
          />
          <div className="destination-hero-badges">
            <span className="pill pill-blue">{destination.categoryLabel}</span>
            <span className="pill pill-green">{destination.budgetLabel}</span>
          </div>
        </div>
        <div className="destination-hero-body">
          <p className="section-kicker">{destination.country}</p>
          <h1>{destination.name}</h1>
          {location && <p className="destination-hero-location">{location}</p>}
          <div className="destination-hero-stats">
            <div>
              <span>Rating</span>
              <strong>{destination.rating ? `${Number(destination.rating).toFixed(1)} / 5` : 'Not rated'}</strong>
            </div>
            <div>
              <span>Reviews</span>
              <strong>{Number(destination.reviewCount || 0).toLocaleString('en-IN')}</strong>
            </div>
            <div>
              <span>Daily budget</span>
              <strong>{destination.dailyBudget ? formatRs(destination.dailyBudget) : 'Varies'}</strong>
            </div>
            <div>
              <span>Suggested stay</span>
              <strong>{destination.idealDurationDays ? `${destination.idealDurationDays} days` : 'Flexible'}</strong>
            </div>
          </div>
          {destination.tags?.length > 0 && (
            <div className="chip-row">
              {destination.tags.map((tag) => (
                <span className="chip chip-static" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          )}
          <div className="form-actions">
            <button
              type="button"
              className={saved ? 'save-trip-button is-saved' : 'save-trip-button'}
              onClick={saveToWishlist}
              disabled={saved}
            >
              {saved ? 'Saved to wishlist' : 'Save to wishlist'}
            </button>
            <Link className="plan-button" to="/planner">
              Plan a trip here
            </Link>
          </div>
          {msg && <p className="ai-status">{msg}</p>}
          {error && <p className="error-message">{error}</p>}
        </div>
      </section>

      <section className="planner-card">
        <h2>About {destination.name}</h2>
        <p>{destination.description || 'Explore this destination and build your own itinerary.'}</p>
        <div className="summary-grid">
          <div className="summary-tile">
            <span>Best time to visit</span>
            <strong>{destination.bestTimeToVisit || 'Check local seasons'}</strong>
          </div>
          <div className="summary-tile">
            <span>Estimated trip cost</span>
            <strong>
              {destination.estimatedTripCost
                ? formatRs(destination.estimatedTripCost)
                : 'Depends on your plan'}
            </strong>
            <span className="helper-text">
              Based on {destination.idealDurationDays || 'typical'} days at the mid-range daily budget.
            </span>
          </div>
          <div className="summary-tile">
            <span>Tourist attractions</span>
            <strong>{attractions.length}</strong>
            <span className="helper-text">Hand-picked highlights and nearby places.</span>
          </div>
        </div>
      </section>

      <section className="planner-card">
        <div className="card-heading">
          <div>
            <p className="section-kicker">Explore and stay</p>
            <h2>{exploreTab === 'attractions' ? 'Tourist attractions' : `Hotels near ${destination.name}`}</h2>
          </div>
          <div className="chip-row" role="tablist" aria-label="Destination places">
            <button
              type="button"
              role="tab"
              aria-selected={exploreTab === 'attractions'}
              className={`chip${exploreTab === 'attractions' ? ' is-active' : ''}`}
              onClick={() => setExploreTab('attractions')}
            >
              Tourist attractions
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={exploreTab === 'hotels'}
              className={`chip${exploreTab === 'hotels' ? ' is-active' : ''}`}
              onClick={showHotels}
            >
              Hotels nearby
            </button>
          </div>
        </div>
        {exploreTab === 'attractions' && (attractions.length > 0 ? (
          <div className="attraction-grid">
            {attractions.map((attraction) => (
              <button
                type="button"
                className="attraction-item attraction-button"
                key={attraction.name}
                onClick={() => openAttraction(attraction)}
                aria-label={`View details for ${attraction.name}`}
              >
                <span className="attraction-item-top">
                  <span className="attraction-title">{attraction.name}</span>
                  {attraction.rating ? (
                    <span className="score-pill">{Number(attraction.rating).toFixed(1)}</span>
                  ) : null}
                </span>
                {attraction.description && (
                  <span className="attraction-desc">{attraction.description}</span>
                )}
                <span className="attraction-footer">
                  {(attraction.category || attraction.type) && (
                    <span className="pill pill-neutral">
                      {attraction.category || attraction.type}
                    </span>
                  )}
                  <span className="attraction-cta">View details</span>
                </span>
              </button>
            ))}
          </div>
        ) : <p className="empty-note">No tourist attractions are listed for this destination yet.</p>)}
        {exploreTab === 'attractions' && nearbyRestaurants.length > 0 && (
          <>
            <h3>Nearby restaurants</h3>
            <ul className="notes-list">
              {nearbyRestaurants.map((restaurant) => (
                <li key={restaurant.name}>{restaurant.name}</li>
              ))}
            </ul>
          </>
        )}
        {exploreTab === 'hotels' && (
          <div className="stack">
            {hotelData?.safety && (
              <div className="hotel-safety-summary">
                <div>
                  <span className="section-kicker">Area safety estimate</span>
                  <strong>{hotelData.safety.score} / 10 · {hotelData.safety.label}</strong>
                </div>
                <p>{hotelData.safety.note}</p>
                {hotelData.safety.factors?.length > 0 && (
                  <ul>
                    {hotelData.safety.factors.map((factor) => (
                      <li key={factor.label}><strong>{factor.label}:</strong> {factor.detail}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {hotelData && !hotelData.safety && (
              <p className="helper-text">Area safety information is temporarily unavailable; no safety score is shown.</p>
            )}
            <div className="hotel-toolbar">
              <p className="helper-text">
                {hotelData
                  ? `${hotelData.hotelCount} hotels listed within ${hotelData.area.radiusKm} km. ${hotelData.note}`
                  : 'Searching for nearby hotels...'}
              </p>
              <label className="hotel-sort-control" htmlFor="hotel-sort">Sort hotels
                <select id="hotel-sort" value={hotelSort} onChange={(event) => setHotelSort(event.target.value)}>
                  <option value="best">Best overall</option>
                  <option value="rating">Highest rating</option>
                  <option value="price">Lowest price</option>
                  <option value="distance">Nearest</option>
                </select>
              </label>
            </div>
            {hotelsLoading && <p className="empty-note" role="status">Finding nearby hotels...</p>}
            {hotelsError && <p className="error-message" role="alert">{hotelsError}</p>}
            {hotelData && (
              <HotelResults
                hotels={[...hotelData.hotels].sort((a, b) => {
                  if (hotelSort === 'rating') return b.rating - a.rating;
                  if (hotelSort === 'price') return a.pricePerNight - b.pricePerNight;
                  if (hotelSort === 'distance') return a.distanceKm - b.distanceKm;
                  return b.bestScore - a.bestScore;
                })}
                onBook={startHotelBooking}
              />
            )}
            {confirmedBooking && !activeAttraction && (
              <p className="ai-status" role="status">
                Stay saved to your trip. Reference: {confirmedBooking.reference}. This is not a hotel-confirmed reservation.
              </p>
            )}
            {bookingHotel && !activeAttraction && (
              <BookingForm
                hotel={bookingHotel}
                form={bookingForm}
                onChange={updateBookingField}
                onSubmit={submitBooking}
                saving={bookingSaving}
                error={bookingError}
              />
            )}
          </div>
        )}
      </section>

      <section className="planner-card">
        <h2>Budget guide</h2>
        <p className="helper-text">
          Daily estimates for one traveller. Actual costs vary with season, location, and travel style.
        </p>
        <div className="budget-grid">
          {(destination.budgetBreakdown || []).map((tier) => (
            <article className={`budget-tier tier-${tier.key}`} key={tier.key}>
              <span>{tier.label}</span>
              <strong>{tier.perDay ? `${formatRs(tier.perDay)} / day` : 'Varies'}</strong>
              <p>{tier.note}</p>
            </article>
          ))}
        </div>
      </section>

      {maps && (
        <section className="planner-card">
          <h2>Location</h2>
          <iframe title={`Map of ${destination.name}`} src={maps.embed} className="destination-map" />
          <p>
            <a href={maps.link} target="_blank" rel="noreferrer">
              Open a larger map
            </a>
          </p>
        </section>
      )}

      {externalDetails?.weather && !externalDetails.weather.unavailable && (
        <section className="planner-card">
          <h2>Current weather</h2>
          <p>
            {externalDetails.weather.temp} C, {externalDetails.weather.description}. Feels like{' '}
            {externalDetails.weather.feelsLike} C with {externalDetails.weather.humidity}% humidity.
          </p>
          <p className="helper-text">Source: {externalDetails.weather.source}</p>
        </section>
      )}

      <section className="planner-card">
        <div className="card-heading">
          <div>
            <p className="section-kicker">Community notes</p>
            <h2>Reviews</h2>
          </div>
          <span className="saved-trip-count">{reviews.length}</span>
        </div>
        <form onSubmit={submitReview} className="stack">
          <div className="inline-fields">
            <div className="form-group">
              <label htmlFor="review-rating">Your rating</label>
              <select
                id="review-rating"
                value={reviewRating}
                onChange={(event) => setReviewRating(Number(event.target.value))}
              >
                {[5, 4, 3, 2, 1].map((value) => (
                  <option key={value} value={value}>
                    {value} / 5
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="review-comment">Comment</label>
            <textarea
              id="review-comment"
              rows={3}
              value={reviewComment}
              onChange={(event) => setReviewComment(event.target.value)}
              placeholder="Share tips about visiting, food, transport, or timing"
            />
          </div>
          <button className="small-primary-button" type="submit">
            Post review
          </button>
        </form>

        <div className="stack">
          {reviews.length === 0 ? (
            <p className="empty-note">No reviews yet. Be the first to share a tip.</p>
          ) : (
            reviews.map((review) => (
              <article className="review-card" key={review.id}>
                <div className="review-top">
                  <strong>{review.userName}</strong>
                  <span className="star-rating">{review.rating} / 5</span>
                </div>
                <p className="review-comment">{review.comment}</p>
                <span className="review-author">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </article>
            ))
          )}
        </div>
      </section>

      {activeAttraction && (
        <div
          className="attraction-modal-backdrop"
          role="presentation"
          onClick={closeAttraction}
        >
          <div
            className="attraction-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="attraction-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="attraction-modal-close"
              onClick={closeAttraction}
              aria-label="Close attraction details"
            >
              Close
            </button>
            <div className="attraction-modal-media">
              <img
                src={
                  attractionInfo?.image ||
                  `https://picsum.photos/seed/${encodeURIComponent(
                    activeAttraction.name
                  )}-attraction/900/600`
                }
                alt={activeAttraction.name}
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(
                    activeAttraction.name
                  )}-attraction-fallback/900/600`;
                }}
              />
              <div className="attraction-modal-badges">
                {(attractionInfo?.category || activeAttraction.category || activeAttraction.type) && (
                  <span className="pill pill-blue">
                    {attractionInfo?.category || activeAttraction.category || activeAttraction.type}
                  </span>
                )}
                {activeAttraction.rating ? (
                  <span className="pill pill-green">
                    {Number(activeAttraction.rating).toFixed(1)} / 5
                  </span>
                ) : null}
              </div>
            </div>
            <div className="attraction-modal-body">
              <p className="section-kicker">Attraction in {destination.name}</p>
              <h2 id="attraction-modal-title">{activeAttraction.name}</h2>
              {attractionLoading && (
                <p className="helper-text">Fetching attraction information...</p>
              )}
              {attractionError && (
                <p className="error-message">
                  Could not fetch live details: {attractionError}
                </p>
              )}
              <p>
                {attractionInfo?.wikipedia?.extract ||
                  activeAttraction.description ||
                  attractionInfo?.description ||
                  'No description available for this attraction yet.'}
              </p>
              {attractionInfo?.address && (
                <p className="helper-text">Location: {attractionInfo.address}</p>
              )}
              {attractionInfo?.maps && (
                <>
                  <iframe
                    title={`Map of ${activeAttraction.name}`}
                    src={attractionInfo.maps.embed}
                    className="destination-map"
                    loading="lazy"
                  />
                  <p>
                    <a href={attractionInfo.maps.link} target="_blank" rel="noreferrer">
                      Open a larger map
                    </a>
                  </p>
                </>
              )}
              {attractionInfo?.wikipedia?.url && (
                <p>
                  <a href={attractionInfo.wikipedia.url} target="_blank" rel="noreferrer">
                    Read more on Wikipedia
                  </a>
                </p>
              )}
              {attractionInfo?.source && (
                <p className="helper-text">Source: {attractionInfo.source}</p>
              )}
              <section className="attraction-hotels">
                <h3>Hotels near {activeAttraction.name}</h3>
                {hotelData?.safety && (
                  <p className="helper-text">
                    Area safety estimate: <strong>{hotelData.safety.score} / 10 · {hotelData.safety.label}</strong>.
                    {' '}{hotelData.safety.note}
                  </p>
                )}
                {hotelData && !hotelData.safety && (
                  <p className="helper-text">Area safety information is temporarily unavailable; no safety score is shown.</p>
                )}
                {hotelsLoading && <p className="empty-note" role="status">Finding nearby hotels...</p>}
                {hotelsError && <p className="error-message" role="alert">{hotelsError}</p>}
                {hotelData && (
                  <HotelResults
                    hotels={[...hotelData.hotels].sort((a, b) => {
                      if (hotelSort === 'rating') return b.rating - a.rating;
                      if (hotelSort === 'price') return a.pricePerNight - b.pricePerNight;
                      if (hotelSort === 'distance') return a.distanceKm - b.distanceKm;
                      return b.bestScore - a.bestScore;
                    })}
                    onBook={startHotelBooking}
                  />
                )}
                {confirmedBooking && (
                  <p className="ai-status" role="status">
                    Stay saved to your trip. Reference: {confirmedBooking.reference}. This is not a hotel-confirmed reservation.
                  </p>
                )}
                {bookingHotel && (
                  <BookingForm
                    hotel={bookingHotel}
                    form={bookingForm}
                    onChange={updateBookingField}
                    onSubmit={submitBooking}
                    saving={bookingSaving}
                    error={bookingError}
                  />
                )}
              </section>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
