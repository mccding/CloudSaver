// 浏览器数据库模拟器 - 数据存储在浏览器，但API调用保持在线
export class BrowserDatabase {
  private static instance: BrowserDatabase;
  private storage: Storage;

  constructor() {
    this.storage = localStorage;
  }

  static getInstance(): BrowserDatabase {
    if (!BrowserDatabase.instance) {
      BrowserDatabase.instance = new BrowserDatabase();
    }
    return BrowserDatabase.instance;
  }

  // 用户管理
  async createUser(username: string, password: string, role: number) {
    const users = this.getUsers();
    const existingUser = users.find((u: any) => u.username === username);
    if (existingUser) {
      throw new Error('用户名已存在');
    }
    
    const newUser = {
      userId: Date.now().toString(),
      username,
      password, // 实际项目中应该加密
      role,
      createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    this.storage.setItem('users', JSON.stringify(users));
    return newUser;
  }

  async findUser(username: string) {
    const users = this.getUsers();
    return users.find((u: any) => u.username === username);
  }

  private getUsers() {
    const usersStr = this.storage.getItem('users');
    return usersStr ? JSON.parse(usersStr) : [];
  }

  // 设置管理
  async getGlobalSettings() {
    const settings = this.storage.getItem('global_settings');
    if (settings) {
      return JSON.parse(settings);
    }
    
    // 默认设置
    const defaultSettings = {
      httpProxyHost: '127.0.0.1',
      httpProxyPort: 7890,
      isProxyEnabled: false,
      AdminUserCode: 230713,
      CommonUserCode: 9527
    };
    
    this.storage.setItem('global_settings', JSON.stringify(defaultSettings));
    return defaultSettings;
  }

  async saveGlobalSettings(settings: any) {
    this.storage.setItem('global_settings', JSON.stringify(settings));
  }

  async getUserSettings(userId: string) {
    const settings = this.storage.getItem(`user_settings_${userId}`);
    if (settings) {
      return JSON.parse(settings);
    }
    
    // 默认用户设置
    const defaultSettings = {
      cloud115Cookie: '',
      quarkCookie: ''
    };
    
    this.storage.setItem(`user_settings_${userId}`, JSON.stringify(defaultSettings));
    return defaultSettings;
  }

  async saveUserSettings(userId: string, settings: any) {
    this.storage.setItem(`user_settings_${userId}`, JSON.stringify(settings));
  }

  // 资源缓存
  async cacheResources(keyword: string, resources: any[]) {
    const cacheKey = `resource_cache_${keyword}`;
    const cacheData = {
      data: resources,
      timestamp: Date.now(),
      keyword
    };
    this.storage.setItem(cacheKey, JSON.stringify(cacheData));
  }

  async getCachedResources(keyword: string) {
    const cacheKey = `resource_cache_${keyword}`;
    const cacheStr = this.storage.getItem(cacheKey);
    if (!cacheStr) return null;
    
    const cacheData = JSON.parse(cacheStr);
    const now = Date.now();
    const cacheAge = now - cacheData.timestamp;
    const maxAge = 30 * 60 * 1000; // 30分钟缓存
    
    if (cacheAge > maxAge) {
      this.storage.removeItem(cacheKey);
      return null;
    }
    
    return cacheData.data;
  }

  // 搜索历史
  async addSearchHistory(keyword: string, userId: string) {
    const historyKey = `search_history_${userId}`;
    const history = this.getSearchHistory(userId);
    
    // 避免重复
    if (!history.includes(keyword)) {
      history.unshift(keyword);
      // 只保留最近20条
      if (history.length > 20) {
        history.splice(20);
      }
      this.storage.setItem(historyKey, JSON.stringify(history));
    }
  }

  getSearchHistory(userId: string): string[] {
    const historyKey = `search_history_${userId}`;
    const historyStr = this.storage.getItem(historyKey);
    return historyStr ? JSON.parse(historyStr) : [];
  }

  // 收藏资源
  async addFavorite(resource: any, userId: string) {
    const favoritesKey = `favorites_${userId}`;
    const favorites = this.getFavorites(userId);
    
    const existingIndex = favorites.findIndex(f => f.id === resource.id);
    if (existingIndex === -1) {
      favorites.push({
        ...resource,
        addedAt: new Date().toISOString()
      });
      this.storage.setItem(favoritesKey, JSON.stringify(favorites));
    }
  }

  async removeFavorite(resourceId: string, userId: string) {
    const favoritesKey = `favorites_${userId}`;
    const favorites = this.getFavorites(userId);
    const filtered = favorites.filter(f => f.id !== resourceId);
    this.storage.setItem(favoritesKey, JSON.stringify(filtered));
  }

  getFavorites(userId: string): any[] {
    const favoritesKey = `favorites_${userId}`;
    const favoritesStr = this.storage.getItem(favoritesKey);
    return favoritesStr ? JSON.parse(favoritesStr) : [];
  }

  // 清理过期数据
  async cleanup() {
    const keys = Object.keys(this.storage);
    const now = Date.now();
    
    keys.forEach(key => {
      if (key.startsWith('resource_cache_')) {
        const dataStr = this.storage.getItem(key);
        if (dataStr) {
          const data = JSON.parse(dataStr);
          const age = now - data.timestamp;
          if (age > 60 * 60 * 1000) { // 1小时过期
            this.storage.removeItem(key);
          }
        }
      }
    });
  }
}

// 导出单例实例
export const browserDatabase = BrowserDatabase.getInstance(); 