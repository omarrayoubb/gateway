# Leave Approval Hierarchy - Implementation Summary

## What Was Implemented

### Backend Changes

#### 1. **LeaveRequestsModule** (`apps/people/src/leave-requests/leave-requests.module.ts`)
- Added import of `ApprovalsModule` to enable access to the approval service
- This allows the leave requests service to create approvals automatically

#### 2. **LeaveRequestsService** (`apps/people/src/leave-requests/leave-requests.service.ts`)
- Injected `ApprovalsService` into the constructor
- Updated `create()` method to:
  - **Require** `employee_id` (returns 400 if missing)
  - Create the leave request as before
  - **Automatically create an Approval** with:
    - `requestType: RequestType.LEAVE`
    - `requestId`: the leave request ID
    - `requesterId`: the employee who requested leave
    - `approvalChain`: empty array (triggers auto-generation from manager hierarchy)
  - The `ApprovalsService.create()` method:
    - Looks up the employee's `managerId`
    - Walks up the manager chain (manager → manager's manager → ...)
    - Sets `currentApproverId` to the first manager in the chain
    - If no manager exists, auto-approves the request

---

## How It Works

### **Scenario: Omar requests leave (his manager is Ziad)**

1. **Frontend calls:**
   ```
   POST /entities/LeaveRequest
   {
     "employee_id": "omar-uuid",
     "leave_type": "annual",
     "start_date": "2024-03-01",
     "end_date": "2024-03-05",
     "number_of_days": 5,
     "reason": "Vacation"
   }
   ```

2. **Backend (LeaveRequestsService):**
   - Creates `LeaveRequest` record (id: `leave-123`, status: `pending`)
   - Calls `ApprovalsService.create()` with:
     - `requestType: "leave"`
     - `requestId: "leave-123"`
     - `requesterId: "omar-uuid"`

3. **Backend (ApprovalsService):**
   - Finds Omar's employee record
   - Reads `managerId` → finds Ziad's employee ID
   - Walks up manager chain: `[ziad-uuid, senior-manager-uuid, ...]`
   - Creates `Approval` record:
     ```json
     {
       "id": "approval-456",
       "request_type": "leave",
       "request_id": "leave-123",
       "requester_id": "omar-uuid",
       "current_approver_id": "ziad-uuid",
       "approval_chain": ["ziad-uuid", "senior-manager-uuid"],
       "current_level": 0,
       "total_levels": 2,
       "status": "submitted"
     }
     ```

4. **Result:**
   - Omar's leave request is created
   - Ziad is automatically assigned as the approver
   - Ziad can see this in his "pending approvals" dashboard

---

## What the Frontend Needs to Do

### **No changes to leave request creation!**

Your existing code works as-is. Just ensure `employee_id` is included:

```javascript
await api.post('/entities/LeaveRequest', {
  employee_id: currentUser.employeeId,  // REQUIRED
  leave_type: 'annual',
  start_date: '2024-03-01',
  end_date: '2024-03-05',
  number_of_days: 5,
  reason: 'Vacation'
});
```

### **New: Fetch and display approval status**

```javascript
// Get approval for a leave request
const approvals = await api.get('/entities/Approval', {
  params: {
    request_type: 'leave',
    request_id: leaveRequestId
  }
});

// Show who needs to approve
const approval = approvals[0];
if (approval.status === 'submitted') {
  // Fetch approver details
  const approver = await api.get(`/entities/Employee/${approval.current_approver_id}`);
  console.log(`Waiting for approval from ${approver.name}`);
}
```

### **New: Manager approval dashboard**

```javascript
// Get pending approvals for current user (manager)
const pending = await api.get('/entities/Approval', {
  params: {
    approver_id: currentUser.employeeId,
    status: 'submitted',
    request_type: 'leave'
  }
});

// Show list of leave requests to approve
```

### **New: Approve/Reject actions**

```javascript
// Approve
await api.post(`/entities/Approval/${approvalId}/approve`, {
  approver_id: currentUser.employeeId,
  comments: 'Approved!'
});

// Reject
await api.post(`/entities/Approval/${approvalId}/reject`, {
  approver_id: currentUser.employeeId,
  reason: 'Insufficient leave balance'
});
```

---

## Key Benefits

1. **Automatic approval routing:** No manual assignment of approvers
2. **Manager hierarchy respected:** Approvals follow the org chart
3. **Multi-level approvals:** Supports manager → senior manager → director chains
4. **Secure:** Frontend can't bypass or manipulate the approval chain
5. **Consistent:** Every leave request gets an approval (unless employee has no manager, then auto-approved)

---

## Edge Cases Handled

| Case | Behavior |
|------|----------|
| Employee has no manager (`managerId` is null) | Approval is **auto-approved** (no chain) |
| Missing `employee_id` in request | Returns **400 Bad Request** |
| Approval creation fails | Leave request is still created; warning logged; can be handled manually |
| Multi-level approval | When first approver approves, moves to next in chain automatically |

---

## Testing

### **Manual Testing Steps:**

1. **Create an employee with a manager:**
   ```sql
   -- Omar (employee) with Ziad (manager)
   UPDATE employees SET manager_id = 'ziad-uuid' WHERE id = 'omar-uuid';
   ```

2. **Create a leave request as Omar:**
   ```
   POST /entities/LeaveRequest
   { "employee_id": "omar-uuid", ... }
   ```

3. **Verify approval was created:**
   ```
   GET /entities/Approval?request_type=leave&request_id=<leave-request-id>
   ```
   - Should return approval with `current_approver_id = "ziad-uuid"`

4. **Check Ziad's pending approvals:**
   ```
   GET /entities/Approval?approver_id=ziad-uuid&status=submitted
   ```
   - Should include Omar's leave request

5. **Approve as Ziad:**
   ```
   POST /entities/Approval/<approval-id>/approve
   { "approver_id": "ziad-uuid", "comments": "Approved" }
   ```

6. **Verify approval status changed:**
   ```
   GET /entities/Approval/<approval-id>
   ```
   - `status` should be `"approved"`

---

## Files Changed

1. `apps/people/src/leave-requests/leave-requests.module.ts`
   - Added `ApprovalsModule` import

2. `apps/people/src/leave-requests/leave-requests.service.ts`
   - Injected `ApprovalsService`
   - Updated `create()` to auto-create approval with manager chain

3. `LEAVE_APPROVAL_HIERARCHY.md` (new)
   - Comprehensive frontend documentation

4. `IMPLEMENTATION_SUMMARY.md` (new)
   - This file

---

## Next Steps (Optional Enhancements)

1. **Notifications:** Send notification to manager when a leave request is assigned to them
2. **Email alerts:** Email manager when they have pending approvals
3. **Escalation:** Auto-escalate if manager doesn't approve within X days
4. **Delegation:** Allow managers to delegate approval to another person
5. **Bulk approval:** Allow managers to approve multiple requests at once
6. **Approval comments:** Store and display comments from each approver in the chain

---

## Deployment

1. **Restart the people microservice** to load the new code
2. **No database migration needed** (uses existing `approvals` table)
3. **Frontend can start using the new approval endpoints** immediately

---

## Support

If issues arise:
- Check people service logs for approval creation warnings
- Verify employees have `manager_id` set correctly in the database
- Ensure `employee_id` is sent when creating leave requests
