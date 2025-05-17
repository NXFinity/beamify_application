const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3021';
const API_BASE_VER = process.env.NEXT_PUBLIC_API_BASE_VERSION || 'v1';

export const authEndpoints = {
    login: `${API_BASE_URL}/${API_BASE_VER}/auth/login`,
    register: `${API_BASE_URL}/${API_BASE_VER}/auth/register`,
    verify: `${API_BASE_URL}/${API_BASE_VER}/auth/verify`,
    forgot: `${API_BASE_URL}/${API_BASE_VER}/auth/forgot`,
    reset: `${API_BASE_URL}/${API_BASE_VER}/auth/reset`,
    resend: `${API_BASE_URL}/${API_BASE_VER}/auth/resend`,
    logout: `${API_BASE_URL}/${API_BASE_VER}/auth/logout`,
    changePassword: `${API_BASE_URL}/${API_BASE_VER}/auth/change-password`,
    currentUser: `${API_BASE_URL}/${API_BASE_VER}/auth/me`,
    resetVerification: `${API_BASE_URL}/${API_BASE_VER}/auth/resetVerification`,
    initAdmin: `${API_BASE_URL}/${API_BASE_VER}/auth/init-admin`,
}
