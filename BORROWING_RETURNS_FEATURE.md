# Borrowing & Returns Management Feature

## Overview
Implemented a comprehensive borrowing and returns management system for the admin dashboard with approval workflow, tracking, and overdue management.

## Backend Changes

### 1. BorrowRecord Model
- Added `status` field with values: PENDING, APPROVED, REJECTED, RETURNED
- Supports approval workflow for borrow requests

### 2. BorrowService
- `issueBook()` - Creates borrow request with PENDING status
- `approveBorrowRequest()` - Approves pending requests and decrements book copies
- `rejectBorrowRequest()` - Rejects pending requests
- `getPendingRequests()` - Retrieves all pending borrow requests
- `returnBook()` - Updated to only process APPROVED borrows and set status to RETURNED

### 3. BorrowController
- `GET /api/borrow/pending` - Get pending borrow requests
- `POST /api/borrow/approve/{recordId}` - Approve a borrow request
- `POST /api/borrow/reject/{recordId}` - Reject a borrow request

### 4. BorrowRecordRepository
- Added `findByStatus()` method for querying by status

## Frontend Changes

### 1. New Admin Page: /admin/borrows
Features:
- Three tabs: Pending Requests, Active Borrows, Overdue Books
- Approve/Reject pending borrow requests
- View all active borrows with due dates
- Track overdue books with days overdue calculation
- Process returns for approved borrows
- Real-time data refresh after actions

### 2. Updated Admin Dashboard
- Added overdue books count (red highlight)
- Added pending requests count (orange highlight)
- Quick action buttons to navigate to management pages
- Enhanced statistics display

### 3. Updated Sidebar
- Added "Borrows & Returns" link for admin role

### 4. Updated borrowService.js
- `getPendingRequests()` - Fetch pending requests
- `approveBorrowRequest()` - Approve a request
- `rejectBorrowRequest()` - Reject a request

## Features Implemented

1. **Manual Approval Workflow**
   - Members create borrow requests (PENDING status)
   - Admins can approve or reject requests
   - Only approved requests decrement book inventory

2. **Active Borrows Tracking**
   - View all currently borrowed books
   - See issue dates and due dates
   - Visual indicators for overdue status

3. **Overdue Management**
   - Dedicated tab for overdue books
   - Calculate days overdue
   - Quick access to process returns

4. **Return Processing**
   - One-click return processing
   - Automatic book availability update
   - Status tracking (RETURNED)

## Usage

1. Navigate to Admin Dashboard
2. Click "Manage Borrows & Returns" or use sidebar link
3. Use tabs to switch between:
   - Pending Requests: Approve/reject new borrow requests
   - Active Borrows: Monitor current borrows
   - Overdue: Track and manage overdue items
4. Process returns directly from Active or Overdue tabs

## Next Steps (Optional Enhancements)
- Email notifications for approvals/rejections
- Fine calculation for overdue books
- Bulk approval/rejection
- Export reports
- Member borrowing history view
