# راهنمای نصب PostgreSQL

## روش 1: نصب با winget (سریع‌تر) ⚡

### مرحله 1: نصب PostgreSQL
```powershell
winget install PostgreSQL.PostgreSQL.17
```

**نکته مهم:** موقع نصب ازت رمز می‌خواد. یه رمز ساده بذار مثل: `postgres`
این رمز رو **یادداشت کن**! بعداً لازمش داری.

### مرحله 2: نصب pgAdmin (رابط گرافیکی)
```powershell
winget install PostgreSQL.pgAdmin
```

---

## روش 2: نصب دستی (اگه winget کار نکرد)

### مرحله 1: دانلود
1. برو به: https://www.postgresql.org/download/windows/
2. کلیک روی **Download the installer**
3. دانلود **PostgreSQL 17** (آخرین نسخه)

### مرحله 2: نصب
1. اجرای فایل دانلود شده
2. **Next** تا برسی به صفحه Password
3. رمز بذار: `postgres` (یادداشت کن!)
4. پورت پیش‌فرض: `5432` (تغییر نده)
5. **Next** تا آخر
6. منتظر بمون تا نصب تموم بشه

---

## مرحله 3: چک کردن نصب

### باز کردن Command Prompt:
```cmd
psql --version
```

باید نسخه PostgreSQL رو نشون بده:
```
psql (PostgreSQL) 17.x
```

---

## مرحله 4: ساخت دیتابیس

### روش 1: از pgAdmin (راحت‌تر)

1. باز کردن **pgAdmin** از Start Menu
2. اولین بار ازت رمز Master می‌خواد (یه رمز جدید بذار)
3. کلیک روی **Servers** → **PostgreSQL 17**
4. رمزی که موقع نصب تنظیم کردی رو وارد کن (`postgres`)
5. کلیک راست روی **Databases**
6. انتخاب **Create** → **Database**
7. نام: `gym_management`
8. کلیک **Save**

### روش 2: از Command Line

```cmd
# اتصال به PostgreSQL
psql -U postgres

# وارد کردن رمز (postgres)

# ساخت دیتابیس
CREATE DATABASE gym_management;

# چک کردن
\l

# خروج
\q
```

---

## مرحله 5: تنظیم Backend

فایل `backend/.env` رو باز کن و این خط رو پیدا کن:
```env
DB_PASSWORD=postgres
```

اگه رمز متفاوتی تنظیم کردی، اینجا عوض کن.

---

## مرحله 6: ساخت جداول

```bash
cd backend
npm install
npm run init-db
```

باید ببینی:
```
🔨 Creating database tables...
✅ Users table created
✅ Members table created
✅ Transactions table created
✅ Attendance table created
✅ Attendance records table created
✅ Indexes created
📝 Inserting sample data...
✅ Sample members inserted
✅ Sample transactions inserted
✅ Sample attendance records inserted
🎉 Database setup complete!
```

---

## مرحله 7: تست اتصال

```bash
npm run test-connection
```

باید ببینی:
```
✅ Database connected successfully!
✅ Tables found:
   - users
   - members
   - transactions
   - attendance
   - attendance_records
```

---

## ✅ اگه همه چیز موفق بود

حالا می‌تونی Backend رو اجرا کنی:
```bash
npm run dev
```

باید ببینی:
```
🚀 Server is running on port 5000
✅ Connected to PostgreSQL database
```

---

## 🐛 مشکلات رایج

### خطا: "psql: command not found"

**راه حل:**
PostgreSQL به PATH اضافه نشده. دوباره سیستم رو Restart کن.

### خطا: "password authentication failed"

**راه حل:**
رمز در `backend/.env` اشتباهه. رمز صحیح رو بذار.

### خطا: "could not connect to server"

**راه حل:**
PostgreSQL اجرا نیست. از Services استارت کن:
1. `Win + R`
2. تایپ: `services.msc`
3. پیدا کردن: `postgresql-x64-17`
4. کلیک راست → **Start**

---

## 📝 یادداشت مهم

**رمز PostgreSQL رو یادداشت کن!**
- رمز پیش‌فرض پیشنهادی: `postgres`
- این رمز رو در `backend/.env` هم باید بذاری

---

## 🎯 خلاصه دستورات

```bash
# نصب PostgreSQL
winget install PostgreSQL.PostgreSQL.17

# نصب pgAdmin
winget install PostgreSQL.pgAdmin

# ساخت دیتابیس (در pgAdmin یا psql)
CREATE DATABASE gym_management;

# تنظیم Backend
cd backend
npm install
npm run init-db
npm run test-connection
npm run dev
```

---

**موفق باشی!** 🚀
