# 🔔 Notification System - Flow Diagrams

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     NOTIFICATION SYSTEM                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │   Frontend   │─────▶│   Backend    │─────▶│   MongoDB    │  │
│  │  (Next.js)   │      │ (Spring Boot)│      │  (Database)  │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│         │                      │                      │          │
│         │                      │                      │          │
│         ▼                      ▼                      ▼          │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────────┐  │
│  │ Notifications│      │ Notification │      │notifications │  │
│  │     Page     │      │   Service    │      │  collection  │  │
│  └──────────────┘      └──────────────┘      └──────────────┘  │
│         │                      │                                 │
│         │                      ├──────────────┐                 │
│         │                      │              │                 │
│         │                      ▼              ▼                 │
│         │              ┌──────────────┐  ┌──────────────┐      │
│         │              │ Email (SMTP) │  │  SMS (API)   │      │
│         │              └──────────────┘  └──────────────┘      │
│         │                                                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Automatic Notification Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  SCHEDULED TASK (Daily at 9 AM)                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Check System     │
                    │ Settings Enabled │
                    └──────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
    ┌──────────────────────┐    ┌──────────────────────┐
    │ Check Due Date       │    │ Check Overdue        │
    │ Reminders Needed     │    │ Reminders Needed     │
    └──────────────────────┘    └──────────────────────┘
                │                           │
                ▼                           ▼
    ┌──────────────────────┐    ┌──────────────────────┐
    │ Get Books Due in     │    │ Get Overdue Books    │
    │ X Days               │    │                      │
    └──────────────────────┘    └──────────────────────┘
                │                           │
                ▼                           ▼
    ┌──────────────────────┐    ┌──────────────────────┐
    │ For Each Borrow:     │    │ For Each Borrow:     │
    │ - Get Member Info    │    │ - Get Member Info    │
    │ - Create Notification│    │ - Create Notification│
    │ - Send Notification  │    │ - Send Notification  │
    └──────────────────────┘    └──────────────────────┘
                │                           │
                └─────────────┬─────────────┘
                              ▼
                    ┌──────────────────┐
                    │ Update Status    │
                    │ (SENT/FAILED)    │
                    └──────────────────┘
```

---

## Manual Notification Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ADMIN CREATES NOTIFICATION                    │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Admin Panel      │
                    │ Notifications    │
                    │ Create Custom    │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Select Member    │
                    │ Enter Subject    │
                    │ Enter Message    │
                    │ Choose Category  │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ POST /api/       │
                    │ notifications/   │
                    │ custom           │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Create           │
                    │ Notification     │
                    │ (Status: PENDING)│
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Admin Clicks     │
                    │ "Send" Button    │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ POST /api/       │
                    │ notifications/   │
                    │ send/{id}        │
                    └──────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
    ┌──────────────────────┐    ┌──────────────────────┐
    │ Send Email           │    │ Send SMS             │
    │ (if enabled)         │    │ (if enabled)         │
    └──────────────────────┘    └──────────────────────┘
                │                           │
                └─────────────┬─────────────┘
                              ▼
                    ┌──────────────────┐
                    │ Update Status    │
                    │ (SENT/FAILED)    │
                    │ Set sentAt       │
                    └──────────────────┘
```

---

## Integration Flow - Reservation Ready

```
┌─────────────────────────────────────────────────────────────────┐
│                    BOOK BECOMES AVAILABLE                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Librarian/Admin  │
                    │ Clicks "Notify   │
                    │ Member" Button   │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ ReservationService│
                    │ .notifyMember()  │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Update Reservation│
                    │ - Set notifiedDate│
                    │ - Set expiryDate │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ NotificationService│
                    │ .createReservation│
                    │ ReadyNotification│
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Create Notification│
                    │ - Type: BOTH     │
                    │ - Category:      │
                    │   RESERVATION_   │
                    │   READY          │
                    │ - Status: PENDING│
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Automatic Send   │
                    │ (if enabled)     │
                    └──────────────────┘
```

