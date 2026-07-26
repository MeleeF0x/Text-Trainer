package io.meleefox.texttrainer.model;

import lombok.Data;
import jakarta.validation.constraints.NotNull;

@Data
public class TextRequest {
    @NotNull
    private Mode mode;
    private Character targetLetter;
}