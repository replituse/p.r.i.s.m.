# P.R.I.S.M. - Studio Booking & Scheduling System

## Overview
A comprehensive web-based studio/room booking and scheduling management system for film production studios, editing rooms, sound recording facilities, and VFX departments. Built as a modern replacement for the PRISM desktop software.

## Tech Stack
- **Frontend**: React 18 with TypeScript, Wouter for routing, TanStack Query for data fetching
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit Auth (OpenID Connect)
- **UI Components**: Shadcn UI with Tailwind CSS
- **Styling**: Inter font family, modern professional design

## Project Structure
```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── booking/   # Booking-related components
│   │   │   ├── layout/    # Layout components (AppLayout, sidebar)
│   │   │   └── ui/        # Shadcn UI components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/           # Utilities and query client
│   │   └── pages/         # Page components
│   │       └── masters/   # Master data pages (rooms, customers, etc.)
├── server/                 # Express backend
│   ├── db.ts              # Database connection
│   ├── replitAuth.ts      # Authentication setup
│   ├── routes.ts          # API routes
│   └── storage.ts         # Database operations
└── shared/
    └── schema.ts          # Drizzle schema & types
```

## Core Features

### Dashboard
- Monthly calendar view with booking indicators
- Booking grid showing all bookings for selected date
- Status color coding (Tentative, Confirmed, Planning, Completed, Cancelled)
- Hide cancelled bookings toggle

### Booking Management
- Create, edit, and cancel bookings
- Booking time calculations (booking time, actual time, break hours)
- Conflict detection with optional override
- Repeat booking functionality (daily, weekdays, weekly patterns)
- Status tracking

### Master Data
- **Rooms**: Name, short name, type (Sound/Video/Outdoor/Editing/VFX/Meeting), ignore conflict flag
- **Customers**: Name, contact person, email, phone, address
- **Projects**: Name, customer association, description
- **Editors**: Name, email, phone, specialization

### Reports
- Date range filtering
- Room and status filters
- Summary statistics (total bookings, hours, status counts)
- Room-wise booking statistics

## Database Schema
- `sessions` - Session storage for authentication
- `users` - User accounts with Replit Auth integration
- `companies` - Company/organization data
- `rooms` - Studio/room master data
- `customers` - Customer master data
- `projects` - Project master data
- `editors` - Editor/technician master data
- `bookings` - Booking records with time tracking
- `booking_repeats` - Repeat booking metadata
- `audit_logs` - Change tracking

## API Endpoints
- `GET/POST /api/rooms` - Room CRUD
- `GET/POST /api/customers` - Customer CRUD
- `GET/POST /api/projects` - Project CRUD
- `GET/POST /api/editors` - Editor CRUD
- `GET/POST /api/bookings` - Booking CRUD
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `POST /api/bookings/:id/repeat` - Create repeat bookings
- `GET /api/auth/user` - Get current user

## Running the Application
```bash
npm run dev
```
This starts both the Express backend and Vite frontend dev server.

## Environment Variables
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Session encryption key
- `REPL_ID` - Replit project ID (for auth)

## Recent Changes
- Initial implementation of complete booking system
- Dashboard with calendar and booking grid
- Master data management for rooms, customers, projects, editors
- Booking conflict detection
- Repeat booking functionality
- Reports with filtering and statistics
