# Notification System Implementation Guide

## Overview
A complete notification system has been implemented for the Library Management System, allowing automated and manual notifications via Email and SMS.

## Features Implemented

### 1. Backend Components

#### Models
- **Notification.java**: Stores notification records with fields:
  - Member information (ID, name, email, contact)
  - Type (EMAIL, SMS, BOTH)
  - Category (DUE_DATE_REMINDER, OVERDUE_REMINDER, RESERVATION_READY, FINE_NOTICE, GENERAL)
  - Subject and message
  - Status (PENDING, SENT, FAILED)
  - Timestamps and error tracking

#### Repository
- **NotificationRepository.java**: MongoDB repository with query methods:
  - Find by member, status, category
  - Find by date range
  - Count by status and category

#### Service
- **NotificationService.java**: Core business logic including:
  - Create and send notifications (single and bulk)
  - Email sending via JavaMail
  - SMS sending (placeholder for provider integration)
  - Automatic notification generation for:
    - Due date reminders
    - Overdue reminders
    - Reservation ready notifications
    - Fine notices
  - Scheduled task (runs daily at 9 AM)
  - Statistics and reporting
  - Test configuration functionality
  - Cleanup old notifications (90+ days)

#### Controller
- **NotificationController.java**: REST API endpoints:
  - `GET /api/notifications` - Get all notifications
  - `GET /api/notifications/member/{memberId}` - Get by member
  - `GET /api/notifications/status/{status}` - Get by status
  - `GET /api/notifications/category/{category}` - Get by category
  - `POST /api/notifications/custom` - Create custom notification
  - `POST /api/notifications/send/{id}` - Send single notification
  - `POST /api/notifications/send/bulk` - Send bulk notifications
  - `GET /api/notifications/statistics` - Get statistics
  - `DELETE /api/notifications/{id}` - Delete notification
  - `DELETE /api/notifications/cleanup` - Delete old notifications
  - `POST /api/notifications/test` - Test configuration
  - `POST /api/notifications/trigger-automatic` - Manually trigger automatic notifications

#### System Settings Updates
- **SystemSettings.java**: Added fields:
  - `emailPassword` - Email account password
  - `smsApiKey` - SMS provider API key

### 2. Frontend Components

#### Services
- **notificationService.js**: API client for all notification endpoints

#### Pages
- **admin/notifications.js**: Complete notification management interface with:
  - Statistics dashboard
  - Notification list with filtering (status, category)
  - Bulk operations (select all, send selected)
  - Create custom notifications
  - Test configuration
  - Delete operations

#### Updates
- **admin/settings.js**: Added fields for:
  - Email password
  - SMS API key
- **Sidebar.js**: Added "Notifications" menu item

### 3. Configuration

#### Dependencies Added
- **pom.xml**: Added JavaMail dependency:
  ```xml
  <dependency>
      <groupId>com.sun.mail</groupId>
      <artifactId>javax.mail</artifactId>
      <version>1.6.2</version>
  </dependency>
  ```

#### Application Configuration
- **LmsApplication.java**: Added `@EnableScheduling` annotation for automatic notifications

## Usage Guide

### Setting Up Email Notifications

1. Navigate to Admin Panel → System Settings → Notifications tab
2. Enable "Email Notifications"
3. Configure email settings:
   - **Email Host**: SMTP server (e.g., smtp.gmail.com)
   - **Email Port**: SMTP port (e.g., 587 for TLS)
   - **Email Username**: Your email address
   - **Email Password**: Your email password or app password
4. Save settings

#### Gmail Configuration
For Gmail accounts:
1. Enable 2-factor authentication
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Generate password for "Mail"
   - Use this password in the Email Password field

### Setting Up SMS Notifications

1. Navigate to Admin Panel → System Settings → Notifications tab
2. Enable "SMS Notifications"
3. Configure SMS settings:
   - **SMS Provider**: Select provider (Twilio, Nexmo, AWS SNS)
   - **SMS API Key**: Your provider's API key
4. Save settings

**Note**: SMS functionality is currently a placeholder. To fully implement:
- Integrate with your chosen SMS provider's SDK
- Update the `sendSMS()` method in `NotificationService.java`
- Add provider-specific configuration fields

### Testing Configuration

1. Navigate to Admin Panel → Notifications → Test Configuration tab
2. Enter test email and/or phone number
3. Click "Send Test Notifications"
4. Check results to verify configuration

### Creating Custom Notifications

1. Navigate to Admin Panel → Notifications → Create Custom tab
2. Select a member
3. Choose category
4. Enter subject and message
5. Click "Create Notification"
6. The notification will be created with PENDING status

