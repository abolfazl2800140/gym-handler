import { useState, useRef, useEffect } from "react";

function PersianDatePicker({ value, onChange, label, required = false }) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(9);
  const [currentYear, setCurrentYear] = useState(1403);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [openUpward, setOpenUpward] = useState(false);
  const calendarRef = useRef(null);
  const inputRef = useRef(null);

  const generateYears = () => {
    const years = [];
    for (let i = 1340; i <= 1420; i++) {
      years.push(i);
    }
    return years;
  };

  const checkPosition = () => {
    if (inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;

      // اگر فضای پایین کمتر از 400 پیکسل باشه و فضای بالا بیشتر باشه، رو به بالا باز کن
      if (spaceBelow < 400 && spaceAbove > spaceBelow) {
        setOpenUpward(true);
      } else {
        setOpenUpward(false);
      }
    }
  };

  const handleToggleCalendar = () => {
    if (!showCalendar) {
      checkPosition();
    }
    setShowCalendar(!showCalendar);
  };

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

  const persianDays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getDaysInMonth = (month) => {
    if (month <= 6) return 31;
    if (month <= 11) return 30;
    return 29;
  };

  const handleDateSelect = (day) => {
    const dateStr = `${currentYear}/${String(currentMonth).padStart(
      2,
      "0"
    )}/${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    setShowCalendar(false);

    if (onChange) {
      const isoDate = new Date().toISOString();
      onChange(isoDate);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const days = [];

    for (let i = 1; i <= daysInMonth; i++) {
      const dayOfWeek = (i - 1) % 7;
      const isWeekend = dayOfWeek === 6;

      days.push(
        <button
          key={i}
          type="button"
          onClick={() => handleDateSelect(i)}
          className={`p-2 rounded-lg hover:bg-indigo-500 hover:text-white transition-colors font-medium ${
            isWeekend ? "text-red-500" : "text-gray-700"
          }`}
        >
          {i}
        </button>
      );
    }

    return days;
  };

  const nextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const prevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  return (
    <div className="relative" ref={calendarRef}>
      {label && (
        <label className="block text-gray-700 mb-2 text-sm font-semibold">
          {label} {required && "*"}
        </label>
      )}

      <input
        ref={inputRef}
        type="text"
        value={selectedDate || ""}
        onClick={handleToggleCalendar}
        placeholder="انتخاب تاریخ"
        readOnly
        className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border-2 border-gray-300 focus:outline-none focus:border-indigo-500 cursor-pointer transition-all"
      />

      {showCalendar && (
        <div
          className={`absolute left-0 ${
            openUpward ? "bottom-full mb-2" : "top-full mt-2"
          } bg-white rounded-xl shadow-2xl p-4 z-[9999] w-80 border border-gray-200`}
        >
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={nextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              ←
            </button>

            <div className="flex items-center gap-2">
              <select
                value={currentMonth}
                onChange={(e) => setCurrentMonth(Number(e.target.value))}
                className="px-2 py-1 rounded-lg border border-gray-300 text-gray-800 font-bold focus:outline-none focus:border-indigo-500"
              >
                {persianMonths.map((month, index) => (
                  <option key={index} value={index + 1}>
                    {month}
                  </option>
                ))}
              </select>

              <select
                value={currentYear}
                onChange={(e) => setCurrentYear(Number(e.target.value))}
                className="px-2 py-1 rounded-lg border border-gray-300 text-gray-800 font-bold focus:outline-none focus:border-indigo-500"
              >
                {generateYears().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={prevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              →
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {persianDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-bold text-gray-600 p-2"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
        </div>
      )}
    </div>
  );
}

export default PersianDatePicker;
