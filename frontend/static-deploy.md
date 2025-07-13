# CloudSaver 静态部署指南

## 概述

本项目已支持静态部署，所有数据将缓存在浏览器中，无需后端服务器。

## 功能特性

### ✅ 已支持的功能
- **用户系统**: 登录、注册、权限管理（数据存储在浏览器）
- **资源搜索**: 离线搜索功能，支持关键词搜索
- **设置管理**: 用户设置和全局设置（存储在浏览器）
- **网盘转存**: 模拟转存功能（离线模式）
- **豆瓣热门**: 离线热门列表
- **响应式设计**: PC端和移动端完美适配

### 🔄 数据缓存
- **用户信息**: 存储在浏览器localStorage
- **搜索历史**: 自动缓存搜索结果
- **用户设置**: 网盘Cookie、显示样式等
- **资源列表**: 最近搜索的资源列表

## 部署步骤

### 1. 构建前端
```bash
cd frontend
npm install
npm run build
```

### 2. 部署到静态服务器
将 `frontend/dist` 目录部署到任何静态文件服务器：

#### GitHub Pages
```bash
# 将dist目录内容推送到gh-pages分支
git subtree push --prefix frontend/dist origin gh-pages
```

#### Netlify
- 将 `frontend/dist` 目录拖拽到Netlify
- 或连接GitHub仓库自动部署

#### Vercel
```bash
# 安装Vercel CLI
npm i -g vercel

# 部署
vercel frontend/dist
```

#### 其他静态托管服务
- 阿里云OSS
- 腾讯云COS
- 七牛云
- 等等

### 3. 配置路由（重要）
由于使用了Vue Router的history模式，需要配置服务器支持SPA路由：

#### Nginx配置
```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

#### Apache配置
```apache
RewriteEngine On
RewriteBase /
RewriteRule ^index\.html$ - [L]
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]
```

## 离线模式说明

### 自动检测
- 应用启动时自动检测后端API可用性
- 如果API不可用，自动切换到离线模式
- 离线模式下所有数据存储在浏览器中

### 数据持久化
- 用户注册信息存储在浏览器
- 搜索历史和资源列表自动缓存
- 用户设置和Cookie信息本地保存

### 功能限制
- 离线模式下无法进行真实的网盘转存
- 资源搜索使用模拟数据
- 无法获取实时的Telegram频道数据

## 开发模式

### 本地开发
```bash
# 启动开发服务器
npm run dev

# 模拟离线模式
# 在浏览器控制台执行：
window.apiAdapter.forceOfflineMode()
```

### 测试离线功能
1. 启动开发服务器
2. 打开浏览器开发者工具
3. 在控制台执行：`window.apiAdapter.forceOfflineMode()`
4. 刷新页面测试离线功能

## 注意事项

### 浏览器兼容性
- 需要支持ES6+的现代浏览器
- 需要支持localStorage
- 建议使用Chrome、Firefox、Safari、Edge等现代浏览器

### 数据安全
- 所有数据存储在浏览器本地
- 清除浏览器数据会丢失所有信息
- 建议定期备份重要设置

### 性能优化
- 使用PWA技术提升加载速度
- 资源文件自动缓存
- 支持离线访问

## 故障排除

### 常见问题

1. **路由404错误**
   - 确保服务器配置了SPA路由重写规则

2. **离线模式不生效**
   - 检查浏览器控制台是否有错误
   - 确认API检测逻辑正常工作

3. **数据丢失**
   - 检查浏览器localStorage是否被清除
   - 确认浏览器支持localStorage

4. **样式问题**
   - 确保所有静态资源路径正确
   - 检查CSS文件是否正确加载

### 调试技巧
```javascript
// 查看当前模式
console.log(window.apiAdapter.getMode());

// 查看缓存数据
console.log(localStorage);

// 强制切换模式
window.apiAdapter.forceOfflineMode();
window.apiAdapter.forceOnlineMode();
```

## 更新日志

### v0.2.6
- ✅ 支持静态部署
- ✅ 浏览器数据缓存
- ✅ 离线模式自动检测
- ✅ PWA支持
- ✅ 响应式设计优化

---

如有问题，请查看项目文档或提交Issue。 