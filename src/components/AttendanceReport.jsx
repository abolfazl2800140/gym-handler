import { useState } from "react";
import * as XLSX from "xlsx";

function AttendanceReport({ attendanceRecords, members, dateRange }) {
  const [selectedMember, setSelectedMember] = useState("");

  const getMemberName = (memberId) => {
    const member = members.find((m) => m.id === memberId);
    return member ? `${member.firstName} ${member.lastName}` : "نامشخص";
  };

  const calculateMemberStats = (memberId) => {
    let present = 0;
    let absent = 0;
    let leave = 0;

    attendanceRecords.forEach((record) => {
      const memberRecord = record.records[memberId];
      if (memberRecord) {
        if (memberRecord.status === "حاضر") present++;
        else if (memberRecord.status === "غایب") absent++;
        else if (memberRecord.status === "مرخصی") leave++;
      }
    });

    const total = present + absent + leave;
    const percentage = total > 0 ? ((present / total) * 100).toFixed(1) : 0;

    return { present, absent, leave, total, percentage };
  };

  const handleExportToExcel = () => {
    const exportData = members.map((member) => {
      const stats = calculateMemberStats(member.id);
      return {
        نام: `${member.firstName} ${member.lastName}`,
        "تعداد حاضر": stats.present,
        "تعداد غایب": stats.absent,
        "تعداد مرخصی": stats.leave,
        "کل روزها": stats.total,
        "درصد حضور": `${stats.percentage}%`,
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "گزارش حضور");

    const fileName = `گزارش_حضور_${new Date()
      .toLocaleDateString("fa-IR")
      .replace(/\//g, "-")}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const filteredMembers = selectedMember
    ? members.filter((m) => m.id === selectedMember)
    : members;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-black">گزارش آماری</h2>
        <button
          onClick={handleExportToExcel}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
        >
          📥 خروجی Excel
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          فیلتر بر اساس عضو
        </label>
        <select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
          className="w-full px-4 py-2 border text-black rounded-lg"
        >
          <option value="">همه اعضا</option>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.firstName} {member.lastName}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-right text-sm font-medium text-black">
                نام عضو
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-black">
                حاضر
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-black">
                غایب
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-black">
                مرخصی
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-black">
                کل
              </th>
              <th className="px-4 py-3 text-right text-sm font-medium text-black">
                درصد حضور
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredMembers.map((member) => {
              const stats = calculateMemberStats(member.id);
              return (
                <tr key={member.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-black">
                    {member.firstName} {member.lastName}
                  </td>
                  <td className="px-4 py-3 text-green-600 font-bold">
                    {stats.present}
                  </td>
                  <td className="px-4 py-3 text-red-600 font-bold">
                    {stats.absent}
                  </td>
                  <td className="px-4 py-3 text-yellow-600 font-bold">
                    {stats.leave}
                  </td>
                  <td className="px-4 py-3 text-black">{stats.total}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full"
                          style={{ width: `${stats.percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-black">
                        {stats.percentage}%
                      </span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AttendanceReport;
