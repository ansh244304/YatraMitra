import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <main className="main-content">
      <section className="planner-card" aria-labelledby="not-found-heading">
        <div className="card-heading">
          <div>
            <p className="section-kicker">Page not found</p>
            <h2 id="not-found-heading">This route does not exist</h2>
            <p>The page you requested is not part of Yatra Mitra.</p>
          </div>
          <Link className="nav-cta" to="/">Back home</Link>
        </div>
        <p>
          Try the <Link to="/planner">trip planner</Link>, or pick another tool from the
          navigation bar.
        </p>
      </section>
    </main>
  );
}

export default NotFoundPage;
