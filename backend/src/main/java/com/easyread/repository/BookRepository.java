package com.easyread.repository;

import com.easyread.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    /**
     * Full-text search across title, author, and description using PostgreSQL tsvector.
     * Includes visibility logic: admin uploaded books + user's own books.
     */
    @Query(value = """
        SELECT b.* FROM books b
        LEFT JOIN users u ON b.uploader_id = u.id
        WHERE (u.role = 'ADMIN' OR b.uploader_id = :userId)
          AND to_tsvector('english', coalesce(b.title, '') || ' ' || coalesce(b.author, '') || ' ' || coalesce(b.description, ''))
              @@ plainto_tsquery('english', :query)
        ORDER BY ts_rank(
            to_tsvector('english', coalesce(b.title, '') || ' ' || coalesce(b.author, '') || ' ' || coalesce(b.description, '')),
            plainto_tsquery('english', :query)
        ) DESC
        """, nativeQuery = true)
    Page<Book> fullTextSearchVisible(@Param("query") String query, @Param("userId") Long userId, Pageable pageable);

    /**
     * Simple LIKE-based search for H2 dev mode compatibility.
     */
    @Query("""
        SELECT b FROM Book b
        LEFT JOIN b.uploader u
        WHERE (u.role = 'ADMIN' OR b.uploader.id = :userId)
          AND (LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(b.description) LIKE LOWER(CONCAT('%', :query, '%')))
        """)
    Page<Book> searchByKeywordVisible(@Param("query") String query, @Param("userId") Long userId, Pageable pageable);

    /**
     * Filter by genre with pagination and visibility.
     */
    @Query("""
        SELECT b FROM Book b
        LEFT JOIN b.uploader u
        WHERE (u.role = 'ADMIN' OR b.uploader.id = :userId)
          AND LOWER(b.genre) = LOWER(:genre)
        """)
    Page<Book> findByGenreVisible(@Param("genre") String genre, @Param("userId") Long userId, Pageable pageable);

    /**
     * Search + filter by genre + visibility.
     */
    @Query("""
        SELECT b FROM Book b
        LEFT JOIN b.uploader u
        WHERE (u.role = 'ADMIN' OR b.uploader.id = :userId)
          AND (LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(b.author) LIKE LOWER(CONCAT('%', :query, '%'))
           OR LOWER(b.description) LIKE LOWER(CONCAT('%', :query, '%')))
          AND LOWER(b.genre) = LOWER(:genre)
        """)
    Page<Book> searchByKeywordAndGenreVisible(@Param("query") String query, @Param("genre") String genre, @Param("userId") Long userId, Pageable pageable);

    /**
     * Find all visible books.
     */
    @Query("""
        SELECT b FROM Book b
        LEFT JOIN b.uploader u
        WHERE (u.role = 'ADMIN' OR b.uploader.id = :userId)
        """)
    Page<Book> findAllVisible(@Param("userId") Long userId, Pageable pageable);

    /**
     * Top 10 most viewed public (admin) books.
     */
    @Query("""
        SELECT b FROM Book b
        LEFT JOIN b.uploader u
        WHERE u.role = 'ADMIN'
        ORDER BY b.views DESC
        """)
    List<Book> findTopViewedPublicBooks(Pageable pageable);
}
