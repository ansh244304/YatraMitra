import { useState } from 'react';
import '../Pages.css';

const ACTIVITY_OPTIONS = [
  { value: 'hiking', label: 'Hiking' },
  { value: 'trekking', label: 'Trekking' },
  { value: 'camping', label: 'Camping' },
  { value: 'river', label: 'River crossing / rafting' },
];

function buildChecklist(activity) {
  const base = [
    { item: 'Hiking shoes / boots', category: 'footwear' },
    { item: 'Backpack', category: 'gear' },
    { item: 'Water bottle / water supply', category: 'hydration' },
    { item: 'First aid kit', category: 'safety' },
    { item: 'Flashlight / headlamp', category: 'safety' },
    { item: 'Rain jacket / poncho', category: 'clothing' },
  ];

  const activitySpecific = {
    hiking: [
      { item: 'Trekking poles', category: 'gear' },
      { item: 'Extra socks', category: 'clothing' },
    ],
    trekking: [
      { item: 'Trekking poles', category: 'gear' },
      { item: 'Sleeping bag', category: 'camping' },
      { item: 'Compass / GPS', category: 'navigation' },
      { item: 'Emergency shelter', category: 'safety' },
    ],
    camping: [
      { item: 'Tent', category: 'camping' },
      { item: 'Sleeping bag', category: 'camping' },
      { item: 'Cooking utensils', category: 'food' },
      { item: 'Fire starter', category: 'camping' },
    ],
    river: [
      { item: 'Life jacket', category: 'safety' },
      { item: 'Waterproof bag', category: 'gear' },
      { item: 'Rope', category: 'safety' },
    ],
  };

  return [...base, ...(activitySpecific[activity] || [])].map((entry, index) => ({
    id: `${activity}-${index}-${entry.item}`,
    ...entry,
    checked: false,
  }));
}

function adventureWeather(activity) {
  return {
    condition: 'Partly cloudy',
    temperature: '18–25°C',
    forecast: 'No heavy rainfall expected over the next 24 hours.',
    warning:
      activity === 'river'
        ? 'Check water levels before crossing and avoid the area during heavy rain.'
        : null,
  };
}

function AdventurePrepPage() {
  const [destination, setDestination] = useState('');
  const [activity, setActivity] = useState('hiking');
  const [checklist, setChecklist] = useState([]);
  const [weather, setWeather] = useState(null);
  const [message, setMessage] = useState('');

  const generateChecklist = (event) => {
    event.preventDefault();
    if (!destination.trim()) {
      setMessage('Enter a destination so the checklist can be labelled for your trip.');
      return;
    }
    setChecklist(buildChecklist(activity));
    setWeather(adventureWeather(activity));
    setMessage(`Checklist ready for ${destination.trim()} (${activity}).`);
  };

  const toggleChecklistItem = (id) => {
    setChecklist((current) =>
      current.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const packedCount = checklist.filter((item) => item.checked).length;

  return (
    <main className="main-content">
      <div className="page-heading">
        <div>
          <p className="section-kicker">Adventure preparation</p>
          <h1>Get gear-ready before you go</h1>
          <p>
            Pick your activity and destination to build a packing checklist and a quick
            weather outlook. Checklists are general guidance, not professional advice.
          </p>
        </div>
      </div>

      <section className="planner-card" aria-labelledby="adventure-form-heading">
        <div className="card-heading">
          <div>
            <p className="section-kicker">Step 1 · Tell us about the trip</p>
            <h2 id="adventure-form-heading">Adventure details</h2>
            <p>Choose the activity you are preparing for and where you are going.</p>
          </div>
        </div>

        <form className="stack" onSubmit={generateChecklist}>
          <div className="inline-fields">
            <div className="form-group">
              <label htmlFor="adventureDestination">Destination</label>
              <input
                id="adventureDestination"
                type="text"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                placeholder="e.g. Meghalaya, Manali, Rishikesh"
              />
            </div>
            <div className="form-group">
              <label htmlFor="adventureActivity">Activity</label>
              <select
                id="adventureActivity"
                value={activity}
                onChange={(event) => setActivity(event.target.value)}
              >
                {ACTIVITY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="small-primary-button">
              Generate checklist
            </button>
            {checklist.length > 0 && (
              <button
                type="button"
                className="remove-button"
                onClick={() => {
                  setChecklist([]);
                  setWeather(null);
                  setMessage('');
                }}
              >
                Clear checklist
              </button>
            )}
          </div>
          {message && <p className="ai-status" role="status">{message}</p>}
        </form>
      </section>

      {weather && (
        <section className="planner-card" aria-labelledby="adventure-weather-heading">
          <div className="card-heading">
            <div>
              <p className="section-kicker">Weather outlook</p>
              <h2 id="adventure-weather-heading">Quick conditions</h2>
            </div>
            <span className="pill pill-blue">Sample outlook</span>
          </div>
          <div className="feature-grid">
            <div className="feature-card">
              <span className="helper-text">Condition</span>
              <strong>{weather.condition}</strong>
              <p>{weather.temperature}</p>
            </div>
            <div className="feature-card">
              <span className="helper-text">Forecast</span>
              <strong>Next 24 hours</strong>
              <p>{weather.forecast}</p>
            </div>
          </div>
          {weather.warning && <p className="ai-error" role="alert">{weather.warning}</p>}
          <p className="helper-text">
            This outlook is a planning aid, not live meteorological data. Confirm with an
            official weather service before heading out.
          </p>
        </section>
      )}

      {checklist.length > 0 && (
        <section className="planner-card" aria-labelledby="adventure-checklist-heading">
          <div className="card-heading">
            <div>
              <p className="section-kicker">Step 2 · Pack with confidence</p>
              <h2 id="adventure-checklist-heading">Packing checklist</h2>
              <p>Tick items off as you pack. Progress is kept on this page.</p>
            </div>
            <span className="pill pill-green">
              {packedCount}/{checklist.length} packed
            </span>
          </div>

          <ul className="checklist">
            {checklist.map((item) => (
              <li
                key={item.id}
                className={`checklist-item ${item.checked ? 'is-checked' : ''}`}
              >
                <input
                  id={`check-${item.id}`}
                  type="checkbox"
                  checked={item.checked}
                  onChange={() => toggleChecklistItem(item.id)}
                />
                <label className="checklist-label" htmlFor={`check-${item.id}`}>
                  {item.item}
                </label>
                <span className="checklist-category">{item.category}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}

export default AdventurePrepPage;
