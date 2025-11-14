// Transform member data from backend (snake_case) to frontend (camelCase)
export const transformMemberFromAPI = (member) => {
  if (!member) return null;

  return {
    id: member.id,
    firstName: member.first_name || member.firstName,
    lastName: member.last_name || member.lastName,
    phone: member.phone,
    birthDate: member.birth_date || member.birthDate,
    memberType: member.member_type || member.memberType,
    membershipLevel: member.membership_level || member.membershipLevel,
    joinDate: member.join_date || member.joinDate,
    subscriptionStatus: member.subscription_status || member.subscriptionStatus,
    username: member.username,
    gender: member.gender,
    createdAt: member.created_at || member.createdAt,
    updatedAt: member.updated_at || member.updatedAt,
  };
};

// Transform member data from frontend (camelCase) to backend (snake_case)
export const transformMemberToAPI = (member) => {
  return {
    firstName: member.firstName,
    lastName: member.lastName,
    phone: member.phone,
    birthDate: member.birthDate,
    memberType: member.memberType,
    membershipLevel: member.membershipLevel,
    subscriptionStatus: member.subscriptionStatus,
    username: member.username,
    gender: member.gender,
  };
};

// Transform transaction data from backend to frontend
export const transformTransactionFromAPI = (transaction) => {
  if (!transaction) return null;

  return {
    id: transaction.id,
    type: transaction.type,
    amount: transaction.amount,
    title: transaction.title,
    description: transaction.description,
    category: transaction.category,
    date: transaction.date,
    memberId: transaction.member_id || transaction.memberId,
    memberName: transaction.first_name && transaction.last_name
      ? `${transaction.first_name} ${transaction.last_name}`
      : null,
    createdAt: transaction.created_at || transaction.createdAt,
    updatedAt: transaction.updated_at || transaction.updatedAt,
  };
};

// Transform transaction data from frontend to backend
export const transformTransactionToAPI = (transaction) => {
  return {
    type: transaction.type,
    amount: Number(transaction.amount),
    title: transaction.title,
    description: transaction.description,
    category: transaction.category,
    date: transaction.date,
    memberId: transaction.memberId || null,
  };
};

// Transform attendance data from backend to frontend
export const transformAttendanceFromAPI = (attendance) => {
  if (!attendance) return null;

  // Transform records array to object format
  const records = {};
  if (attendance.records && Array.isArray(attendance.records)) {
    attendance.records.forEach(record => {
      if (record.member_id) {
        records[record.member_id] = {
          status: record.status,
          reason: record.reason || '',
        };
      }
    });
  }

  return {
    id: attendance.id,
    date: attendance.date,
    records: records,
    notes: attendance.notes || '',
    createdAt: attendance.created_at || attendance.createdAt,
    updatedAt: attendance.updated_at || attendance.updatedAt,
  };
};

// Transform attendance data from frontend to backend
export const transformAttendanceToAPI = (attendance) => {
  return {
    date: attendance.date,
    records: attendance.records,
    notes: attendance.notes || '',
  };
};
