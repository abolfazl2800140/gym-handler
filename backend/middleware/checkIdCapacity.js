const db = require('../config/database');

/**
 * Middleware برای بررسی ظرفیت باقیمانده ID ها
 * هشدار می‌ده اگر به 90% ظرفیت رسیده باشیم
 */

// محدوده‌های ID
const USERS_ID_MIN = 1000;
const USERS_ID_MAX = 1999;
const USERS_CAPACITY = USERS_ID_MAX - USERS_ID_MIN + 1; // 1000

const MEMBERS_ID_MIN = 2000;
const MEMBERS_ID_MAX = 9999;
const MEMBERS_CAPACITY = MEMBERS_ID_MAX - MEMBERS_ID_MIN + 1; // 8000

const WARNING_THRESHOLD = 0.9; // 90%

/**
 * بررسی ظرفیت برای یک جدول
 */
async function checkTableCapacity(tableName) {
  try {
    const result = await db.query(
      `SELECT COUNT(*) as count FROM ${tableName}`
    );
    
    const usedCount = parseInt(result.rows[0].count);
    
    // تعیین ظرفیت بر اساس نوع جدول
    const capacity = tableName === 'users' ? USERS_CAPACITY : MEMBERS_CAPACITY;
    const idMin = tableName === 'users' ? USERS_ID_MIN : MEMBERS_ID_MIN;
    const idMax = tableName === 'users' ? USERS_ID_MAX : MEMBERS_ID_MAX;
    
    const remaining = capacity - usedCount;
    const usagePercentage = (usedCount / capacity) * 100;
    
    return {
      tableName,
      totalCapacity: capacity,
      idRange: `${idMin}-${idMax}`,
      usedCount,
      remaining,
      usagePercentage: usagePercentage.toFixed(2),
      isNearLimit: usagePercentage >= (WARNING_THRESHOLD * 100),
      isFull: usedCount >= capacity
    };
  } catch (error) {
    console.error(`Error checking capacity for ${tableName}:`, error);
    return null;
  }
}

/**
 * Middleware برای بررسی ظرفیت قبل از ایجاد رکورد جدید
 */
const checkCapacityBeforeCreate = (tableName) => {
  return async (req, res, next) => {
    try {
      const capacity = await checkTableCapacity(tableName);
      
      if (!capacity) {
        return next();
      }
      
      // اگر ظرفیت پر شده
      if (capacity.isFull) {
        const maxCount = tableName === 'users' ? 1000 : 8000;
        return res.status(507).json({
          success: false,
          error: `ظرفیت ${tableName === 'users' ? 'کاربران' : 'اعضا'} پر شده است`,
          message: `حداکثر تعداد مجاز (${maxCount}) به پایان رسیده است. لطفاً رکوردهای قدیمی را حذف کنید.`,
          capacity
        });
      }
      
      // اگر نزدیک به حد maximum است
      if (capacity.isNearLimit) {
        console.warn(`⚠️  هشدار: ظرفیت ${tableName} به ${capacity.usagePercentage}% رسیده است`);
        console.warn(`   باقیمانده: ${capacity.remaining} رکورد`);
      }
      
      // اضافه کردن اطلاعات ظرفیت به request
      req.idCapacity = capacity;
      
      next();
    } catch (error) {
      console.error('Error in checkCapacityBeforeCreate:', error);
      next(); // در صورت خطا، اجازه ادامه بده
    }
  };
};

/**
 * API endpoint برای دریافت وضعیت ظرفیت
 */
const getCapacityStatus = async (req, res) => {
  try {
    const [usersCapacity, membersCapacity] = await Promise.all([
      checkTableCapacity('users'),
      checkTableCapacity('members')
    ]);
    
    res.json({
      success: true,
      data: {
        users: usersCapacity,
        members: membersCapacity,
        idRanges: {
          users: {
            min: USERS_ID_MIN,
            max: USERS_ID_MAX,
            capacity: USERS_CAPACITY
          },
          members: {
            min: MEMBERS_ID_MIN,
            max: MEMBERS_ID_MAX,
            capacity: MEMBERS_CAPACITY
          }
        }
      }
    });
  } catch (error) {
    console.error('Error getting capacity status:', error);
    res.status(500).json({
      success: false,
      error: 'خطا در دریافت وضعیت ظرفیت'
    });
  }
};

/**
 * تابع helper برای بررسی دستی ظرفیت
 */
const logCapacityStatus = async () => {
  const [usersCapacity, membersCapacity] = await Promise.all([
    checkTableCapacity('users'),
    checkTableCapacity('members')
  ]);
  
  console.log('\n📊 وضعیت ظرفیت ID ها:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (usersCapacity) {
    console.log(`👥 Users: ${usersCapacity.usedCount}/${usersCapacity.totalCapacity} (${usersCapacity.usagePercentage}%)`);
    console.log(`   باقیمانده: ${usersCapacity.remaining}`);
    if (usersCapacity.isNearLimit) {
      console.log('   ⚠️  نزدیک به حد maximum!');
    }
  }
  
  if (membersCapacity) {
    console.log(`👤 Members: ${membersCapacity.usedCount}/${membersCapacity.totalCapacity} (${membersCapacity.usagePercentage}%)`);
    console.log(`   باقیمانده: ${membersCapacity.remaining}`);
    if (membersCapacity.isNearLimit) {
      console.log('   ⚠️  نزدیک به حد maximum!');
    }
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
};

module.exports = {
  checkCapacityBeforeCreate,
  getCapacityStatus,
  checkTableCapacity,
  logCapacityStatus,
  USERS_ID_MIN,
  USERS_ID_MAX,
  USERS_CAPACITY,
  MEMBERS_ID_MIN,
  MEMBERS_ID_MAX,
  MEMBERS_CAPACITY
};
