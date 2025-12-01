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
import MapLegend from "./Legend";
import "./MapView.css";

const DUBLIN_CENTER = [53.3498, -6.2603];

// User pulsing dot
const userPulseIcon = L.divIcon({
  className: "user-pulse-marker",
  html: '<div class="pulse-dot"></div>',
  iconSize: [20, 20],
  iconAnchor: [10, 10],
  popupAnchor: [0, -10],
});

// Dynamic station icons
function getStationIcon(station) {
  let iconUrl = "/bike_icons/green_bike.png";
  if (station.num_bikes_available === 0) iconUrl = "/bike_icons/red_bike.png";

  return L.icon({
    iconUrl,
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -28],
  });
}

// Highlighted station icon with pulse
function getHighlightedStationIcon(station) {
  let bikeIconUrl = "/bike_icons/green_bike.png";
  if (station.num_bikes_available === 0)
    bikeIconUrl = "/bike_icons/red_bike.png";

  return L.divIcon({
    className: "highlighted-station-marker",
    html: `
      <div class="highlighted-station-pulse"></div>
      <img src="${bikeIconUrl}" class="highlighted-station-icon" />
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
}

// Destination icon
function getDestinationIcon() {
  return L.icon({
    iconUrl: "../destination_icon.png",
    iconSize: [32, 32],
    iconAnchor: [20, 20],
    popupAnchor: [0, -32],
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [highlightStation]);

  return null;
}

/* --------------------- TRIP ZOOM --------------------- */
function TripZoom({ tripPlan, userLocation }) {
  const map = useMap();
  const hasZoomed = React.useRef(false);

  useEffect(() => {
    if (!tripPlan || !userLocation) return;

    if (hasZoomed.current) return;

    const bounds = L.latLngBounds([
      [userLocation.lat, userLocation.lon],
      [tripPlan.pickup_station.lat, tripPlan.pickup_station.lon],
      [tripPlan.destination_station.lat, tripPlan.destination_station.lon],
    ]);

    map.fitBounds(bounds, { padding: [80, 80] });
    hasZoomed.current = true;
  }, [tripPlan, userLocation, map]);

  return null;
}

export default function MapView({
  userLocation,
  station,
  stations,
  distance,
  highlightStation,
  top3Stations = [],
  tripPlan,
}) {
  // Route 1: User -> Pickup station (walking - blue dashed)
  const walkingRoute = useWalkingRoute(
    userLocation,
    tripPlan ? tripPlan.pickup_station : highlightStation || station
  );

  // Route 2: Pickup -> Destination (cycling - green solid)
  const cycleRoute = useWalkingRoute(
    tripPlan
      ? { lat: tripPlan.pickup_station.lat, lon: tripPlan.pickup_station.lon }
      : null,
    tripPlan
      ? {
          lat: tripPlan.destination_station.lat,
          lon: tripPlan.destination_station.lon,
        }
      : null
  );

  // Determine which station should be highlighted
  const activeHighlightStation = highlightStation || station;

  return (
    <>

      <MapContainer
        key="map"
        center={DUBLIN_CENTER}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: "500px", width: "100%" }}
      >
        {/* OVERLAY INFO */}
        {tripPlan ? (
          <div className="map-overlay">
            <span className="overlay-row">
              Trip to {tripPlan.destination_station.name}
            </span>
            <span className="overlay-sub">
              {tripPlan.distance_m}m - {Math.floor(tripPlan.eta_sec / 60)} min
            </span>
          </div>
        ) : (
          station && (
            <div className="map-overlay">
              <span className="overlay-row">{station.name}</span>
              <span className="overlay-sub">
                {distance}m - {station.num_bikes_available} bikes
              </span>
            </div>
          )
        )}

        <AutoZoom
          userLocation={userLocation}
          nearestStation={station}
          stations={stations}
        />

        <HighlightZoom highlightStation={highlightStation} />
        <TripZoom tripPlan={tripPlan} userLocation={userLocation} />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        {/* USER POSITION */}
        {userLocation && (
          <>
            <Marker
              position={[userLocation.lat, userLocation.lon]}
              icon={userPulseIcon}
            >
              <Popup>You are here</Popup>
            </Marker>
          </>
        )}

        {/* ALL BIKE STATIONS - exclude highlighted/pickup/destination */}
        {stations &&
          stations
            .filter((st) => {
              // Filter out highlighted station
              if (activeHighlightStation && !tripPlan) {
                const highlightLat =
                  activeHighlightStation.latitude || activeHighlightStation.lat;
                const highlightLon =
                  activeHighlightStation.longitude ||
                  activeHighlightStation.lon;

                if (
                  Math.abs(st.latitude - highlightLat) < 0.0001 &&
                  Math.abs(st.longitude - highlightLon) < 0.0001
                ) {
                  return false;
                }
              }

              // Filter out trip stations
              if (tripPlan) {
                // Pickup station
                if (
                  Math.abs(st.latitude - tripPlan.pickup_station.lat) <
                    0.0001 &&
                  Math.abs(st.longitude - tripPlan.pickup_station.lon) < 0.0001
                ) {
                  return false;
                }
                // Destination station
                if (
                  Math.abs(st.latitude - tripPlan.destination_station.lat) <
                    0.0001 &&
                  Math.abs(st.longitude - tripPlan.destination_station.lon) <
                    0.0001
                ) {
                  return false;
                }
              }

              return true;
            })
            .map((st) => (
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

        {/* TRIP PLAN MARKERS */}
        {tripPlan ? (
          <>
            {/* Pickup station (highlighted) */}
            <Marker
              position={[
                tripPlan.pickup_station.lat,
                tripPlan.pickup_station.lon,
              ]}
              icon={getHighlightedStationIcon(tripPlan.pickup_station)}
            >
              <Popup>
                <b> Pickup: {tripPlan.pickup_station.name}</b>
                <br />
                Bikes: {tripPlan.pickup_station.bikes}
              </Popup>
            </Marker>

            {/* Destination station */}
            <Marker
              position={[
                tripPlan.destination_station.lat,
                tripPlan.destination_station.lon,
              ]}
              icon={getDestinationIcon()}
            >
              <Popup>
                <b>Destination: {tripPlan.destination_station.name}</b>
                <br />
                Docks: {tripPlan.destination_station.docks}
              </Popup>
            </Marker>
          </>
        ) : (
          /* NORMAL HIGHLIGHTED STATION */
          activeHighlightStation && (
            <Marker
              position={[
                activeHighlightStation.latitude || activeHighlightStation.lat,
                activeHighlightStation.longitude || activeHighlightStation.lon,
              ]}
              icon={getHighlightedStationIcon(activeHighlightStation)}
            >
              <Popup>
                <b>{activeHighlightStation.name}</b>
                <br />
                Bikes: {activeHighlightStation.num_bikes_available}
                <br />
                Docks: {activeHighlightStation.num_docks_available}
              </Popup>
            </Marker>
          )
        )}

        {/* ROUTES */}
        {tripPlan ? (
          <>
            {/* Walking route (user -> pickup) - Blue dashed */}
            {walkingRoute.length > 0 ? (
              <Polyline
                positions={walkingRoute}
                pathOptions={{
                  color: "blue",
                  dashArray: "6, 8",
                  weight: 4,
                }}
              />
            ) : (
              userLocation && (
                <Polyline
                  positions={[
                    [userLocation.lat, userLocation.lon],
                    [tripPlan.pickup_station.lat, tripPlan.pickup_station.lon],
                  ]}
                  pathOptions={{
                    color: "blue",
                    dashArray: "6, 8",
                    weight: 4,
                  }}
                />
              )
            )}

            {/* Cycling route (pickup -> destination) - Green solid */}
            {cycleRoute.length > 0 ? (
              <Polyline
                positions={cycleRoute}
                pathOptions={{
                  color: "green",
                  weight: 5,
                }}
              />
            ) : (
              <Polyline
                positions={[
                  [tripPlan.pickup_station.lat, tripPlan.pickup_station.lon],
                  [
                    tripPlan.destination_station.lat,
                    tripPlan.destination_station.lon,
                  ],
                ]}
                pathOptions={{
                  color: "green",
                  weight: 5,
                }}
              />
            )}
          </>
        ) : (
          <>
            {/* NORMAL ROUTES (no trip planned) */}
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
          </>
        )}

        <MapLegend />
      </MapContainer>
    </>
  );
}
