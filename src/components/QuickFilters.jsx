function QuickFilters({ onQuickFilter }) {
  const getCurrentPersianYear = () => {
    const gregorianYear = new Date().getFullYear();
    return gregorianYear - 621;
  };

  const quickFilters = [
    {
      label: "امروز",
      value: "today",
      icon: "📅",
    },
    {
      label: "این هفته",
      value: "week",
      icon: "📆",
    },
    {
      label: "این ماه",
      value: "month",
      icon: "🗓️",
    },
    {
      label: "سه ماه اخیر",
      value: "quarter",
      icon: "📊",
    },
    {
      label: "امسال",
      value: "year",
      icon: "📈",
    },
  ];

  const handleQuickFilter = (filterType) => {
    const now = new Date();
    const persianYear = getCurrentPersianYear();
    const currentMonth = now.getMonth() + 1;

    let filter = {};

    switch (filterType) {
      case "today":
        filter = {
          type: "custom",
          startDate: now,
          endDate: now,
        };
        break;
      case "week":
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        filter = {
          type: "custom",
          startDate: weekStart,
          endDate: now,
        };
        break;
      case "month":
        filter = {
          type: "month",
          year: persianYear,
          month: currentMonth,
        };
        break;
      case "quarter":
        filter = {
          type: "quarter",
          year: persianYear,
          month: currentMonth,
        };
        break;
      case "year":
        filter = {
          type: "year",
          year: persianYear,
        };
        break;
      default:
        break;
    }

    onQuickFilter(filter);
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-lg mb-6">
      <h3 className="text-sm font-bold text-gray-700 mb-3">⚡ فیلترهای سریع</h3>
      <div className="flex gap-2 flex-wrap">
        {quickFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleQuickFilter(filter.value)}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
          >
            {filter.icon} {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default QuickFilters;
