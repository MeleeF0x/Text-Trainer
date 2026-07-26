package io.meleefox.texttrainer.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.annotation.PostConstruct;

import io.meleefox.texttrainer.model.Mode;
import io.meleefox.texttrainer.model.TextRequest;
import io.meleefox.texttrainer.model.TextResponse;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.Random;

@Service
public class TextGenerationService {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private List<String> preparedTexts;
    private List<String> wordBank;
    private final Random random = new Random();

    // Загрузка данных из JSON
    @PostConstruct
    public void init() {
        try {
            preparedTexts = loadJsonList("data/prepared_texts.json");
            wordBank = loadJsonList("data/word_bank.json");
        } catch (IOException e) {
            throw new RuntimeException("Не удалось загрузить файлы с данными", e);
        }
    }

    private List<String> loadJsonList(String path) throws IOException {
        ClassPathResource resource = new ClassPathResource(path);
        try (InputStream is = resource.getInputStream()) {
            return objectMapper.readValue(is, new TypeReference<List<String>>() {});
        }
    }

    // Общий метод генерации текста
    public TextResponse generateText(TextRequest request) {
        if (request.getMode() == Mode.GENERAL) {
            if (preparedTexts == null || preparedTexts.isEmpty()) {
                throw new IllegalStateException("Нет заготовленных текстов");
            }
            String selected = preparedTexts.get(random.nextInt(preparedTexts.size()));
            return new TextResponse(selected, "general", null);
        } else if (request.getMode() == Mode.TARGETED) {
            Character target = request.getTargetLetter();
            if (target == null) {
                throw new IllegalArgumentException("Для целевого режима необходимо указать букву");
            }
            String generated = generateTargetedText(target, 50);
            return new TextResponse(generated, "targeted", target);
        } else {
            throw new IllegalArgumentException("Неизвестный режим");
        }
    }

    // Генерация текста по конкретной букве
    private String generateTargetedText(char target, int wordCount) {
        if (wordBank == null || wordBank.isEmpty()) {
            return "Банк слов пуст. Добавьте слова в файл word_bank.json.";
        }

        List<String> candidates = wordBank.stream()
                .filter(word -> word.indexOf(target) >= 0 || word.indexOf(Character.toUpperCase(target)) >= 0)
                .toList();

        if (candidates.isEmpty()) {
            return "Слов с буквой " + target + " не найдено. Добавьте слова в word_bank.json.";
        }

        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < wordCount; i++) {
            String word = candidates.get(random.nextInt(candidates.size()));
            sb.append(word);
            if (i < wordCount - 1) sb.append(" ");
        }
        return sb.toString();
    }
}