---

## Integration Flow - Fine Created

```
┌─────────────────────────────────────────────────────────────────┐
│                      FINE IS CREATED                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Admin Creates    │
                    │ Manual Fine      │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ FineService      │
                    │ .createManualFine│
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Save Fine to DB  │
                    │ - Amount         │
                    │ - Reason         │
                    │ - Status: UNPAID │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ NotificationService│
                    │ .createFine      │
                    │ Notification     │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Create Notification│
                    │ - Type: BOTH     │
                    │ - Category:      │
                    │   FINE_NOTICE    │
                    │ - Status: PENDING│
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Automatic Send   │
                    │ (if enabled)     │
                    └──────────────────┘
```

---

## Email Sending Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      SEND EMAIL NOTIFICATION                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Get System       │
                    │ Settings         │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Check Email      │
                    │ Enabled?         │
                    └──────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                   NO                  YES
                    │                   │
                    ▼                   ▼
        ┌──────────────────┐  ┌──────────────────┐
        │ Skip Email       │  │ Configure SMTP   │
        │ Sending          │  │ - Host           │
        └──────────────────┘  │ - Port           │
                              │ - Username       │
                              │ - Password       │
                              └──────────────────┘
                                        │
                                        ▼
                              ┌──────────────────┐
                              │ Create MIME      │
                              │ Message          │
                              │ - From           │
                              │ - To             │
                              │ - Subject        │
                              │ - Body           │
                              └──────────────────┘
                                        │
                                        ▼
                              ┌──────────────────┐
                              │ Send via         │
                              │ Transport.send() │
                              └──────────────────┘
                                        │
                          ┌─────────────┴─────────────┐
                          │                           │
                      SUCCESS                      FAILURE
                          │                           │
                          ▼                           ▼
              ┌──────────────────┐      ┌──────────────────┐
              │ Update Status:   │      │ Update Status:   │
              │ - SENT           │      │ - FAILED         │
              │ - Set sentAt     │      │ - Set errorMsg   │
              └──────────────────┘      └──────────────────┘
```

---

## Bulk Send Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    BULK SEND NOTIFICATIONS                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Admin Selects    │
                    │ Multiple         │
                    │ Notifications    │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Click "Send      │
                    │ Selected" Button │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ POST /api/       │
                    │ notifications/   │
                    │ send/bulk        │
                    │ [id1, id2, ...]  │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ For Each ID:     │
                    │ Loop             │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Send Notification│
                    │ (try-catch)      │
                    └──────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
            SUCCESS                      FAILURE
                │                           │
                ▼                           ▼
    ┌──────────────────────┐    ┌──────────────────────┐
    │ Increment            │    │ Increment            │
    │ sent counter         │    │ failed counter       │
    └──────────────────────┘    └──────────────────────┘
                │                           │
                └─────────────┬─────────────┘
                              ▼
                    ┌──────────────────┐
                    │ Return Result:   │
                    │ {                │
                    │   sent: X,       │
                    │   failed: Y,     │
                    │   total: Z       │
                    │ }                │
                    └──────────────────┘
```

---

## Filter and Search Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    FILTER NOTIFICATIONS                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ User Selects     │
                    │ Filter Options   │
                    └──────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
    ┌──────────────────────┐    ┌──────────────────────┐
    │ Status Filter        │    │ Category Filter      │
    │ - ALL                │    │ - ALL                │
    │ - PENDING            │    │ - DUE_DATE_REMINDER  │
    │ - SENT               │    │ - OVERDUE_REMINDER   │
    │ - FAILED             │    │ - RESERVATION_READY  │
    └──────────────────────┘    │ - FINE_NOTICE        │
                                │ - GENERAL            │
                                └──────────────────────┘
                │                           │
                └─────────────┬─────────────┘
                              ▼
                    ┌──────────────────┐
                    │ Build API Query  │
                    └──────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
    ┌──────────────────────┐    ┌──────────────────────┐
    │ GET /api/            │    │ GET /api/            │
    │ notifications/       │    │ notifications/       │
    │ status/{status}      │    │ category/{category}  │
    └──────────────────────┘    └──────────────────────┘
                │                           │
                └─────────────┬─────────────┘
                              ▼
                    ┌──────────────────┐
                    │ Display Filtered │
                    │ Results in Table │
                    └──────────────────┘
