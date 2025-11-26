import { useState, useEffect } from "react";

export default function useBikeData(BACKEND_URL) {
  const [bikeCount, setBikeCount] = useState(0);
  const [bikeTimestamp, setBikeTimestamp] = useState(null);
  const [stations, setStations] = useState([]);

  useEffect(() => {
    const fetchBikeData = () => {
      fetch(`${BACKEND_URL}/bike_router/all`)
        .then((res) => res.json())
        .then((json) => {
          if (json.status === "ok") {
            setBikeCount(json.count || 0);
            setStations(json.stations || []);
            setBikeTimestamp(new Date().toLocaleTimeString());
          }
        })
        .catch((err) => console.error(err));
    };

    fetchBikeData();
    const interval = setInterval(fetchBikeData, 180000);

    return () => clearInterval(interval);
  }, [BACKEND_URL]);

  return { bikeCount, bikeTimestamp, stations };
}
