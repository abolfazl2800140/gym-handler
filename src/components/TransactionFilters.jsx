function TransactionFilters({
  searchTerm,
  onSearchChange,
  typeFilter,
  onTypeChange,
  categoryFilter,
  onCategoryChange,
  dateRangeFilter,
  onDateRangeChange,
}) {
  return (
    <div className="flex gap-4 mb-6">
      <input
        type="text"
        placeholder="جستجو بر اساس عنوان..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 px-4 py-2 rounded-lg bg-white text-black placeholder-gray-400 border border-gray-300 focus:outline-none focus:border-indigo-500 shadow-sm"
      />

      <select
        value={typeFilter}
        onChange={(e) => onTypeChange(e.target.value)}
        className="px-4 py-2 rounded-lg bg-white text-black border border-gray-300 focus:outline-none focus:border-indigo-500 shadow-sm"
      >
        <option value="">همه انواع</option>
        <option value="درآمد">درآمد</option>
        <option value="هزینه">هزینه</option>
      </select>

      <select
        value={categoryFilter}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="px-4 py-2 rounded-lg bg-white text-black border border-gray-300 focus:outline-none focus:border-indigo-500 shadow-sm"
      >
        <option value="">همه دسته‌ها</option>
        <option value="شهریه">شهریه</option>
        <option value="تجهیزات">تجهیزات</option>
        <option value="حقوق">حقوق</option>
        <option value="سایر">سایر</option>
      </select>

      <select
        value={dateRangeFilter}
        onChange={(e) => onDateRangeChange(e.target.value)}
        className="px-4 py-2 rounded-lg bg-white text-black border border-gray-300 focus:outline-none focus:border-indigo-500 shadow-sm"
      >
        <option value="همه">همه زمان‌ها</option>
        <option value="امروز">امروز</option>
        <option value="هفته">هفته اخیر</option>
        <option value="ماه">ماه اخیر</option>
        <option value="سال">سال اخیر</option>
      </select>
    </div>
  );
}

export default TransactionFilters;
