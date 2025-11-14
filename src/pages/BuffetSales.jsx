import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaUser, FaShoppingCart, FaMoneyBillWave, FaSearch } from 'react-icons/fa';
import '../styles/Buffet.css';

function BuffetSales() {
    const [sales, setSales] = useState([]);
    const [filteredSales, setFilteredSales] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateFilter, setDateFilter] = useState('all'); // all, today, week, month
    const [expandedSale, setExpandedSale] = useState(null);

    useEffect(() => {
        fetchSales();
    }, []);

    useEffect(() => {
        filterSales();
    }, [searchTerm, dateFilter, sales]);

    const fetchSales = async () => {
        try {
            const token = localStorage.getItem('gym_auth_token');
            const response = await fetch('http://localhost:5000/api/buffet-sales', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (data.success) {
                setSales(data.data);
                setFilteredSales(data.data);
            }
        } catch (error) {
            console.error('Error fetching sales:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterSales = () => {
        let filtered = sales;

        // فیلتر جستجو
        if (searchTerm) {
            filtered = filtered.filter(s =>
                (s.first_name && s.first_name.includes(searchTerm)) ||
                (s.last_name && s.last_name.includes(searchTerm)) ||
                (s.phone && s.phone.includes(searchTerm))
            );
        }

        // فیلتر تاریخ
        const now = new Date();
        if (dateFilter === 'today') {
            filtered = filtered.filter(s => {
                const saleDate = new Date(s.created_at);
                return saleDate.toDateString() === now.toDateString();
            });
        } else if (dateFilter === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(s => new Date(s.created_at) >= weekAgo);
        } else if (dateFilter === 'month') {
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            filtered = filtered.filter(s => new Date(s.created_at) >= monthAgo);
        }

        setFilteredSales(filtered);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fa-IR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const calculateTotal = () => {
        return filteredSales.reduce((sum, sale) => sum + parseInt(sale.total_amount), 0);
    };

    const toggleExpand = (saleId) => {
        setExpandedSale(expandedSale === saleId ? null : saleId);
    };

    if (loading) {
        return <div className="buffet-loading">در حال بارگذاری...</div>;
    }

    return (
        <div className="buffet-container">
            <div className="buffet-header">
                <div>
                    <h1>تاریخچه فروش</h1>
                    <p>مشاهده و مدیریت فروش‌های بوفه</p>
                </div>
            </div>

            {/* آمار کلی */}
            <div className="buffet-stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <div className="buffet-stat-card">
                    <div className="buffet-stat-icon"><FaShoppingCart /></div>
                    <div className="buffet-stat-content">
                        <div className="buffet-stat-value">{filteredSales.length}</div>
                        <div className="buffet-stat-label">تعداد فروش</div>
                    </div>
                </div>
                <div className="buffet-stat-card success">
                    <div className="buffet-stat-icon"><FaMoneyBillWave /></div>
                    <div className="buffet-stat-content">
                        <div className="buffet-stat-value">{calculateTotal().toLocaleString()}</div>
                        <div className="buffet-stat-label">جمع فروش (تومان)</div>
                    </div>
                </div>
            </div>

            {/* فیلترها */}
            <div className="buffet-card">
                <div className="buffet-filters">
                    <div className="buffet-search">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="جستجوی عضو..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="buffet-select"
                    >
                        <option value="all">همه زمان‌ها</option>
                        <option value="today">امروز</option>
                        <option value="week">هفته اخیر</option>
                        <option value="month">ماه اخیر</option>
                    </select>
                </div>
            </div>

            {/* لیست فروش‌ها */}
            <div className="buffet-card">
                {filteredSales.length === 0 ? (
                    <div className="buffet-empty">
                        <FaShoppingCart style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
                        <p>فروشی یافت نشد</p>
                    </div>
                ) : (
                    <div className="sales-list">
                        {filteredSales.map((sale) => (
                            <div key={sale.id} className="sale-item">
                                <div className="sale-header" onClick={() => toggleExpand(sale.id)}>
                                    <div className="sale-info">
                                        <div className="sale-id">#{sale.id}</div>
                                        <div className="sale-member">
                                            <FaUser />
                                            {sale.first_name && sale.last_name
                                                ? `${sale.first_name} ${sale.last_name}`
                                                : 'مهمان'}
                                        </div>
                                        <div className="sale-date">
                                            <FaCalendarAlt />
                                            {formatDate(sale.created_at)}
                                        </div>
                                    </div>
                                    <div className="sale-amount">
                                        {parseInt(sale.total_amount).toLocaleString()} تومان
                                    </div>
                                </div>

                                {expandedSale === sale.id && sale.items && (
                                    <div className="sale-details">
                                        <div className="sale-items-header">آیتم‌های خرید:</div>
                                        <div className="sale-items-list">
                                            {sale.items.map((item, index) => (
                                                <div key={index} className="sale-item-row">
                                                    <div className="item-name">{item.product_name}</div>
                                                    <div className="item-quantity">×{item.quantity}</div>
                                                    <div className="item-price">
                                                        {parseInt(item.total_price).toLocaleString()} تومان
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        {sale.chef_username && (
                                            <div className="sale-footer">
                                                <span>فروشنده: {sale.chef_username}</span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default BuffetSales;
