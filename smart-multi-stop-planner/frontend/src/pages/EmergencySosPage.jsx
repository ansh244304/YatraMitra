import { useState } from 'react';
import '../Pages.css';

const initialContacts = [
  { id: 1, name: 'Police', number: '100' },
  { id: 2, name: 'Emergency helpline', number: '112' },
  { id: 3, name: 'Tourist helpline', number: '1363' },
];

function EmergencySosPage() {
  const [sosActive, setSosActive] = useState(false);
  const [sosLocation, setSosLocation] = useState(null);
  const [sosMessage, setSosMessage] = useState('');
  const [locating, setLocating] = useState(false);
  const [contacts, setContacts] = useState(initialContacts);
  const [contactName, setContactName] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const triggerSOS = () => {
    setSosActive(true);
    setSosMessage('Emergency alert triggered. Stay calm and contact the nearest service.');
    setSosLocation(null);

    if (!navigator.geolocation) {
      setSosLocation({ lat: 'Unavailable', lng: 'Unavailable' });
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setSosLocation({
          lat: position.coords.latitude.toFixed(5),
          lng: position.coords.longitude.toFixed(5),
        });
        setLocating(false);
      },
      () => {
        setSosLocation({ lat: 'Permission denied', lng: 'Permission denied' });
        setLocating(false);
      },
      { timeout: 10000 }
    );
  };

  const cancelSOS = () => {
    setSosActive(false);
    setSosLocation(null);
    setSosMessage('');
    setLocating(false);
  };

  const addContact = (event) => {
    event.preventDefault();
    if (!contactName.trim() || !contactNumber.trim()) return;
    setContacts((current) => [
      ...current,
      { id: Date.now(), name: contactName.trim(), number: contactNumber.trim() },
    ]);
    setContactName('');
    setContactNumber('');
  };

  const removeContact = (id) => {
    setContacts((current) => current.filter((contact) => contact.id !== id));
  };

  return (
    <main className="main-content">
      <div className="page-heading">
        <div>
          <p className="section-kicker">Emergency SOS</p>
          <h1>Help, fast when you need it</h1>
          <p>
            Trigger an SOS to share your current coordinates with people around you and reach
            emergency services quickly.
          </p>
        </div>
      </div>

      <section className="planner-card" aria-labelledby="sos-heading">
        <div className="card-heading">
          <div>
            <p className="section-kicker">Step 1 · Raise the alarm</p>
            <h2 id="sos-heading">Emergency trigger</h2>
            <p>Your browser may ask for location permission when you trigger an SOS.</p>
          </div>
          <span className={`pill ${sosActive ? 'pill-red' : 'pill-green'}`}>
            {sosActive ? 'SOS active' : 'Standby'}
          </span>
        </div>

        <div className="sos-panel">
          <button
            type="button"
            className={`sos-button ${sosActive ? 'is-active' : ''}`}
            onClick={sosActive ? cancelSOS : triggerSOS}
          >
            {sosActive ? 'Cancel SOS' : 'SOS · Send alert'}
          </button>

          {sosMessage && <p className="sos-message" role="alert">{sosMessage}</p>}

          {sosActive && (
            <p className="helper-text" role="status">
              {locating
                ? 'Locating you…'
                : sosLocation
                  ? `Location: ${sosLocation.lat}, ${sosLocation.lng}`
                  : 'Waiting for location…'}
            </p>
          )}
        </div>

        <p className="helper-text">
          This page does not contact emergency services on its own. Use the phone links below
          and share your coordinates with responders.
        </p>
      </section>

      <section className="planner-card" aria-labelledby="contacts-heading">
        <div className="card-heading">
          <div>
            <p className="section-kicker">Step 2 · Reach someone</p>
            <h2 id="contacts-heading">Emergency contacts</h2>
            <p>Tap a number to call. You can add your own contacts for this session.</p>
          </div>
        </div>

        <ul className="contact-list">
          {contacts.map((contact) => (
            <li className="contact-card" key={contact.id}>
              <div>
                <strong>{contact.name}</strong>
                <p className="helper-text">{contact.number}</p>
              </div>
              <div className="form-actions">
                <a href={`tel:${contact.number}`}>Call</a>
                <button type="button" className="remove-button" onClick={() => removeContact(contact.id)}>
                  Remove
                </button>
              </div>
            </li>
          ))}
        </ul>

        <form className="stack" onSubmit={addContact}>
          <div className="inline-fields">
            <div className="form-group">
              <label htmlFor="contactName">Contact name</label>
              <input
                id="contactName"
                type="text"
                value={contactName}
                onChange={(event) => setContactName(event.target.value)}
                placeholder="e.g. Local guide"
              />
            </div>
            <div className="form-group">
              <label htmlFor="contactNumber">Phone number</label>
              <input
                id="contactNumber"
                type="tel"
                value={contactNumber}
                onChange={(event) => setContactNumber(event.target.value)}
                placeholder="+91 98765 43210"
              />
            </div>
          </div>
          <div className="form-actions">
            <button type="submit" className="small-primary-button">Add contact</button>
          </div>
        </form>
      </section>
    </main>
  );
}

export default EmergencySosPage;
