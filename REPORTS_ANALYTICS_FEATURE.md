# Reports & Analytics Feature

## Overview
Implemented a comprehensive reports and analytics system for the admin dashboard with detailed insights into books, users, overdue items, and financial data.

## Backend Changes

### 1. ReportService

Comprehensive reporting service with the following capabilities:

#### Book Reports
- `getMostBorrowedBooks(limit)` - Top borrowed books with counts
- `getLeastBorrowedBooks(limit)` - Books with lowest borrow counts
- `getBookStatistics()` - Overall book statistics
  - Total books
  - Total copies
  - Available copies
  - Borrowed copies
  - Total borrows

#### User Reports
- `getMostActiveMembers(limit)` - Most active members by borrow count
- `getMemberActivityReport(memberID)` - Detailed member activity
  - Total borrows
  - Active borrows
  - Overdue borrows
  - Total fines
  - Total paid
  - Complete borrow history
- `getMemberStatistics()` - Overall member statistics
  - Total members
  - Active members (currently borrowing)

#### Overdue Reports
- `getOverdueReport()` - Complete list of overdue items
  - Member details
  - Book details
  - Due dates
  - Days overdue
- `getOverdueStatistics()` - Overdue summary
  - Total overdue count
  - Unique members with overdue
  - Unique books overdue

#### Fine Reports
- `getFineReport()` - Comprehensive financial report
  - Total fines issued
  - Total collected
  - Total outstanding
  - Count by status (unpaid, partially paid, paid, waived)
- `getRecentPayments(limit)` - Recent payment transactions
  - Payment details
  - Member information
  - Payment method
  - Fine reason

#### Dashboard Summary
- `getDashboardSummary()` - Aggregated summary of all reports

### 2. ReportController

RESTful endpoints for all reporting functions:

#### Book Endpoints
- `GET /api/reports/books/most-borrowed?limit=10` - Most borrowed books
- `GET /api/reports/books/least-borrowed?limit=10` - Least borrowed books
- `GET /api/reports/books/statistics` - Book statistics

#### User Endpoints
- `GET /api/reports/members/most-active?limit=10` - Most active members
- `GET /api/reports/members/{memberID}/activity` - Member activity report
- `GET /api/reports/members/statistics` - Member statistics

#### Overdue Endpoints
- `GET /api/reports/overdue` - Overdue report
- `GET /api/reports/overdue/statistics` - Overdue statistics

#### Fine Endpoints
- `GET /api/reports/fines` - Fine report
- `GET /api/reports/payments/recent?limit=10` - Recent payments

#### Dashboard Endpoint
- `GET /api/reports/dashboard-summary` - Complete dashboard summary

## Frontend Changes

### 1. New Admin Page: /admin/reports

Comprehensive analytics dashboard with four main sections:

#### Book Reports Tab
- **Book Statistics Dashboard**
  - Total books
  - Total copies
  - Available copies (green)
  - Borrowed copies (red)
  - Total borrows

- **Most Borrowed Books**
  - Ranked list (top 10)
  - Title, author, borrow count
  - Visual rank badges

- **Least Borrowed Books**
  - Bottom 10 books
  - Helps identify unpopular inventory

#### User Reports Tab
- **Member Statistics Dashboard**
  - Total members
  - Active members (currently borrowing)

- **Most Active Members**
  - Ranked list (top 10)
  - Name, email, total borrows
  - Visual rank badges

#### Overdue Reports Tab
- **Overdue Statistics Dashboard**
  - Total overdue count (red highlight)
  - Unique members with overdue
  - Unique books overdue

- **Overdue Books & Users**
  - Complete overdue list
  - Member name and email
  - Book title
  - Due date
  - Days overdue (red badge)

#### Fine Reports Tab
- **Fine Statistics Dashboard**
  - Total fines issued
  - Total collected (green)
  - Total outstanding (red highlight)
  - Waived count

- **Recent Payments**
  - Last 10 payments
  - Date, member, amount, method
  - Fine reason
  - Color-coded amounts

### 2. Features

- **Refresh Button**: Reload all reports on demand
- **Tab Navigation**: Easy switching between report types
- **Visual Indicators**: Color-coded statistics and badges
- **Responsive Layout**: Adapts to different screen sizes
- **Empty States**: Friendly messages when no data available

### 3. Updated Components

#### Sidebar
- Added "Reports & Analytics" link for admin role

#### Admin Dashboard
- Added "View Reports & Analytics" quick action button

### 4. New Frontend Service: reportService.js
Complete API integration for all reporting endpoints

## Features Implemented

### 1. Book Analytics
- Identify most popular books for procurement decisions
- Find least borrowed books for potential removal
- Track overall book utilization
- Monitor availability vs borrowed ratio

### 2. User Analytics
- Identify most engaged members
- Track member activity patterns
- Monitor active vs inactive members
- Individual member activity reports

### 3. Overdue Monitoring
- Complete overdue tracking
- Identify problematic members
- Track overdue books
- Calculate days overdue automatically

### 4. Financial Analytics
- Track fine collection rates
- Monitor outstanding amounts
- Payment history tracking
- Payment method analysis

### 5. Data Visualization
- Color-coded statistics
- Rank badges for top performers
- Status badges for quick identification
- Grid layouts for easy comparison

## Usage

### Access Reports
1. Navigate to Admin Dashboard
2. Click "View Reports & Analytics" or use sidebar
3. Select desired report tab

### Book Reports
- View most/least borrowed books
- Analyze book statistics
- Make procurement decisions

### User Reports
- Identify most active members
- Review member activity
- Track engagement patterns

### Overdue Reports
- Monitor overdue items
- Identify members with overdue books
- Calculate potential fines

### Fine Reports
- Review financial performance
- Track payment collection
- Monitor outstanding amounts

### Refresh Data
- Click "Refresh Reports" button
- All reports reload with latest data

## Report Types Summary

### Book Reports
1. Most Borrowed Books (Top 10)
2. Least Borrowed Books (Bottom 10)
3. Book Statistics (Overall metrics)

### User Reports
1. Most Active Members (Top 10)
2. Member Statistics (Overall metrics)
3. Individual Member Activity (On-demand)

### Overdue Reports
1. Complete Overdue List
2. Overdue Statistics

### Fine Reports
1. Financial Summary
2. Recent Payments (Last 10)

## Data Insights

### Book Insights
- Popular genres/authors
- Inventory optimization
- Purchase recommendations
- Removal candidates

### User Insights
- Member engagement levels
- Active vs inactive ratio
- High-risk members (overdue)
- Payment behavior

### Financial Insights
- Collection efficiency
- Outstanding amounts
- Payment method preferences
- Fine waiver patterns

## Next Steps (Optional Enhancements)
- Date range filters for reports
- Export to PDF/Excel
- Scheduled email reports
- Custom report builder
- Graphical charts (bar, pie, line)
- Trend analysis over time
- Comparative analysis (month-over-month)
- Predictive analytics
- Member segmentation
- Book recommendation engine
- Automated alerts for anomalies
- Dashboard widgets
- Real-time updates
- Advanced filtering and sorting
- Report templates
