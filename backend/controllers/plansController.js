const db = require('../config/database');

// دریافت همه پلن‌ها (فقط سوپرادمین)
const getAllPlans = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM membership_plans ORDER BY duration_days'
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در دریافت پلن‌ها'
        });
    }
};

// دریافت پلن‌های فعال (برای استفاده در فرم عضو)
const getActivePlans = async (req, res) => {
    try {
        const result = await db.query(
            'SELECT * FROM membership_plans WHERE is_active = true ORDER BY duration_days'
        );

        res.json({
            success: true,
            data: result.rows
        });
    } catch (error) {
        console.error('Error fetching active plans:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در دریافت پلن‌های فعال'
        });
    }
};

// دریافت یک پلن
const getPlanById = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            'SELECT * FROM membership_plans WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'پلن یافت نشد'
            });
        }

        res.json({
            success: true,
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error fetching plan:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در دریافت پلن'
        });
    }
};

// ایجاد پلن جدید
const createPlan = async (req, res) => {
    try {
        const { name, duration_days, price, description, color } = req.body;

        // بررسی تکراری نبودن نام
        const existingPlan = await db.query(
            'SELECT id FROM membership_plans WHERE name = $1',
            [name]
        );

        if (existingPlan.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'پلنی با این نام قبلاً وجود دارد'
            });
        }

        const result = await db.query(
            `INSERT INTO membership_plans (name, duration_days, price, description, color, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING *`,
            [name, duration_days, price, description, color || '#3182ce']
        );

        res.status(201).json({
            success: true,
            message: 'پلن با موفقیت ایجاد شد',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error creating plan:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در ایجاد پلن'
        });
    }
};

// ویرایش پلن
const updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, duration_days, price, description, color } = req.body;

        // بررسی وجود پلن
        const existingPlan = await db.query(
            'SELECT * FROM membership_plans WHERE id = $1',
            [id]
        );

        if (existingPlan.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'پلن یافت نشد'
            });
        }

        // بررسی تکراری نبودن نام (اگر تغییر کرده)
        if (name !== existingPlan.rows[0].name) {
            const duplicateName = await db.query(
                'SELECT id FROM membership_plans WHERE name = $1 AND id != $2',
                [name, id]
            );

            if (duplicateName.rows.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'پلنی با این نام قبلاً وجود دارد'
                });
            }
        }

        const result = await db.query(
            `UPDATE membership_plans 
       SET name = $1, duration_days = $2, price = $3, description = $4, color = $5
       WHERE id = $6
       RETURNING *`,
            [name, duration_days, price, description, color, id]
        );

        res.json({
            success: true,
            message: 'پلن با موفقیت ویرایش شد',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error updating plan:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در ویرایش پلن'
        });
    }
};

// فعال/غیرفعال کردن پلن
const togglePlanStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await db.query(
            `UPDATE membership_plans 
       SET is_active = NOT is_active
       WHERE id = $1
       RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'پلن یافت نشد'
            });
        }

        res.json({
            success: true,
            message: result.rows[0].is_active ? 'پلن فعال شد' : 'پلن غیرفعال شد',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Error toggling plan status:', error);
        res.status(500).json({
            success: false,
            message: 'خطا در تغییر وضعیت پلن'
        });
    }
};

module.exports = {
    getAllPlans,
    getActivePlans,
    getPlanById,
    createPlan,
    updatePlan,
    togglePlanStatus
};
