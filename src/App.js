import { useState, useEffect } from "react";
import useGPSLogger from "./hooks/useGpsLogger";
import useBikeData from "./hooks/useBikeData";
import useFusion from "./hooks/useFusion";
import useAnalytics from "./hooks/useAnalytics";

import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Login from "./components/Login";

import FusionSummary from "./components/FusionSummary";
import MapView from "./components/MapView";
import AnalyticsView from "./components/AnalyticsView";

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

  const { bikeCount, bikeTimestamp, stations } = useBikeData(BACKEND_URL);

  const { nearestStation, distance, fusionTimestamp, eta, top3 } = useFusion(
    BACKEND_URL,
    sessionId,
    data.length,
    idToken
  );

  const {
    trends: stationTrends,
    userStats,
    loading: analyticsLoading,
  } = useAnalytics(BACKEND_URL, sessionId, activeView, idToken);

  const userLocation =
    data.length > 0
      ? {
          lat: data[data.length - 1].latitude,
          lon: data[data.length - 1].longitude,
        }
      : null;

  //
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
            </div>
          </div>
        )}

        {activeView === "analytics" && (
          <AnalyticsView
            stationTrends={stationTrends}
            userStats={userStats}
            analyticsLoading={analyticsLoading}
          />
        )}
      </div>
    </div>
  );
}

export default App;
