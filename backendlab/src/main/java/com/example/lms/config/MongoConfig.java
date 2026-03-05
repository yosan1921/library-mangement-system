package com.example.lms.config;

// MongoDB Java driver imports for connection and client configuration
import com.mongodb.ConnectionString;
import com.mongodb.MongoClientSettings;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
// Spring framework imports for configuration and dependency injection
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
// Spring Data MongoDB configuration base class
import org.springframework.data.mongodb.config.AbstractMongoClientConfiguration;
// Enables automatic auditing fields (createdDate, lastModifiedDate, etc.)
import org.springframework.data.mongodb.config.EnableMongoAuditing;

import java.util.concurrent.TimeUnit;

/**
 * MongoDB Configuration Class
 * 
 * This configuration class sets up the MongoDB connection and client settings
 * for the Library Management System. It extends AbstractMongoClientConfiguration
 * to provide custom MongoDB configuration beyond Spring Boot's auto-configuration.
 * 
 * Key features configured:
 * - Custom connection pool settings for optimal performance
 * - Server monitoring and heartbeat configuration
 * - Connection timeout and lifecycle management
 * - Graceful error handling for connection failures
 * - Auditing support for automatic timestamp fields
 */
@Configuration // Marks this class as a source of bean definitions
@EnableMongoAuditing // Enables automatic auditing of MongoDB entities
public class MongoConfig extends AbstractMongoClientConfiguration {

    // Injects the MongoDB URI from application properties
    @Value("${spring.data.mongodb.uri}")
    private String mongoUri;

    /**
     * Specifies the database name for the LMS application
     * 
     * @return The name of the MongoDB database to use
     */
    @Override
    protected String getDatabaseName() {
        return "lms"; // Database name for Library Management System
    }

    /**
     * Creates and configures the MongoDB client with custom settings
     * 
     * This method sets up connection pooling, server monitoring, and error handling
     * to ensure reliable database connectivity for the LMS application.
     * 
     * Connection Pool Settings:
     * - Maximum idle time: 10 seconds (closes idle connections)
     * - Maximum connection lifetime: 30 seconds (prevents stale connections)
     * - Minimum pool size: 1 connection (ensures at least one connection)
     * - Maximum pool size: 10 connections (limits resource usage)
     * 
     * Server Monitoring:
     * - Heartbeat frequency: 5 seconds (checks server health)
     * - Minimum heartbeat frequency: 1 second (fastest health check)
     * 
     * @return Configured MongoClient instance
     */
    @Override
    @Bean
    public MongoClient mongoClient() {
        try {
            // Parse the MongoDB connection string from configuration
            ConnectionString connectionString = new ConnectionString(mongoUri);
            
            // Build MongoDB client settings with custom configuration
            //MongoClientSettings settings = MongoClientSettings.builder()
                    .applyConnectionString(connectionString)
                    // Configure connection pool for optimal performance and resource management
                    .applyToConnectionPoolSettings(builder -> 
                        builder.maxConnectionIdleTime(10, TimeUnit.SECONDS)    // Close idle connections after 10s
                               .maxConnectionLifeTime(30, TimeUnit.SECONDS)    // Replace connections after 30s
                               .minSize(1)                                     // Maintain at least 1 connection
                               .maxSize(10))                                   // Allow up to 10 concurrent connections
                    // Configure server monitoring for health checks and failover
                    .applyToServerSettings(builder -> 
                        builder.heartbeatFrequency(5, TimeUnit.SECONDS)       // Check server health every 5s
                               .minHeartbeatFrequency(1, TimeUnit.SECONDS))   // Minimum 1s between health checks
                    .build();
            
            // Create and return the configured MongoDB client
            return MongoClients.create(settings);
            
        } catch (Exception e) {
            // Log connection error but allow application to continue
            System.err.println("MongoDB connection error: " + e.getMessage());
            System.err.println("Application will continue but database operations may fail.");
            
            // Return a fallback client with default localhost connection
            // This allows the application to start even if the configured MongoDB is unavailable
            return MongoClients.create("mongodb://localhost:27017");
        }
    }
}
