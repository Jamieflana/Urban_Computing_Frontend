import StationChart from "./charts/StationChart";
import RouteMap from "./charts/RouteMap";
import "./Analytics.css";
import React from 'react';

export default function AnalyticsView({
  stationTrends,
  userStats,
  analyticsLoading,
}) {
  if (analyticsLoading) return <p className="loading">Loading Analytics…</p>;
  console.log("in analytics");
  return (
    <div className="analytics-container">
      <h1 className="analytics-title">Analytics Dashboard</h1>

      <section className="analytics-section">
        <h2 className="section-title">Nearest Station Trends</h2>
        <p className="section-desc">
          Ranking of bike stations based on how often they were closest during
          your session.
        </p>
        <div className="card">
          <StationChart trends={stationTrends?.trends} />
        </div>
      </section>

      {userStats && (
        <section className="analytics-section">
          <h2 className="section-title">Your Session Summary</h2>
          <p className="section-desc">
            Analytics generated from your GPS trace and fused station proximity
            data.
          </p>

          <div className="stats-grid">
            <div className="card stat">
              <strong>GPS Points</strong>
              <p>{userStats.gps_points}</p>
            </div>
            <div className="card stat">
              <strong>Distance</strong>
              <p>{userStats.total_distance_m} m</p>
            </div>
            <div className="card stat">
              <strong>Duration</strong>
              <p>{userStats.duration_sec} sec</p>
            </div>
            <div className="card stat">
              <strong>Avg Speed</strong>
              <p>{userStats.average_speed_kmh} km/h</p>
            </div>
            <div className="card stat">
              <strong>Most Common Station</strong>
              <p>{userStats.most_common_station || "None"}</p>
            </div>
          </div>

          <div className="user-section">
            <h3 className="sub-title">User Route</h3>

            <div className="card route-card">
              <RouteMap route={userStats.route} />

              <div className="visited-stations">
                <h4>Visited Stations</h4>
                <ul>
                  {Object.entries(userStats.station_visits ?? {}).map(
                    ([name, count]) => (
                      <li key={name}>
                        <strong>{name}</strong> — {count}{" "}
                        {count === 1 ? "time" : "times"}
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
