# API 接口文档

本文档描述了博客系统前端与后端交互的所有 API 接口。

## 基础信息

- **Base URL**: `/api` (所有接口均基于此路径)
- **响应格式**: JSON
- **认证方式**: 在 HTTP Header 中携带 `Authorization: Bearer <token>`

所有接口返回的数据结构遵循统一格式：

```typescript
interface ApiResponse<T = any> {
  code: number;      // 状态码，200 表示成功
  message: string;   // 响应消息或错误描述
  data: T;           // 实际数据内容
}
```

---

## 1. 认证模块 (Auth)

### 1.1 用户登录
- **URL**: `/auth/login`
- **Method**: `POST`
- **描述**: 用户登录接口
- **Request Body**:
  ```json
  {
    "username": "admin",
    "password": "password"
  }
  ```
- **Response Data (`AuthResponse`)**:
  ```json
  {
    "token": "jwt_token_string",
    "user": { ... } // User 对象
  }
  ```

### 1.2 用户登出
- **URL**: `/auth/logout`
- **Method**: `POST`
- **描述**: 退出登录
- **Response Data**: `null`

### 1.3 获取当前用户信息
- **URL**: `/auth/me`
- **Method**: `GET`
- **描述**: 获取当前登录用户的详细信息
- **Response Data**: `User` 对象

### 1.4 更新用户信息
- **URL**: `/auth/me`
- **Method**: `PUT`
- **描述**: 更新当前用户的资料
- **Request Body**: `Partial<User>` (User 对象的子集)
- **Response Data**: 更新后的 `User` 对象

---

## 2. 文章模块 (Article)

### 2.1 获取文章列表
- **URL**: `/articles`
- **Method**: `GET`
- **描述**: 分页获取文章列表，支持筛选
- **Query Parameters**:
  - `page`: 当前页码 (默认 1)
  - `pageSize`: 每页数量 (默认 10)
  - `keyword`: 搜索关键字 (可选)
  - `category`: 分类 ID 或名称 (可选)
  - `tag`: 标签 ID 或名称 (可选)
- **Response Data (`ArticleListResponse`)**:
  ```json
  {
    "list": [ ... ], // ArticleSummary 数组
    "total": 100     // 总记录数
  }
  ```

### 2.2 获取文章详情
- **URL**: `/articles/:id`
- **Method**: `GET`
- **描述**: 获取单篇文章的详细内容
- **Path Parameters**:
  - `id`: 文章 ID
- **Response Data**: `ArticleDetail` 对象

### 2.3 获取文章评论
- **URL**: `/articles/:id/comments`
- **Method**: `GET`
- **描述**: 获取指定文章的评论列表
- **Path Parameters**:
  - `id`: 文章 ID
- **Response Data**: `Comment[]` (评论数组)

### 2.4 发布文章
- **URL**: `/articles`
- **Method**: `POST`
- **描述**: 发布一篇新文章
- **Request Body (`CreateArticleRequest`)**:
  ```json
  {
    "title": "文章标题",
    "content": "Markdown 内容",
    "summary": "摘要",
    "cover": "封面 URL（可选）",
    "category": "分类 ID 或名称",
    "tags": ["标签1", "标签2"]
  }
  ```
- **Response Data**: 新创建的 `ArticleDetail` 对象

### 2.5 点赞文章
- **URL**: `/articles/:id/like`
- **Method**: `POST`
- **描述**: 切换文章点赞状态（点赞/取消点赞）
- **Path Parameters**:
  - `id`: 文章 ID
- **Response Data**:
  ```json
  {
    "likes": 10,
    "isLiked": true
  }
  ```

### 2.6 收藏文章
- **URL**: `/articles/:id/favorite`
- **Method**: `POST`
- **描述**: 切换文章收藏状态（收藏/取消收藏）
- **Path Parameters**:
  - `id`: 文章 ID
- **Response Data**:
  ```json
  {
    "favorites": 5,
    "isFavorited": true
  }
  ```

---

## 3. 元数据模块 (Meta)

### 3.1 获取所有分类
- **URL**: `/meta/categories`
- **Method**: `GET`
- **描述**: 获取全站文章分类统计
- **Response Data**: `Category[]`

### 3.2 获取所有标签
- **URL**: `/meta/tags`
- **Method**: `GET`
- **描述**: 获取全站标签统计（标签云）
- **Response Data**: `Tag[]`

---

## 4. 留言板模块 (Guestbook)

### 4.1 获取留言列表
- **URL**: `/guestbook/messages`
- **Method**: `GET`
- **描述**: 获取留言板的所有留言
- **Response Data**: `GuestbookMessage[]`

### 4.2 发布留言
- **URL**: `/guestbook/messages`
- **Method**: `POST`
- **描述**: 发布一条新留言
- **Request Body**:
  ```json
  {
    "content": "留言内容"
  }
  ```
- **Response Data**: 新创建的 `GuestbookMessage` 对象

---

## 5. 公共/博主信息

### 5.1 获取博主资料
- **URL**: `/blogger/profile`
- **Method**: `GET`
- **描述**: 获取博主（管理员）的公开展示信息，用于侧边栏和关于页
- **Response Data**: `User` 对象

---

## 6. 数据类型定义

### User (用户)
```typescript
interface User {
  id: string;
  name: string;
  avatar: string;
  roles?: string[]; // 例如 ['admin', 'user']
  bio?: string;     // 个人简介
  socials?: {       // 社交链接
    github?: string;
    twitter?: string;
    bilibili?: string;
    douyin?: string;
    email?: string;
  };
  stats?: {         // 统计数据
    articles: number;
    tags: number;
    categories: number;
  };
}
```

### ArticleSummary (文章摘要)
```typescript
interface ArticleSummary {
  id: string;
  title: string;
  summary: string;
  cover: string;       // 封面图片 URL
  publishDate: string; // ISO 日期字符串
  views: number;
  likes: number;
  comments: number;
  tags: string[];
  category?: string;
  author: User;
}
```

### ArticleDetail (文章详情)
*继承自 ArticleSummary*
```typescript
interface ArticleDetail extends ArticleSummary {
  content: string;     // Markdown 原始内容
  favorites: number;
  isLiked: boolean;    // 当前用户是否点赞
  isFavorited: boolean;// 当前用户是否收藏
}
```

### CreateArticleRequest (发布文章请求)
```typescript
interface CreateArticleRequest {
  title: string;
  content: string;
  summary: string;
  cover?: string;
  category: string;
  tags: string[];
}
```

### Comment (评论)
```typescript
interface Comment {
  id: string;
  content: string;
  createdAt: string;
  user: User;
  likes: number;
  replies?: Comment[]; // 嵌套回复
}
```

### GuestbookMessage (留言)
```typescript
interface GuestbookMessage {
  id: string;
  content: string;
  createdAt: string;
  user: User;
}
```
