package com.easyread.controller;

import com.easyread.dto.ChatRequest;
import com.easyread.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Chat controller for the RAG-based chatbot.
 * Currently returns full response; SSE streaming will be added in a future iteration.
 */
@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;

    /**
     * POST /api/books/{id}/chat — Ask the chatbot a question about the book.
     */
    @PostMapping(value = "/{id}/chat", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, String>> chat(
            @PathVariable Long id,
            @Valid @RequestBody ChatRequest request) {
        try {
            String answer = chatService.answerQuestion(
                id, request.getQuestion(), request.getCurrentChunk());
            return ResponseEntity.ok(Map.of("answer", answer));
        } catch (Exception e) {
            log.error("Chat failed for book {}: {}", id, e.getMessage());
            return ResponseEntity.internalServerError().body(
                Map.of("answer", "Sorry, I encountered an error while processing your question. Please try again."));
        }
    }
}
