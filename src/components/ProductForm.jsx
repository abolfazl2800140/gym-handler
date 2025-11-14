import { useState, useEffect } from 'react';
import '../styles/UserForm.css';

function ProductForm({ product, categories, onSave, onCancel }) {
    const [formData, setFormData] = useState({
        name: '',
        category: '',
        price: '',
        stock: '',
        unit: 'عدد',
        is_available: true
    });

    const [newCategory, setNewCategory] = useState('');
    const [showNewCategory, setShowNewCategory] = useState(false);

    useEffect(() => {
        if (product) {
            setFormData({
                name: product.name,
                category: product.category,
                price: product.price,
                stock: product.stock,
                unit: product.unit,
                is_available: product.is_available
            });
        }
    }, [product]);

    const handleSubmit = (e) => {
        e.preventDefault();

        const dataToSave = {
            ...formData,
            category: showNewCategory ? newCategory : formData.category,
            price: parseInt(formData.price),
            stock: parseInt(formData.stock)
        };

        onSave(dataToSave);
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{product ? 'ویرایش محصول' : 'افزودن محصول جدید'}</h2>
                    <button onClick={onCancel} className="close-button">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="user-form">
                    <div className="form-group">
                        <label htmlFor="name">نام محصول *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            placeholder="مثال: ساندویچ مرغ"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="category">دسته‌بندی *</label>
                        {!showNewCategory ? (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <select
                                    id="category"
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    style={{ flex: 1 }}
                                >
                                    <option value="">انتخاب کنید</option>
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => setShowNewCategory(true)}
                                    className="btn-secondary"
                                    style={{ whiteSpace: 'nowrap' }}
                                >
                                    دسته جدید
                                </button>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    placeholder="نام دسته‌بندی جدید"
                                    required
                                    style={{ flex: 1 }}
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowNewCategory(false);
                                        setNewCategory('');
                                    }}
                                    className="btn-secondary"
                                >
                                    انصراف
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="price">قیمت (تومان) *</label>
                            <input
                                type="number"
                                id="price"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                required
                                min="0"
                                placeholder="50000"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="stock">موجودی *</label>
                            <input
                                type="number"
                                id="stock"
                                name="stock"
                                value={formData.stock}
                                onChange={handleChange}
                                required
                                min="0"
                                placeholder="20"
                            />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="unit">واحد *</label>
                            <select
                                id="unit"
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                required
                            >
                                <option value="عدد">عدد</option>
                                <option value="کیلو">کیلو</option>
                                <option value="لیتر">لیتر</option>
                                <option value="گرم">گرم</option>
                                <option value="بسته">بسته</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="checkbox"
                                    name="is_available"
                                    checked={formData.is_available}
                                    onChange={handleChange}
                                    style={{ width: 'auto', cursor: 'pointer' }}
                                />
                                <span>محصول فعال است</span>
                            </label>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button type="button" onClick={onCancel} className="btn-cancel">
                            انصراف
                        </button>
                        <button type="submit" className="btn-submit">
                            {product ? 'ذخیره تغییرات' : 'افزودن محصول'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ProductForm;
