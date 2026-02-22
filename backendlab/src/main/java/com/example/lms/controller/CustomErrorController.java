package com.example.lms.controller;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@RestController
public class CustomErrorController implements ErrorController {

    @RequestMapping("/error")
    public ResponseEntity<Map<String, Object>> handleError(HttpServletRequest request) {
        Map<String, Object> errorDetails = new HashMap<>();
        
        Integer statusCode = (Integer) request.getAttribute("jakarta.servlet.error.status_code");
        String errorMessage = (String) request.getAttribute("jakarta.servlet.error.message");
        String requestUri = (String) request.getAttribute("jakarta.servlet.error.request_uri");
        
        if (statusCode == null) {
            statusCode = 500;
        }
        
        errorDetails.put("status", statusCode);
        errorDetails.put("error", HttpStatus.valueOf(statusCode).getReasonPhrase());
        errorDetails.put("message", errorMessage != null ? errorMessage : "An error occurred");
        errorDetails.put("path", requestUri != null ? requestUri : "unknown");
        
        if (statusCode == 404) {
            errorDetails.put("message", "Endpoint not found. Available endpoints: /api/books, /api/members, /api/borrow, /api/reservations");
        }
        
        return ResponseEntity.status(statusCode).body(errorDetails);
    }
}
