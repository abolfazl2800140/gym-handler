const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { logActivity } = require('../middleware/activityLogger');

// Register new user
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'اطلاعات ورودی نامعتبر است'
      });
    }

    // Check if username or email already exists
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

    // Hash password with 10 salt rounds
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert new user (role defaults to 'admin' if not provided)
    const result = await db.query(
      `INSERT INTO users (username, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, role, created_at`,
      [username, email, hashedPassword, role || 'admin']
    );

    const user = result.rows[0];

    // Generate JWT token (expires in 7 days)
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        gender: user.gender || 'مرد'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'کاربر با موفقیت ثبت شد',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        gender: user.gender || 'مرد'
      }
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({
      success: false,
      error: 'خطای سرور - لطفاً دوباره تلاش کنید'
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: 'اطلاعات ورودی نامعتبر است'
      });
    }

    // Find user by username
    const result = await db.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'نام کاربری یا رمز عبور اشتباه است'
      });
    }

    const user = result.rows[0];

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      // ثبت لاگ برای تلاش ناموفق ورود
      await logActivity({
        userId: user.id,
        username: user.username,
        action: 'ورود ناموفق',
        entityType: 'احراز هویت',
        entityId: user.id,
        description: `تلاش ناموفق برای ورود با رمز عبور اشتباه`,
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent')
      });
      
      return res.status(401).json({
        success: false,
        error: 'نام کاربری یا رمز عبور اشتباه است'
      });
    }

    // Generate JWT token (expires in 7 days)
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
        gender: user.gender || 'مرد'
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // ثبت لاگ برای ورود موفق
    await logActivity({
      userId: user.id,
      username: user.username,
      action: 'ورود',
      entityType: 'احراز هویت',
      entityId: user.id,
      description: `وارد سیستم شد`,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({
      success: true,
      message: 'ورود موفقیت‌آمیز',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        gender: user.gender || 'مرد'
      }
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({
      success: false,
      error: 'خطای سرور - لطفاً دوباره تلاش کنید'
    });
  }
};

// Get current user information
exports.getCurrentUser = async (req, res) => {
  try {
    // req.user is set by authenticateToken middleware
    const userId = req.user.id;

    // Fetch user from database
    const result = await db.query(
      'SELECT id, username, email, role, gender, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'کاربر یافت نشد'
      });
    }

    res.status(200).json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    res.status(500).json({
      success: false,
      error: 'خطای سرور - لطفاً دوباره تلاش کنید'
    });
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    const user = req.user;

    // ثبت لاگ برای خروج
    await logActivity({
      userId: user.id,
      username: user.username,
      action: 'خروج',
      entityType: 'احراز هویت',
      entityId: user.id,
      description: `از سیستم خارج شد`,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    });

    res.status(200).json({
      success: true,
      message: 'خروج موفقیت‌آمیز'
    });
  } catch (error) {
    console.error('Error in logout:', error);
    res.status(500).json({
      success: false,
      error: 'خطای سرور - لطفاً دوباره تلاش کنید'
    });
  }
};
