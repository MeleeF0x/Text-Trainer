package io.meleefox.texttrainer.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TextResponse {
    private String text;
    private String mode;
    private Character targetLetter;
}
