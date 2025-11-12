-- ==========================================
-- تنظیم شناسه 4 رقمی برای دیتابیس جدید
-- این اسکریپت رو قبل از اضافه کردن هر داده‌ای اجرا کن
-- ==========================================

-- تنظیم sequence برای Users
ALTER SEQUENCE users_id_seq RESTART WITH 1000;
ALTER SEQUENCE users_id_seq MAXVALUE 9999;
ALTER SEQUENCE users_id_seq NO CYCLE;

-- تنظیم sequence برای Members  
ALTER SEQUENCE members_id_seq RESTART WITH 1000;
ALTER SEQUENCE members_id_seq MAXVALUE 9999;
ALTER SEQUENCE members_id_seq NO CYCLE;

-- نمایش تنظیمات
SELECT 
    'users_id_seq' as sequence_name,
    last_value,
    max_value
FROM users_id_seq
UNION ALL
SELECT 
    'members_id_seq',
    last_value,
    max_value
FROM members_id_seq;

-- ✅ تمام! حالا IDs از 1000 شروع میشن
