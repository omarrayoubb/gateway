# Accounts User CRUD & Event-Driven Flow – Test Guide

## User CRUD via API Gateway

Base URL: `http://localhost:3000/accounts` (or your gateway URL).

### 1. Register (Create user)

```bash
curl -s -X POST http://localhost:3000/accounts/register \
  -H "Content-Type: application/json" \
  -d '{
    "workId": "EMP001",
    "name": "Test User",
    "email": "test@example.com",
    "workLocation": "Cairo",
    "role": "employee",
    "password": "secret123",
    "timezone": "Africa/Cairo",
    "birthday": "1990-01-15"
  }'
```

- **Event:** Accounts emits `user.created` to RabbitMQ (People + CRM queues). People creates an Employee (and PeopleUser) from the event.

### 2. Login (get token)

```bash
curl -s -X POST http://localhost:3000/accounts/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secret123"}'
```

Save the `accessToken` from the response for the next steps.

### 3. Get profile (Read)

```bash
TOKEN="<paste accessToken here>"
curl -s http://localhost:3000/accounts/profile \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Update profile (Update)

```bash
TOKEN="<paste accessToken here>"
curl -s -X PATCH http://localhost:3000/accounts/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User Updated",
    "workLocation": "Alexandria",
    "position": "Developer"
  }'
```

- **Event:** Accounts emits `user.updated` to the People queue. People’s `UsersService.updateFromEvent` updates the Employee by `accountId`.

You can send any subset of: `name`, `email`, `workLocation`, `role`, `timezone`, `departmentId`, `birthday`, `status`, `position`, `hireDate`, `managerId`, `hierarchyLevel`, `phone`, `address`, `city`, `country`, `emergencyContactName`, `emergencyContactPhone`, `emergencyContactRelationship`, `baseSalary`.

### 5. Get users list (Read all – if implemented)

```bash
curl -s http://localhost:3000/accounts/users
```

### 6. Delete user (Delete)

```bash
# Use the user's UUID from profile or register response
USER_ID="<user uuid>"
curl -s -X DELETE "http://localhost:3000/accounts/users/$USER_ID"
```

- **Event:** Accounts emits `user.deleted` to the People queue. People’s `UsersService.deleteFromEvent` soft-deletes the Employee (sets status INACTIVE and clears accountId).

---

## Event-driven flow checklist

1. **user.created**
   - Trigger: Register a new user (step 1).
   - Expect: People app creates an Employee (and PeopleUser) for that user. Check People DB or call People’s GetMe/GetUser with the same account id.

2. **user.updated**
   - Trigger: PATCH profile (step 4) with a valid token.
   - Expect: People app updates the corresponding Employee (name, workLocation, position, etc.). Verify in People service or DB.

3. **user.deleted**
   - Trigger: DELETE `/accounts/users/:id` (step 6).
   - Expect: People app marks the Employee as inactive and clears `accountId`.

---

## Running the stack for testing

1. Start infrastructure (Postgres, RabbitMQ) and services, e.g.:
   ```bash
   docker-compose up -d
   # or run accounts, people, api-gateway locally with correct env (DB, RABBITMQ_URL, ACCOUNTS_GRPC_URL)
   ```
2. Ensure **Accounts** microservice is running (gRPC on port 50051 by default).
3. Ensure **API Gateway** is running (HTTP on 3000) and has `ACCOUNTS_GRPC_URL` pointing to Accounts.
4. Ensure **People** app is running and connected to RabbitMQ queue `user_created_people`.

If update profile returns 401, check that the `Authorization: Bearer <token>` header is set and the token is valid.
