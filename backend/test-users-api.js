const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}━━━ ${msg} ━━━${colors.reset}`)
};

let superAdminToken = '';
let adminToken = '';
let newUserId = null;

// تست 1: ورود Super Admin
async function loginSuperAdmin() {
  log.section('تست 1: ورود Super Admin');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'superadmin',
      password: 'Admin@123'
    });

    if (response.data.success && response.data.token) {
      superAdminToken = response.data.token;
      log.success('ورود Super Admin موفق');
      return true;
    }
  } catch (error) {
    log.error(`ورود ناموفق: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// تست 2: ورود Admin
async function loginAdmin() {
  log.section('تست 2: ورود Admin');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'admin1',
      password: 'Admin123'
    });

    if (response.data.success && response.data.token) {
      adminToken = response.data.token;
      log.success('ورود Admin موفق');
      return true;
    }
  } catch (error) {
    log.error(`ورود ناموفق: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// تست 3: Super Admin - دریافت لیست همه کاربران
async function testSuperAdminGetAllUsers() {
  log.section('تست 3: Super Admin - دریافت لیست همه کاربران');
  try {
    const response = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });

    if (response.data.success) {
      log.success(`دریافت لیست موفق - تعداد: ${response.data.count}`);
      response.data.data.forEach(user => {
        log.info(`   - ${user.username} (${user.role})`);
      });
      return true;
    }
  } catch (error) {
    log.error(`خطا: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// تست 4: Admin - دریافت لیست (هیچ کس رو نمی‌بینه)
async function testAdminGetUsers() {
  log.section('تست 4: Admin - دریافت لیست (هیچ کس رو نمی‌بینه)');
  try {
    const response = await axios.get(`${BASE_URL}/users`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    if (response.data.success && response.data.count === 0) {
      log.success('Admin هیچ کس را نمی‌بیند (حتی خودش را)');
      return true;
    } else {
      log.error('Admin نباید کاربران را ببیند!');
      return false;
    }
  } catch (error) {
    log.error(`خطا: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// تست 5: Super Admin - اضافه کردن کاربر جدید
async function testCreateUser() {
  log.section('تست 5: Super Admin - اضافه کردن کاربر جدید');
  try {
    const response = await axios.post(`${BASE_URL}/users`, {
      username: 'testuser',
      email: 'testuser@gym.local',
      password: 'Test123',
      first_name: 'تست',
      last_name: 'کاربر',
      phone: '09123456789',
      role: 'admin'
    }, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });

    if (response.data.success) {
      newUserId = response.data.data.id;
      log.success('کاربر جدید اضافه شد');
      log.info(`   - ID: ${newUserId}`);
      log.info(`   - نام: ${response.data.data.first_name} ${response.data.data.last_name}`);
      return true;
    }
  } catch (error) {
    if (error.response?.status === 409) {
      log.warn('کاربر قبلاً وجود دارد - ادامه تست...');
      return true;
    }
    log.error(`خطا: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// تست 6: Admin - تلاش برای اضافه کردن کاربر (باید ناموفق باشد)
async function testAdminCannotCreateUser() {
  log.section('تست 6: Admin - تلاش برای اضافه کردن کاربر');
  try {
    await axios.post(`${BASE_URL}/users`, {
      username: 'shouldfail',
      email: 'fail@gym.local',
      password: 'Test123',
      role: 'admin'
    }, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    log.error('Admin نباید بتواند کاربر اضافه کند!');
    return false;
  } catch (error) {
    if (error.response?.status === 403) {
      log.success('Admin به درستی از اضافه کردن کاربر محروم شد');
      return true;
    }
    log.error(`خطای غیرمنتظره: ${error.message}`);
    return false;
  }
}

// تست 7: Super Admin - ویرایش کاربر
async function testUpdateUser() {
  log.section('تست 7: Super Admin - ویرایش کاربر');
  if (!newUserId) {
    log.warn('کاربر جدید وجود ندارد - رد شدن از تست');
    return true;
  }

  try {
    const response = await axios.put(`${BASE_URL}/users/${newUserId}`, {
      first_name: 'تست ویرایش شده',
      phone: '09987654321'
    }, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });

    if (response.data.success) {
      log.success('ویرایش کاربر موفق');
      log.info(`   - نام جدید: ${response.data.data.first_name}`);
      return true;
    }
  } catch (error) {
    log.error(`خطا: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// تست 8: تغییر رمز عبور
async function testChangePassword() {
  log.section('تست 8: تغییر رمز عبور');
  try {
    const response = await axios.put(`${BASE_URL}/users/1/change-password`, {
      currentPassword: 'Admin@123',
      newPassword: 'Admin@123' // همون رمز قبلی
    }, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });

    if (response.data.success) {
      log.success('تغییر رمز عبور موفق');
      return true;
    }
  } catch (error) {
    log.error(`خطا: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// تست 9: Super Admin - حذف کاربر
async function testDeleteUser() {
  log.section('تست 9: Super Admin - حذف کاربر');
  if (!newUserId) {
    log.warn('کاربر جدید وجود ندارد - رد شدن از تست');
    return true;
  }

  try {
    const response = await axios.delete(`${BASE_URL}/users/${newUserId}`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });

    if (response.data.success) {
      log.success('حذف کاربر موفق');
      return true;
    }
  } catch (error) {
    log.error(`خطا: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// اجرای همه تست‌ها
async function runAllTests() {
  console.log(`${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║      تست API مدیریت کاربران         ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}`);

  const results = [];

  results.push(await loginSuperAdmin());
  results.push(await loginAdmin());
  results.push(await testSuperAdminGetAllUsers());
  results.push(await testAdminGetUsers());
  results.push(await testCreateUser());
  results.push(await testAdminCannotCreateUser());
  results.push(await testUpdateUser());
  results.push(await testChangePassword());
  results.push(await testDeleteUser());

  // نتیجه نهایی
  log.section('نتیجه نهایی');
  const passed = results.filter(r => r).length;
  const total = results.length;

  if (passed === total) {
    log.success(`همه تست‌ها موفق بودند! (${passed}/${total})`);
  } else {
    log.warn(`${passed} از ${total} تست موفق بودند`);
  }

  console.log('');
}

// اجرا
runAllTests().catch(error => {
  log.error(`خطای کلی: ${error.message}`);
  process.exit(1);
});
