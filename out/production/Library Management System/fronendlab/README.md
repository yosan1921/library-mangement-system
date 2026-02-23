# Library Management System - Frontend

React + Next.js frontend for the Library Management System.

## Prerequisites

- Node.js 18+ and npm
- Backend server running on http://localhost:8080

## Setup Instructions

### 1. Install Dependencies

```bash
cd fronendlab
npm install
```

### 2. Run Development Server

```bash
npm run dev
```

The application will start on http://localhost:3000

### 3. Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
fronendlab/
├── pages/                    # Next.js pages
│   ├── index.js             # Home page
│   ├── admin/               # Admin pages
│   │   ├── dashboard.js
│   │   ├── books.js
│   │   └── members.js
│   ├── librarian/           # Librarian pages
│   │   ├── dashboard.js
│   │   ├── issueBook.js
│   │   └── returnBook.js
│   └── member/              # Member pages
│       ├── dashboard.js
│       ├── searchBooks.js
│       └── reservations.js
├── components/              # Reusable components
│   ├── Navbar.js
│   ├── Sidebar.js
│   ├── BookCard.js
│   └── MemberCard.js
├── services/                # API service files
│   ├── bookService.js
│   ├── memberService.js
│   └── borrowService.js
└── styles/                  # CSS styles
    ├── globals.css
    └── dashboard.css
```

## Features

### Admin Dashboard
- View statistics (total books, members, active borrows)
- Manage books (add, edit, delete)
- Manage members (add, edit, delete)

### Librarian Dashboard
- View active borrows and overdue books
- Issue books to members
- Process book returns

### Member Dashboard
- Search books by title, author, or category
- View borrow history
- Reserve unavailable books
- Manage reservations

## API Integration

The frontend communicates with the Spring Boot backend at `http://localhost:8080/api/`

Endpoints used:
- `/books` - Book management
- `/members` - Member management
- `/borrow` - Borrow/return operations
- `/reservations` - Reservation management

## Notes

- Member ID is currently hardcoded as placeholder. In production, implement proper authentication.
- All API calls use axios for HTTP requests.
- Error handling is basic - enhance for production use.
