package io.meleefox.texttrainer.model;

import lombok.Data;
import java.util.Map;

@Data
public class TypingStats {
    private int totalChars;
    private int errors;
    private int durationSeconds;
    private int speedCpm;
    private Map<Character, Integer> letterErrors;
}