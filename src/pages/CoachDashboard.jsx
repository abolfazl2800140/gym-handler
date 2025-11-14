import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userManager } from '../services/auth';
import '../styles/Dashboard.css';

function CoachDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const user = userManager.getUser();

    useEffect(() => {
        fetchDashboard();
    }, []);

    const fetchDashboard = async () => {
        try {
            const token = localStorage.getItem('gym_auth_token');
            const response = await fetch('http://localhost:5000/api/member-dashboard/coach', {
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

    const { coach, athletes, stats } = data;

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>داشبورد مربی</h1>
                <p>خوش آمدید، {coach.first_name} {coach.last_name}</p>
            </div>

            {/* آمار کلی */}
            <div className="dashboard-grid">
                <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.total_athletes}</div>
                        <div className="stat-label">کل ورزشکاران</div>
                    </div>
                </div>
                <div className="stat-card success">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.active_athletes}</div>
                        <div className="stat-label">ورزشکاران فعال</div>
                    </div>
                </div>
                <div className="stat-card danger">
                    <div className="stat-icon">❌</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.inactive_athletes}</div>
                        <div className="stat-label">ورزشکاران غیرفعال</div>
                    </div>
                </div>
                <div className="stat-card info">
                    <div className="stat-icon">📅</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats.todayAttendance?.present || 0}</div>
                        <div className="stat-label">حضور امروز</div>
                    </div>
                </div>
            </div>

            {/* لیست ورزشکاران */}
            <div className="dashboard-card">
                <h2>لیست ورزشکاران</h2>
                <div className="table-container">
                    <table className="dashboard-table">
                        <thead>
                            <tr>
                                <th>نام و نام خانوادگی</th>
                                <th>شماره تماس</th>
                                <th>سطح عضویت</th>
                                <th>وضعیت</th>
                                <th>تاریخ عضویت</th>
                            </tr>
                        </thead>
                        <tbody>
                            {athletes.map((athlete) => (
                                <tr key={athlete.id}>
                                    <td>{athlete.first_name} {athlete.last_name}</td>
                                    <td>{athlete.phone}</td>
                                    <td><span className="badge">{athlete.membership_level}</span></td>
                                    <td>
                                        <span className={`badge ${athlete.subscription_status === 'فعال' ? 'success' : 'danger'
                                            }`}>
                                            {athlete.subscription_status}
                                        </span>
                                    </td>
                                    <td>{new Date(athlete.join_date).toLocaleDateString('fa-IR')}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default CoachDashboard;
