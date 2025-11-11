-- ==========================================
-- اسکریپت کامل ساخت دیتابیس باشگاه
-- نسخه: 2.0 (با پشتیبانی از جنسیت)
-- ==========================================

-- مرحله 1: حذف دیتابیس قدیمی (اگر وجود داشته باشه)
-- این خط رو فقط اگر می‌خوای از اول شروع کنی، uncomment کن
-- DROP DATABASE IF EXISTS gym_management;

-- مرحله 2: ساخت دیتابیس
-- این خط رو فقط یکبار اجرا کن
-- CREATE DATABASE gym_management;

-- بعد از ساخت دیتابیس، به gym_management وصل شو
-- (از منوی pgAdmin انتخاب کن: gym_management)

-- ==========================================
-- مرحله 3: حذف جداول قدیمی (اگر وجود داشته باشن)
-- ==========================================

DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ==========================================
-- مرحله 4: ساخت جدول کاربران (Users)
-- ==========================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'admin' CHECK (role IN ('super_admin', 'admin', 'user')),
    gender VARCHAR(10) DEFAULT 'مرد' CHECK (gender IN ('مرد', 'زن')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ایندکس برای جستجوی سریع‌تر
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_gender ON users(gender);

-- ==========================================
-- مرحله 5: ساخت جدول اعضا (Members)
-- ==========================================

CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    birth_date DATE,
    gender VARCHAR(10) DEFAULT 'مرد' CHECK (gender IN ('مرد', 'زن')),
    member_type VARCHAR(20) DEFAULT 'ورزشکار' CHECK (member_type IN ('ورزشکار', 'مربی', 'پرسنل')),
    membership_level VARCHAR(20) DEFAULT 'برنزی' CHECK (membership_level IN ('برنزی', 'نقره‌ای', 'طلایی', 'پلاتینیوم')),
    join_date DATE DEFAULT CURRENT_DATE,
    subscription_status VARCHAR(20) DEFAULT 'فعال' CHECK (subscription_status IN ('فعال', 'غیرفعال')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ایندکس برای جستجوی سریع‌تر
CREATE INDEX idx_members_phone ON members(phone);
CREATE INDEX idx_members_name ON members(first_name, last_name);
CREATE INDEX idx_members_type ON members(member_type);
CREATE INDEX idx_members_status ON members(subscription_status);
CREATE INDEX idx_members_gender ON members(gender);

-- ==========================================
-- مرحله 6: ساخت جدول تراکنش‌های مالی (Transactions)
-- ==========================================

CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('درآمد', 'هزینه')),
    amount DECIMAL(10, 2) NOT NULL,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) DEFAULT 'سایر' CHECK (category IN ('شهریه', 'تجهیزات', 'حقوق', 'سایر')),
    date DATE NOT NULL,
    member_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ایندکس برای جستجوی سریع‌تر
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_member ON transactions(member_id);
CREATE INDEX idx_transactions_category ON transactions(category);

-- ==========================================
-- مرحله 7: ساخت جدول حضور و غیاب (Attendance)
-- ==========================================

CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ایندکس برای جستجوی سریع‌تر
CREATE INDEX idx_attendance_date ON attendance(date);

-- ==========================================
-- مرحله 8: ساخت جدول رکوردهای حضور و غیاب (Attendance Records)
-- ==========================================

CREATE TABLE attendance_records (
    id SERIAL PRIMARY KEY,
    attendance_id INTEGER NOT NULL REFERENCES attendance(id) ON DELETE CASCADE,
    member_id INTEGER NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('حاضر', 'غایب', 'مرخصی')),
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(attendance_id, member_id)
);

-- ایندکس برای جستجوی سریع‌تر
CREATE INDEX idx_attendance_records_attendance ON attendance_records(attendance_id);
CREATE INDEX idx_attendance_records_member ON attendance_records(member_id);
CREATE INDEX idx_attendance_records_status ON attendance_records(status);

-- ==========================================
-- مرحله 9: ساخت جدول لاگ فعالیت‌ها (Activity Logs)
-- ==========================================

CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ایندکس برای جستجوی سریع‌تر
CREATE INDEX idx_activity_logs_username ON activity_logs(username);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_logs_date ON activity_logs(created_at);

-- ==========================================
-- مرحله 10: ساخت Trigger برای updated_at
-- ==========================================

-- تابع برای به‌روزرسانی خودکار updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- اضافه کردن trigger به جداول
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_attendance_updated_at BEFORE UPDATE ON attendance
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- مرحله 11: داده‌های اولیه (Super Admin)
-- ==========================================

-- ساخت Super Admin پیش‌فرض
-- رمز عبور: Admin@123
-- توجه: این رمز هش شده است با bcrypt
INSERT INTO users (username, email, password, first_name, last_name, role, gender, is_active)
VALUES (
    'superadmin',
    'superadmin@gym.com',
    '$2a$10$YourHashedPasswordHere', -- باید با bcrypt هش بشه
    'مدیر',
    'ارشد',
    'super_admin',
    'مرد',
    true
);

-- نکته: برای ساخت Super Admin واقعی، از اسکریپت add-super-admin.sql استفاده کن
-- یا از طریق API ثبت‌نام کن

-- ==========================================
-- مرحله 12: داده‌های نمونه (اختیاری)
-- ==========================================

-- اعضای نمونه
INSERT INTO members (first_name, last_name, phone, birth_date, gender, member_type, membership_level, subscription_status) VALUES
('علی', 'احمدی', '09121234567', '1995-05-15', 'مرد', 'ورزشکار', 'طلایی', 'فعال'),
('سارا', 'محمدی', '09121234568', '1998-08-20', 'زن', 'ورزشکار', 'نقره‌ای', 'فعال'),
('محمد', 'رضایی', '09121234569', '1992-03-10', 'مرد', 'مربی', 'پلاتینیوم', 'فعال'),
('مریم', 'کریمی', '09121234570', '1996-11-25', 'زن', 'ورزشکار', 'برنزی', 'فعال'),
('حسین', 'نوری', '09121234571', '1994-07-18', 'مرد', 'ورزشکار', 'طلایی', 'غیرفعال');

-- تراکنش‌های نمونه
INSERT INTO transactions (type, amount, title, description, category, date, member_id) VALUES
('درآمد', 500000, 'شهریه ماهانه', 'شهریه ماه جاری', 'شهریه', CURRENT_DATE, 1),
('درآمد', 300000, 'شهریه ماهانه', 'شهریه ماه جاری', 'شهریه', CURRENT_DATE, 2),
('هزینه', 2000000, 'خرید دستگاه بدنسازی', 'دستگاه پرس سینه', 'تجهیزات', CURRENT_DATE - INTERVAL '5 days', NULL),
('درآمد', 800000, 'شهریه ماهانه', 'شهریه ماه جاری', 'شهریه', CURRENT_DATE, 3);

-- ==========================================
-- مرحله 13: نمایش اطلاعات
-- ==========================================

-- نمایش تعداد رکوردها
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Members', COUNT(*) FROM members
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'Attendance', COUNT(*) FROM attendance
UNION ALL
SELECT 'Activity Logs', COUNT(*) FROM activity_logs;

-- نمایش ساختار جداول
SELECT 
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- ==========================================
-- تمام شد! ✅
-- ==========================================

-- حالا می‌تونی:
-- 1. از طریق API یه Super Admin بسازی
-- 2. یا از اسکریپت add-super-admin.sql استفاده کنی
-- 3. برنامه رو اجرا کنی و لاگین کنی

-- موفق باشی! 🚀
