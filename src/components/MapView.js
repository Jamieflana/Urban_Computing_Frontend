import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMap,
} from "react-leaflet";
import React, { useEffect } from "react";
import L from "leaflet";
import useWalkingRoute from "../hooks/useWalkingRoute";

const DUBLIN_CENTER = [53.3498, -6.2603];

// User pulsing dot
const userPulseIcon = L.divIcon({
  className: "user-pulse-marker",
  iconSize: [20, 20],
  popupAnchor: [0, -10],
});

// Dynamic station icons
function getStationIcon(station) {
  let iconUrl = "/bike_icons/green_bike.png";

  if (station.num_bikes_available === 0) iconUrl = "/bike_icons/red_bike.png";
  else if (station.num_bikes_available < 5)
    iconUrl = "/bike_icons/blue_bike.png";

  return L.icon({
    iconUrl,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -28],
  });
}

/* ---------------------------- AUTO ZOOM ----------------------------- */
function AutoZoom({ userLocation, nearestStation, stations }) {
  const map = useMap();
  const hasZoomed = React.useRef(false);

  useEffect(() => {
    if (hasZoomed.current) return;

    if (userLocation && nearestStation) {
      const bounds = L.latLngBounds([
        [userLocation.lat, userLocation.lon],
        [nearestStation.latitude, nearestStation.longitude],
      ]);
      map.fitBounds(bounds, { padding: [60, 60] });
      hasZoomed.current = true;
      return;
    }

    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lon], 15);
      hasZoomed.current = true;
      return;
    }

    if (stations && stations.length > 0) {
      const bounds = L.latLngBounds(
        stations.map((s) => [s.latitude, s.longitude])
      );
      map.fitBounds(bounds, { padding: [60, 60] });
      hasZoomed.current = true;
      return;
    }

    map.setView(DUBLIN_CENTER, 12);
    hasZoomed.current = true;
  }, []);

  return null;
}

/* --------------------- CLICK-TO-ZOOM ON SELECTED STATION --------------------- */
function HighlightZoom({ highlightStation }) {
  const map = useMap();

  useEffect(() => {
    if (!highlightStation) return;

    map.flyTo([highlightStation.lat, highlightStation.lon], 17, {
      duration: 1.2,
    });
  }, [highlightStation]);

  return null;
}

/* ======================================================================== */
/*                             MAIN COMPONENT                               */
/* ======================================================================== */

export default function MapView({
  userLocation,
  station,
  stations,
  distance,
  highlightStation,
  top3Stations = [],
}) {
  const nearestStationIcon = L.divIcon({
    className: "nearest-station-marker",
    html: `
      <div class="nearest-station-pulse"></div>
      <img src="/bike_icons/green_bike.png" class="nearest-station-icon" />
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
  const walkingRoute = useWalkingRoute(
    userLocation,
    highlightStation || station
  );

  return (
    <>
      {/* CSS styling */}
      <style>{`
        .user-pulse-marker {
          background: rgba(0, 150, 255, 0.9);
          border-radius: 50%;
          width: 18px;
          height: 18px;
          box-shadow: 0 0 10px rgba(0,150,255,1);
          animation: userPulse 1.6s infinite;
        }
        @keyframes userPulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.7); opacity: 0.4; }
          100% { transform: scale(1); opacity: 1; }
        }

        .nearest-station-pulse {
          position: absolute;
          top: 0;
          left: 0;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(0, 255, 0, 0.4);
          animation: pulseStation 1.8s infinite;
        }
        @keyframes pulseStation {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .nearest-station-icon {
          width: 28px;
          height: 28px;
          position: absolute;
          top: 4px;
          left: 4px;
        }
      `}</style>

      <MapContainer
        key="map"
        center={DUBLIN_CENTER}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: "500px", width: "100%" }}
      >
        {station && (
          <div className="map-overlay">
            <span className="overlay-row">{station.name}</span>
            <span className="overlay-sub">
              {distance}m • {station.num_bikes_available} bikes
            </span>
          </div>
        )}

        <AutoZoom
          userLocation={userLocation}
          nearestStation={station}
          stations={stations}
        />

        <HighlightZoom highlightStation={highlightStation} />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        {/* USER POSITION */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lon]}
            icon={userPulseIcon}
          >
            <Popup>You are here</Popup>
          </Marker>
        )}

        {/* ALL BIKE STATIONS */}
        {stations &&
          stations.map((st) => (
            <Marker
              key={st.station_id}
              position={[st.latitude, st.longitude]}
              icon={getStationIcon(st)}
            >
              <Popup>
                <b>{st.name}</b>
                <br />
                Bikes: {st.num_bikes_available}
                <br />
                Docks: {st.num_docks_available}
              </Popup>
            </Marker>
          ))}

        {/* NEAREST STATION HIGHLIGHT */}
        {station && (
          <Marker
            position={[station.latitude, station.longitude]}
            icon={nearestStationIcon}
          />
        )}

        {/* ROUTE TO SELECTED STATION */}
        {userLocation && highlightStation && walkingRoute.length === 0 && (
          <Polyline
            positions={[
              [userLocation.lat, userLocation.lon],
              [highlightStation.lat, highlightStation.lon],
            ]}
            pathOptions={{
              color: "blue",
              dashArray: "6, 8",
              weight: 4,
            }}
          />
        )}

        {walkingRoute.length > 0 && (
          <Polyline
            positions={walkingRoute}
            pathOptions={{
              color: "green",
              weight: 5,
            }}
          />
        )}
        {/* ROUTES TO TOP 3 STATIONS */}
        {userLocation &&
          top3Stations.map((st, idx) => (
            <Polyline
              key={idx}
              positions={[
                [userLocation.lat, userLocation.lon],
                [st.lat, st.lon],
              ]}
              pathOptions={{
                color: "#888",
                dashArray: "4, 10",
                weight: 2.5,
                opacity: 0.6,
              }}
            />
          ))}
      </MapContainer>
    </>
  );
}
