import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { destinationsApi, recentlyViewedApi, wishlistApi } from '../api/client';
import DestinationCard from '../components/DestinationCard.jsx';
import '../Pages.css';

const SORT_OPTIONS = [
  { key: 'relevance', label: 'Best match' },
  { key: 'popularity', label: 'Most popular' },
  { key: 'rating', label: 'Top rated' },
  { key: 'trending', label: 'Trending now' },
  { key: 'budget_low', label: 'Budget: low to high' },
  { key: 'budget_high', label: 'Budget: high to low' },
  { key: 'name', label: 'Name A-Z' },
];

const BUDGET_OPTIONS = [
  { key: 'budget', label: 'Budget', range: 'Up to Rs 3,500 / day' },
  { key: 'mid', label: 'Mid-range', range: 'Rs 3,500 - 8,000 / day' },
  { key: 'premium', label: 'Premium', range: 'Rs 8,000 - 15,000 / day' },
  { key: 'luxury', label: 'Luxury', range: 'Rs 15,000+ / day' },
];

const FALLBACK_CATEGORIES = [
  { key: 'beach', label: 'Beach' },
  { key: 'historical', label: 'Historical' },
  { key: 'nature', label: 'Nature' },
  { key: 'adventure', label: 'Adventure' },
  { key: 'food', label: 'Food & Drink' },
  { key: 'entertainment', label: 'Entertainment' },
  { key: 'romantic', label: 'Romantic' },
];

function SuggestionType({ type }) {
  const labels = { destination: 'Destination', attraction: 'Attraction', city: 'City', country: 'Country' };
  return <span className={`autocomplete-type type-${type}`}>{labels[type] || 'Place'}</span>;
}

