package com.example.lms.service;

import com.example.lms.model.Admin;
import com.example.lms.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;

/**
 * Profile Photo Service - Handles profile photo storage using Base64 encoding
 * 
 * This service stores profile photos as Base64 encoded strings directly in the database,
 * eliminating file system dependencies and ensuring photos persist reliably.
 */
@Service
public class ProfilePhotoService {
    
    @Autowired
    private AdminRepository adminRepository;
    
    // Maximum file size (5MB for Base64 storage)
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;
    
    /**
     * Updates admin profile photo using Base64 encoding
     * 
     * @param adminId The admin ID
     * @param file The uploaded photo file
     * @return The updated admin
     * @throws IOException If file processing fails
     */
    public Admin updateProfilePhoto(String adminId, MultipartFile file) throws IOException {
        System.out.println("=== ProfilePhotoService.updateProfilePhoto ===");
        System.out.println("Admin ID: " + adminId);
        System.out.println("File name: " + file.getOriginalFilename());
        System.out.println("File size: " + file.getSize() + " bytes");
        System.out.println("Content type: " + file.getContentType());
        
        // Validate file
        validateFile(file);
        System.out.println("File validation passed");
        
        // Get admin
        Admin admin = adminRepository.findById(adminId)
            .orElseThrow(() -> new RuntimeException("Admin not found"));
        System.out.println("Admin found: " + admin.getUsername());
        
        // Convert file to Base64
        byte[] fileBytes = file.getBytes();
        String base64Photo = Base64.getEncoder().encodeToString(fileBytes);
        System.out.println("Base64 encoding completed. Length: " + base64Photo.length());
        
        // Store content type and Base64 data
        String contentType = file.getContentType();
        String photoData = "data:" + contentType + ";base64," + base64Photo;
        System.out.println("Photo data URL created. Total length: " + photoData.length());
        
        admin.setProfilePhoto(photoData);
        Admin savedAdmin = adminRepository.save(admin);
        System.out.println("Admin saved successfully. Profile photo field length: " + 
                          (savedAdmin.getProfilePhoto() != null ? savedAdmin.getProfilePhoto().length() : "null"));
        
        return savedAdmin;
    }
    
    /**
     * Removes admin profile photo
     * 
     * @param adminId The admin ID
     * @return The updated admin
     */
    public Admin removeProfilePhoto(String adminId) {
        Admin admin = adminRepository.findById(adminId)
            .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        admin.setProfilePhoto(null);
        return adminRepository.save(admin);
    }
    
    /**
     * Gets admin profile photo data
     * 
     * @param adminId The admin ID
     * @return The Base64 photo data or null if no photo
     */
    public String getProfilePhoto(String adminId) {
        System.out.println("=== ProfilePhotoService.getProfilePhoto ===");
        System.out.println("Admin ID: " + adminId);
        
        Admin admin = adminRepository.findById(adminId)
            .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        String photoData = admin.getProfilePhoto();
        System.out.println("Profile photo data: " + (photoData != null ? 
                          "Found (" + photoData.length() + " chars)" : "null"));
        
        return photoData;
    }
    
    /**
     * Validates uploaded file
     * 
     * @param file The file to validate
     */
    private void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 5MB");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }
        
        // Check for supported image types
        if (!contentType.equals("image/jpeg") && 
            !contentType.equals("image/jpg") && 
            !contentType.equals("image/png") && 
            !contentType.equals("image/gif") && 
            !contentType.equals("image/bmp")) {
            throw new IllegalArgumentException("Unsupported image type. Supported: JPEG, PNG, GIF, BMP");
        }
    }
}