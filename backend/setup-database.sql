-- ==========================================
-- اسکریپت ساخت دیتابیس باشگاه
-- کپی کن و توی pgAdmin اجرا کن
-- ==========================================

-- مرحله 1: ساخت دیتابیس (اگه وجود نداره)
-- این خط رو فقط یکبار اجرا کن
CREATE DATABASE gym_management;

-- بعد از ساخت دیتابیس، به gym_management وصل شو
-- (از منوی pgAdmin انتخاب کن: gym_management)

-- مرحله 2: حذف جداول قدیمی (اگه وجود داشته باشن)
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- مرحله 3: ساخت جدول کاربران
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT 