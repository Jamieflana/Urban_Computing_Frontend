import { useState, useEffect } from "react";

export default function useGPSLogger(BACKEND_URL, idToken) {
  const [data, setData] = useState([]);
  const [status, setStatus] = useState("Waiting for GPS");
  const [isCollecting, setIsCollecting] = useState(false);
  const [count, setCount] = useState(0);
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setStatus("Geolocation not supported on this device.");
      return;
    }

    let intervalId;

    if (isCollecting && sessionId) {
      setStatus(`Collecting data for session: ${sessionId}`);

      intervalId = setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const record = {
              session_id: sessionId,
              timestamp: Date.now(),
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            };

            setData((prev) => [...prev, record]);

            fetch(`${BACKEND_URL}/save_session`, {
              method: "POST",
              headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${idToken}`,
               },
              body: JSON.stringify(record),
            })
              .then((res) => res.json())
              .then(() => {
                setCount((prev) => prev + 1);
                setStatus(`Session ${sessionId}: Sent ${count + 1} points`);
              })
              .catch(() => setStatus("Error sending data"));
          },
          (err) => setStatus("Error: " + err.message),
          { enableHighAccuracy: true }
        );
      }, 1500);
    }

    return () => clearInterval(intervalId);
  }, [isCollecting, count, sessionId, BACKEND_URL, idToken]);

  const startLogging = () => {
    const newId = crypto.randomUUID();
    setSessionId(newId);
    setCount(0);
    setData([]);
    setStatus(`Session started: ${newId}`);
    setIsCollecting(true);
  };

  const stopLogging = () => {
    setIsCollecting(false);
    setStatus(`Session ended: ${sessionId} (${count} points uploaded)`);
    setSessionId(null);
    setCount(0);
    setData([]);
  };

  return { data, status, isCollecting, startLogging, stopLogging, sessionId };
}
