# 🎨 blog-front 前端项目

`blog-front` 是博客系统的前端工程，基于 `React + TypeScript + Vite` 构建，负责页面展示、用户交互、文章浏览、认证流程和后台页面入口。

## ✨ 功能概览

- 🏠 博客首页、分类页、归档页、关于页
- 🔍 搜索文章与内容筛选
- 👤 登录、注册、找回密码、用户资料编辑
- 💬 评论、留言、点赞、收藏、举报
- 🛠️ 后台文章审核与站点设置
- 🌸 自定义视觉风格、背景视频与鼠标指针资源

## 🧱 技术栈

- React 18
- TypeScript
- Vite
- Ant Design
- Zustand
- Axios
- Sass

## 🚀 本地开发

```bash
npm install
npm run dev
```

开发环境下，前端会将 `/api` 请求代理到：

```text
http://localhost:8080
```

## 📦 生产打包

```bash
npm run build
```

打包完成后，生成目录为：

```text
dist/
```

可直接交给 Nginx 或其他静态资源服务器部署。

## ⚙️ 环境变量

示例文件：

- [E:\Project\blog\blog-front\.env.example](E:/Project/blog/blog-front/.env.example)

当前主要使用：

- `VITE_API_BASE_URL`

## 📚 相关文档

- [接口文档](E:/Project/blog/blog-front/API.md)
- [移动端适配说明](E:/Project/blog/blog-front/docs/mobile-adaptation.md)

## 🧩 目录说明

```text
blog-front
├─ src/
│  ├─ api/                 接口请求封装
│  ├─ assets/              图片、视频、鼠标资源
│  ├─ components/          通用组件
│  ├─ stores/              状态管理
│  ├─ styles/              全局样式
│  ├─ utils/               工具函数
│  └─ views/               页面视图
├─ public/
└─ README.md
```

## ❤️ 说明

这个前端项目已经按生产资源打包方式整理，适合：

- 本地联调开发
- 与 `blog-java` 同仓管理
- 在宝塔 / Nginx 环境中独立部署
