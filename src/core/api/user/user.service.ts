import { userEndpoints } from "./userEndpoints";
import { User, Photo } from "./types/user.interface";

function getAuthHeaders(): Record<string, string> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export class UserService {
  static async getAllUsers() {
    const res = await fetch(userEndpoints.getAllUsers, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch users");
    return res.json();
  }

  static async getUserById(id: string) {
    const url = userEndpoints.getUserById.replace("{id}", id);
    const res = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch user");
    return res.json();
  }

  // Fetch user by username (public fields only)
  static async getUserByUsername(username: string) {
    const url = userEndpoints.getUsername.replace("{username}", username);
    const res = await fetch(url, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to fetch user by username");
    return res.json();
  }

  static async updateUser(id: string, payload: User) {
    const url = userEndpoints.updateUser.replace("{id}", id);
    const res = await fetch(url, {
      method: "PUT",
      headers: { ...getAuthHeaders(), "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error("Failed to update user");
    return res.json();
  }

  static async deleteUser(id: string) {
    const url = userEndpoints.deleteUser.replace("{id}", id);
    const res = await fetch(url, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error("Failed to delete user");
    return res.json();
  }

  static async getCurrentUser() {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) throw new Error("No token present");
    const res = await fetch(userEndpoints.getUser, {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Failed to fetch current user");
    return res.json();
  }

  static async uploadAvatar(userId: string, file: File): Promise<{ avatar: string; user: User }> {
    const url = userEndpoints.uploadAvatar.replace("{id}", userId);
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(), // Cannot include Content-Type with FormData
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload avatar");
    return res.json();
  }

  static async uploadCover(userId: string, file: File): Promise<{ cover: string; user: User }> {
    const url = userEndpoints.uploadCover.replace("{id}", userId);
    const formData = new FormData();
    formData.append("image", file);
    const res = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(), // Cannot include Content-Type with FormData
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload cover");
    return res.json();
  }

  static async uploadPhoto(userId: string, file: File, caption?: string): Promise<{ photo: Photo }> {
    const url = userEndpoints.uploadPhoto.replace("{id}", userId);
    const formData = new FormData();
    formData.append("image", file);
    if (caption) formData.append("caption", caption);
    const res = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(), // Cannot include Content-Type with FormData
      body: formData,
    });
    if (!res.ok) throw new Error("Failed to upload photo");
    return res.json();
  }
}
