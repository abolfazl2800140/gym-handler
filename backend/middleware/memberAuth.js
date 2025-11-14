const jwt = require('jsonwebtoken');

/**
 * Middleware برای احراز هویت اعضا (ورزشکاران و مربیان)
 */
const authenticateMember = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'دسترسی غیرمجاز - توکن یافت نشد'
            });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
            if (err) {
                return res.status(403).json({
                    success: false,
                    error: 'توکن نامعتبر یا منقضی شده است'
                });
            }

            // بررسی اینکه کاربر از نوع member است
            if (user.role !== 'member') {
                return res.status(403).json({
                    success: false,
                    error: 'دسترسی غیرمجاز - فقط برای اعضا'
                });
            }

            req.user = user;
            next();
        });
    } catch (error) {
        console.error('Error in authenticateMember:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور در احراز هویت'
        });
    }
};

/**
 * Middleware برای بررسی اینکه عضو از نوع مربی است
 */
const requireCoach = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'دسترسی غیرمجاز - لطفاً وارد شوید'
            });
        }

        if (req.user.memberType !== 'مربی') {
            return res.status(403).json({
                success: false,
                error: 'دسترسی غیرمجاز - فقط برای مربیان'
            });
        }

        next();
    } catch (error) {
        console.error('Error in requireCoach:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور در بررسی دسترسی'
        });
    }
};

/**
 * Middleware برای بررسی اینکه عضو از نوع ورزشکار است
 */
const requireAthlete = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                error: 'دسترسی غیرمجاز - لطفاً وارد شوید'
            });
        }

        if (req.user.memberType !== 'ورزشکار') {
            return res.status(403).json({
                success: false,
                error: 'دسترسی غیرمجاز - فقط برای ورزشکاران'
            });
        }

        next();
    } catch (error) {
        console.error('Error in requireAthlete:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور در بررسی دسترسی'
        });
    }
};

module.exports = {
    authenticateMember,
    requireCoach,
    requireAthlete
};
