import { useEffect, useState } from "react";

function App() {
  const [data, setData] = useState([]);
  const [status, setStatus] = useState("Waiting for GPS");
  const [isCollecting, setIsCollecting] = useState(false);
  const [count, setCount] = useState(0);
  const [sessionId, setSessionId] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

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
              timestamp: new Date().toISOString(),
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
              accuracy: pos.coords.accuracy,
            };
            
            setData((prev) => [...prev, record]); // For local download

            //Send to Cloud
            fetch(`${BACKEND_URL}/save_session`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(record),
            })
              .then((res) => res.json())
              .then(() => {
                setCount((prev) => prev + 1);
                setStatus(
                  `Session ${sessionId}: Sent ${
                    count + 1
                  } points. Last (${record.latitude.toFixed(
                    5
                  )}, ${record.longitude.toFixed(5)})`
                );
              })
              .catch((err) => {
                console.error("Failed to send data:", err);
                setStatus("Error sending data to backend");
              });
          },
          (err) => setStatus("Error: " + err.message),
          { enableHighAccuracy: true }
        );
      }, 1500); // every 1.5 seconds
    }

    return () => clearInterval(intervalId);
  }, [isCollecting, count, sessionId, BACKEND_URL]);

  const startLogging = () => {
    if(!sessionId){
      const newSessionId = `session_${Date.now()}`;
      setSessionId(newSessionId);
      setStatus(`Session Started for ${newSessionId}`);
    }
    setIsCollecting(true);
  }

  const stopLogging = () => {
    setIsCollecting(false);
    setStatus(`Session ended: ${sessionId} (${count} points uploaded)`);
  };

  const downloadCSV = () => {
    if (data.length === 0) {
      alert("No data collected yet");
      return;
    }
    const header = "timestamp,latitude,longitude,accuracy\n";
    const rows = data
      .map((d) => `${d.timestamp},${d.latitude},${d.longitude},${d.accuracy}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "user_gps_data.csv";
    link.click();
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>GPS Logger</h1>
      <p>{status}</p>
      {!isCollecting ? (
        <button onClick={startLogging}>Start Logging</button>
      ) : (
        <button onClick={stopLogging}>Stop Logging</button>
      )}
      <button onClick={downloadCSV} style={{ marginLeft: "10px" }}>
        Download CSV
      </button>
    </div>
  );
}

export default App;
