-- ==========================================
-- اضافه کردن فیلدهای جدید به جدول users
-- ==========================================

-- اضافه کردن فیلدهای جدید
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS first_name VARCHAR(50),
ADD COLUMN IF NOT EXISTS last_name VARCHAR(50),
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- نمایش ساختار جدول
SELECT column_name, data_type, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- پیام موفقیت
SELECT 'فیلدهای جدید با موفقیت اضافه شدند!' as message;
