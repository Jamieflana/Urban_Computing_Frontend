import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function RouteMap({ route }) {
  if (!route || route.length === 0) return <p>No route data available.</p>;

  const positions = route.map((p) => [p.latitude, p.longitude]);

  return (
    <div style={{ height: "400px", width: "100%", marginTop: "20px" }}>
      <MapContainer
        key={"route-" + positions.length}
        center={positions[0]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polyline positions={positions} color="blue" />
      </MapContainer>
    </div>
  );
}
