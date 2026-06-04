# Assistant Builder API

**Assistant Builder API** is the backend service for the Assistant Builder platform.

It provides REST API endpoints for authentication, assistants, chat messages and database operations.

The backend is deployed in production on a VPS using **Nginx** as a reverse proxy and **PM2** as a process manager.

## Frontend Repository

https://github.com/Kulbedka/assistant-builder

## Live Demo

https://assistant-builder-beige.vercel.app

## Production API

https://185-117-116-100.sslip.io

Health check:

```text
GET /health
```

---

## Tech Stack

**Backend:**
Node.js • Express.js • TypeScript • REST API

**Database:**
PostgreSQL • Supabase • Prisma ORM

**Authentication:**
JWT • HTTP-only cookies • bcrypt • Email verification

**Deployment / Tools:**
VPS • Nginx • PM2 • Git • GitHub • npm • Environment variables

---

## Features

* Health check endpoint
* User registration
* User login
* User logout
* JWT authentication with HTTP-only cookies
* Password hashing with bcrypt
* Email verification before login
* Get current authenticated user
* Get all assistants
* Get assistant by ID
* Create assistants
* Get assistant messages
* Create chat messages
* PostgreSQL database integration through Prisma ORM
* Production deployment on VPS with Nginx and PM2

---

## API Endpoints

### Health

```text
GET /health
```

Checks if the API server is running.

---

### Authentication

```text
POST /api/auth/register
```

Registers a new user and creates an email verification code.

```text
POST /api/auth/login
```

Logs in a verified user and sets JWT token in an HTTP-only cookie.

```text
POST /api/auth/logout
```

Logs out the user and clears the auth cookie.

```text
GET /api/auth/me
```

Returns the current authenticated user.

```text
POST /api/auth/verify-email-code
```

Verifies user email using a verification code.

---

### Assistants

```text
GET /api/assistants
```

Returns all assistants.

```text
GET /api/assistants/:id
```

Returns assistant details with related messages.

```text
POST /api/assistants
```

Creates a new assistant.

---

### Messages

```text
POST /api/messages
```

Creates a new chat message and stores it in PostgreSQL.

---

## Architecture

The project uses a separated fullstack architecture:

```text
User
  ↓
Next.js Frontend on Vercel
  ↓ REST API
Express.js Backend on VPS
  ↓ Prisma ORM
PostgreSQL / Supabase Database
```

The backend is responsible for:

* REST API routes
* Authentication logic
* JWT cookie handling
* Password hashing
* Email verification
* Assistant data management
* Chat message persistence
* Database communication through Prisma ORM

---

## What I Built

* Created an Express.js backend API with TypeScript.
* Connected PostgreSQL/Supabase database using Prisma ORM.
* Implemented REST API routes for assistants and messages.
* Implemented user registration and login.
* Added JWT authentication with HTTP-only cookies.
* Added password hashing with bcrypt.
* Implemented email verification before login.
* Added protected user session check through `/api/auth/me`.
* Connected backend API to the Next.js frontend.
* Deployed backend to a VPS.
* Configured Nginx reverse proxy for production API.
* Configured PM2 process manager for running the backend in production.

---

## Project Structure

```text
assistant-builder-api/
├── prisma/
├── src/
│   ├── lib/
│   ├── middleware/
│   ├── routes/
│   └── index.ts
├── package.json
└── tsconfig.json
```

---

## Local Development

Clone the repository:

```bash
git clone https://github.com/Kulbedka/assistant-builder-api.git
cd assistant-builder-api
```

Install dependencies:

```bash
npm install
```

Create `.env` file:

```env
DATABASE_URL="your_database_url"
DIRECT_URL="your_direct_database_url"
JWT_SECRET="your_jwt_secret"
FRONTEND_URL="http://localhost:3000"
```

Important: never commit `.env` file to GitHub.

Generate Prisma client:

```bash
npx prisma generate
```

Run the development server:

```bash
npm run dev
```

The local API will run on:

```text
http://localhost:4000
```

---

## Production

The backend API is deployed on a VPS.

Production setup:

* Node.js backend
* Express.js server
* PM2 process manager
* Nginx reverse proxy
* HTTPS using sslip.io domain
* PostgreSQL database hosted on Supabase

---

## Status

The project is currently in active development.

Implemented:

* Express.js backend
* Prisma connection
* PostgreSQL/Supabase integration
* Auth routes
* JWT authentication
* Email verification
* Assistant routes
* Message creation route
* Production deployment on VPS

Planned improvements:

* Chat deletion
* Chat editing
* Chat duplication
* User permissions
* Assistant sharing
* Better validation and error handling
* Docker setup
