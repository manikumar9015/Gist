package com.easyread.service;

import com.easyread.ai.AiFallbackChain;
import com.easyread.entity.BookChunk;
import com.easyread.repository.BookChunkRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * RAG-based chatbot service.
 * Retrieves relevant passages from the book via vector similarity search,
 * then asks the AI to answer based only on those passages.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private static final int TOP_K_PASSAGES = 3;

    private final BookChunkRepository bookChunkRepository;
    private final AiFallbackChain aiFallbackChain;

    /**
     * Answer a user's question about a specific book using RAG.
     *
     * In dev mode (H2, no pgvector), this falls back to returning chunks
     * near the user's current reading position instead of vector search.
     *
     * @param bookId       The book to search within
     * @param question     The user's question
     * @param currentChunk The chunk the user is currently reading (for context fallback)
     * @return The AI-generated answer
     */
    public String answerQuestion(Long bookId, String question, Integer currentChunk) {
        List<String> contextPassages;

        try {
            // Try vector similarity search (requires PostgreSQL + pgvector)
            // For now, we use a simple keyword approach as a fallback
            contextPassages = getContextPassages(bookId, question, currentChunk);
        } catch (Exception e) {
            log.warn("Vector search failed, falling back to positional context: {}", e.getMessage());
            contextPassages = getPositionalContext(bookId, currentChunk);
        }

        if (contextPassages.isEmpty()) {
            return "I couldn't find any relevant passages in this book to answer your question. " +
                   "Try asking about something specific that you've already read!";
        }

        log.info("Chat: Found {} context passages for book {} question: '{}'",
                contextPassages.size(), bookId, question.substring(0, Math.min(50, question.length())));

        return aiFallbackChain.chat(question, contextPassages);
    }

    /**
     * Get context passages using vector similarity search.
     * Falls back to positional context if embeddings aren't available.
     */
    private List<String> getContextPassages(Long bookId, String question, Integer currentChunk) {
        // TODO: When EmbeddingService is implemented, generate query embedding
        // and use bookChunkRepository.findSimilarChunks()
        // For now, use positional context as a reasonable fallback
        return getPositionalContext(bookId, currentChunk);
    }

    /**
     * Fallback: get chunks near the user's current reading position.
     * Returns the current chunk and its neighbors.
     */
    private List<String> getPositionalContext(Long bookId, Integer currentChunk) {
        int startChunk = Math.max(0, (currentChunk != null ? currentChunk : 0) - 1);
        int endChunk = startChunk + TOP_K_PASSAGES;

        List<BookChunk> chunks = new java.util.ArrayList<>();
        for (int i = startChunk; i < endChunk; i++) {
            bookChunkRepository.findByBookIdAndChunkIndex(bookId, i)
                    .ifPresent(chunks::add);
        }

        return chunks.stream()
                .map(chunk -> String.format("[Passage %d]\n%s", chunk.getChunkIndex(), chunk.getContent()))
                .collect(Collectors.toList());
    }
}
