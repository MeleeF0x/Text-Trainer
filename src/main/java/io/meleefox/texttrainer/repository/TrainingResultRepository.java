package io.meleefox.texttrainer.repository;

import io.meleefox.texttrainer.model.TrainingResult;
import io.meleefox.texttrainer.model.User;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TrainingResultRepository extends JpaRepository<TrainingResult, Long> {

    // Получить лучший результат (по скорости) для пользователя
    @Query("SELECT t FROM TrainingResult t " +
            "WHERE t.user = :user " +
            "ORDER BY t.speedCpm " +
            "DESC LIMIT 1")

    Optional<TrainingResult> findTopByUserOrderBySpeedCpmDesc(@Param("user") User user);

    // Получить все результаты пользователя
    List<TrainingResult> findByUserOrderByCreatedAtDesc(User user);
}