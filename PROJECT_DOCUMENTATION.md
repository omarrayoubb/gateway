# Gateway Microservices Project Documentation

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Project Structure](#project-structure)
4. [What Has Been Implemented](#what-has-been-implemented)
5. [Prerequisites](#prerequisites)
6. [Environment Configuration](#environment-configuration)
7. [How to Run](#how-to-run)
8. [API Endpoints](#api-endpoints)
9. [Authentication & Authorization](#authentication--authorization)
10. [Data Flow](#data-flow)
11. [What's Missing / TODO](#whats-missing--todo)
12. [Troubleshooting](#troubleshooting)

---

## 🎯 Project Overview

This is a **NestJS monorepo** implementing a microservices architecture with:
- **API Gateway** - Single entry point for all client requests
- **Accounts Service** - User authentication and management
- **CRM Service** - Customer Relationship Management (contacts, accounts, leads, deals, etc.)
- **Desk Service** - Service desk management (tickets, work orders, etc.)

### Key Technologies
- **Framework**: NestJS 11.x
- **Language**: TypeScript
- **Database**: PostgreSQL (separate databases per service)
- **Inter-Service Communication**: gRPC
- **Message Queue**: RabbitMQ (for event-driven communication)
- **Authentication**: JWT (JSON Web Tokens)
- **ORM**: TypeORM

---

## 🏗️ Architecture

### Service Architecture

```
┌─────────────────┐
│   API Gateway   │  Port 3000 (HTTP REST)
│  (Entry Point)  │
└────────┬────────┘
         │
    ┌────┴────┬──────────────┬──────────────┐
    │         │              │              │
    ▼         ▼              ▼              ▼
┌────────┐ ┌──────┐    ┌──────────┐  ┌──────────┐
│Accounts │ │ CRM  │    │   Desk   │  │ RabbitMQ │
│Service │ │Service│    │ Service  │  │ (Events) │
└────────┘ └──────┘    └──────────┘  └──────────┘
Port 3004  Port 50052  Port 50053
gRPC 50051 (gRPC)      (gRPC)
```

### Communication Flow

1. **Client → API Gateway** (HTTP REST with JWT)
2. **API Gateway → Services** (gRPC with JWT in metadata)
3. **Accounts → CRM** (RabbitMQ events for user synchronization)
4. **Desk → CRM** (gRPC for fetching contacts/accounts)

### Ports

| Service | HTTP Port | gRPC Port |
|---------|-----------|-----------|
| API Gateway | 3000 | - |
| Accounts | 3004 | 50051 |
| CRM | - | 50052 |
| Desk | - | 50053 |

---

## 📁 Project Structure

```
gateway/
├── apps/
│   ├── api-gateway/          # API Gateway (HTTP REST)
│   │   ├── src/
│   │   │   ├── accounts/     # Accounts endpoints
│   │   │   ├── crm/          # CRM endpoints
│   │   │   ├── desk/         # Desk endpoints
│   │   │   └── auth/         # JWT validation
│   │   └── main.ts
│   │
│   ├── accounts/             # Accounts Service
│   │   ├── src/
│   │   │   ├── auth/         # Authentication (login, register)
│   │   │   ├── users/        # User management
│   │   │   └── rabbitmq/     # Event publisher
│   │   └── main.ts
│   │
│   ├── crm/                  # CRM Service (gRPC only)
│   │   ├── src/
│   │   │   ├── accounts/     # Account management
│   │   │   ├── contacts/     # Contact management
│   │   │   ├── leads/        # Lead management
│   │   │   ├── deals/        # Deal management
│   │   │   ├── profiles/     # User profiles
│   │   │   ├── roles/        # User roles
│   │   │   ├── users/        # UserSync (synced from Accounts)
│   │   │   ├── auth/         # JWT validation & authorization
│   │   │   └── rabbitmq/     # Event consumer
│   │   └── main.ts
│   │
│   └── desk/                 # Desk Service (gRPC only)
│       ├── src/
│       │   ├── tickets/      # Ticket management
│       │   ├── work-orders/  # Work order management
│       │   ├── estimates/   # Estimate management
│       │   └── crm/          # CRM client (gRPC)
│       └── main.ts
│
├── libs/
│   └── common/               # Shared library
│       └── src/
│           ├── proto/        # gRPC proto definitions
│           │   ├── auth.proto
│           │   ├── crm.proto
│           │   └── desk.proto
│           └── types/        # Shared TypeScript types
│
├── package.json
├── nest-cli.json
├── tsconfig.json
└── .env                      # Environment variables (create this)
```

---

## ✅ What Has Been Implemented

### 1. **Authentication & Authorization**
- ✅ JWT-based authentication in Accounts service
- ✅ JWT validation in API Gateway
- ✅ JWT validation in CRM service (via gRPC interceptors)
- ✅ Role-based and profile-based authorization in CRM
- ✅ User registration and login endpoints
- ✅ Token validation endpoint

### 2. **User Management**
- ✅ User creation in Accounts service
- ✅ User synchronization to CRM via RabbitMQ events
- ✅ UserSync entity in CRM (read-only copy of users)
- ✅ Role and Profile assignment in CRM

### 3. **Event-Driven Architecture**
- ✅ RabbitMQ integration in Accounts (publisher)
- ✅ RabbitMQ integration in CRM (consumer)
- ✅ User lifecycle events (created, updated, deleted)

### 4. **gRPC Communication**
- ✅ Proto definitions for Auth, CRM, and Desk services
- ✅ gRPC controllers in all services
- ✅ gRPC clients in API Gateway
- ✅ Metadata passing for JWT tokens

### 5. **CRM Features**
- ✅ Contacts management (CRUD)
- ✅ Accounts management (CRUD)
- ✅ Leads management
- ✅ Deals management
- ✅ Profiles and Roles management
- ✅ Permission-based access control

### 6. **Desk Features**
- ✅ Tickets management
- ✅ Work Orders management
- ✅ Integration with CRM for contacts/accounts

### 7. **API Gateway**
- ✅ REST endpoints for all services
- ✅ JWT authentication guards
- ✅ Request routing to appropriate services
- ✅ CORS configuration

---

## 🔧 Prerequisites

Before running the project, ensure you have:

1. **Node.js** (v18 or higher)
2. **PostgreSQL** (v12 or higher)
3. **RabbitMQ** (v3.8 or higher)
4. **npm** or **yarn**

### Installing Prerequisites

**PostgreSQL:**
```bash
# Windows (using Chocolatey)
choco install postgresql

# macOS
brew install postgresql

# Linux
sudo apt-get install postgresql
```

**RabbitMQ:**
```bash
# Windows (using Chocolatey)
choco install rabbitmq

# macOS
brew install rabbitmq

# Linux
sudo apt-get install rabbitmq-server
```

---

## ⚙️ Environment Configuration

Create a `.env` file in the root directory:

```env
# ============================================
# JWT Configuration
# ============================================
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# ============================================
# Accounts Service Database
# ============================================
ACCOUNTS_DB_HOST=localhost
ACCOUNTS_DB_PORT=5432
ACCOUNTS_DB_USERNAME=postgres
ACCOUNTS_DB_PASSWORD=your_password
ACCOUNTS_DB_DATABASE=accounts_db
ACCOUNTS_DB_SYNCHRONIZE=true

# ============================================
# CRM Service Database
# ============================================
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=crm_db

# ============================================
# Desk Service Database
# ============================================
# Note: Desk uses same DB_* variables but different database name
# DB_NAME=desk_backend

# ============================================
# RabbitMQ Configuration
# ============================================
RABBITMQ_URL=amqp://localhost:5672

# ============================================
# Service Ports (Optional - defaults shown)
# ============================================
PORT=3000              # API Gateway
# Accounts HTTP: 3004 (default)
# Accounts gRPC: 50051 (default)
# CRM gRPC: 50052 (default)
# Desk gRPC: 50053 (default)
```

### Database Setup

Create the required databases:

```sql
-- Connect to PostgreSQL
psql -U postgres

-- Create databases
CREATE DATABASE accounts_db;
CREATE DATABASE crm_db;
CREATE DATABASE desk_backend;
```

---

## 🚀 How to Run

### 1. Install Dependencies

```bash
npm install
```

### 2. Start RabbitMQ

**Windows:**
```bash
# RabbitMQ should start automatically as a service
# Or start manually:
rabbitmq-server
```

**macOS/Linux:**
```bash
# Start RabbitMQ service
sudo systemctl start rabbitmq-server
# Or:
rabbitmq-server
```

### 3. Start All Services

You need to run each service in a separate terminal:

**Terminal 1 - Accounts Service:**
```bash
npm run start:dev accounts
# Or:
nest start accounts --watch
```

**Terminal 2 - CRM Service:**
```bash
npm run start:dev crm
# Or:
nest start crm --watch
```

**Terminal 3 - Desk Service:**
```bash
npm run start:dev desk
# Or:
nest start desk --watch
```

**Terminal 4 - API Gateway:**
```bash
npm run start:dev api-gateway
# Or:
nest start api-gateway --watch
```

### 4. Verify Services Are Running

Check the console output for each service:

- **Accounts**: "Accounts HTTP REST API is running on port 3004" and "Accounts gRPC microservice is running on port 50051"
- **CRM**: "CRM gRPC microservice is running on port 50052"
- **Desk**: "Desk gRPC microservice is running on port 50053"
- **API Gateway**: "API Gateway is running on port 3000"

---

## 📡 API Endpoints

### Authentication (via API Gateway)

**Base URL**: `http://localhost:3000`

#### Register User
```http
POST /accounts/register
Content-Type: application/json

{
  "workId": "EMP001",
  "name": "John Doe",
  "email": "john@example.com",
  "workLocation": "New York",
  "password": "SecurePass123"
}
```

#### Login
```http
POST /accounts/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

**Response:**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe",
    "workId": "EMP001",
    "workLocation": "New York"
  }
}
```

### CRM Endpoints (via API Gateway)

All CRM endpoints require JWT authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

#### Contacts
- `GET /crm/contacts` - List contacts (with pagination)
- `GET /crm/contacts/:id` - Get contact by ID
- `POST /crm/contacts` - Create contact
- `PATCH /crm/contacts/:id` - Update contact
- `DELETE /crm/contacts/:id` - Delete contact

#### Accounts
- `GET /crm/accounts` - List accounts (with pagination)
- `GET /crm/accounts/:id` - Get account by ID
- `POST /crm/accounts` - Create account
- `PATCH /crm/accounts/:id` - Update account
- `DELETE /crm/accounts/:id` - Delete account

### Desk Endpoints (via API Gateway)

All Desk endpoints require JWT authentication.

#### Tickets
- `GET /desk/tickets` - List tickets
- `GET /desk/tickets/:id` - Get ticket by ID
- `POST /desk/tickets` - Create ticket
- `PATCH /desk/tickets/:id` - Update ticket

#### Work Orders
- `GET /desk/work-orders` - List work orders
- `GET /desk/work-orders/:id` - Get work order by ID
- `POST /desk/work-orders` - Create work order
- `PATCH /desk/work-orders/:id` - Update work order

---

## 🔐 Authentication & Authorization

### Authentication Flow

1. **User Registration/Login** → Accounts Service
2. **JWT Token Generated** → Contains user ID and email
3. **Token Sent to Client** → Client stores token
4. **Client Makes Request** → Includes token in `Authorization: Bearer <token>` header
5. **API Gateway Validates Token** → Using JwtAuthGuard
6. **Token Passed to Services** → Via gRPC metadata
7. **Services Validate Token** → Using gRPC interceptors
8. **Authorization Check** → Based on user's profile and role

### Authorization in CRM

The CRM service implements role-based and profile-based authorization:

- **Profiles**: Define permissions per module (contacts, accounts, leads, etc.)
- **Roles**: Define hierarchical access (with peer data sharing)
- **Administrator Profile**: Bypasses all permission checks

### Permission Structure

```typescript
{
  "contacts": {
    "create": true,
    "read": true,
    "update": false,
    "delete": false
  },
  "accounts": {
    "create": true,
    "read": true,
    "update": true,
    "delete": false
  }
}
```

---

## 🔄 Data Flow

### User Creation Flow

```
1. Client → API Gateway → Accounts Service
   POST /accounts/register

2. Accounts Service:
   - Creates user in accounts_db
   - Hashes password
   - Publishes "user.created" event to RabbitMQ

3. RabbitMQ → CRM Service:
   - Consumes "user.created" event
   - Creates UserSync entry in crm_db
   - User is now available in CRM for role/profile assignment
```

### Request Flow (Example: Create Contact)

```
1. Client → API Gateway
   POST /crm/contacts
   Headers: Authorization: Bearer <token>

2. API Gateway:
   - Validates JWT token
   - Extracts token
   - Calls CRM service via gRPC
   - Passes token in gRPC metadata

3. CRM Service:
   - GrpcJwtInterceptor validates token
   - Checks user exists in UserSync table
   - GrpcAuthorizationInterceptor checks permissions
   - ContactsGrpcController processes request
   - Returns response

4. API Gateway → Client
   Returns contact data
```

---

## ❌ What's Missing / TODO

### High Priority

1. **Environment Variables Validation**
   - Add validation for required environment variables on startup
   - Provide clear error messages if variables are missing

2. **Error Handling**
   - Standardize error responses across all services
   - Implement proper error logging
   - Add error tracking (e.g., Sentry)

3. **Database Migrations**
   - Currently using `synchronize: true` (not recommended for production)
   - Need to create TypeORM migrations
   - Migration scripts for all services

4. **Testing**
   - Unit tests for services
   - Integration tests for gRPC communication
   - E2E tests for API endpoints

5. **API Documentation**
   - Swagger/OpenAPI documentation
   - API endpoint documentation
   - Request/response examples

### Medium Priority

6. **Logging**
   - Structured logging (Winston, Pino)
   - Log aggregation
   - Request tracing

7. **Rate Limiting**
   - Implement rate limiting in API Gateway
   - Protect against abuse

8. **Caching**
   - Redis integration for caching
   - Cache user sessions
   - Cache frequently accessed data

9. **Health Checks**
   - Health check endpoints for all services
   - Database connection checks
   - RabbitMQ connection checks

10. **Monitoring**
    - Metrics collection (Prometheus)
    - Service monitoring dashboard
    - Alerting

### Low Priority

11. **API Versioning**
    - Version API endpoints (v1, v2, etc.)
    - Backward compatibility

12. **Documentation**
    - Code documentation (JSDoc)
    - Architecture decision records (ADRs)

13. **CI/CD**
    - GitHub Actions / GitLab CI
    - Automated testing
    - Automated deployment

14. **Docker Support**
    - Dockerfile for each service
    - Docker Compose for local development
    - Kubernetes manifests

15. **Additional Features**
    - Password reset functionality
    - Email verification
    - Two-factor authentication
    - Audit logging

---

## 🐛 Troubleshooting

### Common Issues

#### 1. **Port Already in Use**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
- Check if another process is using the port
- Change the port in `.env` file
- Kill the process: `lsof -ti:3000 | xargs kill` (macOS/Linux)

#### 2. **Database Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solution:**
- Ensure PostgreSQL is running
- Check database credentials in `.env`
- Verify database exists: `psql -U postgres -l`

#### 3. **RabbitMQ Connection Error**
```
Error: connect ECONNREFUSED 127.0.0.1:5672
```

**Solution:**
- Ensure RabbitMQ is running: `rabbitmqctl status`
- Check RabbitMQ URL in `.env`
- Verify RabbitMQ is accessible

#### 4. **gRPC Proto Not Found**
```
Error: Cannot find module '../../../libs/common/src/proto/auth.proto'
```

**Solution:**
- Ensure proto files exist in `libs/common/src/proto/`
- Check `nest-cli.json` has `"assets": ["**/*.proto"]`
- Rebuild the project: `npm run build`

#### 5. **JWT Validation Fails**
```
Error: Invalid or expired token
```

**Solution:**
- Ensure `JWT_SECRET` is the same across all services
- Check token expiration (default: 180 days)
- Verify token format: `Bearer <token>`

#### 6. **User Not Found in CRM**
```
Error: User not found in CRM system
```

**Solution:**
- Ensure RabbitMQ events are being consumed
- Check UserSync table in CRM database
- Verify user was created in Accounts service
- Check RabbitMQ connection

### Debug Mode

Run services in debug mode:

```bash
npm run start:debug <service-name>
```

This enables:
- Source maps
- Debugger attachment
- Detailed error messages

---

## 📚 Additional Resources

- [NestJS Documentation](https://docs.nestjs.com)
- [gRPC Documentation](https://grpc.io/docs/)
- [TypeORM Documentation](https://typeorm.io/)
- [RabbitMQ Documentation](https://www.rabbitmq.com/documentation.html)
- [JWT Best Practices](https://jwt.io/introduction)

---

## 📝 Notes

- All services use TypeORM with `synchronize: true` for development. **Change this to `false` in production** and use migrations.
- JWT tokens expire after 180 days by default. Adjust in `auth.module.ts` if needed.
- CORS is enabled for all origins in development. **Restrict this in production**.
- Database passwords and JWT secrets should be strong and kept secure.

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 📄 License

This project is private and proprietary.

---

**Last Updated**: 2024
**Version**: 0.0.1

