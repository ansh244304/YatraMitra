function hasCoordinates(point) {
  return point && Number.isFinite(Number(point.lat)) && Number.isFinite(Number(point.lon));
}

function distanceKm(a, b) {
  const radians = (value) => (value * Math.PI) / 180;
  const dLat = radians(Number(b.lat) - Number(a.lat));
  const dLon = radians(Number(b.lon) - Number(a.lon));
  const lat1 = radians(Number(a.lat));
  const lat2 = radians(Number(b.lat));
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(value));
}

export function compare(req, res) {
  const { origin, destination, stops = [] } = req.body || {};
  if (!hasCoordinates(origin) || !hasCoordinates(destination)) {
    return res.status(400).json({ error: 'origin and destination with lat/lon are required.' });
  }

  const points = [origin, ...(Array.isArray(stops) ? stops : []), destination].filter(hasCoordinates);
  let straightKm = 0;
  for (let index = 1; index < points.length; index += 1) {
    straightKm += distanceKm(points[index - 1], points[index]);
  }

  const roadKm = straightKm * 1.3;
  const modes = [
    { mode: 'car', label: 'Car/Driving', distanceMeters: Math.round(roadKm * 1000), durationSeconds: Math.round((roadKm * 1000) / 13.9), source: 'Simple estimate', estimated: true },
    { mode: 'bicycle', label: 'Bicycle', distanceMeters: Math.round(roadKm * 1000), durationSeconds: Math.round((roadKm * 1000) / 4.2), source: 'Simple estimate', estimated: true },
    { mode: 'walking', label: 'Walking', distanceMeters: Math.round(roadKm * 1000), durationSeconds: Math.round((roadKm * 1000) / 1.4), source: 'Simple estimate', estimated: true },
    { mode: 'train', label: 'Train (rail)', distanceMeters: Math.round(straightKm * 1000), durationSeconds: null, source: 'External schedules required', external: true },
    { mode: 'bus', label: 'Bus', distanceMeters: Math.round(roadKm * 1000), durationSeconds: null, source: 'External schedules required', external: true },
    { mode: 'flight', label: 'Flight', distanceMeters: Math.round(straightKm * 1000), durationSeconds: null, source: 'External schedules required', external: true },
  ];

  return res.json({
    modes,
    pointsCount: points.length,
    providers: { road: 'Simple estimate', transit: 'External lookup required' },
    note: 'These are rough estimates. Check a live routing provider before travelling.',
  });
}
