import { useState, useEffect, useRef } from "react";

export default function useWalkingRoute(userLocation, targetStation) {
  const [routeCoords, setRouteCoords] = useState([]);

  const lastUserLocation = useRef(null);
  const lastFetchTime = useRef(0); // For cache
  const routeCache = useRef(new Map()); // For cache

  useEffect(() => {
    if (userLocation) {
      lastUserLocation.current = userLocation;
    }
  }, [userLocation]);

  function roundCoord(n) {
    return Number(n.toFixed(6));
  }

  useEffect(() => {
    if (!lastUserLocation.current || !targetStation) return;

    const start = lastUserLocation.current;

    const startLat = roundCoord(start.lat);
    const startLon = roundCoord(start.lon);

    const endLat = roundCoord(targetStation.lat || targetStation.latitude);
    const endLon = roundCoord(targetStation.lon || targetStation.longitude);

    //Create Cache key
    const cacheKey = `${startLat},${startLon}-${endLat},${endLon}`;

    if (routeCache.current.has(cacheKey)) {
      setRouteCoords(routeCache.current.get(cacheKey));
      return;
    }

    //Wait time between reqs:
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTime.current;

    if (timeSinceLastFetch < 500) {
      // Too soon, use fallback straight line
      const straightLine = [
        [startLat, startLon],
        [endLat, endLon],
      ];
      setRouteCoords(straightLine);
      return;
    }

    lastFetchTime.current = now;

    const url = `https://router.project-osrm.org/route/v1/walking/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson&alternatives=false`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(
            ([lon, lat]) => [lat, lon]
          );
          setRouteCoords(coords);
          routeCache.current.set(cacheKey, coords);
        }
      })
      .catch((err) => console.error("OSRM error:", err));
  }, [targetStation]);

  return routeCoords;
}
