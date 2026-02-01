# Manager ID Support - Implementation Complete

## Summary

The backend now **fully supports** `manager_id` (or `managerId`) for creating and updating employees. This field is used by the leave approval system to automatically assign the employee's manager as the approver.

**Root cause of "manager_id not saving":** The gRPC **proto** did not define `managerId` on `CreatePersonRequest`, `UpdatePersonRequest`, or `PersonResponse`. The gateway was sending it, but the protocol stripped unknown fields, so the people microservice never received it. This is now fixed.

---

## What Was Implemented

### Backend Changes

1. **gRPC Proto** (`libs/common/src/proto/people/people.proto`) **[required for manager_id to be sent]**
   - **CreatePersonRequest**: Added `string managerId = 18;`
   - **UpdatePersonRequest**: Added `string managerId = 19;`
   - **PersonResponse**: Added `string managerId = 21;`
   - Without these, the gateway’s `managerId` was dropped by gRPC and never reached the microservice.

2. **DTO** (`apps/people/src/people/dto/create-person.dto.ts`)
   - Added `managerId?: string` field with UUID validation

3. **People gRPC Controller** (`apps/people/src/people/people.grpc.controller.ts`)
   - **CreatePerson**: Maps `manager_id` or `managerId` from request to DTO
   - **UpdatePerson**: Maps `manager_id` or `managerId` from request to DTO
   - **Response**: Includes `managerId` in the employee response

4. **People Service** (`apps/people/src/people/people.service.ts`)
   - **update()**: Only applies fields that are not `undefined`, so partial updates (e.g. only `manager_id` and `manager_email`) do not overwrite other fields with `undefined`.

5. **API Gateway** (`apps/api-gateway/src/people/people.service.ts`)
   - **createEmployee**: Accepts and forwards `manager_id` or `managerId`
   - **updateEmployee**: Accepts and forwards `manager_id` or `managerId`
   - **EmployeeResponse**: Includes `manager_id` in the response
   - **Mapping**: Converts between snake_case (`manager_id`) and camelCase (`managerId`)

---

## Frontend Usage

### Creating an Employee with Manager

```javascript
// POST /entities/Employee
const newEmployee = await api.post('/entities/Employee', {
  name: 'Omar Hassan',
  email: 'omar@company.com',
  position: 'Software Engineer',
  manager_id: 'ziad-uuid',  // ✅ Ziad is Omar's manager
  // ... other fields
});

// Response includes manager_id
console.log(newEmployee.manager_id); // 'ziad-uuid'
```

### Updating an Employee's Manager

```javascript
// PUT /entities/Employee/:id
const updatedEmployee = await api.put(`/entities/Employee/${omarId}`, {
  manager_id: 'new-manager-uuid'  // ✅ Change Omar's manager
});

// Response includes updated manager_id
console.log(updatedEmployee.manager_id); // 'new-manager-uuid'
```

### Both Formats Supported

The backend accepts **both** `manager_id` (snake_case) and `managerId` (camelCase):

```javascript
// These are equivalent:
{ manager_id: 'ziad-uuid' }
{ managerId: 'ziad-uuid' }

// Response always uses snake_case: manager_id
```

---

## How It Works with Leave Approvals

