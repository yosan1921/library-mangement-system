package com.example.lms.repository;

import com.example.lms.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    List<Notification> findByMemberId(String memberId);
    List<Notification> findByStatus(String status);
    List<Notification> findByCategory(String category);
    List<Notification> findByMemberIdAndStatus(String memberId, String status);
    List<Notification> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    List<Notification> findByStatusAndCreatedAtBefore(String status, LocalDateTime before);
    long countByStatus(String status);
    long countByCategory(String category);
}
