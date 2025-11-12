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
    <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 mb-6">
      <input
        type="text"
        placeholder="جستجو بر اساس عنوان..."
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 px-4 py-3 lg:py-2 rounded-lg bg-white text-black placeholder-gray-400 border border-gray-300 focus:outline-none focus:border-indigo-500 shadow-sm text-base"
      />

      <div className="grid grid-cols-3 lg:flex gap-3 lg:gap-4">
        <select
          value={typeFilter}
          onChange={(e) => onTypeChange(e.target.value)}
          className="px-3 lg:px-4 py-3 lg:py-2 rounded-lg bg-white text-black border border-gray-300 focus:outline-none focus:border-indigo-500 shadow-sm text-base"
        >
          <option value="">همه</option>
          <option value="درآمد">درآمد</option>
          <option value="هزینه">هزینه</option>
        </select>

        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="px-3 lg:px-4 py-3 lg:py-2 rounded-lg bg-white text-black border border-gray-300 focus:outline-none focus:border-indigo-500 shadow-sm text-base"
        >
          <option value="">دسته</option>
          <option value="شهریه">شهریه</option>
          <option value="تجهیزات">تجهیزات</option>
          <option value="حقوق">حقوق</option>
          <option value="سایر">سایر</option>
        </select>

        <select
          value={dateRangeFilter}
          onChange={(e) => onDateRangeChange(e.target.value)}
          className="px-3 lg:px-4 py-3 lg:py-2 rounded-lg bg-white text-black border border-gray-300 focus:outline-none focus:border-indigo-500 shadow-sm text-base"
        >
          <option value="همه">زمان</option>
          <option value="امروز">امروز</option>
          <option value="هفته">هفته</option>
          <option value="ماه">ماه</option>
          <option value="سال">سال</option>
        </select>
      </div>
    </div>
  );
}

export default TransactionFilters;
