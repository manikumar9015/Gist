package com.easyread.repository;

import com.easyread.entity.UserBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface UserBookRepository extends JpaRepository<UserBook, Long> {

    List<UserBook> findByUserId(Long userId);

    /**
     * Find all user-uploaded books that have expired (past their 7-day window).
     */
    List<UserBook> findByExpiresAtBefore(LocalDateTime now);
}
