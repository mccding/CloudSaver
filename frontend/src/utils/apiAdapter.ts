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

  // 资源搜索API - 调用真实API并缓存结果
  async search(keyword: string, channelId?: string, lastMessageId?: string) {
    // 先检查缓存（仅在没有分页参数时）
    if (!channelId && !lastMessageId) {
      const cachedData = await this.database.getCachedResources(keyword);
      if (cachedData) {
        return {
          code: 0,
          data: cachedData,
          message: '从缓存获取'
        };
      }
    }

    // 调用真实API
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (channelId) params.append('channelId', channelId);
    if (lastMessageId) params.append('lastMessageId', lastMessageId);
    
    try {
      const response = await fetch(`/api/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // 缓存搜索结果（仅在没有分页参数时）
      if (result.code === 0 && result.data && !channelId && !lastMessageId) {
        await this.database.cacheResources(keyword, result.data);
      }
      
      return result;
    } catch (error) {
      console.error('搜索API调用失败:', error);
      throw new Error('搜索服务暂时不可用，请稍后重试');
    }
  }

  // 设置相关API - 数据存储在浏览器
  async getSettings() {
    const currentUser = this.getCurrentUser();
    
    // 如果没有登录用户，返回默认设置
    if (!currentUser) {
      const globalSettings = await this.database.getGlobalSettings();
      const defaultUserSettings = {
        cloud115Cookie: '',
        quarkCookie: ''
      };

      return {
        code: 0,
        data: {
          globalSetting: globalSettings,
          userSettings: defaultUserSettings
        },
        message: '获取成功'
      };
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
    
    // 保存全局设置（不需要登录）
    if (settings.globalSetting) {
      await this.database.saveGlobalSettings(settings.globalSetting);
    }
    
    // 保存用户设置（需要登录）
    if (settings.userSettings) {
      if (currentUser) {
        await this.database.saveUserSettings(currentUser.userId, settings.userSettings);
      } else {
        // 如果没有登录，保存到临时存储
        localStorage.setItem('temp_user_settings', JSON.stringify(settings.userSettings));
      }
    }

    return {
      code: 0,
      message: '保存成功'
    };
  }

  // 豆瓣相关API - 调用真实API并缓存
  async getDoubanHotList(params: any) {
    // 先检查缓存
    const cacheKey = `douban_hot_${JSON.stringify(params)}`;
    const cachedData = await this.database.getCachedData(cacheKey);
    if (cachedData) {
      return {
        code: 0,
        data: cachedData,
        message: '从缓存获取'
      };
    }

    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`/api/douban/hot?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`豆瓣API请求失败: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // 缓存结果
      if (result.code === 0 && result.data) {
        await this.database.cacheData(cacheKey, result.data, 30 * 60 * 1000); // 缓存30分钟
      }
      
      return result;
    } catch (error) {
      console.error('豆瓣API调用失败:', error);
      throw new Error('豆瓣服务暂时不可用，请稍后重试');
    }
  }

  // 网盘相关API - 调用真实API并缓存
  async getCloudShareInfo(cloudType: string, params: any) {
    // 先检查缓存
    const cacheKey = `${cloudType}_share_${JSON.stringify(params)}`;
    const cachedData = await this.database.getCachedData(cacheKey);
    if (cachedData) {
      return {
        code: 0,
        data: cachedData,
        message: '从缓存获取'
      };
    }

    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`/api/${cloudType}/share-info?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`${cloudType} API请求失败: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // 缓存结果
      if (result.code === 0 && result.data) {
        await this.database.cacheData(cacheKey, result.data, 60 * 60 * 1000); // 缓存1小时
      }
      
      return result;
    } catch (error) {
      console.error(`${cloudType} API调用失败:`, error);
      throw new Error(`${cloudType}服务暂时不可用，请稍后重试`);
    }
  }

  async getCloudFolders(cloudType: string, parentCid = '0') {
    // 先检查缓存
    const cacheKey = `${cloudType}_folders_${parentCid}`;
    const cachedData = await this.database.getCachedData(cacheKey);
    if (cachedData) {
      return {
        code: 0,
        data: cachedData,
        message: '从缓存获取'
      };
    }

    try {
      const response = await fetch(`/api/${cloudType}/folders?parentCid=${parentCid}`);
      
      if (!response.ok) {
        throw new Error(`${cloudType}文件夹API请求失败: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // 缓存结果
      if (result.code === 0 && result.data) {
        await this.database.cacheData(cacheKey, result.data, 30 * 60 * 1000); // 缓存30分钟
      }
      
      return result;
    } catch (error) {
      console.error(`${cloudType}文件夹API调用失败:`, error);
      throw new Error(`${cloudType}服务暂时不可用，请稍后重试`);
    }
  }

  async saveCloudFile(cloudType: string, params: any) {
    try {
      const response = await fetch(`/api/${cloudType}/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      });
      
      if (!response.ok) {
        throw new Error(`${cloudType}转存API请求失败: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`${cloudType}转存API调用失败:`, error);
      throw new Error(`${cloudType}转存服务暂时不可用，请稍后重试`);
    }
  }

  // 赞助者API - 调用真实API并缓存
  async getSponsors() {
    // 先检查缓存
    const cacheKey = 'sponsors';
    const cachedData = await this.database.getCachedData(cacheKey);
    if (cachedData) {
      return {
        code: 0,
        data: cachedData,
        message: '从缓存获取'
      };
    }

    try {
      const response = await fetch('/api/sponsors');
      
      if (!response.ok) {
        throw new Error(`赞助者API请求失败: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // 缓存结果
      if (result.code === 0 && result.data) {
        await this.database.cacheData(cacheKey, result.data, 60 * 60 * 1000); // 缓存1小时
      }
      
      return result;
    } catch (error) {
      console.error('赞助者API调用失败:', error);
      throw new Error('赞助者服务暂时不可用，请稍后重试');
    }
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