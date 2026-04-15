package com.mewz.blogjava.bootstrap;

import com.mewz.blogjava.article.ArticleEntity;
import com.mewz.blogjava.article.ArticleStatus;
import com.mewz.blogjava.article.mapper.ArticleRepository;
import com.mewz.blogjava.auth.SocialLinks;
import com.mewz.blogjava.comment.CommentEntity;
import com.mewz.blogjava.comment.mapper.CommentRepository;
import com.mewz.blogjava.common.JsonHelper;
import com.mewz.blogjava.guestbook.GuestbookMessageEntity;
import com.mewz.blogjava.guestbook.mapper.GuestbookMessageRepository;
import com.mewz.blogjava.settings.SiteSetting;
import com.mewz.blogjava.settings.mapper.SiteSettingRepository;
import com.mewz.blogjava.user.UserAccount;
import com.mewz.blogjava.user.mapper.UserRepository;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

  private final UserRepository userRepository;
  private final SiteSettingRepository siteSettingRepository;
  private final ArticleRepository articleRepository;
  private final CommentRepository commentRepository;
  private final GuestbookMessageRepository guestbookMessageRepository;
  private final PasswordEncoder passwordEncoder;
  private final JsonHelper jsonHelper;

  @Value("${app.admin.email:admin@example.com}")
  private String adminEmail;

  @Value("${app.admin.password:admin123}")
  private String adminPassword;

  @Override
  public void run(String... args) {
    UserAccount admin = ensureAdmin();
    ensureSettings();
    if (articleRepository.count() == 0) {
      seedArticles(admin);
    }
    if (guestbookMessageRepository.count() == 0) {
      seedGuestbook();
    }
  }

  private UserAccount ensureAdmin() {
    return userRepository.findByEmail(adminEmail).orElseGet(() -> {
      UserAccount admin = new UserAccount();
      admin.setEmail(adminEmail);
      admin.setName("樱花站长");
      admin.setPasswordHash(passwordEncoder.encode(adminPassword));
      admin.setAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=%E6%A8%B1%E8%8A%B1%E7%AB%99%E9%95%BF");
      admin.setBio("专注前端体验、后端架构与日常写作，喜欢把复杂问题讲清楚，也喜欢把普通日子记录下来。");
      SocialLinks socials = new SocialLinks();
      socials.setGithub("https://github.com/MewzCC");
      socials.setTwitter("https://x.com");
      socials.setBilibili("https://space.bilibili.com/1");
      socials.setDouyin("https://www.douyin.com");
      socials.setEmail(adminEmail);
      admin.setSocialsJson(jsonHelper.toJson(socials));
      admin.setRoles("admin,user");
      return userRepository.save(admin);
    });
  }

  private void ensureSettings() {
    if (siteSettingRepository.findById(1L).isEmpty()) {
      siteSettingRepository.save(new SiteSetting());
    }
  }

  private void seedArticles(UserAccount admin) {
    List<ArticleEntity> articles = List.of(
        createArticle(
            admin,
            "把个人博客从静态页面改造成前后端分离项目",
            "记录一次把展示型博客升级为可登录、可评论、可管理系统的完整过程。",
            "从接口设计、状态管理到部署习惯，这篇文章把整个重构过程拆成了能直接落地的步骤。",
            "前端开发",
            Set.of("React", "工程化", "接口联调"),
            30),
        createArticle(
            admin,
            "写给团队的 TypeScript 约束方案",
            "在不牺牲开发速度的前提下，建立一套更稳的类型约束习惯。",
            "文章围绕接口类型、组件 Props 设计、表单校验和公共工具类型，分享适合团队协作的实践。",
            "前端开发",
            Set.of("TypeScript", "代码规范", "团队协作"),
            24),
        createArticle(
            admin,
            "从单体博客到业务后端：我为什么选择 Spring Boot",
            "用博客系统作为例子，聊聊为什么我更偏爱 Spring Boot 作为中后台项目的基础框架。",
            "这篇文章会结合权限、配置、持久化与异常处理，解释框架选型背后的实际取舍。",
            "后端架构",
            Set.of("Spring Boot", "Java", "系统设计"),
            18),
        createArticle(
            admin,
            "Redis 在博客系统里到底该怎么用",
            "缓存不是越多越好，关键是把它放在真正能提升体验的位置上。",
            "文中会用登录态、验证码、视频事件缓冲和热点数据缓存几个场景来说清 Redis 的合理用法。",
            "后端架构",
            Set.of("Redis", "缓存", "性能优化"),
            12),
        createArticle(
            admin,
            "后台页面不只是能用，还应该让人愿意用",
            "谈谈后台审核、设置页和文章管理页的交互细节，为什么会直接影响效率。",
            "好的后台界面应该清晰、克制、可信赖，而不是把所有按钮堆在一起。",
            "产品设计",
            Set.of("后台设计", "用户体验", "界面设计"),
            8));

    articleRepository.saveAll(articles);

    CommentEntity first = new CommentEntity();
    first.setArticle(articles.get(0));
    first.setAuthorName("林夏");
    first.setAuthorAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=%E6%9E%97%E5%A4%8F");
    first.setVisitorId("seed-linxia");
    first.setContent("这篇文章写得很完整，尤其是接口拆分和目录整理那部分，刚好解决了我最近在做的项目问题。");
    commentRepository.save(first);

    CommentEntity reply = new CommentEntity();
    reply.setArticle(articles.get(0));
    reply.setParent(first);
    reply.setAuthorName("周舟");
    reply.setAuthorAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=%E5%91%A8%E8%88%9F");
    reply.setVisitorId("seed-zhouzhou");
    reply.setContent("我也有同感，尤其是把前后端接口契约先稳住，再做页面细节，后面会省很多麻烦。");
    commentRepository.save(reply);
  }

  private void seedGuestbook() {
    GuestbookMessageEntity first = new GuestbookMessageEntity();
    first.setAuthorName("清和");
    first.setAuthorAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=%E6%B8%85%E5%92%8C");
    first.setVisitorId("guest-1");
    first.setContent("页面风格很舒服，文章内容也扎实，已经收藏你的博客了，期待后续继续更新技术和生活类文章。");
    guestbookMessageRepository.save(first);

    GuestbookMessageEntity second = new GuestbookMessageEntity();
    second.setAuthorName("阿远");
    second.setAuthorAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=%E9%98%BF%E8%BF%9C");
    second.setVisitorId("guest-2");
    second.setContent("能感觉到这些文章不是简单摘抄出来的，很多地方都有自己的判断和经验，很受用。");
    guestbookMessageRepository.save(second);
  }

  private ArticleEntity createArticle(
      UserAccount admin,
      String title,
      String summary,
      String description,
      String category,
      Set<String> tags,
      int daysAgo) {
    ArticleEntity entity = new ArticleEntity();
    entity.setAuthor(admin);
    entity.setTitle(title);
    entity.setSummary(summary);
    entity.setContent(String.join("\n",
        "# " + title,
        "",
        "> " + summary,
        "",
        "## 写在前面",
        "",
        description,
        "",
        "## 这篇文章会讲什么",
        "- 为什么这个问题值得单独拿出来讲",
        "- 我在实际项目里踩过哪些坑",
        "- 最后沉淀成了什么样的实现方式",
        "",
        "## 一个简单示例",
        "```ts",
        "export async function loadArticle(id: string) {",
        "  const res = await fetch(`/api/articles/${id}`)",
        "  return res.json()",
        "}",
        "```",
        "",
        "## 结语",
        "",
        "如果你也在做类似的功能，希望这篇文章能帮你少走一些弯路。"));
    entity.setCover("https://images.unsplash.com/photo-1515879218367-8466d910aaa4?q=80&w=2069&auto=format&fit=crop");
    entity.setCategory(category);
    entity.setTags(tags);
    entity.setPublishDate(Instant.now().minus(daysAgo, ChronoUnit.DAYS));
    entity.setStatus(ArticleStatus.APPROVED);
    entity.setViews(100 + daysAgo * 17L);
    entity.setLikes(10 + daysAgo * 2L);
    entity.setFavorites(5 + daysAgo);
    return entity;
  }
}
