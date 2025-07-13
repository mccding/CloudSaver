import { offlineApi } from './offlineApi';

// API适配器 - 用于在静态部署时自动切换到离线模式
export class ApiAdapter {
  private static instance: ApiAdapter;
  private isOfflineMode: boolean = false;

  static getInstance(): ApiAdapter {
    if (!ApiAdapter.instance) {
      ApiAdapter.instance = new ApiAdapter();
    }
    return ApiAdapter.instance;
  }

  constructor() {
    // 检测是否为静态部署模式
    this.detectOfflineMode();
  }

  private detectOfflineMode() {
    // 检查是否有后端API可用
    const checkApiAvailability = async () => {
      try {
        const response = await fetch('/api/setting/get', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          // 设置较短的超时时间
          signal: AbortSignal.timeout(3000)
        });
        
        if (!response.ok) {
          throw new Error('API不可用');
        }
        
        this.isOfflineMode = false;
      } catch (error) {
        console.log('检测到离线模式，切换到本地缓存');
        this.isOfflineMode = true;
      }
    };

    // 异步检测API可用性
    checkApiAvailability();
  }

  // 用户相关API
  async login(username: string, password: string) {
    if (this.isOfflineMode) {
      return await offlineApi.login(username, password);
    }
    
    // 在线模式 - 使用真实API
    const response = await fetch('/api/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password })
    });
    
    return await response.json();
  }

  async register(username: string, password: string, registerCode: string) {
    if (this.isOfflineMode) {
      return await offlineApi.register(username, password, registerCode);
    }
    
    const response = await fetch('/api/user/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, registerCode })
    });
    
    return await response.json();
  }

  // 资源搜索API
  async search(keyword: string, channelId?: string, lastMessageId?: string) {
    if (this.isOfflineMode) {
      return await offlineApi.search(keyword, channelId, lastMessageId);
    }
    
    const params = new URLSearchParams();
    if (keyword) params.append('keyword', keyword);
    if (channelId) params.append('channelId', channelId);
    if (lastMessageId) params.append('lastMessageId', lastMessageId);
    
    const response = await fetch(`/api/search?${params.toString()}`);
    return await response.json();
  }

  // 设置相关API
  async getSettings() {
    if (this.isOfflineMode) {
      return await offlineApi.getSettings();
    }
    
    const response = await fetch('/api/setting/get');
    return await response.json();
  }

  async saveSettings(settings: any) {
    if (this.isOfflineMode) {
      return await offlineApi.saveSettings(settings);
    }
    
    const response = await fetch('/api/setting/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(settings)
    });
    
    return await response.json();
  }

  // 豆瓣相关API
  async getDoubanHotList(params: any) {
    if (this.isOfflineMode) {
      return await offlineApi.getDoubanHotList(params);
    }
    
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`/api/douban/hot?${queryParams.toString()}`);
    return await response.json();
  }

  // 网盘相关API
  async getCloudShareInfo(cloudType: string, params: any) {
    if (this.isOfflineMode) {
      return await offlineApi.getCloudShareInfo(params);
    }
    
    const queryParams = new URLSearchParams(params);
    const response = await fetch(`/api/${cloudType}/share-info?${queryParams.toString()}`);
    return await response.json();
  }

  async getCloudFolders(cloudType: string, parentCid = '0') {
    if (this.isOfflineMode) {
      return await offlineApi.getCloudFolders(parentCid);
    }
    
    const response = await fetch(`/api/${cloudType}/folders?parentCid=${parentCid}`);
    return await response.json();
  }

  async saveCloudFile(cloudType: string, params: any) {
    if (this.isOfflineMode) {
      return await offlineApi.saveCloudFile(params);
    }
    
    const response = await fetch(`/api/${cloudType}/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params)
    });
    
    return await response.json();
  }

  // 赞助者API
  async getSponsors() {
    if (this.isOfflineMode) {
      return await offlineApi.getSponsors();
    }
    
    const response = await fetch('/api/sponsors');
    return await response.json();
  }

  // 获取当前模式
  getMode() {
    return this.isOfflineMode ? 'offline' : 'online';
  }

  // 强制切换到离线模式
  forceOfflineMode() {
    this.isOfflineMode = true;
  }

  // 强制切换到在线模式
  forceOnlineMode() {
    this.isOfflineMode = false;
  }
}

// 导出单例实例
export const apiAdapter = ApiAdapter.getInstance(); 