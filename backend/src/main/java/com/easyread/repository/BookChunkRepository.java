package com.easyread.repository;

import com.easyread.entity.BookChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookChunkRepository extends JpaRepository<BookChunk, Long> {

    Optional<BookChunk> findByBookIdAndChunkIndex(Long bookId, Integer chunkIndex);

    List<BookChunk> findByBookIdOrderByChunkIndex(Long bookId);
    
    org.springframework.data.domain.Page<BookChunk> findByBookIdOrderByChunkIndex(Long bookId, org.springframework.data.domain.Pageable pageable);

    /**
     * Vector similarity search using pgvector cosine distance.
     * Finds the top N most semantically similar chunks to the query embedding.
     * Only works with PostgreSQL + pgvector extension.
     */
    @Query(value = """
        SELECT * FROM book_chunks
        WHERE book_id = :bookId
          AND embedding IS NOT NULL
        ORDER BY embedding <=> CAST(:queryEmbedding AS vector)
        LIMIT :limit
        """, nativeQuery = true)
    List<BookChunk> findSimilarChunks(
        @Param("bookId") Long bookId,
        @Param("queryEmbedding") String queryEmbedding,
        @Param("limit") int limit
    );

    long countByBookId(Long bookId);

    void deleteByBookId(Long bookId);
}
