package com.mewz.blogjava.guestbook.mapper;

import com.mewz.blogjava.guestbook.*;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface GuestbookMessageRepository extends JpaRepository<GuestbookMessageEntity, String> {

  List<GuestbookMessageEntity> findAllByOrderByCreatedAtDesc();
}


