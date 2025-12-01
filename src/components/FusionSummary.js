import "./FusionSummary.css";
import { useState } from "react";
import { WiDaySunny } from "react-icons/wi"; // Morning sun
import { BsSunset } from "react-icons/bs"; // Evening sunset
import { MdAccessTime } from "react-icons/md"; // Clock for off-peak
import { MdLocationOn } from "react-icons/md";

export default function FusionSummary({
  nearestStation,
  distance,
  timestamp,
  eta,
  top3 = [],
  onSelectStation,
  userMotion,
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  if (!nearestStation)
    return (
      <p className="fusion-none">No nearby stations with available bikes.</p>
    );

  return (
    <div className="fusion-summary">
      <h3 className="fusion-header">Nearest Station</h3>
      {nearestStation.temporal_context && (
        <div className="temporal-context-wrapper">
          <div
            className="temporal-context-badge"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {getContextIcon(nearestStation.temporal_context.context)}{" "}
            {getContextLabel(nearestStation.temporal_context.context)}
            
          </div>

          {showTooltip && (
            <div className="context-tooltip">
              {getContextTooltip(nearestStation.temporal_context.context)}
            </div>
          )}
        </div>
      )}
      <div className="nearest-card">
        <p>
          <strong>{nearestStation.name}</strong>
        </p>
        <p>
          {distance} meters - {nearestStation.num_bikes_available} bikes
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
                onClick={() => onSelectStation && onSelectStation(s)} 
              >
                <div className="top3-info">
                  <strong className="top3-name">{s.name}</strong>
                  <p className="top3-sub">
                    {s.distance_m.toFixed(1)} m - {s.bikes} bikes
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

function getContextIcon(context) {
  switch (context) {
    case "morning_rush":
      return <WiDaySunny className="context-icon"/>;
    case "evening_commute":
      return <BsSunset className="context-icon" />;
    case "off_peak":
      return <MdAccessTime className="context-icon"/>;
    default:
      return <MdLocationOn className="context-icon"/>;
  }
}

function getContextLabel(context) {
  switch (context) {
    case "morning_rush":
      return "Morning Rush";
    case "evening_commute":
      return "Evening Commute";
    case "off_peak":
      return "Off-Peak";
    default:
      return "";
  }
}

function getContextTooltip(context) {
  switch (context) {
    case "morning_rush":
      return "7-10am weekdays: Prioritizing stations with 2+ bikes to avoid empty stations during rush hour.";
    case "evening_commute":
      return "5-8pm weekdays: Showing stations with available docks for bike returns during evening rush.";
    case "off_peak":
      return "Standard recommendations based on proximity. All stations with available bikes are shown.";
    default:
      return "";
  }
}
