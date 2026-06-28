package com.easyread.ai;

/**
 * Thrown when an AI provider fails to process a request.
 * This includes rate limits, timeouts, model errors, and invalid responses.
 */
public class AiProviderException extends RuntimeException {

    private final String providerName;
    private final String modelName;

    public AiProviderException(String providerName, String modelName, String message) {
        super(String.format("[%s/%s] %s", providerName, modelName, message));
        this.providerName = providerName;
        this.modelName = modelName;
    }

    public AiProviderException(String providerName, String modelName, String message, Throwable cause) {
        super(String.format("[%s/%s] %s", providerName, modelName, message), cause);
        this.providerName = providerName;
        this.modelName = modelName;
    }

    public String getProviderName() {
        return providerName;
    }

    public String getModelName() {
        return modelName;
    }
}
