const db = require('../config/database');

// POST create sale
exports.createSale = async (req, res) => {
    const client = await db.pool.connect();

    try {
        const { member_id, items, notes } = req.body;
        const created_by = req.user.id;

        if (!items || items.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'لیست محصولات نمی‌تواند خالی باشد'
            });
        }

        await client.query('BEGIN');

        // محاسبه مبلغ کل
        let total_amount = 0;
        const saleItems = [];

        for (const item of items) {
            // دریافت اطلاعات محصول
            const productResult = await client.query(
                'SELECT * FROM buffet_products WHERE id = $1',
                [item.product_id]
            );

            if (productResult.rows.length === 0) {
                throw new Error(`محصول با شناسه ${item.product_id} یافت نشد`);
            }

            const product = productResult.rows[0];

            // بررسی موجودی
            if (product.stock < item.quantity) {
                throw new Error(`موجودی ${product.name} کافی نیست`);
            }

            const item_total = product.price * item.quantity;
            total_amount += item_total;

            saleItems.push({
                product_id: product.id,
                product_name: product.name,
                quantity: item.quantity,
                unit_price: product.price,
                total_price: item_total
            });

            // کاهش موجودی
            await client.query(
                'UPDATE buffet_products SET stock = stock - $1 WHERE id = $2',
                [item.quantity, product.id]
            );
        }

        // بررسی موجودی کیف پول عضو
        if (member_id) {
            const memberResult = await client.query(
                'SELECT wallet_balance FROM members WHERE id = $1',
                [member_id]
            );

            if (memberResult.rows.length === 0) {
                throw new Error('عضو یافت نشد');
            }

            const wallet_balance = memberResult.rows[0].wallet_balance;

            if (wallet_balance < total_amount) {
                throw new Error('موجودی کیف پول کافی نیست');
            }

            // کسر از کیف پول
            await client.query(
                'UPDATE members SET wallet_balance = wallet_balance - $1 WHERE id = $2',
                [total_amount, member_id]
            );
        }

        // ثبت فروش
        const saleResult = await client.query(
            `INSERT INTO buffet_sales (member_id, total_amount, payment_method, notes, created_by)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
            [member_id, total_amount, member_id ? 'wallet' : 'cash', notes, created_by]
        );

        const sale = saleResult.rows[0];

        // ثبت آیتم‌های فروش
        for (const item of saleItems) {
            await client.query(
                `INSERT INTO buffet_sale_items (sale_id, product_id, product_name, quantity, unit_price, total_price)
         VALUES ($1, $2, $3, $4, $5, $6)`,
                [sale.id, item.product_id, item.product_name, item.quantity, item.unit_price, item.total_price]
            );
        }

        await client.query('COMMIT');

        // دریافت فروش کامل با آیتم‌ها
        const fullSaleResult = await db.query(
            `SELECT s.*, 
              json_agg(json_build_object(
                'id', si.id,
                'product_id', si.product_id,
                'product_name', si.product_name,
                'quantity', si.quantity,
                'unit_price', si.unit_price,
                'total_price', si.total_price
              )) as items
       FROM buffet_sales s
       LEFT JOIN buffet_sale_items si ON s.id = si.sale_id
       WHERE s.id = $1
       GROUP BY s.id`,
            [sale.id]
        );

        res.status(201).json({
            success: true,
            message: 'فروش با موفقیت ثبت شد',
            data: fullSaleResult.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error creating sale:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
};

// GET all sales
exports.getAllSales = async (req, res) => {
    try {
        const { start_date, end_date, member_id, created_by } = req.query;

        let query = `
      SELECT s.*, 
             m.first_name, m.last_name, m.phone,
             u.username as chef_username,
             json_agg(json_build_object(
               'id', si.id,
               'product_name', si.product_name,
               'quantity', si.quantity,
               'unit_price', si.unit_price,
               'total_price', si.total_price
             )) as items
      FROM buffet_sales s
      LEFT JOIN members m ON s.member_id = m.id
      LEFT JOIN users u ON s.created_by = u.id
      LEFT JOIN buffet_sale_items si ON s.id = si.sale_id
      WHERE 1=1
    `;

        const params = [];
        let paramCount = 1;

        if (start_date) {
            query += ` AND s.created_at >= $${paramCount}`;
            params.push(start_date);
            paramCount++;
        }

        if (end_date) {
            query += ` AND s.created_at <= $${paramCount}`;
            params.push(end_date);
            paramCount++;
        }

        if (member_id) {
            query += ` AND s.member_id = $${paramCount}`;
            params.push(member_id);
            paramCount++;
        }

        if (created_by) {
            query += ` AND s.created_by = $${paramCount}`;
            params.push(created_by);
            paramCount++;
        }

        query += ' GROUP BY s.id, m.first_name, m.last_name, m.phone, u.username ORDER BY s.created_at DESC';

        const result = await db.query(query, params);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET sale by ID
exports.getSaleById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `SELECT s.*, 
              m.first_name, m.last_name, m.phone,
              u.username as chef_username,
              json_agg(json_build_object(
                'id', si.id,
                'product_name', si.product_name,
                'quantity', si.quantity,
                'unit_price', si.unit_price,
                'total_price', si.total_price
              )) as items
       FROM buffet_sales s
       LEFT JOIN members m ON s.member_id = m.id
       LEFT JOIN users u ON s.created_by = u.id
       LEFT JOIN buffet_sale_items si ON s.id = si.sale_id
       WHERE s.id = $1
       GROUP BY s.id, m.first_name, m.last_name, m.phone, u.username`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'فروش یافت نشد' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error fetching sale:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET sales statistics
exports.getSalesStats = async (req, res) => {
    try {
        const { period } = req.query; // 'today', 'week', 'month'

        let dateFilter = '';
        if (period === 'today') {
            dateFilter = "AND created_at >= CURRENT_DATE";
        } else if (period === 'week') {
            dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '7 days'";
        } else if (period === 'month') {
            dateFilter = "AND created_at >= CURRENT_DATE - INTERVAL '30 days'";
        }

        const stats = await db.query(`
      SELECT 
        COUNT(*) as total_sales,
        COALESCE(SUM(total_amount), 0) as total_revenue,
        COALESCE(AVG(total_amount), 0) as average_sale
      FROM buffet_sales
      WHERE 1=1 ${dateFilter}
    `);

        const topProducts = await db.query(`
      SELECT 
        si.product_name,
        SUM(si.quantity) as total_quantity,
        SUM(si.total_price) as total_revenue
      FROM buffet_sale_items si
      JOIN buffet_sales s ON si.sale_id = s.id
      WHERE 1=1 ${dateFilter}
      GROUP BY si.product_name
      ORDER BY total_quantity DESC
      LIMIT 5
    `);

        res.json({
            success: true,
            data: {
                stats: stats.rows[0],
                topProducts: topProducts.rows
            }
        });
    } catch (error) {
        console.error('Error fetching sales stats:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
