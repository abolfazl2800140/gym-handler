import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MemberAvatar from "../components/MemberAvatar";
import MemberBadge from "../components/MemberBadge";
import SearchBar from "../components/SearchBar";
import MemberForm from "../components/MemberForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { membersAPI } from "../services/api";
import "../styles/MembersView.css";

function Members() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [memberTypeFilter, setMemberTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" or "card"
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await membersAPI.getAll();
      setMembers(response.data);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('خطا در دریافت اطلاعات اعضا');
      // Fallback to localStorage
      const savedMembers = localStorage.getItem("members");
      if (savedMembers) {
        setMembers(JSON.parse(savedMembers));
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredMembers = members.filter((member) => {
    const matchesSearch =
      member.first_name?.includes(searchTerm) ||
      member.last_name?.includes(searchTerm) ||
      member.phone?.includes(searchTerm) ||
      member.firstName?.includes(searchTerm) ||
      member.lastName?.includes(searchTerm);

    const matchesType =
      !memberTypeFilter ||
      member.member_type === memberTypeFilter ||
      member.memberType === memberTypeFilter;

    const matchesStatus =
      !statusFilter ||
      member.subscription_status === statusFilter ||
      member.subscriptionStatus === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAddMember = () => {
    setEditingMember(null);
    setShowForm(true);
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setShowForm(true);
  };

  const handleSaveMember = async (formData) => {
    try {
      setLoading(true);
      setError(null);

      if (editingMember) {
        await membersAPI.update(editingMember.id, formData);
      } else {
        await membersAPI.create(formData);
      }

      await fetchMembers();
      setShowForm(false);
      setEditingMember(null);
    } catch (err) {
      console.error('Error saving member:', err);
      setError('خطا در ذخیره اطلاعات عضو');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (memberId) => {
    setDeletingMemberId(memberId);
    setShowDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      await membersAPI.delete(deletingMemberId);
      await fetchMembers();
      setShowDeleteDialog(false);
      setDeletingMemberId(null);
    } catch (err) {
      console.error('Error deleting member:', err);
      setError('خطا در حذف عضو');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setDeletingMemberId(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">👥 مدیریت اعضا</h1>
        <div className="flex gap-3">
          {/* Toggle نمای جدولی/کارتی */}
          <div className="flex bg-white/10 backdrop-blur-lg rounded-lg p-1">
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-md transition-all ${
                viewMode === "table"
                  ? "bg-white text-indigo-600 shadow-md"
                  : "text-white hover:bg-white/10"
              }`}
              title="نمای جدولی"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 0c0-.621.504-1.125 1.125-1.125m0 0h7.5"
                />
              </svg>
            </button>
            <button
              onClick={() => setViewMode("card")}
              className={`px-4 py-2 rounded-md transition-all ${
                viewMode === "card"
                  ? "bg-white text-indigo-600 shadow-md"
                  : "text-white hover:bg-white/10"
              }`}
              title="نمای کارتی"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-5 h-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z"
                />
              </svg>
            </button>
          </div>
          
          <button
            onClick={handleAddMember}
            disabled={loading}
            className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-white/90 transition-all disabled:opacity-50"
          >
            + افزودن عضو جدید
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {loading && (
        <div className="mb-4 p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
          در حال بارگذاری...
        </div>
      )}

      <SearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        memberTypeFilter={memberTypeFilter}
        onMemberTypeChange={setMemberTypeFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      {/* نمای جدولی */}
      {viewMode === "table" && (
        <div className="bg-white/10 backdrop-blur-lg rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-white/5">
            <tr>
              <th className="px-6 py-4 text-black text-right text-sm font-medium">عضو</th>
              <th className="px-6 py-4 text-black text-right text-sm font-medium">
                شماره تماس
              </th>
              <th className="px-6 py-4 text-black text-right text-sm font-medium">
                نوع عضویت
              </th>
              <th className="px-6 py-4 text-black text-right text-sm font-medium">
                سطح عضویت
              </th>
              <th className="px-6 py-4 text-black text-right text-sm font-medium">
                تاریخ عضویت
              </th>
              <th className="px-6 py-4 text-black text-right text-sm font-medium">
                وضعیت
              </th>
              <th className="px-6 py-4 text-black text-right text-sm font-medium">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredMembers.map((member) => (
              <tr
                key={member.id}
                className="hover:bg-white/5 transition-colors cursor-pointer"
                onClick={() => navigate(`/members/${member.id}`)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <MemberAvatar
                      firstName={member.firstName}
                      lastName={member.lastName}
                    />
                    <span className="font-medium text-black">
                      {member.firstName} {member.lastName}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-black">{member.phone}</td>
                <td className="px-6 py-4">
                  <MemberBadge type={member.memberType} variant="type" />
                </td>
                <td className="px-6 py-4">
                  <MemberBadge type={member.membershipLevel} variant="level" />
                </td>
                <td className="px-6 py-4 text-black">
                  {new Date(member.joinDate).toLocaleDateString("fa-IR")}
                </td>
                <td className="px-6 py-4">
                  <MemberBadge
                    type={member.subscriptionStatus}
                    variant="status"
                  />
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditMember(member);
                      }}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteClick(member.id);
                      }}
                      className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      حذف
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12 text-white/60">
            هیچ عضوی یافت نشد
          </div>
        )}
        </div>
      )}

      {/* نمای کارتی */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => (
            <div
              key={member.id}
              onClick={() => navigate(`/members/${member.id}`)}
              className="member-card rounded-xl p-6 cursor-pointer group"
            >
              {/* هدر کارت */}
              <div className="member-card-header flex items-center gap-4 mb-4">
                <MemberAvatar
                  firstName={member.firstName}
                  lastName={member.lastName}
                  size="lg"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors">
                    {member.firstName} {member.lastName}
                  </h3>
                  <p className="text-sm text-gray-600">{member.phone}</p>
                </div>
              </div>

              {/* Badge ها */}
              <div className="flex flex-wrap gap-2 mb-4">
                <MemberBadge type={member.memberType} variant="type" />
                <MemberBadge type={member.membershipLevel} variant="level" />
                <MemberBadge type={member.subscriptionStatus} variant="status" />
              </div>

              {/* اطلاعات */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">تاریخ عضویت:</span>
                  <span className="text-gray-800 font-medium">
                    {new Date(member.joinDate).toLocaleDateString("fa-IR")}
                  </span>
                </div>
              </div>

              {/* دکمه‌ها */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditMember(member);
                  }}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium transition-colors"
                >
                  ✏️ ویرایش
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(member.id);
                  }}
                  className="flex-1 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium transition-colors"
                >
                  🗑️ حذف
                </button>
              </div>
            </div>
          ))}

          {filteredMembers.length === 0 && (
            <div className="col-span-full text-center py-12 text-white/60">
              هیچ عضوی یافت نشد
            </div>
          )}
        </div>
      )}

      {showForm && (
        <MemberForm
          member={editingMember}
          onSave={handleSaveMember}
          onCancel={() => {
            setShowForm(false);
            setEditingMember(null);
          }}
        />
      )}

      {showDeleteDialog && (
        <ConfirmDialog
          title="حذف عضو"
          message="آیا از حذف این عضو اطمینان دارید؟ این عملیات قابل بازگشت نیست."
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
        />
      )}
    </div>
  );
}

export default Members;
