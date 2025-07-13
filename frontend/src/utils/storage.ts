// 浏览器存储管理工具
export class BrowserStorage {
  private static instance: BrowserStorage;
  private storage: Storage;

  constructor() {
    this.storage = localStorage;
  }

  static getInstance(): BrowserStorage {
    if (!BrowserStorage.instance) {
      BrowserStorage.instance = new BrowserStorage();
    }
    return BrowserStorage.instance;
  }

  // 设置数据
  set<T>(key: string, value: T, expireHours?: number): void {
    const data = {
      value,
      timestamp: Date.now(),
      expireHours: expireHours || 24, // 默认24小时过期
    };
    this.storage.setItem(key, JSON.stringify(data));
  }

  // 获取数据
  get<T>(key: string): T | null {
    const item = this.storage.getItem(key);
    if (!item) return null;

    try {
      const data = JSON.parse(item);
      const now = Date.now();
      const expireTime = data.timestamp + (data.expireHours * 60 * 60 * 1000);

      if (now > expireTime) {
        this.storage.removeItem(key);
        return null;
      }

      return data.value;
    } catch {
      return null;
    }
  }

  // 删除数据
  remove(key: string): void {
    this.storage.removeItem(key);
  }

  // 清空所有数据
  clear(): void {
    this.storage.clear();
  }

  // 检查是否存在
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  // 获取所有键
  keys(): string[] {
    return Object.keys(this.storage);
  }

  // 获取存储大小
  size(): number {
    return this.storage.length;
  }
}

// 缓存键常量
export const CACHE_KEYS = {
  // 用户相关
  USER_TOKEN: 'user_token',
  USER_INFO: 'user_info',
  USER_SETTINGS: 'user_settings',
  
  // 资源相关
  RESOURCE_LIST: 'resource_list',
  SEARCH_HISTORY: 'search_history',
  FAVORITE_RESOURCES: 'favorite_resources',
  
  // 网盘相关
  CLOUD115_COOKIE: 'cloud115_cookie',
  QUARK_COOKIE: 'quark_cookie',
  CLOUD_FOLDERS: 'cloud_folders',
  
  // 设置相关
  DISPLAY_STYLE: 'display_style',
  IMAGES_SOURCE: 'images_source',
  GLOBAL_SETTINGS: 'global_settings',
  
  // 豆瓣相关
  DOUBAN_HOT_LIST: 'douban_hot_list',
  
  // 其他
  LAST_UPDATE_TIME: 'last_update_time',
} as const;

// 导出单例实例
export const browserStorage = BrowserStorage.getInstance(); 