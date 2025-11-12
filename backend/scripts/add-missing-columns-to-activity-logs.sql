-- ==========================================
-- اضافه کردن ستون‌های گمشده به جدول activity_logs
-- ==========================================

-- اضافه کردن ستون user_id
ALTER TABLE activity_logs 
ADD COLUMN IF NOT EXISTS user_id INTEGER;

-- اضافه کردن ستون user_agent
ALTER TABLE activity_logs 
ADD COLUMN IF NOT EXISTS user_agent TEXT;

-- اضافه کردن foreign key برای user_id (اختیاری)
-- ALTER TABLE activity_logs 
-- ADD CONSTRAINT fk_activity_logs_user 
-- FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL;

-- نمایش ساختار جدول
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'activity_logs'
ORDER BY ordinal_position;

-- ✅ تمام!
SELECT '✅ ستون‌های user_id و user_agent با موفقیت اضافه شدند!' as message;
