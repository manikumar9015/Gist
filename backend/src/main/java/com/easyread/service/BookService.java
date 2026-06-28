package com.easyread.service;

import com.easyread.ai.AiFallbackChain;
import com.easyread.dto.BookDto;
import com.easyread.dto.ChunkResponse;
import com.easyread.dto.ProgressDto;
import com.easyread.entity.Book;
import com.easyread.entity.BookChunk;
import com.easyread.entity.User;
import com.easyread.entity.UserProgress;
import com.easyread.repository.BookChunkRepository;
import com.easyread.repository.BookRepository;
import com.easyread.repository.UserProgressRepository;
import com.easyread.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookService {

    private final BookRepository bookRepository;
    private final BookChunkRepository bookChunkRepository;
    private final UserProgressRepository userProgressRepository;
    private final UserRepository userRepository;
    private final AiFallbackChain aiFallbackChain;

    /**
     * Search and paginate books. Supports keyword search and genre filtering with visibility rules.
     */
    @Transactional(readOnly = true)
    public Page<BookDto> getBooks(String query, String genre, int page, int size, String username) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Long userId = -1L;
        if (StringUtils.hasText(username)) {
            userId = userRepository.findByUsername(username)
                    .map(u -> java.util.Objects.requireNonNull(u).getId())
                    .orElse(-1L);
        }

        Page<Book> booksPage;

        if (StringUtils.hasText(query) && StringUtils.hasText(genre)) {
            booksPage = bookRepository.searchByKeywordAndGenreVisible(query, genre, userId, pageable);
        } else if (StringUtils.hasText(query)) {
            booksPage = bookRepository.searchByKeywordVisible(query, userId, pageable);
        } else if (StringUtils.hasText(genre)) {
            booksPage = bookRepository.findByGenreVisible(genre, userId, pageable);
        } else {
            booksPage = bookRepository.findAllVisible(userId, pageable);
        }

        return booksPage.map(this::toDto);
    }

    /**
     * Get Top 10 most viewed public books.
     */
    @Transactional(readOnly = true)
    public List<BookDto> getTopBooks(int limit) {
        return bookRepository.findTopViewedPublicBooks(PageRequest.of(0, limit))
                .stream()
                .map(this::toDto)
                .toList();
    }

    /**
     * Fetch a specific text chunk, optionally simplified by AI.
     */
    @Transactional(readOnly = true)
    public ChunkResponse getChunk(Long bookId, int chunkIndex, boolean easyRead) {
        Book book = bookRepository.findById(java.util.Objects.requireNonNull(bookId))
                .orElseThrow(() -> new IllegalArgumentException("Book not found: " + bookId));

        BookChunk chunk = bookChunkRepository.findByBookIdAndChunkIndex(bookId, chunkIndex)
                .orElseThrow(() -> new IllegalArgumentException(
                    String.format("Chunk %d not found for book %d", chunkIndex, bookId)));

        String content = chunk.getContent();
        boolean simplified = false;

        if (easyRead) {
            try {
                content = aiFallbackChain.simplify(content);
                simplified = true;
            } catch (Exception e) {
                log.error("AI simplification failed for book {} chunk {}, returning raw text: {}",
                    bookId, chunkIndex, e.getMessage());
                // Fall back to raw text if AI fails completely
            }
        } else {
            try {
                content = aiFallbackChain.formatText(content);
            } catch (Exception e) {
                log.error("AI formatting failed for book {} chunk {}, returning raw text: {}",
                    bookId, chunkIndex, e.getMessage());
                // Fall back to raw text if AI fails completely
            }
        }

        return ChunkResponse.builder()
                .bookId(bookId)
                .chunkIndex(chunkIndex)
                .content(content)
                .simplified(simplified)
                .totalChunks(book.getTotalChunks())
                .build();
    }

    /**
     * Fetch a paginated list of text chunks for a specific book.
     */
    @Transactional(readOnly = true)
    public Page<ChunkResponse> getChunks(Long bookId, int page, int size) {
        Book book = bookRepository.findById(java.util.Objects.requireNonNull(bookId))
                .orElseThrow(() -> new IllegalArgumentException("Book not found: " + bookId));
                
        Pageable pageable = PageRequest.of(page, size, Sort.by("chunkIndex").ascending());
        Page<BookChunk> chunkPage = bookChunkRepository.findByBookIdOrderByChunkIndex(bookId, pageable);
        
        return chunkPage.map(chunk -> ChunkResponse.builder()
                .bookId(bookId)
                .chunkIndex(chunk.getChunkIndex())
                .content(chunk.getContent())
                .simplified(false)
                .totalChunks(book.getTotalChunks())
                .build());
    }

    /**
     * Background prefetch: trigger chunk loading to warm the cache.
     */
    @Async
    public void prefetchChunk(Long bookId, int chunkIndex, boolean easyRead) {
        try {
            getChunk(bookId, chunkIndex, easyRead);
            log.debug("Prefetched chunk {} for book {}", chunkIndex, bookId);
        } catch (Exception e) {
            log.warn("Prefetch failed for book {} chunk {}: {}", bookId, chunkIndex, e.getMessage());
        }
    }

    /**
     * Get reading progress for a user on a specific book.
     */
    @Transactional(readOnly = true)
    public ProgressDto getProgress(String username, Long bookId) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));

        Book book = bookRepository.findById(java.util.Objects.requireNonNull(bookId))
                .orElseThrow(() -> new IllegalArgumentException("Book not found: " + bookId));

        UserProgress progress = userProgressRepository.findByUserIdAndBookId(user.getId(), bookId)
                .orElse(UserProgress.builder()
                    .user(user)
                    .book(book)
                    .lastChunk(0)
                    .easyReadOn(true)
                    .build());

        return ProgressDto.builder()
                .bookId(bookId)
                .lastChunk(progress.getLastChunk())
                .easyReadOn(progress.getEasyReadOn())
                .totalChunks(book.getTotalChunks())
                .build();
    }

    /**
     * Save reading progress for a user.
     */
    @Transactional
    public ProgressDto saveProgress(String username, Long bookId, int lastChunk, boolean easyReadOn) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));

        Book book = bookRepository.findById(java.util.Objects.requireNonNull(bookId))
                .orElseThrow(() -> new IllegalArgumentException("Book not found: " + bookId));

        UserProgress progress = userProgressRepository.findByUserIdAndBookId(user.getId(), bookId)
                .orElse(UserProgress.builder()
                    .user(user)
                    .book(book)
                    .build());

        progress.setLastChunk(lastChunk);
        progress.setEasyReadOn(easyReadOn);
        userProgressRepository.save(progress);

        return ProgressDto.builder()
                .bookId(bookId)
                .lastChunk(lastChunk)
                .easyReadOn(easyReadOn)
                .totalChunks(book.getTotalChunks())
                .build();
    }

    /**
     * Get a single book by ID.
     */
    @Transactional
    public BookDto getBookById(Long id) {
        Book book = bookRepository.findById(java.util.Objects.requireNonNull(id))
                .orElseThrow(() -> new IllegalArgumentException("Book not found"));
        
        book.setViews(book.getViews() + 1);
        bookRepository.save(book);
        
        return toDto(book);
    }

    private BookDto toDto(Book book) {
        return BookDto.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .genre(book.getGenre())
                .description(book.getDescription())
                .thumbnailUrl(book.getThumbnailUrl())
                .totalChunks(book.getTotalChunks())
                .fileSource(book.getFileSource())
                .views(book.getViews())
                .uploaderUsername(book.getUploader() != null ? book.getUploader().getUsername() : null)
                .build();
    }

    @Transactional
    public void deleteBook(Long id) {
        bookRepository.deleteById(java.util.Objects.requireNonNull(id));
    }
}
