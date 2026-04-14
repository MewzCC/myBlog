package com.mewz.blogjava.bootstrap;

import com.mewz.blogjava.article.ArticleEntity;
import com.mewz.blogjava.article.mapper.ArticleRepository;
import com.mewz.blogjava.article.ArticleStatus;
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
      admin.setName("Admin");
      admin.setPasswordHash(passwordEncoder.encode(adminPassword));
      admin.setAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=Admin");
      admin.setBio("Full-stack developer, blogger, and long-term learner.");
      SocialLinks socials = new SocialLinks();
      socials.setGithub("https://github.com/MewzCC");
      socials.setTwitter("https://twitter.com");
      socials.setBilibili("https://bilibili.com");
      socials.setDouyin("https://douyin.com");
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
        createArticle(admin, "React 19 and the future of concurrent rendering",
            "A deep dive into React 19 features and how they change app architecture.",
            "A practical overview of React 19, compiler work, and server-driven UI.",
            "frontend",
            Set.of("React", "Frontend", "Performance"),
            30),
        createArticle(admin, "TypeScript patterns that scale in product teams",
            "Reusable typing strategies for large front-end codebases.",
            "How to keep type safety high without slowing teams down.",
            "frontend",
            Set.of("TypeScript", "JavaScript"),
            24),
        createArticle(admin, "Distributed transaction trade-offs in microservices",
            "Saga, TCC, and compensation patterns explained with product examples.",
            "A backend-focused article on consistency patterns for business systems.",
            "backend",
            Set.of("Backend", "Architecture", "Microservices"),
            18),
        createArticle(admin, "Building media workflows with Spring Boot and Redis",
            "Using Redis buffers and scheduled persistence for event-heavy systems.",
            "A walkthrough of durable event pipelines for media products.",
            "backend",
            Set.of("Spring Boot", "Redis", "Video"),
            12),
        createArticle(admin, "Designing delightful developer-facing dashboards",
            "How visual hierarchy and motion improve admin productivity.",
            "UX principles for internal tools and review workflows.",
            "design",
            Set.of("Design", "Dashboard", "UI"),
            8));

    articleRepository.saveAll(articles);

    CommentEntity first = new CommentEntity();
    first.setArticle(articles.get(0));
    first.setAuthorName("Alice");
    first.setAuthorAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=Alice");
    first.setVisitorId("seed-alice");
    first.setContent("This article is very practical. The migration notes were especially helpful.");
    commentRepository.save(first);

    CommentEntity reply = new CommentEntity();
    reply.setArticle(articles.get(0));
    reply.setParent(first);
    reply.setAuthorName("Bob");
    reply.setAuthorAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=Bob");
    reply.setVisitorId("seed-bob");
    reply.setContent("Same here. We used the same approach in our dashboard rewrite.");
    commentRepository.save(reply);
  }

  private void seedGuestbook() {
    GuestbookMessageEntity first = new GuestbookMessageEntity();
    first.setAuthorName("Reader");
    first.setAuthorAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=Reader");
    first.setVisitorId("guest-1");
    first.setContent("The new backend integration is shaping up nicely. Looking forward to more posts.");
    guestbookMessageRepository.save(first);

    GuestbookMessageEntity second = new GuestbookMessageEntity();
    second.setAuthorName("Visitor");
    second.setAuthorAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=Visitor");
    second.setVisitorId("guest-2");
    second.setContent("Thanks for sharing detailed engineering writeups. They are useful and easy to follow.");
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
    entity.setContent("""
# %s

> %s

## Overview

%s

## Key points

- Keep the implementation boring and robust.
- Prefer interfaces that align with the front-end contract.
- Make caching a performance tool instead of a source of inconsistency.

## Example

```ts
export async function loadArticle(id: string) {
  const res = await fetch(`/api/articles/${id}`)
  return res.json()
}
```

## Closing

This seeded article exists so the UI has realistic content to render during local development.
""".formatted(title, summary, description));
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

