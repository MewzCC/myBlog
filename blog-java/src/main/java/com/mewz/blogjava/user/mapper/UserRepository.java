package com.mewz.blogjava.user.mapper;

import com.mewz.blogjava.user.*;

import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<UserAccount, String> {

  Optional<UserAccount> findByEmail(String email);

  Optional<UserAccount> findByName(String name);
}


