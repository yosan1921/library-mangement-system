package com.example.lms.service;

import com.example.lms.model.SystemSettings;
import com.example.lms.repository.SystemSettingsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class SystemSettingsService {
    
    @Autowired
    private SystemSettingsRepository settingsRepository;
    
    public SystemSettings getSettings() {
        List<SystemSettings> settings = settingsRepository.findAll();
        if (settings.isEmpty()) {
            // Create default settings if none exist
            SystemSettings defaultSettings = new SystemSettings();
            defaultSettings.setLibraryName("Library Management System");
            defaultSettings.setLastUpdated(LocalDateTime.now());
            return settingsRepository.save(defaultSettings);
        }
        return settings.get(0);
    }
    
    public SystemSettings updateSettings(SystemSettings newSettings, String updatedBy) {
        SystemSettings currentSettings = getSettings();
        
        // Update library policies
        if (newSettings.getMaxBooksPerMember() != null) {
            currentSettings.setMaxBooksPerMember(newSettings.getMaxBooksPerMember());
        }
        if (newSettings.getBorrowDurationDays() != null) {
            currentSettings.setBorrowDurationDays(newSettings.getBorrowDurationDays());
        }
        if (newSettings.getFinePerDay() != null) {
            currentSettings.setFinePerDay(newSettings.getFinePerDay());
        }
        if (newSettings.getMaxRenewals() != null) {
            currentSettings.setMaxRenewals(newSettings.getMaxRenewals());
        }
        if (newSettings.getReservationExpiryDays() != null) {
            currentSettings.setReservationExpiryDays(newSettings.getReservationExpiryDays());
        }
        
        // Update notification settings
        if (newSettings.getEmailNotificationsEnabled() != null) {
            currentSettings.setEmailNotificationsEnabled(newSettings.getEmailNotificationsEnabled());
        }
        if (newSettings.getSmsNotificationsEnabled() != null) {
            currentSettings.setSmsNotificationsEnabled(newSettings.getSmsNotificationsEnabled());
        }
        if (newSettings.getDueDateReminderDays() != null) {
            currentSettings.setDueDateReminderDays(newSettings.getDueDateReminderDays());
        }
        if (newSettings.getOverdueReminderDays() != null) {
            currentSettings.setOverdueReminderDays(newSettings.getOverdueReminderDays());
        }
        if (newSettings.getEmailHost() != null) {
            currentSettings.setEmailHost(newSettings.getEmailHost());
        }
        if (newSettings.getEmailPort() != null) {
            currentSettings.setEmailPort(newSettings.getEmailPort());
        }
        if (newSettings.getEmailUsername() != null) {
            currentSettings.setEmailUsername(newSettings.getEmailUsername());
        }
        if (newSettings.getSmsProvider() != null) {
            currentSettings.setSmsProvider(newSettings.getSmsProvider());
        }
        
        // Update library information
        if (newSettings.getLibraryName() != null) {
            currentSettings.setLibraryName(newSettings.getLibraryName());
        }
        if (newSettings.getLibraryEmail() != null) {
            currentSettings.setLibraryEmail(newSettings.getLibraryEmail());
        }
        if (newSettings.getLibraryPhone() != null) {
            currentSettings.setLibraryPhone(newSettings.getLibraryPhone());
        }
        if (newSettings.getLibraryAddress() != null) {
            currentSettings.setLibraryAddress(newSettings.getLibraryAddress());
        }
        
        // Update metadata
        currentSettings.setLastUpdated(LocalDateTime.now());
        currentSettings.setUpdatedBy(updatedBy);
        
        return settingsRepository.save(currentSettings);
    }
    
    public SystemSettings resetToDefaults(String updatedBy) {
        SystemSettings currentSettings = getSettings();
        
        // Reset to default values
        currentSettings.setMaxBooksPerMember(5);
        currentSettings.setBorrowDurationDays(14);
        currentSettings.setFinePerDay(1.0);
        currentSettings.setMaxRenewals(2);
        currentSettings.setReservationExpiryDays(3);
        currentSettings.setEmailNotificationsEnabled(false);
        currentSettings.setSmsNotificationsEnabled(false);
        currentSettings.setDueDateReminderDays(2);
        currentSettings.setOverdueReminderDays(1);
        
        currentSettings.setLastUpdated(LocalDateTime.now());
        currentSettings.setUpdatedBy(updatedBy);
        
        return settingsRepository.save(currentSettings);
    }
}
