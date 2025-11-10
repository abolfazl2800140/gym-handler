import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { membersAPI, transactionsAPI, attendanceAPI } from '../services/api';
import MemberAvatar from '../components/MemberAvatar';
import MemberBadge from '../components/MemberBadge';
import MemberForm from '../components/MemberForm';
import TransactionForm from '../components/TransactionForm';
import ConfirmDialog from '../components/ConfirmDialog';
import '../styles/MemberProfile.css';

function MemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('info');
  const [showEditForm, setShowEditForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    fetchMemberData();
  }, [id]);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      
      // دریافت اطلاعات عضو
      const memberRes = await membersAPI.getById(id);
      if (memberRes.success) {
        setMember(memberRes.data);
      }

      // دریافت تراکنش‌های عضو
      const transactionsRes = await transactionsAPI.getAll({ member_id: id });
      if (transactionsRes.success) {
        setTransactions(transactionsRes.data);
      }

      // دریافت آمار حضور و غیاب
      const attendanceStatsRes = await attendanceAPI.getMemberReport({ member_id: id });
      if (attendanceStatsRes.success) {
        setAttendanceStats(attendanceStatsRes.data);
      }

    } catch (error) {
      console.error('Error fetching member data:', error);
      alert('خطا در دریافت اطلاعات');
      navigate('/members');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await membersAPI.delete(id);
      alert('عضو با موفقیت حذف شد');
      navigate('/members');
    } catch (error) {
      alert(error.message || 'خطا در حذف عضو');
    } finally {
      setShowDeleteDialog(false);
    }
  };

  const handleSaveMember = async (formData) => {
    try {
      await membersAPI.update(id, formData);
      alert('اطلاعات با موفقیت به‌روزرسانی شد');
      setShowEditForm(false);
      fetchMemberData();
    } catch (error) {
      alert(error.message || 'خطا در به‌روزرسانی اطلاعات');
    }
  };

  const handleSaveTransaction = async (formData) => {
    try {
      await transactionsAPI.create({ ...formData, member_id: id });
      alert('تراکنش با موفقیت ثبت شد');
      setShowTransactionForm(false);
      fetchMemberData();
    } catch (error) {
      alert(error.message || 'خطا در ثبت تراکنش');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fa-IR');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fa-IR').format(amount) + ' تومان';
  };

  const calculateTotalPayments = () => {
    return transactions
      .filter(t => t.type === 'درآمد')
      .reduce((sum, t) => sum + parseInt(t.amount), 0);
  };

  const getLastPayment = () => {
    const payments = transactions.filter(t => t.type === 'درآمد');
    if (payments.length === 0) return null;
    return payments.sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  };

  const calculateAttendancePercentage = () => {
    if (!attendanceStats || !attendanceStats.length) return 0;
    const stats = attendanceStats[0];
    const total = stats.present_count + stats.absent_count + stats.leave_count;
    if (total === 0) return 0;
    return Math.round((stats.present_count / total) * 100);
  };

  if (loading) {
    return (
      <div className="member-profile-page">
        <div className="loading">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="member-profile-page">
        <div className="error">عضو یافت نشد</div>
      </div>
    );
  }

  const lastPayment = getLastPayment();
  const attendancePercentage = calculateAttendancePercentage();
  const memberStats = attendanceStats && attendanceStats.length > 0 ? attendanceStats[0] : null;

  return (
    <div className="member-profile-page">
      {/* دکمه بازگشت */}
      <button onClick={() => navigate('/members')} className="back-button">
        ← بازگشت به لیست
      </button>

      {/* هدر */}
      <div className="member-header">
        <div className="member-header-content">
          <MemberAvatar
            firstName={member.firstName}
            lastName={member.lastName}
            size="xl"
          />
          <div className="member-header-info">
            <h1>{member.firstName} {member.lastName}</h1>
            <p className="phone">{member.phone}</p>
            <div className="badges">
              <MemberBadge type={member.memberType} variant="type" />
              <MemberBadge type={member.membershipLevel} variant="level" />
              <MemberBadge type={member.subscriptionStatus} variant="status" />
            </div>
          </div>
        </div>
        
        <div className="member-actions">
          <button onClick={() => setShowEditForm(true)} className="btn-action edit">
            ✏️ ویرایش
          </button>
          <button onClick={() => setShowTransactionForm(true)} className="btn-action transaction">
            💰 افزودن تراکنش
          </button>
          <button onClick={() => setShowDeleteDialog(true)} className="btn-action delete">
            🗑️ حذف
          </button>
        </div>
      </div>

      {/* تب‌ها */}
      <div className="tabs">
        <button 
          className={activeTab === 'info' ? 'active' : ''}
          onClick={() => setActiveTab('info')}
        >
          📋 اطلاعات شخصی
        </button>
        <button 
          className={activeTab === 'transactions' ? 'active' : ''}
          onClick={() => setActiveTab('transactions')}
        >
          💰 تراکنش‌ها
        </button>
        <button 
          className={activeTab === 'attendance' ? 'active' : ''}
          onClick={() => setActiveTab('attendance')}
        >
          📊 حضور و غیاب
        </button>
      </div>

      {/* محتوای تب‌ها */}
      <div className="tab-content">
        {/* تب اطلاعات */}
        {activeTab === 'info' && (
          <div className="info-grid">
            <div className="info-card">
              <div className="info-label">📱 شماره تماس</div>
              <div className="info-value">{member.phone}</div>
            </div>
            <div className="info-card">
              <div className="info-label">🎂 تاریخ تولد</div>
              <div className="info-value">{formatDate(member.birthDate)}</div>
            </div>
            <div className="info-card">
              <div className="info-label">👤 نوع عضویت</div>
              <div className="info-value">
                <MemberBadge type={member.memberType} variant="type" />
              </div>
            </div>
            <div className="info-card">
              <div className="info-label">⭐ سطح عضویت</div>
              <div className="info-value">
                <MemberBadge type={member.membershipLevel} variant="level" />
              </div>
            </div>
            <div className="info-card">
              <div className="info-label">📅 تاریخ عضویت</div>
              <div className="info-value">{formatDate(member.joinDate)}</div>
            </div>
            <div className="info-card">
              <div className="info-label">✓ وضعیت اشتراک</div>
              <div className="info-value">
                <MemberBadge type={member.subscriptionStatus} variant="status" />
              </div>
            </div>
          </div>
        )}

        {/* تب تراکنش‌ها */}
        {activeTab === 'transactions' && (
          <div className="transactions-container">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">💰</div>
                <div className="stat-value">{formatCurrency(calculateTotalPayments())}</div>
                <div className="stat-label">مجموع پرداخت‌ها</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-value">{transactions.length}</div>
                <div className="stat-label">تعداد تراکنش‌ها</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-value">
                  {lastPayment ? formatDate(lastPayment.date) : '-'}
                </div>
                <div className="stat-label">آخرین پرداخت</div>
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="empty-state">
                <p>هیچ تراکنشی ثبت نشده است</p>
              </div>
            ) : (
              <div className="transactions-list">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-icon">
                      {transaction.type === 'درآمد' ? '💵' : '💸'}
                    </div>
                    <div className="transaction-content">
                      <div className="transaction-title">{transaction.title}</div>
                      <div className="transaction-meta">
                        <span>{formatDate(transaction.date)}</span>
                        <span>{transaction.category}</span>
                      </div>
                    </div>
                    <div className={`transaction-amount ${transaction.type === 'درآمد' ? 'income' : 'expense'}`}>
                      {transaction.type === 'درآمد' ? '+' : '-'} {formatCurrency(transaction.amount)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* تب حضور و غیاب */}
        {activeTab === 'attendance' && (
          <div className="attendance-container">
            {memberStats ? (
              <>
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">✓</div>
                    <div className="stat-value">{memberStats.present_count || 0}</div>
                    <div className="stat-label">حاضر</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">✗</div>
                    <div className="stat-value">{memberStats.absent_count || 0}</div>
                    <div className="stat-label">غایب</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">📋</div>
                    <div className="stat-value">{memberStats.leave_count || 0}</div>
                    <div className="stat-label">مرخصی</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-value">{attendancePercentage}%</div>
                    <div className="stat-label">درصد حضور</div>
                  </div>
                </div>

                <div className="attendance-chart">
                  <div className="chart-bar">
                    <div 
                      className="chart-fill present" 
                      style={{ width: `${attendancePercentage}%` }}
                    >
                      {attendancePercentage > 10 && `${attendancePercentage}%`}
                    </div>
                  </div>
                  <div className="chart-legend">
                    <span className="legend-item present">حاضر</span>
                    <span className="legend-item absent">غایب و مرخصی</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="empty-state">
                <p>هیچ رکورد حضور و غیابی ثبت نشده است</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal ها */}
      {showEditForm && (
        <MemberForm
          member={member}
          onSave={handleSaveMember}
          onCancel={() => setShowEditForm(false)}
        />
      )}

      {showTransactionForm && (
        <TransactionForm
          onSave={handleSaveTransaction}
          onCancel={() => setShowTransactionForm(false)}
          defaultMemberId={id}
        />
      )}

      {showDeleteDialog && (
        <ConfirmDialog
          title="حذف عضو"
          message={`آیا مطمئن هستید که می‌خواهید "${member.firstName} ${member.lastName}" را حذف کنید؟`}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteDialog(false)}
        />
      )}
    </div>
  );
}

export default MemberProfile;
