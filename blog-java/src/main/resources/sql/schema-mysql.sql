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
