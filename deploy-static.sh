#!/bin/bash

# CloudSaver 静态部署脚本

echo "🚀 开始构建静态版本..."

# 进入前端目录
cd frontend

# 安装依赖
echo "📦 安装依赖..."
npm install

# 构建生产版本
echo "🔨 构建生产版本..."
npm run build

# 检查构建结果
if [ -d "dist" ]; then
    echo "✅ 构建成功！"
    echo "📁 构建文件位置: frontend/dist"
    echo ""
    echo "📋 部署说明:"
    echo "1. 将 frontend/dist 目录内容上传到静态服务器"
    echo "2. 确保服务器配置了SPA路由重写规则"
    echo "3. 访问网站测试功能"
    echo ""
    echo "🌐 支持的部署平台:"
    echo "- GitHub Pages"
    echo "- Netlify"
    echo "- Vercel"
    echo "- 阿里云OSS"
    echo "- 腾讯云COS"
    echo "- 七牛云"
    echo ""
    echo "📖 详细部署说明请查看: frontend/static-deploy.md"
else
    echo "❌ 构建失败！"
    exit 1
fi 