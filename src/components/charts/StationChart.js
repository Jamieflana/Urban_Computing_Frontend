import { Bar } from "react-chartjs-2";
import {
  Chart,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function StationChart({ trends }) {
  if (!trends) return <p>No data</p>;

  //Unpack the data
  const labels = Object.keys(trends);
  const values = Object.values(trends);

  const data = {
    labels,
    datasets: [
      {
        label: "Most common Nearest Station",
        data: values,
      },
    ],
  };

  return (
    <div style={{ width: "600px", marginTop: "20px" }}>
      <Bar data={data}></Bar>
    </div>
  );
}
