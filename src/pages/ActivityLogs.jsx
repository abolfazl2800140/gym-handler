import { useState, useEffect } from "react";
import { FaChartBar, FaSearch, FaUser, FaCheckCircle, FaEdit, FaTrash, FaClipboardList, FaRobot } from "react-icons/fa";
import { activityLogsAPI } from "../services/api";
import SimplePersianDatePicker from "../components/SimplePersianDatePicker";

function ActivityLogs() {
    const [logs, setLogs] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        action: "",
        entityType: "",
        username: "",
        startDate: "",
        endDate: "",
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0,
    });

    useEffect(() => {
        fetchLogs();
        fetchStats();
    }, [pagination.page, filters]);

    const fetchLogs = async () => {
        try {
            setLoading(true);
            const response = await activityLogsAPI.getAll({
                page: pagination.page,
                limit: pagination.limit,
                ...filters,
            });
            setLogs(response.data);
            setPagination(response.pagination);
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await activityLogsAPI.getStats({
                startDate: filters.startDate,
                endDate: filters.endDate,
            });
            setStats(response.data);
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPagination((prev) => ({ ...prev, page: 1 }));
    };

    const clearFilters = () => {
        setFilters({
            action: "",
            entityType: "",
            username: "",
            startDate: "",
            endDate: "",
        });
    };

    const getActionColor = (action) => {
        const colors = {
            ایجاد: "bg-green-100 text-green-800",
            ویرایش: "bg-blue-100 text-blue-800",
            حذف: "bg-red-100 text-red-800",
            ثبت: "bg-purple-100 text-purple-800",
            سوال: "bg-yellow-100 text-yellow-800",
        };
        return colors[action] || "bg-gray-100 text-gray-800";
    };

    const getEntityIcon = (entityType) => {
        const icons = {
            عضو: <FaUser />,
            تراکنش: <FaCheckCircle />,
            "حضور و غیاب": <FaClipboardList />,
            "دستیار هوش مصنوعی": <FaRobot />,
        };
        return icons[entityType] || <FaClipboardList />;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-black flex items-center gap-2">
                        <FaChartBar /> لاگ فعالیت‌ها
                    </h1>
                    <p className="text-gray-600 mt-2">
                        تمام فعالیت‌های انجام شده در سیستم
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                        <div className="text-sm opacity-90">فعالیت 24 ساعت اخیر</div>
                        <div className="text-3xl font-bold mt-2">
                            {stats.recentActivity}
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
                        <div className="text-sm opacity-90">بیشترین فعالیت</div>
                        <div className="text-xl font-bold mt-2">
                            {stats.byAction[0]?.action || "-"}
                        </div>
                        <div className="text-sm opacity-75">
                            {stats.byAction[0]?.count || 0} مورد
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                        <div className="text-sm opacity-90">بیشترین بخش</div>
                        <div className="text-xl font-bold mt-2">
                            {stats.byEntityType[0]?.entity_type || "-"}
                        </div>
                        <div className="text-sm opacity-75">
                            {stats.byEntityType[0]?.count || 0} مورد
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
                        <div className="text-sm opacity-90">فعال‌ترین کاربر</div>
                        <div className="text-xl font-bold mt-2">
                            {stats.byUser[0]?.username || "-"}
                        </div>
                        <div className="text-sm opacity-75">
                            {stats.byUser[0]?.count || 0} فعالیت
                        </div>
                    </div>
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FaSearch /> فیلترها
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <select
                        value={filters.action}
                        onChange={(e) => handleFilterChange("action", e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                    >
                        <option value="">همه عملیات</option>
                        <option value="ایجاد">ایجاد</option>
                        <option value="ویرایش">ویرایش</option>
                        <option value="حذف">حذف</option>
                        <option value="ثبت">ثبت</option>
                        <option value="سوال">سوال</option>
                    </select>

                    <select
                        value={filters.entityType}
                        onChange={(e) => handleFilterChange("entityType", e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                    >
                        <option value="">همه بخش‌ها</option>
                        <option value="عضو">عضو</option>
                        <option value="تراکنش">تراکنش</option>
                        <option value="حضور و غیاب">حضور و غیاب</option>
                        <option value="دستیار هوش مصنوعی">دستیار هوش مصنوعی</option>
                    </select>

                    <input
                        type="text"
                        value={filters.username}
                        onChange={(e) => handleFilterChange("username", e.target.value)}
                        placeholder="نام کاربر..."
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-black"
                    />

                    <SimplePersianDatePicker
                        key={`start-${filters.startDate}`}
                        value={filters.startDate}
                        onChange={(date) => handleFilterChange("startDate", date)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-black"
                    />

                    <SimplePersianDatePicker
                        key={`end-${filters.endDate}`}
                        value={filters.endDate}
                        onChange={(date) => handleFilterChange("endDate", date)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-black"
                    />
                </div>
                <button
                    onClick={clearFilters}
                    className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                    پاک کردن فیلترها
                </button>
            </div>

            {/* Logs Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                                    زمان
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                                    کاربر
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                                    عملیات
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                                    بخش
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                                    توضیحات
                                </th>
                                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                                    IP
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        در حال بارگذاری...
                                    </td>
                                </tr>
                            ) : logs.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                        هیچ لاگی یافت نشد
                                    </td>
                                </tr>
                            ) : (
                                logs.map((log) => (
                                    <tr key={log.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {new Date(log.created_at).toLocaleString("fa-IR")}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className="font-medium text-gray-900">
                                                {log.username}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-medium ${getActionColor(
                                                    log.action
                                                )}`}
                                            >
                                                {log.action}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <span className="flex items-center gap-2">
                                                <span>{getEntityIcon(log.entity_type)}</span>
                                                <span>{log.entity_type}</span>
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {log.description}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                                            {log.ip_address || "-"}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            صفحه {pagination.page} از {pagination.totalPages} (مجموع:{" "}
                            {pagination.total} مورد)
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() =>
                                    setPagination((prev) => ({
                                        ...prev,
                                        page: prev.page - 1,
                                    }))
                                }
                                disabled={pagination.page === 1}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                قبلی
                            </button>
                            <button
                                onClick={() =>
                                    setPagination((prev) => ({
                                        ...prev,
                                        page: prev.page + 1,
                                    }))
                                }
                                disabled={pagination.page === pagination.totalPages}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                بعدی
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ActivityLogs;
