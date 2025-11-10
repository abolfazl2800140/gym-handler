-- ==========================================
-- اسکریپت ساخت جداول دیتابیس
-- این رو بعد از ساخت دیتابیس اجرا کن
-- ==========================================

-- حذف جداول قدیمی (اگه وجود داشته باشن)
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ساخت جدول کاربران
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ساخت جدول اعضا
CREATE TABLE members (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    birth_date DATE,
    member_type VARCHAR(20) NOT NULL,
    membership_level VARCHAR(20) NOT NULL,
    join_date DATE NOT NULL,
    subscription_status VARCHAR(20) DEFAULT 'فعال',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ساخت جدول تراکنش‌ها
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL,
    amount BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    date TIMESTAMP NOT NULL,
    member_id INTEGER REFERENCES members(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ساخت جدول حضور و غیاب
CREATE TABLE attendance (
    id SERIAL PRIMARY KEY,
    date DATE UNIQUE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ساخت جدول رکوردهای حضور
CREATE TABLE attendance_records (
    id SERIAL PRIMARY KEY,
    attendance_id INTEGER REFERENCES attendance(id) ON DELETE CASCADE,
    member_id INTEGER REFERENCES members(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(attendance_id, member_id)
);

-- ساخت جدول لاگ فعالیت‌ها
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    username VARCHAR(50),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id INTEGER,
    description TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ساخت Indexes برای سرعت بیشتر
CREATE INDEX idx_members_phone ON members(phone);
CREATE INDEX idx_transactions_date ON transactions(date);
CREATE INDEX idx_transactions_member ON transactions(member_id);
CREATE INDEX idx_attendance_date ON attendance(date);
CREATE INDEX idx_attendance_records_member ON attendance_records(member_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_action ON activity_logs(action);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at);

-- اضافه کردن داده‌های نمونه
INSERT INTO members (first_name, last_name, phone, birth_date, member_type, membership_level, join_date, subscription_status)
VALUES 
    ('علی', 'احمدی', '09121234567', '1995-05-15', 'ورزشکار', 'طلایی', '2024-01-10', 'فعال'),
    ('سارا', 'محمدی', '09129876543', '1998-08-20', 'مربی', 'پلاتینیوم', '2023-11-05', 'فعال'),
    ('محمد', 'رضایی', '09135551234', '2000-03-12', 'ورزشکار', 'نقره‌ای', '2024-02-20', 'غیرفعال'),
    ('فاطمه', 'کریمی', '09141112233', '1997-07-25', 'ورزشکار', 'برنزی', '2024-03-15', 'فعال'),
    ('حسین', 'نوری', '09151234567', '1992-11-30', 'مربی', 'طلایی', '2023-09-01', 'فعال');

-- اضافه کردن تراکنش‌های نمونه
INSERT INTO transactions (type, amount, title, description, category, date, member_id)
VALUES 
    ('درآمد', 2000000, 'شهریه علی احمدی', 'پرداخت شهریه ماه آذر', 'شهریه', '2024-11-01', 1),
    ('هزینه', 5000000, 'خرید دستگاه پرس سینه', 'تجهیزات جدید سالن', 'تجهیزات', '2024-11-05', NULL),
    ('درآمد', 1500000, 'شهریه سارا محمدی', 'پرداخت شهریه ماه آذر', 'شهریه', '2024-11-10', 2),
    ('هزینه', 3000000, 'حقوق مربی', 'حقوق ماه آذر', 'حقوق', '2024-11-15', NULL),
    ('درآمد', 1800000, 'شهریه فاطمه کریمی', 'پرداخت شهریه ماه آذر', 'شهریه', '2024-11-12', 4);

-- اضافه کردن حضور و غیاب نمونه
INSERT INTO attendance (date, notes)
VALUES 
    ('2024-11-06', 'تمرین سنگین امروز'),
    ('2024-11-05', 'تمرین عادی');

-- اضافه کردن رکوردهای حضور
INSERT INTO attendance_records (attendance_id, member_id, status, reason)
VALUES 
    (1, 1, 'حاضر', ''),
    (1, 2, 'غایب', 'بیماری'),
    (1, 3, 'حاضر', ''),
    (1, 4, 'مرخصی', 'مرخصی استعلاجی'),
    (1, 5, 'حاضر', ''),
    (2, 1, 'حاضر', ''),
    (2, 2, 'حاضر', ''),
    (2, 3, 'غایب', 'مسافرت'),
    (2, 4, 'حاضر', ''),
    (2, 5, 'حاضر', '');

-- پایان اسکریپت
-- اگه همه چیز موفق بود، باید پیام "Query returned successfully" رو ببینی
