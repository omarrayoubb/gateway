# Leave Approval - Frontend Quick Reference

## 🚀 Quick Start

### 1. Create Leave Request (Unchanged)
```javascript
const response = await api.post('/entities/LeaveRequest', {
  employee_id: currentUser.employeeId,  // ⚠️ REQUIRED
  leave_type: 'annual',
  start_date: '2024-03-01',
  end_date: '2024-03-05',
  number_of_days: 5,
  reason: 'Vacation'
});
// ✅ Approval is automatically created with manager as approver
```

---

## 📋 Common API Calls

### Get Approval Status for a Leave Request
```javascript
const approvals = await api.get('/entities/Approval', {
  params: {
    request_type: 'leave',
    request_id: leaveRequestId
  }
});

const approval = approvals[0];
// approval.current_approver_id = manager's employee ID
// approval.status = "submitted" | "approved" | "rejected"
```

### Get Pending Approvals (Manager View)
```javascript
const pending = await api.get('/entities/Approval', {
  params: {
    approver_id: currentUser.employeeId,
    status: 'submitted',
    request_type: 'leave'
  }
});
```

### Approve a Request
```javascript
await api.post(`/entities/Approval/${approvalId}/approve`, {
  approver_id: currentUser.employeeId,
  comments: 'Approved - enjoy your time off!'
});
```

### Reject a Request
```javascript
await api.post(`/entities/Approval/${approvalId}/reject`, {
  approver_id: currentUser.employeeId,
  reason: 'Team is understaffed during this period'
});
```

---

## 🎨 UI Components to Build

### 1. Employee: Leave Request Status Badge
```javascript
function LeaveStatusBadge({ approval }) {
  if (!approval) return <Badge color="gray">No Approval</Badge>;
  
  switch (approval.status) {
    case 'submitted':
      return <Badge color="yellow">⏳ Pending Approval</Badge>;
    case 'approved':
      return <Badge color="green">✅ Approved</Badge>;
    case 'rejected':
      return <Badge color="red">❌ Rejected</Badge>;
    default:
      return <Badge color="gray">{approval.status}</Badge>;
  }
}
```

### 2. Employee: Show Who Needs to Approve
```javascript
async function ApprovalStatus({ leaveRequestId }) {
  const approvals = await api.get('/entities/Approval', {
    params: { request_type: 'leave', request_id: leaveRequestId }
  });
  
  const approval = approvals[0];
  if (!approval) return <p>No approval required</p>;
  
  if (approval.status === 'submitted') {
    const approver = await api.get(`/entities/Employee/${approval.current_approver_id}`);
    return (
      <div>
        <p>Waiting for approval from:</p>
        <p><strong>{approver.name}</strong> ({approver.position})</p>
      </div>
    );
  }
  
  return <p>Status: {approval.status}</p>;
}
```

### 3. Manager: Pending Approvals List
```javascript
async function PendingApprovals() {
  const pending = await api.get('/entities/Approval', {
    params: {
      approver_id: currentUser.employeeId,
      status: 'submitted',
      request_type: 'leave'
    }
  });
  
  return (
    <div>
      <h2>Pending Leave Approvals ({pending.length})</h2>
      {pending.map(approval => (
        <ApprovalCard key={approval.id} approval={approval} />
      ))}
    </div>
  );
}

async function ApprovalCard({ approval }) {
  const leaveRequest = await api.get(`/entities/LeaveRequest/${approval.request_id}`);
  const employee = await api.get(`/entities/Employee/${approval.requester_id}`);
  
  return (
    <Card>
      <h3>{employee.name}</h3>
      <p>{leaveRequest.number_of_days} days: {leaveRequest.start_date} to {leaveRequest.end_date}</p>
      <p>Reason: {leaveRequest.reason}</p>
      <Button onClick={() => handleApprove(approval.id)}>✅ Approve</Button>
      <Button onClick={() => handleReject(approval.id)}>❌ Reject</Button>
    </Card>
  );
}
```

---

## 🔄 Complete Flow Example

```javascript
// 1. Employee creates leave request
const leaveRequest = await api.post('/entities/LeaveRequest', {
  employee_id: 'omar-uuid',
  leave_type: 'annual',
  start_date: '2024-03-01',
  end_date: '2024-03-05',
  number_of_days: 5,
  reason: 'Vacation'
});

// 2. Fetch approval status
const approvals = await api.get('/entities/Approval', {
  params: { request_type: 'leave', request_id: leaveRequest.id }
});

const approval = approvals[0];
// approval.current_approver_id = "ziad-uuid" (Omar's manager)
// approval.status = "submitted"

// 3. Manager (Ziad) sees pending approval
const pending = await api.get('/entities/Approval', {
  params: { approver_id: 'ziad-uuid', status: 'submitted' }
});
// pending includes Omar's leave request

// 4. Manager approves
await api.post(`/entities/Approval/${approval.id}/approve`, {
  approver_id: 'ziad-uuid',
  comments: 'Approved!'
});

// 5. Employee sees updated status
const updated = await api.get('/entities/Approval', {
  params: { request_type: 'leave', request_id: leaveRequest.id }
});
// updated[0].status = "approved"
```

---

## ⚠️ Error Handling

### Missing employee_id
```javascript
try {
  await api.post('/entities/LeaveRequest', {
    // Missing employee_id
    leave_type: 'annual',
    start_date: '2024-03-01',
    end_date: '2024-03-05'
  });
} catch (error) {
  // 400 Bad Request: "employee_id is required to create a leave request with approval"
  showError('Please ensure you are logged in as an employee');
}
```

### No approval found
```javascript
const approvals = await api.get('/entities/Approval', {
  params: { request_type: 'leave', request_id: leaveRequestId }
});

if (approvals.length === 0) {
  // Employee has no manager, or approval creation failed
  showWarning('Approval pending - contact HR');
}
```

---

## 📊 Approval Object Structure

```typescript
interface Approval {
  id: string;
  request_type: 'leave' | 'attendance_regularization' | 'wfh' | ...;
  request_id: string;              // Leave request ID
  requester_id: string;            // Employee who requested
  current_approver_id: string;     // Who needs to approve now
  approval_chain: string[];        // [manager, senior-manager, ...]
  current_level: number;           // 0, 1, 2, ... (which level in chain)
  total_levels: number;            // How many approvers total
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | ...;
  comments: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  approved_at: string | null;
  rejected_at: string | null;
}
```

---

## 🎯 Key Points

1. ✅ **Always send `employee_id`** when creating leave requests
2. ✅ **Approval is automatic** - don't try to create it manually
3. ✅ **Manager is auto-assigned** from employee's `manager_id`
4. ✅ **Multi-level approvals** work automatically (manager → senior manager → ...)
5. ✅ **No manager = auto-approved** (total_levels = 0)

---

## 📞 Need Help?

- Full documentation: `LEAVE_APPROVAL_HIERARCHY.md`
- Implementation details: `IMPLEMENTATION_SUMMARY.md`
- Backend team: Check people service logs for approval warnings
