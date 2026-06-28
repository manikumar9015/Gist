package com.easyread.ai;

import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import io.github.resilience4j.circuitbreaker.CircuitBreakerRegistry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.function.Supplier;

/**
 * AI Fallback Chain — orchestrates the waterfall pattern across all AI providers.
 * Each provider call is wrapped in a Resilience4j circuit breaker.
 * If a provider's circuit is OPEN, it is skipped entirely.
 */
@Service
@Slf4j
public class AiFallbackChain {

    private final List<AiProvider> providers;
    private final CircuitBreakerRegistry circuitBreakerRegistry;

    public AiFallbackChain(List<AiProvider> providers, CircuitBreakerRegistry circuitBreakerRegistry) {
        // Sort by priority (lower number = higher priority)
        this.providers = providers.stream()
                .filter(provider -> provider != null && provider.isAvailable())
                .sorted(Comparator.comparingInt(provider -> provider.getPriority()))
                .toList();
        this.circuitBreakerRegistry = circuitBreakerRegistry;

        log.info("AI Fallback Chain initialized with {} providers: {}",
                this.providers.size(),
                this.providers.stream().map(provider -> provider.getName()).toList());
    }

    /**
     * Simplify text using the fallback chain.
     */
    public String simplify(String text) {
        return executeWithFallback(provider -> provider.simplify(text));
    }

    /**
     * Format text using the fallback chain.
     */
    public String formatText(String text) {
        return executeWithFallback(provider -> provider.formatText(text));
    }

    /**
     * Chat using the fallback chain.
     */
    public String chat(String question, List<String> contextPassages) {
        return executeWithFallback(provider -> provider.chat(question, contextPassages));
    }

    /**
     * Execute an AI operation through the fallback chain.
     * Tries each provider in priority order, skipping those with open circuit breakers.
     */
    private String executeWithFallback(AiOperation operation) {
        if (providers.isEmpty()) {
            throw new AiProviderException("System", "none",
                "No AI providers are configured. Please set at least one API key.");
        }

        AiProviderException lastException = null;

        for (AiProvider provider : providers) {
            String cbName = provider.getName().toLowerCase() + "CircuitBreaker";
            CircuitBreaker circuitBreaker = circuitBreakerRegistry.circuitBreaker(cbName);

            // Check if circuit is open (provider is in cooldown)
            if (circuitBreaker.getState() == CircuitBreaker.State.OPEN) {
                log.info("Skipping {} — circuit breaker is OPEN (cooldown)", provider.getName());
                continue;
            }

            try {
                // Wrap the provider call with the circuit breaker
                Supplier<String> decoratedCall = CircuitBreaker.decorateSupplier(
                    circuitBreaker,
                    () -> operation.execute(provider)
                );

                String result = decoratedCall.get();
                log.info("AI request succeeded via {}", provider.getName());
                return result;

            } catch (Exception e) {
                log.warn("Provider {} failed (CB state: {}): {}",
                    provider.getName(),
                    circuitBreaker.getState(),
                    e.getMessage());
                lastException = e instanceof AiProviderException ape ? ape :
                    new AiProviderException(provider.getName(), "unknown", e.getMessage(), e);
            }
        }

        throw lastException != null ? lastException :
            new AiProviderException("System", "all", "All AI providers exhausted");
    }

    /**
     * Functional interface for AI operations (simplify or chat).
     */
    @FunctionalInterface
    private interface AiOperation {
        String execute(AiProvider provider) throws AiProviderException;
    }
}
