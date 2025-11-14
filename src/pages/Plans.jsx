import { useState, useEffect } from 'react';
import { FaStar, FaPlus, FaEdit, FaToggleOn, FaToggleOff, FaCalendar, FaDollarSign } from 'react-icons/fa';
import { plansAPI } from '../services/api';
import { userManager } from '../services/auth';
import notification from '../services/notification';
import PlanForm from '../components/PlanForm';
import '../styles/Plans.css';

function Plans() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    const isSuperAdmin = userManager.isSuperAdmin();

    useEffect(() => {
        if (!isSuperAdmin) {
            notification.error('فقط سوپرادمین به این صفحه دسترسی دارد');
            return;
        }
        fetchPlans();
    }, [isSuperAdmin]);

    const fetchPlans = async () => {
        try {
            setLoading(true);
            const response = await plansAPI.getAll();
            if (response.success) {
                setPlans(response.data);
            }
        } catch (error) {
            console.error('Error fetching plans:', error);
            notification.error('خطا در دریافت لیست پلن‌ها');
        } finally {
            setLoading(false);
        }
    };

    const handleAddPlan = () => {
        setSelectedPlan(null);
        setShowForm(true);
    };

    const handleEditPlan = (plan) => {
        setSelectedPlan(plan);
        setShowForm(true);
    };

    const handleToggleStatus = async (plan) => {
        try {
            console.log('Toggling plan:', plan.id);
            const response = await plansAPI.toggleStatus(plan.id);
            console.log('Toggle response:', response);
            if (response.success) {
                notification.success(response.message);
                fetchPlans();
            }
        } catch (error) {
            console.error('Toggle error:', error);
            notification.error(error.message || 'خطا در تغییر وضعیت پلن');
        }
    };

    const handleFormSuccess = () => {
        setShowForm(false);
        setSelectedPlan(null);
        fetchPlans();
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('fa-IR').format(price);
    };

    if (!isSuperAdmin) {
        return (
            <div className="plans-page">
                <div className="access-denied">
                    <h2>دسترسی محدود</h2>
                    <p>فقط سوپرادمین به این صفحه دسترسی دارد</p>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="plans-page">
                <div className="loading">در حال بارگذاری...</div>
            </div>
        );
    }

    return (
        <div className="plans-page">
            <div className="page-header">
                <div>
                    <h1>مدیریت پلن‌های عضویت</h1>
                    <p>ایجاد و مدیریت پلن‌های مختلف باشگاه</p>
                </div>
                <button onClick={handleAddPlan} className="btn-primary">
                    <FaPlus />
                    افزودن پلن جدید
                </button>
            </div>

            <div className="plans-grid">
                {plans.map(plan => (
                    <div
                        key={plan.id}
                        className={`plan-card ${!plan.is_active ? 'inactive' : ''}`}
                        style={{ borderTopColor: plan.color }}
                    >
                        <div className="plan-card-header">
                            <div className="plan-icon" style={{ backgroundColor: plan.color }}>
                                <FaStar />
                            </div>
                            <h3>{plan.name}</h3>
                            <span className={`status-badge ${plan.is_active ? 'active' : 'inactive'}`}>
                                {plan.is_active ? 'فعال' : 'غیرفعال'}
                            </span>
                        </div>

                        <div className="plan-card-body">
                            <div className="plan-info-item">
                                <span className="label">
                                    <FaCalendar /> مدت زمان:
                                </span>
                                <span className="value">{plan.duration_days} روز</span>
                            </div>

                            <div className="plan-info-item">
                                <span className="label">
                                    <FaDollarSign /> قیمت:
                                </span>
                                <span className="value">{formatPrice(plan.price)} تومان</span>
                            </div>

                            <div className="plan-description">
                                {plan.description && <p>{plan.description}</p>}
                            </div>
                        </div>

                        <div className="plan-card-footer">
                            <button
                                onClick={() => handleEditPlan(plan)}
                                className="btn-edit"
                                title="ویرایش"
                            >
                                <FaEdit /> ویرایش
                            </button>
                            <button
                                onClick={() => handleToggleStatus(plan)}
                                className={`btn-toggle ${plan.is_active ? 'active' : 'inactive'}`}
                                title={plan.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                            >
                                {plan.is_active ? <FaToggleOn /> : <FaToggleOff />}
                                {plan.is_active ? 'غیرفعال' : 'فعال'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {plans.length === 0 && (
                <div className="empty-state">
                    <FaStar className="empty-icon" />
                    <p>هیچ پلنی وجود ندارد</p>
                    <button onClick={handleAddPlan} className="btn-primary">
                        <FaPlus />
                        افزودن اولین پلن
                    </button>
                </div>
            )}

            {showForm && (
                <PlanForm
                    plan={selectedPlan}
                    onClose={() => setShowForm(false)}
                    onSuccess={handleFormSuccess}
                />
            )}
        </div>
    );
}

export default Plans;
