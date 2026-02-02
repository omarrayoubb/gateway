# Leave Request Approval Hierarchy - Frontend Guide

## Overview

The leave request approval system now **automatically assigns approvers based on the manager hierarchy**. When an employee (e.g., Omar) submits a leave request, their direct manager (e.g., Ziad) is automatically assigned as the approver.

---

## How It Works (Backend)

### 1. **Employee submits leave request**
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

### 2. **Backend automatically:**
- Creates the `LeaveRequest` record
- Looks up Omar's manager from `Employee.managerId` (finds Ziad)
- Creates an `Approval` record with:
  - `requestType`: `"leave"`
  - `requestId`: the leave request ID
  - `requesterId`: Omar's employee ID
  - `currentApproverId`: Ziad's employee ID (Omar's manager)
  - `approvalChain`: `[ziad-uuid, ziad-manager-uuid, ...]` (full manager chain)
  - `status`: `"submitted"` (waiting for approval)

### 3. **Manager hierarchy chain**
If the organization has multiple approval levels (e.g., manager → senior manager → director), the approval chain includes all levels. When Ziad approves, it moves to the next person in the chain automatically.

---

## Frontend Implementation Guide

### **Step 1: Create Leave Request (No Changes Required)**

Your existing leave request creation flow works as-is. Just ensure you send the `employee_id`:

```javascript
// Example: Create leave request
const response = await api.post('/entities/LeaveRequest', {
  employee_id: currentUser.employeeId, // REQUIRED
  leave_type: 'annual',
  start_date: '2024-03-01',
  end_date: '2024-03-05',
  number_of_days: 5,
  reason: 'Family vacation'
});

// Response includes the leave request
const leaveRequest = response.data;
// { id: "leave-123", employee_id: "omar-uuid", status: "pending", ... }
```

**Important:** The backend now **requires** `employee_id` to create the approval. If missing, you'll get a 400 error.

---

### **Step 2: Fetch Approvals for a Leave Request**

To show who needs to approve (or has approved) a leave request:

```javascript
// Get approvals for a specific leave request
const approvals = await api.get('/entities/Approval', {
  params: {
    request_type: 'leave',
    request_id: leaveRequest.id
  }
});

// Response:
// [
//   {
//     id: "approval-456",
//     request_type: "leave",
//     request_id: "leave-123",
//     requester_id: "omar-uuid",
//     current_approver_id: "ziad-uuid",  // Omar's manager
//     approval_chain: ["ziad-uuid", "senior-manager-uuid"],
//     current_level: 0,
//     total_levels: 2,
//     status: "submitted",  // or "approved", "rejected"
//     created_at: "2024-02-01T10:00:00Z"
//   }
// ]
```

---

### **Step 3: Display Approval Status to Employee**

Show the employee who needs to approve their request:

```javascript
// Example: Get current approver details
const approval = approvals[0];

if (approval.status === 'submitted' || approval.status === 'pending') {
  // Fetch the approver's details
  const approver = await api.get(`/entities/Employee/${approval.current_approver_id}`);
  
  // Display: "Waiting for approval from Ziad (Manager)"
  console.log(`Waiting for approval from ${approver.name} (${approver.position})`);
} else if (approval.status === 'approved') {
  console.log('Your leave request has been approved!');
} else if (approval.status === 'rejected') {
  console.log(`Your leave request was rejected. Reason: ${approval.rejection_reason}`);
}
```

---

### **Step 4: Manager Approval View**

For managers to see leave requests waiting for their approval:

```javascript
// Get all approvals where current user is the approver
const pendingApprovals = await api.get('/entities/Approval', {
  params: {
    approver_id: currentUser.employeeId,  // Ziad's employee ID
    status: 'submitted',
    request_type: 'leave'
  }
});

// For each approval, fetch the leave request details
for (const approval of pendingApprovals) {
  const leaveRequest = await api.get(`/entities/LeaveRequest/${approval.request_id}`);
  const employee = await api.get(`/entities/Employee/${approval.requester_id}`);
  
  // Display:
  // "Omar requested 5 days leave (Mar 1-5, 2024)"
  // [Approve] [Reject] buttons
}
```

---

### **Step 5: Approve or Reject**

When a manager approves or rejects:

```javascript
// Approve
await api.post(`/entities/Approval/${approval.id}/approve`, {
  approver_id: currentUser.employeeId,  // Ziad's employee ID
  comments: 'Approved - enjoy your vacation!'
});

// Reject
await api.post(`/entities/Approval/${approval.id}/reject`, {
  approver_id: currentUser.employeeId,
  reason: 'Insufficient leave balance'
});
```

**What happens:**
- **Approve:** If there are more approvers in the chain (e.g., senior manager), `current_approver_id` moves to the next person. Otherwise, `status` becomes `"approved"`.
- **Reject:** The approval `status` becomes `"rejected"` and the chain stops.

