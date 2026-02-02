# Attendance Summary - Upsert Fix

## Problem

The system was throwing an error when trying to create an attendance summary that already exists:

```
Error: 6 ALREADY_EXISTS: Attendance summary already exists for employee da45b1af-6e03-4eaf-a6a9-19a92fcd3790 for month 2026-02
```

## Solution

Changed the `CreateAttendanceSummary` endpoint to use **upsert logic** (create or update):

- If a summary **doesn't exist** for the employee and month → **creates** a new one
- If a summary **already exists** for the employee and month → **updates** the existing one

## What Changed

### Backend Changes

1. **`attendance-summary.service.ts`** - Added `upsert()` method:
   ```typescript
   async upsert(createSummaryDto: CreateAttendanceSummaryDto): Promise<AttendanceSummary> {
     const existingSummary = await this.summaryRepository.findOne({
       where: {
         employeeId: createSummaryDto.employeeId,
         month: createSummaryDto.month,
       },
     });

     if (existingSummary) {
       // Update existing
       Object.assign(existingSummary, createSummaryDto);
       return await this.summaryRepository.save(existingSummary);
     }

     // Create new
     const summary = this.summaryRepository.create(createSummaryDto);
     return await this.summaryRepository.save(summary);
   }
   ```

2. **`attendance-summary.grpc.controller.ts`** - Changed `CreateAttendanceSummary` to use `upsert()`:
   ```typescript
   // Before: await this.summaryService.create(createDto);
   // After:  await this.summaryService.upsert(createDto);
   ```

## Frontend Usage

The frontend can now call the same endpoint multiple times without errors:

```javascript
// First call - creates new summary
POST /entities/AttendanceSummary
{
  "employee_id": "da45b1af-6e03-4eaf-a6a9-19a92fcd3790",
  "month": "2026-02",
  "days_present": 20,
  "days_absent": 2,
  "total_hours": 160,
  "status": "pending"
}
// ✅ Success - creates new summary

// Second call - updates existing summary
POST /entities/AttendanceSummary
{
  "employee_id": "da45b1af-6e03-4eaf-a6a9-19a92fcd3790",
  "month": "2026-02",
  "days_present": 21,  // Updated
  "days_absent": 1,    // Updated
  "total_hours": 168,  // Updated
  "status": "approved" // Updated
}
// ✅ Success - updates existing summary (no error!)
```

## Benefits

1. **No more duplicate errors** - Can safely call the endpoint multiple times
2. **Simpler frontend logic** - No need to check if summary exists before creating
3. **Idempotent** - Same request can be repeated safely
4. **Backward compatible** - Existing frontend code continues to work

## API Behavior

### POST /entities/AttendanceSummary

**Request:**
```json
{
  "employee_id": "employee-uuid",
  "month": "2026-02",
  "days_present": 20,
  "days_absent": 2,
  "total_hours": 160,
  "late_arrivals_count": 3,
  "overtime_hours": 5,
  "total_deductions": 100,
  "status": "pending"
}
```

**Behavior:**
- If summary for `employee_id` + `month` **doesn't exist** → Creates new
- If summary for `employee_id` + `month` **already exists** → Updates existing

**Response:**
```json
{
  "id": "summary-uuid",
  "employee_id": "employee-uuid",
  "month": "2026-02",
  "days_present": 20,
  "days_absent": 2,
  "total_hours": 160,
  "late_arrivals_count": 3,
  "overtime_hours": 5,
  "total_deductions": 100,
  "status": "pending",
  "created_at": "2026-02-01T10:00:00Z"
}
```

## Testing

### Test 1: Create new summary
```bash
curl -X POST http://localhost:3000/entities/AttendanceSummary \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "da45b1af-6e03-4eaf-a6a9-19a92fcd3790",
    "month": "2026-03",
    "days_present": 22,
    "days_absent": 0,
    "total_hours": 176,
    "status": "pending"
  }'
```

### Test 2: Update existing summary (same employee + month)
```bash
curl -X POST http://localhost:3000/entities/AttendanceSummary \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": "da45b1af-6e03-4eaf-a6a9-19a92fcd3790",
    "month": "2026-03",
    "days_present": 21,
    "days_absent": 1,
    "total_hours": 168,
    "status": "approved"
  }'
```

Both calls should succeed without errors!

## Migration Notes

- **No database migration needed** - Only logic changes
- **No frontend changes required** - Existing code works as-is
- **Backward compatible** - All existing functionality preserved

## Summary

✅ **Fixed**: `ALREADY_EXISTS` error when creating duplicate attendance summaries  
✅ **Added**: `upsert()` method to handle create or update  
✅ **Updated**: `CreateAttendanceSummary` endpoint to use upsert logic  
✅ **Result**: Frontend can safely call the endpoint multiple times  

The error you encountered will no longer occur!
