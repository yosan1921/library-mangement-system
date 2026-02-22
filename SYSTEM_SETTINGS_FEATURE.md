# System Settings Feature

## Overview
Implemented a comprehensive system settings management feature for the admin dashboard with library policy configuration, notification settings, and backup/restore capabilities.

## Backend Changes

### 1. SystemSettings Model

Complete configuration model with the following categories:

#### Library Policies
- `maxBooksPerMember` - Maximum books a member can borrow (default: 5)
- `borrowDurationDays` - Loan period in days (default: 14)
- `finePerDay` - Fine amount per overdue day (default: $1.00)
- `maxRenewals` - Maximum renewal times (default: 2)
- `reservationExpiryDays` - Days to pick up reserved book (default: 3)

#### Notification Settings
- `emailNotificationsEnabled` - Enable/disable email notifications
- `smsNotificationsEnabled` - Enable/disable SMS notifications
- `dueDateReminderDays` - Days before due date to send reminder (default: 2)
- `overdueReminderDays` - Frequency of overdue reminders (default: 1)
- `emailHost` - SMTP server host
- `emailPort` - SMTP server port
- `emailUsername` - Email account username
- `smsProvider` - SMS service provider (Twilio, Nexmo, AWS SNS)

#### Library Information
- `libraryName` - Name of the library
- `libraryEmail` - Contact email
- `libraryPhone` - Contact phone
- `libraryAddress` - Physical address

#### Metadata
- `lastUpdated` - Timestamp of last update
- `updatedBy` - User who made the update

### 2. SystemSettingsRepository
Standard MongoDB repository for settings persistence

### 3. SystemSettingsService

Key Methods:
- `getSettings()` - Retrieve current settings (creates defaults if none exist)
- `updateSettings(settings, updatedBy)` - Update settings with partial updates
- `resetToDefaults(updatedBy)` - Reset all settings to default values

### 4. BackupService

Comprehensive backup and restore functionality:

#### Backup Methods
- `createBackup()` - Create complete data snapshot
  - Books
  - Members
  - Borrow records
  - Reservations
  - Fines
  - Payments
  - System settings
- `exportBackupToJson()` - Export backup as JSON string
- `getBackupStatistics()` - Get database statistics

#### Restore Methods
- `restoreFromBackup(backupData)` - Restore data from backup file
  - Validates and converts data
  - Saves to respective collections
  - Handles errors gracefully

### 5. SystemSettingsController

RESTful endpoints:

#### Settings Endpoints
- `GET /api/settings` - Get current settings
- `PUT /api/settings?updatedBy=admin` - Update settings
- `POST /api/settings/reset?updatedBy=admin` - Reset to defaults

#### Backup Endpoints
- `GET /api/settings/backup/statistics` - Get database statistics
- `GET /api/settings/backup/export` - Export backup (downloads JSON file)
- `POST /api/settings/backup/restore` - Restore from backup

## Frontend Changes

### 1. New Admin Page: /admin/settings

Comprehensive settings management with four main tabs:

#### Library Policies Tab
- **Configurable Settings:**
  - Maximum books per member (1-20)
  - Borrow duration in days (1-90)
  - Fine per day ($0+)
  - Maximum renewals (0-10)
  - Reservation expiry days (1-14)

- **Features:**
  - Input validation
  - Help text for each setting
  - Save changes button
  - Reset to defaults button

#### Notifications Tab
- **Email Settings:**
  - Enable/disable email notifications
  - SMTP host configuration
  - SMTP port configuration
  - Email username
  - Due date reminder days (0-7)
  - Overdue reminder frequency (1-7)

- **SMS Settings:**
  - Enable/disable SMS notifications
  - SMS provider selection (Twilio, Nexmo, AWS SNS)

- **Features:**
  - Toggle switches for enable/disable
  - Configuration fields
  - Help text for guidance

#### Library Info Tab
- **Configurable Information:**
  - Library name
  - Contact email
  - Contact phone
  - Physical address

