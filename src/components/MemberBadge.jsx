function MemberBadge({ type, variant = "type" }) {
  const typeColors = {
    مربی: "bg-purple-100 text-purple-800",
    ورزشکار: "bg-blue-100 text-blue-800",
    پرسنل: "bg-green-100 text-green-800",
  };

  const levelColors = {
    برنزی: "bg-orange-100 text-orange-800",
    نقره‌ای: "bg-gray-100 text-gray-800",
    طلایی: "bg-yellow-100 text-yellow-800",
    پلاتینیوم: "bg-indigo-100 text-indigo-800",
  };

  const statusColors = {
    فعال: "bg-green-100 text-green-800",
    غیرفعال: "bg-red-100 text-red-800",
  };

  let colorClass = "";
  if (variant === "type") colorClass = typeColors[type];
  else if (variant === "level") colorClass = levelColors[type];
  else if (variant === "status") colorClass = statusColors[type];

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}
    >
      {type}
    </span>
  );
}

export default MemberBadge;
