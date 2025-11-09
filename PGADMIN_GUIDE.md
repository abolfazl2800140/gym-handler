# راهنمای گام به گام pgAdmin

## مرحله 1: باز کردن pgAdmin

1. از Start Menu جستجو کن: **pgAdmin**
2. اولین بار که باز می‌کنی، ازت **Master Password** می‌خواد
   - یه رمز ساده بذار مثل: `admin`
   - این رمز فقط برای pgAdmin هست

## مرحله 2: اتصال به PostgreSQL

1. در سمت چپ، ببین **Servers** رو
2. کلیک روی **Servers** → **PostgreSQL 17** (یا هر نسخه‌ای که نصب کردی)
3. یه پنجره باز میشه که ازت **Password** می‌خواد
   - این رمزی که موقع نصب PostgreSQL تنظیم کردی (مثلاً: `postgres`)
4. تیک بزن روی **Save password**
5. کلیک **OK**

اگه موفق بود، یه علامت سبز روی PostgreSQL می‌بینی ✅

---

## مرحله 3: ساخت دیتابیس

### روش 1: از رابط گرافیکی (راحت‌تر)

1. کلیک راست روی **Databases**
2. انتخاب **Create** → **Database...**
3. در قسمت **Database**، بنویس: `gym_management`
4. کلیک **Save**

### روش 2: با اسکریپت SQL

1. کلیک راست روی **PostgreSQL 17**
2. انتخاب **Query Tool**
3. یه پنجره باز میشه با یه صفحه خالی
4. باز کردن فایل `backend/create-database.sql`
5. کپی کردن محتوای فایل
6. Paste کردن توی Query Tool
7. کلیک روی دکمه **Execute** (یا F5)

باید پیام ببینی: `CREATE DATABASE`

---

## مرحله 4: ساخت جداول

1. در سمت چپ، کلیک روی **Databases** → **gym_management**
2. کلیک راست روی **gym_management**
3. انتخاب **Query Tool**
4. باز کردن فایل `backend/create-tables.sql`
5. کپی کردن **تمام** محتوای فایل
6. Paste کردن توی Query Tool
7. کلیک روی دکمه **Execute** (یا F5)

باید پیام‌های زیر رو ببینی:
```
DROP TABLE
DROP TABLE
...
CREATE TABLE
CREATE TABLE
...
INSERT 0 5
INSERT 0 5
...
Query returned successfully
```

---

## مرحله 5: چک کردن جداول

1. در سمت چپ، کلیک روی **gym_management**
2. کلیک روی **Schemas** → **public** → **Tables**
3. باید این جداول رو ببینی:
   - ✅ attendance
   - ✅ attendance_records
   - ✅ members
   - ✅ transactions
   - ✅ users

---

## مرحله 6: مشاهده داده‌ها

برای دیدن داده‌های نمونه:

1. کلیک راست روی جدول **members**
2. انتخاب **View/Edit Data** → **All Rows**
3. باید 5 عضو نمونه رو ببینی

همین کار رو برای جداول دیگه هم می‌تونی انجام بدی.

---

## مرحله 7: تنظیم Backend

حالا که دیتابیس آماده شد، فایل `backend/.env` رو باز کن:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gym_management
DB_USER=postgres
DB_PASSWORD=postgres
```

اگه رمز متفاوتی تنظیم کردی، `DB_PASSWORD` رو عوض کن.

---

## مرحله 8: تست اتصال

```bash
cd backend
npm run test-connection
```

باید ببینی:
```
✅ Database connected successfully!
✅ Tables found:
   - attendance
   - attendance_records
   - members
   - transactions
   - users
```

---

## مرحله 9: اجرای Backend

```bash
npm run dev
```

باید ببینی:
```
🚀 Server is running on port 5000
✅ Connected to PostgreSQL database
```

---

## 🎉 تبریک! همه چیز آماده است

حالا می‌تونی Frontend رو هم اجرا کنی:
```bash
npm run dev
```

و برو به: http://localhost:5173

---

## 🐛 مشکلات رایج

### خطا: "password authentication failed"

**راه حل:**
- رمز اشتباهه
- در pgAdmin دوباره وصل شو و رمز صحیح رو وارد کن
- همون رمز رو در `backend/.env` هم بذار

### خطا: "database already exists"

**راه حل:**
- دیتابیس از قبل وجود داره
- مستقیم برو مرحله 4 (ساخت جداول)

### خطا: "relation already exists"

**راه حل:**
- جداول از قبل وجود دارن
- اسکریپت `create-tables.sql` خودش اول جداول قدیمی رو حذف می‌کنه
- دوباره اجرا کن

---

## 📸 تصاویر راهنما

### 1. ساخت دیتابیس:
```
کلیک راست روی Databases
    ↓
Create → Database
    ↓
نام: gym_management
    ↓
Save
```

### 2. اجرای Query:
```
کلیک راست روی gym_management
    ↓
Query Tool
    ↓
Paste کردن SQL
    ↓
F5 یا Execute
```

---

## ✅ چک‌لیست

- [ ] pgAdmin باز شد
- [ ] به PostgreSQL وصل شدم
- [ ] دیتابیس `gym_management` ساخته شد
- [ ] اسکریپت `create-tables.sql` اجرا شد
- [ ] 5 جدول در Tables دیدم
- [ ] داده‌های نمونه در members دیدم
- [ ] `npm run test-connection` موفق بود
- [ ] Backend اجراست و به دیتابیس وصل شد

---

**موفق باشی!** 🚀

اگه جایی گیر کردی، اسکرین‌شات بگیر و بفرست تا کمکت کنم.
