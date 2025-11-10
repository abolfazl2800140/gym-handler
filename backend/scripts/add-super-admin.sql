-- ==========================================
-- اسکریپت اضافه کردن Super Admin پیش‌فرض
-- ==========================================

-- حذف کاربر super_admin قبلی (اگر وجود داشته باشد)
DELETE FROM users WHERE username = 'superadmin';

-- اضافه کردن Super Admin جدید
-- نام کاربری: superadmin
-- رمز عبور: Admin@123 (هش شده با bcrypt)
-- نقش: super_admin
INSERT INTO users (username, email, password, role)
VALUES (
    'superadmin',
    'superadmin@gym.local',
    '$2a$10$YourHashedPasswordHere',  -- این رو باید با اسکریپت Node.js جایگزین کنیم
    'super_admin'
);

-- نمایش کاربران موجود
SELECT id, username, email, role, created_at FROM users;

-- توضیحات:
-- برای ساخت super_admin واقعی، از اسکریپت Node.js استفاده کنید:
-- node scripts/createSuperAdmin.js
