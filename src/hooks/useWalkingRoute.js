import { useState, useEffect, useRef } from "react";

export default function useWalkingRoute(userLocation, targetStation) {
  const [routeCoords, setRouteCoords] = useState([]);

  const lastUserLocation = useRef(null);

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

    const url = `https://router.project-osrm.org/route/v1/walking/${startLon},${startLat};${endLon},${endLat}?overview=full&geometries=geojson&alternatives=false`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.routes && data.routes.length > 0) {
          const coords = data.routes[0].geometry.coordinates.map(
            ([lon, lat]) => [lat, lon]
          );
          setRouteCoords(coords);
        }
      })
      .catch((err) => console.error("OSRM error:", err));
  }, [targetStation]);

  return routeCoords;
}
