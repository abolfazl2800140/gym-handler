import { useState } from "react";

function AttendanceHistory({ attendanceRecords, members, onEdit, onDelete }) {
  const [expandedDate, setExpandedDate] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const getMemberName = (memberId) => {
    const member = members.find((m) => m.id === memberId);
    return member ? `${member.firstName} ${member.lastName}` : "نامشخص";
  };

  const getDateStats = (records) => {
    const statuses = Object.values(records);
    return {
      present: statuses.filter((r) => r.status === "حاضر").length,
      absent: statuses.filter((r) => r.status === "غایب").length,
      leave: statuses.filter((r) => r.status === "مرخصی").length,
    };
  };

  const filteredRecords = attendanceRecords.filter((record) => {
    const dateStr = new Date(record.date).toLocaleDateString("fa-IR");
    return dateStr.includes(searchTerm);
  });

  const sortedRecords = [...filteredRecords].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-4 lg:p-6 border-b">
        <h2 className="text-lg lg:text-xl font-bold text-black mb-4">تاریخچه حضور و غیاب</h2>
        <input
          type="text"
          placeholder="جستجوی تاریخ..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 lg:py-2 border rounded-lg text-base"
        />
      </div>

      <div className="divide-y">
        {sortedRecords.map((record) => {
          const stats = getDateStats(record.records);
          const isExpanded = expandedDate === record.date;

          return (
            <div key={record.date} className="p-4 hover:bg-gray-50">
              <div
                className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 cursor-pointer"
                onClick={() =>
                  setExpandedDate(isExpanded ? null : record.date)
                }
              >
                <div className="flex-1 w-full lg:w-auto">
                  <div className="font-bold text-black text-base lg:text-base">
                    {new Date(record.date).toLocaleDateString("fa-IR")}
                  </div>
                  <div className="flex flex-wrap gap-3 lg:gap-4 mt-2 text-xs lg:text-sm">
                    <span className="text-green-600">
                      ✓ {stats.present} حاضر
                    </span>
                    <span className="text-red-600">✗ {stats.absent} غایب</span>
                    <span className="text-yellow-600">
                      📅 {stats.leave} مرخصی
                    </span>
                  </div>
                  {record.notes && (
                    <div className="text-xs lg:text-sm text-gray-600 mt-2">
                      📝 {record.notes}
                    </div>
                  )}
                </div>

                <div className="flex gap-2 w-full lg:w-auto">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(record);
                    }}
                    className="flex-1 lg:flex-none px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 active:bg-blue-700 text-xs lg:text-sm"
                  >
                    ویرایش
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(record.date);
                    }}
                    className="flex-1 lg:flex-none px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 active:bg-red-700 text-xs lg:text-sm"
                  >
                    حذف
                  </button>
                  <button className="px-3 py-2 bg-gray-200 rounded text-xs lg:text-sm">
                    {isExpanded ? "▲" : "▼"}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 space-y-2 pr-4">
                  {Object.entries(record.records).map(([memberId, data]) => (
                    <div
                      key={memberId}
                      className="flex items-center justify-between py-2 border-t"
                    >
                      <div className="flex-1">
                        <span className="font-medium text-black">
                          {getMemberName(memberId)}
                        </span>
                        {data.reason && (
                          <span className="text-sm text-gray-600 mr-2">
                            - {data.reason}
                          </span>
                        )}
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          data.status === "حاضر"
                            ? "bg-green-100 text-green-800"
                            : data.status === "غایب"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {data.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {sortedRecords.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            هیچ رکوردی یافت نشد
          </div>
        )}
      </div>
    </div>
  );
}

export default AttendanceHistory;
