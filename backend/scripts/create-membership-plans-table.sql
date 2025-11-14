-- ==========================================
-- ساخت جدول پلن‌های عضویت
-- ==========================================

-- حذف جدول قدیمی (اگر وجود داشته باشد)
DROP TABLE IF EXISTS membership_plans CASCADE;

-- ساخت جدول پلن‌های عضویت
CREATE TABLE membership_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    duration_days INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description TEXT,
    color VARCHAR(20) DEFAULT '#3182ce',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ایندکس برای جستجوی سریع‌تر
CREATE INDEX idx_plans_name ON membership_plans(name);
CREATE INDEX idx_plans_active ON membership_plans(is_active);

-- Trigger برای به‌روزرسانی خودکار updated_at
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON membership_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- داده‌های اولیه (پلن‌های پیش‌فرض)
INSERT INTO membership_plans (name, duration_days, price, description, color, is_active) VALUES
('برنزی', 30, 500000, 'پلن پایه - یک ماهه', '#CD7F32', true),
('نقره‌ای', 60, 900000, 'پلن متوسط - دو ماهه', '#C0C0C0', true),
('طلایی', 90, 1200000, 'پلن پیشرفته - سه ماهه', '#FFD700', true),
('پلاتینیوم', 180, 2000000, 'پلن ویژه - شش ماهه', '#E5E4E2', true);

-- نمایش پلن‌های ایجاد شده
SELECT 
    id,
    name,
    duration_days,
    price,
    description,
    color,
    is_active
FROM membership_plans
ORDER BY duration_days;

-- ==========================================
-- تمام شد! ✅
-- ==========================================
