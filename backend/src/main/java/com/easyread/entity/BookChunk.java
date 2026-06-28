package com.easyread.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "book_chunks", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"book_id", "chunk_index"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookChunk {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(name = "chunk_index", nullable = false)
    private Integer chunkIndex;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    /**
     * 768-dimensional vector embedding for semantic search (RAG).
     * Stored as a pgvector `vector(768)` column in PostgreSQL.
     * In H2 dev mode, this is stored as a simple float array string.
     */
    @Column(columnDefinition = "vector(768)")
    @org.hibernate.annotations.ColumnTransformer(write = "?::vector")
    private String embedding;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
