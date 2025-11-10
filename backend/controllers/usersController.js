const db = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * GET /api/users - دریافت لیست کاربران
 * Super Admin: همه کاربران
 * Admin: فقط خودش
 */
exports.getAllUsers = async (req, res) => {
  try {
    const currentUser = req.user;
    let query;
    let params = [];

    if (currentUser.role === 'super_admin') {
      // Super Admin می‌تونه همه رو ببینه (به جز خودش)
      query = `
        SELECT id, username, email, first_name, last_name, phone, 
               avatar_url, role, is_active, created_at, updated_at
        FROM users
        WHERE id != $1
        ORDER BY created_at DESC
      `;
      params = [currentUser.id];
    } else {
      // Admin هیچ کس رو نمی‌بینه (حتی خودش رو)
      query = `
        SELECT id, username, email, first_name, last_name, phone, 
               avatar_url, role, is_active, created_at, updated_at
        FROM users
        WHERE 1=0
      `;
    }

    const result = await db.query(query, params);

    res.json({
      success: true,
      data: result.rows,
      count: result.rows.length
    });
  } catch (error) {
    console.error('Error in getAllUsers:', error);
    res.status(500).json({
      success: false,
      error: 'خطا در دریافت لیست کاربران'
    });
  }
};

/**
 * GET /api/users/:id - دریافت یک کاربر
 */
exports.getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    // بررسی دسترسی: admin فقط خودش، super_admin همه
    if (currentUser.role !== 'super_admin' && currentUser.id !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        error: 'شما دسترسی لازم برای مشاهده این کاربر را ندارید'
      });
    }

    const result = await db.query(
      `SELECT id, username, email, first_name, last_name, phone, 
              avatar_url, role, is_active, created_at, updated_at
       FROM users
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'کاربر یافت نشد'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error in getUserById:', error);
    res.status(500).json({
      success: false,
      error: 'خطا در دریافت اطلاعات کاربر'
    });
  }
};

/**
 * POST /api/users - اضافه کردن کاربر جدید (فقط super_admin)
 */
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, phone, role } = req.body;

    // اعتبارسنجی
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'نام کاربری، ایمیل و رمز عبور الزامی است'
      });
    }

    // بررسی تکراری بودن
    const existingUser = await db.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [username, email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'نام کاربری یا ایمیل قبلاً ثبت شده است'
      });
    }

    // هش کردن رمز عبور
    const hashedPassword = await bcrypt.hash(password, 10);

    // اضافه کردن کاربر
    const result = await db.query(
      `INSERT INTO users (username, email, password, first_name, last_name, phone, role)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, username, email, first_name, last_name, phone, role, created_at`,
      [username, email, hashedPassword, first_name, last_name, phone, role || 'admin']
    );

    res.status(201).json({
      success: true,
      message: 'کاربر با موفقیت اضافه شد',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error in createUser:', error);
    res.status(500).json({
      success: false,
      error: 'خطا در اضافه کردن کاربر'
    });
  }
};

/**
 * PUT /api/users/:id - ویرایش کاربر
 */
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    const { username, email, first_name, last_name, phone, role, avatar_url } = req.body;

    // بررسی دسترسی
    if (currentUser.role !== 'super_admin' && currentUser.id !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        error: 'شما دسترسی لازم برای ویرایش این کاربر را ندارید'
      });
    }

    // بررسی وجود کاربر
    const userCheck = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'کاربر یافت نشد'
      });
    }

    // Admin نمی‌تونه نقش خودش رو تغییر بده
    if (currentUser.role !== 'super_admin' && role && role !== userCheck.rows[0].role) {
      return res.status(403).json({
        success: false,
        error: 'شما نمی‌توانید نقش خود را تغییر دهید'
      });
    }

    // بررسی تکراری بودن username یا email
    if (username || email) {
      const duplicateCheck = await db.query(
        'SELECT * FROM users WHERE (username = $1 OR email = $2) AND id != $3',
        [username || userCheck.rows[0].username, email || userCheck.rows[0].email, id]
      );

      if (duplicateCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          error: 'نام کاربری یا ایمیل قبلاً استفاده شده است'
        });
      }
    }

    // ویرایش کاربر
    const result = await db.query(
      `UPDATE users 
       SET username = COALESCE($1, username),
           email = COALESCE($2, email),
           first_name = COALESCE($3, first_name),
           last_name = COALESCE($4, last_name),
           phone = COALESCE($5, phone),
           role = COALESCE($6, role),
           avatar_url = COALESCE($7, avatar_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING id, username, email, first_name, last_name, phone, role, avatar_url, updated_at`,
      [username, email, first_name, last_name, phone, role, avatar_url, id]
    );

    res.json({
      success: true,
      message: 'اطلاعات کاربر با موفقیت به‌روزرسانی شد',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error in updateUser:', error);
    res.status(500).json({
      success: false,
      error: 'خطا در به‌روزرسانی اطلاعات کاربر'
    });
  }
};

/**
 * DELETE /api/users/:id - حذف کاربر (فقط super_admin)
 */
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    // جلوگیری از حذف خودش
    if (currentUser.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        error: 'شما نمی‌توانید حساب کاربری خود را حذف کنید'
      });
    }

    // بررسی وجود کاربر
    const userCheck = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'کاربر یافت نشد'
      });
    }

    // حذف کاربر
    await db.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'کاربر با موفقیت حذف شد'
    });
  } catch (error) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({
      success: false,
      error: 'خطا در حذف کاربر'
    });
  }
};

/**
 * PUT /api/users/:id/toggle-status - فعال/غیرفعال کردن حساب
 */
exports.toggleStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;

    // فقط super_admin می‌تونه وضعیت رو تغییر بده
    if (currentUser.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'فقط مدیر ارشد می‌تواند وضعیت حساب را تغییر دهد'
      });
    }

    // جلوگیری از تغییر وضعیت خودش
    if (currentUser.id === parseInt(id)) {
      return res.status(400).json({
        success: false,
        error: 'شما نمی‌توانید وضعیت حساب خود را تغییر دهید'
      });
    }

    // بررسی وجود کاربر
    const userCheck = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'کاربر یافت نشد'
      });
    }

    const user = userCheck.rows[0];
    const newStatus = !user.is_active;

    // تغییر وضعیت
    await db.query(
      'UPDATE users SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [newStatus, id]
    );

    res.json({
      success: true,
      message: newStatus ? 'حساب کاربر فعال شد' : 'حساب کاربر غیرفعال شد',
      is_active: newStatus
    });
  } catch (error) {
    console.error('Error in toggleStatus:', error);
    res.status(500).json({
      success: false,
      error: 'خطا در تغییر وضعیت حساب'
    });
  }
};

/**
 * GET /api/users/:id/stats - دریافت آمار فعالیت کاربر
 */
exports.getUserStats = async (req, res) => {
  try {
    const { id } = req.params;

    // بررسی وجود کاربر
    const userCheck = await db.query('SELECT username FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'کاربر یافت نشد'
      });
    }

    const username = userCheck.rows[0].username;

    // تعداد کل فعالیت‌ها
    const totalActivities = await db.query(
      'SELECT COUNT(*) as count FROM activity_logs WHERE username = $1',
      [username]
    );

    // فعالیت‌های 24 ساعت اخیر
    const recentActivities = await db.query(
      `SELECT COUNT(*) as count FROM activity_logs 
       WHERE username = $1 AND created_at >= NOW() - INTERVAL '24 hours'`,
      [username]
    );

    // فعالیت‌های 7 روز اخیر
    const weekActivities = await db.query(
      `SELECT COUNT(*) as count FROM activity_logs 
       WHERE username = $1 AND created_at >= NOW() - INTERVAL '7 days'`,
      [username]
    );

    // آخرین فعالیت
    const lastActivity = await db.query(
      `SELECT created_at FROM activity_logs 
       WHERE username = $1 
       ORDER BY created_at DESC 
       LIMIT 1`,
      [username]
    );

    // آمار بر اساس نوع عملیات
    const actionStats = await db.query(
      `SELECT action, COUNT(*) as count 
       FROM activity_logs 
       WHERE username = $1 
       GROUP BY action 
       ORDER BY count DESC`,
      [username]
    );

    res.json({
      success: true,
      stats: {
        totalActivities: parseInt(totalActivities.rows[0].count),
        recentActivities: parseInt(recentActivities.rows[0].count),
        weekActivities: parseInt(weekActivities.rows[0].count),
        lastActivity: lastActivity.rows[0]?.created_at || null,
        actionStats: actionStats.rows
      }
    });
  } catch (error) {
    console.error('Error in getUserStats:', error);
    res.status(500).json({
      success: false,
      error: 'خطا در دریافت آمار کاربر'
    });
  }
};

/**
 * GET /api/users/:id/activities - دریافت فعالیت‌های اخیر کاربر
 */
exports.getUserActivities = async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 20 } = req.query;

    // بررسی وجود کاربر
    const userCheck = await db.query('SELECT username FROM users WHERE id = $1', [id]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'کاربر یافت نشد'
      });
    }

    const username = userCheck.rows[0].username;

    // دریافت فعالیت‌های اخیر
    const activities = await db.query(
      `SELECT id, action, entity_type, entity_id, description, ip_address, created_at
       FROM activity_logs
       WHERE username = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [username, limit]
    );

    res.json({
      success: true,
      activities: activities.rows
    });
  } catch (error) {
    console.error('Error in getUserActivities:', error);
    res.status(500).json({
      success: false,
      error: 'خطا در دریافت فعالیت‌های کاربر'
    });
  }
};

