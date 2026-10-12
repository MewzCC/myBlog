package com.mewz.blogjava.article;

import static org.assertj.core.api.Assertions.assertThat;

import com.mewz.blogjava.article.mapper.ArticleReactionRepository;
import com.mewz.blogjava.article.service.ArticleService;
import com.mewz.blogjava.auth.service.AuthService;
import com.mewz.blogjava.comment.mapper.CommentRepository;
import com.mewz.blogjava.common.service.ActorService;
import com.mewz.blogjava.config.JpaConfig;
import com.mewz.blogjava.meta.service.MetaService;
import com.mewz.blogjava.user.UserAccount;
import java.time.Instant;
import java.util.Set;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;

@DataJpaTest(properties = "spring.jpa.properties.hibernate.query.fail_on_pagination_over_collection_fetch=true")
@Import({ArticleService.class, JpaConfig.class})
class ArticlePaginationTests {

  @Autowired private ArticleService service;
  @Autowired private TestEntityManager entityManager;
  @MockBean private AuthService authService;
  @MockBean private ActorService actorService;
  @MockBean private MetaService metaService;
  @MockBean private ArticleReactionRepository reactionRepository;
  @MockBean private CommentRepository commentRepository;

  @BeforeEach
  void seed() {
    UserAccount author = new UserAccount();
    author.setEmail("pagination@example.com");
    author.setName("Pagination author");
    author.setPasswordHash("test");
    author.setAvatar("");
    entityManager.persist(author);
    article(author, "Newest", "plain", "plain", "front-end", Set.of("React", "Java"), 4, ArticleStatus.APPROVED);
    article(author, "Older", "100%_literal", "plain", "front-end", Set.of("REACT", "Other"), 3, ArticleStatus.APPROVED);
    article(author, "Body match", "plain", "x".repeat(1000) + "Needle in body", "backend", Set.of("Java"), 2, ArticleStatus.APPROVED);
    article(author, "Pending", "plain", "plain", "front-end", Set.of("React"), 5, ArticleStatus.PENDING);
    entityManager.flush();
    entityManager.clear();
  }

  @Test
  void paginatesFilteredArticlesAndCountsWithoutDuplicateTags() {
    ArticleListResponse first = service.getArticles(1, 1, null, " FRONTEND ", " react ", false);
    ArticleListResponse second = service.getArticles(2, 1, null, "frontend", "react", false);
    assertThat(first.getTotal()).isEqualTo(2);
    assertThat(first.getList()).extracting(ArticleSummaryDto::getTitle).containsExactly("Newest");
    assertThat(second.getTotal()).isEqualTo(2);
    assertThat(second.getList()).extracting(ArticleSummaryDto::getTitle).containsExactly("Older");
    assertThat(service.getArticles(3, 1, null, "frontend", "react", false).getList()).isEmpty();
  }

  @Test
  void preservesLiteralSearchAndSearchesBody() {
    assertThat(service.getArticles(1, 10, "%_", null, null, false).getList())
        .extracting(ArticleSummaryDto::getTitle).containsExactly("Older");
    assertThat(service.getArticles(1, 10, " NEEDLE ", null, null, false).getList())
        .extracting(ArticleSummaryDto::getTitle).containsExactly("Body match");
    assertThat(service.getArticles(1, 10, "newest", null, null, false).getList())
        .extracting(ArticleSummaryDto::getTitle).containsExactly("Newest");
  }

  @Test
  void supportsAdminStatusesAndLargePageNumbers() {
    assertThat(service.getArticles(1, 10, null, null, null, false).getTotal()).isEqualTo(3);
    assertThat(service.getArticles(1, 10, null, null, null, true).getTotal()).isEqualTo(4);
    assertThat(service.getArticles(Integer.MAX_VALUE, Integer.MAX_VALUE, null, null, null, false).getList()).isEmpty();
    assertThat(service.getArticles(0, 0, null, null, null, false).getList()).hasSize(3);
  }

  private void article(UserAccount author, String title, String summary, String content, String category,
      Set<String> tags, int day, ArticleStatus status) {
    ArticleEntity article = new ArticleEntity();
    article.setAuthor(author);
    article.setTitle(title);
    article.setSummary(summary);
    article.setContent(content);
    article.setCategory(category);
    article.setTags(tags);
    article.setPublishDate(Instant.parse("2026-01-0" + day + "T00:00:00Z"));
    article.setStatus(status);
    entityManager.persist(article);
  }
}
