
import MapView from '../MapView.jsx';
import { useEffect, useState } from 'react';
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { destinationsApi, planTripAI, tripsApi } from '../api/client';
import '../App.css';

function PlannerPage() {
  const [stopInput, setStopInput] = useState('');
  const [stops, setStops] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [routeComparison, setRouteComparison] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState('');
  const [stopResolutionResults, setStopResolutionResults] = useState({});
  const [stopResolutionLoading, setStopResolutionLoading] = useState({});
  const [stopResolutionErrors, setStopResolutionErrors] = useState({});

  const [editingStopId, setEditingStopId] = useState(null);
  const [editedStopName, setEditedStopName] = useState('');

  const [startLocation, setStartLocation] = useState('');
  const [finalDestination, setFinalDestination] = useState('');

  const [finalSearchResults, setFinalSearchResults] = useState([]);
  const [selectedStartPlace, setSelectedStartPlace] = useState(null);
  const [selectedFinalPlace, setSelectedFinalPlace] = useState(null);
  const [startSearchResults, setStartSearchResults] = useState([]);

  const [tripPreference, setTripPreference] = useState('time');
  const [transportMode, setTransportMode] = useState('car');
  const [transitDirectionsUrl, setTransitDirectionsUrl] = useState('');
  const [aiTripBrief, setAiTripBrief] = useState('');
  const [aiInterests, setAiInterests] = useState('culture, local food, scenic places');
  const [aiBudget, setAiBudget] = useState('moderate');
  const [aiPace, setAiPace] = useState('balanced');
  const [aiTripDurationDays, setAiTripDurationDays] = useState('1');
  const [voiceLanguage, setVoiceLanguage] = useState('en-IN');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiPlan, setAiPlan] = useState(null);
  const [voiceListening, setVoiceListening] = useState(false);
  const [aiStatus, setAiStatus] = useState('');

  const [routeData, setRouteData] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [routeError, setRouteError] = useState('');
  const [departureDateTime, setDepartureDateTime] = useState('');
  const [stopDurations, setStopDurations] = useState({});
  const [maxDrivingHoursPerDay, setMaxDrivingHoursPerDay] = useState('6');
  const [overnightStays, setOvernightStays] = useState({});
  const [overnightStayNotes, setOvernightStayNotes] = useState({});
  const [overnightLoading, setOvernightLoading] = useState({});
  const [overnightErrors, setOvernightErrors] = useState({});
  const [attractionPreference, setAttractionPreference] = useState('all');
  const [attractionsByStop, setAttractionsByStop] = useState({});
  const [attractionLoading, setAttractionLoading] = useState({});
  const [attractionErrors, setAttractionErrors] = useState({});
  const [addingAttractionId, setAddingAttractionId] = useState(null);
  const [exportError, setExportError] = useState('');
  const [savedTrips, setSavedTrips] = useState([]);
  const [saveTripMessage, setSaveTripMessage] = useState('');

  async function refreshSavedTrips() {
    try {
      const data = await tripsApi.list();
      setSavedTrips(Array.isArray(data.trips) ? data.trips : []);
    } catch { setSavedTrips([]); }
  }

  useEffect(() => { refreshSavedTrips(); }, []);


  // Editable assumptions for the trip budget estimator (amounts in INR).
  const [fuelEfficiency, setFuelEfficiency] = useState('15');
  const [fuelPricePerLitre, setFuelPricePerLitre] = useState('100');
  const [accommodationPerNight, setAccommodationPerNight] = useState('2000');
  const [foodPerPersonPerDay, setFoodPerPersonPerDay] = useState('600');
  const [estimatedTolls, setEstimatedTolls] = useState('0');
  const [estimatedTransportFares, setEstimatedTransportFares] = useState('0');
  const [estimatedTripDays, setEstimatedTripDays] = useState('1');
  const [travellerCount, setTravellerCount] = useState('2');


  async function saveCurrentTrip() {
    if ((!routeData && !transitDirectionsUrl) || !selectedStartPlace || !selectedFinalPlace) {
      setSaveTripMessage('Plan a complete trip before saving it.');
      return;
    }
    const tripName = `${selectedStartPlace.name} → ${selectedFinalPlace.name}`;
    const snapshot = {
      name: tripName,
      savedAt: new Date().toISOString(),
      startLocation, finalDestination, selectedStartPlace, selectedFinalPlace, stops,
      tripPreference, transportMode, transitDirectionsUrl, aiTripBrief, aiPlan,
      aiBudget, aiPace, aiTripDurationDays, voiceLanguage, aiInterests,
      routeData, routeComparison, departureDateTime, stopDurations, maxDrivingHoursPerDay,
      overnightStays, attractionsByStop, attractionPreference,
      fuelEfficiency, fuelPricePerLitre, accommodationPerNight, foodPerPersonPerDay,
      estimatedTolls, estimatedTransportFares, estimatedTripDays, travellerCount,
    };
    try {
      await tripsApi.create(snapshot);
      await refreshSavedTrips();
      setSaveTripMessage('Trip saved to your account.');
    } catch (err) {
      setSaveTripMessage(err.message || 'Could not save this trip.');
    }
  }
  function loadSavedTrip(trip) {
    setStartLocation(trip.startLocation ?? trip.selectedStartPlace?.label ?? '');
    setFinalDestination(trip.finalDestination ?? trip.selectedFinalPlace?.label ?? '');
    setSelectedStartPlace(trip.selectedStartPlace ?? null);
    setSelectedFinalPlace(trip.selectedFinalPlace ?? null);
    setStops(Array.isArray(trip.stops) ? trip.stops : []);
    setTripPreference(trip.tripPreference ?? 'time');
    setTransportMode(trip.transportMode ?? 'car');
    setTransitDirectionsUrl(trip.transitDirectionsUrl ?? '');
    setAiTripBrief(trip.aiTripBrief ?? '');
    setAiPlan(trip.aiPlan ?? null);
    setAiBudget(trip.aiBudget ?? 'moderate');
    setAiPace(trip.aiPace ?? 'balanced');
    setAiTripDurationDays(trip.aiTripDurationDays ?? '1');
    setVoiceLanguage(trip.voiceLanguage ?? 'en-IN');
    setAiInterests(trip.aiInterests ?? 'culture, local food, scenic places');
    setRouteData(trip.routeData ?? null);
    setRouteComparison(trip.routeComparison ?? null);
    setDepartureDateTime(trip.departureDateTime ?? '');
    setStopDurations(trip.stopDurations ?? {});
    setMaxDrivingHoursPerDay(trip.maxDrivingHoursPerDay ?? '6');
    setOvernightStays(trip.overnightStays ?? {});
    setAttractionsByStop(trip.attractionsByStop ?? {});
    setAttractionPreference(trip.attractionPreference ?? 'all');
    setFuelEfficiency(trip.fuelEfficiency ?? '15');
    setFuelPricePerLitre(trip.fuelPricePerLitre ?? '100');
    setAccommodationPerNight(trip.accommodationPerNight ?? '2000');
    setFoodPerPersonPerDay(trip.foodPerPersonPerDay ?? '600');
    setEstimatedTolls(trip.estimatedTolls ?? '0');
    setEstimatedTransportFares(trip.estimatedTransportFares ?? '0');
    setEstimatedTripDays(trip.estimatedTripDays ?? '1');
    setTravellerCount(trip.travellerCount ?? '2');
    setRouteError('');
    setExportError('');
    setSaveTripMessage(`Loaded "${trip.name}".`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  useEffect(() => {
    let pendingId = null;
    try { pendingId = window.sessionStorage.getItem('yatra-mitra-open-trip'); } catch {}
    if (!pendingId) return;
    window.sessionStorage.removeItem('yatra-mitra-open-trip');
    (async () => {
      try {
        const data = await tripsApi.list();
        const trips = Array.isArray(data.trips) ? data.trips : [];
        setSavedTrips(trips);
        const trip = trips.find((item) => item.id === pendingId);
        if (trip) loadSavedTrip(trip);
      } catch {
        setSaveTripMessage('Could not open the selected saved trip.');
      }
    })();
    // Runs once on mount to honour a trip opened from the Saved Trips page.
  }, []);

  async function deleteSavedTrip(tripId) {
    try {
      await tripsApi.remove(tripId);
      setSavedTrips((prev) => prev.filter((trip) => trip.id !== tripId));
      setSaveTripMessage('Saved trip removed.');
    } catch (err) {
      setSaveTripMessage(err.message || 'Could not delete trip.');
    }
  }

  function exportTripFile() {
    if ((!routeData && !transitDirectionsUrl) || !selectedStartPlace || !selectedFinalPlace) {
      setSaveTripMessage('Plan a complete trip before exporting a share file.');
      return;
    }

    const tripSnapshot = {
      id: `shared-${Date.now()}`,
      name: `${selectedStartPlace.name} → ${selectedFinalPlace.name}`,
      savedAt: new Date().toISOString(),
      startLocation,
      finalDestination,
      selectedStartPlace,
      selectedFinalPlace,
      stops,
      tripPreference,
      transportMode,
      transitDirectionsUrl,
      aiTripBrief,
      aiPlan,
      aiBudget,
      aiPace,
      aiTripDurationDays,
      voiceLanguage,
      aiInterests,
      routeData,
      routeComparison,
      departureDateTime,
      stopDurations,
      maxDrivingHoursPerDay,
      overnightStays,
      attractionsByStop,
      attractionPreference,
      fuelEfficiency,
      fuelPricePerLitre,
      accommodationPerNight,
      foodPerPersonPerDay,
      estimatedTolls,
      estimatedTransportFares,
      estimatedTripDays,
      travellerCount,
    };

    const sharePackage = {
      format: 'jyatra-mitra-trip',
      version: 1,
      exportedAt: new Date().toISOString(),
      trip: tripSnapshot,
    };

    try {
      const blob = new Blob([JSON.stringify(sharePackage, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const safeName = tripSnapshot.name
        .replace(/[^\w -]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .slice(0, 70) || 'jyatra-mitra-trip';
      link.href = url;
      link.download = `${safeName}.jyatra-trip.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setSaveTripMessage('Share file downloaded. Send the .json file to your travel companions.');
    } catch {
      setSaveTripMessage('Could not export the trip file in this browser.');
    }
  }

  async function importTripFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const raw = await file.text();
      const packageData = JSON.parse(raw);
      const importedTrip = packageData?.trip;

      if (
        packageData?.format !== 'jyatra-mitra-trip' ||
        packageData?.version !== 1 ||
        !importedTrip ||
        !importedTrip.selectedStartPlace ||
        !importedTrip.selectedFinalPlace ||
        !Array.isArray(importedTrip.stops)
      ) {
        throw new Error('This file is not a supported Yatra Mitra trip.');
      }

      const normalizedTrip = {
        ...importedTrip,
        id: `imported-${Date.now()}`,
        savedAt: new Date().toISOString(),
        name: importedTrip.name ||
          `${importedTrip.selectedStartPlace.name || 'Start'} → ${importedTrip.selectedFinalPlace.name || 'Finish'}`,
      };

      loadSavedTrip(normalizedTrip);

      const nextTrips = [
        normalizedTrip,
        ...savedTrips.filter((trip) => trip.name !== normalizedTrip.name),
      ].slice(0, 10);

      try {
        window.localStorage.setItem('yatra-mitra-saved-trips', JSON.stringify(nextTrips));
        setSavedTrips(nextTrips);
        setSaveTripMessage(`Imported "${normalizedTrip.name}" and saved it on this device.`);
      } catch {
        setSaveTripMessage(`Imported "${normalizedTrip.name}" for this session, but browser storage could not save it.`);
      }
    } catch (error) {
      setSaveTripMessage(error.message || 'Could not import this trip file. Check that it is a valid Yatra Mitra export.');
    } finally {
      event.target.value = '';
    }
  }

  function normalizeAiTransportMode(mode, fallback = 'car') {
    const validModes = ['car', 'motorcycle', 'scooter', 'bicycle', 'walking', 'train', 'metro', 'bus', 'flight', 'transit'];
    if (typeof mode !== 'string' || !mode.trim()) {
      return fallback === 'ai_choose' ? 'car' : fallback;
    }

    const cleaned = mode.trim().toLowerCase().replace(/[\s-]+/g, '_');
    const aliases = {
      driving: 'car',
      drive: 'car',
      automobile: 'car',
      motorbike: 'motorcycle',
      cycling: 'bicycle',
      bike: 'bicycle',
      walk: 'walking',
      foot: 'walking',
      rail: 'train',
      railway: 'train',
      subway: 'metro',
      underground: 'metro',
      plane: 'flight',
      airplane: 'flight',
      air: 'flight',
      public_transport: 'transit',
      publictransport: 'transit',
    };

    if (validModes.includes(cleaned)) return cleaned;
    if (aliases[cleaned]) return aliases[cleaned];
    return fallback === 'ai_choose' ? 'car' : fallback;
  }

  async function generateAiPlan() {
    setAiError('');
    setAiStatus('');
    setAiPlan(null);

    if (!selectedStartPlace || !selectedFinalPlace) {
      setAiError('First search for and select your starting location and final destination.');
      return;
    }

    if (!aiTripBrief.trim()) {
      setAiError('Describe the trip you want. You can type it or use voice input.');
      return;
    }

    setAiLoading(true);
    try {
      const data = await planTripAI({
        origin: selectedStartPlace.label,
        destination: selectedFinalPlace.label,
        existingStops: stops.map((stop) => stop.name),
        userRequest: aiTripBrief.trim(),
        preferences: {
          transportMode,
          routePreference: tripPreference,
          budget: aiBudget,
          pace: aiPace,
          interests: aiInterests.split(',').map((item) => item.trim()).filter(Boolean),
          departureDateTime,
          travellerCount: Number(travellerCount) || 1,
          maxHoursPerDay: Number(maxDrivingHoursPerDay) || 6,
          tripDurationDays: Math.max(1, Math.min(60, Number(aiTripDurationDays) || 1)),
        },
      });

      if (!data.plan || typeof data.plan !== 'object') {
        throw new Error('The AI response was incomplete. Please try a more specific trip description.');
      }

      const plan = {
        ...data.plan,
        suggestedStops: Array.isArray(data.plan.suggestedStops) ? data.plan.suggestedStops : [],
        transportMode: normalizeAiTransportMode(data.plan.transportMode, transportMode),
      };

      setAiPlan(plan);
      setAiStatus('Your AI trip brief is ready. Review the suggestions, then apply the plan to calculate the route.');
    } catch (error) {
      setAiError(error.message || 'Could not generate an AI plan.');
    } finally {
      setAiLoading(false);
    }
  }

  async function applyAiPlan() {
    if (!aiPlan) return;
    setAiError('');
    setAiStatus('Resolving suggested places and calculating your route…');
    setRouteError('');

    try {
      const currentStops = [...stops];
      const nextMode = normalizeAiTransportMode(aiPlan.transportMode, transportMode);
      const seenNames = new Set(currentStops.map((stop) => stop.name.trim().toLowerCase()));
      const suggestedStops = [];
      const suggestionsToResolve = nextMode === 'flight' ? [] : (aiPlan.suggestedStops || []).slice(0, 8);

      for (const suggestion of suggestionsToResolve) {
        const query = typeof suggestion === 'string' ? suggestion : suggestion.name;
        if (!query || seenNames.has(query.trim().toLowerCase())) continue;

        const matches = await fetchPlaces(query);
        if (!matches.length) continue;

        // Geocoding provides a real map point, but the user can still edit the
        // resulting stop if the top match is not the intended place.
        const match = matches[0];
        suggestedStops.push({
          id: crypto.randomUUID(),
          name: match.name,
          label: match.label,
          lat: match.lat,
          lon: match.lon,
          aiSuggested: true,
        });
        seenNames.add(query.trim().toLowerCase());
      }

      const combinedStops = [...currentStops, ...suggestedStops].slice(0, 10);
      const validPreferences = [
        'time', 'distance', 'balanced', 'scenic', 'low_cost', 'fewer_transfers',
        'less_walking', 'eco_friendly', 'avoid_tolls', 'avoid_highways',
        'accessible', 'family_friendly', 'manual',
      ];
      const nextPreference = validPreferences.includes(aiPlan.routePreference)
        ? aiPlan.routePreference
        : tripPreference;

      setStops(combinedStops);
      setTripPreference(nextPreference);
      setTransportMode(nextMode);

      const dailyTargetByPace = { relaxed: '4', balanced: '6', packed: '8' };
      setMaxDrivingHoursPerDay(dailyTargetByPace[aiPlan.pace] || '6');
      setEstimatedTripDays(String(Math.max(1, Math.min(60, Number(aiTripDurationDays) || 1))));

      const budgetPresets = {
        low: { accommodation: '1000', food: '300' },
        moderate: { accommodation: '2000', food: '600' },
        comfortable: { accommodation: '4000', food: '1000' },
        premium: { accommodation: '8000', food: '2000' },
      };
      const budgetPreset = budgetPresets[aiBudget];
      if (budgetPreset) {
        setAccommodationPerNight(budgetPreset.accommodation);
        setFoodPerPersonPerDay(budgetPreset.food);
      }

      if (Number.isFinite(Number(aiPlan.stopDurationMinutes))) {
        setStopDurations((current) => {
          const updated = { ...current };
          suggestedStops.forEach((stop) => {
            updated[stop.id] = Math.max(0, Math.min(480, Number(aiPlan.stopDurationMinutes)));
          });
          return updated;
        });
      }

      if (nextMode === 'flight' && aiPlan.suggestedStops?.length) {
        setAiStatus('Flight search covers origin to destination. Suggested sightseeing places remain recommendations rather than flight waypoints.');
      }

      setAiStatus(
        nextMode === 'flight'
          ? 'Prepared a flight search for the origin and destination. Suggested sightseeing places are not flight waypoints.'
          : suggestedStops.length
            ? `Added ${suggestedStops.length} mapped AI suggestion(s). Check the stop list for correct place matches.`
            : currentStops.length
              ? 'Using your existing stops; no extra stops were needed.'
              : 'Planning a direct journey with no intermediate stops.'
      );

      await planTrip(combinedStops, {
        transportMode: nextMode,
        tripPreference: nextPreference,
      });
    } catch (error) {
      setAiError(error.message || 'Could not apply the AI plan.');
      setAiStatus('');
    }
  }

  function startVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setAiError('Voice input is not supported in this browser. Type your trip description instead.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = voiceLanguage;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onstart = () => {
      setVoiceListening(true);
      setAiError('');
    };
    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || '';
      setAiTripBrief((current) => `${current}${current.trim() ? ' ' : ''}${transcript}`.trim());
    };
    recognition.onerror = () => {
      setAiError('Voice capture did not work. Check microphone permission or type your request.');
    };
    recognition.onend = () => setVoiceListening(false);
    try {
      recognition.start();
    } catch {
      setVoiceListening(false);
      setAiError('Voice input could not start. Try again or type your request.');
    }
  }

  const externalTransportModes = ['train', 'metro', 'bus', 'transit', 'flight'];
  const unresolvedStops = stops.filter((stop) => stop.lat == null || stop.lon == null);
  const tripLocationCount =
    (startLocation.trim() ? 1 : 0) + stops.length + (finalDestination.trim() ? 1 : 0);
  const locationsReady =
    Boolean(selectedStartPlace && selectedFinalPlace) && unresolvedStops.length === 0;

  function googleMapsDirectionsUrl(mode = transportMode, places = null) {
    const tripPlaces = places || [selectedStartPlace, ...stops, selectedFinalPlace];
    if (!tripPlaces?.[0] || !tripPlaces?.[tripPlaces.length - 1]) return '';

    const modeMap = {
      car: 'driving',
      motorcycle: 'two-wheeler',
      scooter: 'two-wheeler',
      bicycle: 'bicycling',
      walking: 'walking',
      train: 'transit',
      metro: 'transit',
      bus: 'transit',
      transit: 'transit',
    };
    const origin = tripPlaces[0];
    const destination = tripPlaces[tripPlaces.length - 1];
    const params = new URLSearchParams({
      api: '1',
      origin: origin.label || origin.name,
      destination: destination.label || destination.name,
      travelmode: modeMap[mode] || 'driving',
    });
    const waypoints = tripPlaces.slice(1, -1)
      .map((place) => place.label || place.name)
      .filter(Boolean);
    if (waypoints.length && !['train', 'metro', 'bus', 'transit'].includes(mode)) {
      params.set('waypoints', waypoints.join('|'));
    }
    return `https://www.google.com/maps/dir/?${params.toString()}`;
  }

  function flightSearchUrl(origin = selectedStartPlace, destination = selectedFinalPlace) {
    if (!origin || !destination) return '';
    const from = origin.label || origin.name;
    const to = destination.label || destination.name;
    return `https://www.google.com/travel/flights?q=${encodeURIComponent(`Flights from ${from} to ${to}`)}`;
  }

  function modeSpecificSearchUrl(mode, origin, destination) {
    if (!origin || !destination) return '';
    const from = origin.label || origin.name;
    const to = destination.label || destination.name;
    const phrase = { train: 'train', metro: 'metro', bus: 'bus' }[mode] || 'public transport';
    return `https://www.google.com/search?q=${encodeURIComponent(`${phrase} options from ${from} to ${to}`)}`;
  }

  async function fetchPlaces(query) {
    const response = await fetch(
      `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=5`
    );

    if (!response.ok) {
      throw new Error('Place search failed.');
    }

    const data = await response.json();

    return data.features.map((feature, index) => {
      const [lon, lat] = feature.geometry.coordinates;
      const properties = feature.properties;

      const name =
        properties.name ||
        properties.street ||
        properties.city ||
        'Unnamed place';

      const label =
        properties.label ||
        [
          name,
          properties.city,
          properties.state,
          properties.country,
        ]
          .filter(Boolean)
          .join(', ');

      return {
        id: `${lat}-${lon}-${index}`,
        name,
        label,
        lat,
        lon,
      };
    });
  }

  async function searchPlaces() {
    const query = stopInput.trim();

    if (!query) {
      setSearchError('Please enter a place name first.');
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    setSearchError('');
    setSearchResults([]);

    try {
      const places = await fetchPlaces(query);
      setSearchResults(places);

      if (places.length === 0) {
        setSearchError('No matching places found. Try another name.');
      }
    } catch {
      setSearchError('Could not search for places. Please try again later.');
    } finally {
      setSearchLoading(false);
    }
  }

  async function searchExistingStop(stop) {
    setStopResolutionLoading((current) => ({ ...current, [stop.id]: true }));
    setStopResolutionErrors((current) => ({ ...current, [stop.id]: '' }));
    setStopResolutionResults((current) => ({ ...current, [stop.id]: [] }));
    try {
      const places = await fetchPlaces(stop.name);
      setStopResolutionResults((current) => ({ ...current, [stop.id]: places }));
      if (places.length === 0) {
        setStopResolutionErrors((current) => ({
          ...current,
          [stop.id]: 'No matching places found. Edit the stop name and search again.',
        }));
      }
    } catch (error) {
      setStopResolutionErrors((current) => ({
        ...current,
        [stop.id]: error.message || 'Could not search for this stop. Please try again.',
      }));
    } finally {
      setStopResolutionLoading((current) => ({ ...current, [stop.id]: false }));
    }
  }

  function selectStopLocation(stopId, place) {
    setStops((current) =>
      current.map((stop) =>
        stop.id === stopId
          ? { ...stop, name: place.name, lat: place.lat, lon: place.lon }
          : stop
      )
    );
    setStopResolutionResults((current) => ({ ...current, [stopId]: [] }));
    setStopResolutionErrors((current) => ({ ...current, [stopId]: '' }));
    setRouteError('');
  }


  async function searchStartPlace() {
    const query = startLocation.trim();

    if (!query) {
      setSearchError('Enter a starting location first.');
      return;
    }

    setSearchLoading(true);
    setSearchError('');

    try {
      const places = await fetchPlaces(query);
      setStartSearchResults(places);

      if (places.length === 0) {
        setSearchError('No starting locations found.');
      }
    } catch {
      setSearchError('Could not search for the starting location.');
    } finally {
      setSearchLoading(false);
    }
  }

  async function searchFinalPlace() {
    const query = finalDestination.trim();

    if (!query) {
      setSearchError('Enter a final destination first.');
      return;
    }

    setSearchLoading(true);
    setSearchError('');

    try {
      const places = await fetchPlaces(query);
      setFinalSearchResults(places);

      if (places.length === 0) {
        setSearchError('No final destinations found.');
      }
    } catch {
      setSearchError('Could not search for the final destination.');
    } finally {
      setSearchLoading(false);
    }
  }




  // Add a new intermediate stop
  function addStop(event) {
    event.preventDefault();

    const name = stopInput.trim();

    if (!name) return;

    const newStop = {
      id: crypto.randomUUID(),
      name: selectedPlace?.label === name ? selectedPlace.name : name,
      lat: selectedPlace?.label === name ? selectedPlace.lat : null,
      lon: selectedPlace?.label === name ? selectedPlace.lon : null,
    };

    setStops((currentStops) => [...currentStops, newStop]);
    setStopDurations((current) => ({ ...current, [newStop.id]: 60 }));
    setStopInput('');
    setSelectedPlace(null);
    setSearchResults([]);
    setSearchError('');
  }

  // Remove a stop
  function removeStop(id) {
    setStops((currentStops) =>
      currentStops.filter((stop) => stop.id !== id)
    );
    setStopDurations((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });

    if (editingStopId === id) {
      setEditingStopId(null);
      setEditedStopName('');
    }
  }


  function clearAllStops() {
    const confirmed = window.confirm(
      'Are you sure you want to remove all intermediate stops?'
    );

    if (!confirmed) return;

    setStops([]);
    setStopDurations({});
    setEditingStopId(null);
    setEditedStopName('');
  }



  function moveStop(index, direction) {
    setStops((currentStops) => {
      const newStops = [...currentStops];
      const newIndex = index + direction;

      // Don't move a stop outside the list
      if (newIndex < 0 || newIndex >= newStops.length) {
        return currentStops;
      }

      // Swap the two stops
      [newStops[index], newStops[newIndex]] = [
        newStops[newIndex],
        newStops[index],
      ];

      return newStops;
    });
  }


  // Start editing a selected stop
  function startEditingStop(stop) {
    setEditingStopId(stop.id);
    setEditedStopName(stop.name);
  }

  // Save the edited stop name
  function saveEditedStop(id) {
    const name = editedStopName.trim();

    if (!name) {
      alert('Stop name cannot be empty.');
      return;
    }

    setStops((currentStops) =>
      currentStops.map((stop) =>
        stop.id === id
          ? { ...stop, name, ...(stop.name === name ? {} : { lat: null, lon: null }) }
          : stop
      )
    );

    setEditingStopId(null);
    setEditedStopName('');
  }

  // Cancel editing without saving
  function cancelEditingStop() {
    setEditingStopId(null);
    setEditedStopName('');
  }


async function planTrip(stopsToPlan = stops, options = {}) {
  const activeTransportMode = options.transportMode ?? transportMode;
  const activeTripPreference = options.tripPreference ?? tripPreference;

  if (!selectedStartPlace || !selectedFinalPlace) {
    setRouteError('Please select your starting location and final destination.');
    return;
  }

  const unresolvedStopsToPlan = stopsToPlan.filter((stop) => stop.lat == null || stop.lon == null);
  if (unresolvedStopsToPlan.length > 0) {
    const names = unresolvedStopsToPlan.map((stop) => stop.name).join(', ');
    setRouteError(`Choose a map search result for these intermediate stops: ${names}.`);
    return;
  }
  if (activeTransportMode === 'ai_choose') {
    setRouteError('Generate and apply an AI plan first so the AI can choose a concrete transport mode.');
    return;
  }

  if (stopsToPlan.length > 10) {
    setRouteError('The first version supports up to 10 intermediate stops.');
    return;
  }

  setRouteLoading(true);
  setRouteError('');
  setRouteData(null);
  setRouteComparison(null);
  setTransitDirectionsUrl('');

  try {
    const originalStops = [...stopsToPlan];
    let orderedStops = [...originalStops];
    let comparison = null;

    if (externalTransportModes.includes(activeTransportMode)) {
      const externalUrl = activeTransportMode === 'flight'
        ? flightSearchUrl(selectedStartPlace, selectedFinalPlace)
        : googleMapsDirectionsUrl('transit', [selectedStartPlace, selectedFinalPlace]);
      setStops(originalStops);
      setTransitDirectionsUrl(externalUrl);
      setRouteData(null);
      setRouteComparison(null);
      return;
    }

    // Public OpenStreetMap routing servers provide separate car, bike, and foot graphs.
    // Motorcycle/scooter currently use the car-compatible graph as an approximation.
    const routingBase = activeTransportMode === 'bicycle'
      ? 'https://routing.openstreetmap.de/routed-bike'
      : activeTransportMode === 'walking'
        ? 'https://routing.openstreetmap.de/routed-foot'
        : 'https://router.project-osrm.org';
    let needsPublicRouterPause = false;

    // Optimize automatically unless the user chose manual order.
    if (activeTripPreference !== 'manual' && originalStops.length > 1) {
      const places = [
        selectedStartPlace,
        ...originalStops,
        selectedFinalPlace,
      ];

      const coordinates = places
        .map((place) => `${place.lon},${place.lat}`)
        .join(';');

      const tableResponse = await fetch(
        `${routingBase}/table/v1/driving/${coordinates}?annotations=distance,duration`
      );

      if (!tableResponse.ok) {
        throw new Error('Could not retrieve road travel costs.');
      }

      const table = await tableResponse.json();
      needsPublicRouterPause = ['bicycle', 'walking'].includes(activeTransportMode);

      if (
        table.code !== 'Ok' ||
        !table.distances ||
        !table.durations
      ) {
        throw new Error('The routing service could not compare your stops.');
      }

      const maxDuration = Math.max(1, ...table.durations.flat().filter(Number.isFinite));
      const maxDistance = Math.max(1, ...table.distances.flat().filter(Number.isFinite));
      const distanceBiasedPreferences = ['distance', 'low_cost', 'scenic', 'avoid_tolls', 'eco_friendly'];
      const matrix = activeTripPreference === 'balanced'
        ? table.durations.map((row, rowIndex) => row.map((duration, columnIndex) => {
            const distance = table.distances[rowIndex][columnIndex];
            if (!Number.isFinite(duration) || !Number.isFinite(distance)) return Infinity;
            return (duration / maxDuration) + (distance / maxDistance);
          }))
        : distanceBiasedPreferences.includes(activeTripPreference)
          ? table.distances
          : table.durations;

      const originalOrder = [
        0,
        ...originalStops.map((_, index) => index + 1),
        places.length - 1,
      ];

      function totalCost(order) {
        let total = 0;

        for (let i = 0; i < order.length - 1; i++) {
          const cost = matrix[order[i]][order[i + 1]];

          if (!Number.isFinite(cost)) return Infinity;

          total += cost;
        }

        return total;
      }

      // Start with a nearest-neighbor order.
      const remaining = new Set(
        originalStops.map((_, index) => index + 1)
      );

      const candidate = [0];
      let current = 0;

      while (remaining.size > 0) {
        let nextStop = null;
        let lowestCost = Infinity;

        for (const index of remaining) {
          const cost = matrix[current][index];

          if (Number.isFinite(cost) && cost < lowestCost) {
            lowestCost = cost;
            nextStop = index;
          }
        }

        if (nextStop === null) {
          throw new Error('Some stops could not be connected by road.');
        }

        candidate.push(nextStop);
        remaining.delete(nextStop);
        current = nextStop;
      }

      candidate.push(places.length - 1);

      // Improve the order using 2-opt.
      let improved = true;

      while (improved) {
        improved = false;

        for (let i = 1; i < candidate.length - 2; i++) {
          for (let j = i + 1; j < candidate.length - 1; j++) {
            const trial = [...candidate];

            const reversed = trial
              .slice(i, j + 1)
              .reverse();

            trial.splice(i, reversed.length, ...reversed);

            if (totalCost(trial) < totalCost(candidate) - 0.001) {
              candidate.splice(0, candidate.length, ...trial);
              improved = true;
            }
          }
        }
      }

      // Never replace the original order with a worse result.
      const chosenOrder =
        totalCost(candidate) < totalCost(originalOrder)
          ? candidate
          : originalOrder;

      orderedStops = chosenOrder
        .slice(1, -1)
        .map((index) => originalStops[index - 1]);

      comparison = {
        originalDistance: totalCostForOrder(originalOrder, table.distances),
        plannedDistance: totalCostForOrder(chosenOrder, table.distances),
        originalDuration: totalCostForOrder(originalOrder, table.durations),
        plannedDuration: totalCostForOrder(chosenOrder, table.durations),
      };
    }

    // Calculate the final road route for the chosen order.
    const finalPlaces = [
      selectedStartPlace,
      ...orderedStops,
      selectedFinalPlace,
    ];

    const routeCoordinates = finalPlaces
      .map((place) => `${place.lon},${place.lat}`)
      .join(';');

    // The public FOSSGIS bike/foot routers request at most one call per second.
    if (needsPublicRouterPause) {
      await new Promise((resolve) => setTimeout(resolve, 1100));
    }

    const routeResponse = await fetch(
      `${routingBase}/route/v1/driving/${routeCoordinates}?overview=full&geometries=geojson&steps=true`
    );

    if (!routeResponse.ok) {
      throw new Error('Could not calculate the final road route.');
    }

    const route = await routeResponse.json();

    if (route.code !== 'Ok' || !route.routes?.length) {
      throw new Error('No complete driving route was found.');
    }

    // Update the planner and map together after success.
    setStops(orderedStops);
    setRouteData(route.routes[0]);
    setRouteComparison(comparison);
  } catch (error) {
    setRouteError(
      error.message || 'Trip planning failed. Please try again.'
    );
  } finally {
    setRouteLoading(false);
  }
}

function totalCostForOrder(order, matrix) {
  let total = 0;

  for (let i = 0; i < order.length - 1; i++) {
    const cost = matrix[order[i]][order[i + 1]];

    if (!Number.isFinite(cost)) return Infinity;

    total += cost;
  }

  return total;
}

function formatDuration(seconds) {
  const totalMinutes = Math.round(seconds / 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours} h ${minutes} min` : `${minutes} min`;
}

function formatDistance(meters) {
  return meters >= 1000
    ? `${(meters / 1000).toFixed(1)} km`
    : `${Math.round(meters)} m`;
}

function getManeuverInstruction(step, destinationName) {
  const maneuver = step.maneuver || {};
  const type = maneuver.type || 'continue';
  const modifier = maneuver.modifier ? ` ${maneuver.modifier}` : '';
  const road = step.name ? ` onto ${step.name}` : '';

  switch (type) {
    case 'depart':
      return `Start${step.name ? ` on ${step.name}` : ''}`;
    case 'arrive':
      return `Arrive at ${destinationName}`;
    case 'turn':
      return `Turn${modifier}${road}`;
    case 'continue':
      return `Continue${modifier || ' straight'}${step.name ? ` on ${step.name}` : ''}`;
    case 'new name':
      return `Continue${step.name ? ` onto ${step.name}` : ''}`;
    case 'merge':
      return `Merge${modifier}${road}`;
    case 'fork':
      return `Keep${modifier}${road}`;
    case 'end of road':
      return `At the end of the road, turn${modifier}${road}`;
    case 'roundabout':
    case 'rotary':
      return `Enter the roundabout${maneuver.exit ? ` and take exit ${maneuver.exit}` : ''}${road}`;
    case 'exit roundabout':
      return `Exit the roundabout${road}`;
    case 'roundabout turn':
      return `At the roundabout, turn${modifier}${road}`;
    case 'notification':
      return `Continue${step.name ? ` on ${step.name}` : ''}`;
    default:
      return `${type.charAt(0).toUpperCase()}${type.slice(1)}${modifier}${road}`;
  }
}

  async function findOvernightStays(stop) {
    if (!stop || !Number.isFinite(stop.lat) || !Number.isFinite(stop.lon)) return;

    setOvernightLoading((current) => ({ ...current, [stop.id]: true }));
    setOvernightErrors((current) => ({ ...current, [stop.id]: '' }));
    setOvernightStays((current) => ({ ...current, [stop.id]: [] }));
    setOvernightStayNotes((current) => ({ ...current, [stop.id]: '' }));

    try {
      const data = await destinationsApi.nearbyHotels({
        lat: stop.lat,
        lon: stop.lon,
        name: stop.name,
        radius: 5,
      });
      const results = Array.isArray(data.hotels) ? data.hotels : [];
      setOvernightStays((current) => ({ ...current, [stop.id]: results }));
      setOvernightStayNotes((current) => ({
        ...current,
        [stop.id]: `${results.length} mapped stays within ${data.area?.radiusKm || 5} km. ${data.note || ''}`.trim(),
      }));
      if (results.length === 0) {
        setOvernightErrors((current) => ({
          ...current,
          [stop.id]: 'No mapped hotels or guest houses were found nearby. Try searching a nearby town manually.',
        }));
      }
    } catch (error) {
      setOvernightErrors((current) => ({
        ...current,
        [stop.id]: error.message || 'Could not search for nearby accommodation.',
      }));
    } finally {
      setOvernightLoading((current) => ({ ...current, [stop.id]: false }));
    }
  }

  async function findNearbyAttractions(stop) {
    if (!stop || !Number.isFinite(stop.lat) || !Number.isFinite(stop.lon)) return;

    setAttractionLoading((current) => ({ ...current, [stop.id]: true }));
    setAttractionErrors((current) => ({ ...current, [stop.id]: '' }));

    try {
      const query = `[out:json][timeout:25];(node(around:7000,${stop.lat},${stop.lon})["tourism"~"^(attraction|museum|gallery|viewpoint|zoo|theme_park|aquarium|artwork)$"];way(around:7000,${stop.lat},${stop.lon})["tourism"~"^(attraction|museum|gallery|viewpoint|zoo|theme_park|aquarium|artwork)$"];relation(around:7000,${stop.lat},${stop.lon})["tourism"~"^(attraction|museum|gallery|viewpoint|zoo|theme_park|aquarium|artwork)$"];node(around:7000,${stop.lat},${stop.lon})["historic"];way(around:7000,${stop.lat},${stop.lon})["historic"];relation(around:7000,${stop.lat},${stop.lon})["historic"];node(around:7000,${stop.lat},${stop.lon})["leisure"="park"];way(around:7000,${stop.lat},${stop.lon})["leisure"="park"];relation(around:7000,${stop.lat},${stop.lon})["leisure"="park"];node(around:7000,${stop.lat},${stop.lon})["natural"~"^(waterfall|beach|peak|cave)$"];way(around:7000,${stop.lat},${stop.lon})["natural"~"^(waterfall|beach|peak|cave)$"];relation(around:7000,${stop.lat},${stop.lon})["natural"~"^(waterfall|beach|peak|cave)$"];);out center tags 60;`;
      const response = await fetch(
        `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
      );
      if (!response.ok) throw new Error('Attraction search is temporarily unavailable. Please try again.');

      const data = await response.json();
      const results = (data.elements || []).map((item) => {
        const tags = item.tags || {};
        const lat = item.lat ?? item.center?.lat;
        const lon = item.lon ?? item.center?.lon;
        const rawType = tags.tourism || tags.historic || tags.leisure || tags.natural || 'attraction';
        const address = [tags['addr:street'], tags['addr:city']].filter(Boolean).join(', ');
        const category = tags.historic ? 'culture' :
          (['museum', 'gallery', 'artwork'].includes(tags.tourism) ? 'culture' :
          (['zoo', 'theme_park', 'aquarium'].includes(tags.tourism) ? 'family' :
          (tags.leisure === 'park' || ['beach', 'waterfall', 'peak', 'cave', 'viewpoint'].includes(rawType) ? 'nature' :
          (['attraction'].includes(tags.tourism) ? 'family' : 'all'))));
        return {
          id: `${item.type}-${item.id}`,
          name: tags.name || tags.brand || rawType.replaceAll('_', ' '),
          type: rawType.replaceAll('_', ' '),
          category,
          address,
          lat,
          lon,
          mapUrl: `https://www.openstreetmap.org/${item.type}/${item.id}`,
        };
      }).filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lon) && item.name);

      const uniqueResults = results
        .filter((item, index, all) => all.findIndex((candidate) => candidate.id === item.id) === index)
        .sort((a, b) => {
          const distance = (place) => {
            const latDiff = (place.lat - stop.lat) * 111;
            const lonDiff = (place.lon - stop.lon) * 111 * Math.cos(stop.lat * Math.PI / 180);
            return Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
          };
          return distance(a) - distance(b);
        })
        .slice(0, 8);

      // Estimate the added road cost for each candidate, using OSRM and the next planned stop.
      const stopIndex = stops.findIndex((item) => item.id === stop.id);
      const nextPlace = stopIndex >= 0 && stopIndex < stops.length - 1
        ? stops[stopIndex + 1]
        : selectedFinalPlace;
      const baselineLeg = stopIndex >= 0 ? routeData?.legs?.[stopIndex + 1] : null;
      const enrichedResults = await Promise.all(uniqueResults.map(async (attraction) => {
        const visitMinutes = estimateVisitMinutes(attraction);
        let detourDistance = 0;
        let detourSeconds = 0;
        let detourSource = 'approximate';
        if (nextPlace && Number.isFinite(nextPlace.lat) && Number.isFinite(nextPlace.lon) && baselineLeg) {
          try {
            const coords = [stop, attraction, nextPlace].map((place) => `${place.lon},${place.lat}`).join(';');
            const routeResponse = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=false&steps=false`);
            const routeResult = await routeResponse.json();
            if (routeResponse.ok && routeResult.code === 'Ok' && routeResult.routes?.length) {
              const candidateRoute = routeResult.routes[0];
              detourDistance = Math.max(0, candidateRoute.distance - baselineLeg.distance);
              detourSeconds = Math.max(0, candidateRoute.duration - baselineLeg.duration);
              detourSource = 'road-route estimate';
            }
          } catch {
            // Keep a clearly labelled fallback estimate if the public routing service is unavailable.
          }
        }
        if (detourSource === 'approximate') {
          const latDelta = (attraction.lat - stop.lat) * 111;
          const lonDelta = (attraction.lon - stop.lon) * 111 * Math.cos(stop.lat * Math.PI / 180);
          detourDistance = Math.hypot(latDelta, lonDelta) * 2000;
          detourSeconds = detourDistance > 0 ? (detourDistance / 1000 / 35) * 3600 : 0;
        }
        const detourMinutes = Math.round(detourSeconds / 60);
        const currentMileage = Math.max(0, Number(fuelEfficiency) || 0);
        const currentFuelPrice = Math.max(0, Number(fuelPricePerLitre) || 0);
        const detourFuelCost = currentMileage > 0
          ? (detourDistance / 1000 / currentMileage) * currentFuelPrice
          : 0;
        const day = dayPlan.find((item) => item.legs.some((leg) => leg.stopId === stop.id));
        const availableMinutes = day
          ? Math.floor(Math.max(0, Number(maxDrivingHoursPerDay) * 3600 - day.drivingSeconds - day.visitSeconds) / 60)
          : null;
        const fitsDay = availableMinutes == null ? null : detourMinutes + visitMinutes <= availableMinutes;
        const proximityBonus = Math.max(0, 15 - Math.round(Math.hypot((attraction.lat - stop.lat) * 111, (attraction.lon - stop.lon) * 111 * Math.cos(stop.lat * Math.PI / 180))));
        const score = Math.max(0, Math.min(100, Math.round(70 + proximityBonus * 0.7 - detourMinutes * 1.8 - visitMinutes * 0.12 + (fitsDay === true ? 15 : fitsDay === false ? -25 : 0))));
        return { ...attraction, nearStopId: stop.id, visitMinutes, detourDistance, detourSeconds, detourMinutes, detourFuelCost, detourSource, availableMinutes, fitsDay, score };
      }));
      enrichedResults.sort((a, b) => b.score - a.score);

      setAttractionsByStop((current) => ({ ...current, [stop.id]: enrichedResults }));
      if (enrichedResults.length === 0) {
        setAttractionErrors((current) => ({
          ...current,
          [stop.id]: 'No mapped attractions were found within 7 km of this stop.',
        }));
      }
    } catch (error) {
      setAttractionErrors((current) => ({
        ...current,
        [stop.id]: error.message || 'Could not search for nearby attractions.',
      }));
    } finally {
      setAttractionLoading((current) => ({ ...current, [stop.id]: false }));
    }
  }

  function attractionsForStop(stopId) {
    const attractions = attractionsByStop[stopId] || [];
    if (attractionPreference === 'all') return attractions;
    return attractions.filter((attraction) => attraction.category === attractionPreference || attraction.category === 'all');
  }

  function estimateVisitMinutes(attraction) {
    if (attraction.category === 'culture') return 75;
    if (attraction.category === 'family') return 90;
    if (attraction.category === 'nature') return 45;
    return 60;
  }

  function getAttractionDayFit(attraction) {
    if (!routeData || !dayPlan.length) return { fits: null, remainingMinutes: null };
    const stopIndex = stops.findIndex((stop) => stop.id === attraction.nearStopId);
    if (stopIndex < 0) return { fits: null, remainingMinutes: null };
    const day = dayPlan.find((item) => item.legs.some((leg) => leg.stopId === attraction.nearStopId));
    if (!day) return { fits: null, remainingMinutes: null };
    const dailyLimitSeconds = Number(maxDrivingHoursPerDay) * 3600;
    const remainingMinutes = Math.floor(Math.max(0, dailyLimitSeconds - day.drivingSeconds - day.visitSeconds) / 60);
    const neededMinutes = (Number(attraction.detourMinutes) || 0) + (Number(attraction.visitMinutes) || estimateVisitMinutes(attraction));
    return { fits: neededMinutes <= remainingMinutes, remainingMinutes };
  }

  async function addAttractionToItinerary(attraction) {
    const nearStopIndex = stops.findIndex((stop) => stop.id === attraction.nearStopId);
    if (nearStopIndex < 0) return;
    if (stops.some((stop) => stop.attractionSourceId === attraction.id)) {
      setAttractionErrors((current) => ({ ...current, [attraction.nearStopId]: 'This attraction is already in your itinerary.' }));
      return;
    }
    if (stops.length >= 10) {
      setAttractionErrors((current) => ({ ...current, [attraction.nearStopId]: 'The current planner supports up to 10 intermediate stops.' }));
      return;
    }
    const addedStop = {
      id: crypto.randomUUID(),
      name: attraction.name,
      lat: attraction.lat,
      lon: attraction.lon,
      attractionSourceId: attraction.id,
    };
    const nextStops = [...stops];
    nextStops.splice(nearStopIndex + 1, 0, addedStop);
    const nextDurations = { ...stopDurations, [addedStop.id]: attraction.visitMinutes || estimateVisitMinutes(attraction) };
    setAddingAttractionId(attraction.id);
    setStops(nextStops);
    setStopDurations(nextDurations);
    setAttractionErrors((current) => ({ ...current, [attraction.nearStopId]: '' }));
    try {
      await planTrip(nextStops);
    } finally {
      setAddingAttractionId(null);
    }
  }

  // Split the planned route into days without breaking a driving leg between stops.
  const dayPlan = [];
  if (routeData?.legs?.length) {
    const dailyDrivingLimit = Number(maxDrivingHoursPerDay) * 3600;
    let currentDay = { day: 1, legs: [], drivingSeconds: 0, visitSeconds: 0 };

    routeData.legs.forEach((leg, index) => {
      if (
        currentDay.legs.length > 0 &&
        currentDay.drivingSeconds + leg.duration > dailyDrivingLimit
      ) {
        dayPlan.push(currentDay);
        currentDay = {
          day: dayPlan.length + 1,
          legs: [],
          drivingSeconds: 0,
          visitSeconds: 0,
        };
      }

      const from = index === 0 ? selectedStartPlace?.name : stops[index - 1]?.name;
      const to = index === stops.length ? selectedFinalPlace?.name : stops[index]?.name;
      const stop = index < stops.length ? stops[index] : null;
      const visitSeconds = stop ? (Number(stopDurations[stop.id]) || 0) * 60 : 0;

      currentDay.legs.push({
        index,
        from: from || 'Previous location',
        to: to || 'Next location',
        drivingSeconds: leg.duration,
        visitSeconds,
        stopName: stop?.name || null,
        stopId: stop?.id || null,
      });
      currentDay.drivingSeconds += leg.duration;
      currentDay.visitSeconds += visitSeconds;
    });

    if (currentDay.legs.length > 0) dayPlan.push(currentDay);
  }

  // Estimates are based on user-editable assumptions, not live prices.
  const distanceKm = routeData ? routeData.distance / 1000 : 0;
  const safeFuelEfficiency = Math.max(0, Number(fuelEfficiency) || 0);
  const safeFuelPrice = Math.max(0, Number(fuelPricePerLitre) || 0);
  const safeAccommodation = Math.max(0, Number(accommodationPerNight) || 0);
  const safeFoodCost = Math.max(0, Number(foodPerPersonPerDay) || 0);
  const safeTolls = Math.max(0, Number(estimatedTolls) || 0);
  const safeTransportFares = Math.max(0, Number(estimatedTransportFares) || 0);
  const safeTravellerCount = Math.max(1, Math.floor(Number(travellerCount) || 1));
  const usesFuel = ['car', 'motorcycle', 'scooter'].includes(transportMode);
  const estimatedFuelLitres = usesFuel && safeFuelEfficiency > 0 ? distanceKm / safeFuelEfficiency : 0;
  const estimatedFuelCost = estimatedFuelLitres * safeFuelPrice;
  const budgetDayCount = routeData ? Math.max(1, dayPlan.length) : Math.max(1, Math.floor(Number(estimatedTripDays) || 1));
  const overnightCount = Math.max(0, budgetDayCount - 1);
  const estimatedAccommodationCost = overnightCount * safeAccommodation;
  const estimatedFoodCost = budgetDayCount * safeFoodCost * safeTravellerCount;
  const estimatedTripCost = estimatedFuelCost + estimatedAccommodationCost + estimatedFoodCost + safeTolls + safeTransportFares;
  const BUDGET_COLORS = ['#6366f1','#22c55e','#f59e0b','#ef4444','#06b6d4'];
  const budgetChartData = [
    { name: usesFuel ? 'Fuel' : 'Tickets/Fares', value: usesFuel ? estimatedFuelCost : safeTransportFares },
    { name: 'Accommodation', value: estimatedAccommodationCost },
    { name: 'Food', value: estimatedFoodCost },
    { name: 'Tolls/Other', value: safeTolls },
  ].filter(d => d.value > 0);

  const transportModeLabel = ({
    ai_choose: 'AI chooses the best mode',
    car: 'Car',
    motorcycle: 'Motorcycle',
    scooter: 'Scooter',
    bicycle: 'Bicycle',
    walking: 'Walking',
    train: 'Railway train',
    metro: 'Metro',
    bus: 'Bus',
    flight: 'Plane / flight',
    transit: 'Public transport',
  })[transportMode] || 'Car';

  const routePreferenceLabel = ({
    time: 'Fastest / less travel time',
    distance: 'Shortest distance',
    balanced: 'Balanced time and distance',
    scenic: 'Scenic places and experiences',
    low_cost: 'Budget-conscious',
    fewer_transfers: 'Fewer public-transport transfers',
    less_walking: 'Less walking between connections',
    eco_friendly: 'Lower-impact travel',
    avoid_tolls: 'Avoid tolls where supported',
    avoid_highways: 'Avoid highways where supported',
    accessible: 'Accessibility-aware',
    family_friendly: 'Family-friendly pace and stops',
    manual: 'Keep my stop order',
  })[tripPreference] || 'Balanced';

  const externalLegPlaces = selectedStartPlace && selectedFinalPlace
    ? (transportMode === 'flight'
        ? [selectedStartPlace, selectedFinalPlace]
        : [selectedStartPlace, ...stops, selectedFinalPlace])
    : [];
  const externalLegLinks = externalTransportModes.includes(transportMode) && transportMode !== 'flight'
    ? externalLegPlaces.slice(0, -1).map((from, index) => {
        const to = externalLegPlaces[index + 1];
        return {
          from,
          to,
          directionsUrl: googleMapsDirectionsUrl('transit', [from, to]),
          searchUrl: modeSpecificSearchUrl(transportMode, from, to),
        };
      })
    : [];

  function exportTripAsPdf() {
    setExportError('');
    if (!selectedStartPlace || !selectedFinalPlace) {
      setExportError('Select your start and final destination first.');
      return;
    }

    if (!routeData && transitDirectionsUrl) {
      const printWindow = window.open('', '_blank', 'width=1000,height=800');
      if (!printWindow) {
        setExportError('Your browser blocked the report window. Allow pop-ups for this site, then export again.');
        return;
      }
      const escapeTransitHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
      })[character]);
      const locations = transportMode === 'flight' ? [selectedStartPlace, selectedFinalPlace] : [selectedStartPlace, ...stops, selectedFinalPlace];
      printWindow.document.open();
      printWindow.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Yatra Mitra external-route itinerary</title>
        <style>body{font:16px/1.6 Arial,sans-serif;max-width:760px;margin:40px auto;padding:0 24px;color:#20243a}h1{margin-bottom:4px}li{margin:8px 0}.note{padding:14px;background:#f1f5ff;border-radius:12px}a{color:#4d3bd0}</style>
        </head><body><h1>Yatra Mitra</h1><p>${escapeTransitHtml(transportModeLabel)} itinerary</p>
        <p><strong>Start:</strong> ${escapeTransitHtml(selectedStartPlace.name)}</p>
        <p><strong>Finish:</strong> ${escapeTransitHtml(selectedFinalPlace.name)}</p>
        <p><strong>Route priority:</strong> ${escapeTransitHtml(routePreferenceLabel)}</p>
        <h2>Planned locations</h2><ol>${locations.map((place) => `<li>${escapeTransitHtml(place.name || place.label)}</li>`).join('')}</ol>
        <h2>Estimated budget</h2>
        <ul>
          <li>Tickets / fares (your estimate): ₹${Math.round(safeTransportFares).toLocaleString('en-IN')}</li>
          <li>Accommodation: ₹${Math.round(estimatedAccommodationCost).toLocaleString('en-IN')}</li>
          <li>Food: ₹${Math.round(estimatedFoodCost).toLocaleString('en-IN')}</li>
          <li>Other/tolls estimate: ₹${Math.round(safeTolls).toLocaleString('en-IN')}</li>
          <li><strong>Estimated total: ₹${Math.round(estimatedTripCost).toLocaleString('en-IN')}</strong></li>
          <li>Estimated cost per person: ₹${Math.round(estimatedTripCost / safeTravellerCount).toLocaleString('en-IN')}</li>
        </ul>
        <div class="note"><strong>External route lookup:</strong> This app does not retrieve live transit timetables, fares, flight availability, or ticket prices. Use the link below to check current options before travelling.<p><a href="${escapeTransitHtml(transitDirectionsUrl)}">Open ${escapeTransitHtml(transportModeLabel)} route search</a></p></div>
        <p>Planned trip length: ${budgetDayCount} day(s). Check departure times, service disruptions, fares, and transfer details with the transport provider.</p>
        <script>window.onload=()=>setTimeout(()=>window.print(),300)</script></body></html>`);
      printWindow.document.close();
      return;
    }

    if (!routeData) {
      setExportError('Plan a complete trip before exporting your itinerary.');
      return;
    }

    const printWindow = window.open('', '_blank', 'width=1000,height=800');
    if (!printWindow) {
      setExportError('Your browser blocked the report window. Allow pop-ups for this site, then export again.');
      return;
    }

    const escapeHtml = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[character]);
    const money = (value) => `₹${Math.round(value).toLocaleString('en-IN')}`;
    const departureLabel = departureDateTime
      ? new Date(departureDateTime).toLocaleString()
      : 'Not specified';

    const stopList = stops.map((stop) => `
      <li><strong>${escapeHtml(stop.name)}</strong> — planned visit: ${escapeHtml(formatDuration((Number(stopDurations[stop.id]) || 0) * 60))}</li>
    `).join('');

    const daysHtml = dayPlan.map((day) => `
      <section class="day avoid-break">
        <h3>Day ${day.day}</h3>
        <p class="muted">Travel: ${escapeHtml(formatDuration(day.drivingSeconds))} · Visits: ${escapeHtml(formatDuration(day.visitSeconds))} · Total planned: ${escapeHtml(formatDuration(day.drivingSeconds + day.visitSeconds))}</p>
        <ol>${day.legs.map((item) => `
          <li><strong>${escapeHtml(item.from)} → ${escapeHtml(item.to)}</strong> — ${escapeHtml(formatDuration(item.drivingSeconds))} driving${item.stopName ? `<br>Visit time at ${escapeHtml(item.stopName)}: ${escapeHtml(formatDuration(item.visitSeconds))}` : ''}</li>
        `).join('')}</ol>
      </section>
    `).join('');

    const directionsHtml = routeData.legs.map((leg, index) => {
      const from = index === 0 ? selectedStartPlace.name : stops[index - 1]?.name || 'Previous location';
      const to = index === stops.length ? selectedFinalPlace.name : stops[index]?.name || 'Next location';
      const steps = leg.steps || [];
      const instructions = steps.length
        ? `<ol>${steps.map((step) => `<li>${escapeHtml(getManeuverInstruction(step, to))}${step.ref ? ` (${escapeHtml(step.ref)})` : ''} <span class="muted">— ${escapeHtml(formatDistance(step.distance))}, ${escapeHtml(formatDuration(step.duration))}</span></li>`).join('')}</ol>`
        : '<p class="muted">Detailed maneuver instructions are unavailable for this leg.</p>';
      return `<section class="leg avoid-break"><h3>${index + 1}. ${escapeHtml(from)} → ${escapeHtml(to)}</h3><p class="muted">${escapeHtml(formatDistance(leg.distance))} · ${escapeHtml(formatDuration(leg.duration))} estimated travel</p>${instructions}</section>`;
    }).join('');

    const accommodationHtml = Object.entries(overnightStays).map(([stopId, stays]) => {
      const stop = stops.find((item) => item.id === stopId);
      if (!stop || !stays?.length) return '';
      return `<section class="avoid-break"><h3>Overnight options near ${escapeHtml(stop.name)}</h3><ul>${stays.map((stay) => `<li><strong>${escapeHtml(stay.name)}</strong> (${escapeHtml(stay.type)})${stay.address ? ` — ${escapeHtml(stay.address)}` : ''}<br><a href="${escapeHtml(stay.mapUrl)}">View map listing</a></li>`).join('')}</ul><p class="muted">Listings are sourced from OpenStreetMap; availability, prices, safety, and quality are not verified.</p></section>`;
    }).join('');

    const attractionHtml = Object.entries(attractionsByStop).map(([stopId, attractions]) => {
      const stop = stops.find((item) => item.id === stopId);
      if (!stop || !attractions?.length) return '';
      const savedAttractions = attractions.filter((attraction) => attractionPreference === 'all' || attraction.category === attractionPreference || attraction.category === 'all').slice(0, 8);
      if (!savedAttractions.length) return '';
      return `<section class="avoid-break"><h3>Places to explore near ${escapeHtml(stop.name)}</h3><ul>${savedAttractions.map((attraction) => `<li><strong>${escapeHtml(attraction.name)}</strong> — ${escapeHtml(attraction.type)}${attraction.address ? `; ${escapeHtml(attraction.address)}` : ''}<br><a href="${escapeHtml(attraction.mapUrl)}">View map listing</a></li>`).join('')}</ul></section>`;
    }).join('');

    const html = `<!doctype html>
      <html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      <title>Yatra Mitra — Trip Itinerary</title>
      <style>
        @page { size: A4; margin: 16mm; }
        * { box-sizing: border-box; }
        body { font: 11pt/1.5 Arial, Helvetica, sans-serif; color: #172033; max-width: 900px; margin: 0 auto; }
        h1 { font-size: 25pt; margin: 0 0 4px; } h2 { font-size: 16pt; border-bottom: 1px solid #d6dce5; padding-bottom: 5px; margin-top: 24px; }
        h3 { font-size: 12pt; margin: 12px 0 4px; } p { margin: 4px 0 8px; } ul, ol { padding-left: 22px; } li { margin: 4px 0; }
        .subtitle, .muted { color: #586477; } .hero { border-bottom: 3px solid #172033; padding-bottom: 14px; margin-bottom: 18px; }
        .stats { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 8px; margin: 14px 0; }
        .stat, .day, .leg, .budget { border: 1px solid #d6dce5; border-radius: 8px; padding: 10px 12px; }
        .budget-row { display:flex; justify-content:space-between; gap:16px; border-bottom:1px solid #e7ebf0; padding:6px 0; }
        .budget-row:last-child { border-bottom:0; } .total { font-weight:700; } .day, .leg { margin: 10px 0; }
        .avoid-break { break-inside: avoid; page-break-inside: avoid; } a { color: #174ea6; overflow-wrap: anywhere; }
        .footnote { margin-top: 24px; border-top: 1px solid #d6dce5; padding-top: 8px; font-size: 9pt; color: #586477; }
        @media screen { body { padding: 24px; } .print-hint { background:#f2f5f9; padding:10px; margin-bottom:16px; } }
      </style></head><body>
      <div class="print-hint">Use your browser's print dialog and choose <strong>Save as PDF</strong> to save or share this itinerary.</div>
      <header class="hero"><h1>Yatra Mitra</h1><p class="subtitle">Your trip itinerary</p>
        <p><strong>Start:</strong> ${escapeHtml(selectedStartPlace.name)}</p><p><strong>Final destination:</strong> ${escapeHtml(selectedFinalPlace.name)}</p>
        <p><strong>Planned departure:</strong> ${escapeHtml(departureLabel)}</p><p><strong>Transport mode:</strong> ${escapeHtml(transportModeLabel)}</p><p><strong>Route preference:</strong> ${escapeHtml(routePreferenceLabel)}</p>
      </header>
      <h2>Journey overview</h2><div class="stats">
        <div class="stat"><strong>Total route distance</strong><br>${(routeData.distance / 1000).toFixed(1)} km</div>
        <div class="stat"><strong>Estimated travel time</strong><br>${escapeHtml(formatDuration(routeData.duration))}</div>
        <div class="stat"><strong>Planned visit time</strong><br>${escapeHtml(formatDuration(stops.reduce((total, stop) => total + (Number(stopDurations[stop.id]) || 0) * 60, 0)))}</div>
        <div class="stat"><strong>Planned days</strong><br>${dayPlan.length}</div>
      </div>
      <h2>Stops</h2><ol>${stopList}</ol>
      <h2>Day-wise schedule</h2>${daysHtml || '<p>No day-wise schedule is available.</p>'}
      <h2>Turn-by-turn directions</h2>${directionsHtml}
      ${accommodationHtml ? `<h2>Saved overnight options</h2>${accommodationHtml}` : ''}
      ${attractionHtml ? `<h2>Places to explore</h2>${attractionHtml}<p class="muted">OpenStreetMap listings are not verified for opening hours, ticket prices, accessibility, or safety.</p>` : ''}
      <h2>Estimated budget</h2><div class="budget">
        <div class="budget-row"><span>Fuel (${usesFuel ? `${estimatedFuelLitres.toFixed(1)} litres` : 'not applicable'})</span><strong>${usesFuel ? money(estimatedFuelCost) : 'Not applicable'}</strong></div>
        ${externalTransportModes.includes(transportMode) ? `<div class="budget-row"><span>Tickets / fares (manual estimate)</span><strong>${money(safeTransportFares)}</strong></div>` : ''}
        <div class="budget-row"><span>Accommodation (${overnightCount} night${overnightCount === 1 ? '' : 's'})</span><strong>${money(estimatedAccommodationCost)}</strong></div>
        <div class="budget-row"><span>Food (${budgetDayCount} day${budgetDayCount === 1 ? '' : 's'})</span><strong>${money(estimatedFoodCost)}</strong></div>
        <div class="budget-row"><span>Tolls (manual estimate)</span><strong>${money(safeTolls)}</strong></div>
        <div class="budget-row total"><span>Estimated trip total</span><strong>${money(estimatedTripCost)}</strong></div>
        <div class="budget-row total"><span>Estimated cost per person (${safeTravellerCount} travellers)</span><strong>${money(estimatedTripCost / safeTravellerCount)}</strong></div>
      </div>
      <p class="footnote">Driving times and arrival estimates are estimates, not live navigation. Budget values are based on your editable assumptions and are not live prices. The day plan groups complete route legs and may exceed the daily target if one leg is longer than the target. Accommodation listings, if included, are not verified for availability, price, safety, or quality.</p>
      </body></html>`;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
    // Wait for the report DOM to be committed before opening the print dialog.
    // Wait for document.write content to render before printing, preventing blank reports.
    window.setTimeout(() => {
      if (!printWindow.closed) {
        printWindow.focus();
        printWindow.print();
      }
    }, 600);
  }

  return (
    <div className="planner-page">
      <main className="main-content">
        <section className="planner-card" id="planner">
          <div className="card-heading">
            <div>
              <p className="section-kicker">Step 01 · Build your route</p>
              <h2>Where are you headed?</h2>
              <p>Add your starting point and every destination you want to visit.</p>
            </div>

            <span className="step-badge">1 of 3</span>
          </div>

          <div className="route-builder">
            <div className="route-endpoint">
              <span className="endpoint-marker start-marker" aria-hidden="true">A</span>
              <div className="endpoint-body">
                <div className="endpoint-label-row">
                  <label htmlFor="start">Starting location</label>
                  <span>Departure</span>
                </div>
                <div className="endpoint-input-row">
                  <input
                    id="start"
                    type="text"
                    placeholder="Where does your journey begin?"
                    value={startLocation}
                    onChange={(event) => {
                      setStartLocation(event.target.value);
                      setSelectedStartPlace(null);
                      setStartSearchResults([]);
                    }}
                  />
                  <button
                    type="button"
                    className="endpoint-search"
                    onClick={searchStartPlace}
                    disabled={searchLoading}
                  >
                    {searchLoading ? 'Searching…' : 'Search'}
                  </button>
                </div>
                {startSearchResults.length > 0 && (
                  <div className="search-results">
                    <p>Choose a matching place:</p>
                    {startSearchResults.map((place) => (
                      <button
                        key={place.id}
                        type="button"
                        className="search-result"
                        onClick={() => {
                          setStartLocation(place.label);
                          setSelectedStartPlace(place);
                          setStartSearchResults([]);
                          setSearchError('');
                        }}
                      >
                        {place.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="endpoint-connector" aria-hidden="true"><span /></div>

            <div className="route-endpoint">
              <span className="endpoint-marker finish-marker" aria-hidden="true">B</span>
              <div className="endpoint-body">
                <div className="endpoint-label-row">
                  <label htmlFor="destination">Final destination</label>
                  <span>Finish</span>
                </div>
                <div className="endpoint-input-row">
                  <input
                    id="destination"
                    type="text"
                    placeholder="Where do you want to finish?"
                    value={finalDestination}
                    onChange={(event) => {
                      setFinalDestination(event.target.value);
                      setSelectedFinalPlace(null);
                      setFinalSearchResults([]);
                    }}
                  />
                  <button
                    type="button"
                    className="endpoint-search"
                    onClick={searchFinalPlace}
                    disabled={searchLoading}
                  >
                    {searchLoading ? 'Searching…' : 'Search'}
                  </button>
                </div>
                {finalSearchResults.length > 0 && (
                  <div className="search-results">
                    <p>Choose a matching place:</p>
                    {finalSearchResults.map((place) => (
                      <button
                        key={place.id}
                        type="button"
                        className="search-result"
                        onClick={() => {
                          setFinalDestination(place.label);
                          setSelectedFinalPlace(place);
                          setFinalSearchResults([]);
                          setSearchError('');
                        }}
                      >
                        {place.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <section className="ai-copilot-card" aria-labelledby="ai-copilot-heading">
            <div className="ai-copilot-heading">
              <div className="ai-orb" aria-hidden="true"><span>✦</span></div>
              <div>
                <p className="ai-eyebrow">Step 02 · AI TRIP COPILOT</p>
                <h2 id="ai-copilot-heading">Describe your ideal journey</h2>
                <p className="helper-text">Tell the planner what matters to you. It will turn your brief into a structured plan, then use map data to resolve places and calculate supported routes.</p>
              </div>
            </div>

            <label htmlFor="aiTripBrief">Your trip brief</label>
            <textarea
              id="aiTripBrief"
              rows={4}
              value={aiTripBrief}
              onChange={(event) => setAiTripBrief(event.target.value)}
              placeholder="Example: Plan a relaxed 3-day trip for 3 people. Compare train vs bus, keep costs moderate, include historic places and local food, avoid too many transfers, and keep each day manageable. Suggest a sensible mode and explain trade-offs."
            />
            <div className="ai-input-actions">
              <button type="button" className="voice-input-button" onClick={startVoiceInput} disabled={voiceListening}>
                {voiceListening ? 'Listening… speak now' : '🎙 Use voice input'}
              </button>
              <label className="voice-language-control" htmlFor="voiceLanguage">
                Voice language
                <select id="voiceLanguage" value={voiceLanguage} onChange={(event) => setVoiceLanguage(event.target.value)}>
                  <option value="en-IN">English (India)</option>
                  <option value="hi-IN">Hindi</option>
                  <option value="en-US">English (US)</option>
                </select>
              </label>
              <span className="helper-text">Voice input depends on browser support and microphone permission. Typed input always works.</span>
            </div>

            <div className="ai-preference-grid">
              <div className="form-group">
                <label htmlFor="transportMode">Transport mode</label>
                <select id="transportMode" value={transportMode} onChange={(event) => {
                  setTransportMode(event.target.value);
                  setRouteData(null);
                  setRouteComparison(null);
                  setTransitDirectionsUrl('');
                  setRouteError('');
                }}>
                  <option value="ai_choose">Let AI choose the best mode</option>
                  <option value="car">Car</option>
                  <option value="motorcycle">Motorcycle</option>
                  <option value="scooter">Scooter</option>
                  <option value="bicycle">Bicycle</option>
                  <option value="walking">Walking</option>
                  <option value="train">Railway train</option>
                  <option value="metro">Metro / subway</option>
                  <option value="bus">Bus / coach</option>
                  <option value="flight">Plane / flight</option>
                  <option value="transit">Any available public transport</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="tripPreference">Route priority</label>
                <select id="tripPreference" value={tripPreference} onChange={(event) => setTripPreference(event.target.value)}>
                  <option value="time">Fastest / less travel time</option>
                  <option value="distance">Shortest distance</option>
                  <option value="balanced">Balanced time + distance</option>
                  <option value="low_cost">Lower estimated cost</option>
                  <option value="scenic">Scenic places and experiences</option>
                  <option value="fewer_transfers">Fewer public-transport transfers</option>
                  <option value="less_walking">Less walking between connections</option>
                  <option value="eco_friendly">Lower-impact / eco-friendly</option>
                  <option value="avoid_tolls">Avoid tolls where supported</option>
                  <option value="avoid_highways">Avoid highways where supported</option>
                  <option value="accessible">Accessibility-aware</option>
                  <option value="family_friendly">Family-friendly pace and stops</option>
                  <option value="manual">Keep my stop order</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="aiBudget">Budget style</label>
                <select id="aiBudget" value={aiBudget} onChange={(event) => setAiBudget(event.target.value)}>
                  <option value="low">Low-cost / budget</option>
                  <option value="moderate">Moderate</option>
                  <option value="comfortable">Comfortable</option>
                  <option value="premium">Premium</option>
                  <option value="flexible">Flexible / not decided</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="aiPace">Travel pace</label>
                <select id="aiPace" value={aiPace} onChange={(event) => setAiPace(event.target.value)}>
                  <option value="relaxed">Relaxed</option>
                  <option value="balanced">Balanced</option>
                  <option value="packed">See as much as possible</option>
                </select>
              </div>
            </div>
            <div className="ai-preference-grid ai-trip-details-grid">
              <div className="form-group">
                <label htmlFor="aiTripDurationDays">Trip duration (days)</label>
                <input id="aiTripDurationDays" type="number" min="1" max="60" value={aiTripDurationDays} onChange={(event) => setAiTripDurationDays(event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="aiDepartureDateTime">Departure date and time</label>
                <input id="aiDepartureDateTime" type="datetime-local" value={departureDateTime} onChange={(event) => setDepartureDateTime(event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="aiTravellerCount">Number of travellers</label>
                <input id="aiTravellerCount" type="number" min="1" max="100" value={travellerCount} onChange={(event) => setTravellerCount(event.target.value)} />
              </div>
              <div className="form-group">
                <label htmlFor="aiDailyHours">Daily travel target</label>
                <select id="aiDailyHours" value={maxDrivingHoursPerDay} onChange={(event) => setMaxDrivingHoursPerDay(event.target.value)}>
                  <option value="4">4 hours</option>
                  <option value="6">6 hours</option>
                  <option value="8">8 hours</option>
                  <option value="10">10 hours</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="aiInterests">Interests (comma-separated)</label>
              <input id="aiInterests" value={aiInterests} onChange={(event) => setAiInterests(event.target.value)} placeholder="history, nature, food, photography" />
            </div>

            <button type="button" className="ai-generate-button" onClick={generateAiPlan} disabled={aiLoading || routeLoading}>
              {aiLoading ? 'Building your AI trip brief…' : '✦ Generate AI trip plan'}
            </button>
            {aiError && <p className="ai-error" role="alert">{aiError}</p>}
            {aiStatus && <p className="ai-status" role="status">{aiStatus}</p>}

            {aiPlan && (
              <div className="ai-plan-preview">
                <div className="ai-plan-title-row">
                  <h3>Your AI proposal</h3>
                  <span className="ai-plan-badge">Review before applying</span>
                </div>
                <p>{aiPlan.summary}</p>
                {aiPlan.suggestedStops?.length > 0 && (
                  <>
                    <h4>Suggested stops</h4>
                    <ol className="ai-suggested-stops">
                      {aiPlan.suggestedStops.map((stop, index) => (
                        <li key={`${typeof stop === 'string' ? stop : stop.name}-${index}`}>
                          <strong>{typeof stop === 'string' ? stop : stop.name}</strong>
                          {typeof stop === 'object' && stop.reason && <span> — {stop.reason}</span>}
                        </li>
                      ))}
                    </ol>
                  </>
                )}
                {aiPlan.notes?.length > 0 && (
                  <div className="ai-notes">
                    <h4>Planning notes</h4>
                    <ul>{aiPlan.notes.map((note, index) => <li key={`${index}-${note}`}>{note}</li>)}</ul>
                  </div>
                )}
                {aiPlan.followUpQuestions?.length > 0 && (
                  <div className="ai-notes">
                    <h4>Things to confirm</h4>
                    <ul>{aiPlan.followUpQuestions.map((question, index) => <li key={`${index}-${question}`}>{question}</li>)}</ul>
                  </div>
                )}
                <p className="helper-text">
                  Proposed mode: <strong>{aiPlan.transportMode}</strong> · Priority: <strong>{aiPlan.routePreference}</strong> · Pace: <strong>{aiPlan.pace}</strong>
                </p>
                <button type="button" className="ai-apply-button" onClick={applyAiPlan} disabled={routeLoading}>
                  Apply AI plan & calculate route
                </button>
              </div>
            )}
          </section>

          <div className="form-group route-guide">
            <strong>Route preference guide</strong>
            <p className="helper-text">
              {tripPreference === 'time' && 'Prioritize shorter estimated travel time where the selected router supports it.'}
              {tripPreference === 'distance' && 'Prioritize shorter total route distance.'}
              {tripPreference === 'balanced' && 'Balance estimated travel time and distance when reordering road-route stops.'}
              {tripPreference === 'scenic' && 'Ask AI to prioritize scenic experiences and worthwhile detours; the road itself is not verified as scenic.'}
              {tripPreference === 'low_cost' && 'Use distance as a rough cost proxy and ask AI for budget-conscious choices. Live fares, tolls, and prices are not included.'}
              {tripPreference === 'fewer_transfers' && 'Prefer fewer public-transport changes where available; verify exact transfers externally.'}
              {tripPreference === 'less_walking' && 'Prefer less walking between connections where provider data supports this.'}
              {tripPreference === 'eco_friendly' && 'Ask AI to favor lower-impact modes such as rail, bus, walking, and cycling when practical.'}
              {tripPreference === 'avoid_tolls' && 'Toll avoidance is an AI planning preference; the public road router does not guarantee toll-free routes.'}
              {tripPreference === 'avoid_highways' && 'Highway avoidance is not enforced by the current public road router; verify with your navigation provider.'}
              {tripPreference === 'accessible' && 'Ask AI to consider accessibility needs, but map coverage can be incomplete and must be verified.'}
              {tripPreference === 'family_friendly' && 'Favor manageable days, family-suitable stops, and realistic visit durations.'}
              {tripPreference === 'manual' && 'Keep your intermediate stops in the order you arranged.'}
            </p>
          </div>

          <div className="stops-heading">
            <div>
              <p className="section-kicker">Step 03 · Shape your itinerary</p>
              <label htmlFor="stopInput">Intermediate stops</label>
            </div>

            <div className="stops-actions">
              <span>{stops.length} added</span>

              {stops.length > 0 && (
                <button
                  type="button"
                  onClick={clearAllStops}
                  className="remove-button"
                >
                  Clear all
                </button>
              )}
            </div>
          </div>


          <form className="stop-form" onSubmit={addStop}>
            <input
              id="stopInput"
              type="text"
              value={stopInput}
              onChange={(event) => {
                setStopInput(event.target.value);
                setSelectedPlace(null);
                setSearchResults([]);
              }}
              placeholder="Enter a place name"
              aria-label="Intermediate stop name"
            />


            <button
              type="button"
              onClick={searchPlaces}
              disabled={searchLoading}
            >
              {searchLoading ? 'Searching...' : 'Search places'}
            </button>

            <button type="submit" className="add-button">
              + Add stop
            </button>
          </form>

          {searchError && (
            <p className="helper-text" role="status">
              {searchError}
            </p>
          )}

          {searchResults.length > 0 && (
            <div className="search-results">
              <p>Choose a matching place:</p>

              {searchResults.map((place) => (

                <button
                  key={place.id}
                  type="button"
                  className="search-result"
                  onClick={() => {
                    setStopInput(place.label);
                    setSelectedPlace(place);
                    setSearchResults([]);
                    setSearchError('');
                  }}
                >
                  {place.label}
                </button>

              ))}
            </div>
          )}


          {stops.length === 0 ? (
            <div className="empty-stops">
              <span className="plus-icon">+</span>
              <p>No intermediate stops yet.</p>
              <span>
                Add the places you want to visit along your journey.
              </span>
            </div>
          ) : (
            <ul className="stops-list">
              {stops.map((stop, index) => (
                <li key={stop.id} className="stop-item">
                  <span className="stop-number">{index + 1}</span>

                  {editingStopId === stop.id ? (
                    <>
                      <input
                        type="text"
                        value={editedStopName}
                        onChange={(event) =>
                          setEditedStopName(event.target.value)
                        }
                        aria-label={`Edit stop ${index + 1}`}
                        autoFocus
                      />

                      <button
                        type="button"
                        onClick={() => saveEditedStop(stop.id)}
                      >
                        Save
                      </button>

                      <button
                        type="button"
                        onClick={cancelEditingStop}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <span className="stop-name">{stop.name}</span>
                    {(stop.lat == null || stop.lon == null) && (
                      <div className="stop-location-resolution">
                        <span className="stop-location-warning">Map location not selected</span>
                        <button
                          type="button"
                          className="small-primary-button"
                          onClick={() => searchExistingStop(stop)}
                          disabled={stopResolutionLoading[stop.id]}
                        >
                          {stopResolutionLoading[stop.id] ? 'Searching...' : 'Find location'}
                        </button>
                        {stopResolutionErrors[stop.id] && (
                          <p className="error-message" role="alert">{stopResolutionErrors[stop.id]}</p>
                        )}
                        {stopResolutionResults[stop.id]?.length > 0 && (
                          <div className="search-results">
                            <p>Choose the matching place for this stop:</p>
                            {stopResolutionResults[stop.id].map((place) => (
                              <button
                                key={place.id}
                                type="button"
                                className="search-result"
                                onClick={() => selectStopLocation(stop.id, place)}
                              >
                                {place.label}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                      <label className="visit-duration-control" htmlFor={`duration-${stop.id}`}>
                        Visit (min)
                        <input
                          id={`duration-${stop.id}`}
                          type="number"
                          min="0"
                          max="1440"
                          step="15"
                          value={stopDurations[stop.id] ?? 60}
                          onChange={(event) => {
                            const value = event.target.value;
                            setStopDurations((current) => ({
                              ...current,
                              [stop.id]: value === '' ? 0 : Math.min(1440, Math.max(0, Number(value))),
                            }));
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => moveStop(index, -1)}
                        disabled={index === 0}
                        aria-label={`Move ${stop.name} up`}
                      >
                        ↑
                      </button>

                      <button
                        type="button"
                        onClick={() => moveStop(index, 1)}
                        disabled={index === stops.length - 1}
                        aria-label={`Move ${stop.name} down`}
                      >
                        ↓
                      </button>


                      <button
                        type="button"
                        onClick={() => startEditingStop(stop)}
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        className="remove-button"
                        onClick={() => removeStop(stop.id)}
                        aria-label={`Remove ${stop.name}`}
                      >
                        Remove
                      </button>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}

        </section>


        <section className="trip-summary" id="trip-summary">
          <div className="summary-panel">
            <div className="summary-heading">
              <div>
                <p className="section-kicker">Step 04 · Review &amp; plan</p>
                <h2>Trip summary</h2>
              </div>
              <span className="summary-count">
                {tripLocationCount} locations
              </span>
            </div>

            <div className="summary-grid">
              <div className="summary-tile">
                <span>Locations in trip</span>
                <strong>{tripLocationCount}</strong>
              </div>
              <div className="summary-tile">
                <span>Travel mode</span>
                <strong>{transportModeLabel}</strong>
              </div>
              <div className="summary-tile summary-tile-wide">
                <span>Route priority</span>
                <strong>{routePreferenceLabel}</strong>
              </div>
            </div>

            <p className={`summary-readiness ${locationsReady ? 'is-ready' : ''}`}>
              {locationsReady
                ? 'All trip locations are selected. You are ready to plan.'
                : unresolvedStops.length > 0
                  ? `Find a map location for: ${unresolvedStops.map((stop) => stop.name).join(', ')}.`
                  : 'Select search results for your starting location and final destination.'}
            </p>

            <button
              type="button"
              className="plan-button"
              onClick={() => planTrip()}
              disabled={routeLoading}
            >
              {routeLoading ? 'Planning your complete trip…' : 'Plan my trip'}
              {!routeLoading && <span aria-hidden="true">→</span>}
            </button>

            {routeError && (
              <p role="alert" className="error-message">
                {routeError}
              </p>
            )}

            <p className="helper-text">
              {externalTransportModes.includes(transportMode)
                ? 'One click prepares external transport directions. The in-app map is schematic for these modes; confirm schedules and fares with providers.'
                : 'One click calculates the supported road, walking, or cycling route and reorders stops when the selected preference supports optimization.'}
            </p>
          </div>

          <div className="saved-trips-panel" id="saved-trips">
            <div className="saved-trips-heading">
              <div>
                <p className="section-kicker">Your library</p>
                <h3>Saved trips</h3>
                <p className="helper-text">Your trips are saved to your account.</p>
              </div>
              <span className="saved-trip-count">{savedTrips.length}/10</span>
            </div>
            {saveTripMessage && <p className="helper-text" role="status">{saveTripMessage}</p>}
            {savedTrips.length === 0 ? (
              <p className="saved-trips-empty">No saved trips yet. Plan a journey and choose “Save trip”.</p>
            ) : (
              <div className="saved-trip-list">
                {savedTrips.map((trip) => (
                  <article className="saved-trip-card" key={trip.id}>
                    <div className="saved-trip-info">
                      <strong>{trip.name}</strong>
                      <span>{trip.stops?.length ?? 0} intermediate stops · {trip.savedAt ? new Date(trip.savedAt).toLocaleDateString() : 'Saved trip'}</span>
                    </div>
                    <div className="saved-trip-actions">
                      <button type="button" className="small-primary-button" onClick={() => loadSavedTrip(trip)}>Load trip</button>
                      <button type="button" className="remove-button" onClick={() => deleteSavedTrip(trip.id)}>Delete</button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {transitDirectionsUrl && externalTransportModes.includes(transportMode) && (
            <div className="route-results transit-route-card">
              <h3>{transportMode === 'flight' ? 'Flight search' : `${transportModeLabel} route options`}</h3>
              {transportMode === 'flight' ? (
                <>
                  <p>Flight search covers the selected origin and final destination. Intermediate stops are not flight waypoints; plan local sightseeing and ground transport separately.</p>
                  <a className="external-route-link" href={transitDirectionsUrl} target="_blank" rel="noreferrer">Search flights on Google Flights ↗</a>
                  <p className="helper-text">This app does not fetch live fares, airline availability, airport transfers, or flight paths. The map connector is schematic, not an actual aircraft route.</p>
                </>
              ) : (
                <>
                  <p>The map shows selected locations and a schematic connector. Live public-transport routes, timetables, fares, and service availability are checked by external providers, not calculated inside this app.</p>
                  <a className="external-route-link" href={transitDirectionsUrl} target="_blank" rel="noreferrer">Open public-transport directions in Google Maps ↗</a>
                  {externalLegLinks.length > 0 && (
                    <div className="external-leg-links">
                      <h4>Check each leg</h4>
                      {externalLegLinks.map((leg, index) => (
                        <div className="external-leg-row" key={`${leg.from.name}-${leg.to.name}-${index}`}>
                          <span><strong>{index + 1}. {leg.from.name}</strong> → {leg.to.name}</span>
                          <div>
                            <a href={leg.directionsUrl} target="_blank" rel="noreferrer">Directions ↗</a>
                            <a href={leg.searchUrl} target="_blank" rel="noreferrer">Search {transportModeLabel.toLowerCase()} ↗</a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="helper-text">The selected mode is a planning preference. Google Maps may return a mixed public-transport journey depending on local coverage; verify exact services and times before travel.</p>
                </>
              )}
              <section className="trip-budget external-trip-budget" aria-labelledby="external-budget-heading">
                <h3 id="external-budget-heading">Estimated trip budget</h3>
                <p className="helper-text">Enter your own ticket and cost estimates. Live fares and hotel prices are not fetched.</p>
                <div className="budget-input-grid">
                  <div className="form-group">
                    <label htmlFor="estimatedTransportFares">Estimated tickets / fares (₹ total)</label>
                    <input id="estimatedTransportFares" type="number" min="0" step="50" value={estimatedTransportFares} onChange={(event) => setEstimatedTransportFares(event.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="estimatedTripDays">Planned trip days</label>
                    <input id="estimatedTripDays" type="number" min="1" max="60" step="1" value={estimatedTripDays} onChange={(event) => setEstimatedTripDays(event.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="accommodationPerNight">Accommodation per room/night (₹)</label>
                    <input id="accommodationPerNight" type="number" min="0" step="100" value={accommodationPerNight} onChange={(event) => setAccommodationPerNight(event.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="foodPerPersonPerDay">Food per person/day (₹)</label>
                    <input id="foodPerPersonPerDay" type="number" min="0" step="50" value={foodPerPersonPerDay} onChange={(event) => setFoodPerPersonPerDay(event.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="estimatedTolls">Other / local transport costs (₹)</label>
                    <input id="estimatedTolls" type="number" min="0" step="50" value={estimatedTolls} onChange={(event) => setEstimatedTolls(event.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="travellerCount">Number of travellers</label>
                    <input id="travellerCount" type="number" min="1" max="100" step="1" value={travellerCount} onChange={(event) => setTravellerCount(event.target.value)} />
                  </div>
                </div>
                <div className="budget-breakdown">
                  <div><span>Tickets / fares (manual estimate)</span><strong>₹{Math.round(safeTransportFares).toLocaleString('en-IN')}</strong></div>
                  <div><span>Accommodation ({overnightCount} night{overnightCount === 1 ? '' : 's'})</span><strong>₹{Math.round(estimatedAccommodationCost).toLocaleString('en-IN')}</strong></div>
                  <div><span>Food ({budgetDayCount} day{budgetDayCount === 1 ? '' : 's'})</span><strong>₹{Math.round(estimatedFoodCost).toLocaleString('en-IN')}</strong></div>
                  <div><span>Other / local transport costs</span><strong>₹{Math.round(safeTolls).toLocaleString('en-IN')}</strong></div>
                  <div className="budget-total"><span>Estimated trip total</span><strong>₹{Math.round(estimatedTripCost).toLocaleString('en-IN')}</strong></div>
                  <div className="budget-total"><span>Estimated cost per person</span><strong>₹{Math.round(estimatedTripCost / safeTravellerCount).toLocaleString('en-IN')}</strong></div>
                </div>
              </section>
            </div>
          )}

          {routeData && (
            <div className="route-results">
              <div className="itinerary-heading export-heading">
                <h3>Your {transportModeLabel.toLowerCase()} journey</h3>
                <div className="trip-action-buttons">
                  <button type="button" className="save-trip-button" onClick={saveCurrentTrip}>Save trip</button>
                  <button type="button" className="share-trip-button" onClick={exportTripFile}>Download share file</button>
                  <label className="import-trip-label">
                    Import shared trip
                    <input type="file" accept=".json,application/json" onChange={importTripFile} />
                  </label>
                  <button type="button" className="export-button" onClick={exportTripAsPdf}>Export itinerary as PDF ↗</button>
                </div>
                <p className="helper-text export-help">Opens a populated, print-ready report. In the print dialog, choose “Save as PDF”.</p>
                {['motorcycle', 'scooter'].includes(transportMode) && (
                  <p className="helper-text">The in-app line uses the car-compatible road network as an approximation for two-wheelers. <a href={googleMapsDirectionsUrl(transportMode)} target="_blank" rel="noreferrer">Open two-wheeler directions in Google Maps ↗</a></p>
                )}
                {['bicycle', 'walking'].includes(transportMode) && (
                  <p className="helper-text">Route geometry uses the public OpenStreetMap bike/foot routing profile. Check local restrictions and accessibility before travelling.</p>
                )}
                {exportError && <p className="error-message" role="alert">{exportError}</p>}
              </div>

              <p>
                Total distance: {(routeData.distance / 1000).toFixed(1)} km
              </p>

              <p>
                Estimated travel time:{' '}
                {Math.floor(routeData.duration / 3600) > 0
                  ? `${Math.floor(routeData.duration / 3600)} h `
                  : ''}
                {Math.round((routeData.duration % 3600) / 60)} min
              </p>

              <p>
                Planned time at stops: {formatDuration(
                  stops.reduce((total, stop) => total + (Number(stopDurations[stop.id]) || 0) * 60, 0)
                )}
              </p>
              <p>
                Total journey time (travel + visits): {formatDuration(
                  routeData.duration +
                  stops.reduce((total, stop) => total + (Number(stopDurations[stop.id]) || 0) * 60, 0)
                )}
              </p>

              {routeComparison && (
                <div>
                  <h3>Optimization results</h3>

                  <p>
                    Original distance:{' '}
                    {(routeComparison.originalDistance / 1000).toFixed(1)} km
                  </p>

                  <p>
                    Planned distance:{' '}
                    {(routeComparison.plannedDistance / 1000).toFixed(1)} km
                  </p>

                  <p>
                    Original driving time:{' '}
                    {Math.round(routeComparison.originalDuration / 60)} min
                  </p>

                  <p>
                    Planned driving time:{' '}
                    {Math.round(routeComparison.plannedDuration / 60)} min
                  </p>
                </div>
              )}

              <div className="itinerary-heading">
                <h3>Detailed journey itinerary</h3>
                <p>Set visit durations beside each stop. Later arrival estimates include the planned time spent at earlier stops, but exclude breaks and traffic changes.</p>
              </div>

              <div className="form-group departure-time-field">
                <label htmlFor="departureDateTime">Planned departure date and time (optional)</label>
                <input
                  id="departureDateTime"
                  type="datetime-local"
                  value={departureDateTime}
                  onChange={(event) => setDepartureDateTime(event.target.value)}
                />
                <p className="helper-text">Set this to see estimated arrival times along your route.</p>
              </div>

              <section className="multi-day-plan" aria-labelledby="multi-day-heading">
                <h3 id="multi-day-heading">Multi-day itinerary</h3>
                <div className="form-group">
                  <label htmlFor="dailyDrivingLimit">Target travel time per day</label>
                  <select
                    id="dailyDrivingLimit"
                    value={maxDrivingHoursPerDay}
                    onChange={(event) => setMaxDrivingHoursPerDay(event.target.value)}
                  >
                    <option value="4">4 hours</option>
                    <option value="6">6 hours</option>
                    <option value="8">8 hours</option>
                    <option value="10">10 hours</option>
                  </select>
                  <p className="helper-text">The planner groups complete route legs into days. A single leg may exceed the target, because this version only schedules overnight breaks at planned stops.</p>
                </div>

                {dayPlan.map((day) => (
                  <div className="route-leg" key={`day-${day.day}`}>
                    <h4>Day {day.day}</h4>
                    <p>{transportModeLabel}: {formatDuration(day.drivingSeconds)} · Visits: {formatDuration(day.visitSeconds)} · Planned total: {formatDuration(day.drivingSeconds + day.visitSeconds)}</p>
                    <ol>
                      {day.legs.map((item) => (
                        <li key={`day-${day.day}-leg-${item.index}`}>
                          <strong>{item.from} → {item.to}</strong> — {formatDuration(item.drivingSeconds)} driving
                          {item.stopName && item.visitSeconds > 0 && (
                            <p>Visit {item.stopName}: {formatDuration(item.visitSeconds)}</p>
                          )}
                        </li>
                      ))}
                    </ol>
                    {day.day < dayPlan.length && day.legs[day.legs.length - 1]?.stopId && (
                      <div className="overnight-stays">
                        <h5>Overnight stay near {day.legs[day.legs.length - 1].stopName}</h5>
                        <p className="helper-text">Search mapped hotels, hostels, motels, and guest houses near this day's final stop. The search may expand to 10 km if needed.</p>
                        <button
                          type="button"
                          onClick={() => findOvernightStays(stops.find((stop) => stop.id === day.legs[day.legs.length - 1].stopId))}
                          disabled={overnightLoading[day.legs[day.legs.length - 1].stopId]}
                        >
                          {overnightLoading[day.legs[day.legs.length - 1].stopId] ? 'Searching nearby stays…' : overnightStays[day.legs[day.legs.length - 1].stopId] ? 'Search again' : 'Find overnight stays'}
                        </button>
                        {overnightErrors[day.legs[day.legs.length - 1].stopId] && (
                          <p className="helper-text" role="status">{overnightErrors[day.legs[day.legs.length - 1].stopId]}</p>
                        )}
                        {overnightStays[day.legs[day.legs.length - 1].stopId]?.length > 0 && (
                          <ul className="overnight-stay-list">
                            {overnightStays[day.legs[day.legs.length - 1].stopId].map((stay) => (
                              <li key={stay.id}>
                                <strong>{stay.name}</strong> <span>({stay.type})</span>
                                {stay.rating > 0 && <span> · Estimated rating {Number(stay.rating).toFixed(1)} / 5</span>}
                                {stay.priceLabel && <p>{stay.priceLabel}</p>}
                                {stay.address && <p>{stay.address}</p>}
                                <a href={stay.mapUrl} target="_blank" rel="noreferrer">View on OpenStreetMap</a>
                              </li>
                            ))}
                          </ul>
                        )}
                        {overnightStayNotes[day.legs[day.legs.length - 1].stopId] && (
                          <p className="helper-text">{overnightStayNotes[day.legs[day.legs.length - 1].stopId]}</p>
                        )}
                        <p className="helper-text">OpenStreetMap listings only; room availability, prices, safety, and quality have not been verified.</p>
                      </div>
                    )}
                  </div>
                ))}
              </section>

              <section className="attraction-recommendations" aria-labelledby="attraction-heading">
                <h3 id="attraction-heading">Discover places near your route</h3>
                <p className="helper-text">Find nearby attractions, compare estimated road detours and visit time, and add a suitable stop. Recommendations are ranked by detour and day-fit estimates.</p>
                <div className="form-group">
                  <label htmlFor="attractionPreference">What would you like to explore?</label>
                  <select id="attractionPreference" value={attractionPreference} onChange={(event) => setAttractionPreference(event.target.value)}>
                    <option value="all">All types</option>
                    <option value="culture">Culture & heritage</option>
                    <option value="nature">Nature & outdoors</option>
                    <option value="family">Family-friendly & attractions</option>
                  </select>
                </div>
                {stops.map((stop) => {
                  const visibleAttractions = attractionsForStop(stop.id);
                  return (
                    <div className="route-leg attraction-stop" key={`attractions-${stop.id}`}>
                      <div className="itinerary-heading">
                        <h4>Near {stop.name}</h4>
                        <button type="button" onClick={() => findNearbyAttractions(stop)} disabled={attractionLoading[stop.id]}>
                          {attractionLoading[stop.id] ? 'Searching places…' : attractionsByStop[stop.id] ? 'Refresh suggestions' : 'Find nearby attractions'}
                        </button>
                      </div>
                      {attractionErrors[stop.id] && <p className="helper-text" role="status">{attractionErrors[stop.id]}</p>}
                      {visibleAttractions.length > 0 && (
                        <ul className="attraction-list">
                          {visibleAttractions.map((attraction) => {
                            const dayFit = getAttractionDayFit(attraction);
                            const alreadyAdded = stops.some((item) => item.attractionSourceId === attraction.id);
                            return (
                              <li className="attraction-card" key={attraction.id}>
                                <div className="attraction-card-top">
                                  <div>
                                    <strong>{attraction.name}</strong>
                                    <span className="attraction-type">{attraction.type}</span>
                                  </div>
                                  <span className="score-pill">{attraction.score ?? 0}/100 fit</span>
                                </div>
                                {attraction.address && <p>{attraction.address}</p>}
                                <div className="detour-metrics">
                                  <span>↗ {formatDistance(attraction.detourDistance || 0)} extra</span>
                                  <span>◷ {attraction.detourMinutes || 0} min detour</span>
                                  <span>◎ {attraction.visitMinutes} min visit</span>
                                  <span>₹{Math.round(attraction.detourFuelCost || 0)} extra fuel</span>
                                </div>
                                <p className={`day-fit-note ${dayFit.fits === true ? 'fit-good' : dayFit.fits === false ? 'fit-warning' : ''}`}>
                                  {dayFit.fits === true ? `Fits today's remaining ${dayFit.remainingMinutes} min.` : dayFit.fits === false ? `May not fit today (${dayFit.remainingMinutes} min remain).` : 'Day fit unavailable; check the schedule.'}
                                </p>
                                <div className="attraction-card-actions">
                                  <a href={attraction.mapUrl} target="_blank" rel="noreferrer">Open map listing ↗</a>
                                  <button type="button" className="small-primary-button" onClick={() => addAttractionToItinerary(attraction)} disabled={addingAttractionId === attraction.id || alreadyAdded || stops.length >= 10}>
                                    {alreadyAdded ? 'Added ✓' : addingAttractionId === attraction.id ? 'Replanning…' : 'Add & replan'}
                                  </button>
                                </div>
                                <p className="metric-source">{attraction.detourSource === 'road-route estimate' ? 'Detour uses road-routing estimates.' : 'Detour estimate unavailable; showing a conservative fallback.'}</p>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                      {attractionsByStop[stop.id] && visibleAttractions.length === 0 && !attractionErrors[stop.id] && (
                        <p className="helper-text">No places match this preference near this stop. Try “All types”.</p>
                      )}
                    </div>
                  );
                })}
                <p className="helper-text">Scores are itinerary-fit estimates, not review ratings. OpenStreetMap data may omit places or details; opening hours, ticket prices, accessibility, and safety are not verified. Adding an attraction inserts it after the nearby stop and recalculates the route.</p>
              </section>

              <section className="trip-budget" aria-labelledby="trip-budget-heading">
                <h3 id="trip-budget-heading">Estimated trip budget</h3>
                <p className="helper-text">
                  Estimates use editable assumptions, not live prices. {externalTransportModes.includes(transportMode)
                    ? 'For public transport and flights, enter your own ticket estimate and planned trip length; live fares are not fetched.'
                    : 'Road fuel is estimated from distance and mileage; tolls and other costs are entered manually.'}
                </p>

                <div className="budget-input-grid">
                  <div className="form-group">
                    <label htmlFor="fuelEfficiency">Vehicle mileage (km/litre)</label>
                    <input id="fuelEfficiency" type="number" min="0.1" step="0.1" value={fuelEfficiency} onChange={(event) => setFuelEfficiency(event.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="fuelPricePerLitre">Fuel price (₹/litre)</label>
                    <input id="fuelPricePerLitre" type="number" min="0" step="0.5" value={fuelPricePerLitre} onChange={(event) => setFuelPricePerLitre(event.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="accommodationPerNight">Accommodation per room/night (₹)</label>
                    <input id="accommodationPerNight" type="number" min="0" step="100" value={accommodationPerNight} onChange={(event) => setAccommodationPerNight(event.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="foodPerPersonPerDay">Food per person/day (₹)</label>
                    <input id="foodPerPersonPerDay" type="number" min="0" step="50" value={foodPerPersonPerDay} onChange={(event) => setFoodPerPersonPerDay(event.target.value)} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="estimatedTolls">Total tolls (₹)</label>
                    <input id="estimatedTolls" type="number" min="0" step="50" value={estimatedTolls} onChange={(event) => setEstimatedTolls(event.target.value)} />
                  </div>
                  {externalTransportModes.includes(transportMode) && (
                    <>
                      <div className="form-group">
                        <label htmlFor="estimatedTransportFares">Estimated tickets / fares (₹ total)</label>
                        <input id="estimatedTransportFares" type="number" min="0" step="50" value={estimatedTransportFares} onChange={(event) => setEstimatedTransportFares(event.target.value)} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="estimatedTripDays">Planned trip days</label>
                        <input id="estimatedTripDays" type="number" min="1" max="60" step="1" value={estimatedTripDays} onChange={(event) => setEstimatedTripDays(event.target.value)} />
                      </div>
                    </>
                  )}
                  <div className="form-group">
                    <label htmlFor="travellerCount">Number of travellers</label>
                    <input id="travellerCount" type="number" min="1" step="1" value={travellerCount} onChange={(event) => setTravellerCount(event.target.value)} />
                  </div>
                </div>

                <div className="budget-breakdown">
                  <div><span>Fuel needed</span><strong>{usesFuel ? (safeFuelEfficiency > 0 ? `${estimatedFuelLitres.toFixed(1)} litres` : 'Enter mileage above 0') : 'Not applicable'}</strong></div>
                  <div><span>{usesFuel ? 'Estimated fuel' : 'Fuel estimate'}</span><strong>{usesFuel ? `₹${Math.round(estimatedFuelCost).toLocaleString('en-IN')}` : 'Not applicable for this mode'}</strong></div>
                  {externalTransportModes.includes(transportMode) && <div><span>Tickets / fares (your estimate)</span><strong>₹{Math.round(safeTransportFares).toLocaleString('en-IN')}</strong></div>}
                  <div><span>Accommodation ({overnightCount} night{overnightCount === 1 ? '' : 's'})</span><strong>₹{Math.round(estimatedAccommodationCost).toLocaleString('en-IN')}</strong></div>
                  <div><span>Food ({dayPlan.length} day{dayPlan.length === 1 ? '' : 's'}, {safeTravellerCount} traveller{safeTravellerCount === 1 ? '' : 's'})</span><strong>₹{Math.round(estimatedFoodCost).toLocaleString('en-IN')}</strong></div>
                  <div><span>Tolls (your estimate)</span><strong>₹{Math.round(safeTolls).toLocaleString('en-IN')}</strong></div>
                  <div className="budget-total"><span>Estimated trip total</span><strong>₹{Math.round(estimatedTripCost).toLocaleString('en-IN')}</strong></div>
                  <div className="budget-total"><span>Estimated cost per person</span><strong>₹{Math.round(estimatedTripCost / safeTravellerCount).toLocaleString('en-IN')}</strong></div>
                </div>
                {budgetChartData.length > 0 && (
                  <div style={{ height: 240, marginTop: 12 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={budgetChartData} dataKey="value" nameKey="name" outerRadius={80} label={(e) => `${e.name}: ₹${Math.round(e.value).toLocaleString('en-IN')}`}>
                          {budgetChartData.map((_, i) => <Cell key={i} fill={BUDGET_COLORS[i % BUDGET_COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(v) => `₹${Math.round(v).toLocaleString('en-IN')}`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
                <p className="helper-text">This first estimate assumes one accommodation room per night and food costs for every traveller. Per-person/day values shown above. It excludes parking, activities, emergencies, and any costs you haven't entered. Saved per trip.</p>
              </section>

              {routeData.legs.map((leg, index) => {
                const from =
                  index === 0
                    ? selectedStartPlace.name
                    : stops[index - 1].name;

                const to =
                  index === stops.length
                    ? selectedFinalPlace.name
                    : stops[index].name;

                const previousLegSeconds = routeData.legs
                  .slice(0, index)
                  .reduce((total, previousLeg) => total + previousLeg.duration, 0);
                const previousStopSeconds = stops
                  .slice(0, index)
                  .reduce(
                    (total, stop) => total + (Number(stopDurations[stop.id]) || 0) * 60,
                    0
                  );
                const arrivalDate = departureDateTime
                  ? new Date(
                      new Date(departureDateTime).getTime() +
                      (previousLegSeconds + previousStopSeconds + leg.duration) * 1000
                    )
                  : null;
                const arrivalIsValid = arrivalDate && !Number.isNaN(arrivalDate.getTime());
                const steps = leg.steps || [];

                return (
                  <div className="route-leg" key={`${index}-${from}-${to}`}>
                    <strong>{index + 1}. {from} → {to}</strong>
                    <p>
                      {formatDistance(leg.distance)} · {formatDuration(leg.duration)} estimated
                    </p>
                    {arrivalIsValid && (
                      <p className="arrival-estimate">
                        Estimated arrival: {arrivalDate.toLocaleString([], {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </p>
                    )}

                    <details className="route-directions">
                      <summary>Turn-by-turn directions ({steps.length} steps)</summary>
                      {steps.length > 0 ? (
                        <ol className="direction-steps">
                          {steps.map((step, stepIndex) => (
                            <li key={`${index}-${stepIndex}`}>
                              <div>
                                <strong>{getManeuverInstruction(step, to)}</strong>
                                {step.ref && <span className="road-reference"> ({step.ref})</span>}
                                <p>{formatDistance(step.distance)} · {formatDuration(step.duration)}</p>
                              </div>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p>Detailed maneuver instructions are unavailable for this leg.</p>
                      )}
                    </details>
                  </div>
                );
              })}
            </div>
          )}


        </section>



        <MapView
          locations={[
            ...(selectedStartPlace
              ? [{
                ...selectedStartPlace,
                name: selectedStartPlace.name,
                role: 'Start',
              }]
              : []),

            ...(transportMode !== 'flight' ? stops
              .filter((stop) => stop.lat != null && stop.lon != null)
              .map((stop, index) => ({
                ...stop,
                role: `Stop ${index + 1}`,
              })) : []),

            ...(selectedFinalPlace
              ? [{
                ...selectedFinalPlace,
                name: selectedFinalPlace.name,
                role: 'Finish',
              }]
              : []),
          ]}
          routeGeometry={routeData?.geometry?.coordinates ?? null}
          showConnectionLine={true}
          connectionLineStyle={externalTransportModes.includes(transportMode)
            ? { color: '#8b5cf6', weight: 3, dashArray: '8 8', opacity: 0.8 }
            : undefined}
        />




      </main>
    </div>
  );
}

export default PlannerPage;

