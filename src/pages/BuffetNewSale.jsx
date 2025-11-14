import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlus, FaMinus, FaTrash, FaShoppingCart, FaUser, FaSearch, FaTimes } from 'react-icons/fa';
import notification from '../services/notification';
import '../styles/BuffetSale.css';

function BuffetNewSale() {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [members, setMembers] = useState([]);
    const [cart, setCart] = useState([]);
    const [selectedMember, setSelectedMember] = useState(null);
    const [searchMember, setSearchMember] = useState('');
    const [showMemberModal, setShowMemberModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchProducts();
        fetchMembers();
        fetchCategories();
    }, []);

    const fetchProducts = async () => {
        try {
            const token = localStorage.getItem('gym_auth_token');
            const response = await fetch('http://localhost:5000/api/buffet-products', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                const available = data.data.filter(p => p.is_available && p.stock > 0);
                setProducts(available);
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            notification.error('خطا در دریافت محصولات');
        } finally {
            setLoading(false);
        }
    };

    const fetchMembers = async () => {
        try {
            const token = localStorage.getItem('gym_auth_token');
            const response = await fetch('http://localhost:5000/api/members', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setMembers(data.data);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
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

    const addToCart = (product) => {
        const existingItem = cart.find(item => item.product_id === product.id);

        if (existingItem) {
            if (existingItem.quantity >= product.stock) {
                notification.warning('موجودی کافی نیست');
                return;
            }
            updateQuantity(product.id, existingItem.quantity + 1);
        } else {
            setCart([...cart, {
                product_id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                max_stock: product.stock,
                unit: product.unit
            }]);
            notification.success(`${product.name} به سبد اضافه شد`);
        }
    };

    const updateQuantity = (productId, newQuantity) => {
        const item = cart.find(i => i.product_id === productId);

        if (newQuantity <= 0) {
            removeFromCart(productId);
            return;
        }

        if (newQuantity > item.max_stock) {
            notification.warning('موجودی کافی نیست');
            return;
        }

        setCart(cart.map(item =>
            item.product_id === productId
                ? { ...item, quantity: newQuantity }
                : item
        ));
    };

    const removeFromCart = (productId) => {
        setCart(cart.filter(item => item.product_id !== productId));
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const filteredMembers = members.filter(m =>
        `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchMember.toLowerCase()) ||
        m.phone?.includes(searchMember)
    );

    const filteredProducts = selectedCategory === 'all'
        ? products
        : products.filter(p => p.category === selectedCategory);

    const handleSubmit = async () => {
        if (cart.length === 0) {
            notification.warning('سبد خرید خالی است');
            return;
        }

        setSubmitting(true);
        try {
            const token = localStorage.getItem('gym_auth_token');
            const response = await fetch('http://localhost:5000/api/buffet-sales', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    member_id: selectedMember?.id || null,
                    items: cart.map(item => ({
                        product_id: item.product_id,
                        quantity: item.quantity,
                        price: item.price
                    })),
                    total_amount: calculateTotal()
                })
            });
            const data = await response.json();

            if (data.success) {
                notification.success('فروش با موفقیت ثبت شد');
                setCart([]);
                setSelectedMember(null);
                fetchProducts();

                setTimeout(() => {
                    navigate('/buffet/sales');
                }, 1500);
            } else {
                notification.error(data.error || 'خطا در ثبت فروش');
            }
        } catch (error) {
            console.error('Error submitting sale:', error);
            notification.error('خطا در ثبت فروش');
        } finally {
            setSubmitting(false);
        }
    };

    const clearCart = () => {
        setCart([]);
        notification.info('سبد خرید خالی شد');
    };

    if (loading) {
        return (
            <div className="sale-loading">
                <div className="spinner"></div>
                <p>در حال بارگذاری...</p>
            </div>
        );
    }

    return (
        <div className="sale-container">
            {/* Header */}
            <div className="sale-header">
                <div>
                    <h1>فروش جدید</h1>
                    <p>انتخاب محصولات و ثبت فروش</p>
                </div>
                <button onClick={() => navigate('/buffet/dashboard')} className="btn-back">
                    بازگشت به داشبورد
                </button>
            </div>

            <div className="sale-layout">
                {/* Products Section */}
                <div className="products-section">
                    <div className="section-card">
                        <div className="section-header">
                            <h2>محصولات</h2>
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="category-filter"
                            >
                                <option value="all">همه دسته‌ها</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {filteredProducts.length === 0 ? (
                            <div className="empty-state">
                                <FaShoppingCart />
                                <p>محصولی یافت نشد</p>
                            </div>
                        ) : (
                            <div className="products-grid">
                                {filteredProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className="product-card"
                                        onClick={() => addToCart(product)}
                                    >
                                        <div className="product-badge">{product.category}</div>
                                        <h3>{product.name}</h3>
                                        <div className="product-price">
                                            {parseInt(product.price).toLocaleString()} تومان
                                        </div>
                                        <div className="product-stock">
                                            موجودی: {product.stock} {product.unit}
                                        </div>
                                        <button className="btn-add">
                                            <FaPlus /> افزودن
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Cart Section */}
                <div className="cart-section">
                    {/* Member Selection */}
                    <div className="section-card member-card">
                        <h3>خریدار</h3>
                        {!selectedMember ? (
                            <div className="member-actions">
                                <button
                                    onClick={() => setShowMemberModal(true)}
                                    className="btn-select-member"
                                >
                                    <FaUser /> انتخاب عضو
                                </button>
                                <div className="guest-label">
                                    <span>یا فروش به مهمان</span>
                                </div>
                            </div>
                        ) : (
                            <div className="selected-member">
                                <div className="member-info">
                                    <FaUser />
                                    <div>
                                        <div className="member-name">
                                            {selectedMember.first_name} {selectedMember.last_name}
                                        </div>
                                        <div className="member-phone">{selectedMember.phone}</div>
                                        <div className="member-wallet">
                                            موجودی: {parseInt(selectedMember.wallet_balance || 0).toLocaleString()} تومان
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedMember(null)}
                                    className="btn-remove-member"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Cart */}
                    <div className="section-card cart-card">
                        <div className="cart-header">
                            <h3>
                                <FaShoppingCart /> سبد خرید ({cart.length})
                            </h3>
                            {cart.length > 0 && (
                                <button onClick={clearCart} className="btn-clear">
                                    <FaTrash /> خالی کردن
                                </button>
                            )}
                        </div>

                        {cart.length === 0 ? (
                            <div className="empty-cart">
                                <FaShoppingCart />
                                <p>سبد خرید خالی است</p>
                                <span>محصولات را از لیست انتخاب کنید</span>
                            </div>
                        ) : (
                            <>
                                <div className="cart-items">
                                    {cart.map((item) => (
                                        <div key={item.product_id} className="cart-item">
                                            <div className="item-header">
                                                <span className="item-name">{item.name}</span>
                                                <button
                                                    onClick={() => removeFromCart(item.product_id)}
                                                    className="btn-remove"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                            <div className="item-details">
                                                <div className="item-price">
                                                    {parseInt(item.price).toLocaleString()} تومان
                                                </div>
                                                <div className="quantity-controls">
                                                    <button
                                                        onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                                        className="qty-btn"
                                                    >
                                                        <FaMinus />
                                                    </button>
                                                    <span className="quantity">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                                        className="qty-btn"
                                                    >
                                                        <FaPlus />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="item-total">
                                                جمع: {(item.price * item.quantity).toLocaleString()} تومان
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="cart-summary">
                                    <div className="summary-row">
                                        <span>تعداد اقلام:</span>
                                        <span>{cart.reduce((sum, item) => sum + item.quantity, 0)}</span>
                                    </div>
                                    <div className="summary-row total">
                                        <span>جمع کل:</span>
                                        <span>{calculateTotal().toLocaleString()} تومان</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={submitting}
                                    className="btn-submit"
                                >
                                    {submitting ? 'در حال ثبت...' : 'ثبت فروش'}
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Member Selection Modal */}
            {showMemberModal && (
                <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>انتخاب عضو</h2>
                            <button onClick={() => setShowMemberModal(false)} className="btn-close">
                                <FaTimes />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="search-box">
                                <FaSearch />
                                <input
                                    type="text"
                                    placeholder="جستجو با نام یا شماره تلفن..."
                                    value={searchMember}
                                    onChange={(e) => setSearchMember(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="members-list">
                                {filteredMembers.length === 0 ? (
                                    <div className="empty-state">
                                        <p>عضوی یافت نشد</p>
                                    </div>
                                ) : (
                                    filteredMembers.map((member) => (
                                        <div
                                            key={member.id}
                                            className="member-item"
                                            onClick={() => {
                                                setSelectedMember(member);
                                                setShowMemberModal(false);
                                                setSearchMember('');
                                            }}
                                        >
                                            <div className="member-avatar">
                                                <FaUser />
                                            </div>
                                            <div className="member-details">
                                                <div className="member-name">
                                                    {member.first_name} {member.last_name}
                                                </div>
                                                <div className="member-phone">{member.phone}</div>
                                                <div className="member-wallet">
                                                    موجودی: {parseInt(member.wallet_balance || 0).toLocaleString()} تومان
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BuffetNewSale;
