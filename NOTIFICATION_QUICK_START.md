# Notification System - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Configure Email Settings
1. Go to **Admin Panel** → **System Settings** → **Notifications** tab
2. Check ✅ "Enable Email Notifications"
3. Fill in:
   - Email Host: `smtp.gmail.com`
   - Email Port: `587`
   - Email Username: `your-email@gmail.com`
   - Email Password: `your-app-password` (see Gmail setup below)
4. Click **Save Changes**

### Step 2: Test Configuration
1. Go to **Admin Panel** → **Notifications** → **Test Configuration** tab
2. Enter your test email address
3. Click **Send Test Notifications**
4. Check your inbox (and spam folder)

### Step 3: You're Ready!
- Automatic notifications will run daily at 9 AM
- Create custom notifications anytime
- View all notifications in the Notifications page

---

## 📧 Gmail Setup (2 Minutes)

### For Gmail Users:
1. Enable 2-Factor Authentication on your Google Account
2. Go to: https://myaccount.google.com/apppasswords
3. Select "Mail" and generate password
4. Copy the 16-character password
5. Use this password in the "Email Password" field

**Important**: Use the app password, NOT your regular Gmail password!

---

## 🔔 Notification Types

| Type | When Sent | Configured By |
|------|-----------|---------------|
| **Due Date Reminder** | X days before due date | `dueDateReminderDays` setting |
| **Overdue Reminder** | For overdue books | `overdueReminderDays` setting |
| **Reservation Ready** | When reserved book available | Automatic |
| **Fine Notice** | When fine is created | Automatic |
| **General** | Custom notifications | Manual |

---

## 🎯 Common Tasks

### Send a Custom Notification
```
Admin Panel → Notifications → Create Custom
→ Select Member → Enter Subject & Message → Create
```

### View All Notifications
```
Admin Panel → Notifications → All Notifications
```

### Filter Notifications
```
All Notifications → Use Status/Category dropdowns
```

### Send Multiple Notifications
```
All Notifications → Select checkboxes → Send Selected
```

### Trigger Automatic Notifications Now
```
All Notifications → Click "Trigger Automatic"
```

### Delete Old Notifications
```
All Notifications → Click "Delete Old" (removes 90+ day old)
```

---

## 📊 API Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/notifications` | Get all notifications |
| GET | `/api/notifications/member/{id}` | Get member's notifications |
| POST | `/api/notifications/custom` | Create custom notification |
| POST | `/api/notifications/send/{id}` | Send single notification |
| POST | `/api/notifications/send/bulk` | Send multiple notifications |
| GET | `/api/notifications/statistics` | Get statistics |
| DELETE | `/api/notifications/{id}` | Delete notification |
| POST | `/api/notifications/test` | Test configuration |

---

## ⚙️ Configuration Settings

### In System Settings → Notifications:

| Setting | Default | Description |
|---------|---------|-------------|
| Email Notifications Enabled | ❌ | Enable/disable email |
| SMS Notifications Enabled | ❌ | Enable/disable SMS |
| Due Date Reminder Days | 2 | Days before due date to remind |
| Overdue Reminder Days | 1 | Frequency of overdue reminders |
| Email Host | - | SMTP server address |
| Email Port | 587 | SMTP port (587 for TLS) |
| Email Username | - | Email account username |
| Email Password | - | Email account password |
| SMS Provider | - | SMS service provider |
| SMS API Key | - | SMS provider API key |

---

## 🔍 Troubleshooting

### Email Not Sending?
- ✅ Check email settings are correct
- ✅ Use app password for Gmail (not regular password)
- ✅ Check spam folder
- ✅ Verify port 587 is not blocked by firewall
- ✅ Use Test Configuration to diagnose

### Notifications Not Automatic?
- ✅ Ensure notifications are enabled in settings
- ✅ Check system time is correct
- ✅ Scheduled task runs at 9 AM daily
- ✅ Use "Trigger Automatic" to test immediately

### Can't See Notifications Page?
- ✅ Must be logged in as Admin
- ✅ Check Sidebar for "Notifications" menu item
- ✅ Clear browser cache

---

## 📱 SMS Setup (Optional)

SMS is currently a placeholder. To implement:

1. Choose provider (Twilio, Nexmo, AWS SNS)
2. Get API credentials
3. Update `NotificationService.sendSMS()` method
4. Add provider SDK to `pom.xml`
5. Configure in System Settings

---

## 🎨 Notification Status Colors

- 🟡 **PENDING**: Yellow - Not sent yet
- 🟢 **SENT**: Green - Successfully sent
- 🔴 **FAILED**: Red - Failed to send

---

## 📈 Statistics Dashboard

View real-time statistics:
- Total notifications
- Sent/Pending/Failed counts
- Breakdown by category
- Located at top of Notifications page

---

## 🔐 Security Notes

- Only admins can access notification management
- Email passwords stored in database (consider encryption for production)
- Test configuration before production use
- Monitor failed notifications regularly

---

## 💡 Pro Tips

1. **Test First**: Always test configuration before relying on automatic notifications
2. **Monitor Failed**: Check failed notifications regularly to catch configuration issues
3. **Clean Up**: Use "Delete Old" periodically to keep database clean
4. **Custom Messages**: Personalize messages for better member engagement
5. **Timing**: Adjust reminder days based on your library's needs

---

## 📞 Need Help?

- Check full documentation: `NOTIFICATION_SYSTEM_GUIDE.md`
- Review API endpoints in `NotificationController.java`
- Check logs for error messages
- Test configuration to diagnose issues

---

## ✅ Checklist

- [ ] Email settings configured
- [ ] Test email sent successfully
- [ ] Automatic notifications enabled
- [ ] Due date reminder days set
- [ ] Overdue reminder days set
- [ ] Tested creating custom notification
- [ ] Verified notifications appear in list
- [ ] Tested sending notification
- [ ] Checked notification statistics

---

**You're all set! The notification system is ready to keep your library members informed.** 🎉