/**
 * PUT /api/users/:id/change-password - تغییر رمز عبور
 */
exports.changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const currentUser = req.user;
    const { currentPassword, newPassword } = req.body;

    // بررسی دسترسی
    if (currentUser.role !== 'super_admin' && currentUser.id !== parseInt(id)) {
      return res.status(403).json({
        success: false,
        error: 'شما دسترسی لازم برای تغییر رمز عبور این کاربر را ندارید'
      });
    }

    // اعتبارسنجی
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'رمز عبور جدید باید حداقل 6 کاراکتر باشد'
      });
    }

    // دریافت کاربر
    const userResult = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'کاربر یافت نشد'
      });
    }

    const user = userResult.rows[0];

    // اگر کاربر خودش رمز رو تغییر میده، باید رمز فعلی رو وارد کنه
    if (currentUser.id === parseInt(id)) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          error: 'رمز عبور فعلی الزامی است'
        });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          error: 'رمز عبور فعلی اشتباه است'
        });
      }
    }

    // هش کردن رمز عبور جدید
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // به‌روزرسانی رمز عبور
    await db.query(
      'UPDATE users SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      [hashedPassword, id]
    );

    res.json({
      success: true,
      message: 'رمز عبور با موفقیت تغییر کرد'
    });
  } catch (error) {
    console.error('Error in changePassword:', error);
    res.status(500).json({
      success: false,
      error: 'خطا در تغییر رمز عبور'
    });
  }
};