export default function DiscoverPlacesPage() {
  const [q, setQ] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('all');
  const [budget, setBudget] = useState('all');
  const [maxBudget, setMaxBudget] = useState('');
  const [sort, setSort] = useState('popularity');
  const [includeLive, setIncludeLive] = useState(true);

  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const [categories, setCategories] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ countries: [], cities: [], budgets: [] });
  const [popular, setPopular] = useState([]);
  const [trending, setTrending] = useState([]);
  const [recent, setRecent] = useState([]);
  const [savedKeys, setSavedKeys] = useState({});

  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchBoxRef = useRef(null);
  const requestIdRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const requestId = ++requestIdRef.current;
    (async () => {
      const [categoriesResult, filtersResult, popularResult, trendingResult, recentResult, wishlistResult, browseResult] =
        await Promise.allSettled([
          destinationsApi.categories(),
          destinationsApi.filters(),
          destinationsApi.popular(6),
          destinationsApi.trending(6),
          recentlyViewedApi.list(10),
          wishlistApi.list(),
          destinationsApi.search({ sort: 'popularity', limit: 24, includeExternal: 'false' }),
        ]);

      if (cancelled || requestId !== requestIdRef.current) return;

      if (categoriesResult.status === 'fulfilled') setCategories(categoriesResult.value.categories || []);
      if (filtersResult.status === 'fulfilled') {
        setFilterOptions({
          countries: filtersResult.value.countries || [],
          cities: filtersResult.value.cities || [],
          budgets: filtersResult.value.budgets || [],
        });
      }
      if (popularResult.status === 'fulfilled') setPopular(popularResult.value.items || []);
      if (trendingResult.status === 'fulfilled') setTrending(trendingResult.value.items || []);
      if (recentResult.status === 'fulfilled') setRecent(recentResult.value.items || []);
      if (wishlistResult.status === 'fulfilled') {
        const map = {};
        for (const item of wishlistResult.value.items || []) {
          if (item.placeId) map[item.placeId] = true;
          if (item.destinationName) map[item.destinationName] = true;
        }
        setSavedKeys(map);
      }
      if (browseResult.status === 'fulfilled') {
        setResults(browseResult.value.results || []);
        setTotal(browseResult.value.total || 0);
        setNote(browseResult.value.note || '');
      } else {
        setError(browseResult.reason?.message || 'Could not load destinations.');
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const term = q.trim();
    if (!suggestionsOpen || term.length < 1) return undefined;
    const timer = setTimeout(async () => {
      setLoadingSuggestions(true);
      try {
        const data = await destinationsApi.autocomplete(term, 8);
        setSuggestions(data.suggestions || []);
        setActiveSuggestion(-1);
      } catch {
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [q, suggestionsOpen]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target)) {
        setSuggestionsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function runSearch(overrides = {}, markSearched = true) {
    const requestId = ++requestIdRef.current;
    const params = {
      q: overrides.q !== undefined ? overrides.q : q,
      country: overrides.country !== undefined ? overrides.country : country,
      city: overrides.city !== undefined ? overrides.city : city,
      category: overrides.category !== undefined ? overrides.category : category,
      budget: overrides.budget !== undefined ? overrides.budget : budget,
      maxBudget: overrides.maxBudget !== undefined ? overrides.maxBudget : maxBudget,
      sort: overrides.sort !== undefined ? overrides.sort : sort,
      limit: 24,
      includeExternal:
        overrides.includeExternal !== undefined
          ? overrides.includeExternal
          : includeLive
            ? 'true'
            : 'false',
    };
    setLoading(true);
    setError('');
    setMsg('');
    setSuggestionsOpen(false);
    if (markSearched) setHasSearched(true);
    try {
      const data = await destinationsApi.search(params);
      if (requestId !== requestIdRef.current) return;
      setResults(data.results || []);
      setTotal(data.total || 0);
      setNote(data.note || '');
    } catch (err) {
      if (requestId !== requestIdRef.current) return;
      setError(err.message);
      setResults([]);
      setTotal(0);
    } finally {
      if (requestId === requestIdRef.current) setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    const nextSort = q.trim() && sort === 'popularity' ? 'relevance' : sort;
    setSort(nextSort);
    runSearch({ sort: nextSort });
  }

  function handleCountryChange(value) {
    setCountry(value);
    setCity('');
    runSearch({ country: value, city: '' });
  }

  function handleCityChange(value) {
    setCity(value);
    runSearch({ city: value });
  }

  function handleCategoryClick(key) {
    const next = key === 'all' || category === key ? 'all' : key;
    setCategory(next);
    runSearch({ category: next });
  }

  function handleBudgetChange(value) {
    setBudget(value);
    runSearch({ budget: value });
  }

  function handleSortChange(value) {
    setSort(value);
    runSearch({ sort: value });
  }

  function resetFilters() {
    setQ('');
    setCountry('');
    setCity('');
    setCategory('all');
    setBudget('all');
    setMaxBudget('');
    setSort('popularity');
    setHasSearched(false);
    runSearch(
      { q: '', country: '', city: '', category: 'all', budget: 'all', maxBudget: '', sort: 'popularity' },
      false
    );
  }

  function handleSuggestion(suggestion) {
    setSuggestionsOpen(false);
    setActiveSuggestion(-1);
    if (suggestion.type === 'city') {
      setQ('');
      setCity(suggestion.label);
      runSearch({ q: '', city: suggestion.label });
      return;
    }
    if (suggestion.type === 'country') {
      setQ('');
      setCountry(suggestion.label);
      setCity('');
      runSearch({ q: '', country: suggestion.label, city: '' });
      return;
    }
    setQ(suggestion.label);
    runSearch({ q: suggestion.label, sort: 'relevance' });
  }

  function handleKeyDown(event) {
    if (!suggestionsOpen) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActiveSuggestion((index) => Math.min(index + 1, suggestions.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveSuggestion((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter' && activeSuggestion >= 0 && suggestions[activeSuggestion]) {
      event.preventDefault();
      handleSuggestion(suggestions[activeSuggestion]);
    } else if (event.key === 'Escape') {
      setSuggestionsOpen(false);
    }
  }

  async function saveDestination(destination) {
    const key = destination.slug || destination.name;
    try {
      await wishlistApi.add({
        destinationName: destination.name,
        placeId: destination.slug || destination.placeId || '',
        location: [destination.city, destination.country].filter(Boolean).join(', '),
        image: destination.image || '',
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
      setSavedKeys((previous) => ({ ...previous, [key]: true, [destination.name]: true }));
      setMsg(`Saved "${destination.name}" to your wishlist.`);
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeRecentItem(id) {
    try {
      await recentlyViewedApi.remove(id);
      setRecent((items) => items.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  async function clearRecent() {
    try {
      await recentlyViewedApi.clear();
      setRecent([]);
    } catch (err) {
      setError(err.message);
    }
  }

  const isSaved = (destination) => Boolean(savedKeys[destination.slug] || savedKeys[destination.name]);
  const cities = filterOptions.cities.filter((option) => !country || option.country === country);
  const categoryChips = categories.length ? categories : FALLBACK_CATEGORIES;
  const budgetChips = filterOptions.budgets.length ? filterOptions.budgets : BUDGET_OPTIONS;

  return (
    <main className="main-content">
      <div className="page-heading">
        <div>
          <p className="section-kicker">Discover and explore</p>
          <h1>Find your next destination</h1>
          <p>
            Search by city, country, or tourist attraction. Filter by category, country, city, and
            budget, sort by rating and popularity, then save favourites to your wishlist.
          </p>
        </div>
      </div>

      <section className="planner-card discover-search-card">
        <h2>Search destinations</h2>
        <form onSubmit={handleSubmit} className="stack">
          <div className="searchbox" ref={searchBoxRef}>
            <label htmlFor="destination-search">Destination, city, country, or attraction</label>
            <input
              id="destination-search"
              value={q}
              onChange={(event) => {
                setQ(event.target.value);
                setSuggestionsOpen(true);
              }}
              onFocus={() => setSuggestionsOpen(true)}
              onKeyDown={handleKeyDown}
              placeholder="Try Jaipur, Bali, Taj Mahal, or Japan"
              autoComplete="off"
              aria-autocomplete="list"
              aria-expanded={suggestionsOpen}
            />
            {suggestionsOpen && q.trim().length > 0 && (
              <div className="autocomplete-panel" role="listbox">
                {loadingSuggestions && <p className="autocomplete-empty">Searching suggestions...</p>}
                {!loadingSuggestions && suggestions.length === 0 && (
                  <p className="autocomplete-empty">No suggestions yet. Press Search to look further.</p>
                )}
                {suggestions.map((suggestion, index) => (
                  <button
                    type="button"
                    role="option"
                    aria-selected={activeSuggestion === index}
                    key={`${suggestion.type}-${suggestion.label}-${index}`}
                    className={`autocomplete-item${activeSuggestion === index ? ' is-active' : ''}`}
                    onMouseEnter={() => setActiveSuggestion(index)}
                    onClick={() => handleSuggestion(suggestion)}
                  >
                    <span className="autocomplete-copy">
                      <strong>{suggestion.label}</strong>
                      <span>{suggestion.subtitle}</span>
                    </span>
                    <SuggestionType type={suggestion.type} />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="filter-grid">
            <div className="form-group">
              <label htmlFor="filter-country">Country</label>
              <select
                id="filter-country"
                value={country}
                onChange={(event) => handleCountryChange(event.target.value)}
              >
                <option value="">All countries</option>
                {filterOptions.countries.map((option) => (
                  <option key={option.name} value={option.name}>
                    {option.name} ({option.count})
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="filter-city">City</label>
              <select
                id="filter-city"
                value={city}
                onChange={(event) => handleCityChange(event.target.value)}
              >
                <option value="">All cities</option>
                {cities.map((option) => (
                  <option key={`${option.name}-${option.country}`} value={option.name}>
                    {option.name}
                    {!country && option.country ? `, ${option.country}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="filter-budget">Budget tier</label>
              <select
                id="filter-budget"
                value={budget}
                onChange={(event) => handleBudgetChange(event.target.value)}
              >
                <option value="all">Any budget</option>
                {budgetChips.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label} - {option.range}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="filter-max-budget">Max daily budget (Rs)</label>
              <input
                id="filter-max-budget"
                type="number"
                min="0"
                step="500"
                value={maxBudget}
                onChange={(event) => setMaxBudget(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    runSearch({ maxBudget: event.currentTarget.value });
                  }
                }}
                placeholder="e.g. 8000"
              />
            </div>
            <div className="form-group">
              <label htmlFor="filter-sort">Sort by</label>
              <select
                id="filter-sort"
                value={sort}
                onChange={(event) => handleSortChange(event.target.value)}
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button className="plan-button" type="submit" disabled={loading}>
              {loading ? 'Searching...' : 'Search destinations'}
            </button>
            <button type="button" className="endpoint-search" onClick={resetFilters}>
              Reset filters
            </button>
            <button
              type="button"
              className={`chip${includeLive ? ' is-active' : ''}`}
              onClick={() => {
                const next = !includeLive;
                setIncludeLive(next);
                runSearch({ includeExternal: next ? 'true' : 'false' });
              }}
            >
              Live OpenStreetMap results: {includeLive ? 'On' : 'Off'}
            </button>
          </div>
        </form>

        <div className="chip-row" role="group" aria-label="Destination categories">
          <button
            type="button"
            className={`chip${category === 'all' ? ' is-active' : ''}`}
            onClick={() => handleCategoryClick('all')}
          >
            All
          </button>
          {categoryChips.map((item) => (
            <button
              type="button"
              key={item.key}
              className={`chip${category === item.key ? ' is-active' : ''}`}
              onClick={() => handleCategoryClick(item.key)}
            >
              {item.label}
              {item.count ? <span className="chip-count">{item.count}</span> : null}
            </button>
          ))}
        </div>

        {error && <p className="error-message">{error}</p>}
        {msg && <p className="ai-status">{msg}</p>}
        {note && <p className="helper-text">{note}</p>}
      </section>

      {popular.length > 0 && (
        <section className="discover-rail">
          <div className="rail-heading">
            <div>
              <p className="section-kicker">Most loved</p>
              <h2>Popular destinations</h2>
            </div>
            <button type="button" className="chip" onClick={() => handleSortChange('popularity')}>
              Sort by popularity
            </button>
          </div>
          <div className="rail-list">
            {popular.map((destination) => (
              <DestinationCard
                key={destination.slug}
                destination={destination}
                compact
                saved={isSaved(destination)}
                onSave={saveDestination}
              />
            ))}
          </div>
        </section>
      )}

      {trending.length > 0 && (
        <section className="discover-rail">
          <div className="rail-heading">
            <div>
              <p className="section-kicker">Rising fast</p>
              <h2>Trending destinations</h2>
            </div>
            <button type="button" className="chip" onClick={() => handleSortChange('trending')}>
              See trending
            </button>
          </div>
          <div className="rail-list">
            {trending.map((destination) => (
              <DestinationCard
                key={destination.slug}
                destination={destination}
                compact
                saved={isSaved(destination)}
                onSave={saveDestination}
              />
            ))}
          </div>
        </section>
      )}

      {recent.length > 0 && (
        <section className="planner-card">
          <div className="card-heading">
            <div>
              <p className="section-kicker">Pick up where you left off</p>
              <h2>Recently viewed</h2>
            </div>
            <button type="button" className="remove-button" onClick={clearRecent}>
              Clear all
            </button>
          </div>
          <div className="recent-grid">
            {recent.map((item) => (
              <article className="recent-card" key={item.id}>
                <Link
                  className="recent-media"
                  to={`/discover-places/${encodeURIComponent(item.slug)}`}
                  aria-label={`View ${item.destinationName}`}
                >
                  <img
                    src={item.image}
                    alt={item.destinationName}
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = `https://picsum.photos/seed/${encodeURIComponent(
                        item.slug
                      )}-fallback/300/300`;
                    }}
                  />
                </Link>
                <div className="recent-body">
                  <Link to={`/discover-places/${encodeURIComponent(item.slug)}`}>
                    <strong>{item.destinationName}</strong>
                  </Link>
                  <span>{[item.city, item.country].filter(Boolean).join(', ')}</span>
                  <span className="helper-text">
                    {item.categoryLabel} - {item.budgetLabel}
                  </span>
                </div>
                <button
                  type="button"
                  className="recent-remove"
                  onClick={() => removeRecentItem(item.id)}
                  aria-label={`Remove ${item.destinationName} from recently viewed`}
                >
                  Remove
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="planner-card">
        <div className="card-heading">
          <div>
            <p className="section-kicker">{hasSearched ? 'Search results' : 'Browse all'}</p>
            <h2>{hasSearched ? 'Matching destinations' : 'Explore destinations'}</h2>
            <p>
              {loading
                ? 'Finding destinations...'
                : `${total} destinations${country ? ` in ${country}` : ''}${
                    city ? ` near ${city}` : ''
                  } match your filters.`}
            </p>
          </div>
          <span className="saved-trip-count">{total}</span>
        </div>

        {!loading && results.length === 0 && (
          <p className="empty-note">
            No destinations matched. Try a wider budget, another category, or a different spelling.
          </p>
        )}

        {results.length > 0 && (
          <div className="destination-grid">
            {results.map((destination) => (
              <DestinationCard
                key={destination.slug}
                destination={destination}
                saved={isSaved(destination)}
                onSave={saveDestination}
              />
            ))}
          </div>
        )}
      </section>

      <section className="planner-card discover-cta">
        <div>
          <p className="section-kicker">Ready to build the route</p>
          <h2>Turn discoveries into a trip</h2>
          <p className="helper-text">
            Add saved destinations as stops in the planner and let the optimizer arrange the best
            visiting order.
          </p>
        </div>
        <div className="form-actions">
          <Link className="plan-button" to="/planner">
            Open trip planner
          </Link>
          <Link className="endpoint-search" to="/wishlist">
            View wishlist
          </Link>
        </div>
      </section>
    </main>
  );
}
