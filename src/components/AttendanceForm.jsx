import { useState, useEffect } from "react";

function AttendanceForm({ date, members, onSave, onCancel, existingAttendance }) {
  const [attendanceData, setAttendanceData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (existingAttendance) {
      setAttendanceData(existingAttendance.records || {});
      setNotes(existingAttendance.notes || "");
    } else {
      const initialData = {};
      members.forEach((member) => {
        initialData[member.id] = {
          status: "حاضر",
          reason: "",
        };
      });
      setAttendanceData(initialData);
    }
  }, [existingAttendance, members]);

  const handleStatusChange = (memberId, status) => {
    setAttendanceData({
      ...attendanceData,
      [memberId]: {
        ...attendanceData[memberId],
        status,
        reason: status === "حاضر" ? "" : attendanceData[memberId]?.reason || "",
      },
    });
  };

  const handleReasonChange = (memberId, reason) => {
    setAttendanceData({
      ...attendanceData,
      [memberId]: {
        ...attendanceData[memberId],
        reason,
      },
    });
  };

  const handleMarkAll = (status) => {
    const newData = {};
    members.forEach((member) => {
      newData[member.id] = {
        status,
        reason: "",
      };
    });
    setAttendanceData(newData);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      date,
      records: attendanceData,
      notes,
    });
  };

  const filteredMembers = members.filter(
    (member) =>
      member.firstName.includes(searchTerm) ||
      member.lastName.includes(searchTerm)
  );

  const presentCount = Object.values(attendanceData).filter(
    (record) => record.status === "حاضر"
  ).length;
  const absentCount = Object.values(attendanceData).filter(
    (record) => record.status === "غایب"
  ).length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-2xl font-bold text-black">
            ثبت حضور و غیاب - {new Date(date).toLocaleDateString("fa-IR")}
          </h2>
          <div className="flex gap-4 mt-4">
            <div className="text-sm">
              <span className="text-green-600 font-bold">{presentCount}</span>{" "}
              حاضر
            </div>
            <div className="text-sm">
              <span className="text-red-600 font-bold">{absentCount}</span> غایب
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
            <div className="flex gap-3 mb-4">
              <input
                type="text"
                placeholder="جستجوی عضو..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-2 border rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleMarkAll("حاضر")}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
              >
                همه حاضر
              </button>
              <button
                type="button"
                onClick={() => handleMarkAll("غایب")}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                همه غایب
              </button>
            </div>

            <div className="space-y-3">
              {filteredMembers.map((member) => (
                <div
                  key={member.id}
                  className="border rounded-lg p-4 hover:bg-gray-50"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="font-medium text-black">
                        {member.firstName} {member.lastName}
                      </div>
                      <div className="text-sm text-gray-500">
                        {member.phone}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleStatusChange(member.id, "حاضر")}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          attendanceData[member.id]?.status === "حاضر"
                            ? "bg-green-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        ✓ حاضر
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(member.id, "غایب")}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          attendanceData[member.id]?.status === "غایب"
                            ? "bg-red-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        ✗ غایب
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange(member.id, "مرخصی")}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          attendanceData[member.id]?.status === "مرخصی"
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        📅 مرخصی
                      </button>
                    </div>
                  </div>

                  {attendanceData[member.id]?.status !== "حاضر" && (
                    <div className="mt-3">
                      <input
                        type="text"
                        placeholder="دلیل غیبت یا مرخصی..."
                        value={attendanceData[member.id]?.reason || ""}
                        onChange={(e) =>
                          handleReasonChange(member.id, e.target.value)
                        }
                        className="w-full px-3 py-2 border rounded-lg text-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                یادداشت روز
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="یادداشت‌های مربوط به این روز..."
                className="w-full px-4 py-2 border rounded-lg resize-none"
                rows="3"
              />
            </div>
          </div>

          <div className="p-6 border-t flex justify-end gap-3 bg-gray-50">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-100"
            >
              انصراف
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              ذخیره حضور و غیاب
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AttendanceForm;
