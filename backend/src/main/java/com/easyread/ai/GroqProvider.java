package com.easyread.ai;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Groq AI Provider — Priority 1 in the fallback chain.
 * Uses Groq's OpenAI-compatible API with ultra-fast inference.
 * Models tried in order: llama-3.1-8b-instant, llama-3.1-70b-versatile, mixtral-8x7b
 */
@Service
@Slf4j
public class GroqProvider implements AiProvider {

    private static final String API_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final List<String> MODELS = List.of(
        "llama-3.3-70b-versatile",
        "qwen/qwen3.6-27b",
        "meta-llama/llama-4-scout-17b-16e-instruct"
    );
    private static final Duration TIMEOUT = Duration.ofSeconds(30);

    private final WebClient webClient;
    private final String apiKey;

    public GroqProvider(@Value("${easyread.ai.groq-key:}") String apiKey) {
        this.apiKey = apiKey;
        this.webClient = WebClient.builder()
                .baseUrl(API_URL)
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Override
    public String simplify(String text) throws AiProviderException {
        return callWithModelFallback(
            AiPromptTemplates.SIMPLIFICATION_SYSTEM_PROMPT,
            AiPromptTemplates.buildSimplificationPrompt(text)
        );
    }

    @Override
    public String formatText(String text) throws AiProviderException {
        return callWithModelFallback(
            AiPromptTemplates.FORMATTING_SYSTEM_PROMPT,
            AiPromptTemplates.buildFormattingPrompt(text)
        );
    }

    @Override
    public String chat(String question, List<String> contextPassages) throws AiProviderException {
        String passages = String.join("\n\n---\n\n", contextPassages);
        return callWithModelFallback(
            AiPromptTemplates.CHAT_SYSTEM_PROMPT,
            AiPromptTemplates.buildChatPrompt(passages, question)
        );
    }

    /**
     * Try each model in order. If one fails, move to the next.
     */
    private String callWithModelFallback(String systemPrompt, String userPrompt) {
        AiProviderException lastException = null;

        for (String model : MODELS) {
            try {
                log.debug("Groq: Trying model {}", model);
                return callModel(model, systemPrompt, userPrompt);
            } catch (Exception e) {
                log.warn("Groq model {} failed: {}", model, e.getMessage());
                lastException = new AiProviderException("Groq", model, e.getMessage(), e);
            }
        }

        throw lastException != null ? lastException :
            new AiProviderException("Groq", "all", "All Groq models failed");
    }

    @SuppressWarnings("unchecked")
    private String callModel(String model, String systemPrompt, String userPrompt) {
        Map<String, Object> requestBody = Map.of(
            "model", model,
            "messages", List.of(
                Map.of("role", "system", "content", systemPrompt),
                Map.of("role", "user", "content", userPrompt)
            ),
            "temperature", 0.3,
            "max_tokens", 2048
        );

        Map<String, Object> response = webClient.post()
                .header("Authorization", "Bearer " + apiKey)
                .bodyValue(java.util.Objects.requireNonNull(requestBody))
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(TIMEOUT)
                .block();

        if (response == null) {
            throw new AiProviderException("Groq", model, "Null response received");
        }

        // Parse OpenAI-compatible response
        List<Map<String, Object>> choices = (List<Map<String, Object>>) response.get("choices");
        if (choices == null || choices.isEmpty()) {
            throw new AiProviderException("Groq", model, "No choices in response");
        }

        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
        String content = (String) message.get("content");

        if (!StringUtils.hasText(content)) {
            throw new AiProviderException("Groq", model, "Empty content in response");
        }

        log.info("Groq/{} responded successfully ({} chars)", model, content.length());
        return content.trim();
    }

    @Override
    public int getPriority() {
        return 1;
    }

    @Override
    public String getName() {
        return "Groq";
    }

    @Override
    public boolean isAvailable() {
        return StringUtils.hasText(apiKey);
    }
}
