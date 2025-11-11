function SearchBar({
  searchTerm,
  onSearchChange,
  memberTypeFilter,
  onMemberTypeChange,
  statusFilter,
  onStatusChange,
}) {
  return (
    <div className="flex gap-4 mb-6">
      <input
        type="text"
        placeholder="جستجو بر اساس نام یا شماره تماس..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 px-4 py-2 rounded-lg bg-white text-black 
        placeholder-gray-600 border border-gray-500 focus:outline-none 
        focus:border-gray-800 rtl"
      />

      <select
        value={memberTypeFilter}
        onChange={(e) => onMemberTypeChange(e.target.value)}
        className="px-4 py-2 rounded-lg bg-white text-black border border-gray-500 focus:outline-none focus:border-gray-800"
      >
        <option value="">همه انواع</option>
        <option value="مربی">مربی</option>
        <option value="ورزشکار">ورزشکار</option>
        <option value="پرسنل">پرسنل</option>
      </select>

      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="px-4 py-2 rounded-lg bg-white text-black border border-gray-500 focus:outline-none focus:border-gray-800"
      >
        <option value="">همه وضعیت‌ها</option>
        <option value="فعال">فعال</option>
        <option value="غیرفعال">غیرفعال</option>
      </select>
    </div>
  );
}

export default SearchBar;