---

## API Endpoints Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/entities/LeaveRequest` | POST | Create leave request (auto-creates approval) |
| `/entities/LeaveRequest/filter?employee_id=...` | GET | Get employee's leave requests |
| `/entities/Approval?request_type=leave&request_id=...` | GET | Get approval for a leave request |
| `/entities/Approval?approver_id=...&status=submitted` | GET | Get pending approvals for a manager |
| `/entities/Approval/:id/approve` | POST | Approve a request |
| `/entities/Approval/:id/reject` | POST | Reject a request |
| `/entities/Employee/:id` | GET | Get employee/manager details |

---

## UI/UX Recommendations

### **For Employees (Leave Request Form)**

1. **After submitting:**
   - Show success message: "Your leave request has been submitted and sent to [Manager Name] for approval."
   - Fetch and display the approval status immediately.

2. **Leave request list:**
   - Show approval status badge:
     - 🟡 "Pending approval from Ziad"
     - 🟢 "Approved"
     - 🔴 "Rejected"

3. **Leave request details:**
   - Show approval timeline:
     ```
     Submitted by Omar on Feb 1, 2024
     → Waiting for Ziad (Manager) ⏳
     → Senior Manager (pending)
     ```

### **For Managers (Approval Dashboard)**

1. **Pending approvals tab:**
   - List all leave requests where `current_approver_id` = current user
   - Show employee name, dates, reason, number of days
   - [Approve] and [Reject] buttons

2. **Approval history:**
   - Show all approvals the manager has processed
   - Include approval/rejection date and comments

3. **Notifications:**
   - When a new leave request is assigned to the manager (you can poll `/entities/Approval?approver_id=...&status=submitted` or use the notification system)

---

## Example: Complete Flow

### **Scenario:** Omar requests leave, Ziad (his manager) approves

```javascript
// 1. Omar submits leave request
const leaveRequest = await api.post('/entities/LeaveRequest', {
  employee_id: 'omar-uuid',
  leave_type: 'annual',
  start_date: '2024-03-01',
  end_date: '2024-03-05',
  number_of_days: 5,
  reason: 'Vacation'
});
// Backend creates LeaveRequest + Approval (currentApproverId = ziad-uuid)

// 2. Omar checks status
const approvals = await api.get('/entities/Approval', {
  params: { request_type: 'leave', request_id: leaveRequest.id }
});
// approvals[0].current_approver_id = "ziad-uuid"
// approvals[0].status = "submitted"

// 3. Ziad sees pending approval
const pending = await api.get('/entities/Approval', {
  params: { approver_id: 'ziad-uuid', status: 'submitted' }
});
// pending includes Omar's leave request

// 4. Ziad approves
await api.post(`/entities/Approval/${approvals[0].id}/approve`, {
  approver_id: 'ziad-uuid',
  comments: 'Approved!'
});
// Backend updates: status = "approved" (if no more approvers in chain)

// 5. Omar sees updated status
const updatedApprovals = await api.get('/entities/Approval', {
  params: { request_type: 'leave', request_id: leaveRequest.id }
});
// updatedApprovals[0].status = "approved"
```

---

## Error Handling

### **1. Employee has no manager**

If an employee has no `managerId` set:
- The approval is **auto-approved** (no approval chain)
- `approval.status` = `"approved"` immediately
- `approval.total_levels` = `0`

**Frontend:** Show "Your leave request was automatically approved (no manager assigned)."

### **2. Missing employee_id**

If you don't send `employee_id` when creating a leave request:
- Backend returns **400 Bad Request**: `"employee_id is required to create a leave request with approval"`

**Frontend:** Ensure `employee_id` is always included in the request.

### **3. Approval creation fails**

If the approval creation fails (e.g., database error):
- The leave request is still created
- A warning is logged on the backend
- The leave request will have no approval (can be handled manually by HR)

**Frontend:** If you fetch approvals and get an empty array, show "Approval pending - contact HR."

---

## Testing Checklist

- [ ] Create leave request with `employee_id` → approval is created
- [ ] Create leave request without `employee_id` → 400 error
- [ ] Employee with manager → manager is `current_approver_id`
- [ ] Employee without manager → approval is auto-approved
- [ ] Manager sees pending approvals in their dashboard
- [ ] Manager approves → approval status changes to "approved"
- [ ] Manager rejects → approval status changes to "rejected"
- [ ] Multi-level approval (manager → senior manager) → approval moves to next level

---

## Questions?

If you encounter any issues or need clarification:
1. Check the backend logs for approval creation warnings
2. Verify the employee has a `manager_id` set in the database
3. Ensure you're using the correct `employee_id` (not user ID)

**Key takeaway:** The frontend doesn't need to manage approvals manually. Just create the leave request with `employee_id`, and the backend handles the rest!
