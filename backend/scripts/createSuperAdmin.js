require('dotenv').config();
const bcrypt = require('bcryptjs');
const db = require('../config/database');

/**
 * اسکریپت ساخت Super Admin پیش‌فرض
 * این اسکریپت یک کاربر super_admin با اطلاعات پیش‌فرض می‌سازد
 */

const createSuperAdmin = async () => {
  try {
    console.log('🔧 شروع ساخت Super Admin...\n');

    // اطلاعات Super Admin پیش‌فرض
    const superAdminData = {
      username: 'superadmin',
      email: 'superadmin@gym.local',
      password: 'Admin@123', // رمز عبور پیش‌فرض - حتماً بعد از اولین ورود تغییر بده!
      role: 'super_admin'
    };

    // بررسی اینکه آیا super_admin قبلاً وجود دارد
    const existingUser = await db.query(
      'SELECT * FROM users WHERE username = $1 OR email = $2',
      [superAdminData.username, superAdminData.email]
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️  کاربر Super Admin قبلاً وجود دارد!');
      console.log('📋 اطلاعات کاربر موجود:');
      console.log(`   - نام کاربری: ${existingUser.rows[0].username}`);
      console.log(`   - ایمیل: ${existingUser.rows[0].email}`);
      console.log(`   - نقش: ${existingUser.rows[0].role}`);
      console.log('\n💡 اگر می‌خواهید Super Admin جدید بسازید، ابتدا کاربر قبلی را حذف کنید.');
      process.exit(0);
    }

    // هش کردن رمز عبور
    console.log('🔐 هش کردن رمز عبور...');
    const hashedPassword = await bcrypt.hash(superAdminData.password, 10);

    // ساخت Super Admin
    console.log('👤 ساخت کاربر Super Admin...');
    const result = await db.query(
      `INSERT INTO users (username, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, username, email, role, created_at`,
      [
        superAdminData.username,
        superAdminData.email,
        hashedPassword,
        superAdminData.role
      ]
    );

    const user = result.rows[0];

    console.log('\n✅ Super Admin با موفقیت ساخته شد!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 اطلاعات ورود:');
    console.log(`   نام کاربری: ${superAdminData.username}`);
    console.log(`   رمز عبور: ${superAdminData.password}`);
    console.log(`   نقش: ${user.role}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  توجه: حتماً بعد از اولین ورود، رمز عبور را تغییر دهید!');
    console.log('💡 برای تغییر رمز عبور می‌توانید از API یا مستقیماً در دیتابیس اقدام کنید.\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ خطا در ساخت Super Admin:', error.message);
    process.exit(1);
  }
};

// اجرای اسکریپت
createSuperAdmin();
