# blog-java

`blog-java` 是博客项目的后端服务，使用 Spring Boot 构建，负责认证、文章、评论、留言板、后台管理和视频能力。

## 技术栈

- Spring Boot 3
- Java 17
- Spring Security + JWT
- Spring Data JPA
- MySQL
- Redis
- SMTP 邮件服务

## 已实现接口

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

## 环境变量

启动前请参考 `.env.example` 配置以下变量：

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

## 本地运行

```bash
mvn spring-boot:run
```

## 说明

- Redis 负责登录态缓存、验证码缓存、热点数据缓存和视频事件缓冲。
- 当 Redis 不可用时，视频事件会自动降级为直接写入数据库，不会阻塞接口。
- 视频文件默认保存在本地文件系统。
