import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import HomePage from './pages/HomePage.jsx';
import PlannerPage from './pages/PlannerPage.jsx';
import AdventurePrepPage from './pages/AdventurePrepPage.jsx';
import DiscoverPlacesPage from './pages/DiscoverPlacesPage.jsx';
import DestinationDetailsPage from './pages/DestinationDetailsPage.jsx';
import SafetyAlertsPage from './pages/SafetyAlertsPage.jsx';
import EmergencySosPage from './pages/EmergencySosPage.jsx';
import SavedTripsPage from './pages/SavedTripsPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import NearMePage from './pages/NearMePage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import WishlistPage from './pages/WishlistPage.jsx';
import TravelHistoryPage from './pages/TravelHistoryPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import PackingPage from './pages/PackingPage.jsx';
import './App.css';

function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/planner" element={<ProtectedRoute><PlannerPage /></ProtectedRoute>} />
        <Route path="/adventure-prep" element={<ProtectedRoute><AdventurePrepPage /></ProtectedRoute>} />
        <Route path="/discover-places" element={<ProtectedRoute><DiscoverPlacesPage /></ProtectedRoute>} />
        <Route path="/discover-places/:slug" element={<ProtectedRoute><DestinationDetailsPage /></ProtectedRoute>} />
        <Route path="/near-me" element={<ProtectedRoute><NearMePage /></ProtectedRoute>} />
        <Route path="/safety-alerts" element={<ProtectedRoute><SafetyAlertsPage /></ProtectedRoute>} />
        <Route path="/emergency-sos" element={<ProtectedRoute><EmergencySosPage /></ProtectedRoute>} />
        <Route path="/saved-trips" element={<ProtectedRoute><SavedTripsPage /></ProtectedRoute>} />
        <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
        <Route path="/travel-history" element={<ProtectedRoute><TravelHistoryPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/packing" element={<ProtectedRoute><PackingPage /></ProtectedRoute>} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
