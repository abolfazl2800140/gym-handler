function MemberAvatar({ firstName, lastName, size = "md" }) {
  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;

  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-yellow-500",
    "bg-red-500",
  ];

  const colorIndex =
    (firstName.charCodeAt(0) + lastName.charCodeAt(0)) % colors.length;
  const bgColor = colors[colorIndex];

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-16 h-16 text-2xl",
  };

  return (
    <div
      className={`${sizeClasses[size]} ${bgColor} rounded-full flex items-center justify-center text-white font-bold`}
    >
      {initials}
    </div>
  );
}

export default MemberAvatar;
