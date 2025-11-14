const db = require('../config/database');

/**
 * دریافت داشبورد ورزشکار
 * شامل: اطلاعات شخصی، حضور و غیاب، تراکنش‌های مالی
 */
exports.getAthleteDashboard = async (req, res) => {
    try {
        const memberId = req.user.id;

        // دریافت اطلاعات عضو
        const memberResult = await db.query(
            `SELECT id, first_name, last_name, phone, birth_date, member_type, 
              membership_level, join_date, subscription_status
       FROM members WHERE id = $1`,
            [memberId]
        );

        if (memberResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'عضو یافت نشد'
            });
        }

        const member = memberResult.rows[0];

        // دریافت آمار حضور و غیاب (30 روز اخیر)
        const attendanceStats = await db.query(
            `SELECT 
        COUNT(*) as total_days,
        COUNT(*) FILTER (WHERE status = 'حاضر') as present_days,
        COUNT(*) FILTER (WHERE status = 'غایب') as absent_days,
        COUNT(*) FILTER (WHERE status = 'مرخصی') as leave_days
       FROM attendance_records ar
       JOIN attendance a ON ar.attendance_id = a.id
       WHERE ar.member_id = $1 
       AND a.date >= CURRENT_DATE - INTERVAL '30 days'`,
            [memberId]
        );

        // دریافت آخرین حضور و غیاب‌ها (10 روز اخیر)
        const recentAttendance = await db.query(
            `SELECT a.date, ar.status, ar.reason
       FROM attendance_records ar
       JOIN attendance a ON ar.attendance_id = a.id
       WHERE ar.member_id = $1
       ORDER BY a.date DESC
       LIMIT 10`,
            [memberId]
        );

        // دریافت تراکنش‌های مالی (6 ماه اخیر)
        const transactions = await db.query(
            `SELECT id, type, amount, title, description, category, date
       FROM transactions
       WHERE member_id = $1 
       AND date >= CURRENT_DATE - INTERVAL '6 months'
       ORDER BY date DESC`,
            [memberId]
        );

        // محاسبه مجموع پرداخت‌ها
        const totalPaid = transactions.rows
            .filter(t => t.type === 'درآمد')
            .reduce((sum, t) => sum + parseInt(t.amount), 0);

        res.status(200).json({
            success: true,
            data: {
                member,
                attendance: {
                    stats: attendanceStats.rows[0],
                    recent: recentAttendance.rows
                },
                financial: {
                    transactions: transactions.rows,
                    totalPaid
                }
            }
        });
    } catch (error) {
        console.error('Error in getAthleteDashboard:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور - لطفاً دوباره تلاش کنید'
        });
    }
};

/**
 * دریافت داشبورد مربی
 * شامل: اطلاعات شخصی، لیست ورزشکاران، آمار کلی
 */
exports.getCoachDashboard = async (req, res) => {
    try {
        const memberId = req.user.id;

        // دریافت اطلاعات مربی
        const coachResult = await db.query(
            `SELECT id, first_name, last_name, phone, birth_date, member_type, 
              membership_level, join_date, subscription_status
       FROM members WHERE id = $1`,
            [memberId]
        );

        if (coachResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'مربی یافت نشد'
            });
        }

        const coach = coachResult.rows[0];

        // دریافت لیست تمام ورزشکاران فعال
        const athletes = await db.query(
            `SELECT id, first_name, last_name, phone, membership_level, 
              subscription_status, join_date
       FROM members 
       WHERE member_type = 'ورزشکار'
       ORDER BY first_name, last_name`
        );

        // آمار کلی ورزشکاران
        const athleteStats = await db.query(
            `SELECT 
        COUNT(*) as total_athletes,
        COUNT(*) FILTER (WHERE subscription_status = 'فعال') as active_athletes,
        COUNT(*) FILTER (WHERE subscription_status = 'غیرفعال') as inactive_athletes
       FROM members 
       WHERE member_type = 'ورزشکار'`
        );

        // آمار حضور و غیاب امروز
        const todayAttendance = await db.query(
            `SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE ar.status = 'حاضر') as present,
        COUNT(*) FILTER (WHERE ar.status = 'غایب') as absent
       FROM attendance_records ar
       JOIN attendance a ON ar.attendance_id = a.id
       JOIN members m ON ar.member_id = m.id
       WHERE a.date = CURRENT_DATE 
       AND m.member_type = 'ورزشکار'`
        );

        res.status(200).json({
            success: true,
            data: {
                coach,
                athletes: athletes.rows,
                stats: {
                    ...athleteStats.rows[0],
                    todayAttendance: todayAttendance.rows[0]
                }
            }
        });
    } catch (error) {
        console.error('Error in getCoachDashboard:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور - لطفاً دوباره تلاش کنید'
        });
    }
};

/**
 * دریافت جزئیات یک ورزشکار (فقط برای مربیان)
 */
exports.getAthleteDetails = async (req, res) => {
    try {
        const athleteId = req.params.id;

        // دریافت اطلاعات ورزشکار
        const athleteResult = await db.query(
            `SELECT id, first_name, last_name, phone, birth_date, member_type, 
              membership_level, join_date, subscription_status
       FROM members 
       WHERE id = $1 AND member_type = 'ورزشکار'`,
            [athleteId]
        );

        if (athleteResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                error: 'ورزشکار یافت نشد'
            });
        }

        const athlete = athleteResult.rows[0];

        // دریافت آمار حضور و غیاب (30 روز اخیر)
        const attendanceStats = await db.query(
            `SELECT 
        COUNT(*) as total_days,
        COUNT(*) FILTER (WHERE status = 'حاضر') as present_days,
        COUNT(*) FILTER (WHERE status = 'غایب') as absent_days,
        COUNT(*) FILTER (WHERE status = 'مرخصی') as leave_days
       FROM attendance_records ar
       JOIN attendance a ON ar.attendance_id = a.id
       WHERE ar.member_id = $1 
       AND a.date >= CURRENT_DATE - INTERVAL '30 days'`,
            [athleteId]
        );

        // دریافت آخرین حضور و غیاب‌ها
        const recentAttendance = await db.query(
            `SELECT a.date, ar.status, ar.reason
       FROM attendance_records ar
       JOIN attendance a ON ar.attendance_id = a.id
       WHERE ar.member_id = $1
       ORDER BY a.date DESC
       LIMIT 15`,
            [athleteId]
        );

        res.status(200).json({
            success: true,
            data: {
                athlete,
                attendance: {
                    stats: attendanceStats.rows[0],
                    recent: recentAttendance.rows
                }
            }
        });
    } catch (error) {
        console.error('Error in getAthleteDetails:', error);
        res.status(500).json({
            success: false,
            error: 'خطای سرور - لطفاً دوباره تلاش کنید'
        });
    }
};
