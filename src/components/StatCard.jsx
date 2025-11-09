function StatCard({ title, value, icon, color = "blue", subtitle }) {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    purple: "bg-purple-500",
  };

  return (
    <div className="bg-white backdrop-blur-lg rounded-xl p-6 border border-gray-200 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-600 text-sm font-medium">{title}</h3>
        <div
          className={`${colorClasses[color]} w-10 h-10 rounded-lg flex items-center justify-center text-xl`}
        >
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-black mb-1">{value}</div>
      {subtitle && <div className="text-gray-500 text-sm">{subtitle}</div>}
    </div>
  );
}

export default StatCard;
