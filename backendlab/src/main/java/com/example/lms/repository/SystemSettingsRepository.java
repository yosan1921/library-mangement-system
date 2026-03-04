package com.example.lms.repository;

// Import the SystemSettings model class
import com.example.lms.model.SystemSettings;
// Spring Data MongoDB repository interface
import org.springframework.data.mongodb.repository.MongoRepository;
// Spring stereotype annotation for repository beans
import org.springframework.stereotype.Repository;

/**
 * SystemSettingsRepository Interface - Data Access Layer for SystemSettings entity
 * 
 * This repository interface provides database operations for the SystemSettings entity,
 * which stores configurable system parameters for the Library Management System.
 * It extends MongoRepository for basic CRUD operations without additional custom
 * queries since typically only one SystemSettings document exists in the system.
 * 
 * Inherited Operations (from MongoRepository):
 * - save(SystemSettings settings): Create or update system settings
 * - findById(String id): Find settings by ID
 * - findAll(): Retrieve all settings documents (typically returns one)
 * - deleteById(String id): Delete settings document
 * - count(): Count settings documents (should be 1)
 * - existsById(String id): Check if settings document exists
 * 
 * Usage Pattern:
 * Unlike other repositories that manage multiple entities, this repository
 * typically manages a single SystemSettings document that contains all
 * configurable parameters for the library system. The settings are usually
 * loaded at application startup and cached for performance.
 * 
 * Common Operations:
 * - Load settings at application startup: findAll().get(0) or findById(knownId)
 * - Update settings: save(modifiedSettings)
 * - Initialize default settings: save(new SystemSettings()) if none exist
 * 
 * Business Use Cases:
 * - System configuration management
 * - Runtime parameter updates without code changes
 * - Library policy enforcement (borrowing limits, fine rates, etc.)
 * - Notification system configuration
 * - Library contact information management
 * 
 * Security Considerations:
 * - Only administrators should be able to modify system settings
 * - Settings changes should be logged for audit purposes
 * - Sensitive information (passwords, API keys) should be encrypted
 * - Settings validation should occur before saving
 * 
 * Related Entities:
 * - All entities: System settings affect behavior across the entire system
 * - Admin: Only admins can modify system settings
 */
@Repository // Marks this interface as a Spring Data repository component
public interface SystemSettingsRepository extends MongoRepository<SystemSettings, String> {
    // No custom query methods needed for SystemSettings
    // The inherited CRUD operations from MongoRepository are sufficient
    // since typically only one SystemSettings document exists in the system
}
