import { useState, useEffect } from "react";
import StatCard from "../components/StatCard";
import AttendanceForm from "../components/AttendanceForm";
import AttendanceHistory from "../components/AttendanceHistory";
import AttendanceReport from "../components/AttendanceReport";
import ConfirmDialog from "../components/ConfirmDialog";
import SimplePersianDatePicker from "../components/SimplePersianDatePicker";
import { attendanceAPI, membersAPI } from "../services/api";

function Attendance() {
  const [members, setMembers] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [editingRecord, setEditingRecord] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingDate, setDeletingDate] = useState(null);
  const [activeTab, setActiveTab] = useState("today");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMembers();
    fetchAttendance();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await membersAPI.getAll();
      setMembers(response.data);
    } catch (err) {
      console.error('Error fetching members:', err);
      // Fallback to localStorage
      const savedMembers = localStorage.getItem("members");
      if (savedMembers) {
        setMembers(JSON.parse(savedMembers));
      }
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await attendanceAPI.getAll();
      setAttendanceRecords(response.data);
    } catch (err) {
      console.error('Error fetching attendance:', err);
      setError('خطا در دریافت حضور و غیاب');
      // Fallback to localStorage
      const savedAttendance = localStorage.getItem("attendance");
      if (savedAttendance) {
        setAttendanceRecords(JSON.parse(savedAttendance));
      }
    } finally {
      setLoading(false);
    }
  };

  const getTodayRecord = () => {
    const today = new Date().toISOString().split("T")[0];
    return attendanceRecords.find((record) => record.date === today);
  };

  const calculateTodayStats = () => {
    const todayRecord = getTodayRecord();
    if (!todayRecord) {
      return {
        present: 0,
        absent: 0,
        leave: 0,
        total: members.length,
        percentage: 0,
      };
    }

    const statuses = Object.values(todayRecord.records);
    const present = statuses.filter((r) => r.status === "حاضر").length;
    const absent = statuses.filter((r) => r.status === "غایب").length;
    const leave = statuses.filter((r) => r.status === "مرخصی").length;
    const total = statuses.length;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    return { present, absent, leave, total, percentage };
  };

  const calculateOverallStats = () => {
    let totalPresent = 0;
    let totalAbsent = 0;
    let totalLeave = 0;
    let totalRecords = 0;

    attendanceRecords.forEach((record) => {
      const statuses = Object.values(record.records);
      totalPresent += statuses.filter((r) => r.status === "حاضر").length;
      totalAbsent += statuses.filter((r) => r.status === "غایب").length;
      totalLeave += statuses.filter((r) => r.status === "مرخصی").length;
      totalRecords += statuses.length;
    });

    const percentage =
      totalRecords > 0 ? ((totalPresent / totalRecords) * 100).toFixed(1) : 0;

    return {
      present: totalPresent,
      absent: totalAbsent,
      leave: totalLeave,
      total: totalRecords,
      percentage,
    };
  };

  const todayStats = calculateTodayStats();
  const overallStats = calculateOverallStats();

  const handleOpenForm = (date = null) => {
    const targetDate = date || new Date().toISOString().split("T")[0];
    setSelectedDate(targetDate);

    const existingRecord = attendanceRecords.find(
      (record) => record.date === targetDate
    );
    setEditingRecord(existingRecord || null);
    setShowForm(true);
  };

  const handleSaveAttendance = async (formData) => {
    try {
      setLoading(true);
      setError(null);
      await attendanceAPI.save(formData);
      await fetchAttendance();
      setShowForm(false);
      setEditingRecord(null);
    } catch (err) {
      console.error('Error saving attendance:', err);
      setError('خطا در ذخیره حضور و غیاب');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (date) => {
    setDeletingDate(date);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      await attendanceAPI.delete(deletingDate);
      await fetchAttendance();
      setShowDeleteDialog(false);
      setDeletingDate(null);
    } catch (err) {
      console.error('Error deleting attendance:', err);
      setError('خطا در حذف رکورد حضور و غیاب');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setDeletingDate(null);
  };

  const handleEditRecord = (record) => {
    setEditingRecord(record);
    setSelectedDate(record.date);
    setShowForm(true);
  };

  const filteredRecords = attendanceRecords.filter((record) => {
    if (!dateRange.startDate || !dateRange.endDate) return true;
    const recordDate = new Date(record.date);
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    return recordDate >= start && recordDate <= end;
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-black">📋 حضور و غیاب</h1>
        <div className="flex gap-3">
          <SimplePersianDatePicker
            value={selectedDate}
            onChange={(date) => setSelectedDate(date)}
            className="px-4 py-2 border text-black rounded-lg"
          />
          <button
            onClick={() => handleOpenForm(selectedDate)}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all"
          >
            + ثبت حضور و غیاب
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <StatCard
          title="حاضر امروز"
          value={todayStats.present}
          icon="✓"
          color="green"
          subtitle={`از ${todayStats.total} نفر`}
        />
        <StatCard
          title="غایب امروز"
          value={todayStats.absent}
          icon="✗"
          color="red"
          subtitle={`از ${todayStats.total} نفر`}
        />
        <StatCard
          title="مرخصی امروز"
          value={todayStats.leave}
          icon="📅"
          color="purple"
          subtitle={`از ${todayStats.total} نفر`}
        />
        <StatCard
          title="درصد حضور امروز"
          value={`${todayStats.percentage}%`}
          icon="📊"
          color="blue"
        />
      </div>

      <div className="mb-6 flex gap-3 border-b">
        <button
          onClick={() => setActiveTab("today")}
          className={`px-6 py-3 font-medium transition-all ${activeTab === "today"
            ? "border-b-2 border-indigo-600 text-indigo-600"
            : "text-gray-600 hover:text-gray-900"
            }`}
        >
          امروز
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-6 py-3 font-medium transition-all ${activeTab === "history"
            ? "border-b-2 border-indigo-600 text-indigo-600"
            : "text-gray-600 hover:text-gray-900"
            }`}
        >
          تاریخچه
        </button>
        <button
          onClick={() => setActiveTab("report")}
          className={`px-6 py-3 font-medium transition-all ${activeTab === "report"
            ? "border-b-2 border-indigo-600 text-indigo-600"
            : "text-gray-600 hover:text-gray-900"
            }`}
        >
          گزارش آماری
        </button>
      </div>

      {activeTab === "today" && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-black mb-4">
            وضعیت امروز - {new Date().toLocaleDateString("fa-IR")}
          </h2>

          {getTodayRecord() ? (
            <div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-lg p-4">
                  <div className="text-green-600 font-bold text-2xl">
                    {todayStats.present}
                  </div>
                  <div className="text-gray-600 text-sm">حاضر</div>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <div className="text-red-600 font-bold text-2xl">
                    {todayStats.absent}
                  </div>
                  <div className="text-gray-600 text-sm">غایب</div>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <div className="text-yellow-600 font-bold text-2xl">
                    {todayStats.leave}
                  </div>
                  <div className="text-gray-600 text-sm">مرخصی</div>
                </div>
              </div>

              <div className="space-y-2">
                {Object.entries(getTodayRecord().records).map(
                  ([memberId, data]) => {
                    const member = members.find((m) => m.id === memberId);
                    if (!member) return null;

                    return (
                      <div
                        key={memberId}
                        className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-black">
                            {member.firstName} {member.lastName}
                          </div>
                          {data.reason && (
                            <div className="text-sm text-gray-600">
                              {data.reason}
                            </div>
                          )}
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${data.status === "حاضر"
                            ? "bg-green-100 text-green-800"
                            : data.status === "غایب"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                            }`}
                        >
                          {data.status}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>

              {getTodayRecord().notes && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-gray-700 mb-1">
                    یادداشت روز:
                  </div>
                  <div className="text-gray-600">{getTodayRecord().notes}</div>
                </div>
              )}

              <button
                onClick={() => handleOpenForm()}
                className="mt-4 w-full px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                ویرایش حضور و غیاب امروز
              </button>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <p className="text-gray-600 mb-4">
                هنوز حضور و غیاب امروز ثبت نشده است
              </p>
              <button
                onClick={() => handleOpenForm()}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                ثبت حضور و غیاب امروز
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === "history" && (
        <div>
          <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              🗓️ فیلتر بازه زمانی
            </h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  از تاریخ
                </label>
                <SimplePersianDatePicker
                  value={dateRange.startDate}
                  onChange={(date) =>
                    setDateRange({ ...dateRange, startDate: date })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  تا تاریخ
                </label>
                <SimplePersianDatePicker
                  value={dateRange.endDate}
                  onChange={(date) =>
                    setDateRange({ ...dateRange, endDate: date })
                  }
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setDateRange({ startDate: "", endDate: "" })}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  پاک کردن
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4">
            <AttendanceHistory
              attendanceRecords={filteredRecords}
              members={members}
              onEdit={handleEditRecord}
              onDelete={handleDeleteClick}
            />
          </div>
        </div>
      )}

      {activeTab === "report" && (
        <div>
          <div className="grid grid-cols-4 gap-4 mb-6">
            <StatCard
              title="کل حاضر"
              value={overallStats.present}
              icon="✓"
              color="green"
            />
            <StatCard
              title="کل غایب"
              value={overallStats.absent}
              icon="✗"
              color="red"
            />
            <StatCard
              title="کل مرخصی"
              value={overallStats.leave}
              icon="📅"
              color="purple"
            />
            <StatCard
              title="میانگین حضور"
              value={`${overallStats.percentage}%`}
              icon="📊"
              color="blue"
            />
          </div>

          <AttendanceReport
            attendanceRecords={attendanceRecords}
            members={members}
            dateRange={dateRange}
          />
        </div>
      )}

      {showForm && (
        <AttendanceForm
          date={selectedDate}
          members={members}
          onSave={handleSaveAttendance}
          onCancel={() => {
            setShowForm(false);
            setEditingRecord(null);
          }}
          existingAttendance={editingRecord}
        />
      )}

      {showDeleteDialog && (
        <ConfirmDialog
          title="حذف رکورد حضور و غیاب"
          message="آیا از حذف این رکورد اطمینان دارید؟ این عملیات قابل بازگشت نیست."
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}

export default Attendance;
