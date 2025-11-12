const db = require('../config/database');
const { detectDevice, detectBrowser, detectOS } = require('../utils/deviceDetector');

// GET /api/activity-logs - Get all activity logs with filters
exports.getActivityLogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            action,
            entityType,
            username,
            startDate,
            endDate
        } = req.query;

        const offset = (page - 1) * limit;
        let whereConditions = [];
        let queryParams = [];
        let paramIndex = 1;

        // Build WHERE conditions
        if (action) {
            whereConditions.push(`action = $${paramIndex}`);
            queryParams.push(action);
            paramIndex++;
        }

        if (entityType) {
            whereConditions.push(`entity_type = $${paramIndex}`);
            queryParams.push(entityType);
            paramIndex++;
        }

        if (username) {
            whereConditions.push(`username ILIKE $${paramIndex}`);
            queryParams.push(`%${username}%`);
            paramIndex++;
        }

        if (startDate) {
            whereConditions.push(`created_at >= $${paramIndex}`);
            queryParams.push(startDate);
            paramIndex++;
        }

        if (endDate) {
            whereConditions.push(`created_at <= $${paramIndex}`);
            queryParams.push(endDate);
            paramIndex++;
        }

        const whereClause = whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

        // Get total count
        const countResult = await db.query(
            `SELECT COUNT(*) FROM activity_logs ${whereClause}`,
            queryParams
        );
        const totalCount = parseInt(countResult.rows[0].count);

        // Get logs
        const logsResult = await db.query(
            `SELECT 
        id,
        user_id,
        username,
        action,
        entity_type,
        entity_id,
        description,
        ip_address,
        user_agent,
        created_at
      FROM activity_logs
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`,
            [...queryParams, limit, offset]
        );

        // اضافه کردن اطلاعات دستگاه به هر لاگ
        const logsWithDeviceInfo = logsResult.rows.map(log => ({
            ...log,
            device: detectDevice(log.user_agent),
            browser: detectBrowser(log.user_agent),
            os: detectOS(log.user_agent)
        }));

        res.json({
            success: true,
            data: logsWithDeviceInfo,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: totalCount,
                totalPages: Math.ceil(totalCount / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching activity logs:', error);
        res.status(500).json({
            success: false,
            error: 'خطا در دریافت لاگ‌ها'
        });
    }
};

// GET /api/activity-logs/stats - Get activity statistics
exports.getActivityStats = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let whereConditions = [];
        let queryParams = [];
        let paramIndex = 1;

        if (startDate) {
            whereConditions.push(`created_at >= $${paramIndex}`);
            queryParams.push(startDate);
            paramIndex++;
        }

        if (endDate) {
            whereConditions.push(`created_at <= $${paramIndex}`);
            queryParams.push(endDate);
            paramIndex++;
        }

        const whereClause = whereConditions.length > 0
            ? `WHERE ${whereConditions.join(' AND ')}`
            : '';

        // Get stats by action
        const actionStatsResult = await db.query(
            `SELECT 
        action,
        COUNT(*) as count
      FROM activity_logs
      ${whereClause}
      GROUP BY action
      ORDER BY count DESC`,
            queryParams
        );

        // Get stats by entity type
        const entityStatsResult = await db.query(
            `SELECT 
        entity_type,
        COUNT(*) as count
      FROM activity_logs
      ${whereClause}
      GROUP BY entity_type
      ORDER BY count DESC`,
            queryParams
        );

        // Get stats by user
        const userStatsResult = await db.query(
            `SELECT 
        username,
        COUNT(*) as count
      FROM activity_logs
      ${whereClause}
      GROUP BY username
      ORDER BY count DESC
      LIMIT 10`,
            queryParams
        );

        // Get recent activity (last 24 hours)
        const recentActivityResult = await db.query(
            `SELECT COUNT(*) as count
      FROM activity_logs
      WHERE created_at >= NOW() - INTERVAL '24 hours'`
        );

        res.json({
            success: true,
            data: {
                byAction: actionStatsResult.rows,
                byEntityType: entityStatsResult.rows,
                byUser: userStatsResult.rows,
                recentActivity: parseInt(recentActivityResult.rows[0].count)
            }
        });

    } catch (error) {
        console.error('Error fetching activity stats:', error);
        res.status(500).json({
            success: false,
            error: 'خطا در دریافت آمار لاگ‌ها'
        });
    }
};

// DELETE /api/activity-logs/clear - Clear old logs
exports.clearOldLogs = async (req, res) => {
    try {
        const { days = 90 } = req.body;

        const result = await db.query(
            `DELETE FROM activity_logs 
       WHERE created_at < NOW() - INTERVAL '${days} days'
       RETURNING id`
        );

        res.json({
            success: true,
            message: `${result.rowCount} لاگ قدیمی حذف شد`,
            deletedCount: result.rowCount
        });

    } catch (error) {
        console.error('Error clearing old logs:', error);
        res.status(500).json({
            success: false,
            error: 'خطا در حذف لاگ‌های قدیمی'
        });
    }
};
