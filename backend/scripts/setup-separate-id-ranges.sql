-- ==========================================
-- تنظیم محدوده‌های جداگانه برای Users و Members
-- Users: 1000-1999 (1000 نفر)
-- Members: 2000-9999 (8000 نفر)
-- ==========================================

-- تنظیم sequence برای Users
ALTER SEQUENCE users_id_seq RESTART WITH 1000;
ALTER SEQUENCE users_id_seq MINVALUE 1000;
ALTER SEQUENCE users_id_seq MAXVALUE 1999;
ALTER SEQUENCE users_id_seq NO CYCLE;

-- تنظیم sequence برای Members  
ALTER SEQUENCE members_id_seq RESTART WITH 2000;
ALTER SEQUENCE members_id_seq MINVALUE 2000;
ALTER SEQUENCE members_id_seq MAXVALUE 9999;
ALTER SEQUENCE members_id_seq NO CYCLE;

-- نمایش تنظیمات
SELECT 
    'users_id_seq' as sequence_name,
    '1000-1999' as range,
    '1000 نفر' as capacity
UNION ALL
SELECT 
    'members_id_seq',
    '2000-9999',
    '8000 نفر';

-- بررسی وضعیت sequences
SELECT 
    sequencename,
    min_value,
    max_value,
    last_value
FROM pg_sequences
WHERE sequencename IN ('users_id_seq', 'members_id_seq');

-- ✅ تمام! 
-- Users: 1000-1999
-- Members: 2000-9999
