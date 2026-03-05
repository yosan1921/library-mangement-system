package com.example.lms;

// Spring Boot framework imports for application bootstrapping
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
// MongoDB repository configuration
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;
// Scheduling support for automated tasks (e.g., fine calculations, notifications)
import org.springframework.scheduling.annotation.EnableScheduling;
// Application context for managing Spring beans
import org.springframework.context.ConfigurableApplicationContext;
// Logging framework for application monitoring and debugging
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Main application class for the Library Management System (LMS)
 * 
 * This class serves as the entry point for the Spring Boot application.
 * It configures the application with the following features:
 * - Auto-configuration of Spring Boot components
 * - MongoDB repository scanning and configuration
 * - Scheduled task execution for automated library operations
 * 
 * The LMS provides comprehensive library management functionality including:
 * - Book catalog management
 * - Member registration and management
 * - Book borrowing and returning
 * - Fine calculation and payment processing
 * - Reservation system
 * - Notification services (email and SMS)
 * - Administrative and librarian interfaces
 * - Reporting and analytics
 */
@SpringBootApplication // Enables auto-configuration, component scanning, and configuration properties
@EnableMongoRepositories(basePackages = "com.example.lms.repository") // Scans for MongoDB repositories
//@EnableScheduling // Enables scheduled method execution for background tasks
public class LmsApplication {
    
    // Logger instance for application-level logging
    private static final Logger logger = LoggerFactory.getLogger(LmsApplication.class);
    
    /**
     * Main method - Application entry point
     * 
     * Initializes and starts the Spring Boot application with error handling.
     * If startup fails, the application will log the error and exit gracefully.
     * 
     * @param args Command line arguments passed to the application
     */
    public static void main(String[] args) {
        try {
            // Start the Spring Boot application and get the application context
            ConfigurableApplicationContext context = SpringApplication.run(LmsApplication.class, args);
            logger.info("Library Management System started successfully");
            
        } catch (Exception e) {
            // Log startup failure and exit with error code
            logger.error("Failed to start Library Management System: {}", e.getMessage());
            System.exit(1);
        }
    }
}