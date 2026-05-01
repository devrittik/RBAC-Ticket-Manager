# MERN RBAC Ticket Manager

A full-stack ticket management app built with MongoDB, Express, React, and Node.js.

It supports:
- JWT authentication
- Role-based access control
- User-raised tickets
- Admin assignment, resolution, closing, and reopening workflows
- Swagger API documentation

## Tech Stack

- MongoDB + Mongoose
- Express
- React
- Node.js
- JWT
- Swagger docs

## Current Workflow

### User flow
- Register and log in
- Raise a ticket
- View only tickets created by that user
- Edit a ticket only while it is still `open`

### Admin flow
- View all tickets
- Assign or reassign tickets to admins
- Resolve tickets
- Close resolved tickets
- Reopen closed tickets
- Manage user roles
- View audit logs

## Project Structure

```text
primetrade-assignment/
|-- client/
|   |-- public/
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- context/
|   |   |-- pages/
|   |   |-- App.css
|   |   `-- App.jsx
|   `-- package.json
|-- server/
|   |-- scripts/
|   |   `-- seedAdmin.js
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/v1/
|   |   |-- utils/
|   |   |-- validators/
|   |   |-- app.js
|   |   `-- server.js
|   |-- .env.example
|   `-- package.json
`-- README.md
```

## Prerequisites

- Node.js 18+
- MongoDB local instance or MongoDB Atlas

## Environment Variables

Create `server/.env` from `server/.env.example`.

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mern_auth_db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

ADMIN_NAME=Admin
ADMIN_EMAIL=admin@email.com
ADMIN_PASSWORD=admin&password

CLIENT_URL=http://localhost:3000

NODE_ENV=development
```

Create `client/.env` from `client/.env.example`.

```env
REACT_APP_SERVER_URL=http://localhost:5000
```

## Local Setup

### 1. Install server dependencies

```bash
cd server
npm install
```

### 2. Install client dependencies

```bash
cd ../client
npm install
```

### 3. Start the backend

```bash
cd ../server
npm run dev
```

The API runs on `http://localhost:5000`.

Swagger docs are available at:

```text
http://localhost:5000/api-docs
```

### 4. Seed the initial admin

```bash
cd server
npm run seed
```

If an admin already exists, the script exits safely.

### 5. Start the frontend

```bash
cd ../client
npm start
```

The React app runs on `http://localhost:3000`.

## API Endpoints

### Auth

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Public | Register a user |
| `POST` | `/api/v1/auth/login` | Public | Log in and receive JWT |
| `GET` | `/api/v1/auth/me` | Private | Get current user |

### Tickets

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/tickets` | Private | User gets own tickets, admin gets all |
| `POST` | `/api/v1/tickets` | Private | Create a ticket |
| `GET` | `/api/v1/tickets/:id` | Private | Get one ticket |
| `PUT` | `/api/v1/tickets/:id` | Private | Update a ticket |
| `DELETE` | `/api/v1/tickets/:id` | Admin | Delete a ticket |
| `PATCH` | `/api/v1/tickets/:id/assign` | Admin | Assign or reassign to an admin |
| `PATCH` | `/api/v1/tickets/:id/resolve` | Admin | Mark ticket resolved |
| `PATCH` | `/api/v1/tickets/:id/close` | Admin | Close a resolved ticket |
| `PATCH` | `/api/v1/tickets/:id/reopen` | Admin | Reopen a closed ticket |

### Admin

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/v1/admin/users` | Admin | List all users |
| `PATCH` | `/api/v1/admin/users/:id/role` | Admin | Promote or demote a user |
| `DELETE` | `/api/v1/admin/users/:id` | Admin | Delete a user |
| `GET` | `/api/v1/admin/audit-logs` | Admin | View recent audit logs |

## Ticket Model

The current ticket states are:

- `open`
- `in-progress`
- `resolved`
- `closed`

Other ticket fields include:

- `title`
- `description`
- `category`
- `priority`
- `createdBy`
- `assignedTo`
- `resolvedAt`
- `closedAt`

## Security Notes

- Passwords are hashed with `bcryptjs`
- JWT auth protects private routes
- Public admin registration is blocked
- `helmet` adds common security headers
- `express-rate-limit` protects the API from request bursts
- Validation is handled with `express-validator`

## Frontend Notes

- Axios automatically attaches the JWT from local storage
- Unauthorized API responses redirect the user to `/login`
- Admins get a ticket queue view and user management tab
- Users get a simpler dashboard focused on their own raised tickets

## Available Scripts

### Server

```bash
npm run dev
npm start
npm run seed
```

### Client

```bash
npm start
npm run build
```