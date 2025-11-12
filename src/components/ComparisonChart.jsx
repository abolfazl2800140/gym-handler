import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

function ComparisonChart({ data, title }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          font: {
            family: "Vazir, sans-serif",
            size: 12,
          },
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          family: "Vazir, sans-serif",
        },
        bodyFont: {
          family: "Vazir, sans-serif",
        },
        callbacks: {
          label: function (context) {
            return (
              context.dataset.label +
              ": " +
              new Intl.NumberFormat("fa-IR").format(context.parsed.y) +
              " تومان"
            );
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          font: {
            family: "Vazir, sans-serif",
          },
          callback: function (value) {
            return new Intl.NumberFormat("fa-IR").format(value);
          },
        },
      },
      x: {
        ticks: {
          font: {
            family: "Vazir, sans-serif",
          },
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl p-4 lg:p-6 shadow-lg">
      <h3 className="text-base lg:text-lg font-bold text-gray-800 mb-4">{title}</h3>
      <div className="h-64 lg:h-80">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

export default ComparisonChart;
