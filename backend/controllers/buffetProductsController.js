const db = require('../config/database');

// GET all products
exports.getAllProducts = async (req, res) => {
    try {
        const { category, available } = req.query;

        let query = 'SELECT * FROM buffet_products WHERE 1=1';
        const params = [];
        let paramCount = 1;

        if (category) {
            query += ` AND category = $${paramCount}`;
            params.push(category);
            paramCount++;
        }

        if (available !== undefined) {
            query += ` AND is_available = $${paramCount}`;
            params.push(available === 'true');
            paramCount++;
        }

        query += ' ORDER BY category, name';

        const result = await db.query(query, params);

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET single product
exports.getProductById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            'SELECT * FROM buffet_products WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'محصول یافت نشد' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST create product
exports.createProduct = async (req, res) => {
    try {
        const { name, category, price, stock, unit, image } = req.body;

        if (!name || !category || !price) {
            return res.status(400).json({
                success: false,
                error: 'نام، دسته‌بندی و قیمت الزامی است'
            });
        }

        const result = await db.query(
            `INSERT INTO buffet_products (name, category, price, stock, unit, image)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
            [name, category, price, stock || 0, unit || 'عدد', image]
        );

        res.status(201).json({
            success: true,
            message: 'محصول با موفقیت ایجاد شد',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// PUT update product
exports.updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, price, stock, unit, image, is_available } = req.body;

        const result = await db.query(
            `UPDATE buffet_products 
       SET name = $1, category = $2, price = $3, stock = $4, unit = $5, 
           image = $6, is_available = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
            [name, category, price, stock, unit, image, is_available, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'محصول یافت نشد' });
        }

        res.json({
            success: true,
            message: 'محصول با موفقیت به‌روزرسانی شد',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// DELETE product
exports.deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            'DELETE FROM buffet_products WHERE id = $1 RETURNING *',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'محصول یافت نشد' });
        }

        res.json({
            success: true,
            message: 'محصول با موفقیت حذف شد',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET product categories
exports.getCategories = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT DISTINCT category FROM buffet_products ORDER BY category'
        );

        res.json({
            success: true,
            data: result.rows.map(row => row.category)
        });
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// GET low stock products
exports.getLowStockProducts = async (req, res) => {
    try {
        const threshold = req.query.threshold || 10;

        const result = await db.query(
            'SELECT * FROM buffet_products WHERE stock <= $1 AND is_available = true ORDER BY stock',
            [threshold]
        );

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching low stock products:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// PATCH update stock
exports.updateStock = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity, operation } = req.body; // operation: 'add' or 'subtract'

        if (!quantity || !operation) {
            return res.status(400).json({
                success: false,
                error: 'مقدار و نوع عملیات الزامی است'
            });
        }

        const operator = operation === 'add' ? '+' : '-';

        const result = await db.query(
            `UPDATE buffet_products 
       SET stock = stock ${operator} $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
            [quantity, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'محصول یافت نشد' });
        }

        res.json({
            success: true,
            message: 'موجودی با موفقیت به‌روزرسانی شد',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating stock:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
