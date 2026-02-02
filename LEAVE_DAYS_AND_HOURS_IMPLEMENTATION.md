# Leave Days Control & Leave Type "Time in Hours" – Implementation Summary

## 1. Leave type: time in hours (`track_in_hours`)

### What was added

- **LeaveType** can now indicate whether the type is tracked in **hours** (`track_in_hours: true`) or in **days** (default, `track_in_hours: false`).

### Backend changes

| Layer | File | Change |
|-------|------|--------|
| Entity | `apps/people/src/leave-types/entities/leave-type.entity.ts` | Added `trackInHours: boolean` (default `false`), column `track_in_hours`. |
| DTOs | `create-leave-type.dto.ts`, `update-leave-type.dto.ts` | Added optional `trackInHours?: boolean`. |
| Proto | `libs/common/src/proto/people/people.proto` | Added `trackInHours` to CreateLeaveTypeRequest (6), UpdateLeaveTypeRequest (7), LeaveTypeResponse (8). |
| gRPC | `apps/people/src/leave-types/leave-types.grpc.controller.ts` | Create/Update map `trackInHours`; response includes `trackInHours`. |
| Gateway | `apps/api-gateway/src/people/people.service.ts` | `LeaveTypeResponse` has `track_in_hours`; create/update/`mapToLeaveTypeResponse` handle it. |
| Gateway | `apps/api-gateway/src/people/people.controller.ts` | **PUT /entities/LeaveType/:id** added for updating a leave type. |

### API usage

**Create leave type (with hours):**

```http
POST /entities/LeaveType
Content-Type: application/json

{
  "name": "Time Off (Hours)",
  "description": "Tracked in hours",
  "quota": 80,
  "track_in_hours": true,
  "carry_forward": false,
  "requires_approval": true
}
```

**Update leave type:**

```http
PUT /entities/LeaveType/:id
Content-Type: application/json

{
  "track_in_hours": true
}
```

**Response** (GET/POST/PUT) includes:

```json
{
  "id": "...",
  "name": "Time Off (Hours)",
  "description": "...",
  "quota": 80,
  "carry_forward": false,
  "requires_approval": true,
  "track_in_hours": true,
  "created_at": "..."
}
```

### Database

- New column: `leave_types.track_in_hours` (boolean, default `false`).
- If the app uses TypeORM `synchronize: true`, the column is created automatically.
- Otherwise, add a migration that adds `track_in_hours BOOLEAN DEFAULT false` to `leave_types`.

---

## 2. Control leave days: add / minus per employee

### What was added

- **Adjust balance:** add or subtract days (or hours) for an employee’s leave balance in one call.
- **Create/Update balance:** create a balance record or update an existing one by ID.

### Backend changes

| Layer | File | Change |
|-------|------|--------|
| Service | `apps/people/src/leave-balances/leave-balances.service.ts` | `findByEmployeeLeaveTypeYear()`, `adjustBalance(employeeId, leaveType, year, balanceDelta)`. |
| Proto | `libs/common/src/proto/people/people.proto` | `AdjustLeaveBalanceRequest` (employeeId, leaveType, year, balanceDelta); `rpc AdjustLeaveBalance`. |
| gRPC | `apps/people/src/leave-balances/leave-balances.grpc.controller.ts` | `AdjustLeaveBalance` gRPC method. |
| Gateway | `apps/api-gateway/src/people/people.service.ts` | `LeaveBalanceGrpcService` includes `AdjustLeaveBalance`; `createLeaveBalance`, `updateLeaveBalance`, `adjustLeaveBalance`. |
| Gateway | `apps/api-gateway/src/people/people.controller.ts` | **POST /entities/LeaveBalance**, **PUT /entities/LeaveBalance/:id**, **POST /entities/LeaveBalance/adjust**. |

### API usage

**Add days (e.g. +5):**

```http
POST /entities/LeaveBalance/adjust
Content-Type: application/json

{
  "employee_id": "employee-uuid",
  "leave_type": "leave-type-uuid",
  "year": 2024,
  "balance_delta": 5
}
```

**Subtract days (e.g. -2):**

```http
POST /entities/LeaveBalance/adjust
Content-Type: application/json

{
  "employee_id": "employee-uuid",
  "leave_type": "leave-type-uuid",
  "balance_delta": -2
}
```

- **year** is optional; default is current year.
- **balance_delta**: positive = add, negative = subtract. Can be a decimal (e.g. `0.5` for half day).
- If no balance exists for that employee/leave_type/year, one is created with balance 0, then the delta is applied.

**Create balance (initial record):**

```http
POST /entities/LeaveBalance
Content-Type: application/json

{
  "employee_id": "employee-uuid",
  "leave_type": "leave-type-uuid",
  "year": 2024,
  "balance": 21,
  "used": 0,
  "accrued": 21,
  "carried_forward": 0
}
```

**Update balance by ID:**

```http
PUT /entities/LeaveBalance/:id
Content-Type: application/json

{
  "balance": 25,
  "used": 3
}
```

---

## Summary

| Feature | Endpoint / field | Purpose |
|--------|-------------------|--------|
| Leave type in hours | `track_in_hours` on LeaveType | Mark leave type as tracked in hours. |
| Update leave type | **PUT /entities/LeaveType/:id** | Update name, quota, `track_in_hours`, etc. |
| Add/minus days | **POST /entities/LeaveBalance/adjust** | Add or subtract balance for employee/leave type/year. |
| Create balance | **POST /entities/LeaveBalance** | Create a balance record. |
| Update balance | **PUT /entities/LeaveBalance/:id** | Update balance, used, accrued, etc. |
