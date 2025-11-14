import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaBoxOpen, FaSearch } from 'react-icons/fa';
import ProductForm from '../components/ProductForm';
import ConfirmDialog from '../components/ConfirmDialog';
import notification from '../services/notification';
import '../styles/Buffet.css';

function BuffetProducts() {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deletingProduct, setDeletingProduct] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
        fetchProducts();
        fetchCategories();
    }, []);

    useEffect(() => {
        filterProducts();
    }, [searchTerm, selectedCategory, products]);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('gym_auth_token');
            const response = await fetch('http://localhost:5000/api/buffet-products', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setProducts(data.data);
                setFilteredProducts(data.data);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            notification.error('خطا در دریافت محصولات');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const token = localStorage.getItem('gym_auth_token');
            const response = await fetch('http://localhost:5000/api/buffet-products/categories', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setCategories(data.data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const filterProducts = () => {
        let filtered = products;

        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedCategory) {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        setFilteredProducts(filtered);
    };

    const handleAddProduct = () => {
        setEditingProduct(null);
        setShowForm(true);
    };

    const handleEditProduct = (product) => {
        setEditingProduct(product);
        setShowForm(true);
    };

    const handleDeleteClick = (product) => {
        setDeletingProduct(product);
        setShowDeleteDialog(true);
    };

    const handleDeleteConfirm = async () => {
        try {
            const token = localStorage.getItem('gym_auth_token');
            const response = await fetch(`http://localhost:5000/api/buffet-products/${deletingProduct.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                notification.success('محصول با موفقیت حذف شد');
                fetchProducts();
            }
        } catch (error) {
            notification.error('خطا در حذف محصول');
        } finally {
            setShowDeleteDialog(false);
            setDeletingProduct(null);
        }
    };

    const handleSaveProduct = async (formData) => {
        try {
            const token = localStorage.getItem('gym_auth_token');
            const url = editingProduct
                ? `http://localhost:5000/api/buffet-products/${editingProduct.id}`
                : 'http://localhost:5000/api/buffet-products';

            const response = await fetch(url, {
                method: editingProduct ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            const data = await response.json();

            if (data.success) {
                notification.success(editingProduct ? 'محصول به‌روزرسانی شد' : 'محصول اضافه شد');
                setShowForm(false);
                fetchProducts();
                fetchCategories();
            }
        } catch (error) {
            notification.error('خطا در ذخیره محصول');
        }
    };

    if (loading) {
        return <div className="buffet-loading">در حال بارگذاری...</div>;
    }

    return (
        <div className="buffet-container">
            <div className="buffet-header">
                <div>
                    <h1>مدیریت محصولات</h1>
                    <p>افزودن، ویرایش و مدیریت محصولات بوفه</p>
                </div>
                <button onClick={handleAddProduct} className="buffet-action-btn primary">
                    <FaPlus /> محصول جدید
                </button>
            </div>

            {/* فیلترها */}
            <div className="buffet-card">
                <div className="buffet-filters">
                    <div className="buffet-search">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="جستجوی محصول..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="buffet-select"
                    >
                        <option value="">همه دسته‌بندی‌ها</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* لیست محصولات */}
            <div className="buffet-products-grid">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="buffet-product-card">
                        <div className="product-header">
                            <div className="product-icon">
                                <FaBoxOpen />
                            </div>
                            <div className="product-actions">
                                <button onClick={() => handleEditProduct(product)} className="btn-icon edit">
                                    <FaEdit />
                                </button>
                                <button onClick={() => handleDeleteClick(product)} className="btn-icon delete">
                                    <FaTrash />
                                </button>
                            </div>
                        </div>
                        <div className="product-body">
                            <h3>{product.name}</h3>
                            <span className="buffet-badge">{product.category}</span>
                            <div className="product-info">
                                <div className="info-row">
                                    <span className="label">قیمت:</span>
                                    <span className="value price">{parseInt(product.price).toLocaleString()} تومان</span>
                                </div>
                                <div className="info-row">
                                    <span className="label">موجودی:</span>
                                    <span className={`value ${product.stock <= 10 ? 'low-stock' : ''}`}>
                                        {product.stock} {product.unit}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="label">وضعیت:</span>
                                    <span className={`buffet-badge ${product.is_available ? 'success' : 'danger'}`}>
                                        {product.is_available ? 'فعال' : 'غیرفعال'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="buffet-empty">
                    <FaBoxOpen style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                    <p>محصولی یافت نشد</p>
                </div>
            )}

            {/* فرم محصول */}
            {showForm && (
                <ProductForm
                    product={editingProduct}
                    categories={categories}
                    onSave={handleSaveProduct}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {/* دیالوگ حذف */}
            {showDeleteDialog && (
                <ConfirmDialog
                    title="حذف محصول"
                    message={`آیا مطمئن هستید که می‌خواهید "${deletingProduct?.name}" را حذف کنید؟`}
                    onConfirm={handleDeleteConfirm}
                    onCancel={() => setShowDeleteDialog(false)}
                    type="danger"
                />
            )}
        </div>
    );
}

export default BuffetProducts;
