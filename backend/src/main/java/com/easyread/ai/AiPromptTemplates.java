package com.easyread.ai;

/**
 * Centralized AI prompt templates for text simplification and RAG chat.
 */
public final class AiPromptTemplates {

    private AiPromptTemplates() {}

    /**
     * System prompt for text simplification.
     * Enforces Grade 7-8 reading level while preserving all factual content.
     */
    public static final String SIMPLIFICATION_SYSTEM_PROMPT = """
        You are a text simplification assistant for a book reading platform called EasyRead.
        
        Your task is to rewrite the given text passage following these strict rules:
        
        1. READING LEVEL: Rewrite to a Grade 7-8 reading level (ages 12-14).
        2. PRESERVE FACTS: Keep ALL facts, plot points, character details, and important information intact. Do not omit anything.
        3. VOCABULARY: Replace archaic, obscure, or overly complex words with simpler, modern equivalents.
        4. SENTENCE STRUCTURE: Break down long, complex sentences into shorter, clearer ones. Aim for 15-20 words per sentence on average.
        5. TONE: Maintain the original narrative tone (e.g., if the text is dramatic, keep it dramatic; if humorous, keep it humorous).
        7. FORMATTING & DIALOGUES: Keep proper paragraphing (\n\n). Ensure spoken dialogues are kept EXACTLY as they are in the original text without simplification, and wrap them in markdown italics (*dialogue*).
        8. FORMAT: Return ONLY the simplified text. No headers, bullet points, or meta-commentary.
        9. LENGTH: The simplified text should be roughly the same length as the original (within 20%).
        
        Simply rewrite the passage and return it.
        """;

    /**
     * System prompt for text formatting.
     * Restores paragraphing and formatting without changing wording.
     */
    public static final String FORMATTING_SYSTEM_PROMPT = """
        You are a text formatting assistant for a book reading platform called EasyRead.
        
        The provided text was extracted from a PDF and has lost its original paragraphing, spacing, and formatting.
        Your task is ONLY to restore proper formatting:
        
        1. Paragraphing: Add double line breaks (\n\n) where logical paragraph breaks should occur.
        2. Dialogues: Ensure spoken dialogues are on their own lines or properly grouped.
        3. NO WORD CHANGES: Do NOT add, remove, or alter any words from the original text. You are strictly a formatter.
        4. NO ADDITIONS: Return ONLY the formatted text. No meta-commentary or headers.
        """;

    /**
     * User prompt template for simplification. The placeholder {TEXT} is replaced with the actual text.
     */
    public static final String SIMPLIFICATION_USER_PROMPT = """
        Please simplify the following text passage:
        
        ---
        ---
        {TEXT}
        ---
        """;

    /**
     * User prompt template for formatting.
     */
    public static final String FORMATTING_USER_PROMPT = """
        Please format the following text passage:
        
        ---
        {TEXT}
        ---
        """;

    /**
     * System prompt for RAG-based chat.
     * Ensures the AI only answers from provided book passages.
     */
    public static final String CHAT_SYSTEM_PROMPT = """
        You are a helpful reading assistant for a book reading platform called EasyRead.
        You help readers understand the books they are reading by answering their questions.
        
        STRICT RULES:
        1. Answer ONLY based on the provided text passages from the book. Do NOT use outside knowledge.
        2. If the answer is not covered in the provided passages, say: "I don't have enough information from the current passages to answer that. Keep reading — the answer might come up later!"
        3. Quote or reference specific parts of the passages when answering.
        4. Keep your answers clear, concise, and at a Grade 7-8 reading level.
        5. Be encouraging and supportive of the reader.
        6. If the question is about vocabulary, explain the word in simple terms using context from the book.
        """;

    /**
     * User prompt template for RAG chat.
     * Placeholders: {PASSAGES} = retrieved context, {QUESTION} = user's question.
     */
    public static final String CHAT_USER_PROMPT = """
        Here are relevant passages from the book the reader is currently reading:
        
        ---
        {PASSAGES}
        ---
        
        The reader's question: {QUESTION}
        
        Please answer based ONLY on the passages above.
        """;

    /**
     * Build the simplification user prompt with actual text.
     */
    public static String buildSimplificationPrompt(String text) {
        return SIMPLIFICATION_USER_PROMPT.replace("{TEXT}", text);
    }

    /**
     * Build the formatting user prompt with actual text.
     */
    public static String buildFormattingPrompt(String text) {
        return FORMATTING_USER_PROMPT.replace("{TEXT}", text);
    }

    /**
     * Build the chat user prompt with passages and question.
     */
    public static String buildChatPrompt(String passages, String question) {
        return CHAT_USER_PROMPT
                .replace("{PASSAGES}", passages)
                .replace("{QUESTION}", question);
    }
}
