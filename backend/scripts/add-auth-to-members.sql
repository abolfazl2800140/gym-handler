-- ==========================================
-- اضافه کردن فیلدهای احراز هویت به جدول members
-- ==========================================

-- اضافه کردن ستون‌های username و password
ALTER TABLE members 
ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS password VARCHAR(255);

-- ایجاد index برای username
CREATE INDEX IF NOT EXISTS idx_members_username ON members(username);

-- نمونه: اضافه کردن username و password برای اعضای موجود
-- توجه: این فقط برای تست است - در محیط واقعی باید از رمزهای امن استفاده کنید

-- رمز عبور: 123456 (هش شده با bcrypt)
-- $2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy

UPDATE members 
SET username = 'ali.ahmadi', 
    password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE phone = '09121234567';

UPDATE members 
SET username = 'sara.mohammadi', 
    password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE phone = '09129876543';

UPDATE members 
SET username = 'mohammad.rezaei', 
    password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE phone = '09135551234';

UPDATE members 
SET username = 'fatemeh.karimi', 
    password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE phone = '09141112233';

UPDATE members 
SET username = 'hossein.nouri', 
    password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE phone = '09151234567';

-- پایان اسکریپت
