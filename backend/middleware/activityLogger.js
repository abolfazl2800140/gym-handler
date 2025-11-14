const db = require('../config/database');

// Helper to log activity
const logActivity = async (data) => {
    try {
        await db.query(
            `INSERT INTO activity_logs 
       (user_id, username, action, entity_type, entity_id, description, ip_address, user_agent) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                data.userId || null,
                data.username || 'سیستم',
                data.action,
                data.entityType,
                data.entityId || null,
                data.description,
                data.ipAddress || null,
                data.userAgent || null
            ]
        );
    } catch (error) {
        console.error('❌ Error logging activity:', error);
    }
};

// Middleware to automatically log API requests
const activityLoggerMiddleware = (req, res, next) => {
    // Store original methods
    const originalJson = res.json;
    const originalSend = res.send;

    // Flag to prevent duplicate logging
    let logged = false;

    // Override res.json
    res.json = function (data) {
        // Log successful operations (only once)
        if (!logged && res.statusCode >= 200 && res.statusCode < 300) {
            logged = true;
            logActivityFromRequest(req, res, data);
        }
        return originalJson.call(this, data);
    };

    // Override res.send
    res.send = function (data) {
        // Log successful operations (only once)
        if (!logged && res.statusCode >= 200 && res.statusCode < 300) {
            logged = true;
            logActivityFromRequest(req, res, data);
        }
        return originalSend.call(this, data);
    };

    next();
};

// Helper to determine action and description from request
const logActivityFromRequest = (req, res, responseData) => {
    const method = req.method;
    const path = req.originalUrl || req.url; // استفاده از originalUrl برای دریافت مسیر کامل
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('user-agent');

    // Debug log
    console.log(`🔍 Activity Logger: ${method} ${path}`);

    let action = '';
    let entityType = '';
    let entityId = null;
    let description = '';

    // Members
    if (path.includes('/members')) {
        entityType = 'عضو';
        if (method === 'POST') {
            action = 'ایجاد';
            const member = req.body;
            description = `عضو جدید ثبت شد: ${member.firstName} ${member.lastName}`;
            entityId = responseData?.data?.id;
        } else if (method === 'PUT') {
            action = 'ویرایش';
            const memberId = req.params.id;
            const member = req.body;
            description = `اطلاعات عضو ویرایش شد: ${member.firstName} ${member.lastName}`;
            entityId = parseInt(memberId);
        } else if (method === 'DELETE') {
            action = 'حذف';
            const memberId = req.params.id;
            const deletedMember = responseData?.deletedMember;
            if (deletedMember) {
                description = `عضو "${deletedMember.firstName} ${deletedMember.lastName}" حذف شد`;
            } else {
                description = `عضو حذف شد (ID: ${memberId})`;
            }
            entityId = parseInt(memberId);
        } else {
            return; // Don't log GET requests
        }
    }

    // Transactions
    else if (path.includes('/transactions')) {
        entityType = 'تراکنش';
        if (method === 'POST') {
            action = 'ایجاد';
            const transaction = req.body;
            description = `تراکنش جدید: ${transaction.type} - ${transaction.title} (${parseInt(transaction.amount).toLocaleString('fa-IR')} تومان)`;
            entityId = responseData?.data?.id;
        } else if (method === 'PUT') {
            action = 'ویرایش';
            const transactionId = req.params.id;
            const transaction = req.body;
            description = `تراکنش ویرایش شد: ${transaction.title}`;
            entityId = parseInt(transactionId);
        } else if (method === 'DELETE') {
            action = 'حذف';
            const transactionId = req.params.id;
            const deletedTransaction = responseData?.deletedTransaction;
            if (deletedTransaction) {
                description = `تراکنش "${deletedTransaction.title}" حذف شد (${deletedTransaction.type} - ${parseInt(deletedTransaction.amount).toLocaleString('fa-IR')} تومان)`;
            } else {
                description = `تراکنش حذف شد (ID: ${transactionId})`;
            }
            entityId = parseInt(transactionId);
        } else {
            return;
        }
    }

    // Attendance
    else if (path.includes('/attendance')) {
        entityType = 'حضور و غیاب';
        if (method === 'POST') {
            action = 'ثبت';
            const attendance = req.body;
            description = `حضور و غیاب ثبت شد برای تاریخ: ${attendance.date}`;
            entityId = responseData?.data?.id;
        } else if (method === 'DELETE') {
            action = 'حذف';
            const date = req.params.date;
            description = `حضور و غیاب حذف شد برای تاریخ: ${date}`;
        } else {
            return;
        }
    }

    // Users (مدیریت کاربران)
    else if (path.includes('/users') && !path.includes('/users/') && !path.includes('change-password')) {
        entityType = 'کاربر';
        if (method === 'POST') {
            action = 'ایجاد';
            const user = req.body;
            description = `کاربر جدید ایجاد شد: ${user.username} (${user.email}) - نقش: ${user.role === 'super_admin' ? 'مدیر ارشد' : user.role === 'admin' ? 'مدیر' : 'کاربر'}`;
            entityId = responseData?.data?.id;
        } else {
            return;
        }
    }

    // User Update/Delete
    else if (path.match(/\/users\/\d+$/) && method !== 'GET') {
        entityType = 'کاربر';
        const userId = req.params.id;

        if (method === 'PUT') {
            action = 'ویرایش';
            const user = req.body;
            description = `اطلاعات کاربر ویرایش شد: ${user.username || 'نامشخص'}`;
            entityId = parseInt(userId);
        } else if (method === 'DELETE') {
            action = 'حذف';
            const deletedUser = responseData?.deletedUser;
            if (deletedUser) {
                const roleText = deletedUser.role === 'super_admin' ? 'مدیر ارشد' : deletedUser.role === 'admin' ? 'مدیر' : 'کاربر';
                description = `کاربر "${deletedUser.username}" (${roleText}) حذف شد`;
            } else {
                description = `کاربر حذف شد (ID: ${userId})`;
            }
            entityId = parseInt(userId);
        }
    }

    // Change Password
    else if (path.includes('change-password')) {
        entityType = 'کاربر';
        action = 'تغییر رمز';
        const userId = req.params.id;
        const isOwnPassword = req.user?.id === parseInt(userId);
        description = isOwnPassword
            ? `رمز عبور خود را تغییر داد`
            : `رمز عبور کاربر (ID: ${userId}) را تغییر داد`;
        entityId = parseInt(userId);
    }

    // Toggle User Status
    else if (path.includes('toggle-status')) {
        entityType = 'کاربر';
        action = 'تغییر وضعیت';
        const userId = req.params.id;
        const newStatus = responseData?.is_active ? 'فعال' : 'غیرفعال';
        description = `وضعیت کاربر (ID: ${userId}) به ${newStatus} تغییر کرد`;
        entityId = parseInt(userId);
    }

    // Plans (مدیریت پلن‌ها)
    else if (path.includes('/plans') && !path.includes('/plans/active')) {
        entityType = 'پلن';
        const planId = req.params.id;

        if (method === 'POST') {
            action = 'ایجاد';
            const plan = req.body;
            description = `پلن جدید ایجاد شد: ${plan.name} (${plan.duration_days} روز - ${parseInt(plan.price).toLocaleString('fa-IR')} تومان)`;
            entityId = responseData?.data?.id;
        } else if (method === 'PUT') {
            action = 'ویرایش';
            const plan = req.body;
            description = `پلن ویرایش شد: ${plan.name}`;
            entityId = parseInt(planId);
        } else if (method === 'PATCH' && path.includes('toggle')) {
            action = 'تغییر وضعیت';
            const newStatus = responseData?.data?.is_active ? 'فعال' : 'غیرفعال';
            const planName = responseData?.data?.name || 'نامشخص';
            description = `وضعیت پلن "${planName}" به ${newStatus} تغییر کرد`;
            entityId = parseInt(planId);
        } else {
            return;
        }
    }

    // AI Assistant
    else if (path.includes('/ai/ask')) {
        entityType = 'دستیار هوش مصنوعی';
        action = 'سوال';
        const question = req.body.question;
        description = `سوال از دستیار هوش مصنوعی: ${question.substring(0, 50)}${question.length > 50 ? '...' : ''}`;
    }

    else {
        return; // Don't log other requests
    }

    // Log the activity
    if (action && entityType && description) {
        logActivity({
            userId: req.user?.id,
            username: req.user?.username || 'مهمان',
            action,
            entityType,
            entityId,
            description,
            ipAddress,
            userAgent
        });
    }
};

// Export both middleware and helper function
module.exports = {
    activityLoggerMiddleware,
    logActivity
};
