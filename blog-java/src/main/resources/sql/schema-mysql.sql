SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  avatar VARCHAR(500) NOT NULL,
  bio LONGTEXT NULL,
  socials_json LONGTEXT NULL,
  roles VARCHAR(255) NOT NULL,
  UNIQUE KEY uk_users_email (email),
  UNIQUE KEY uk_users_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_settings (
  id BIGINT NOT NULL PRIMARY KEY,
  enable_guestbook BIT(1) NOT NULL,
  enable_user_edit BIT(1) NOT NULL,
  enable_socials BIT(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS articles (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  title VARCHAR(200) NOT NULL,
  summary VARCHAR(500) NOT NULL,
  content LONGTEXT NOT NULL,
  cover LONGTEXT NULL,
  category VARCHAR(255) NOT NULL,
  publish_date DATETIME(6) NOT NULL,
  views BIGINT NOT NULL DEFAULT 0,
  likes BIGINT NOT NULL DEFAULT 0,
  favorites BIGINT NOT NULL DEFAULT 0,
  author_id VARCHAR(64) NOT NULL,
  status VARCHAR(32) NOT NULL,
  KEY idx_articles_author_id (author_id),
  KEY idx_articles_status_publish_date (status, publish_date),
  CONSTRAINT fk_articles_author FOREIGN KEY (author_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS article_tags (
  article_id VARCHAR(64) NOT NULL,
  tag_name VARCHAR(255) NULL,
  KEY idx_article_tags_article_id (article_id),
  KEY idx_article_tags_tag_name (tag_name),
  CONSTRAINT fk_article_tags_article FOREIGN KEY (article_id) REFERENCES articles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS article_reactions (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  article_id VARCHAR(64) NOT NULL,
  reaction_type VARCHAR(32) NOT NULL,
  user_id VARCHAR(64) NULL,
  visitor_id VARCHAR(128) NULL,
  created_at DATETIME(6) NOT NULL,
  KEY idx_article_reactions_article_id (article_id),
  KEY idx_article_reactions_user (user_id),
  KEY idx_article_reactions_visitor (visitor_id),
  KEY idx_article_reactions_type (reaction_type),
  CONSTRAINT fk_article_reactions_article FOREIGN KEY (article_id) REFERENCES articles (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comments (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  article_id VARCHAR(64) NOT NULL,
  parent_id VARCHAR(64) NULL,
  user_id VARCHAR(64) NULL,
  visitor_id VARCHAR(128) NULL,
  author_name VARCHAR(255) NOT NULL,
  author_avatar VARCHAR(500) NOT NULL,
  content LONGTEXT NOT NULL,
  KEY idx_comments_article_id (article_id),
  KEY idx_comments_parent_id (parent_id),
  KEY idx_comments_user_id (user_id),
  CONSTRAINT fk_comments_article FOREIGN KEY (article_id) REFERENCES articles (id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_parent FOREIGN KEY (parent_id) REFERENCES comments (id) ON DELETE CASCADE,
  CONSTRAINT fk_comments_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comment_reactions (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  comment_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NULL,
  visitor_id VARCHAR(128) NULL,
  created_at DATETIME(6) NOT NULL,
  KEY idx_comment_reactions_comment_id (comment_id),
  KEY idx_comment_reactions_user (user_id),
  KEY idx_comment_reactions_visitor (visitor_id),
  CONSTRAINT fk_comment_reactions_comment FOREIGN KEY (comment_id) REFERENCES comments (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS comment_reports (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  comment_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NULL,
  visitor_id VARCHAR(128) NULL,
  created_at DATETIME(6) NOT NULL,
  KEY idx_comment_reports_comment_id (comment_id),
  KEY idx_comment_reports_user (user_id),
  KEY idx_comment_reports_visitor (visitor_id),
  CONSTRAINT fk_comment_reports_comment FOREIGN KEY (comment_id) REFERENCES comments (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS guestbook_messages (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  user_id VARCHAR(64) NULL,
  visitor_id VARCHAR(128) NULL,
  author_name VARCHAR(255) NOT NULL,
  author_avatar VARCHAR(500) NOT NULL,
  content LONGTEXT NOT NULL,
  KEY idx_guestbook_messages_user_id (user_id),
  CONSTRAINT fk_guestbook_messages_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS video_assets (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  video_key VARCHAR(255) NOT NULL,
  file_path VARCHAR(1000) NOT NULL,
  public_url VARCHAR(1000) NOT NULL,
  mime VARCHAR(255) NOT NULL,
  size BIGINT NOT NULL,
  poster LONGTEXT NULL,
  thumbnails_vtt LONGTEXT NULL,
  UNIQUE KEY uk_video_assets_video_key (video_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS video_danmaku (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  created_at DATETIME(6) NOT NULL,
  updated_at DATETIME(6) NOT NULL,
  video_key VARCHAR(255) NOT NULL,
  text LONGTEXT NOT NULL,
  time_in_seconds DOUBLE NULL,
  mode_value INT NULL,
  color VARCHAR(64) NULL,
  border_enabled BIT(1) NULL,
  style_json LONGTEXT NULL,
  user_id VARCHAR(64) NULL,
  visitor_id VARCHAR(128) NULL,
  author_name VARCHAR(255) NULL,
  author_avatar LONGTEXT NULL,
  anonymous BIT(1) NOT NULL DEFAULT b'0',
  KEY idx_video_danmaku_video_key (video_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS video_events (
  id VARCHAR(64) NOT NULL PRIMARY KEY,
  video_key VARCHAR(255) NOT NULL,
  viewer_id VARCHAR(128) NOT NULL,
  event VARCHAR(64) NOT NULL,
  event_at BIGINT NOT NULL,
  data_json LONGTEXT NULL,
  created_at DATETIME(6) NOT NULL,
  KEY idx_video_events_video_key (video_key),
  KEY idx_video_events_viewer_id (viewer_id),
  KEY idx_video_events_event (event)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS video_analytics (
  video_key VARCHAR(255) NOT NULL PRIMARY KEY,
  plays BIGINT NOT NULL DEFAULT 0,
  unique_viewers BIGINT NOT NULL DEFAULT 0,
  events BIGINT NOT NULL DEFAULT 0,
  last_event_at BIGINT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DELETE FROM comment_reports;
DELETE FROM comment_reactions;
DELETE FROM comments;
DELETE FROM article_reactions;
DELETE FROM article_tags;
DELETE FROM guestbook_messages;
DELETE FROM video_events;
DELETE FROM video_danmaku;
DELETE FROM video_analytics;
DELETE FROM video_assets;
DELETE FROM articles;
DELETE FROM site_settings;
DELETE FROM users;

INSERT INTO site_settings (id, enable_guestbook, enable_user_edit, enable_socials)
VALUES (1, b'1', b'0', b'1');

INSERT INTO users (id, created_at, updated_at, email, name, password_hash, avatar, bio, socials_json, roles)
VALUES
(
  'user-admin-001',
  NOW(),
  NOW(),
  'admin@example.com',
  '樱花站长',
  '$2a$10$e3pbEF7gGo7qQM4aj3uokud54w6OOEr2li5rKdXm5v6qQe3bMRxAK',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=%E6%A8%B1%E8%8A%B1%E7%AB%99%E9%95%BF',
  '专注前端体验、后端架构与日常写作，喜欢把复杂问题讲清楚，也喜欢把普通日子认真记录下来。',
  '{"github":"https://github.com/MewzCC","twitter":"https://x.com","bilibili":"https://space.bilibili.com/1","douyin":"https://www.douyin.com","email":"admin@example.com"}',
  'admin,user'
),
(
  'user-reader-001',
  NOW(),
  NOW(),
  'reader@example.com',
  '清和',
  '$2a$10$e3pbEF7gGo7qQM4aj3uokud54w6OOEr2li5rKdXm5v6qQe3bMRxAK',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=%E6%B8%85%E5%92%8C',
  '喜欢在安静的夜里读技术文章，也喜欢把有意思的项目收藏起来反复研究。',
  '{"github":"","twitter":"","bilibili":"","douyin":"","email":"reader@example.com"}',
  'user'
);

INSERT INTO articles (id, created_at, updated_at, title, summary, content, cover, category, publish_date, views, likes, favorites, author_id, status)
VALUES
(
  'article-cn-001',
  NOW(),
  NOW(),
  '把个人博客从静态页面改造成前后端分离项目',
  '记录一次把展示型博客升级为可登录、可评论、可管理系统的完整过程。',
  '# 把个人博客从静态页面改造成前后端分离项目

> 这不是一次单纯的技术升级，更像是把一个作品从“能看”打磨成“能用”。

## 为什么要重构

过去的博客更像是一组静态页面，展示内容没有问题，但一旦涉及登录、评论、后台审核、站点设置这些能力，就会发现原来的结构难以支撑持续迭代。

## 这次重构的目标

- 保持前端页面风格不变
- 用真实接口替换原有的模拟数据
- 让评论、留言、审核、设置都落到后端
- 用单仓结构统一管理前后端代码

## 一个关键体会

先把接口契约稳定下来，再去做视觉和交互细节，整体效率会高很多。很多返工不是因为代码写错了，而是因为边界一开始没有定义清楚。

## 结语

如果你也准备把自己的博客从展示项目升级成真正可用的应用，希望这篇文章能帮你少走一些弯路。',
  'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop',
  '前端开发',
  DATE_SUB(NOW(), INTERVAL 30 DAY),
  612,
  86,
  33,
  'user-admin-001',
  'APPROVED'
),
(
  'article-cn-002',
  NOW(),
  NOW(),
  '写给团队的 TypeScript 约束方案',
  '在不牺牲开发速度的前提下，建立一套更稳的类型约束习惯。',
  '# 写给团队的 TypeScript 约束方案

> 类型系统不是为了制造门槛，而是为了让协作更轻松。

## 常见误区

很多团队把 TypeScript 用成了“给 any 换个名字”，表面上看有类型，真正出错的时候还是兜不住。

## 我更推荐的做法

- 接口返回值统一建模
- 组件 Props 保持最小暴露面
- 表单数据和接口数据分层处理
- 工具类型服务真实业务，而不是为了炫技

## 团队协作里的价值

当类型设计足够清晰时，新同学上手会更快，联调效率也更高，代码评审时的沟通成本会明显下降。

## 结语

比起追求复杂技巧，我更相信一套能被团队长期坚持的约束方案。',
  'https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1600&auto=format&fit=crop',
  '前端开发',
  DATE_SUB(NOW(), INTERVAL 24 DAY),
  488,
  63,
  25,
  'user-admin-001',
  'APPROVED'
),
(
  'article-cn-003',
  NOW(),
  NOW(),
  '从单体博客到业务后端：我为什么选择 Spring Boot',
  '用博客系统作为例子，聊聊为什么我更偏爱 Spring Boot 作为中后台项目的基础框架。',
  '# 从单体博客到业务后端：我为什么选择 Spring Boot

> 技术选型没有绝对正确，关键是是否适合当前阶段的目标。

## 为什么是 Spring Boot

对于需要认证、配置、持久化、文件上传和后台管理的项目来说，Spring Boot 依旧是很稳的起点。生态完整、约定清晰、资料丰富，是它最大的优势。

## 这类项目真正需要什么

- 较低的接入成本
- 明确的分层结构
- 可持续扩展的安全体系
- 与 MySQL、Redis 等基础设施良好配合

## 一个现实体验

当接口越来越多时，Spring Boot 的组织方式能让项目保持可读，不至于在中后期进入难维护状态。

## 结语

如果你的目标是把系统稳稳搭起来，而不是刻意追求新奇技术，Spring Boot 依然值得信赖。',
  'https://images.unsplash.com/photo-1555949963-aa79dcee981c?q=80&w=1600&auto=format&fit=crop',
  '后端架构',
  DATE_SUB(NOW(), INTERVAL 18 DAY),
  531,
  71,
  29,
  'user-admin-001',
  'APPROVED'
),
(
  'article-cn-004',
  NOW(),
  NOW(),
  'Redis 在博客系统里到底该怎么用',
  '缓存不是越多越好，关键是把它放在真正能提升体验的位置上。',
  '# Redis 在博客系统里到底该怎么用

> 把 Redis 当银弹，最后往往会给自己埋坑。

## 我在这个项目里的使用场景

- 登录态黑名单
- 邮箱验证码缓存
- 热点数据缓存
- 视频事件缓冲队列

## 为什么这些场景合适

它们都有共同点：数据变化快、生命周期短、对性能敏感，而且即使 Redis 临时不可用，也应该能够平稳降级。

## 一个原则

缓存首先是性能工具，其次才是架构装饰。能不用就不用，必须用的时候要把失效策略和降级策略一起想清楚。

## 结语

真正让系统稳定的从来不是“上了 Redis”，而是你是否知道该把它放在什么位置。',
  'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop',
  '后端架构',
  DATE_SUB(NOW(), INTERVAL 12 DAY),
  427,
  58,
  21,
  'user-admin-001',
  'APPROVED'
),
(
  'article-cn-005',
  NOW(),
  NOW(),
  '后台页面不只是能用，还应该让人愿意用',
  '谈谈后台审稿、设置页和文章管理页的交互细节，为什么会直接影响效率。',
  '# 后台页面不只是能用，还应该让人愿意用

> 一个让人不想打开的后台，再完整的功能也很难发挥价值。

## 常见问题

很多后台系统把所有内容堆在一个页面里，信息层级混乱、按钮密集，用户做一次简单操作也会觉得疲惫。

## 我更在意的细节

- 能不能快速看懂当前状态
- 能不能一眼识别高频操作
- 能不能减少误操作成本
- 在移动端是否也保持基本可用

## 好的后台应该是什么感觉

它不是花哨，也不是炫技，而是在长时间使用后依然让人觉得顺手、可靠、没有负担。

## 结语

设计不是为了好看，而是为了让人愿意持续使用系统。',
  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1600&auto=format&fit=crop',
  '产品设计',
  DATE_SUB(NOW(), INTERVAL 8 DAY),
  365,
  46,
  18,
  'user-admin-001',
  'APPROVED'
);

INSERT INTO article_tags (article_id, tag_name)
VALUES
  ('article-cn-001', 'React'),
  ('article-cn-001', '工程化'),
  ('article-cn-001', '接口联调'),
  ('article-cn-002', 'TypeScript'),
  ('article-cn-002', '代码规范'),
  ('article-cn-002', '团队协作'),
  ('article-cn-003', 'Spring Boot'),
  ('article-cn-003', 'Java'),
  ('article-cn-003', '系统设计'),
  ('article-cn-004', 'Redis'),
  ('article-cn-004', '缓存'),
  ('article-cn-004', '性能优化'),
  ('article-cn-005', '后台设计'),
  ('article-cn-005', '用户体验'),
  ('article-cn-005', '界面设计');

INSERT INTO comments (id, created_at, updated_at, article_id, parent_id, user_id, visitor_id, author_name, author_avatar, content)
VALUES
(
  'comment-cn-001',
  NOW(),
  NOW(),
  'article-cn-001',
  NULL,
  NULL,
  'visitor-linxia',
  '林夏',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=%E6%9E%97%E5%A4%8F',
  '这篇文章的结构特别清晰，前后端怎么拆、接口怎么对齐，都写得很实在。'
),
(
  'comment-cn-002',
  NOW(),
  NOW(),
  'article-cn-001',
  'comment-cn-001',
  NULL,
  'visitor-zhouzhou',
  '周舟',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=%E5%91%A8%E8%88%9F',
  '我也是按这个思路改的，先稳住数据结构，再慢慢收拾页面细节，确实省了很多返工。'
),
(
  'comment-cn-003',
  NOW(),
  NOW(),
  'article-cn-004',
  NULL,
  NULL,
  'visitor-anan',
  '安安',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=%E5%AE%89%E5%AE%89',
  '对 Redis 该不该上、该怎么用这件事讲得很清楚，看完之后心里有底多了。'
);

INSERT INTO guestbook_messages (id, created_at, updated_at, user_id, visitor_id, author_name, author_avatar, content)
VALUES
(
  'guestbook-cn-001',
  NOW(),
  NOW(),
  NULL,
  'guest-qinghe',
  '清和',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=%E6%B8%85%E5%92%8C',
  '页面风格很舒服，文章内容也扎实，已经收藏你的博客了，期待后续继续更新。'
),
(
  'guestbook-cn-002',
  NOW(),
  NOW(),
  NULL,
  'guest-ayuan',
  '阿远',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=%E9%98%BF%E8%BF%9C',
  '能感觉到这些文章不是简单整理出来的，很多地方都有自己的判断和经验，读起来很舒服。'
);

SET FOREIGN_KEY_CHECKS = 1;