When Omar (with `manager_id` = Ziad's employee ID) submits a leave request:

1. **Frontend** calls:
   ```javascript
   POST /entities/LeaveRequest
   {
     employee_id: 'omar-uuid',
     leave_type: 'annual',
     start_date: '2024-03-01',
     end_date: '2024-03-05',
     number_of_days: 5,
     reason: 'Vacation'
   }
   ```

2. **Backend**:
   - Creates the `LeaveRequest`
   - Looks up Omar's employee record → finds `manager_id` = `ziad-uuid`
   - Creates an `Approval` with:
     - `request_type`: `"leave"`
     - `request_id`: leave request ID
     - `requester_id`: `omar-uuid`
     - `current_approver_id`: `ziad-uuid` (Omar's manager)
     - `approval_chain`: `[ziad-uuid, senior-manager-uuid, ...]`

3. **Result**: Ziad automatically sees Omar's leave request in his pending approvals dashboard.

---

## API Endpoints

### Create Employee
**POST** `/entities/Employee`

**Request:**
```json
{
  "name": "Omar Hassan",
  "email": "omar@company.com",
  "position": "Software Engineer",
  "department": "Engineering",
  "manager_id": "ziad-uuid",
  "status": "active"
}
```

**Response:**
```json
{
  "id": "omar-uuid",
  "name": "Omar Hassan",
  "email": "omar@company.com",
  "position": "Software Engineer",
  "department": "Engineering",
  "manager_id": "ziad-uuid",
  "manager_email": "ziad@company.com",
  "status": "active",
  "created_at": "2024-02-01T10:00:00Z"
}
```

### Update Employee
**PUT** `/entities/Employee/:id`

**Request:**
```json
{
  "manager_id": "new-manager-uuid"
}
```

**Response:** Updated employee with new `manager_id`

### Get Employee
**GET** `/entities/Employee/:id`

**Response:**
```json
{
  "id": "omar-uuid",
  "name": "Omar Hassan",
  "email": "omar@company.com",
  "manager_id": "ziad-uuid",
  "manager_email": "ziad@company.com",
  ...
}
```

---

## Field Mapping Reference

| Frontend (API) | Backend (gRPC) | Database Column |
|----------------|----------------|-----------------|
| `manager_id` (preferred) | `managerId` | `manager_id` |
| `managerId` (also works) | `managerId` | `manager_id` |

**Response always uses:** `manager_id` (snake_case)

---

## Example: Setting Up Manager Hierarchy

```javascript
// 1. Create senior manager (no manager)
const seniorManager = await api.post('/entities/Employee', {
  name: 'Senior Manager',
  email: 'senior@company.com',
  position: 'Senior Manager',
  // No manager_id - this is the top of the chain
});

// 2. Create manager (reports to senior manager)
const ziad = await api.post('/entities/Employee', {
  name: 'Ziad',
  email: 'ziad@company.com',
  position: 'Engineering Manager',
  manager_id: seniorManager.id  // Ziad reports to Senior Manager
});

// 3. Create employee (reports to manager)
const omar = await api.post('/entities/Employee', {
  name: 'Omar',
  email: 'omar@company.com',
  position: 'Software Engineer',
  manager_id: ziad.id  // Omar reports to Ziad
});

// Now when Omar requests leave:
// - Approval chain: [ziad.id, seniorManager.id]
// - Current approver: ziad.id (first in chain)
// - When Ziad approves, moves to seniorManager.id
// - When Senior Manager approves, status = "approved"
```

---

## Validation

- `manager_id` must be a valid UUID
- `manager_id` must reference an existing employee
- `manager_id` can be `null` or omitted (employee has no manager)
- Circular manager relationships are **not** prevented (be careful!)

---

## Testing

### Test 1: Create employee with manager
```bash
curl -X POST http://localhost:3000/entities/Employee \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Omar Hassan",
    "email": "omar@company.com",
    "position": "Software Engineer",
    "manager_id": "ziad-uuid"
  }'
```

### Test 2: Update employee's manager
```bash
curl -X PUT http://localhost:3000/entities/Employee/omar-uuid \
  -H "Content-Type: application/json" \
  -d '{
    "manager_id": "new-manager-uuid"
  }'
```

### Test 3: Verify leave approval uses manager
```bash
# 1. Create leave request as Omar
curl -X POST http://localhost:3000/entities/LeaveRequest \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "omar-uuid",
    "leave_type": "annual",
    "start_date": "2024-03-01",
    "end_date": "2024-03-05",
    "number_of_days": 5,
    "reason": "Vacation"
  }'

# 2. Check approval was created with Ziad as approver
curl http://localhost:3000/entities/Approval?request_type=leave&request_id=<leave-request-id>

# Response should show:
# {
#   "current_approver_id": "ziad-uuid",
#   "status": "submitted",
#   ...
# }
```

---

## Troubleshooting

### Manager not assigned to approval
- **Check**: Does the employee have `manager_id` set?
  ```javascript
  const employee = await api.get(`/entities/Employee/${employeeId}`);
  console.log(employee.manager_id); // Should be a UUID, not empty
  ```
- **Fix**: Update the employee with their manager:
  ```javascript
  await api.put(`/entities/Employee/${employeeId}`, {
    manager_id: 'manager-uuid'
  });
  ```

### Approval auto-approved (no manager chain)
- **Cause**: Employee has no `manager_id` (null or empty)
- **Expected behavior**: If no manager, approval is auto-approved
- **Fix**: Set the employee's `manager_id` if they should have a manager

### Manager ID not showing in response
- **Check**: Rebuild and restart the backend services
- **Verify**: The `manager_id` field is in the EmployeeResponse interface

---

## Summary

✅ **Backend fully supports `manager_id`**  
✅ **Accepts both `manager_id` and `managerId` in requests**  
✅ **Returns `manager_id` in responses**  
✅ **Leave approval system uses `manager_id` to assign approvers**  
✅ **Multi-level manager chains work automatically**  

The frontend can now create and update employees with `manager_id`, and the leave approval system will automatically route approvals to the correct managers!
