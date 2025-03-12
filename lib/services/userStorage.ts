export class UserStorageService {
  private static USER_KEY = "current_user";
  private static STORAGE_PREFIX = "user_data_";

  // Store current user info
  static setCurrentUser(user: { id: string; email: string }) {
    if (typeof window === "undefined") return;
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  // Get current user info
  static getCurrentUser() {
    if (typeof window === "undefined") return null;
    const user = localStorage.getItem(this.USER_KEY);
    return user ? JSON.parse(user) : null;
  }

  // Store data with user prefix
  static setUserData(key: string, value: any) {
    const user = this.getCurrentUser();
    if (!user) return;

    const prefixedKey = `${this.STORAGE_PREFIX}${user.id}_${key}`;
    localStorage.setItem(prefixedKey, JSON.stringify(value));
  }

  // Get data with user prefix
  static getUserData(key: string) {
    const user = this.getCurrentUser();
    if (!user) return null;

    const prefixedKey = `${this.STORAGE_PREFIX}${user.id}_${key}`;
    const data = localStorage.getItem(prefixedKey);
    return data ? JSON.parse(data) : null;
  }

  // Clear all data for current user
  static clearUserData() {
    const user = this.getCurrentUser();
    if (!user) return;

    const prefix = `${this.STORAGE_PREFIX}${user.id}_`;
    Object.keys(localStorage)
      .filter((key) => key.startsWith(prefix))
      .forEach((key) => localStorage.removeItem(key));

    localStorage.removeItem(this.USER_KEY);
  }
}
