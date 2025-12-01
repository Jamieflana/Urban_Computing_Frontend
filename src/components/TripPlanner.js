import { useState } from "react";
import "./TripPlanner.css";

export default function TripPlanner({
  stations,
  nearestStation, 
  idToken,
  BACKEND_URL,
  onTripPlanned,
}) {
  const [showPlanner, setShowPlanner] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter stations with available docks
  const availableStations = stations.filter((s) => s.num_docks_available > 0);

  const filteredStations = availableStations.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePlanTrip = async (destinationStationName) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/fusion/plan_trip`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          pickup_station_name: nearestStation.name, // Use nearest station
          destination_station_name: destinationStationName,
        }),
      });

      const data = await response.json();

      if (data.status === "ok") {
        onTripPlanned(data);
        setShowPlanner(false);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError("Failed to plan trip");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!nearestStation) {
    return (
      <button className="plan-trip-btn" disabled>
         Plan Trip (Start GPS first)
      </button>
    );
  }

  if (!showPlanner) {
    return (
      <button className="plan-trip-btn" onClick={() => setShowPlanner(true)}>
        Plan Trip from {nearestStation.name}
      </button>
    );
  }

  // Modal
  return (
    <div className="trip-planner-modal">
      <div className="trip-planner-content">
        <div className="trip-planner-header">
          <h3>Plan Your Trip</h3>
          <button className="close-btn" onClick={() => setShowPlanner(false)}>
            X
          </button>
        </div>

        <p className="trip-planner-desc">
          Select a destination station with available docks
        </p>

        <input
          type="text"
          className="station-search"
          placeholder="Search stations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {error && <p className="error-message">{error}</p>}

        <div className="station-list">
          {filteredStations.length === 0 ? (
            <p>No stations with available docks found</p>
          ) : (
            filteredStations.map((station, idx) => (
              <div
                key={idx}
                className="station-item"
                onClick={() => !loading && handlePlanTrip(station.name)}
              >
                <div className="station-info">
                  <strong>{station.name}</strong>
                  <p>{station.num_docks_available} docks available</p>
                </div>
                <button className="select-btn" disabled={loading}>
                  {loading ? "..." : "->"}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
