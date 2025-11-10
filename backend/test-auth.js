const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

// رنگ‌ها برای console
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

// تست 1: Login با Super Admin
async function testSuperAdminLogin() {
  log.section('تست 1: ورود Super Admin');
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username: 'superadmin',
      password: 'Admin@123'
    });

    if (response.data.success && response.data.token) {
      superAdminToken = response.data.token;
      log.success('ورود Super Admin موفق');
      log.info(`نقش: ${response.data.user.role}`);
      log.info(`توکن: ${superAdminToken.substring(0, 20)}...`);
      return true;
    }
  } catch (error) {
    log.error(`ورود Super Admin ناموفق: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// تست 2: ثبت‌نام Admin عادی
async function testAdminRegister() {
  log.section('تست 2: ثبت‌نام Admin عادی');
  try {
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      username: 'admin1',
      email: 'admin1@gym.local',
      password: 'Admin123',
      role: 'admin'
    });

    if (response.data.success && response.data.token) {
      adminToken = response.data.token;
      log.success('ثبت‌نام Admin موفق');
      log.info(`نقش: ${response.data.user.role}`);
      return true;
    }
  } catch (error) {
    if (error.response?.status === 409) {
      log.warn('Admin قبلاً ثبت شده - تلاش برای ورود...');
      return await testAdminLogin();
    }
    log.error(`ثبت‌نام Admin ناموفق: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// تست 3: ورود Admin عادی
async function testAdminLogin() {
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
    log.error(`ورود Admin ناموفق: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// تست 4: دسترسی Super Admin به Activity Logs
async function testSuperAdminAccessToLogs() {
  log.section('تست 3: دسترسی Super Admin به Activity Logs');
  try {
    const response = await axios.get(`${BASE_URL}/activity-logs`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });

    if (response.data.success) {
      log.success('Super Admin به Activity Logs دسترسی دارد');
      log.info(`تعداد لاگ‌ها: ${response.data.logs?.length || 0}`);
      return true;
    }
  } catch (error) {
    log.error(`دسترسی Super Admin ناموفق: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// تست 5: عدم دسترسی Admin عادی به Activity Logs
async function testAdminNoAccessToLogs() {
  log.section('تست 4: عدم دسترسی Admin عادی به Activity Logs');
  try {
    const response = await axios.get(`${BASE_URL}/activity-logs`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    log.error('Admin عادی نباید به Activity Logs دسترسی داشته باشد!');
    return false;
  } catch (error) {
    if (error.response?.status === 403) {
      log.success('Admin عادی به درستی از Activity Logs محروم شد');
      log.info(`پیام: ${error.response.data.error}`);
      return true;
    }
    log.error(`خطای غیرمنتظره: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// تست 6: دسترسی بدون توکن
async function testNoTokenAccess() {
  log.section('تست 5: دسترسی بدون توکن');
  try {
    await axios.get(`${BASE_URL}/activity-logs`);
    log.error('نباید بدون توکن دسترسی داشته باشد!');
    return false;
  } catch (error) {
    if (error.response?.status === 401) {
      log.success('دسترسی بدون توکن به درستی مسدود شد');
      return true;
    }
    log.error(`خطای غیرمنتظره: ${error.message}`);
    return false;
  }
}

// تست 7: دریافت اطلاعات کاربر جاری
async function testGetCurrentUser() {
  log.section('تست 6: دریافت اطلاعات کاربر جاری');
  try {
    const response = await axios.get(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${superAdminToken}` }
    });

    if (response.data.success) {
      log.success('دریافت اطلاعات کاربر موفق');
      log.info(`نام کاربری: ${response.data.user.username}`);
      log.info(`نقش: ${response.data.user.role}`);
      return true;
    }
  } catch (error) {
    log.error(`دریافت اطلاعات کاربر ناموفق: ${error.response?.data?.error || error.message}`);
    return false;
  }
}

// اجرای همه تست‌ها
async function runAllTests() {
  console.log(`${colors.cyan}╔════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║   تست سیستم احراز هویت و مجوزدهی    ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════╝${colors.reset}`);

  const results = [];

  results.push(await testSuperAdminLogin());
  results.push(await testAdminRegister());
  results.push(await testSuperAdminAccessToLogs());
  results.push(await testAdminNoAccessToLogs());
  results.push(await testNoTokenAccess());
  results.push(await testGetCurrentUser());

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
