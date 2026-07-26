package io.meleefox.texttrainer.service;

import io.meleefox.texttrainer.model.TrainingResult;
import io.meleefox.texttrainer.model.User;
import io.meleefox.texttrainer.repository.TrainingResultRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TrainingResultService {

    private final TrainingResultRepository resultRepository;

    public TrainingResultService(TrainingResultRepository resultRepository) {
        this.resultRepository = resultRepository;
    }

    @Transactional
    public TrainingResult saveResult(TrainingResult result) {
        return resultRepository.save(result);
    }

    public TrainingResult getBestResultForUser(User user) {
        return resultRepository.findTopByUserOrderBySpeedCpmDesc(user).orElse(null);
    }

    public List<TrainingResult> getHistoryForUser(User user) {
        return resultRepository.findByUserOrderByCreatedAtDesc(user);
    }
}