const db = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * تولید username یکتا از نام و نام خانوادگی
 */
const generateUsername = async (firstName, lastName) => {
  // تبدیل به حروف انگلیسی (transliteration ساده)
  const persianToEnglish = {
    'ا': 'a', 'آ': 'a', 'ب': 'b', 'پ': 'p', 'ت': 't', 'ث': 's', 'ج': 'j', 'چ': 'ch',
    'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'z', 'ر': 'r', 'ز': 'z', 'ژ': 'zh', 'س': 's',
    'ش': 'sh', 'ص': 's', 'ض': 'z', 'ط': 't', 'ظ': 'z', 'ع': 'a', 'غ': 'gh', 'ف': 'f',
    'ق': 'gh', 'ک': 'k', 'گ': 'g', 'ل': 'l', 'م': 'm', 'ن': 'n', 'و': 'v', 'ه': 'h',
    'ی': 'i', 'ئ': 'i', 'ة': 'e', ' ': '.'
  };

  const transliterate = (text) => {
    return text.split('').map(char => persianToEnglish[char] || char).join('');
  };

  let baseUsername = `${transliterate(firstName)}.${transliterate(lastName)}`.toLowerCase();
  let username = baseUsername;
  let counter = 1;

  // بررسی یکتا بودن username
  while (true) {
    const result = await db.query('SELECT id FROM members WHERE username = $1', [username]);
    if (result.rows.length === 0) {
      break;
    }
    username = `${baseUsername}${counter}`;
    counter++;
  }

  return username;
};

// GET all members
exports.getAllMembers = async (req, res) => {
  try {
    const { search, memberType, status } = req.query;
    const genderFilter = req.genderFilter; // از middleware

    let query = 'SELECT * FROM members WHERE 1=1';
    const params = [];
    let paramCount = 1;

    // فیلتر جنسیت (برای admin/user)
    if (genderFilter) {
      query += ` AND gender = $${paramCount}`;
      params.push(genderFilter);
      paramCount++;
    }

    if (search) {
      query += ` AND (first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR phone ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    if (memberType) {
      query += ` AND member_type = $${paramCount}`;
      params.push(memberType);
      paramCount++;
    }

    if (status) {
      query += ` AND subscription_status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await db.query(query, params);

    res.json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET single member
exports.getMemberById = async (req, res) => {
  try {
    const { id } = req.params;
    const genderFilter = req.genderFilter;

    let query = 'SELECT * FROM members WHERE id = $1';
    const params = [id];

    // فیلتر جنسیت (برای admin/user)
    if (genderFilter) {
      query += ' AND gender = $2';
      params.push(genderFilter);
    }

    const result = await db.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: genderFilter ? 'شما دسترسی به این عضو ندارید' : 'عضو یافت نشد'
      });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error fetching member:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// POST create member
exports.createMember = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      birthDate,
      memberType,
      membershipLevel,
      subscriptionStatus,
      gender,
      username: providedUsername
    } = req.body;

    // Validation
    if (!firstName || !lastName || !phone || !memberType || !membershipLevel) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields'
      });
    }

    // استفاده از username ارسال شده یا تولید خودکار
    let username;
    if (providedUsername) {
      // بررسی یکتا بودن username
      const existingUser = await db.query('SELECT id FROM members WHERE username = $1', [providedUsername]);
      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'این نام کاربری قبلاً استفاده شده است'
        });
      }
      username = providedUsername.toLowerCase();
    } else {
      // تولید خودکار اگر ارسال نشده
      username = await generateUsername(firstName, lastName);
    }

    // رمز عبور پیش‌فرض: 4 رقم آخر شماره تلفن
    const defaultPassword = phone.slice(-4);
    const hashedPassword = await bcrypt.hash(defaultPassword, 10);

    const result = await db.query(
      `INSERT INTO members 
       (first_name, last_name, phone, birth_date, member_type, membership_level, join_date, subscription_status, gender, username, password)
       VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, $7, $8, $9, $10)
       RETURNING *`,
      [firstName, lastName, phone, birthDate, memberType, membershipLevel, subscriptionStatus || 'فعال', gender || 'مرد', username, hashedPassword]
    );

    const member = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Member created successfully',
      data: member,
      credentials: {
        username: username,
        password: defaultPassword,
        note: 'رمز عبور پیش‌فرض 4 رقم آخر شماره تلفن است'
      }
    });
  } catch (error) {
    console.error('Error creating member:', error);
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({
        success: false,
        error: 'Phone number already exists'
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// PUT update member
exports.updateMember = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      firstName,
      lastName,
      phone,
      birthDate,
      memberType,
      membershipLevel,
      subscriptionStatus,
      gender
    } = req.body;

    const result = await db.query(
      `UPDATE members 
       SET first_name = $1, last_name = $2, phone = $3, birth_date = $4,
           member_type = $5, membership_level = $6, subscription_status = $7, gender = $8,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $9
       RETURNING *`,
      [firstName, lastName, phone, birthDate, memberType, membershipLevel, subscriptionStatus, gender, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }

    res.json({
      success: true,
      message: 'Member updated successfully',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating member:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE member
exports.deleteMember = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM members WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Member not found' });
    }

    const deletedMember = result.rows[0];

    res.json({
      success: true,
      message: 'Member deleted successfully',
      deletedMember: {
        firstName: deletedMember.first_name,
        lastName: deletedMember.last_name,
        id: deletedMember.id
      }
    });
  } catch (error) {
    console.error('Error deleting member:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET member statistics
exports.getMemberStats = async (req, res) => {
  try {
    const genderFilter = req.genderFilter;

    let query = `
      SELECT 
        COUNT(*) as total_members,
        COUNT(*) FILTER (WHERE subscription_status = 'فعال') as active_members,
        COUNT(*) FILTER (WHERE member_type = 'ورزشکار') as athletes,
        COUNT(*) FILTER (WHERE member_type = 'مربی') as coaches,
        COUNT(*) FILTER (WHERE member_type = 'پرسنل') as staff
      FROM members
    `;

    const params = [];

    // فیلتر جنسیت (برای admin/user)
    if (genderFilter) {
      query += ' WHERE gender = $1';
      params.push(genderFilter);
    }

    const stats = await db.query(query, params);

    res.json({ success: true, data: stats.rows[0] });
  } catch (error) {
    console.error('Error fetching member stats:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
