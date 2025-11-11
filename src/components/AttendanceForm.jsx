import { useState, useEffect } from "react";
import '../styles/UserForm.css';
import '../styles/AttendanceForm.css';

function AttendanceForm({ date, members, onSave, onCancel, existingAttendance }) {
  const [attendanceData, setAttendanceData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (existingAttendance) {
      console.log('Loading existing attendance:', existingAttendance);
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
      console.log('Initialized attendance data for', members.length, 'members');
      console.log('Initial data:', initialData);
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
    
    // Validation
    if (!attendanceData || Object.keys(attendanceData).length === 0) {
      alert('لطفاً حداقل یک عضو را انتخاب کنید');
      return;
    }
    
    const dataToSave = {
      date,
      records: attendanceData,
      notes,
    };
    console.log('Submitting attendance data:', dataToSave);
    console.log('Number of records:', Object.keys(attendanceData).length);
    onSave(dataToSave);
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
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content attendance-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>ثبت حضور و غیاب</h2>
            <p style={{ fontSize: '14px', color: '#718096', marginTop: '4px' }}>
              {new Date(date).toLocaleDateString("fa-IR")}
            </p>
          </div>
          <button onClick={onCancel} className="close-button">✕</button>
        </div>

        <div className="attendance-stats">
          <div className="stat-item stat-present">
            <span className="stat-number">{presentCount}</span>
            <span className="stat-label">حاضر</span>
          </div>
          <div className="stat-item stat-absent">
            <span className="stat-number">{absentCount}</span>
            <span className="stat-label">غایب</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          <div className="attendance-toolbar">
            <input
              type="text"
              placeholder="جستجوی عضو..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="attendance-search"
            />
            <button
              type="button"
              onClick={() => handleMarkAll("حاضر")}
              className="btn-mark-all btn-mark-present"
            >
              همه حاضر
            </button>
            <button
              type="button"
              onClick={() => handleMarkAll("غایب")}
              className="btn-mark-all btn-mark-absent"
            >
              همه غایب
            </button>
          </div>

          <div className="attendance-list">
            {filteredMembers.map((member) => (
              <div key={member.id} className="attendance-item">
                <div className="attendance-item-header">
                  <div className="member-info">
                    <div className="member-name">
                      {member.firstName} {member.lastName}
                    </div>
                    <div className="member-phone">{member.phone}</div>
                  </div>

                  <div className="status-buttons">
                    <button
                      type="button"
                      onClick={() => handleStatusChange(member.id, "حاضر")}
                      className={`status-btn status-btn-present ${
                        attendanceData[member.id]?.status === "حاضر" ? "active" : ""
                      }`}
                    >
                      ✓ حاضر
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(member.id, "غایب")}
                      className={`status-btn status-btn-absent ${
                        attendanceData[member.id]?.status === "غایب" ? "active" : ""
                      }`}
                    >
                      ✗ غایب
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange(member.id, "مرخصی")}
                      className={`status-btn status-btn-leave ${
                        attendanceData[member.id]?.status === "مرخصی" ? "active" : ""
                      }`}
                    >
                      📅 مرخصی
                    </button>
                  </div>
                </div>

                {attendanceData[member.id]?.status !== "حاضر" && (
                  <div className="reason-input-wrapper">
                    <input
                      type="text"
                      placeholder="دلیل غیبت یا مرخصی..."
                      value={attendanceData[member.id]?.reason || ""}
                      onChange={(e) =>
                        handleReasonChange(member.id, e.target.value)
                      }
                      className="reason-input"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="form-group">
            <label htmlFor="notes">یادداشت روز</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="یادداشت‌های مربوط به این روز..."
              rows="3"
              style={{ 
                padding: '12px 16px',
                border: '2px solid #e2e8f0',
                borderRadius: '10px',
                fontSize: '14px',
                transition: 'all 0.3s ease',
                fontFamily: 'inherit',
                resize: 'vertical',
                color: '#2d3748',
                background: 'white'
              }}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onCancel} className="btn-cancel">
              انصراف
            </button>
            <button type="submit" className="btn-submit">
              ذخیره حضور و غیاب
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AttendanceForm;
