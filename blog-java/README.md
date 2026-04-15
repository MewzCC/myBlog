# ⚙️ blog-java 后端项目

`blog-java` 是博客单仓中的后端服务，基于 `Spring Boot 3` 构建，负责认证、文章、评论、留言板、后台审核、站点设置、视频能力以及缓存处理。

## ✨ 后端能力

- 🔐 登录、注册、找回密码、JWT 认证
- 📝 文章列表、详情、发布、点赞、收藏
- 💬 评论发布、点赞、删除、举报
- 📮 留言板读写
- 🧑 博主资料与分类标签聚合
- 🛠️ 后台文章审核与系统设置
- ⚡ Redis 缓存与验证码存储
- 🎬 视频上传、弹幕、事件统计

## 🧱 技术栈

- Spring Boot 3
- Java 17
- Spring Security + JWT
- Spring Data JPA
- MySQL
- Redis
- SMTP 邮件服务

## 🗂️ 分层结构

当前代码采用 `controller / service / mapper` 分层，并按业务模块拆分：

- `admin/controller`、`admin/service`
- `article/controller`、`article/service`、`article/mapper`
- `auth/controller`、`auth/service`
- `comment/controller`、`comment/service`、`comment/mapper`
- `guestbook/controller`、`guestbook/service`、`guestbook/mapper`
- `meta/controller`、`meta/service`
- `settings/controller`、`settings/service`、`settings/mapper`
- `user/controller`、`user/mapper`
- `video/controller`、`video/service`、`video/mapper`

## 🚀 本地运行

```bash
mvn spring-boot:run
```

## 🧪 测试与构建

```bash
mvn test
mvn clean package -DskipTests
```

打包后会生成可直接部署的 Spring Boot `jar` 文件。

## ⚙️ 环境变量

示例文件：

- [E:\Project\blog\blog-java\.env.example](E:/Project/blog/blog-java/.env.example)

主要配置项包括：

- `SERVER_PORT`
- `MYSQL_URL`
- `MYSQL_USERNAME`
- `MYSQL_PASSWORD`
- `REDIS_HOST`
- `REDIS_PORT`
- `REDIS_PASSWORD`
- `MAIL_HOST`
- `MAIL_PORT`
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `MAIL_FROM`
- `JWT_SECRET`
- `JWT_EXPIRATION_HOURS`
- `UPLOAD_DIR`
- `DEFAULT_ADMIN_EMAIL`
- `DEFAULT_ADMIN_PASSWORD`

## 🗄️ 数据库初始化

MySQL 建表与模拟数据脚本位于：

- [E:\Project\blog\blog-java\src\main\resources\sql\schema-mysql.sql](E:/Project/blog/blog-java/src/main/resources/sql/schema-mysql.sql)

导入示例：

```bash
mysql -u root -p blog_java < src/main/resources/sql/schema-mysql.sql
```

当前项目保留了 Hibernate 的自动更新能力，默认配置中使用：

```text
ddl-auto: update
```

## 📡 已实现接口

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- `PUT /api/auth/me`
- `POST /api/auth/register/code`
- `POST /api/auth/register`
- `POST /api/auth/password/code`
- `POST /api/auth/password/reset`
- `GET /api/articles`
- `GET /api/articles/{id}`
- `POST /api/articles`
- `POST /api/articles/{id}/like`
- `POST /api/articles/{id}/favorite`
- `GET /api/articles/{id}/comments`
- `POST /api/articles/{id}/comments`
- `POST /api/comments/{id}/like`
- `DELETE /api/comments/{id}`
- `POST /api/comments/{id}/report`
- `GET /api/guestbook/messages`
- `POST /api/guestbook/messages`
- `GET /api/blogger/profile`
- `GET /api/meta/categories`
- `GET /api/meta/tags`
- `GET /api/site/settings`
- `GET /api/admin/articles`
- `POST /api/admin/articles/{id}/approve`
- `POST /api/admin/articles/{id}/reject`
- `GET /api/admin/settings`
- `PUT /api/admin/settings`
- `POST /api/upload/video`
- `GET /api/videos/{videoKey}/danmaku`
- `POST /api/videos/{videoKey}/events`
- `POST /api/videos/{videoKey}/danmaku`
- `GET /api/analytics/videos`

## 🚀 部署建议

推荐生产环境方式：

- 后端以 `jar` 方式运行
- 使用 `.env` 注入环境变量
- Nginx 反向代理 `/api`
- 上传目录使用绝对路径
- MySQL 与 Redis 使用服务器本地服务

如果使用宝塔部署：

- `jar` 与 `.env` 放在同级目录
- 使用“Java 项目”运行后端
- 启动前先导入数据库脚本
- 确保 Java 版本为 `17`

## 📌 说明

- Redis 负责登录态、验证码、热点数据与部分事件缓存
- 当 Redis 不可用时，部分能力会自动降级，不会阻塞主要接口
- 视频文件默认保存在本地文件系统
