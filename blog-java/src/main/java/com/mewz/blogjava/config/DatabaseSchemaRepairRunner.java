package com.mewz.blogjava.config;

import java.sql.Connection;
import java.sql.DatabaseMetaData;
import java.sql.SQLException;
import java.util.List;
import javax.sql.DataSource;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@Order(0)
@RequiredArgsConstructor
public class DatabaseSchemaRepairRunner implements CommandLineRunner {

  private static final Logger log = LoggerFactory.getLogger(DatabaseSchemaRepairRunner.class);

  private final DataSource dataSource;
  private final JdbcTemplate jdbcTemplate;

  @Override
  public void run(String... args) throws Exception {
    if (!isMysql()) {
      return;
    }

    List<String> statements = List.of(
        "ALTER TABLE articles MODIFY COLUMN content LONGTEXT NOT NULL",
        "ALTER TABLE articles MODIFY COLUMN cover LONGTEXT NULL",
        "ALTER TABLE comments MODIFY COLUMN content LONGTEXT NOT NULL",
        "ALTER TABLE guestbook_messages MODIFY COLUMN content LONGTEXT NOT NULL",
        "ALTER TABLE video_assets MODIFY COLUMN poster LONGTEXT NULL",
        "ALTER TABLE video_assets MODIFY COLUMN thumbnails_vtt LONGTEXT NULL",
        "ALTER TABLE video_danmaku MODIFY COLUMN text LONGTEXT NOT NULL",
        "ALTER TABLE video_danmaku MODIFY COLUMN style_json LONGTEXT NULL",
        "ALTER TABLE video_danmaku MODIFY COLUMN author_avatar LONGTEXT NULL",
        "ALTER TABLE video_events MODIFY COLUMN data_json LONGTEXT NULL");

    for (String statement : statements) {
      jdbcTemplate.execute(statement);
    }
    log.info("MySQL schema repair completed for long text columns");
  }

  private boolean isMysql() {
    try (Connection connection = dataSource.getConnection()) {
      DatabaseMetaData metaData = connection.getMetaData();
      String productName = metaData.getDatabaseProductName();
      return productName != null && productName.toLowerCase().contains("mysql");
    } catch (SQLException ex) {
      throw new IllegalStateException("Failed to inspect database type", ex);
    }
  }
}
