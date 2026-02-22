package com.example.lms.repository;

import com.example.lms.model.SystemSettings;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SystemSettingsRepository extends MongoRepository<SystemSettings, String> {
}
