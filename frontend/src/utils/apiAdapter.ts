import { browserDatabase } from './browserDatabase';

// API适配器 - 数据存储在浏览器，但API调用保持在线
export class ApiAdapter {
  private static instance: ApiAdapter;
  private database = browserDatabase;

  static getInstance(): ApiAdapter {
    if (!ApiAdapter.instance) {
      ApiAdapter.instance = new ApiAdapter();
    }
    return ApiAdapter.instance;
  }

  constructor() {
    // 初始化时清理过期数据
    this.database.cleanup();
  }

  // 用户相关API - 数据存储在浏览器，但保持在线API调用
  async login(username: string, password: string) {
    // 先从浏览器数据库验证用户
    const user = await this.database.findUser(username);
    if (!user || user.password !== password) {
      throw new Error('用户名或密码错误');
    }

    // 生成token（实际项目中应该使用JWT）
    const token = `browser_token_${Date.now()}`;
    
    // 存储登录状态到浏览器
    localStorage.setItem('current_user', JSON.stringify({
      userId: user.userId,
      username: user.username,
      role: user.role,
      token
    }));

    return {
      code: 0,
      data: { token },
      message: '登录成功'
    };
  }

  async register(username: string, password: string, registerCode: string) {
    // 验证注册码
    const globalSettings = await this.database.getGlobalSettings();
    const validCodes = [globalSettings.AdminUserCode, globalSettings.CommonUserCode];
    
    if (!validCodes.includes(Number(registerCode))) {
      throw new Error('注册码错误');
    }

    // 创建用户到浏览器数据库
    const role = registerCode === globalSettings.AdminUserCode.toString() ? 1 : 0;
    const user = await this.database.createUser(username, password, role);

    return {
      code: 0,
      data: { username: user.username, role: user.role },
      message: '注册成功'
    };
  }

  // 资源搜索API - 调用真实API但缓存结果
  async search(keyword: string, channelId?: string, lastMessageId?: string) {
    // 先检查缓存
    const cachedData = await this.database.getCachedResources(keyword);
    if (cachedData && !channelId && !lastMessageId) {
      return {
        code: 0,
        data: cachedData,
        message: '从缓存获取'
      };
    }

    // 调用真实API
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (channelId) params.append('channelId', channelId);
    if (lastMessageId) params.append('lastMessageId', lastMessageId);
    
    try {
      const response = await fetch(`/api/search?${params.toString()}`);
      const result = await response.json();
      
      // 缓存搜索结果
      if (result.code === 0 && result.data && !channelId && !lastMessageId) {
        await this.database.cacheResources(keyword, result.data);
      }
      
      return result;
    } catch (error) {
      throw new Error('搜索失败，请检查网络连接');
    }
  }

  // 设置相关API - 数据存储在浏览器
  async getSettings() {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('请先登录');
    }

    const globalSettings = await this.database.getGlobalSettings();
    const userSettings = await this.database.getUserSettings(currentUser.userId);

    return {
      code: 0,
      data: {
        globalSetting: globalSettings,
        userSettings: userSettings
      },
      message: '获取成功'
    };
  }

  async saveSettings(settings: any) {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('请先登录');
    }

    if (settings.globalSetting) {
      await this.database.saveGlobalSettings(settings.globalSetting);
    }
    
    if (settings.userSettings) {
      await this.database.saveUserSettings(currentUser.userId, settings.userSettings);
    }

    return {
      code: 0,
      message: '保存成功'
    };
  }

  // 豆瓣相关API - 调用真实API
  async getDoubanHotList(params: any) {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`/api/douban/hot?${queryParams.toString()}`);
    return await response.json();
  }

  // 网盘相关API - 调用真实API
  async getCloudShareInfo(cloudType: string, params: any) {
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`/api/${cloudType}/share-info?${queryParams.toString()}`);
    return await response.json();
  }

  async getCloudFolders(cloudType: string, parentCid = '0') {
    const response = await fetch(`/api/${cloudType}/folders?parentCid=${parentCid}`);
    return await response.json();
  }

  async saveCloudFile(cloudType: string, params: any) {
    const response = await fetch(`/api/${cloudType}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    });
    
    return await response.json();
  }

  // 赞助者API - 调用真实API
  async getSponsors() {
    const response = await fetch('/api/sponsors');
    return await response.json();
  }

  // 获取当前用户
  private getCurrentUser() {
    const userStr = localStorage.getItem('current_user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // 获取当前模式（始终为在线模式）
  getMode() {
    return 'online';
  }
}

// 导出单例实例
export const apiAdapter = ApiAdapter.getInstance(); 