const ACTION_ROLES = Object.freeze({
  create: ['admin'],
  read: ['admin'],
  approve: ['admin'],
  reject: ['admin'],
  cancel: ['admin'],
  addEvidence: ['admin'],
  markPaid: ['admin'],
});

function assertProjectExpensePermission(user, action) {
  const allowed = ACTION_ROLES[action] || [];
  if (!user || !allowed.includes(user.role)) {
    const error = new Error('Project Expense action is not authorized');
    error.status = 403;
    error.code = 'EXPENSE_FORBIDDEN';
    error.expose = true;
    throw error;
  }
}

module.exports = { assertProjectExpensePermission, ACTION_ROLES };
