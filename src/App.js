import { useEffect, useState } from "react";
import useAnalytics from "./hooks/useAnalytics";
import useBikeData from "./hooks/useBikeData";
import useFusion from "./hooks/useFusion";
import useGPSLogger from "./hooks/useGpsLogger";

import { onAuthStateChanged } from "firebase/auth";
import Login from "./components/Login";
import { auth } from "./firebase";

import AnalyticsView from "./components/AnalyticsView";
import FusionSummary from "./components/FusionSummary";
import MapView from "./components/MapView";

import TripPlanner from "./components/TripPlanner";

import "./AppLayout.css";

function App() {
  //const BACKEND_URL = "http://localhost:8000";
  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  const [highlightStation, setHighlightStation] = useState(null);
  const [activeView, setActiveView] = useState("map");

  // Firebase login tracking
  const [user, setUser] = useState(null);
  const [idToken, setIdToken] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [userSessions, setUserSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);

  const [tripPlan, setTripPlan] = useState(null);

  // Listen for Firebase login state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (currentUser) {
        const token = await currentUser.getIdToken();
        setIdToken(token);
      } else {
        setIdToken(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const { data, status, isCollecting, startLogging, stopLogging, sessionId } =
    useGPSLogger(BACKEND_URL, idToken);

  //Fetch the sessions:
  useEffect(() => {
    if (user && idToken) {
      console.log("Fetching sessions");
      fetch(`${BACKEND_URL}/analytics/sessions`, {
        headers: { Authorization: `Bearer ${idToken}` },
      })
        .then((res) => res.json())
        .then((data) => {
          console.log("session response: ", data);
          if (data.status === "ok") {
            console.log("setting sessions: ", data.sessions);
            setUserSessions(data.sessions || []);
          }
        })
        .catch((err) => console.error("Failed to load sessions:", err));
    }
  }, [user, idToken, BACKEND_URL]);

  const activeSessionId = selectedSession || sessionId;

  const { bikeCount, bikeTimestamp, stations } = useBikeData(BACKEND_URL);

  const { nearestStation, distance, fusionTimestamp, eta, top3 } = useFusion(
    BACKEND_URL,
    activeSessionId,
    data.length,
    idToken
  );

  const {
    trends: stationTrends,
    userStats,
    loading: analyticsLoading,
  } = useAnalytics(BACKEND_URL, activeSessionId, activeView, idToken);

  const userLocation =
    data.length > 0
      ? {
          lat: data[data.length - 1].latitude,
          lon: data[data.length - 1].longitude,
        }
      : null;

  if (authLoading) return <div>Loading...</div>;
  if (!user) return <Login />;

  return (
    <div className="app-container">
      {/* SIDEBAR */}
      <div className="sidebar">
        <h2 className="sidebar-title">Dublin Bike finder</h2>

        <button
          className={`sidebar-btn ${activeView === "map" ? "active" : ""}`}
          onClick={() => setActiveView("map")}
        >
          Map View
        </button>

        <button
          className={`sidebar-btn ${
            activeView === "analytics" ? "active" : ""
          }`}
          onClick={() => setActiveView("analytics")}
        >
          Analytics
        </button>
      </div>

      <div className="main-content">
        <div className="topbar">
          <h1>Dublin Bike Finder</h1>
        </div>

        {activeView === "map" && (
          <div className="map-info-layout">
            <div className="map-column">
              <MapView
                userLocation={userLocation}
                station={nearestStation}
                stations={stations}
                distance={distance}
                highlightStation={highlightStation}
                top3Stations={top3}
                tripPlan={tripPlan}
              />
            </div>

            <div className="info-card">
              <div className="info-card-header">
                <span className="info-card-title">
                  Find your closest available bike
                </span>

                <button
                  className={`circle-btn-small ${
                    isCollecting ? "stop" : "start"
                  }`}
                  onClick={isCollecting ? stopLogging : startLogging}
                >
                  <img
                    src={isCollecting ? "/media-pause.png" : "/media-play.png"}
                    alt="control icon"
                    className="circle-btn-icon"
                  />
                </button>
              </div>

              <p className="gps-status">{status}</p>

              <p>
                <strong>Stations:</strong> {bikeCount}
              </p>
              <p>
                <strong>Last updated:</strong> {bikeTimestamp}
              </p>

              <FusionSummary
                nearestStation={nearestStation}
                distance={distance}
                timestamp={fusionTimestamp}
                eta={eta}
                top3={top3}
                onSelectStation={setHighlightStation}
              />
              <TripPlanner
                stations={stations}
                nearestStation={highlightStation || nearestStation}
                idToken={idToken}
                BACKEND_URL={BACKEND_URL}
                onTripPlanned={setTripPlan}
              />
              {tripPlan && (
                <div className="trip-summary">
                  <h4> Trip Plan</h4>
                  <div className="trip-leg">
                    <p>
                      <strong>Pickup:</strong> {tripPlan.pickup_station.name}
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "#666" }}>
                      {tripPlan.pickup_station.bikes} bikes available
                    </p>
                  </div>

                  <div className="trip-leg">
                    <p>
                      <strong>Destination:</strong>{" "}
                      {tripPlan.destination_station.name}
                    </p>
                    <p style={{ fontSize: "0.85rem", color: "#666" }}>
                      {tripPlan.distance_m}m -{" "}
                      {Math.floor(tripPlan.eta_sec / 60)} min cycling
                    </p>
                  </div>

                  <button
                    onClick={() => setTripPlan(null)}
                    style={{
                      width: "100%",
                      padding: "0.5rem",
                      background: "#f44336",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      marginTop: "0.5rem",
                    }}
                  >
                    Clear Trip
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeView === "analytics" && (
          <AnalyticsView
            stationTrends={stationTrends}
            userStats={userStats}
            analyticsLoading={analyticsLoading}
            userSessions={userSessions}
            selectedSession={selectedSession}
            setSelectedSession={setSelectedSession}
            currentSessionId={sessionId}
          />
        )}
      </div>
    </div>
  );
}

export default App;
