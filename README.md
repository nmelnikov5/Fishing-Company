# Fishing Company Database Management System

A full-stack web application for managing a fishing company's fleet, crew, and catch data.

## Features

- Fleet management (boats, crew, fishing trips)
- Catch tracking and reporting
- Fishing bank management
- Crew management
- Detailed reporting and analytics

## Tech Stack

- Frontend: React.js with TypeScript
- Backend: Node.js with Express
- Database: PostgreSQL
- ORM: Prisma

## Project Structure

```
fishing-company/
├── client/             # React frontend
├── server/             # Node.js backend
└── database/           # Database migrations and schema
```

## Setup Instructions

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Set up the database:
   - Create a PostgreSQL database
   - Update the database connection string in `server/.env`
   - Run migrations:
     ```bash
     cd server
     npx prisma migrate dev
     ```

4. Start the development servers:
   ```bash
   # Start backend server
   cd server
   npm run dev

   # Start frontend server
   cd ../client
   npm start
   ```

## API Documentation

The API documentation will be available at `http://localhost:3000/api-docs` when the server is running.

## Database Schema

The database includes the following main entities:
- Boats
- Crew Members
- Fishing Trips
- Fishing Banks
- Fish Catches
- Fish Types 