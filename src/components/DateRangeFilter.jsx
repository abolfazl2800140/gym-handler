import { useState } from "react";

function DateRangeFilter({ onFilterChange }) {
  // تبدیل سال میلادی به شمسی (تقریبی)
  const getCurrentPersianYear = () => {
    const gregorianYear = new Date().getFullYear();
    return gregorianYear - 621;
  };

  const currentPersianYear = getCurrentPersianYear();
  const currentMonth = new Date().getMonth() + 1;

  const [selectedYear, setSelectedYear] = useState(currentPersianYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [filterType, setFilterType] = useState("month"); // month, year, custom

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

  // لیست سال‌های شمسی (10 سال اخیر)
  const persianYears = Array.from(
    { length: 10 },
    (_, i) => currentPersianYear - i
  );

  const handleApplyFilter = () => {
    onFilterChange({
      type: filterType,
      year: selectedYear,
      month: selectedMonth,
    });
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
      <h3 className="text-lg font-bold text-gray-800 mb-4">
        🗓️ فیلتر بازه زمانی
      </h3>

      <div className="flex gap-4 items-end">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نوع گزارش
          </label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-4 text-black py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="month">ماهانه</option>
            <option value="year">سالانه</option>
            <option value="all">کل دوره</option>
          </select>
        </div>

        {filterType !== "all" && (
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              سال
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {persianYears.map((year) => (
                <option key={year} value={year}>
                  {new Intl.NumberFormat("fa-IR").format(year)}
                </option>
              ))}
            </select>
          </div>
        )}

        {filterType === "month" && (
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ماه
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-4 py-2 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {persianMonths.map((month, index) => (
                <option key={index} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={handleApplyFilter}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all"
        >
          اعمال فیلتر
        </button>
      </div>
    </div>
  );
}

export default DateRangeFilter;
