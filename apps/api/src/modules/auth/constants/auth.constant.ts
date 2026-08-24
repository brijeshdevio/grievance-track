export const USER_SUCCESS_MSG = {
  REGISTER: 'Account created successfully.',
  LOGIN:
    'Login successful. You have been securely authenticated and can now access your account.',
  LOGOUT: 'Logout successful.',
  REFRESH_TOKEN: 'Token refreshed successfully',
} as const;

export const USER_ERROR_MSG = {
  CONFLICT_EMAIL: 'Email already registered, Try different email.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  ACCOUNT_NOT_ACTIVE:
    'Your account has been deactivated. Please contact the administrator for assistance.',
  NOT_FOUND: 'You are not logged in.',
  SESSION_EXPIRED: 'Session expired. Please login again.',
  INVALID_REFRESH_TOKEN: 'Invalid or expired refresh token.',
} as const;
