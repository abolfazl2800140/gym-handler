import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

function FinancialChart({ transactions }) {
  const persianMonths = [
    "فروردین",
    "اردیبهشت",
    "خرداد",
    "تیر",
    "مرداد",
    "شهریور",
    "مهر",
    "آبان",
    "آذر",
    "دی",
    "بهمن",
    "اسفند",
  ];

  const getMonthlyData = () => {
    const monthlyData = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      const month = date.getMonth();

      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 };
      }

      if (transaction.type === "درآمد") {
        monthlyData[month].income += transaction.amount;
      } else {
        monthlyData[month].expense += transaction.amount;
      }
    });

    return monthlyData;
  };

  const monthlyData = getMonthlyData();
  const months = Object.keys(monthlyData)
    .map(Number)
    .sort((a, b) => a - b);

  if (months.length === 0) {
    return (
      <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">
          نمودار درآمد و هزینه
        </h3>
        <div className="text-center py-12 text-gray-500">
          داده‌ای برای نمایش وجود ندارد
        </div>
      </div>
    );
  }

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("fa-IR").format(value) + " تومان";
  };

  const data = {
    labels: months.map((m) => persianMonths[m]),
    datasets: [
      {
        type: "bar",
        label: "درآمد",
        data: months.map((m) => monthlyData[m].income),
        backgroundColor: "rgba(52, 152, 219, 0.8)",
        borderColor: "rgba(52, 152, 219, 1)",
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 60,
      },
      {
        type: "bar",
        label: "هزینه",
        data: months.map((m) => monthlyData[m].expense),
        backgroundColor: "rgba(241, 196, 15, 0.8)",
        borderColor: "rgba(241, 196, 15, 1)",
        borderWidth: 2,
        borderRadius: 8,
        barThickness: 60,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            family: "Vazir, sans-serif",
            size: 14,
          },
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleFont: {
          family: "Vazir, sans-serif",
          size: 14,
        },
        bodyFont: {
          family: "Vazir, sans-serif",
          size: 13,
        },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: function (context) {
            return (
              context.dataset.label + ": " + formatCurrency(context.parsed.y)
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
            size: 12,
          },
          callback: function (value) {
            return new Intl.NumberFormat("fa-IR", {
              notation: "compact",
            }).format(value);
          },
        },
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
      },
      x: {
        ticks: {
          font: {
            family: "Vazir, sans-serif",
            size: 12,
          },
        },
        grid: {
          display: false,
        },
      },
    },
    interaction: {
      mode: "index",
      intersect: false,
    },
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6">
        نمودار درآمد و هزینه ماهانه
      </h3>
      <div className="h-96">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

export default FinancialChart;
