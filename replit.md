# Overview

VendedorElite is a comprehensive sales gamification platform designed to transform sales teams into high-performing units through real-time leaderboards, customizable campaigns, and engaging celebrations. The platform provides white-label capabilities allowing companies to customize branding, create targeted sales campaigns with custom prizes, and track performance across their sales teams in real-time.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Theme System**: Built-in light/dark mode toggle with system preference detection

## Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL storage
- **Real-time Features**: WebSocket implementation for live updates

## Data Storage Solutions
- **Primary Database**: PostgreSQL (configured for Neon Database)
- **Session Store**: PostgreSQL table for session persistence
- **File Storage**: Google Cloud Storage integration with custom ACL system
- **Database Migrations**: Drizzle Kit for schema management

## Key Data Models
- **Users**: Role-based (admin/seller) with company association
- **Companies**: White-label branding with custom colors and logos
- **Campaigns**: Time-bound sales competitions with custom prizes
- **Sales**: Transaction records linked to campaigns and sellers
- **Campaign Participants**: Many-to-many relationship between users and campaigns

## Authentication and Authorization
- **Identity Provider**: Replit Auth with OIDC flow
- **Session Security**: HTTP-only cookies with CSRF protection
- **Role-based Access**: Admin users can manage campaigns; sellers have restricted access
- **Object-level Permissions**: Custom ACL system for file access control

## Real-time Features
- **WebSocket Server**: Integrated with HTTP server for live updates
- **Live Leaderboards**: Real-time ranking updates as sales are recorded
- **Celebration System**: Instant notifications and confetti animations for new sales
- **TV Mode**: Full-screen display mode for office screens with auto-refresh

## White-label Customization
- **Company Branding**: Custom logos, company names, and color schemes
- **Campaign Customization**: Custom prize emojis, images, and descriptions
- **Theme Flexibility**: Light/dark mode support with company color integration

## Performance Optimizations
- **Query Caching**: TanStack Query with stale-while-revalidate strategy
- **Code Splitting**: Vite-based bundle optimization
- **Database Indexing**: Optimized queries for leaderboard calculations
- **Real-time Throttling**: WebSocket message batching for high-frequency updates

# External Dependencies

## Core Infrastructure
- **Neon Database**: Serverless PostgreSQL hosting
- **Replit Platform**: Development environment and authentication provider
- **Google Cloud Storage**: Object storage for file uploads

## Frontend Libraries
- **React Ecosystem**: React 18, React Hook Form, React Query
- **UI Components**: Radix UI primitives, Lucide React icons
- **Animations**: Framer Motion for celebrations and transitions
- **Date Handling**: date-fns for localized date formatting

## Backend Services
- **Database**: Drizzle ORM with PostgreSQL adapter
- **Authentication**: OpenID Connect client integration
- **File Processing**: Google Cloud Storage SDK
- **WebSockets**: Native WebSocket implementation

## Development Tools
- **Build System**: Vite with TypeScript support
- **Code Quality**: ESLint configuration
- **CSS Processing**: PostCSS with Tailwind CSS
- **Package Management**: npm with lock file versioning