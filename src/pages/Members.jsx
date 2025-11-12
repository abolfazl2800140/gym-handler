import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaUsers, FaTable, FaTh, FaPlus, FaEdit, FaTrash, FaUser, FaPhone, FaTag, FaStar, FaCalendar, FaCheck, FaSearch } from "react-icons/fa";
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
  const [viewMode, setViewMode] = useState("table");
  const [showForm, setShowForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

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
      const savedMembers = localStorage.getItem("members");
      if (savedMembers) {
        setMembers(JSON.parse(savedMembers));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  const filteredAndSortedMembers = members
    .filter((member) => {
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
    })
    .sort((a, b) => {
      if (!sortField) return 0;

      let aValue, bValue;

      switch (sortField) {
        case 'name':
          aValue = `${a.firstName || a.first_name} ${a.lastName || a.last_name}`.toLowerCase();
          bValue = `${b.firstName || b.first_name} ${b.lastName || b.last_name}`.toLowerCase();
          break;
        case 'phone':
          aValue = a.phone || '';
          bValue = b.phone || '';
          break;
        case 'memberType':
          aValue = a.memberType || a.member_type || '';
          bValue = b.memberType || b.member_type || '';
          break;
        case 'membershipLevel':
          aValue = a.membershipLevel || a.membership_level || '';
          bValue = b.membershipLevel || b.membership_level || '';
          break;
        case 'joinDate':
          aValue = new Date(a.joinDate || a.join_date);
          bValue = new Date(b.joinDate || b.join_date);
          break;
        case 'status':
          aValue = a.subscriptionStatus || a.subscription_status || '';
          bValue = b.subscriptionStatus || b.subscription_status || '';
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
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

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedMembers.length / itemsPerPage);
  const paginatedMembers = filteredAndSortedMembers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, memberTypeFilter, statusFilter, sortField, sortDirection]);

  return (
    <div>
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
        <h1 className="text-2xl lg:text-3xl font-bold flex items-center gap-2">
          <FaUsers /> مدیریت اعضا
        </h1>
        <div className="flex gap-3 w-full lg:w-auto">
          {/* دکمه‌های تغییر نما - فقط در دسکتاپ */}
          <div className="hidden lg:flex bg-white/10 backdrop-blur-lg rounded-lg p-1">
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-2 rounded-md transition-all ${
                viewMode === "table"
                  ? "bg-white text-indigo-600 shadow-md"
                  : "text-white hover:bg-white/10"
              }`}
              title="نمای جدولی"
            >
              <FaTable />
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
              <FaTh />
            </button>
          </div>
          
          <button
            onClick={handleAddMember}
            disabled={loading}
            className="flex-1 lg:flex-none px-4 lg:px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_10px_20px_rgba(72,187,120,0.3)] text-sm lg:text-base"
          >
            <FaPlus />
            <span className="hidden sm:inline">افزودن عضو جدید</span>
            <span className="sm:hidden">افزودن عضو</span>
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

      {/* نمای جدولی - در موبایل مخفی، در دسکتاپ بر اساس انتخاب کاربر */}
      {viewMode === "table" && (
        <div className="hidden lg:block bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 flex flex-col" style={{ height: 'calc(100vh - 280px)' }}>
          {/* جدول با header ثابت */}
          <div className="overflow-auto flex-1">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-200 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-4 text-gray-700 text-right text-sm font-semibold">
                  <div className="flex items-center gap-2">
                    <FaTag /> شناسه
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-gray-700 text-right text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2"><FaUser /> عضو</span>
                    {getSortIcon('name')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-gray-700 text-right text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  onClick={() => handleSort('phone')}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2"><FaPhone /> شماره تماس</span>
                    {getSortIcon('phone')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-gray-700 text-right text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  onClick={() => handleSort('memberType')}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2"><FaTag /> نوع عضویت</span>
                    {getSortIcon('memberType')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-gray-700 text-right text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  onClick={() => handleSort('membershipLevel')}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2"><FaStar /> سطح عضویت</span>
                    {getSortIcon('membershipLevel')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-gray-700 text-right text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  onClick={() => handleSort('joinDate')}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2"><FaCalendar /> تاریخ عضویت</span>
                    {getSortIcon('joinDate')}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-gray-700 text-right text-sm font-semibold cursor-pointer hover:bg-gray-200 transition-colors select-none"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2"><FaCheck /> وضعیت</span>
                    {getSortIcon('status')}
                  </div>
                </th>
                <th className="px-6 py-4 text-gray-700 text-center text-sm font-semibold">
                  عملیات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {paginatedMembers.map((member, index) => (
                <tr
                  key={member.id}
                  className={`transition-all cursor-pointer ${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } hover:bg-blue-50 hover:shadow-md`}
                  onClick={() => navigate(`/members/${member.id}`)}
                >
                  <td className="px-6 py-4">
                    <span className="text-gray-600 font-bold text-sm">
                      #{member.id}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <MemberAvatar
                        firstName={member.firstName}
                        lastName={member.lastName}
                      />
                      <span className="font-semibold text-gray-800">
                        {member.firstName} {member.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700 font-medium direction-ltr inline-block">
                      {member.phone}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <MemberBadge type={member.memberType} variant="type" />
                  </td>
                  <td className="px-6 py-4">
                    <MemberBadge type={member.membershipLevel} variant="level" />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700 font-medium">
                      {new Date(member.joinDate).toLocaleDateString("fa-IR")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <MemberBadge
                      type={member.subscriptionStatus}
                      variant="status"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditMember(member);
                        }}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-medium transition-all hover:shadow-lg"
                        title="ویرایش عضو"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(member.id);
                        }}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm font-medium transition-all hover:shadow-lg"
                        title="حذف عضو"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredAndSortedMembers.length === 0 && (
            <div className="text-center py-16 bg-gray-50">
              <div className="text-6xl mb-4"><FaSearch className="inline text-gray-300" /></div>
              <p className="text-gray-600 text-lg font-medium">هیچ عضوی یافت نشد</p>
              <p className="text-gray-400 text-sm mt-2">لطفاً فیلترها را تغییر دهید یا عضو جدیدی اضافه کنید</p>
            </div>
          )}
          </div>

          {/* Pagination داخل جدول */}
          {filteredAndSortedMembers.length > 0 && (
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3 p-4 bg-gray-50 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                نمایش {((currentPage - 1) * itemsPerPage) + 1} تا {Math.min(currentPage * itemsPerPage, filteredAndSortedMembers.length)} از {filteredAndSortedMembers.length} عضو
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 lg:px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  قبلی
                </button>
                
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, index) => {
                    const page = index + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-3 lg:px-4 py-2 rounded-lg font-medium transition-colors text-sm ${
                            currentPage === page
                              ? 'bg-blue-500 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2 py-2 text-gray-400 text-sm">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 lg:px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  بعدی
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* نمای کارتی - در موبایل همیشه نمایش، در دسکتاپ بر اساس انتخاب کاربر */}
      <div className={`${viewMode === "card" ? "block" : "lg:hidden"} overflow-auto`} style={{ height: 'calc(100vh - 240px)' }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 pb-4">
            {filteredAndSortedMembers.map((member) => (
            <div
              key={member.id}
              onClick={() => navigate(`/members/${member.id}`)}
              className="member-card rounded-xl p-4 lg:p-6 cursor-pointer group"
            >
              <div className="member-card-header flex items-center gap-3 lg:gap-4 mb-3 lg:mb-4">
                <MemberAvatar
                  firstName={member.firstName}
                  lastName={member.lastName}
                  size="lg"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base lg:text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors truncate">
                    {member.firstName} {member.lastName}
                  </h3>
                  <p className="text-xs lg:text-sm text-gray-600 truncate">{member.phone} • #{member.id}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-3 lg:mb-4">
                <MemberBadge type={member.memberType} variant="type" />
                <MemberBadge type={member.membershipLevel} variant="level" />
                <MemberBadge type={member.subscriptionStatus} variant="status" />
              </div>

              <div className="space-y-2 mb-3 lg:mb-4">
                <div className="flex justify-between text-xs lg:text-sm">
                  <span className="text-gray-500">تاریخ عضویت:</span>
                  <span className="text-gray-800 font-medium">
                    {new Date(member.joinDate).toLocaleDateString("fa-IR")}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 pt-3 lg:pt-4 border-t border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditMember(member);
                  }}
                  className="flex-1 px-3 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 text-xs lg:text-sm font-medium transition-colors flex items-center justify-center gap-2 touch-manipulation"
                >
                  <FaEdit /> ویرایش
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(member.id);
                  }}
                  className="flex-1 px-3 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 active:bg-red-700 text-xs lg:text-sm font-medium transition-colors flex items-center justify-center gap-2 touch-manipulation"
                >
                  <FaTrash /> حذف
                </button>
              </div>
            </div>
          ))}

          {filteredAndSortedMembers.length === 0 && (
            <div className="col-span-full text-center py-16 bg-white rounded-xl">
              <div className="text-6xl mb-4"><FaSearch className="inline text-gray-300" /></div>
              <p className="text-gray-600 text-lg font-medium">هیچ عضوی یافت نشد</p>
              <p className="text-gray-400 text-sm mt-2">لطفاً فیلترها را تغییر دهید یا عضو جدیدی اضافه کنید</p>
            </div>
          )}
        </div>
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