- **Features:**
  - Text inputs for all fields
  - Email and phone validation
  - Textarea for address

#### Backup & Restore Tab
- **Database Statistics:**
  - Total books
  - Total members
  - Total borrow records
  - Total reservations
  - Total fines
  - Total payments

- **Export Backup:**
  - One-click backup export
  - Downloads JSON file with timestamp
  - Includes all library data

- **Restore Backup:**
  - File upload interface
  - JSON validation
  - Confirmation dialog
  - Error handling

- **Metadata Display:**
  - Last updated timestamp
  - Updated by user

### 2. Features

- **Auto-save Validation**: Validates inputs before saving
- **Default Values**: Provides sensible defaults for all settings
- **Help Text**: Contextual help for each setting
- **Confirmation Dialogs**: Confirms destructive actions
- **Error Handling**: User-friendly error messages
- **Loading States**: Shows loading/saving indicators
- **Responsive Design**: Works on all screen sizes

### 3. Updated Components

#### Sidebar
- Added "System Settings" link for admin role

### 4. New Frontend Service: settingsService.js
Complete API integration for settings and backup operations

## Features Implemented

### 1. Library Policy Configuration
- Customize borrowing rules
- Set fine rates
- Configure renewal policies
- Manage reservation expiry

### 2. Notification Management
- Enable/disable notifications
- Configure email server
- Set up SMS provider
- Customize reminder timing

### 3. Library Information
- Maintain contact details
- Update library name
- Store address information

### 4. Backup & Restore
- Export complete database
- Download as JSON file
- Restore from backup
- View database statistics

### 5. Settings Management
- Partial updates (only changed fields)
- Reset to defaults
- Track changes (timestamp, user)
- Validation and error handling

## Usage

### Access Settings
1. Navigate to Admin Dashboard
2. Click "System Settings" in sidebar
3. Select desired tab

### Update Library Policies
1. Go to "Library Policies" tab
2. Modify desired settings
3. Click "Save Changes"
4. Or click "Reset to Defaults" to restore defaults

### Configure Notifications
1. Go to "Notifications" tab
2. Enable email/SMS notifications
3. Configure server settings
4. Set reminder timing
5. Click "Save Changes"

### Update Library Info
1. Go to "Library Info" tab
2. Update contact information
3. Click "Save Changes"

### Export Backup
1. Go to "Backup & Restore" tab
2. Review database statistics
3. Click "Export Backup"
4. File downloads automatically

### Restore Backup
1. Go to "Backup & Restore" tab
2. Click "Choose Backup File"
3. Select JSON backup file
4. Confirm restoration
5. Data is restored

## Default Settings

### Library Policies
- Max books per member: 5
- Borrow duration: 14 days
- Fine per day: $1.00
- Max renewals: 2
- Reservation expiry: 3 days

### Notifications
- Email notifications: Disabled
- SMS notifications: Disabled
- Due date reminder: 2 days before
- Overdue reminder: Every 1 day

## Backup File Format

JSON structure:
```json
{
  "timestamp": "2024-01-01T12:00:00",
  "books": [...],
  "members": [...],
  "borrowRecords": [...],
  "reservations": [...],
  "fines": [...],
  "payments": [...],
  "settings": [...]
}
```

## Security Considerations

1. **Settings Access**: Only admin users should access settings
2. **Backup Files**: Contain sensitive data, store securely
3. **Restore Operation**: Adds data to database (doesn't clear existing)
4. **Email Credentials**: Stored in database (consider encryption)
5. **Validation**: All inputs validated before saving

## Next Steps (Optional Enhancements)
- Role-based settings access control
- Settings change history/audit log
- Scheduled automatic backups
- Cloud backup storage (S3, Google Drive)
- Encrypted backup files
- Differential backups (only changes)
- Backup versioning
- Restore preview (show what will be restored)
- Settings import/export
- Multi-language support
- Theme customization
- Advanced notification templates
- Notification scheduling
- Email/SMS testing tools
- Database optimization tools
- Performance monitoring
- System health checks
