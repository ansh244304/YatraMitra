import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatRs } from '../utils/format.js';

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" width="14" height="14">
      <path
        d="m12 3.6 2.6 5.27 5.82.85-4.21 4.1.99 5.79L12 16.87l-5.2 2.74.99-5.79-4.21-4.1 5.82-.85L12 3.6Z"
        fill="currentColor"
      />
    </svg>
  );
}

export default function DestinationCard({ destination, saved = false, onSave, compact = false }) {
  const [imageFailed, setImageFailed] = useState(false);
  const slug = destination.slug || destination.id;
  const href = `/discover-places/${encodeURIComponent(slug)}`;
  const fallback = `https://picsum.photos/seed/${encodeURIComponent(slug)}-fallback/900/600`;
  const image = imageFailed ? fallback : destination.image || destination.images?.[0] || fallback;
  const location = [destination.city, destination.country].filter(Boolean).join(', ');
  const attractionCount = destination.attractions?.length || 0;

  return (
    <article className={`destination-card${compact ? ' is-compact' : ''}`}>
      <Link className="destination-media" to={href} aria-label={`View details for ${destination.name}`}>
        <img
          className="destination-img"
          src={image}
          alt={destination.name}
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
        <span className="destination-badge">{destination.categoryLabel || destination.category}</span>
        {destination.budgetLabel && <span className="destination-budget">{destination.budgetLabel}</span>}
      </Link>
      <div className="destination-body">
        <div className="destination-title-row">
          <h3>
            <Link to={href}>{destination.name}</Link>
          </h3>
          {destination.rating > 0 && (
            <span className="destination-rating">
              <StarIcon />
              {Number(destination.rating).toFixed(1)}
            </span>
          )}
        </div>
        {location && <p className="destination-meta">{location}</p>}
        {!compact && destination.description && (
          <p className="destination-desc">{destination.description}</p>
        )}
        {!compact && attractionCount > 0 && (
          <p className="destination-highlights">{attractionCount} tourist attractions</p>
        )}
        <div className="destination-footer">
          <span className="destination-price">
            {destination.dailyBudget ? `${formatRs(destination.dailyBudget)} / day` : 'Budget varies'}
          </span>
          <div className="destination-actions">
            <Link className="small-primary-button" to={href}>
              View details
            </Link>
            {onSave && (
              <button
                type="button"
                className={saved ? 'save-trip-button is-saved' : 'save-trip-button'}
                onClick={() => onSave(destination)}
                disabled={saved}
              >
                {saved ? 'Saved' : 'Save'}
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
