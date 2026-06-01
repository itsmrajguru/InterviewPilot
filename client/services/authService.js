import api from "../api";

// Authentication routes

// Login — validates credentials and stores token on success directly
export async function loginUser(email, password) {
  const data = await api.post('auth/login', { email, password });
  if (data.accessToken) {
    localStorage.setItem("token", data.accessToken);
    if (data.user) { localStorage.setItem("user", JSON.stringify(data.user)); }
  }
  return data;
}

// Signup --> sends OTP to email and returns requiresOtp: true
export async function signupUser({ username, email, password, role }) {
  return api.post('auth/signup', { username, email, password, role });
}

// Verify Signup OTP-->marks user as verified on success
export async function verifySignupOtp(email, otp) {
  return api.post('auth/verify-otp', { email, otp });
}

export async function forgotPassword(email) {
  return api.post('auth/forgot-password', { email });
}
export async function resetPassword(token, password) {
  return api.post('auth/reset-password', { token, newPassword: password });
}
export async function changePassword(currentPassword, newPassword) {
  return api.post('auth/change-password', { currentPassword, newPassword });
}
export async function deleteAccount() {
  return api.delete('auth/delete-me');
}
export async function logoutUser() {
  return api.post('auth/logout');
}
