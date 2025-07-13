# CloudSaver 静态部署指南

## 概述

本项目已支持静态部署，**数据存储在浏览器中，但API调用保持在线**。这样您无需维护数据库，但可以享受完整的在线功能。

## 功能特性

### ✅ 已支持的功能
- **用户系统**: 登录、注册、权限管理（数据存储在浏览器）
- **资源搜索**: 在线搜索功能，支持关键词搜索和结果缓存
- **设置管理**: 用户设置和全局设置（存储在浏览器）
- **网盘转存**: 真实转存功能（在线模式）
- **豆瓣热门**: 在线热门列表
- **响应式设计**: PC端和移动端完美适配

### 🔄 数据存储
- **用户信息**: 存储在浏览器localStorage
- **搜索历史**: 自动缓存搜索结果（30分钟有效期）
- **用户设置**: 网盘Cookie、显示样式等
- **资源列表**: 最近搜索的资源列表
- **收藏资源**: 用户收藏的资源列表

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

## 浏览器数据存储说明

### 架构特点
- **在线API调用**: 所有功能都调用真实的后端API
- **浏览器数据存储**: 用户数据、设置、缓存都存储在浏览器中
- **无需数据库**: 您不需要维护任何数据库服务器

### 数据持久化
- 用户注册信息存储在浏览器localStorage
- 搜索历史和资源列表自动缓存（30分钟有效期）
- 用户设置和Cookie信息本地保存
- 收藏资源列表本地存储

### 功能优势
- 完整的在线功能体验
- 无需维护数据库
- 数据安全（存储在用户浏览器中）
- 支持真实的网盘转存功能

## 开发模式

### 本地开发
```bash
# 启动开发服务器
npm run dev
```

### 测试浏览器数据存储
1. 启动开发服务器
2. 注册新用户（数据存储在浏览器）
3. 进行搜索（结果会被缓存）
4. 检查浏览器localStorage查看存储的数据

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

// 查看浏览器存储的数据
console.log(localStorage);

// 查看用户数据
console.log(JSON.parse(localStorage.getItem('users') || '[]'));

// 查看搜索缓存
console.log(JSON.parse(localStorage.getItem('resource_cache_关键词') || 'null'));
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