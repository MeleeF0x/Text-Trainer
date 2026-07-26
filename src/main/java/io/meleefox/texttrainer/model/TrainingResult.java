package io.meleefox.texttrainer.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Column;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Setter
@Getter
@Entity
@Table(name = "training_results")
public class TrainingResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private int speedCpm;

    @Column(nullable = false)
    private int accuracy;

    @Column(nullable = false)
    private int errors;

    @Column(nullable = false)
    private int totalChars;

    @Column(nullable = false)
    private int durationSeconds;

    @Column(nullable = false)
    private String mode;

    private String targetLetter;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public TrainingResult() {}

    public TrainingResult(User user, int speedCpm, int accuracy, int errors, int totalChars,
                          int durationSeconds, String mode, String targetLetter) {
        this.user = user;
        this.speedCpm = speedCpm;
        this.accuracy = accuracy;
        this.errors = errors;
        this.totalChars = totalChars;
        this.durationSeconds = durationSeconds;
        this.mode = mode;
        this.targetLetter = targetLetter;
        this.createdAt = LocalDateTime.now();
    }

}