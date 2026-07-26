package io.meleefox.texttrainer.controller;

import io.meleefox.texttrainer.model.TextRequest;
import io.meleefox.texttrainer.model.TextResponse;
import io.meleefox.texttrainer.service.TextGenerationService;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/api/text")
@CrossOrigin(origins = "*")
public class TextController {

    private final TextGenerationService service;

    public TextController(TextGenerationService service) {
        this.service = service;
    }

    // Получение сгенерированного текста
    @PostMapping("/generate")
    public ResponseEntity<TextResponse> generate(@RequestBody TextRequest request) {
        TextResponse response = service.generateText(request);
        return ResponseEntity.ok(response);
    }
}
