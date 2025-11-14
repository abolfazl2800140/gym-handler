const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

/**
 * ورود ورزشکاران و مربیان
 */
exports.memberLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Validation
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                error: 'اطلاعات ورودی نامعتبر است'
            });
        }

        // Find member by username
        const result = await db.query(
            'SELECT * FROM members WHERE username = $1',
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'نام کاربری یا رمز عبور اشتباه است'
            });
        }

        const member = result.rows[0];

        // بررسی اینکه آیا رمز عبور تنظیم شده
        if (!member.password) {
            return res.status(401).json({
                success: false,
                error: 'حساب کاربری شما هنوز فعال نشده است. لطفاً با مدیر تماس بگیرید'
            });
        }

        // Compare password with hashed password
        const isPasswordValid = await bcrypt.compare(password, member.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'نام کاربری یا رمز عبور اشتباه است'
            });
        }

        // Generate JWT token (expires in 7 days)
        const token = jwt.sign(
            {
                id: member.id,
                username: member.username,
                role: 'member', // نقش عمومی برای اعضا
                memberType: member.member_type, // ورزشکار یا مربی
                firstName: member.first_name,
                lastName: member.last_name
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            success: true,
            message: 'ورود موفقیت‌آمیز',
            token,
            user: {
                id: member.id,
                username: member.username,
                role: 'member',
                memberType: member.member_type,
                firstName: member.first_name,
                lastName: member.last_name,
                phone: member.phone,
                subscriptionStatus: member.subscription_status
            }
        });
    } catch (error) {
        console.error('Error in memberLogin:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور - لطفاً دوباره تلاش کنید'
        });
    }
};

/**
 * دریافت اطلاعات عضو جاری
 */
exports.getCurrentMember = async (req, res) => {
    try {
        const memberId = req.user.id;

        const result = await db.query(
            `SELECT id, first_name, last_name, phone, birth_date, member_type, 
              membership_level, join_date, subscription_status, username
       FROM members WHERE id = $1`,
            [memberId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'عضو یافت نشد'
            });
        }

        res.status(200).json({
            success: true,
            member: result.rows[0]
        });
    } catch (error) {
        console.error('Error in getCurrentMember:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور - لطفاً دوباره تلاش کنید'
        });
    }
};

/**
 * تغییر رمز عبور عضو
 */
exports.changePassword = async (req, res) => {
    try {
        const memberId = req.user.id;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                error: 'لطفاً رمز عبور فعلی و جدید را وارد کنید'
            });
        }

        // دریافت رمز عبور فعلی
        const result = await db.query(
            'SELECT password FROM members WHERE id = $1',
            [memberId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'عضو یافت نشد'
            });
        }

        const member = result.rows[0];

        // بررسی رمز عبور فعلی
        const isPasswordValid = await bcrypt.compare(currentPassword, member.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'رمز عبور فعلی اشتباه است'
            });
        }

        // هش کردن رمز عبور جدید
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // به‌روزرسانی رمز عبور
        await db.query(
            'UPDATE members SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [hashedPassword, memberId]
        );

        res.status(200).json({
            success: true,
            message: 'رمز عبور با موفقیت تغییر کرد'
        });
    } catch (error) {
        console.error('Error in changePassword:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور - لطفاً دوباره تلاش کنید'
        });
    }
};

/**
 * خروج عضو
 */
exports.memberLogout = async (req, res) => {
    try {
        res.status(200).json({
            success: true,
            message: 'خروج موفقیت‌آمیز'
        });
    } catch (error) {
        console.error('Error in memberLogout:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور - لطفاً دوباره تلاش کنید'
        });
    }
};
