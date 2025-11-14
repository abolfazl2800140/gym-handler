-- ==========================================
-- ساخت سه کاربر: 1 سوپرادمین + 2 ادمین
-- رمز عبور همه: Admin@123
-- ==========================================

-- نمایش کاربران فعلی
SELECT 
    id,
    username,
    email,
    role,
    is_active
FROM users
ORDER BY role DESC, id;

-- حذف کاربران قبلی (اگر وجود داشته باشند)
DELETE FROM users WHERE username IN ('superadmin', 'admin1', 'admin2');

-- ساخت سوپرادمین
-- رمز عبور: Admin@123 (هش شده با bcrypt)
INSERT INTO users (username, email, password, first_name, last_name, phone, role, gender, is_active)
VALUES (
    'superadmin',
    'superadmin@gym.com',
    '$2a$10$YourHashedPasswordHere',
    'مدیر',
    'ارشد',
    '09121111111',
    'super_admin',
    'مرد',
    true
);

-- ساخت ادمین اول
INSERT INTO users (username, email, password, first_name, last_name, phone, role, gender, is_active)
VALUES (
    'admin1',
    'admin1@gym.com',
    '$2a$10$YourHashedPasswordHere',
    'علی',
    'احمدی',
    '09122222222',
    'admin',
    'مرد',
    true
);

-- ساخت ادمین دوم
INSERT INTO users (username, email, password, first_name, last_name, phone, role, gender, is_active)
VALUES (
    'admin2',
    'admin2@gym.com',
    '$2a$10$YourHashedPasswordHere',
    'سارا',
    'محمدی',
    '09123333333',
    'admin',
    'زن',
    true
);

-- نمایش کاربران جدید
SELECT 
    id,
    username,
    email,
    first_name,
    last_name,
    role,
    gender,
    is_active
FROM users
ORDER BY role DESC, id;

-- نمایش آمار
SELECT 
    role,
    COUNT(*) as count
FROM users
GROUP BY role
ORDER BY role DESC;

-- ==========================================
-- توجه: این اسکریپت SQL نمی‌تونه رمز عبور رو هش کنه
-- برای ساخت کاربران با رمز عبور صحیح، از اسکریپت Node.js استفاده کن:
-- node scripts/createThreeAdmins.js
-- ==========================================
