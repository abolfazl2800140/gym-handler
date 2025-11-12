-- ==========================================
-- اضافه کردن شناسه یکتای 4 رقمی برای Users و Members
-- محدوده: 1000 تا 9999
-- ==========================================

-- مرحله 1: تغییر sequence برای جدول Users
-- ==========================================

-- تنظیم sequence برای شروع از 1000
ALTER SEQUENCE users_id_seq RESTART WITH 1000;

-- تنظیم حداکثر مقدار
ALTER SEQUENCE users_id_seq MAXVALUE 9999;

-- اگر به 9999 رسید، دوباره از 1000 شروع نکنه (خطا بده)
ALTER SEQUENCE users_id_seq NO CYCLE;

-- ==========================================
-- مرحله 2: تغییر sequence برای جدول Members
-- ==========================================

-- تنظیم sequence برای شروع از 1000
ALTER SEQUENCE members_id_seq RESTART WITH 1000;

-- تنظیم حداکثر مقدار
ALTER SEQUENCE members_id_seq MAXVALUE 9999;

-- اگر به 9999 رسید، دوباره از 1000 شروع نکنه (خطا بده)
ALTER SEQUENCE members_id_seq NO CYCLE;

-- ==========================================
-- مرحله 3: آپدیت کردن رکوردهای موجود (اگر وجود دارن)
-- ==========================================

-- بررسی تعداد Users موجود
DO $
DECLARE
    user_count INTEGER;
    member_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count FROM users;
    SELECT COUNT(*) INTO member_count FROM members;
    
    RAISE NOTICE 'تعداد Users موجود: %', user_count;
    RAISE NOTICE 'تعداد Members موجود: %', member_count;
    
    -- اگر Users موجود دارن، ID هاشون رو آپدیت کن
    IF user_count > 0 THEN
        -- ایجاد جدول موقت برای نگهداری mapping
        CREATE TEMP TABLE user_id_mapping AS
        SELECT 
            id as old_id,
            ROW_NUMBER() OVER (ORDER BY id) + 999 as new_id
        FROM users;
        
        -- غیرفعال کردن foreign key constraints موقتاً
        ALTER TABLE activity_logs DROP CONSTRAINT IF EXISTS activity_logs_user_id_fkey;
        
        -- آپدیت کردن IDs
        UPDATE users u
        SET id = m.new_id
        FROM user_id_mapping m
        WHERE u.id = m.old_id;
        
        -- آپدیت کردن activity_logs اگر foreign key داشت
        -- (در صورت نیاز)
        
        -- تنظیم مجدد sequence
        SELECT setval('users_id_seq', COALESCE(MAX(id), 1000), true) FROM users;
        
        DROP TABLE user_id_mapping;
        
        RAISE NOTICE 'IDs کاربران با موفقیت آپدیت شدند';
    END IF;
    
    -- اگر Members موجود دارن، ID هاشون رو آپدیت کن
    IF member_count > 0 THEN
        -- ایجاد جدول موقت برای نگهداری mapping
        CREATE TEMP TABLE member_id_mapping AS
        SELECT 
            id as old_id,
            ROW_NUMBER() OVER (ORDER BY id) + 999 as new_id
        FROM members;
        
        -- غیرفعال کردن foreign key constraints موقتاً
        ALTER TABLE transactions DROP CONSTRAINT IF EXISTS transactions_member_id_fkey;
        ALTER TABLE attendance_records DROP CONSTRAINT IF EXISTS attendance_records_member_id_fkey;
        
        -- آپدیت کردن IDs در جدول members
        UPDATE members m
        SET id = map.new_id
        FROM member_id_mapping map
        WHERE m.id = map.old_id;
        
        -- آپدیت کردن foreign keys در جداول مرتبط
        UPDATE transactions t
        SET member_id = map.new_id
        FROM member_id_mapping map
        WHERE t.member_id = map.old_id;
        
        UPDATE attendance_records ar
        SET member_id = map.new_id
        FROM member_id_mapping map
        WHERE ar.member_id = map.old_id;
        
        -- بازگرداندن foreign key constraints
        ALTER TABLE transactions 
        ADD CONSTRAINT transactions_member_id_fkey 
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE SET NULL;
        
        ALTER TABLE attendance_records 
        ADD CONSTRAINT attendance_records_member_id_fkey 
        FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE CASCADE;
        
        -- تنظیم مجدد sequence
        SELECT setval('members_id_seq', COALESCE(MAX(id), 1000), true) FROM members;
        
        DROP TABLE member_id_mapping;
        
        RAISE NOTICE 'IDs اعضا با موفقیت آپدیت شدند';
    END IF;
END $;

-- ==========================================
-- مرحله 4: ایجاد تابع برای بررسی ظرفیت
-- ==========================================

-- تابع برای بررسی تعداد IDs باقیمانده
CREATE OR REPLACE FUNCTION check_id_capacity(table_name TEXT)
RETURNS TABLE(
    total_capacity INTEGER,
    used_count BIGINT,
    remaining INTEGER,
    usage_percentage NUMERIC
) AS $
DECLARE
    count_query TEXT;
    used_ids BIGINT;
BEGIN
    -- محاسبه تعداد رکوردهای موجود
    count_query := format('SELECT COUNT(*) FROM %I', table_name);
    EXECUTE count_query INTO used_ids;
    
    -- محاسبه آمار
    total_capacity := 9000; -- از 1000 تا 9999
    used_count := used_ids;
    remaining := total_capacity - used_ids;
    usage_percentage := ROUND((used_ids::NUMERIC / total_capacity) * 100, 2);
    
    RETURN QUERY SELECT 
        total_capacity,
        used_count,
        remaining,
        usage_percentage;
END;
$ LANGUAGE plpgsql;

-- ==========================================
-- مرحله 5: نمایش وضعیت فعلی
-- ==========================================

-- نمایش تنظیمات sequence ها
SELECT 
    'users_id_seq' as sequence_name,
    last_value,
    max_value,
    is_called
FROM users_id_seq
UNION ALL
SELECT 
    'members_id_seq',
    last_value,
    max_value,
    is_called
FROM members_id_seq;

-- نمایش ظرفیت باقیمانده
SELECT 'Users' as table_name, * FROM check_id_capacity('users')
UNION ALL
SELECT 'Members', * FROM check_id_capacity('members');

-- نمایش نمونه IDs
SELECT 'Users' as table_name, id, username, email FROM users ORDER BY id LIMIT 5;
SELECT 'Members' as table_name, id, first_name, last_name, phone FROM members ORDER BY id LIMIT 5;

-- ==========================================
-- تمام شد! ✅
-- ==========================================

-- نکات مهم:
-- 1. حداکثر 9000 کاربر و 9000 عضو می‌تونید داشته باشید
-- 2. اگر به حد maximum رسیدید، باید IDs قدیمی رو پاک کنید
-- 3. برای بررسی ظرفیت: SELECT * FROM check_id_capacity('users');
-- 4. IDs به صورت خودکار از 1000 شروع می‌شن

RAISE NOTICE '✅ شناسه‌های 4 رقمی با موفقیت تنظیم شدند!';
RAISE NOTICE '📊 محدوده: 1000 تا 9999';
RAISE NOTICE '💾 ظرفیت: 9000 رکورد برای هر جدول';
