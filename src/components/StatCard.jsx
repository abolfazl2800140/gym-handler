function StatCard({ title, value, icon, color = "blue", subtitle }) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="bg-white backdrop-blur-lg rounded-xl p-4 lg:p-6 border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <h3 className="text-gray-600 text-xs lg:text-sm font-medium">{title}</h3>
        <div
          className={`${colorClasses[color]} w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center text-lg lg:text-xl flex-shrink-0`}
        >
          {icon}
        </div>
      </div>
      <div className="text-xl lg:text-3xl font-bold text-black mb-1 truncate">{value}</div>
      {subtitle && <div className="text-gray-500 text-xs lg:text-sm">{subtitle}</div>}
    </div>
  );
}

export default StatCard;
