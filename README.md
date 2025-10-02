# Ticket Management System

This project is a full-stack ticket management system with role-based access, messaging, and ticket workflow. It consists of a **frontend** (React + TypeScript + TailwindCSS) and a **backend** (Node.js + Express + TypeScript + Prisma + PostgreSQL).

---

## Table of Contents

- [Features](#features)
- [Roles](#roles)
- [Ticket Status](#ticket-status)
- [Ticket Flow](#ticket-flow)
- [Messaging](#messaging)
- [Tech Stack](#tech-stack)
- [Setup](#setup)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Folder Structure](#folder-structure)
- [API Client](#api-client)
- [Protected Routes & Access Control](#protected-routes--access-control)

---

## Features

- User authentication and role-based access control
- User management (Admin)
- Ticket creation, assignment, solving, and approval
- Messaging between users and agents within tickets
- Real-time updates for ticket status
- Dashboard analytics (Tickets by status, Users by role)
- Responsive UI with TailwindCSS

---

## Roles

- **ADMIN**: Can manage users, assign tickets, and view all analytics.
- **AGENT**: Can view assigned tickets, solve tickets, and message users.
- **USER**: Can create tickets, view their tickets, and approve solved tickets.

---

## Ticket Status

- **PENDING**: Ticket created by a user but not yet assigned.
- **ASSIGNED**: Ticket assigned to an agent.
- **SOLVED**: Ticket resolved by the agent; awaiting user approval.
- **APPROVED**: Ticket approved by the user after resolution.
- **CLOSED**: Ticket completed and closed.

---

## Ticket Flow

1. **User** creates a ticket via the dashboard.
2. **Admin** assigns the ticket to an **Agent**.
3. **Agent** resolves the ticket and marks it as **SOLVED**.
4. **User** approves the solved ticket, changing the status to **APPROVED**.
5. Optionally, **Admin** can close tickets after approval.

---

## Messaging

- Users and agents can exchange messages inside each ticket.
- Messages are displayed in chronological order.
- Each message includes:
  - Author name
  - Content
  - Timestamp

---

## Tech Stack

### Backend
- Node.js + Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication
- Bcrypt for password hashing
- Express middlewares: auth and role-based access

### Frontend
- React + TypeScript
- TailwindCSS
- React Router Dom
- React Hook Form
- React Query for API state management
- Recharts for analytics

---

## Setup


1. Install dependencies:
```bash
cd backend
npm install


cd frontend 
npm install 

add .env on the backend with 
JWT_SECRET_KEY=
FRONTEND_URL=

DATABASE_URL=(im using postgres neon in this project)



add .env on the frontend 
VITE_API_BASE_URL=


now go to the backend and run : npm run dev
same for the frontend 

you are good to go 



application by me - TOUMIR Mohamed, digital information engineer




