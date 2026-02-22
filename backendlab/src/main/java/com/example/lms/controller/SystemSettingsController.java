package com.example.lms.controller;

import com.example.lms.model.SystemSettings;
import com.example.lms.service.BackupService;
import com.example.lms.service.SystemSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@RestController
@RequestMapping("/api/settings")
@CrossOrigin(origins = "*")
public class SystemSettingsController {
    
    @Autowired
    private SystemSettingsService settingsService;
    
    @Autowired
    private BackupService backupService;
    
    @GetMapping
    public SystemSettings getSettings() {
        return settingsService.getSettings();
    }
    
    @PutMapping
    public ResponseEntity<SystemSettings> updateSettings(@RequestBody SystemSettings settings, 
                                                         @RequestParam(defaultValue = "admin") String updatedBy) {
        try {
            SystemSettings updated = settingsService.updateSettings(settings, updatedBy);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @PostMapping("/reset")
    public ResponseEntity<SystemSettings> resetToDefaults(@RequestParam(defaultValue = "admin") String updatedBy) {
        try {
            SystemSettings reset = settingsService.resetToDefaults(updatedBy);
            return ResponseEntity.ok(reset);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
    
    @GetMapping("/backup/statistics")
    public Map<String, Object> getBackupStatistics() {
        return backupService.getBackupStatistics();
    }
    
    @GetMapping("/backup/export")
    public ResponseEntity<String> exportBackup() {
        try {
            String backupJson = backupService.exportBackupToJson();
            String filename = "library_backup_" + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".json";
            
            return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_JSON)
                .body(backupJson);
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @PostMapping("/backup/restore")
    public ResponseEntity<Map<String, String>> restoreBackup(@RequestBody Map<String, Object> backupData) {
        try {
            backupService.restoreFromBackup(backupData);
            return ResponseEntity.ok(Map.of("message", "Backup restored successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "Failed to restore backup: " + e.getMessage()));
        }
    }
}
