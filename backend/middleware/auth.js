const jwt = require('jsonwebtoken');

/**
 * Middleware برای احراز هویت کاربر با JWT
 * این middleware توکن رو از header میگیره و اعتبارسنجی می‌کنه
 */
const authenticateToken = (req, res, next) => {
  try {
    // گرفتن توکن از header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'دسترسی غیرمجاز - توکن یافت نشد'
      });
    }

    // اعتبارسنجی توکن
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({
          success: false,
          error: 'توکن نامعتبر یا منقضی شده است'
        });
      }

      // اضافه کردن اطلاعات کاربر به request
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('Error in authenticateToken:', error);
    res.status(500).json({
      success: false,
      error: 'خطای سرور در احراز هویت'
    });
  }
};

/**
 * Middleware برای بررسی نقش کاربر
 * @param {Array} allowedRoles - آرایه‌ای از نقش‌های مجاز
 * @returns {Function} middleware function
 * 
 * مثال استفاده:
 * router.get('/admin-only', authenticateToken, checkRole(['super_admin']), controller)
 */
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      // بررسی اینکه آیا کاربر احراز هویت شده
      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: 'دسترسی غیرمجاز - لطفاً وارد شوید'
        });
      }

      // بررسی نقش کاربر
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          error: 'شما دسترسی لازم برای این عملیات را ندارید'
        });
      }

      next();
    } catch (error) {
      console.error('Error in checkRole:', error);
      res.status(500).json({
        success: false,
        error: 'خطای سرور در بررسی دسترسی'
      });
    }
  };
};

/**
 * Middleware برای بررسی اینکه کاربر super_admin است
 * این یک shortcut برای checkRole(['super_admin']) است
 */
const requireSuperAdmin = checkRole(['super_admin']);

/**
 * Middleware برای بررسی اینکه کاربر admin یا super_admin است
 */
const requireAdmin = checkRole(['admin', 'super_admin']);

module.exports = {
  authenticateToken,
  checkRole,
  requireSuperAdmin,
  requireAdmin
};
