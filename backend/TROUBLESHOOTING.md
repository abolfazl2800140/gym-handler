# راهنمای عیب‌یابی خطای 500

## 🔍 تشخیص مشکل

خطای 500 Internal Server Error می‌تونه به دلایل مختلفی باشه. بیا گام به گام چک کنیم:

---

## مرحله 1: تست اتصال دیتابیس

```bash
cd backend
npm run test-connection
```

### خروجی موفق:
```
✅ Database connected successfully!
✅ Tables found:
   - users
   - members
   - transactions
   - attendance
   - attendance_records
```

### اگه خطا داد:

#### خطا: "password authentication failed"
```bash
# ویرایش فایل .env
# DB_PASSWORD رو با رمز PostgreSQL خودت عوض کن
```

#### خطا: "database does not exist"
```bash
# ساخت دیتابیس
# باز کردن pgAdmin یا psql:
CREATE DATABASE gym_management;

# بعد اجرای:
npm run init-db
```

#### خطا: "connect ECONNREFUSED"
```bash
# PostgreSQL اجرا نیست
# Windows: Services → PostgreSQL → Start
# یا از pgAdmin استارت کن
```

---

## مرحله 2: بررسی لاگ Backend

وقتی Backend رو اجرا می‌کنی (`npm run dev`), به لاگ‌ها دقت کن:

### لاگ موفق:
```
🚀 Server is running on port 5000
📍 API URL: http://localhost:5000/api
🏥 Health check: http://localhost:5000/api/health
✅ Connected to PostgreSQL database
```

### لاگ با خطا:
```
❌ Unexpected error on idle client
Error: ...
```

این یعنی مشکل از دیتابیس هست.

---

## مرحله 3: تست API Endpoints

با Backend در حال اجرا، در یک ترمینال دیگه:

```bash
npm run test-api
```

این تست می‌کنه که آیا endpoint ها کار می‌کنن یا نه.

---

## مرحله 4: تست دستی با curl

### تست Health Check:
```bash
curl http://localhost:5000/api/health
```

باید پاسخ بده:
```json
{"status":"OK","message":"Gym Management API is running"}
```

### تست Members:
```bash
curl http://localhost:5000/api/members
```

باید لیست اعضا رو برگردونه.

---

## 🐛 خطاهای رایج و راه حل

### 1. خطا: Cannot find module './routes/members'

**علت:** فایل route وجود نداره

**راه حل:**
```bash
# چک کن این فایل‌ها وجود دارن:
ls routes/
# باید ببینی: auth.js, members.js, transactions.js, attendance.js, reports.js
```

### 2. خطا: Cannot find module 'pg'

**علت:** پکیج‌ها نصب نشدن

**راه حل:**
```bash
npm install
```

### 3. خطا: relation "members" does not exist

**علت:** جداول دیتابیس ساخته نشدن

**راه حل:**
```bash
npm run init-db
```

### 4. خطا: column "first_name" does not exist

**علت:** ساختار جدول اشتباهه

**راه حل:**
```bash
# حذف جداول قدیمی و ساخت مجدد
# در pgAdmin یا psql:
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS attendance CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;
DROP TABLE IF EXISTS members CASCADE;
DROP TABLE IF EXISTS users CASCADE;

# بعد:
npm run init-db
```

### 5. خطا در Frontend: "Failed to fetch"

**علت:** Backend اجرا نیست

**راه حل:**
```bash
cd backend
npm run dev
```

---

## 🔧 راه حل سریع (Reset کامل)

اگه همه چیز خراب شد:

```bash
# 1. بستن Backend
Ctrl+C

# 2. حذف دیتابیس قدیمی (در pgAdmin یا psql)
DROP DATABASE IF EXISTS gym_management;
CREATE DATABASE gym_management;

# 3. نصب مجدد پکیج‌ها
cd backend
rm -rf node_modules
npm install

# 4. ساخت جداول
npm run init-db

# 5. اجرای Backend
npm run dev
```

---

## 📋 چک‌لیست عیب‌یابی

- [ ] PostgreSQL در حال اجراست
- [ ] دیتابیس `gym_management` وجود دارد
- [ ] فایل `.env` در پوشه backend وجود دارد
- [ ] رمز دیتابیس در `.env` درست است
- [ ] `npm install` اجرا شده
- [ ] `npm run init-db` اجرا شده
- [ ] `npm run test-connection` موفق است
- [ ] Backend روی پورت 5000 اجراست
- [ ] هیچ خطایی در Terminal Backend نیست

---

## 🆘 دیباگ پیشرفته

### نمایش خطاهای دقیق:

در `backend/server.js`, error handler رو تغییر بده:

```javascript
// Error handler
app.use((err, req, res, next) => {
  console.error('❌ ERROR:', err);
  console.error('Stack:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message,
    stack: err.stack
  });
});
```

حالا خطای دقیق رو می‌بینی.

---

## 📞 اگه هنوز مشکل داری

1. **لاگ کامل Backend رو کپی کن**
2. **خطای دقیق از Console مرورگر رو کپی کن**
3. **نتیجه `npm run test-connection` رو کپی کن**

---

**نکته:** اکثر خطاهای 500 به خاطر مشکل در اتصال دیتابیس یا جداول ناقص هستن.
