package com.easyread.controller;

import com.easyread.dto.BookDto;
import com.easyread.dto.ChunkResponse;
import com.easyread.dto.ProgressDto;
import com.easyread.service.BookService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BookController {

    private final BookService bookService;

    /**
     * GET /api/books — Search and paginate the book library.
     */
    @GetMapping
    public ResponseEntity<Page<BookDto>> getBooks(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String genre,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size,
            @AuthenticationPrincipal UserDetails userDetails) {
        String username = userDetails != null ? userDetails.getUsername() : null;
        return ResponseEntity.ok(bookService.getBooks(query, genre, page, size, username));
    }

    /**
     * GET /api/books/top — Get top 10 most viewed public books.
     */
    @GetMapping("/top")
    public ResponseEntity<List<BookDto>> getTopBooks(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(bookService.getTopBooks(limit));
    }

    /**
     * GET /api/books/{id} — Get a single book's details.
     */
    @GetMapping("/{id}")
    public ResponseEntity<BookDto> getBook(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.getBookById(id));
    }

    /**
     * GET /api/books/{id}/chunks/{n} — Fetch the Nth chunk, with optional simplification.
     */
    @GetMapping("/{id}/chunks/{n}")
    public ResponseEntity<ChunkResponse> getChunk(
            @PathVariable Long id,
            @PathVariable int n,
            @RequestParam(defaultValue = "false") boolean easyRead) {
        return ResponseEntity.ok(bookService.getChunk(id, n, easyRead));
    }

    /**
     * GET /api/books/{id}/chunks — Fetch a paginated list of chunks for a book.
     */
    @GetMapping("/{id}/chunks")
    public ResponseEntity<Page<ChunkResponse>> getChunks(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(bookService.getChunks(id, page, size));
    }

    /**
     * GET /api/books/{id}/prefetch/{n} — Background prefetch for upcoming chunks.
     */
    @GetMapping("/{id}/prefetch/{n}")
    public ResponseEntity<Void> prefetchChunk(
            @PathVariable Long id,
            @PathVariable int n,
            @RequestParam(defaultValue = "false") boolean easyRead) {
        bookService.prefetchChunk(id, n, easyRead);
        return ResponseEntity.accepted().build();
    }

    /**
     * GET /api/books/{id}/progress — Get reading progress (authenticated).
     */
    @GetMapping("/{id}/progress")
    public ResponseEntity<ProgressDto> getProgress(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(bookService.getProgress(userDetails.getUsername(), id));
    }

    /**
     * PUT /api/books/{id}/progress — Save reading progress (authenticated).
     */
    @PutMapping("/{id}/progress")
    public ResponseEntity<ProgressDto> saveProgress(
            @PathVariable Long id,
            @RequestParam int lastChunk,
            @RequestParam(defaultValue = "true") boolean easyReadOn,
            @AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(
            bookService.saveProgress(userDetails.getUsername(), id, lastChunk, easyReadOn));
    }
}
