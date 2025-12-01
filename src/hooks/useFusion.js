import { useState, useEffect } from "react";

export default function useFusion(BACKEND_URL, sessionId, gpsCount, idToken) {
  const [nearestStation, setNearestStation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [fusionTimestamp, setFusionTimestamp] = useState(null);
  const [eta, setEta] = useState(null);
  const [top3, setTop3] = useState([]);

  useEffect(() => {
    if (!sessionId) return;
    if (!idToken) return;
    if (gpsCount === 0) return;

    const fetchFusion = () => {
      fetch(`${BACKEND_URL}/fusion/get_fusion/prediction/${sessionId}`, {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      })
        .then((res) => res.json())
        .then((json) => {
          if (json.status === "ok") {
            const stationWithContext = {
              ...json.nearest_station,
              temporal_context: json.temporal_context, // Add context here
            };
            setNearestStation(stationWithContext);
            setDistance(json.distance_to_station_m);
            setEta(json.eta_seconds);
            setTop3(json.top3 || []);
            setFusionTimestamp(new Date().toLocaleTimeString());
          }
        })
        .catch((err) => console.error(err));
    };

    fetchFusion();
    const interval = setInterval(fetchFusion, 18000);

    return () => clearInterval(interval);
  }, [BACKEND_URL, sessionId, gpsCount, idToken]);

  return { nearestStation, distance, fusionTimestamp, eta, top3 };
}
