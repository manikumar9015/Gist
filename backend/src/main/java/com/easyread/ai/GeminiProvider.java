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
import java.util.Objects;


@Service
@Slf4j
public class GeminiProvider implements AiProvider {

    private static final String API_BASE = "https://generativelanguage.googleapis.com/v1beta/models/";
    private static final List<String> MODELS = List.of(
        "gemini-2.5-flash",
        "gemini-2.5-flash-lite"
    );
    private static final Duration TIMEOUT = Duration.ofSeconds(45);

    private final WebClient webClient;
    private final String apiKey;

    public GeminiProvider(@Value("${easyread.ai.gemini-key:}") String apiKey) {
        this.apiKey = apiKey;
        this.webClient = WebClient.builder()
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Override
    public String simplify(String text) throws AiProviderException {
        String combinedPrompt = AiPromptTemplates.SIMPLIFICATION_SYSTEM_PROMPT + "\n\n" +
                AiPromptTemplates.buildSimplificationPrompt(text);
        return callWithModelFallback(combinedPrompt);
    }

    @Override
    public String formatText(String text) throws AiProviderException {
        String combinedPrompt = AiPromptTemplates.FORMATTING_SYSTEM_PROMPT + "\n\n" +
                AiPromptTemplates.buildFormattingPrompt(text);
        return callWithModelFallback(combinedPrompt);
    }

    @Override
    public String chat(String question, List<String> contextPassages) throws AiProviderException {
        String passages = String.join("\n\n---\n\n", contextPassages);
        String combinedPrompt = AiPromptTemplates.CHAT_SYSTEM_PROMPT + "\n\n" +
                AiPromptTemplates.buildChatPrompt(passages, question);
        return callWithModelFallback(combinedPrompt);
    }

    private String callWithModelFallback(String prompt) {
        AiProviderException lastException = null;

        for (String model : MODELS) {
            try {
                log.debug("Gemini: Trying model {}", model);
                return callModel(model, prompt);
            } catch (Exception e) {
                log.warn("Gemini model {} failed: {}", model, e.getMessage());
                lastException = new AiProviderException("Gemini", model, e.getMessage(), e);
            }
        }

        throw lastException != null ? lastException :
            new AiProviderException("Gemini", "all", "All Gemini models failed");
    }

    @SuppressWarnings("unchecked")
    private String callModel(String model, String prompt) {
        String url = API_BASE + model + ":generateContent?key=" + apiKey;

        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(
                    Map.of("text", prompt)
                ))
            ),
            "generationConfig", Map.of(
                "temperature", 0.3,
                "maxOutputTokens", 2048
            )
        );

        Map<String, Object> response = webClient.post()
                .uri(url)
                .bodyValue(Objects.requireNonNull(requestBody))
                .retrieve()
                .bodyToMono(Map.class)
                .timeout(TIMEOUT)
                .block();

        if (response == null) {
            throw new AiProviderException("Gemini", model, "Null response received");
        }

        // Parse Gemini response format
        List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
        if (candidates == null || candidates.isEmpty()) {
            throw new AiProviderException("Gemini", model, "No candidates in response");
        }

        Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
        String text = (String) parts.get(0).get("text");

        if (!StringUtils.hasText(text)) {
            throw new AiProviderException("Gemini", model, "Empty text in response");
        }

        log.info("Gemini/{} responded successfully ({} chars)", model, text.length());
        return text.trim();
    }

    @Override
    public int getPriority() {
        return 2;
    }

    @Override
    public String getName() {
        return "Gemini";
    }

    @Override
    public boolean isAvailable() {
        return StringUtils.hasText(apiKey);
    }
}
