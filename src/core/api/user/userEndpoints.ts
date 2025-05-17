const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3021';
const API_BASE_VER = process.env.NEXT_PUBLIC_API_BASE_VERSION || 'v1';

export const userEndpoints = {
    getAllUsers: `${API_BASE_URL}/${API_BASE_VER}/users`,
    getUserById: `${API_BASE_URL}/${API_BASE_VER}/users/{id}`,
    getUsername: `${API_BASE_URL}/${API_BASE_VER}/users/username/{username}`,
    updateUser: `${API_BASE_URL}/${API_BASE_VER}/users/{id}`,  // Requires Authentication Header and Logged in user
    deleteUser: `${API_BASE_URL}/${API_BASE_VER}/users/{id}`,  // Requires Authentication Header and Logged in user
    getUser: `${API_BASE_URL}/${API_BASE_VER}/users/me`,  // Requires Authentication Header and Logged in user
    uploadAvatar: `${API_BASE_URL}/${API_BASE_VER}/users/{id}/avatar`,
    uploadCover: `${API_BASE_URL}/${API_BASE_VER}/users/{id}/cover`,
    uploadPhoto: `${API_BASE_URL}/${API_BASE_VER}/users/{id}/photos`,
}
