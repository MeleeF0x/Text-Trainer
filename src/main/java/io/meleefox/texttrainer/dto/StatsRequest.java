package io.meleefox.texttrainer.dto;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class StatsRequest {
    private int speedCpm;
    private int accuracy;
    private int errors;
    private int totalChars;
    private int durationSeconds;
    private String mode;
    private String targetLetter;

}