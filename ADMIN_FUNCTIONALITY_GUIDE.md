# Admin Account Management - Complete Implementation Guide

## Overview
This document describes the fully implemented admin account management functionality in the Library Management System.

## Features Implemented

### 1. Admin Profile Management
- **View Profile**: Display current admin's profile information
- **Update Profile**: Modify full name, email, and phone number
- **Profile Photo**: Support for uploading profile photos (UI ready, backend can be extended)
- **Real-time Updates**: Changes are immediately reflected in localStorage and UI

### 2. Password Management
- **Change Password**: Secure password update with validation
- **Current Password Verification**: Requires old password before changing
- **Password Strength**: Minimum 6 characters requirement
- **Confirmation Match**: Ensures new password matches confirmation

### 3. Admin User Management
- **List All Admins**: View all admin users with their details
- **Create New Admin**: Add new admin users with custom roles and permissions
- **Activate/Deactivate**: Toggle admin account status
- **Delete Admin**: Remove admin accounts (with protection for super admin)
- **Role-based Display**: Visual indicators for different admin roles

### 4. Role & Permission System
Three predefined roles:
- **SUPER_ADMIN**: Full system access (all 8 permissions)
- **ADMIN**: Manage books, members, borrows, reservations, fines, and view reports
- **LIBRARIAN**: Handle borrowing and returns

Eight granular permissions:
1. MANAGE_BOOKS
2. MANAGE_MEMBERS
3. MANAGE_BORROWS
4. MANAGE_RESERVATIONS
5. MANAGE_FINES
6. VIEW_REPORTS
7. MANAGE_SETTINGS
8. MANAGE_ADMINS

## Backend API Endpoints

### Admin Management (`/api/admins`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admins` | Get all admins |
| GET | `/api/admins/active` | Get active admins only |
| GET | `/api/admins/{id}` | Get admin by ID |
| GET | `/api/admins/username/{username}` | Get admin by username |
| POST | `/api/admins?createdBy={username}` | Create new admin |
| PUT | `/api/admins/{id}` | Update admin details |
| PUT | `/api/admins/{id}/password` | Change password |
| PUT | `/api/admins/{id}/profile` | Update profile |
| DELETE | `/api/admins/{id}` | Delete admin |
| POST | `/api/admins/{id}/activate` | Activate admin |
| POST | `/api/admins/{id}/deactivate` | Deactivate admin |
| GET | `/api/admins/permissions` | Get all available permissions |
| GET | `/api/admins/permissions/role/{role}` | Get default permissions for role |
| POST | `/api/admins/initialize` | Initialize default admin |

### Authentication (`/api/auth`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with username/password |

### Initialization (`/api/init`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/init/test-data` | Initialize test data including default admin |
| GET | `/api/init/check-users` | Check existing users in database |

## Frontend Pages

### Admin Management Page (`/admin/admins`)

Four main tabs:
1. **Admin Users**: List and manage all admin accounts
2. **My Profile**: View and update current admin's profile
3. **Password**: Change current admin's password
4. **Create Admin**: Add new admin users

## Data Models

### Admin Model
```java
{
    id: String,
    username: String,
    password: String,  // Hashed in production
    email: String,
    fullName: String,
    phone: String,
    role: String,  // SUPER_ADMIN, ADMIN, LIBRARIAN
    permissions: List<String>,
    active: Boolean,
    createdDate: LocalDateTime,
    lastLogin: LocalDateTime,
    createdBy: String
}
```

## Security Features

1. **Password Protection**: Current password required for changes
2. **Super Admin Protection**: Cannot delete or deactivate super admin
3. **Self-Protection**: Cannot delete own account
4. **Active Status**: Inactive admins cannot login
5. **Role-based Access**: Permissions control feature access

## Default Admin Account

Created automatically via `/api/init/test-data`:
- **Username**: admin
- **Password**: admin123
- **Role**: SUPER_ADMIN
- **Email**: admin@library.com
- **Full Name**: System Administrator

## Configuration

### API Configuration (`frontend/config/api.js`)
Centralized API endpoint management for easy configuration and maintenance.

### Environment Variables
```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api
```

## Usage Instructions

### 1. Initialize System
```bash
# Start backend
cd backendlab
./mvnw spring-boot:run

# Initialize test data
curl -X POST http://localhost:8080/api/init/test-data
```

### 2. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Login as Admin
- Navigate to: http://localhost:3000/admin-login
- Username: admin
- Password: admin123

### 4. Access Admin Management
- After login, go to: http://localhost:3000/admin/admins
- Or click "Admin Account" in the sidebar

## API Usage Examples

### Create New Admin
```javascript
const response = await fetch('http://localhost:8080/api/admins?createdBy=admin', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        username: 'newadmin',
        password: 'password123',
        fullName: 'New Admin',
        email: 'newadmin@library.com',
        phone: '1234567890',
        role: 'ADMIN',
        permissions: ['MANAGE_BOOKS', 'MANAGE_MEMBERS']
    })
});
```

### Update Profile
```javascript
const response = await fetch('http://localhost:8080/api/admins/{id}/profile', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        fullName: 'Updated Name',
        email: 'updated@library.com',
        phone: '9876543210'
    })
});
```

### Change Password
```javascript
const response = await fetch('http://localhost:8080/api/admins/{id}/password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        oldPassword: 'currentpass',
        newPassword: 'newpass123'
    })
});
```

## Testing Checklist

- [x] Create new admin with different roles
- [x] Update admin profile information
- [x] Change admin password
- [x] Activate/deactivate admin accounts
- [x] Delete admin accounts
- [x] View all admins list
- [x] Filter active admins
- [x] Verify permission assignments
- [x] Test super admin protections
- [x] Verify authentication integration
- [x] Test last login tracking

## Future Enhancements

1. **Profile Photo Upload**: Implement backend storage for profile photos
2. **Password Hashing**: Add BCrypt or similar for password encryption
3. **Email Verification**: Send verification emails for new admins
4. **Activity Logging**: Track admin actions for audit trail
5. **Two-Factor Authentication**: Add 2FA for enhanced security
6. **Password Reset**: Implement forgot password functionality
7. **Session Management**: Add JWT tokens for secure sessions
8. **Role Customization**: Allow creating custom roles with specific permissions

## Troubleshooting

### Admin Cannot Login
- Check if admin account is active
- Verify password is correct
- Ensure MongoDB is running
- Check if admin exists in database

### Cannot Create Admin
- Verify username is unique
- Check email is unique
- Ensure all required fields are provided
- Verify backend is running

### Profile Update Fails
- Check if email is already taken by another admin
- Verify admin ID is correct
- Ensure valid data format

## Notes

- All admin operations are logged in backend console
- Frontend uses localStorage for session management
- Backend validates all inputs before processing
- Permissions are checked on both frontend and backend
- Super admin role has all permissions by default

## Support

For issues or questions:
1. Check backend logs for error messages
2. Verify MongoDB connection
3. Ensure all dependencies are installed
4. Check API endpoint URLs are correct
