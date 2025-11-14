-- ==========================================
-- پاک کردن تمام رکوردها (بدون حذف ساختار جداول)
-- ==========================================

-- غیرفعال کردن foreign key checks موقتاً
SET session_replication_role = 'replica';

-- پاک کردن رکوردها (به ترتیب وابستگی)
TRUNCATE TABLE activity_logs CASCADE;
TRUNCATE TABLE attendance_records CASCADE;
TRUNCATE TABLE attendance CASCADE;
TRUNCATE TABLE transactions CASCADE;
TRUNCATE TABLE members CASCADE;
TRUNCATE TABLE users CASCADE;

-- فعال کردن دوباره foreign key checks
SET session_replication_role = 'origin';

-- ریست کردن sequence ها (برای شروع ID از 1)
ALTER SEQUENCE activity_logs_id_seq RESTART WITH 1;
ALTER SEQUENCE attendance_records_id_seq RESTART WITH 1;
ALTER SEQUENCE attendance_id_seq RESTART WITH 1;
ALTER SEQUENCE transactions_id_seq RESTART WITH 1;
ALTER SEQUENCE members_id_seq RESTART WITH 1;
ALTER SEQUENCE users_id_seq RESTART WITH 1;

-- پایان اسکریپت
SELECT 'تمام رکوردها با موفقیت پاک شدند!' as message;
