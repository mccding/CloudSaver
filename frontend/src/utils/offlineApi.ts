import { browserStorage, CACHE_KEYS } from './storage';
import type { 
  Resource, 
  ShareInfoResponse, 
  Folder, 
  SaveFileParams, 
  GetShareInfoParams,
  UserSettingAttributes,
  GlobalSettingAttributes
} from '@/types';
import type { HotListItem, HotListParams } from '@/types/douban';

// 离线API模拟器
export class OfflineApi {
  private static instance: OfflineApi;

  static getInstance(): OfflineApi {
    if (!OfflineApi.instance) {
      OfflineApi.instance = new OfflineApi();
    }
    return OfflineApi.instance;
  }

  // 模拟用户登录
  async login(username: string, password: string) {
    // 从缓存获取用户信息
    const users = browserStorage.get<Array<{username: string, password: string, role: number}>>('users') || [];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
      const token = `offline_token_${Date.now()}`;
      browserStorage.set(CACHE_KEYS.USER_TOKEN, token, 6); // 6小时过期
      browserStorage.set(CACHE_KEYS.USER_INFO, { username, role: user.role }, 6);
      
      return {
        code: 0,
        data: { token },
        message: '登录成功'
      };
    }
    
    throw new Error('用户名或密码错误');
  }

  // 模拟用户注册
  async register(username: string, password: string, registerCode: string) {
    const users = browserStorage.get<Array<{username: string, password: string, role: number}>>('users') || [];
    
    if (users.find(u => u.username === username)) {
      throw new Error('用户名已存在');
    }

    const role = registerCode === '230713' ? 1 : 0; // 管理员或普通用户
    users.push({ username, password, role });
    browserStorage.set('users', users);

    return {
      code: 0,
      data: { username, role },
      message: '注册成功'
    };
  }

  // 模拟资源搜索
  async search(keyword: string, channelId?: string, lastMessageId?: string) {
    // 从缓存获取资源列表
    const cachedResources = browserStorage.get<Resource[]>(CACHE_KEYS.RESOURCE_LIST) || [];
    
    if (!keyword) {
      return {
        code: 0,
        data: cachedResources,
        message: '获取成功'
      };
    }

    // 模拟搜索结果
    const mockResources: Resource[] = [
      {
        id: 'mock_channel_1',
        channelInfo: {
          name: '离线资源频道',
          channelLogo: '',
          channelId: 'mock_channel_1'
        },
        displayList: true,
        list: [
          {
            id: '1',
            title: `离线资源 - ${keyword}`,
            cloudLinks: ['https://pan.quark.cn/s/mock123'],
            cloudType: 'quark',
            channel: '离线频道',
            pubDate: new Date().toISOString(),
            isSupportSave: true
          }
        ]
      }
    ];

    return {
      code: 0,
      data: mockResources,
      message: '搜索成功'
    };
  }

  // 模拟获取设置
  async getSettings() {
    const userSettings = browserStorage.get<UserSettingAttributes>(CACHE_KEYS.USER_SETTINGS) || {
      cloud115Cookie: '',
      quarkCookie: ''
    };

    const globalSettings = browserStorage.get<GlobalSettingAttributes>(CACHE_KEYS.GLOBAL_SETTINGS) || {
      httpProxyHost: '127.0.0.1',
      httpProxyPort: '7890',
      isProxyEnabled: false,
      AdminUserCode: 230713,
      CommonUserCode: 9527
    };

    return {
      code: 0,
      data: {
        userSettings,
        globalSetting: globalSettings
      },
      message: '获取成功'
    };
  }

  // 模拟保存设置
  async saveSettings(settings: {
    globalSetting?: GlobalSettingAttributes | null;
    userSettings: UserSettingAttributes;
  }) {
    if (settings.userSettings) {
      browserStorage.set(CACHE_KEYS.USER_SETTINGS, settings.userSettings);
    }
    
    if (settings.globalSetting) {
      browserStorage.set(CACHE_KEYS.GLOBAL_SETTINGS, settings.globalSetting);
    }

    return {
      code: 0,
      message: '保存成功'
    };
  }

  // 模拟豆瓣热门列表
  async getDoubanHotList(params: HotListParams) {
    const mockHotList: HotListItem[] = [
      {
        id: '1',
        title: '离线热门电影',
        rate: '8.5',
        cover: '',
        cover_x: 200,
        cover_y: 300,
        episodes_info: '',
        is_new: false,
        playable: true,
        url: ''
      }
    ];

    return {
      code: 0,
      data: mockHotList,
      message: '获取成功'
    };
  }

  // 模拟网盘相关API
  async getCloudShareInfo(params: GetShareInfoParams) {
    return {
      code: 0,
      data: {
        list: [
          {
            fileId: 'mock_file_1',
            fileName: '离线文件',
            fileSize: '1GB',
            fileIdToken: 'mock_token'
          }
        ],
        pwdId: params.shareCode,
        stoken: params.receiveCode || ''
      },
      message: '获取成功'
    };
  }

  async getCloudFolders(parentCid = '0') {
    const mockFolders: Folder[] = [
      {
        cid: '1',
        name: '离线文件夹',
        path: []
      }
    ];

    return {
      code: 0,
      data: mockFolders,
      message: '获取成功'
    };
  }

  async saveCloudFile(params: SaveFileParams) {
    return {
      code: 0,
      message: '转存成功（离线模式）'
    };
  }

  // 模拟获取赞助者列表
  async getSponsors() {
    return {
      code: 0,
      data: [
        {
          name: '离线赞助者',
          amount: '100',
          date: new Date().toISOString()
        }
      ],
      message: '获取成功'
    };
  }
}

// 导出单例实例
export const offlineApi = OfflineApi.getInstance(); 