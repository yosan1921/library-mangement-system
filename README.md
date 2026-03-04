# Library Management System

A comprehensive full-stack library management system with role-based access control, built with Spring Boot and Next.js.

## 🚀 Quick Start
**New to the project?** Start here: [QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)

## 📚 Documentation Index

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **[QUICK_START_GUIDE.md](QUICK_START_GUIDE.md)** | Get system running in minutes | First time setup |
| **[COMPLETE_SYSTEM_GUIDE.md](COMPLETE_SYSTEM_GUIDE.md)** | Architecture, APIs, features | Development reference |
| **[COMPLETE_NOTIFICATION_SYSTEM.md](COMPLETE_NOTIFICATION_SYSTEM.md)** | Notification system details | Email/SMS configuration |
| **[FINAL_CHECKLIST.md](FINAL_CHECKLIST.md)** | System verification | Testing & validation |
| **[RECENT_UPDATES.md](RECENT_UPDATES.md)** | Latest changes & fixes | Update history |

## 🎯 System Overview

### Architecture
- **Backend**: Spring Boot + MongoDB (Port 8081)
- **Frontend**: Next.js + React (Port 3000)
- **Database**: MongoDB (library_management)

### User Roles
- **Admin**: Full system control and management
- **Librarian**: Daily operations and book management  
- **Member**: Personal library services and book browsing

### Key Features
- Complete book management with ISBN tracking
- Borrowing system with automatic fine calculation
- Reservation system with status workflow
- Notification system (Email/SMS)
- Real-time analytics dashboards
- Role-based access control

## 🔑 Test Credentials

| Role | Username | Password |
|------|----------|----------|
| Admin | admin | admin123 |
| Librarian | librarian | lib123 |
| Member | member | mem123 |

## 🛠️ Quick Setup

```bash
# 1. Start MongoDB
net start MongoDB  # Windows

# 2. Start Backend (Terminal 1)
cd backendlab && run.bat

# 3. Start Frontend (Terminal 2)  
cd frontend && npm install && npm run dev

# 4. Access System
# Frontend: http://localhost:3000
# Backend API: http://localhost:8081/api
```

## 📊 Project Statistics
- **Backend**: 9 Models, 13 Controllers, 11 Services
- **Frontend**: 24+ Pages, 7 Components, 7 Services  
- **API Endpoints**: 50+
- **Total Features**: Complete library management system

## 🎉 Status
**✅ PRODUCTION READY**

All features implemented, tested, and documented. Ready for development, testing, demonstration, and production deployment.

---

**Built with ❤️ for learning and demonstration**  
**Version**: 1.2.0 | **Last Updated**: March 3, 2026
