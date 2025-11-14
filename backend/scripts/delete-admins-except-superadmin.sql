-- ==========================================
-- حذف همه ادمین‌ها به جز سوپرادمین
-- ==========================================

-- نمایش کاربران قبل از حذف
SELECT 
    id,
    username,
    email,
    first_name,
    last_name,
    role,
    is_active
FROM users
ORDER BY role, id;

-- حذف همه کاربران با role = 'admin' (سوپرادمین‌ها حفظ می‌شوند)
DELETE FROM users 
WHERE role = 'admin';

-- نمایش کاربران بعد از حذف
SELECT 
    id,
    username,
    email,
    first_name,
    last_name,
    role,
    is_active
FROM users
ORDER BY role, id;

-- نمایش تعداد کاربران باقی‌مانده
SELECT 
    role,
    COUNT(*) as count
FROM users
GROUP BY role;
