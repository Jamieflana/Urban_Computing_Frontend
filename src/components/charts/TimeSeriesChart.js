import { Line } from "react-chartjs-2";
import {
  Chart,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
);

export default function TimeSeriesChart({ series, stationName }) {
  if (!series) return <p>No data</p>;

  const labels = series.map((d) =>
    new Date(d.timestamp * 1000).toLocaleTimeString([], { hour12: false })
  );

  const data = {
    labels,
    datasets: [
      {
        label: `${stationName} — Bikes Available`,
        data: series.map((d) => d.bikes),
        borderWidth: 2,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          precision: 0,
          callback: (v) => Number(v),
        },
      },
      x: {
        type: "category",
      },
    },
  };

  return (
    <div style={{ width: "700px", marginTop: "20px" }}>
      <Line data={data} options={options} />
    </div>
  );
}
