package com.easyread.service;

import com.easyread.dto.BookDto;
import com.easyread.entity.Book;
import com.easyread.entity.BookChunk;
import com.easyread.entity.User;
import com.easyread.entity.UserBook;
import com.easyread.repository.BookChunkRepository;
import com.easyread.repository.BookRepository;
import com.easyread.repository.UserBookRepository;
import com.easyread.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.text.BreakIterator;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

/**
 * Handles PDF upload, text extraction, chunking, and storage.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class PdfProcessingService {

    private static final int TARGET_CHUNK_WORDS = 500;
    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

    private final BookRepository bookRepository;
    private final BookChunkRepository bookChunkRepository;
    private final UserRepository userRepository;
    private final UserBookRepository userBookRepository;
    private final CloudinaryService cloudinaryService;

    /**
     * Process an uploaded PDF: extract text, chunk it, and store in the database.
     *
     * @param file      The uploaded PDF file
     * @param thumbnail Optional thumbnail image
     * @param title     Book title (optional, defaults to filename)
     * @param author    Author name (optional)
     * @param genre     Genre (optional)
     * @param username  The authenticated user's username
     * @return The created book's DTO
     */
    @Transactional
    public BookDto processUpload(MultipartFile file, MultipartFile thumbnail, String title, String author,
                                  String genre, String username) throws IOException {
        // Validate
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File exceeds 50MB limit");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals("application/pdf")) {
            throw new IllegalArgumentException("Only PDF files are accepted");
        }

        // Extract text from PDF
        String fullText = extractTextFromPdf(file);
        if (fullText.isBlank()) {
            throw new IllegalArgumentException("Could not extract any text from the PDF. It may be image-based.");
        }

        // Chunk the text
        List<String> chunks = chunkText(fullText);

        // Determine title
        String originalFilename = file.getOriginalFilename();
        String bookTitle = (title != null && !title.isBlank()) ? title :
                (originalFilename != null ? originalFilename.replace(".pdf", "") : "Untitled");

        // Fetch user
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + username));

        // Upload Thumbnail if present
        String thumbnailUrl = null;
        log.info("Thumbnail parameter: present={}, empty={}", 
                thumbnail != null, thumbnail != null ? thumbnail.isEmpty() : "N/A");
        if (thumbnail != null && !thumbnail.isEmpty()) {
            try {
                log.info("Uploading thumbnail for book '{}': name={}, size={} bytes, contentType={}", 
                        bookTitle, thumbnail.getOriginalFilename(), thumbnail.getSize(), thumbnail.getContentType());
                thumbnailUrl = cloudinaryService.uploadImage(thumbnail);
                log.info("Thumbnail uploaded successfully: {}", thumbnailUrl);
            } catch (Exception e) {
                log.error("Thumbnail upload failed, proceeding without thumbnail", e);
            }
        } else {
            log.info("No thumbnail provided for book '{}'", bookTitle);
        }

        // Create Book record
        Book book = Book.builder()
                .title(bookTitle)
                .author(author)
                .genre(genre)
                .description("Uploaded PDF: " + bookTitle)
                .thumbnailUrl(thumbnailUrl)
                .totalChunks(chunks.size())
                .fileSource("UPLOAD")
                .uploader(user)
                .build();
        book = bookRepository.save(java.util.Objects.requireNonNull(book));

        // Create BookChunk records
        for (int i = 0; i < chunks.size(); i++) {
            BookChunk chunk = BookChunk.builder()
                    .book(book)
                    .chunkIndex(i)
                    .content(chunks.get(i))
                    .build();
            bookChunkRepository.save(java.util.Objects.requireNonNull(chunk));
        }

        // Track user-uploaded book (7-day expiry logic can still use this)
        UserBook userBook = UserBook.builder()
                .user(user)
                .book(book)
                .build();
        userBookRepository.save(java.util.Objects.requireNonNull(userBook));

        log.info("Processed PDF '{}': {} chunks created for book ID {}",
                bookTitle, chunks.size(), book.getId());

        return BookDto.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .genre(book.getGenre())
                .description(book.getDescription())
                .thumbnailUrl(book.getThumbnailUrl())
                .totalChunks(book.getTotalChunks())
                .fileSource(book.getFileSource())
                .build();
    }

    /**
     * Extract all text from a PDF using Apache PDFBox.
     */
    private String extractTextFromPdf(MultipartFile file) throws IOException {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        }
    }

    /**
     * Split text into ~500-word chunks while respecting sentence boundaries.
     * Uses Java's BreakIterator for reliable sentence detection.
     */
    protected List<String> chunkText(String fullText) {
        List<String> chunks = new ArrayList<>();
        BreakIterator sentenceIterator = BreakIterator.getSentenceInstance(Locale.US);
        sentenceIterator.setText(fullText);

        StringBuilder currentChunk = new StringBuilder();
        int wordCount = 0;

        int start = sentenceIterator.first();
        int end = sentenceIterator.next();

        while (end != BreakIterator.DONE) {
            String sentence = fullText.substring(start, end);
            int sentenceWords = sentence.split("\\s+").length;

            if (wordCount + sentenceWords > TARGET_CHUNK_WORDS && wordCount > 0) {
                // Current chunk is full, save it and start a new one
                chunks.add(currentChunk.toString().trim());
                currentChunk = new StringBuilder();
                wordCount = 0;
            }

            currentChunk.append(sentence);
            wordCount += sentenceWords;

            start = end;
            end = sentenceIterator.next();
        }

        // Don't forget the last chunk
        if (currentChunk.length() > 0) {
            chunks.add(currentChunk.toString().trim());
        }

        return chunks;
    }
}
