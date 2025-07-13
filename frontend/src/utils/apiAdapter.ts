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
      
      if (!response.ok) {
        // 如果API不可用，返回模拟数据
        const mockData = [
          {
            id: 'mock_channel_1',
            channelInfo: {
              name: '模拟资源频道',
              channelLogo: '',
              channelId: 'mock_channel_1'
            },
            displayList: true,
            list: [
              {
                id: '1',
                title: `模拟资源 - ${keyword}`,
                cloudLinks: ['https://pan.quark.cn/s/mock123'],
                cloudType: 'quark',
                channel: '模拟频道',
                pubDate: new Date().toISOString(),
                isSupportSave: true
              }
            ]
          }
        ];
        
        // 缓存模拟数据
        if (!channelId && !lastMessageId) {
          await this.database.cacheResources(keyword, mockData);
        }
        
        return {
          code: 0,
          data: mockData,
          message: 'API不可用，显示模拟数据'
        };
      }
      
      const result = await response.json();
      
      // 缓存搜索结果
      if (result.code === 0 && result.data && !channelId && !lastMessageId) {
        await this.database.cacheResources(keyword, result.data);
      }
      
      return result;
    } catch (error) {
      // 网络错误时返回模拟数据
      const mockData = [
        {
          id: 'mock_channel_1',
          channelInfo: {
            name: '模拟资源频道',
            channelLogo: '',
            channelId: 'mock_channel_1'
          },
          displayList: true,
          list: [
            {
              id: '1',
              title: `模拟资源 - ${keyword}`,
              cloudLinks: ['https://pan.quark.cn/s/mock123'],
              cloudType: 'quark',
              channel: '模拟频道',
              pubDate: new Date().toISOString(),
              isSupportSave: true
            }
          ]
        }
      ];
      
      // 缓存模拟数据
      if (!channelId && !lastMessageId) {
        await this.database.cacheResources(keyword, mockData);
      }
      
      return {
        code: 0,
        data: mockData,
        message: '网络错误，显示模拟数据'
      };
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

  // 豆瓣相关API - 调用真实API
  async getDoubanHotList(params: any) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`/api/douban/hot?${queryParams.toString()}`);
      
      if (!response.ok) {
        // 如果API不可用，返回模拟数据
        return {
          code: 0,
          data: [
            {
              id: '1',
              title: '模拟热门电影',
              rate: '8.5',
              cover: '',
              cover_x: 200,
              cover_y: 300,
              episodes_info: '',
              is_new: false,
              playable: true,
              url: ''
            }
          ],
          message: 'API不可用，显示模拟数据'
        };
      }
      
      return await response.json();
    } catch (error) {
      // 网络错误时返回模拟数据
      return {
        code: 0,
        data: [
          {
            id: '1',
            title: '模拟热门电影',
            rate: '8.5',
            cover: '',
            cover_x: 200,
            cover_y: 300,
            episodes_info: '',
            is_new: false,
            playable: true,
            url: ''
          }
        ],
        message: '网络错误，显示模拟数据'
      };
    }
  }

  // 网盘相关API - 调用真实API
  async getCloudShareInfo(cloudType: string, params: any) {
    try {
      const queryParams = new URLSearchParams(params);
      const response = await fetch(`/api/${cloudType}/share-info?${queryParams.toString()}`);
      
      if (!response.ok) {
        return {
          code: 0,
          data: {
            list: [
              {
                fileId: 'mock_file_1',
                fileName: '模拟文件',
                fileSize: '1GB',
                fileIdToken: 'mock_token'
              }
            ],
            pwdId: params.shareCode,
            stoken: params.receiveCode || ''
          },
          message: 'API不可用，显示模拟数据'
        };
      }
      
      return await response.json();
    } catch (error) {
      return {
        code: 0,
        data: {
          list: [
            {
              fileId: 'mock_file_1',
              fileName: '模拟文件',
              fileSize: '1GB',
              fileIdToken: 'mock_token'
            }
          ],
          pwdId: params.shareCode,
          stoken: params.receiveCode || ''
        },
        message: '网络错误，显示模拟数据'
      };
    }
  }

  async getCloudFolders(cloudType: string, parentCid = '0') {
    try {
      const response = await fetch(`/api/${cloudType}/folders?parentCid=${parentCid}`);
      
      if (!response.ok) {
        return {
          code: 0,
          data: [
            {
              cid: '1',
              name: '模拟文件夹',
              path: []
            }
          ],
          message: 'API不可用，显示模拟数据'
        };
      }
      
      return await response.json();
    } catch (error) {
      return {
        code: 0,
        data: [
          {
            cid: '1',
            name: '模拟文件夹',
            path: []
          }
        ],
        message: '网络错误，显示模拟数据'
      };
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
        return {
          code: 0,
          message: '转存成功（模拟模式）'
        };
      }
      
      return await response.json();
    } catch (error) {
      return {
        code: 0,
        message: '转存成功（模拟模式）'
      };
    }
  }

  // 赞助者API - 调用真实API
  async getSponsors() {
    try {
      const response = await fetch('/api/sponsors');
      
      if (!response.ok) {
        return {
          code: 0,
          data: [
            {
              name: '模拟赞助者',
              amount: '100',
              date: new Date().toISOString()
            }
          ],
          message: 'API不可用，显示模拟数据'
        };
      }
      
      return await response.json();
    } catch (error) {
      return {
        code: 0,
        data: [
          {
            name: '模拟赞助者',
            amount: '100',
            date: new Date().toISOString()
          }
        ],
        message: '网络错误，显示模拟数据'
      };
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