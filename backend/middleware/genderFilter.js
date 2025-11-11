/**
 * Middleware برای فیلتر کردن اعضا بر اساس جنسیت
 * 
 * - Super Admin: دسترسی به همه اعضا (بدون فیلتر)
 * - Admin/User: فقط اعضای هم‌جنس
 */

const genderFilter = (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'احراز هویت نشده'
    });
  }

  // Super Admin: بدون فیلتر
  if (user.role === 'super_admin') {
    req.genderFilter = null;
    console.log('Gender Filter: Super Admin - No filter applied');
    return next();
  }

  // Admin/User: فقط هم‌جنس
  req.genderFilter = user.gender || 'مرد';
  console.log(`Gender Filter: ${user.role} - Filter: ${req.genderFilter}`);
  next();
};

module.exports = genderFilter;
