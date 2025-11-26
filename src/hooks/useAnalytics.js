import { useState, useEffect } from "react";

export default function useAnalytics(
  BACKEND_URL,
  sessionId,
  activeView,
  idToken
) {
  const [trends, setTrends] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (activeView !== "analytics") return;
    if (!sessionId) return;
    if (!idToken) return;

    async function load() {
      setLoading(true);
      const t = await fetch(
        `${BACKEND_URL}/analytics/user/${sessionId}/trends`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      const trendsJson = await t.json();
      setTrends(trendsJson);

      const u = await fetch(
        `${BACKEND_URL}/analytics/user/${sessionId}/stats`,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );
      const userJson = await u.json();
      setUserStats(userJson);

      setLoading(false);
    }

    load();
  }, [BACKEND_URL, sessionId, activeView, idToken]);

  return { trends, userStats, loading };
}