```

---

## Statistics Dashboard Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    STATISTICS DASHBOARD                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Page Loads       │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ GET /api/        │
                    │ notifications/   │
                    │ statistics       │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Backend Queries: │
                    │ - Count total    │
                    │ - Count by status│
                    │ - Count by cat.  │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Return JSON:     │
                    │ {                │
                    │   total: X,      │
                    │   sent: Y,       │
                    │   pending: Z,    │
                    │   failed: W,     │
                    │   dueDateRem: A, │
                    │   overdueRem: B, │
                    │   reservation: C,│
                    │   fineNotice: D, │
                    │   general: E     │
                    │ }                │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Display in       │
                    │ Statistics Cards │
                    │ (8 cards)        │
                    └──────────────────┘
```

---

## Test Configuration Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    TEST CONFIGURATION                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Admin Enters     │
                    │ Test Email/Phone │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ Click "Send Test │
                    │ Notifications"   │
                    └──────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │ POST /api/       │
                    │ notifications/   │
                    │ test             │
                    │ {email, phone}   │
                    └──────────────────┘
                              │
                ┌─────────────┴─────────────┐
                │                           │
                ▼                           ▼
    ┌──────────────────────┐    ┌──────────────────────┐
    │ Test Email           │    │ Test SMS             │
    │ (if enabled)         │    │ (if enabled)         │
    └──────────────────────┘    └──────────────────────┘
                │                           │
                ▼                           ▼
    ┌──────────────────────┐    ┌──────────────────────┐
    │ Try Send             │    │ Try Send             │
    └──────────────────────┘    └──────────────────────┘
                │                           │
          ┌─────┴─────┐             ┌─────┴─────┐
          │           │             │           │
       SUCCESS     FAILURE       SUCCESS     FAILURE
          │           │             │           │
          ▼           ▼             ▼           ▼
    ┌─────────┐ ┌─────────┐   ┌─────────┐ ┌─────────┐
    │ Status: │ │ Status: │   │ Status: │ │ Status: │
    │ SUCCESS │ │ FAILED  │   │ SUCCESS │ │ FAILED  │
    │ Message │ │ Error   │   │ Message │ │ Error   │
    └─────────┘ └─────────┘   └─────────┘ └─────────┘
          │           │             │           │
          └─────┬─────┘             └─────┬─────┘
                │                         │
                └───────────┬─────────────┘
                            ▼
                  ┌──────────────────┐
                  │ Display Results  │
                  │ in Alert Dialog  │
                  └──────────────────┘
```

---

## Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                      DATA FLOW OVERVIEW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  User Action → Frontend → API Call → Backend Service →          │
│  Database → Response → Frontend → UI Update                     │
│                                                                   │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐    │
│  │  Admin   │──▶│ React    │──▶│  REST    │──▶│ Spring   │    │
│  │  Action  │   │ Component│   │   API    │   │ Service  │    │
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘    │
│                                                      │           │
│                                                      ▼           │
│                                              ┌──────────────┐   │
│                                              │   MongoDB    │   │
│                                              │  Collection  │   │
│                                              └──────────────┘   │
│                                                      │           │
│                                                      ▼           │
│                                              ┌──────────────┐   │
│                                              │ Email/SMS    │   │
│                                              │   Provider   │   │
│                                              └──────────────┘   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

**These diagrams illustrate the complete notification system flow from user interaction to email/SMS delivery.**
