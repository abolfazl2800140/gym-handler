-- ==========================================
-- اصلاح جنسیت کاربر sheyda و تست فیلتر
-- ==========================================

-- 1. بررسی وضعیت فعلی
SELECT 
    'وضعیت فعلی کاربر sheyda:' as info,
    id, 
    username, 
    email, 
    gender, 
    role 
FROM users 
WHERE username = 'sheyda';

-- 2. به‌روزرسانی جنسیت به "زن"
UPDATE users 
SET gender = 'زن',
    updated_at = CURRENT_TIMESTAMP
WHERE username = 'sheyda';

-- 3. نمایش نتیجه
SELECT 
    'بعد از به‌روزرسانی:' as info,
    id, 
    username, 
    email, 
    gender, 
    role 
FROM users 
WHERE username = 'sheyda';

-- 4. نمایش تعداد اعضا بر اساس جنسیت
SELECT 
    'آمار اعضا:' as info,
    gender,
    COUNT(*) as تعداد
FROM members
GROUP BY gender;

-- 5. نمایش 5 عضو زن (که sheyda باید ببیند)
SELECT 
    'نمونه اعضای زن:' as info,
    id,
    first_name,
    last_name,
    phone,
    gender
FROM members
WHERE gender = 'زن'
LIMIT 5;

-- 6. نمایش 5 عضو مرد (که sheyda نباید ببیند)
SELECT 
    'نمونه اعضای مرد:' as info,
    id,
    first_name,
    last_name,
    phone,
    gender
FROM members
WHERE gender = 'مرد'
LIMIT 5;

-- ==========================================
-- دستورالعمل:
-- ==========================================
-- 1. این اسکریپت را در pgAdmin اجرا کنید
-- 2. از حساب sheyda خارج شوید (Logout)
-- 3. دوباره با sheyda وارد شوید (Login)
-- 4. حالا فقط اعضای زن را خواهید دید!
-- ==========================================
