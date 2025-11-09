import { useState, useEffect } from "react";
import MemberAvatar from "../components/MemberAvatar";
import MemberBadge from "../components/MemberBadge";
import SearchBar from "../components/SearchBar";
import MemberForm from "../components/MemberForm";
import ConfirmDialog from "../components/ConfirmDialog";
import { membersAPI } from "../services/api";

function Members() {
  const [members, setMembers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [memberTypeFilter, setMemberTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
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
        <button
          onClick={handleAddMember}
          disabled={loading}
          className="px-6 py-3 bg-white text-indigo-600 rounded-lg font-medium hover:bg-white/90 transition-all disabled:opacity-50"
        >
          + افزودن عضو جدید
        </button>
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
                className="hover:bg-white/5 transition-colors"
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
                      onClick={() => handleEditMember(member)}
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    >
                      ویرایش
                    </button>
                    <button
                      onClick={() => handleDeleteClick(member.id)}
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
