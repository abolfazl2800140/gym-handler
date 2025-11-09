import { useState, useEffect, useRef } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { pdf } from "@react-pdf/renderer";
import * as XLSX from "xlsx";
import StatCard from "../components/StatCard";
import ReportPDF from "../components/ReportPDF";
import DateRangeFilter from "../components/DateRangeFilter";
import TrendChart from "../components/TrendChart";
import ComparisonChart from "../components/ComparisonChart";
import AdvancedStats from "../components/AdvancedStats";
import { membersAPI, transactionsAPI } from "../services/api";

ChartJS.register(ArcElement, Tooltip, Legend);

function Reports() {
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getCurrentPersianYear = () => {
    const gregorianYear = new Date().getFullYear();
    return gregorianYear - 621;
  };

  const [filter, setFilter] = useState({
    type: "month",
    year: getCurrentPersianYear(),
    month: new Date().getMonth() + 1,
  });

  const memberTypeChartRef = useRef(null);
  const memberLevelChartRef = useRef(null);
  const incomeChartRef = useRef(null);
  const expenseChartRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [membersResponse, transactionsResponse] = await Promise.all([
        membersAPI.getAll(),
        transactionsAPI.getAll()
      ]);

      setMembers(membersResponse.data);
      setTransactions(transactionsResponse.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('خطا در دریافت اطلاعات');

      // Fallback to localStorage
      const savedMembers = localStorage.getItem("members");
      if (savedMembers) {
        setMembers(JSON.parse(savedMembers));
      }

      const savedTransactions = localStorage.getItem("transactions");
      if (savedTransactions) {
        setTransactions(JSON.parse(savedTransactions));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    applyFilter();
  }, [transactions, filter]);

  const applyFilter = () => {
    let filtered = [...transactions];

    // تبدیل سال شمسی به میلادی برای فیلتر
    const gregorianYear = filter.year + 621;

    if (filter.type === "month") {
      filtered = filtered.filter((t) => {
        const date = new Date(t.date);
        return (
          date.getMonth() + 1 === filter.month &&
          date.getFullYear() === gregorianYear
        );
      });
    } else if (filter.type === "year") {
      filtered = filtered.filter((t) => {
        const date = new Date(t.date);
        return date.getFullYear() === gregorianYear;
      });
    }

    setFilteredTransactions(filtered);
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
  };

  // محاسبات آماری
  const activeMembers = members.filter(
    (m) => m.subscriptionStatus === "فعال"
  ).length;

  const currentIncome = filteredTransactions
    .filter((t) => t.type === "درآمد")
    .reduce((sum, t) => sum + t.amount, 0);

  const currentExpense = filteredTransactions
    .filter((t) => t.type === "هزینه")
    .reduce((sum, t) => sum + t.amount, 0);

  // محاسبه ماه قبل برای مقایسه
  const lastMonthTransactions = transactions.filter((t) => {
    const date = new Date(t.date);
    const gregorianYear = filter.year + 621;
    const lastMonth = new Date(gregorianYear, filter.month - 2);
    return (
      date.getMonth() === lastMonth.getMonth() &&
      date.getFullYear() === lastMonth.getFullYear()
    );
  });

  const lastMonthIncome = lastMonthTransactions
    .filter((t) => t.type === "درآمد")
    .reduce((sum, t) => sum + t.amount, 0);

  // محاسبه روند رشد
  const growthRate =
    lastMonthIncome > 0
      ? (((currentIncome - lastMonthIncome) / lastMonthIncome) * 100).toFixed(1)
      : 0;

  // آمار پیشرفته
  const calculateAdvancedStats = () => {
    const gregorianYear = filter.year + 621;
    const monthlyIncomes = [];
    for (let i = 0; i < 12; i++) {
      const monthTransactions = transactions.filter((t) => {
        const date = new Date(t.date);
        return (
          date.getMonth() === i &&
          date.getFullYear() === gregorianYear &&
          t.type === "درآمد"
        );
      });
      const income = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
      if (income > 0) monthlyIncomes.push(income);
    }

    const avgMonthlyIncome =
      monthlyIncomes.length > 0
        ? monthlyIncomes.reduce((a, b) => a + b, 0) / monthlyIncomes.length
        : 0;
    const maxMonthlyIncome =
      monthlyIncomes.length > 0 ? Math.max(...monthlyIncomes) : 0;
    const minMonthlyIncome =
      monthlyIncomes.length > 0 ? Math.min(...monthlyIncomes) : 0;

    // محاسبه نرخ تمدید (فرضی بر اساس اعضای فعال)
    const renewalRate =
      members.length > 0
        ? ((activeMembers / members.length) * 100).toFixed(1)
        : 0;

    // پیش‌بینی درآمد (میانگین 3 ماه اخیر)
    const recentIncomes = monthlyIncomes.slice(-3);
    const predictedIncome =
      recentIncomes.length > 0
        ? recentIncomes.reduce((a, b) => a + b, 0) / recentIncomes.length
        : avgMonthlyIncome;

    return {
      avgMonthlyIncome: Math.round(avgMonthlyIncome),
      maxMonthlyIncome,
      minMonthlyIncome,
      renewalRate: parseFloat(renewalRate),
      predictedIncome: Math.round(predictedIncome),
      growthRate: parseFloat(growthRate),
    };
  };

  // داده‌های نمودار روند
  const getTrendData = () => {
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

    const labels = [];
    const incomeData = [];
    const expenseData = [];

    const gregorianYear = filter.year + 621;

    for (let i = 0; i < 12; i++) {
      labels.push(persianMonths[i]);

      const monthTransactions = transactions.filter((t) => {
        const date = new Date(t.date);
        return date.getMonth() === i && date.getFullYear() === gregorianYear;
      });

      const income = monthTransactions
        .filter((t) => t.type === "درآمد")
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = monthTransactions
        .filter((t) => t.type === "هزینه")
        .reduce((sum, t) => sum + t.amount, 0);

      incomeData.push(income);
      expenseData.push(expense);
    }

    return {
      labels,
      datasets: [
        {
          label: "درآمد",
          data: incomeData,
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.1)",
          tension: 0.4,
        },
        {
          label: "هزینه",
          data: expenseData,
          borderColor: "#ef4444",
          backgroundColor: "rgba(239, 68, 68, 0.1)",
          tension: 0.4,
        },
      ],
    };
  };

  // داده‌های نمودار مقایسه
  const getComparisonData = () => {
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

    const gregorianYear = filter.year + 621;
    const labels = persianMonths.slice(0, 6);
    const currentYearData = [];
    const lastYearData = [];

    for (let i = 0; i < 6; i++) {
      const currentYear = transactions
        .filter((t) => {
          const date = new Date(t.date);
          return (
            date.getMonth() === i &&
            date.getFullYear() === gregorianYear &&
            t.type === "درآمد"
          );
        })
        .reduce((sum, t) => sum + t.amount, 0);

      const lastYear = transactions
        .filter((t) => {
          const date = new Date(t.date);
          return (
            date.getMonth() === i &&
            date.getFullYear() === gregorianYear - 1 &&
            t.type === "درآمد"
          );
        })
        .reduce((sum, t) => sum + t.amount, 0);

      currentYearData.push(currentYear);
      lastYearData.push(lastYear);
    }

    const persianCurrentYear = new Intl.NumberFormat("fa-IR").format(
      filter.year
    );
    const persianLastYear = new Intl.NumberFormat("fa-IR").format(
      filter.year - 1
    );

    return {
      labels,
      datasets: [
        {
          label: `سال ${persianCurrentYear}`,
          data: currentYearData,
          backgroundColor: "#3b82f6",
        },
        {
          label: `سال ${persianLastYear}`,
          data: lastYearData,
          backgroundColor: "#94a3b8",
        },
      ],
    };
  };

  const memberTypeData = {
    labels: ["مربی", "ورزشکار", "پرسنل"],
    datasets: [
      {
        data: [
          members.filter((m) => m.memberType === "مربی").length,
          members.filter((m) => m.memberType === "ورزشکار").length,
          members.filter((m) => m.memberType === "پرسنل").length,
        ],
        backgroundColor: ["#8b5cf6", "#3b82f6", "#10b981"],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const memberLevelData = {
    labels: ["برنزی", "نقره‌ای", "طلایی", "پلاتینیوم"],
    datasets: [
      {
        data: [
          members.filter((m) => m.membershipLevel === "برنزی").length,
          members.filter((m) => m.membershipLevel === "نقره‌ای").length,
          members.filter((m) => m.membershipLevel === "طلایی").length,
          members.filter((m) => m.membershipLevel === "پلاتینیوم").length,
        ],
        backgroundColor: ["#f97316", "#94a3b8", "#eab308", "#6366f1"],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const incomeByCategory = {
    labels: ["شهریه", "سایر"],
    datasets: [
      {
        data: [
          filteredTransactions
            .filter((t) => t.type === "درآمد" && t.category === "شهریه")
            .reduce((sum, t) => sum + t.amount, 0),
          filteredTransactions
            .filter((t) => t.type === "درآمد" && t.category === "سایر")
            .reduce((sum, t) => sum + t.amount, 0),
        ],
        backgroundColor: ["#22c55e", "#84cc16"],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const expenseByCategory = {
    labels: ["تجهیزات", "حقوق", "سایر"],
    datasets: [
      {
        data: [
          filteredTransactions
            .filter((t) => t.type === "هزینه" && t.category === "تجهیزات")
            .reduce((sum, t) => sum + t.amount, 0),
          filteredTransactions
            .filter((t) => t.type === "هزینه" && t.category === "حقوق")
            .reduce((sum, t) => sum + t.amount, 0),
          filteredTransactions
            .filter((t) => t.type === "هزینه" && t.category === "سایر")
            .reduce((sum, t) => sum + t.amount, 0),
        ],
        backgroundColor: ["#ef4444", "#f59e0b", "#ec4899"],
        borderWidth: 2,
        borderColor: "#fff",
      },
    ],
  };

  const chartOptions = {
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
      },
    },
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
  };

  const getHighQualityChartImage = (chartRef) => {
    if (!chartRef.current) return null;

    const canvas = chartRef.current.canvas;
    const tempCanvas = document.createElement("canvas");
    const scale = 4;

    tempCanvas.width = canvas.width * scale;
    tempCanvas.height = canvas.height * scale;

    const ctx = tempCanvas.getContext("2d");
    ctx.scale(scale, scale);
    ctx.drawImage(canvas, 0, 0);

    return tempCanvas.toDataURL("image/png", 1.0);
  };

  const handleExportPDF = async () => {
    try {
      const chartImages = {
        memberType: getHighQualityChartImage(memberTypeChartRef),
        memberLevel: getHighQualityChartImage(memberLevelChartRef),
        income: getHighQualityChartImage(incomeChartRef),
        expense: getHighQualityChartImage(expenseChartRef),
      };

      const blob = await pdf(<ReportPDF chartImages={chartImages} />).toBlob();

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `گزارش_نمودارها_${new Date()
        .toLocaleDateString("fa-IR")
        .replace(/\//g, "-")}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("خطا در تولید PDF:", error);
      alert("خطا در تولید فایل PDF");
    }
  };

  const handleExportExcel = () => {
    try {
      // گزارش اعضا
      const membersData = members.map((m) => ({
        نام: m.firstName,
        "نام خانوادگی": m.lastName,
        "نوع عضویت": m.memberType,
        "سطح عضویت": m.membershipLevel,
        "وضعیت اشتراک": m.subscriptionStatus,
        "تاریخ عضویت": new Date(m.joinDate).toLocaleDateString("fa-IR"),
      }));

      // گزارش تراکنش‌ها
      const transactionsData = filteredTransactions.map((t) => ({
        عنوان: t.title,
        نوع: t.type,
        دسته‌بندی: t.category,
        مبلغ: t.amount,
        تاریخ: new Date(t.date).toLocaleDateString("fa-IR"),
        توضیحات: t.description || "-",
      }));

      // گزارش مالی ماهانه
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

      const gregorianYear = filter.year + 621;
      const monthlyData = persianMonths.map((month, index) => {
        const monthTransactions = transactions.filter((t) => {
          const date = new Date(t.date);
          return (
            date.getMonth() === index && date.getFullYear() === gregorianYear
          );
        });

        const income = monthTransactions
          .filter((t) => t.type === "درآمد")
          .reduce((sum, t) => sum + t.amount, 0);
        const expense = monthTransactions
          .filter((t) => t.type === "هزینه")
          .reduce((sum, t) => sum + t.amount, 0);

        return {
          ماه: month,
          درآمد: income,
          هزینه: expense,
          "سود/زیان": income - expense,
        };
      });

      // ساخت workbook
      const wb = XLSX.utils.book_new();

      const ws1 = XLSX.utils.json_to_sheet(membersData);
      XLSX.utils.book_append_sheet(wb, ws1, "اعضا");

      const ws2 = XLSX.utils.json_to_sheet(transactionsData);
      XLSX.utils.book_append_sheet(wb, ws2, "تراکنش‌ها");

      const ws3 = XLSX.utils.json_to_sheet(monthlyData);
      XLSX.utils.book_append_sheet(wb, ws3, "گزارش ماهانه");

      XLSX.writeFile(
        wb,
        `گزارش_کامل_${new Date()
          .toLocaleDateString("fa-IR")
          .replace(/\//g, "-")}.xlsx`
      );
    } catch (error) {
      console.error("خطا در تولید Excel:", error);
      alert("خطا در تولید فایل Excel");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">📊 گزارشات پیشرفته</h1>
        <div className="flex gap-3">
          <button
            onClick={handleExportPDF}
            className="px-6 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all flex items-center gap-2"
          >
            📄 PDF نمودارها
          </button>
          <button
            onClick={handleExportExcel}
            className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all flex items-center gap-2"
          >
            📊 Excel کامل
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all flex items-center gap-2"
          >
            🖨️ چاپ
          </button>
        </div>
      </div>

      <DateRangeFilter onFilterChange={handleFilterChange} />

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          title="تعداد کل اعضا"
          value={members.length}
          icon="👥"
          color="blue"
        />
        <StatCard
          title="اعضای فعال"
          value={activeMembers}
          icon="✅"
          color="green"
        />
        <StatCard
          title="درآمد دوره انتخابی"
          value={formatCurrency(currentIncome)}
          icon="💵"
          color="green"
        />
        <StatCard
          title="هزینه دوره انتخابی"
          value={formatCurrency(currentExpense)}
          icon="💸"
          color="red"
        />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <AdvancedStats stats={calculateAdvancedStats()} />
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            📈 مقایسه با ماه قبل
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-white rounded-lg">
              <span className="text-gray-700">درآمد ماه جاری</span>
              <span className="font-bold text-green-600">
                {formatCurrency(currentIncome)}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white rounded-lg">
              <span className="text-gray-700">درآمد ماه قبل</span>
              <span className="font-bold text-gray-600">
                {formatCurrency(lastMonthIncome)}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-white rounded-lg">
              <span className="text-gray-700">روند رشد</span>
              <span
                className={`font-bold text-xl ${growthRate >= 0 ? "text-green-600" : "text-red-600"
                  }`}
              >
                {growthRate >= 0 ? "↗" : "↘"} {Math.abs(growthRate)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <TrendChart
          data={getTrendData()}
          title="📈 روند درآمد و هزینه در طول سال"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <ComparisonChart
          data={getComparisonData()}
          title="📊 مقایسه درآمد سال جاری با سال قبل"
        />
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            توزیع نوع اعضا
          </h3>
          <div className="h-64">
            <Doughnut
              ref={memberTypeChartRef}
              data={memberTypeData}
              options={chartOptions}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            توزیع سطح عضویت
          </h3>
          <div className="h-64">
            <Doughnut
              ref={memberLevelChartRef}
              data={memberLevelData}
              options={chartOptions}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            درآمد به تفکیک دسته‌بندی
          </h3>
          <div className="h-64">
            <Doughnut
              ref={incomeChartRef}
              data={incomeByCategory}
              options={chartOptions}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            هزینه به تفکیک دسته‌بندی
          </h3>
          <div className="h-64">
            <Doughnut
              ref={expenseChartRef}
              data={expenseByCategory}
              options={chartOptions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
