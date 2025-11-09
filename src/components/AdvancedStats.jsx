function AdvancedStats({ stats }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("fa-IR").format(amount) + " تومان";
  };

  const formatPercent = (value) => {
    return new Intl.NumberFormat("fa-IR").format(value) + "%";
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-bold text-gray-800 mb-4">📈 آمار پیشرفته</h3>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">میانگین درآمد ماهانه</div>
          <div className="text-xl font-bold text-blue-600">
            {formatCurrency(stats.avgMonthlyIncome)}
          </div>
        </div>

        <div className="p-4 bg-green-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">بیشترین درآمد ماهانه</div>
          <div className="text-xl font-bold text-green-600">
            {formatCurrency(stats.maxMonthlyIncome)}
          </div>
        </div>

        <div className="p-4 bg-orange-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">کمترین درآمد ماهانه</div>
          <div className="text-xl font-bold text-orange-600">
            {formatCurrency(stats.minMonthlyIncome)}
          </div>
        </div>

        <div className="p-4 bg-purple-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">نرخ تمدید عضویت</div>
          <div className="text-xl font-bold text-purple-600">
            {formatPercent(stats.renewalRate)}
          </div>
        </div>

        <div className="p-4 bg-indigo-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">
            پیش‌بینی درآمد ماه آینده
          </div>
          <div className="text-xl font-bold text-indigo-600">
            {formatCurrency(stats.predictedIncome)}
          </div>
        </div>

        <div className="p-4 bg-pink-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">روند رشد (ماه جاری)</div>
          <div
            className={`text-xl font-bold ${
              stats.growthRate >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {stats.growthRate >= 0 ? "↗" : "↘"}{" "}
            {formatPercent(Math.abs(stats.growthRate))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdvancedStats;
