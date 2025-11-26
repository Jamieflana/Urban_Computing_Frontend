import "./FusionSummary.css";

export default function FusionSummary({
  nearestStation,
  distance,
  timestamp,
  eta,
  top3 = [],
  onSelectStation,
}) {
  if (!nearestStation)
    return (
      <p className="fusion-none">No nearby stations with available bikes.</p>
    );

  return (
    <div className="fusion-summary">
      <h3 className="fusion-header">Nearest Station</h3>

      <div className="nearest-card">
        <p>
          <strong>{nearestStation.name}</strong>
        </p>
        <p>
          {distance} meters • {nearestStation.num_bikes_available} bikes
        </p>
        <p>
          <strong>ETA:</strong> {eta.toFixed(0)} sec
        </p>
        <small className="fusion-updated">Updated: {timestamp}</small>
      </div>

      {top3.length > 0 && (
        <div className="top3-container">
          <h4 className="top3-title">Top 3 Closest Stations</h4>

          <div className="top3-list">
            {top3.map((s, idx) => (
              <div
                className="top3-card"
                key={idx}
                onClick={() => onSelectStation && onSelectStation(s)} // <-- FIXED
              >
                <div className="top3-info">
                  <strong className="top3-name">{s.name}</strong>
                  <p className="top3-sub">
                    {s.distance_m.toFixed(1)} m • {s.bikes} bikes
                  </p>
                </div>

                <div className="top3-dot" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
