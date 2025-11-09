# راهنمای سریع راه‌اندازی

## 🚨 خطای 500 - راه حل سریع

خطای 500 به این معنیه که **PostgreSQL** مشکل داره. بیا گام به گام درستش کنیم:

---

## گام 1: نصب و راه‌اندازی PostgreSQL

### آیا PostgreSQL نصب داری?

#### چک کردن:
1. جستجو کن: `pgAdmin` یا `PostgreSQL`
2. اگه پیدا نکردی، نصب نداری

#### نصب PostgreSQL (Windows):
1. دانلود از: https://www.postgresql.org/download/windows/
2. نصب کن (رمز رو یادداشت کن! مثلاً: `postgres`)
3. بعد از نصب، pgAdmin باز میشه

---

## گام 2: ساخت دیتابیس

### روش 1: از pgAdmin (راحت‌تر)

1. باز کردن **pgAdmin**
2. کلیک راست روی **Databases**
3. انتخاب **Create → Database**
4. نام: `gym_management`
5. کلیک **Save**

### روش 2: از Command Line

```bash
# باز کردن psql
psql -U postgres

# ساخت دیتابیس
CREATE DATABASE gym_management;

# خروج
\q
```

---

## گام 3: تنظیم رمز عبور

فایل `backend/.env` رو باز کن و رمز PostgreSQL خودت رو بنویس:

```env
DB_PASSWORD=postgres
```

یا هر رمزی که موقع نصب PostgreSQL تنظیم کردی.

---

## گام 4: ساخت جداول

```bash
cd backend
npm install
npm run init-db
```

باید ببینی:
```
✅ Users table created
✅ Members table created
✅ Transactions table created
✅ Attendance table created
✅ Attendance records table created
✅ Sample members inserted
✅ Sample transactions inserted
✅ Sample attendance records inserted
🎉 Database setup complete!
```

---

## گام 5: اجرای Backend

```bash
npm run dev
```

باید ببینی:
```
🚀 Server is running on port 5000
✅ Connected to PostgreSQL database
```

---

## گام 6: اجرای Frontend

در یک ترمینال جدید:

```bash
npm run dev
```

Frontend روی `http://localhost:5173` اجرا میشه.

---

## ✅ تست نهایی

باز کردن مرورگر:
```
http://localhost:5173
```

اگه صفحه باز شد و لیست اعضا رو دیدی، **تبریک! همه چیز کار می‌کنه** 🎉

---

## 🐛 اگه هنوز خطا داری

### خطا: "password authentication failed"

**راه حل:**
```bash
# فایل backend/.env رو باز کن
# DB_PASSWORD رو با رمز واقعی PostgreSQL عوض کن
```

### خطا: "database does not exist"

**راه حل:**
```bash
# در pgAdmin:
# کلیک راست روی Databases → Create → Database
# نام: gym_management
```

### خطا: "connect ECONNREFUSED"

**راه حل:**
```bash
# PostgreSQL اجرا نیست
# Windows: Services → PostgreSQL → Start
# یا pgAdmin رو باز کن
```

### خطا: "Cannot find module"

**راه حل:**
```bash
cd backend
npm install
```

---

## 📋 چک‌لیست کامل

- [ ] PostgreSQL نصب شده
- [ ] pgAdmin باز میشه
- [ ] دیتابیس `gym_management` ساخته شده
- [ ] فایل `backend/.env` وجود داره
- [ ] رمز دیتابیس در `.env` درست است
- [ ] `npm install` در backend اجرا شده
- [ ] `npm run init-db` موفق بوده
- [ ] `npm run dev` در backend اجراست
- [ ] `npm run dev` در frontend اجراست
- [ ] صفحه `http://localhost:5173` باز میشه

---

## 🎯 دستورات سریع

```bash
# ترمینال 1 - Backend
cd backend
npm install
npm run init-db
npm run dev

# ترمینال 2 - Frontend  
npm run dev
```

---

## 💡 نکته مهم

اگه PostgreSQL نصب نداری، **حتماً باید نصب کنی**. بدون PostgreSQL، Backend کار نمی‌کنه.

دانلود: https://www.postgresql.org/download/windows/

---

## 🆘 کمک بیشتر

اگه هنوز مشکل داری:

1. اسکرین‌شات از خطا بگیر
2. لاگ Terminal Backend رو کپی کن
3. نتیجه `npm run test-connection` رو بفرست

---

**موفق باشی!** 🚀
