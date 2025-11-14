const db = require('../config/database');

// GET wallet balance
exports.getWalletBalance = async (req, res) => {
    try {
        const { member_id } = req.params;

        const result = await db.query(
            'SELECT id, first_name, last_name, wallet_balance FROM members WHERE id = $1',
            [member_id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ success: false, error: 'عضو یافت نشد' });
        }

        res.json({ success: true, data: result.rows[0] });
    } catch (error) {
        console.error('Error fetching wallet balance:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

// POST charge wallet
exports.chargeWallet = async (req, res) => {
    const client = await db.pool.connect();

    try {
        const { member_id } = req.params;
        const { amount, description } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                error: 'مبلغ باید بیشتر از صفر باشد'
            });
        }

        await client.query('BEGIN');

        // افزایش موجودی کیف پول
        const memberResult = await client.query(
            `UPDATE members 
       SET wallet_balance = wallet_balance + $1
       WHERE id = $2
       RETURNING *`,
            [amount, member_id]
        );

        if (memberResult.rows.length === 0) {
            throw new Error('عضو یافت نشد');
        }

        // ثبت تراکنش
        await client.query(
            `INSERT INTO transactions (type, amount, title, description, category, date, member_id)
       VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6)`,
            [
                'درآمد',
                amount,
                `شارژ کیف پول ${memberResult.rows[0].first_name} ${memberResult.rows[0].last_name}`,
                description || 'شارژ کیف پول',
                'شارژ کیف پول',
                member_id
            ]
        );

        await client.query('COMMIT');

        res.json({
            success: true,
            message: 'کیف پول با موفقیت شارژ شد',
            data: memberResult.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error charging wallet:', error);
        res.status(500).json({ success: false, error: error.message });
    } finally {
        client.release();
    }
};

// GET wallet transactions
exports.getWalletTransactions = async (req, res) => {
    try {
        const { member_id } = req.params;

        // تراکنش‌های شارژ
        const chargeTransactions = await db.query(
            `SELECT id, amount, title, description, date, 'charge' as type
       FROM transactions
       WHERE member_id = $1 AND category = 'شارژ کیف پول'
       ORDER BY date DESC`,
            [member_id]
        );

        // خریدهای بوفه
        const buffetPurchases = await db.query(
            `SELECT id, total_amount as amount, 'خرید از بوفه' as title, notes as description, created_at as date, 'purchase' as type
       FROM buffet_sales
       WHERE member_id = $1
       ORDER BY created_at DESC`,
            [member_id]
        );

        // ترکیب و مرتب‌سازی
        const allTransactions = [
            ...chargeTransactions.rows,
            ...buffetPurchases.rows
        ].sort((a, b) => new Date(b.date) - new Date(a.date));

        res.json({
            success: true,
            count: allTransactions.length,
            data: allTransactions
        });
    } catch (error) {
        console.error('Error fetching wallet transactions:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
