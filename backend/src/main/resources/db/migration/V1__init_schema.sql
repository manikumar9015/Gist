-- V1: Initialize EasyRead database schema
-- Enable extensions (PostgreSQL only - skipped in H2 dev mode)
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================
-- Books table
-- ============================================
CREATE TABLE books (
    id              BIGSERIAL PRIMARY KEY,
    title           VARCHAR(500) NOT NULL,
    author          VARCHAR(300),
    genre           VARCHAR(100),
    description     TEXT,
    thumbnail_url   VARCHAR(1000),
    total_chunks    INTEGER DEFAULT 0,
    file_source     VARCHAR(50) DEFAULT 'UPLOAD',
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
);

-- Full-text search index on title + author + description
CREATE INDEX idx_books_fts ON books
    USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(author, '') || ' ' || coalesce(description, '')));

-- Trigram index for partial/fuzzy matching
CREATE INDEX idx_books_title_trgm ON books USING GIN (title gin_trgm_ops);

-- ============================================
-- Book chunks (with vector embeddings for RAG)
-- ============================================
CREATE TABLE book_chunks (
    id              BIGSERIAL PRIMARY KEY,
    book_id         BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    chunk_index     INTEGER NOT NULL,
    content         TEXT NOT NULL,
    embedding       vector(768),
    created_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(book_id, chunk_index)
);

CREATE INDEX idx_chunks_book_order ON book_chunks(book_id, chunk_index);

-- IVFFlat index for vector similarity search
-- Note: This index requires existing data to build properly.
-- For initial setup with no data, consider creating this after data insertion,
-- or use HNSW index instead which doesn't require training data.

-- ============================================
-- Users table
-- ============================================
CREATE TABLE users (
    id              BIGSERIAL PRIMARY KEY,
    username        VARCHAR(100) UNIQUE NOT NULL,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW()
);

-- ============================================
-- User reading progress
-- ============================================
CREATE TABLE user_progress (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id         BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    last_chunk      INTEGER DEFAULT 0,
    easy_read_on    BOOLEAN DEFAULT TRUE,
    updated_at      TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, book_id)
);

-- ============================================
-- User-uploaded books (auto-expire tracking)
-- ============================================
CREATE TABLE user_books (
    id              BIGSERIAL PRIMARY KEY,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id         BIGINT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    uploaded_at     TIMESTAMP DEFAULT NOW(),
    expires_at      TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days')
);

CREATE INDEX idx_user_books_expiry ON user_books(expires_at);
