package com.example.lms.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {
    
    @GetMapping("/")
    public String home() {
        return "Library Management System API is running. Use /api/* endpoints.";
    }
    
    @GetMapping("/api")
    public String apiHome() {
        return "Available endpoints: /api/books, /api/members, /api/borrow, /api/reservations";
    }
}
