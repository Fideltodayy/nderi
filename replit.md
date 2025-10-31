# Library Management System

## Overview

This is an offline-first library management system designed for school libraries. The application enables librarians to catalog books, manage student borrowers, and track check-in/checkout operations with barcode scanner support. Built with a focus on productivity and data clarity, it operates primarily in the browser using local IndexedDB storage for offline functionality.

The system supports CSV bulk imports for rapid book cataloging, provides dashboard analytics on book circulation, and tracks overdue items automatically. It's optimized for single-user operations with emphasis on quick-action workflows for daily library tasks.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18+ with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing (instead of React Router)
- TanStack Query (React Query) for data fetching and caching patterns

**UI Component System:**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component library (New York style variant)
- Tailwind CSS for utility-first styling with custom design tokens
- Custom theme system supporting light/dark modes via CSS variables
- Design follows a utility-first dashboard approach prioritizing information density over visual flair

**State Management:**
- TanStack Query for server/database state synchronization
- Local React state (useState/useReducer) for UI state
- Context API for theme management
- No global state management library (Redux/Zustand) needed due to offline-first architecture

### Data Storage Solution

**Local Database:**
- Dexie.js wrapper around IndexedDB for client-side data persistence
- Fully offline-capable with no server dependency for core operations
- Schema includes three main tables:
  - `books`: Book catalog with barcode, title, category, grade, quantities
  - `students`: Student borrowers with unique IDs, class, contact info
  - `transactions`: Borrow/return records with date tracking and status

**Data Models:**
- Book: Tracks purchased/donated quantities separately, maintains available vs total counts
- Student: Unique student ID generation (S001, S002, etc.)
- Transaction: Links books to students with action type (borrow/return), dates, and status (active/returned/overdue)

**Sync Strategy:**
- Currently implements client-side only storage via IndexedDB
- Custom React hooks (useBooks, useStudents, useTransactions) abstract database operations
- TanStack Query provides optimistic updates and automatic cache invalidation

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript
- Minimal server implementation as application is designed to be offline-first
- Vite middleware integration for development HMR (Hot Module Replacement)
- Session management scaffolding present but not actively used

**Database Schema (Prepared but Unused):**
- Drizzle ORM configured for PostgreSQL (@neondatabase/serverless driver)
- Schema defined in `shared/schema.ts` with user authentication table
- Currently uses in-memory storage (`MemStorage` class) as placeholder
- Database migrations directory configured but not actively used

**API Layer:**
- Express routes registered but minimal implementation
- Storage interface pattern (`IStorage`) prepared for future CRUD operations
- Request/response logging middleware for debugging

### Authentication & Authorization

**Current State:**
- No authentication implemented (single-user, offline application)
- User schema and session storage scaffolding present for future enhancement
- Password fields defined in schema but not utilized

**Session Management:**
- connect-pg-simple configured for PostgreSQL session storage
- Not actively used in current implementation

### Design System

**Typography:**
- Primary fonts: Inter/Roboto from Google Fonts
- Monospace: JetBrains Mono for barcodes and data tables
- Additional fonts loaded: Architects Daughter, DM Sans, Fira Code, Geist Mono

**Spacing & Layout:**
- Tailwind spacing units (2, 4, 6, 8, 12, 16)
- Max-width containers (7xl for main content, 2xl for forms)
- Responsive grid patterns for dashboard stats and data tables

**Component Patterns:**
- Stat cards for dashboard metrics with icon and value display
- Data tables with hover effects and action buttons
- Modal dialogs for check-out/return workflows
- Toast notifications for user feedback

### Key Features & Workflows

**Book Management:**
- CSV import for bulk book cataloging
- Manual single-book entry via dialog forms
- Automatic barcode generation (sequential numbering)
- Category and grade-level organization
- Quantity tracking (purchased vs donated, total vs available)

**Student Management:**
- Student registration with unique ID generation
- Class and contact information tracking
- View of borrowed book counts per student

**Transaction Workflows:**
- Two-step check-out process: barcode scan → student selection
- Quick return via barcode scan
- Automatic due date calculation (14 days default)
- Overdue detection based on current date vs due date
- Transaction history with filtering by date range and status

**Dashboard Analytics:**
- Real-time statistics: total books, available, borrowed, overdue
- Top borrowed books chart (using Recharts library)
- Recent transactions table with status badges

## External Dependencies

### Frontend Libraries
- **UI Components**: @radix-ui/* (accordion, alert-dialog, checkbox, dialog, dropdown-menu, select, toast, etc.)
- **Data Visualization**: recharts for bar charts
- **Forms**: react-hook-form with @hookform/resolvers for validation
- **Date Handling**: date-fns for date arithmetic and formatting
- **CSV Parsing**: papaparse for importing book data
- **Styling**: tailwindcss with autoprefixer, class-variance-authority, clsx, tailwind-merge
- **Icons**: lucide-react icon library

### Backend Libraries
- **Web Framework**: express
- **Database ORM**: drizzle-orm with drizzle-kit for migrations
- **Database Driver**: @neondatabase/serverless (PostgreSQL)
- **Build Tools**: esbuild for server bundling, tsx for TypeScript execution
- **Development**: Replit-specific plugins (@replit/vite-plugin-*)

### Database
- **Client-Side**: Dexie.js (IndexedDB wrapper) with dexie-react-hooks
- **Server-Side (Configured)**: PostgreSQL via Neon serverless driver (not actively used)

### Development Tools
- **Bundler**: Vite with @vitejs/plugin-react
- **TypeScript**: Full TypeScript support across client and server
- **Testing**: Data test IDs present in components for future E2E testing
- **Code Quality**: ESLint and TypeScript strict mode enabled