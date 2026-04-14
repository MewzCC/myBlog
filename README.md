# myBlog 单仓项目

这是一个前后端同仓库管理的博客项目，仓库中同时包含：

- `blog-front/`：基于 React + TypeScript + Vite 的前端
- `blog-java/`：基于 Spring Boot + Redis + MySQL 的后端

## 目录结构

```text
.
|-- blog-front/        博客前端
|-- blog-java/         博客后端
|-- README.md
```

## 前端运行

环境要求：

- Node.js 18 及以上
- npm 9 及以上

启动方式：

```bash
cd blog-front
npm install
npm run dev
```

前端开发环境会通过 Vite 代理把 `/api` 转发到 `http://localhost:8080`。

前端构建：

```bash
cd blog-front
npm run build
```

前端接口说明见 [blog-front/API.md](E:/Project/blog/blog-front/API.md)。

## 后端运行

环境要求：

- Java 17
- Maven 3.9 及以上
- MySQL 8
- Redis 7

启动方式：

```bash
cd blog-java
mvn spring-boot:run
```

后端构建与测试：

```bash
cd blog-java
mvn test
mvn -DskipTests compile
```

## 环境变量

前端示例：

- `blog-front/.env.example`

后端示例：

- `blog-java/.env.example`
