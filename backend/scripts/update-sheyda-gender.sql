-- ==========================================
-- به‌روزرسانی جنسیت کاربر sheyda
-- ==========================================

-- بررسی وضعیت فعلی کاربر sheyda
SELECT 
    id, 
    username, 
    email, 
    first_name, 
    last_name, 
    gender, 
    role 
FROM users 
WHERE username = 'sheyda';

-- به‌روزرسانی جنسیت به "زن"
UPDATE users 
SET gender = 'زن',
    updated_at = CURRENT_TIMESTAMP
WHERE username = 'sheyda';

-- نمایش نتیجه
SELECT 
    id, 
    username, 
    email, 
    first_name, 
    last_name, 
    gender, 
    role 
FROM users 
WHERE username = 'sheyda';

-- ==========================================
-- تمام شد! ✅
-- حالا کاربر sheyda فقط اعضای زن را می‌بیند
-- ==========================================