### Sending Notifications

#### Single Notification
1. Go to Notifications → All Notifications tab
2. Find the notification with PENDING status
3. Click "Send" button

#### Bulk Notifications
1. Go to Notifications → All Notifications tab
2. Select multiple notifications using checkboxes
3. Click "Send Selected" button

### Automatic Notifications

The system automatically sends notifications daily at 9 AM for:

1. **Due Date Reminders**: Sent X days before due date (configured in settings)
2. **Overdue Reminders**: Sent for overdue books

To manually trigger automatic notifications:
1. Go to Notifications → All Notifications tab
2. Click "Trigger Automatic" button

### Filtering and Management

#### Filter Notifications
- By Status: PENDING, SENT, FAILED
- By Category: DUE_DATE_REMINDER, OVERDUE_REMINDER, RESERVATION_READY, FINE_NOTICE, GENERAL

#### Delete Operations
- **Delete Single**: Click "Delete" button on any notification
- **Delete Old**: Click "Delete Old" to remove notifications older than 90 days

### Viewing Statistics

The statistics dashboard shows:
- Total notifications
- Sent, pending, and failed counts
- Breakdown by category

## API Integration Examples

### Create Custom Notification
```javascript
POST /api/notifications/custom
{
  "memberId": "member123",
  "subject": "Library Event",
  "message": "Join us for our book fair this weekend!",
  "category": "GENERAL"
}
```

### Send Notification
```javascript
POST /api/notifications/send/notification123
```

### Get Statistics
```javascript
GET /api/notifications/statistics
```

### Test Configuration
```javascript
POST /api/notifications/test
{
  "email": "test@example.com",
  "phone": "+1234567890"
}
```

## Notification Categories

1. **DUE_DATE_REMINDER**: Reminds members about upcoming due dates
2. **OVERDUE_REMINDER**: Alerts members about overdue books
3. **RESERVATION_READY**: Notifies when reserved books are available
4. **FINE_NOTICE**: Informs members about outstanding fines
5. **GENERAL**: Custom notifications for any purpose

## Scheduled Tasks

The system includes a scheduled task that runs daily at 9:00 AM:
- Checks for books due soon (based on dueDateReminderDays setting)
- Checks for overdue books
- Automatically creates and sends notifications

To change the schedule, modify the `@Scheduled` annotation in `NotificationService.java`:
```java
@Scheduled(cron = "0 0 9 * * ?") // Runs at 9 AM daily
```

## Troubleshooting

### Email Not Sending
1. Verify SMTP settings are correct
2. Check if email password is correct (use app password for Gmail)
3. Ensure firewall allows SMTP connections
4. Check spam folder
5. Use Test Configuration to diagnose issues

### SMS Not Sending
1. Verify SMS provider credentials
2. Check API key is valid
3. Ensure phone numbers are in correct format
4. Implement actual SMS provider integration (currently placeholder)

### Notifications Not Triggering Automatically
1. Verify `@EnableScheduling` is present in `LmsApplication.java`
2. Check application logs for errors
3. Ensure notification settings are enabled
4. Verify system date/time is correct

## Security Considerations

1. **Email Password**: Stored in database - consider encryption in production
2. **SMS API Key**: Stored in database - consider encryption in production
3. **Access Control**: Only admins can manage notifications
4. **Rate Limiting**: Consider implementing rate limits for bulk operations

## Future Enhancements

1. **SMS Integration**: Complete integration with actual SMS providers
2. **Email Templates**: Rich HTML email templates
3. **Notification Preferences**: Allow members to set notification preferences
4. **Push Notifications**: Web push notifications for real-time alerts
5. **Notification History**: Member-facing notification history page
6. **Encryption**: Encrypt sensitive credentials in database
7. **Retry Logic**: Automatic retry for failed notifications
8. **Delivery Reports**: Track email opens and SMS delivery status

## Database Collections

### notifications
```json
{
  "_id": "ObjectId",
  "memberId": "string",
  "memberName": "string",
  "memberEmail": "string",
  "memberContact": "string",
  "type": "EMAIL|SMS|BOTH",
  "category": "DUE_DATE_REMINDER|OVERDUE_REMINDER|RESERVATION_READY|FINE_NOTICE|GENERAL",
  "subject": "string",
  "message": "string",
  "sent": "boolean",
  "sentAt": "datetime",
  "createdAt": "datetime",
  "status": "PENDING|SENT|FAILED",
  "errorMessage": "string",
  "relatedEntityId": "string"
}
```

## Conclusion

The notification system is fully functional and ready to use. Configure your email settings, test the configuration, and start sending notifications to your library members!
