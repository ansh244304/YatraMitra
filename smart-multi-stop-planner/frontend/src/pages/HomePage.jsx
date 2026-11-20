import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <main className="main-content">
      <section className="hero" id="home" aria-labelledby="hero-heading">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" aria-hidden="true" /> Yatra Mitra - Your Smart Travel Companion</p>

          <h1 id="hero-heading">
            Travel Safe.
            <br />
            <em>Travel Smart.</em>
          </h1>

          <p className="subtitle">
            Plan journeys, discover hidden places, prepare for adventures, and travel safely. All in one platform for tourists visiting unfamiliar destinations.
          </p>

          <div className="hero-actions">
            <Link className="primary-cta" to="/planner">Plan My Trip</Link>
            <Link className="secondary-cta" to="/adventure-prep">Adventure Prep</Link>
            <Link className="secondary-cta" to="/emergency-sos">Emergency SOS</Link>
          </div>

          <ul className="hero-stats">
            <li><strong>Smart Planner</strong><span>Optimized routes</span></li>
            <li><strong>Safety First</strong><span>Alerts & SOS</span></li>
            <li><strong>Local Insights</strong><span>Hidden gems</span></li>
          </ul>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="hero-visual-top">
            <span className="hero-visual-label">AI-optimized route</span>
            <span className="hero-live"><span className="hero-live-dot" /> Ready to plan</span>
          </div>

          <div className="preview-route">
            <span className="preview-line" />
            <div className="preview-stop preview-start">
              <span className="preview-dot" />
              <div><strong>New Delhi</strong><span>Start · 08:00</span></div>
            </div>
            <div className="preview-stop preview-mid">
              <span className="preview-dot" />
              <div><strong>Jaipur</strong><span>Stop 1 · 4h visit</span></div>
            </div>
            <div className="preview-stop preview-end">
              <span className="preview-dot" />
              <div><strong>Udaipur</strong><span>Finish · 18:40</span></div>
            </div>
          </div>

          <div className="preview-stats">
            <div><strong>412 km</strong><span>optimized route</span></div>
            <div><strong>7h 20m</strong><span>drive time</span></div>
            <div><strong>₹4,860</strong><span>est. budget</span></div>
          </div>

          <p className="preview-note"><span aria-hidden="true">✦</span> Reordered 3 stops to save 48 min</p>
        </div>
      </section>

      <section className="how-it-works" id="how-it-works" aria-labelledby="how-heading">
        <div className="section-heading">
          <div>
            <p className="section-kicker">How it works</p>
            <h2 id="how-heading">Three steps to a better route</h2>
          </div>
          <p className="section-note">No account needed. Saved trips stay in your browser.</p>
        </div>

        <ol className="steps-grid">
          <li>
            <span className="step-index">01</span>
            <h3>Add your stops</h3>
            <p>Pick a start, a finish, and every place you want to see along the way.</p>
          </li>
          <li>
            <span className="step-index">02</span>
            <h3>Let AI help</h3>
            <p>Describe the trip in your own words and get stop, pace, and transport suggestions.</p>
          </li>
          <li>
            <span className="step-index">03</span>
            <h3>Plan and go</h3>
            <p>Optimize the order, review day-by-day plans, estimate the budget, and export.</p>
          </li>
        </ol>
      </section>

      <section className="how-it-works" aria-labelledby="tools-heading">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Explore the platform</p>
            <h2 id="tools-heading">Everything for a safer journey</h2>
          </div>
          <p className="section-note">Open any tool from the navigation bar at any time.</p>
        </div>

        <ol className="steps-grid">
          <li>
            <span className="step-index">✦</span>
            <h3><Link to="/planner">Trip Planner</Link></h3>
            <p>Build a multi-stop route, let AI suggest stops, and optimize the order.</p>
          </li>
          <li>
            <span className="step-index">⛰</span>
            <h3><Link to="/adventure-prep">Adventure Prep</Link></h3>
            <p>Generate an activity-specific gear checklist and a quick weather outlook.</p>
          </li>
          <li>
            <span className="step-index">◎</span>
            <h3><Link to="/discover-places">Discover Places</Link></h3>
            <p>Share hidden gems, browse community picks, and read tourist reviews.</p>
          </li>
          <li>
            <span className="step-index">!</span>
            <h3><Link to="/safety-alerts">Safety &amp; Alerts</Link></h3>
            <p>Check safety zones, active alerts, and live place opening status.</p>
          </li>
          <li>
            <span className="step-index">✚</span>
            <h3><Link to="/emergency-sos">Emergency SOS</Link></h3>
            <p>Trigger an SOS with your location and reach emergency contacts fast.</p>
          </li>
          <li>
            <span className="step-index">▣</span>
            <h3><Link to="/saved-trips">Saved Trips</Link></h3>
            <p>Keep up to ten plans on this device and reopen them later.</p>
          </li>
        </ol>
      </section>
    </main>
  );
}

export default HomePage;
