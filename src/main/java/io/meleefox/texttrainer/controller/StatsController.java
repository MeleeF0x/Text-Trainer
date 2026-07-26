package io.meleefox.texttrainer.controller;

import io.meleefox.texttrainer.dto.StatsRequest;
import io.meleefox.texttrainer.model.TrainingResult;
import io.meleefox.texttrainer.model.User;
import io.meleefox.texttrainer.service.TrainingResultService;
import io.meleefox.texttrainer.service.UserService;

import org.springframework.http.ResponseEntity;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/stats")
public class StatsController {

    private final TrainingResultService resultService;
    private final UserService userService;

    public StatsController(TrainingResultService resultService, UserService userService) {
        this.resultService = resultService;
        this.userService = userService;
    }

    // Получение текущего пользователя из SecurityContext
    private User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth.getName();
        return userService.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Пользователь не найден"));
    }

    // Сохранение результата
    @PostMapping("/save")
    public ResponseEntity<?> saveResult(@RequestBody StatsRequest request) {
        User user = getCurrentUser();
        TrainingResult result = new TrainingResult(user, request.getSpeedCpm(), request.getAccuracy(),
                request.getErrors(), request.getTotalChars(), request.getDurationSeconds(),
                request.getMode(), request.getTargetLetter());
        resultService.saveResult(result);
        return ResponseEntity.ok(Map.of("message", "Результат сохранён"));
    }

    // Возврат лучшего результата пользователя
    @GetMapping("/best")
    public ResponseEntity<?> getBestResult() {
        try {
            User user = getCurrentUser();
            TrainingResult best = resultService.getBestResultForUser(user);
            if (best == null) {
                return ResponseEntity.ok(Map.of("message", "Нет сохранённых результатов"));
            }
            Map<String, Object> response = new HashMap<>();
            response.put("speedCpm", best.getSpeedCpm());
            response.put("accuracy", best.getAccuracy());
            response.put("errors", best.getErrors());
            response.put("totalChars", best.getTotalChars());
            response.put("durationSeconds", best.getDurationSeconds());
            response.put("mode", best.getMode());
            response.put("date", best.getCreatedAt().toString());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}