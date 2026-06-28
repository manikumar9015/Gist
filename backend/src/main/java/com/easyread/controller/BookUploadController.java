package com.easyread.controller;

import com.easyread.dto.BookDto;
import com.easyread.service.PdfProcessingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@Slf4j
public class BookUploadController {

    private final PdfProcessingService pdfProcessingService;

    /**
     * POST /api/books/upload — Upload a user PDF, parse it, chunk it, and store it.
     */
    @PostMapping("/upload")
    public ResponseEntity<?> uploadBook(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "thumbnail", required = false) MultipartFile thumbnail,
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String author,
            @RequestParam(required = false) String genre,
            @AuthenticationPrincipal UserDetails userDetails) {
        try {
            BookDto book = pdfProcessingService.processUpload(
                file, thumbnail, title, author, genre, userDetails.getUsername());
            return ResponseEntity.status(HttpStatus.CREATED).body(book);
        } catch (IllegalArgumentException e) {
            log.warn("Upload validation failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Upload failed for user '{}': {}", userDetails.getUsername(), e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Upload failed: " + e.getMessage()));
        }
    }
}
