-- ==========================================
-- تنظیم محدوده ID برای جداول مختلف
-- عوامل باشگاه (users): 1000-1999
-- ورزشکاران (members): 2000-9999
-- ==========================================

-- تنظیم sequence برای جدول users (عوامل باشگاه)
ALTER SEQUENCE users_id_seq RESTART WITH 1000;

-- تنظیم sequence برای جدول members (ورزشکاران)
ALTER SEQUENCE members_id_seq RESTART WITH 2000;

-- اضافه کردن constraint برای محدود کردن ID ها
-- برای users: فقط 1000-1999
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_id_range_check;
ALTER TABLE users ADD CONSTRAINT users_id_range_check 
  CHECK (id >= 1000 AND id <= 1999);

-- برای members: فقط 2000-9999
ALTER TABLE members DROP CONSTRAINT IF EXISTS members_id_range_check;
ALTER TABLE members ADD CONSTRAINT members_id_range_check 
  CHECK (id >= 2000 AND id <= 9999);

-- پایان اسکریپت
SELECT 'محدوده ID ها با موفقیت تنظیم شدند!' as message;
SELECT 'Users (عوامل): 1000-1999' as range_1;
SELECT 'Members (ورزشکاران): 2000-9999' as range_2;
