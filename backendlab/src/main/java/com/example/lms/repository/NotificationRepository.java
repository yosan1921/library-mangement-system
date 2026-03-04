package com.example.lms.repository;

// Import the Notification model class
import com.example.lms.model.Notification;
// Spring Data MongoDB repository interface
import org.springframework.data.mongodb.repository.MongoRepository;
// Spring stereotype annotation for repository beans
import org.springframework.stereotype.Repository;
// Java time API for date range queries
import java.time.LocalDateTime;
// Java collections class
import java.util.List;

/**
 * NotificationRepository Interface - Data Access Layer for Notification entities
 * 
 * This repository interface provides database operations for Notification entities,
 * which manage system notifications sent to library members. It extends MongoRepository
 * for basic CRUD operations and defines custom queries for notification management,
 * delivery tracking, and communication analytics.
 * 
 * Inherited Operations (from MongoRepository):
 * - save(Notification notification): Create or update a notification
 * - findById(String id): Find notification by ID
 * - findAll(): Retrieve all notifications
 * - deleteById(String id): Delete notification by ID
 * - count(): Count total notifications
 * - existsById(String id): Check if notification exists
 * 
 * Custom Query Methods:
 * - Member-based queries for personal notification history
 * - Status-based filtering for delivery tracking
 * - Category-based filtering for notification type management
 * - Date range queries for analytics and cleanup
 * - Combined queries for targeted notification management
 * - Counting methods for statistics and reporting
 * 
 * Business Use Cases:
 * - Member notification history and preferences
 * - Delivery status tracking and failure analysis
 * - Notification type management and analytics
 * - System cleanup of old notifications
 * - Communication effectiveness reporting
 * - Failed notification retry processing
 * 
 * Related Entities:
 * - Member: Each notification is sent to a specific member
 * - BorrowRecord, Reservation, Fine: Notifications are triggered by these entities
 */
@Repository // Marks this interface as a Spring Data repository component
public interface NotificationRepository extends MongoRepository<Notification, String> {
    
    /**
     * Finds all notifications for a specific member
     * 
     * This method retrieves all notifications sent to a member, including
     * successful, failed, and pending notifications. Used for member
     * notification history and communication tracking.
     * 
     * MongoDB Query: { "memberId": "memberId" }
     * 
     * @param memberId The ID of the member whose notifications to retrieve
     * @return List of all notifications for the specified member
     */
    List<Notification> findByMemberId(String memberId);
    
    /**
     * Finds notifications by their delivery status
     * 
     * This method filters notifications based on their current delivery status.
     * Used for tracking successful deliveries, identifying failures, and
     * managing pending notifications for retry processing.
     * 
     * MongoDB Query: { "status": "status" }
     * 
     * Common status values:
     * - "PENDING": Notification created but not yet sent
     * - "SENT": Notification successfully delivered
     * - "FAILED": Notification delivery failed
     * 
     * @param status The delivery status to filter by (PENDING, SENT, FAILED)
     * @return List of notifications with the specified delivery status
     */
    List<Notification> findByStatus(String status);
    
    /**
     * Finds notifications by their category/type
     * 
     * This method filters notifications by their category, allowing for
     * type-specific management and analytics. Used for understanding
     * communication patterns and managing different notification types.
     * 
     * MongoDB Query: { "category": "category" }
     * 
     * Common category values:
     * - "DUE_DATE_REMINDER": Upcoming book due date reminders
     * - "OVERDUE_REMINDER": Overdue book notifications
     * - "RESERVATION_READY": Reserved book availability alerts
     * - "FINE_NOTICE": Fine payment notifications
     * - "GENERAL": Administrative announcements
     * 
     * @param category The notification category to filter by
     * @return List of notifications of the specified category
     */
    List<Notification> findByCategory(String category);
    
    /**
     * Finds notifications for a specific member with a specific status
     * 
     * This method combines member and status filtering for targeted
     * notification management. Used for member-specific delivery tracking
     * and troubleshooting communication issues.
     * 
     * MongoDB Query: { "memberId": "memberId", "status": "status" }
     * 
     * @param memberId The ID of the member
     * @param status The delivery status to filter by
     * @return List of notifications for the member with the specified status
     */
    List<Notification> findByMemberIdAndStatus(String memberId, String status);
    
    /**
     * Finds notifications created within a specific date range
     * 
     * This method retrieves notifications created between two timestamps.
     * Used for analytics, reporting, and periodic cleanup of old notifications.
     * 
     * MongoDB Query: { "createdAt": { "$gte": start, "$lte": end } }
     * 
     * @param start The start of the date range (inclusive)
     * @param end The end of the date range (inclusive)
     * @return List of notifications created within the specified date range
     */
    List<Notification> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    
    /**
     * Finds notifications with specific status created before a certain date
     * 
     * This method combines status and date filtering for targeted cleanup
     * and maintenance operations. Used for identifying old failed notifications
     * or cleaning up successfully sent notifications after a retention period.
     * 
     * MongoDB Query: { "status": "status", "createdAt": { "$lt": before } }
     * 
     * @param status The delivery status to filter by
     * @param before The cutoff date (notifications created before this date)
     * @return List of notifications with the status created before the specified date
     */
    List<Notification> findByStatusAndCreatedAtBefore(String status, LocalDateTime before);
    
    /**
     * Counts notifications by their delivery status
     * 
     * This method provides a count of notifications with a specific status
     * without retrieving the actual notification objects. Used for dashboard
     * statistics and performance monitoring.
     * 
     * MongoDB Query: db.notifications.count({ "status": "status" })
     * 
     * @param status The delivery status to count
     * @return Number of notifications with the specified status
     */
    long countByStatus(String status);
    
    /**
     * Counts notifications by their category
     * 
     * This method provides a count of notifications of a specific category
     * without retrieving the actual notification objects. Used for analytics
     * and understanding communication patterns.
     * 
     * MongoDB Query: db.notifications.count({ "category": "category" })
     * 
     * @param category The notification category to count
     * @return Number of notifications of the specified category
     */
    long countByCategory(String category);
}
