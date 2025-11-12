-- ==========================================
-- پاک کردن تمام داده‌ها به جز کاربران (Users)
-- ==========================================

-- نمایش تعداد رکوردها قبل از حذف
SELECT 'قبل از حذف:' as status;
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Members', COUNT(*) FROM members
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'Attendance', COUNT(*) FROM attendance
UNION ALL
SELECT 'Attendance Records', COUNT(*) FROM attendance_records
UNION ALL
SELECT 'Activity Logs', COUNT(*) FROM activity_logs;

-- ==========================================
-- حذف رکوردها (به ترتیب وابستگی)
-- ==========================================

-- 1. حذف Activity Logs
DELETE FROM activity_logs;

-- 2. حذف Attendance Records
DELETE FROM attendance_records;

-- 3. حذف Attendance
DELETE FROM attendance;

-- 4. حذف Transactions
DELETE FROM transactions;

-- 5. حذف Members
DELETE FROM members;

-- ==========================================
-- ریست کردن Sequences
-- ==========================================

-- ریست sequence برای Members (شروع از 1000)
ALTER SEQUENCE members_id_seq RESTART WITH 1000;

-- ریست sequence برای Transactions
ALTER SEQUENCE transactions_id_seq RESTART WITH 1;

-- ریست sequence برای Attendance
ALTER SEQUENCE attendance_id_seq RESTART WITH 1;

-- ریست sequence برای Attendance Records
ALTER SEQUENCE attendance_records_id_seq RESTART WITH 1;

-- ریست sequence برای Activity Logs
ALTER SEQUENCE activity_logs_id_seq RESTART WITH 1;

-- ==========================================
-- نمایش نتیجه
-- ==========================================

SELECT 'بعد از حذف:' as status;
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Members', COUNT(*) FROM members
UNION ALL
SELECT 'Transactions', COUNT(*) FROM transactions
UNION ALL
SELECT 'Attendance', COUNT(*) FROM attendance
UNION ALL
SELECT 'Attendance Records', COUNT(*) FROM attendance_records
UNION ALL
SELECT 'Activity Logs', COUNT(*) FROM activity_logs;

-- ==========================================
-- نمایش کاربران باقیمانده
-- ==========================================

SELECT 
    id,
    username,
    email,
    role,
    gender,
    is_active,
    created_at
FROM users
ORDER BY id;

-- ==========================================
-- تمام شد! ✅
-- ==========================================

SELECT '✅ تمام داده‌ها به جز کاربران پاک شدند!' as message;
SELECT '📊 تعداد کاربران باقیمانده: ' || COUNT(*) as info FROM users;
