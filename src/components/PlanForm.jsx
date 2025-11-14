import { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';
import { plansAPI } from '../services/api';
import notification from '../services/notification';

function PlanForm({ plan, onClose, onSuccess }) {
    const [formData, setFormData] = useState({
        name: '',
        duration_days: '',
        price: '',
        description: '',
        color: '#3182ce'
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (plan) {
            setFormData({
                name: plan.name || '',
                duration_days: plan.duration_days || '',
                price: plan.price || '',
                description: plan.description || '',
                color: plan.color || '#3182ce'
            });
        }
    }, [plan]);

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'نام پلن الزامی است';
        }

        if (!formData.duration_days || formData.duration_days <= 0) {
            newErrors.duration_days = 'مدت زمان باید بیشتر از صفر باشد';
        }

        if (!formData.price || formData.price <= 0) {
            newErrors.price = 'قیمت باید بیشتر از صفر باشد';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // پاک کردن خطا هنگام تایپ
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        try {
            setLoading(true);

            const planData = {
                ...formData,
                duration_days: parseInt(formData.duration_days),
                price: parseFloat(formData.price)
            };

            let response;
            if (plan) {
                response = await plansAPI.update(plan.id, planData);
            } else {
                response = await plansAPI.create(planData);
            }

            if (response.success) {
                notification.success(response.message);
                onSuccess();
            }
        } catch (error) {
            notification.error(error.message || 'خطا در ذخیره پلن');
        } finally {
            setLoading(false);
        }
    };

    const predefinedColors = [
        { name: 'آبی', value: '#3182ce' },
        { name: 'برنزی', value: '#CD7F32' },
        { name: 'نقره‌ای', value: '#C0C0C0' },
        { name: 'طلایی', value: '#FFD700' },
        { name: 'پلاتینیوم', value: '#E5E4E2' },
        { name: 'سبز', value: '#48bb78' },
        { name: 'قرمز', value: '#f56565' },
        { name: 'بنفش', value: '#9f7aea' }
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{plan ? 'ویرایش پلن' : 'افزودن پلن جدید'}</h2>
                    <button onClick={onClose} className="close-button">
                        <FaTimes />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="plan-form">
                    <div className="form-group">
                        <label htmlFor="name">نام پلن *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="مثال: برنزی، نقره‌ای، طلایی"
                            disabled={loading}
                            className={errors.name ? 'error' : ''}
                        />
                        {errors.name && <span className="error-message">{errors.name}</span>}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="duration_days">مدت زمان (روز) *</label>
                            <input
                                type="number"
                                id="duration_days"
                                name="duration_days"
                                value={formData.duration_days}
                                onChange={handleChange}
                                placeholder="30"
                                min="1"
                                disabled={loading}
                                className={errors.duration_days ? 'error' : ''}
                            />
                            {errors.duration_days && <span className="error-message">{errors.duration_days}</span>}
                        </div>

                        <div className="form-group">
                            <label htmlFor="price">قیمت (تومان) *</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="500000"
                                min="0"
                                step="1000"
                                disabled={loading}
                                className={errors.price ? 'error' : ''}
                            />
                            {errors.price && <span className="error-message">{errors.price}</span>}
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">توضیحات</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            placeholder="توضیحات و ویژگی‌های پلن"
                            rows="3"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label>رنگ پلن</label>
                        <div className="color-picker">
                            {predefinedColors.map(color => (
                                <button
                                    key={color.value}
                                    type="button"
                                    className={`color-option ${formData.color === color.value ? 'selected' : ''}`}
                                    style={{ backgroundColor: color.value }}
                                    onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                                    title={color.name}
                                    disabled={loading}
                                />
                            ))}
                            <input
                                type="color"
                                name="color"
                                value={formData.color}
                                onChange={handleChange}
                                className="color-input"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn-cancel"
                            disabled={loading}
                        >
                            انصراف
                        </button>
                        <button
                            type="submit"
                            className="btn-submit"
                            disabled={loading}
                        >
                            {loading ? 'در حال ذخیره...' : (plan ? 'ویرایش پلن' : 'افزودن پلن')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default PlanForm;
