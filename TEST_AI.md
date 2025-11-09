# تست اتصال به Gemini AI

## مرحله 1: Restart Backend

```bash
cd backend
# Ctrl+C
npm run dev
```

---

## مرحله 2: تست اتصال

### از مرورگر:
باز کن:
```
http://127.0.0.1:5000/api/ai/test
```

### یا از Terminal:
```bash
curl http://127.0.0.1:5000/api/ai/test
```

---

## نتایج ممکن:

### ✅ موفق:
```json
{
  "success": true,
  "message": "اتصال به Gemini موفق بود",
  "apiKeySet": true,
  "response": "سلام"
}
```

### ❌ API Key تنظیم نشده:
```json
{
  "success": false,
  "error": "API Key تنظیم نشده است",
  "apiKeySet": false
}
```

### ❌ خطای اتصال:
```json
{
  "success": false,
  "error": "خطا در اتصال به Gemini",
  "message": "fetch failed",
  "apiKeySet": true
}
```

---

## اگه خطای اتصال داد:

### 1. چک کن VPN روشنه؟
```
VPN باید روشن باشه برای دسترسی به Google
```

### 2. چک کن API Key درسته؟
فایل `backend/.env`:
```env
GEMINI_API_KEY=AIzaSyDdULQBeMv7QYL7tDKrZxqEx6hqefCJXt8
```

### 3. چک کن Backend لاگ چی میگه:
در Terminal Backend باید ببینی:
```
🧪 Testing Gemini AI connection...
✅ API Key is set
✅ Gemini responded: سلام
```

یا:
```
❌ Test failed: fetch failed
```

---

## مرحله 3: بعد از موفق شدن تست

برو به Frontend:
```
http://127.0.0.1:5173/ai
```

و سوال بپرس!

---

## نکته مهم:

اگه خطای `fetch failed` داد، یعنی:
- VPN خاموشه
- یا VPN نمی‌تونه به Google دسترسی داشته باشه
- یا فیلترشکن مشکل داره

**راه حل:** VPN رو عوض کن یا تنظیماتش رو چک کن.
