import { useState, useEffect } from 'react';
import { userManager } from '../services/auth';
import '../styles/Dashboard.css';

function AthleteDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const user = userManager.getUser();

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const token = localStorage.getItem('gym_auth_token');
            const response = await fetch('http://localhost:5000/api/member-dashboard/athlete', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();

            if (result.success) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="dashboard-loading">در حال بارگذاری...</div>;
    }

    if (!data) {
        return <div className="dashboard-error">خطا در بارگذاری اطلاعات</div>;
    }

    const { member, attendance, financial } = data;
    const attendancePercentage = attendance.stats.total_days > 0
        ? Math.round((attendance.stats.present_days / attendance.stats.total_days) * 100)
        : 0;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>داشبورد ورزشکار</h1>
                <p>خوش آمدید، {member.first_name} {member.last_name}</p>
            </div>

            {/* اطلاعات شخصی */}
            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h2>اطلاعات شخصی</h2>
                    <div className="info-list">
                        <div className="info-item">
                            <span className="label">نام و نام خانوادگی:</span>
                            <span className="value">{member.first_name} {member.last_name}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">شماره تماس:</span>
                            <span className="value">{member.phone}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">سطح عضویت:</span>
                            <span className="value badge">{member.membership_level}</span>
                        </div>
                        <div className="info-item">
                            <span className="label">وضعیت:</span>
                            <span className={`value badge ${member.subscription_status === 'فعال' ? 'active' : 'inactive'}`}>
                                {member.subscription_status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* آمار حضور و غیاب */}
                <div className="dashboard-card">
                    <h2>آمار حضور (30 روز اخیر)</h2>
                    <div className="stats-grid">
                        <div className="stat-item">
                            <div className="stat-value">{attendance.stats.total_days}</div>
                            <div className="stat-label">کل روزها</div>
                        </div>
                        <div className="stat-item success">
                            <div className="stat-value">{attendance.stats.present_days}</div>
                            <div className="stat-label">حاضر</div>
                        </div>
                        <div className="stat-item danger">
                            <div className="stat-value">{attendance.stats.absent_days}</div>
                            <div className="stat-label">غایب</div>
                        </div>
                        <div className="stat-item warning">
                            <div className="stat-value">{attendance.stats.leave_days}</div>
                            <div className="stat-label">مرخصی</div>
                        </div>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${attendancePercentage}%` }}></div>
                    </div>
                    <p className="progress-text">درصد حضور: {attendancePercentage}%</p>
                </div>
            </div>

            {/* حضور و غیاب اخیر */}
            <div className="dashboard-card">
                <h2>حضور و غیاب اخیر</h2>
                <div className="table-container">
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>تاریخ</th>
                                <th>وضعیت</th>
                                <th>توضیحات</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance.recent.map((record, index) => (
                                <tr key={index}>
                                    <td>{new Date(record.date).toLocaleDateString('fa-IR')}</td>
                                    <td>
                                        <span className={`badge ${record.status === 'حاضر' ? 'success' :
                                                record.status === 'غایب' ? 'danger' : 'warning'
                                            }`}>
                                            {record.status}
                                        </span>
                                    </td>
                                    <td>{record.reason || '-'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* تراکنش‌های مالی */}
            <div className="dashboard-card">
                <h2>تراکنش‌های مالی</h2>
                <div className="financial-summary">
                    <div className="summary-item">
                        <span className="label">مجموع پرداخت‌ها:</span>
                        <span className="value">{financial.totalPaid.toLocaleString()} تومان</span>
                    </div>
                </div>
                <div className="table-container">
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>تاریخ</th>
                                <th>عنوان</th>
                                <th>مبلغ</th>
                                <th>دسته‌بندی</th>
                            </tr>
                        </thead>
                        <tbody>
                            {financial.transactions.map((transaction) => (
                                <tr key={transaction.id}>
                                    <td>{new Date(transaction.date).toLocaleDateString('fa-IR')}</td>
                                    <td>{transaction.title}</td>
                                    <td className="amount">{parseInt(transaction.amount).toLocaleString()} تومان</td>
                                    <td><span className="badge">{transaction.category}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default AthleteDashboard;
