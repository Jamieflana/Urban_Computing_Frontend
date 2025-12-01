import "./Legend.css";
export default function MapLegend() {
  return (
    <div className="map-legend">
      <h4>Legend</h4>
      <div className="legend-item">
        <span className="legend-icon user-dot"></span>
        <span>User Location</span>
      </div>
      <div className="legend-item">
        <img src="/bike_icons/green_bike.png" className="legend-bike" alt="green bike" />
        <span>Bike Available</span>
      </div>
      <div className="legend-item">
        <img src="/bike_icons/red_bike.png" className="legend-bike" alt="red bike" />
        <span>No Bikes Available</span>
      </div>
      <div className="legend-item">
        <span className="legend-circle"></span>
        <span>Nearest Station</span>
      </div>
      <div className="legend-item">
        <span className="legend-line"></span>
        <span>Walking Route</span>
      </div>
    </div>
  );
}
