# 🌸 myBlog 单仓项目

一个前后端分离、但使用单仓库管理的博客项目。

仓库中同时包含：
- 🎨 `blog-front/`：基于 `React + TypeScript + Vite` 的博客前端
- ⚙️ `blog-java/`：基于 `Spring Boot + Redis + MySQL` 的博客后端

整体目标是提供一套可本地开发、可服务器部署、可继续扩展的完整博客系统。

## ✨ 项目特性

- 🖥️ 博客首页、分类、归档、关于页、留言板
- 👤 登录、注册、找回密码、用户资料编辑
- 📝 文章发布、评论、点赞、收藏、举报
- 🛠️ 后台文章审核与站点设置
- 📦 单仓管理，前后端代码统一维护
- 🚀 支持宝塔部署与生产环境打包

## 📁 目录结构

```text
.
├─ blog-front/       前端项目
├─ blog-java/        后端项目
├─ README.md
└─ LICENSE
```

## 🎨 前端说明

### 环境要求

- Node.js 18+
- npm 9+

### 本地开发

```bash
cd blog-front
npm install
npm run dev
```

前端开发环境会通过 Vite 代理，将 `/api` 请求转发到：

```text
http://localhost:8080
```

### 前端打包

```bash
cd blog-front
npm run build
```

### 前端环境变量

- [E:\Project\blog\blog-front\.env.example](E:/Project/blog/blog-front/.env.example)

### 前端接口说明

- [E:\Project\blog\blog-front\API.md](E:/Project/blog/blog-front/API.md)

## ⚙️ 后端说明

### 环境要求

- Java 17
- Maven 3.9+
- MySQL 5.7+/8.0+
- Redis 6+/7+

### 本地运行

```bash
cd blog-java
mvn spring-boot:run
```

### 后端打包

```bash
cd blog-java
mvn clean package -DskipTests
```

### 后端测试

```bash
cd blog-java
mvn test
```

### 后端环境变量

- [E:\Project\blog\blog-java\.env.example](E:/Project/blog/blog-java/.env.example)

### 数据库初始化脚本

- [E:\Project\blog\blog-java\src\main\resources\sql\schema-mysql.sql](E:/Project/blog/blog-java/src/main/resources/sql/schema-mysql.sql)

## 🚀 部署建议

推荐生产环境部署方式：

- 🌐 前端：Nginx 托管 `blog-front/dist`
- ⚙️ 后端：运行 `blog-java` 打包后的 `jar`
- 🗄️ 数据库：MySQL
- ⚡ 缓存：Redis
- 🧭 反向代理：Nginx 将 `/api` 转发到后端服务

如果你使用宝塔面板：

- 前端放到静态站点目录
- 后端通过“Java 项目”管理运行
- 数据库先导入 `schema-mysql.sql`
- `.env` 与 `jar` 放在同级目录

## 🧩 当前仓库包含内容

- ✅ 前后端接口联调
- ✅ 中文化界面与提示
- ✅ 文章、评论、留言、审核等核心功能
- ✅ 邮件验证码能力
- ✅ Redis 缓存接入
- ✅ 生产可用的资源打包方案

## 📌 说明

本仓库仍可继续扩展，例如：

- 📊 数据统计与运营面板
- 🔍 更完善的搜索能力
- ☁️ 对象存储与 CDN
- 🔐 更细粒度的权限控制
- 🎬 更完整的视频与弹幕系统

## ❤️ 致谢

如果你喜欢这个项目，欢迎继续完善它，让它变成真正长期可维护的个人博客系统。
