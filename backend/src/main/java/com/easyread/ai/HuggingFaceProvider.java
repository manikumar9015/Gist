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
 * Hugging Face AI Provider — Priority 3 (final fallback) in the chain.
 * Uses the HF Inference API for text generation.
 * Models tried in order: mistralai/Mistral-7B-Instruct-v0.3, microsoft/Phi-3-mini-4k-instruct
 */
@Service
@Slf4j
public class HuggingFaceProvider implements AiProvider {

    private static final String API_BASE = "https://api-inference.huggingface.co/models/";
    private static final List<String> MODELS = List.of(
        "meta-llama/Llama-3.1-8B-Instruct",
        "Qwen/Qwen3-32B",
        "google/gemma-4-31B-it"
    );
    private static final Duration TIMEOUT = Duration.ofSeconds(60); // HF can be slow

    private final WebClient webClient;
    private final String apiKey;

    public HuggingFaceProvider(@Value("${easyread.ai.huggingface-key:}") String apiKey) {
        this.apiKey = apiKey;
        this.webClient = WebClient.builder()
                .defaultHeader("Content-Type", MediaType.APPLICATION_JSON_VALUE)
                .build();
    }

    @Override
    public String simplify(String text) throws AiProviderException {
        String prompt = AiPromptTemplates.SIMPLIFICATION_SYSTEM_PROMPT + "\n\n" +
                AiPromptTemplates.buildSimplificationPrompt(text);
        return callWithModelFallback(prompt);
    }

    @Override
    public String formatText(String text) throws AiProviderException {
        String prompt = AiPromptTemplates.FORMATTING_SYSTEM_PROMPT + "\n\n" +
                AiPromptTemplates.buildFormattingPrompt(text);
        return callWithModelFallback(prompt);
    }

    @Override
    public String chat(String question, List<String> contextPassages) throws AiProviderException {
        String passages = String.join("\n\n---\n\n", contextPassages);
        String prompt = AiPromptTemplates.CHAT_SYSTEM_PROMPT + "\n\n" +
                AiPromptTemplates.buildChatPrompt(passages, question);
        return callWithModelFallback(prompt);
    }

    private String callWithModelFallback(String prompt) {
        AiProviderException lastException = null;

        for (String model : MODELS) {
            try {
                log.debug("HuggingFace: Trying model {}", model);
                return callModel(model, prompt);
            } catch (Exception e) {
                log.warn("HuggingFace model {} failed: {}", model, e.getMessage());
                lastException = new AiProviderException("HuggingFace", model, e.getMessage(), e);
            }
        }

        throw lastException != null ? lastException :
            new AiProviderException("HuggingFace", "all", "All HuggingFace models failed");
    }

    @SuppressWarnings("unchecked")
    private String callModel(String model, String prompt) {
        String url = API_BASE + model;

        Map<String, Object> requestBody = Map.of(
            "inputs", prompt,
            "parameters", Map.of(
                "max_new_tokens", 2048,
                "temperature", 0.3,
                "return_full_text", false
            )
        );

        // HF Inference API returns a list of generated text objects
        List<Map<String, Object>> response = webClient.post()
                .uri(url)
                .header("Authorization", "Bearer " + apiKey)
                .bodyValue(java.util.Objects.requireNonNull(requestBody))
                .retrieve()
                .bodyToMono(List.class)
                .timeout(TIMEOUT)
                .block();

        if (response == null || response.isEmpty()) {
            throw new AiProviderException("HuggingFace", model, "Null or empty response");
        }

        String generatedText = (String) response.get(0).get("generated_text");

        if (!StringUtils.hasText(generatedText)) {
            throw new AiProviderException("HuggingFace", model, "Empty generated_text");
        }

        log.info("HuggingFace/{} responded successfully ({} chars)", model, generatedText.length());
        return generatedText.trim();
    }

    @Override
    public int getPriority() {
        return 3;
    }

    @Override
    public String getName() {
        return "HuggingFace";
    }

    @Override
    public boolean isAvailable() {
        return StringUtils.hasText(apiKey);
    }
}
