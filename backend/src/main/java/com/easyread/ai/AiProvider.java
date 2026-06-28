package com.easyread.ai;

import java.util.List;

/**
 * Common interface for all AI providers in the fallback chain.
 * Each provider implements simplification and chat capabilities.
 */
public interface AiProvider {

    /**
     * Simplify the given text to a Grade 7-8 reading level.
     *
     * @param text The raw text to simplify
     * @return The simplified text
     * @throws AiProviderException if all models within this provider fail
     */
    String simplify(String text) throws AiProviderException;

    /**
     * Format the given text to restore paragraphing and dialogue spacing.
     *
     * @param text The raw text to format
     * @return The formatted text
     * @throws AiProviderException if all models within this provider fail
     */
    String formatText(String text) throws AiProviderException;

    /**
     * Answer a question using RAG context passages from the book.
     *
     * @param question       The user's question
     * @param contextPassages The top-N relevant passages retrieved via vector search
     * @return The AI-generated answer
     * @throws AiProviderException if all models within this provider fail
     */
    String chat(String question, List<String> contextPassages) throws AiProviderException;

    /**
     * Priority order in the fallback chain (lower = higher priority).
     * 1 = Groq, 2 = Gemini, 3 = HuggingFace
     */
    int getPriority();

    /**
     * Human-readable name for logging and circuit breaker identification.
     */
    String getName();

    /**
     * Whether this provider is currently configured with valid API keys.
     */
    boolean isAvailable();
}
