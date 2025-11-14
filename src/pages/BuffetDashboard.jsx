import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaMoneyBillWave, FaChartBar, FaExclamationTriangle, FaBoxOpen, FaClipboardList } from 'react-icons/fa';
import '../styles/Buffet.css';

function BuffetDashboard() {
    const [stats, setStats] = useState(null);
    const [lowStockProducts, setLowStockProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('gym_auth_token');

            // دریافت آمار امروز
            const statsRes = await fetch('http://localhost:5000/api/buffet-sales/stats?period=today', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const statsData = await statsRes.json();

            // دریافت محصولات کم موجودی
            const lowStockRes = await fetch('http://localhost:5000/api/buffet-products/low-stock', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const lowStockData = await lowStockRes.json();

            if (statsData.success) setStats(statsData.data);
            if (lowStockData.success) setLowStockProducts(lowStockData.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="buffet-loading">در حال بارگذاری...</div>;
    }

    return (
        <div className="buffet-container">
            <div className="buffet-header">
                <h1>داشبورد بوفه</h1>
                <p>مدیریت و فروش محصولات بوفه</p>
            </div>

            {/* آمار امروز */}
            <div className="buffet-stats-grid">
                <div className="buffet-stat-card">
                    <div className="buffet-stat-icon"><FaShoppingCart /></div>
                    <div className="buffet-stat-content">
                        <div className="buffet-stat-value">{stats?.stats?.total_sales || 0}</div>
                        <div className="buffet-stat-label">فروش امروز</div>
                    </div>
                </div>
                <div className="buffet-stat-card success">
                    <div className="buffet-stat-icon"><FaMoneyBillWave /></div>
                    <div className="buffet-stat-content">
                        <div className="buffet-stat-value">
                            {parseInt(stats?.stats?.total_revenue || 0).toLocaleString()}
                        </div>
                        <div className="buffet-stat-label">درآمد امروز (تومان)</div>
                    </div>
                </div>
                <div className="buffet-stat-card info">
                    <div className="buffet-stat-icon"><FaChartBar /></div>
                    <div className="buffet-stat-content">
                        <div className="buffet-stat-value">
                            {parseInt(stats?.stats?.average_sale || 0).toLocaleString()}
                        </div>
                        <div className="buffet-stat-label">میانگین فروش (تومان)</div>
                    </div>
                </div>
                <div className="buffet-stat-card warning">
                    <div className="buffet-stat-icon"><FaExclamationTriangle /></div>
                    <div className="buffet-stat-content">
                        <div className="buffet-stat-value">{lowStockProducts.length}</div>
                        <div className="buffet-stat-label">محصول کم موجودی</div>
                    </div>
                </div>
            </div>

            {/* دکمه‌های سریع */}
            <div className="buffet-quick-actions">
                <Link to="/buffet/new-sale" className="buffet-action-btn primary">
                    <span className="icon"><FaShoppingCart /></span>
                    <span>فروش جدید</span>
                </Link>
                <Link to="/buffet/products" className="buffet-action-btn secondary">
                    <span className="icon"><FaBoxOpen /></span>
                    <span>مدیریت محصولات</span>
                </Link>
                <Link to="/buffet/sales" className="buffet-action-btn info">
                    <span className="icon"><FaClipboardList /></span>
                    <span>تاریخچه فروش</span>
                </Link>
            </div>

            {/* محصولات پرفروش امروز */}
            {stats?.topProducts && stats.topProducts.length > 0 && (
                <div className="buffet-card">
                    <h2>محصولات پرفروش امروز</h2>
                    <div className="buffet-table-container">
                        <table className="buffet-table">
                            <thead>
                                <tr>
                                    <th>محصول</th>
                                    <th>تعداد فروش</th>
                                    <th>درآمد</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.topProducts.map((product, index) => (
                                    <tr key={index}>
                                        <td>{product.product_name}</td>
                                        <td>{product.total_quantity}</td>
                                        <td className="amount">
                                            {parseInt(product.total_revenue).toLocaleString()} تومان
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* محصولات کم موجودی */}
            {lowStockProducts.length > 0 && (
                <div className="buffet-card">
                    <h2>محصولات کم موجودی</h2>
                    <div className="buffet-table-container">
                        <table className="buffet-table">
                            <thead>
                                <tr>
                                    <th>محصول</th>
                                    <th>دسته‌بندی</th>
                                    <th>موجودی</th>
                                    <th>قیمت</th>
                                </tr>
                            </thead>
                            <tbody>
                                {lowStockProducts.map((product) => (
                                    <tr key={product.id}>
                                        <td>{product.name}</td>
                                        <td><span className="buffet-badge">{product.category}</span></td>
                                        <td>
                                            <span className="buffet-badge danger">
                                                {product.stock} {product.unit}
                                            </span>
                                        </td>
                                        <td>{parseInt(product.price).toLocaleString()} تومان</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BuffetDashboard;
