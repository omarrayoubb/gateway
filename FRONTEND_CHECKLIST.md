# Frontend Integration Checklist for Stock Movements

## 1. Endpoint URL
**Verify the frontend is calling:**
- `GET /api/v1/supplychain/stock-movements`
- Base URL should be: `http://localhost:3000` (or your API Gateway URL)

## 2. Response Structure
**Current API Response Format:**
```json
{
  "movements": [
    {
      "id": "uuid",
      "productId": "uuid",
      "productName": "string",
      "productSku": "string",
      "batchId": "uuid | ''",
      "batchNumber": "string",
      "warehouseId": "uuid",
      "warehouseName": "string",
      "warehouseCode": "string",
      "movementType": "receive" | "ship" | "transfer" | "adjustment",
      "quantity": "string (number as string)",
      "referenceType": "string | ''",
      "referenceId": "string | ''",
      "movementDate": "ISO string",
      "notes": "string | ''",
      "userId": "string | ''",
      "createdAt": "ISO string",
      "updatedAt": "ISO string"
    }
  ],
  "total": 0,
  "page": 1,
  "limit": 10
}
```

**Important Notes:**
- Response uses **camelCase** (productId, warehouseId, etc.)
- `movements` is an array (not `data`)
- `quantity` is returned as a **string** (not number)
- Empty values are returned as empty strings `''` (not `null`)

## 3. Query Parameters
**Supported Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 1000 if no page specified, 10 if page specified)
- `sort` - Sort field and order (e.g., "movementDate:DESC")
- `product_id` - Filter by product UUID
- `batch_id` - Filter by batch UUID
- `warehouse_id` - Filter by warehouse UUID
- `movement_type` - Filter by type: "receive", "ship", "transfer", "adjustment"
- `movement_date` - Filter by date (ISO string or date format)

## 4. Field Name Mapping
**Frontend should expect camelCase:**
- `productId` (not `product_id`)
- `warehouseId` (not `warehouse_id`)
- `batchId` (not `batch_id`)
- `movementType` (not `movement_type`)
- `movementDate` (not `movement_date`)
- `quantityAvailable` (not `quantity_available`)
- `createdAt` (not `created_at`)
- `updatedAt` (not `updated_at`)

## 5. Data Extraction
**If frontend expects different structure:**
```javascript
// Current response
const response = await fetch('/api/v1/supplychain/stock-movements');
const data = await response.json();
const movements = data.movements; // Array of movements
const total = data.total;
const page = data.page;
const limit = data.limit;

// If frontend expects 'data' instead of 'movements'
// You may need to transform:
const transformed = {
  data: data.movements,
  total: data.total,
  page: data.page,
  limit: data.limit
};
```

## 6. Common Issues to Check

### Issue 1: Empty Array
**Symptom:** `movements: []`
**Possible Causes:**
- No data in database
- Filters are too restrictive
- Relations not loading (check console logs)

### Issue 2: Missing Product/Warehouse Info
**Symptom:** `productName: ''`, `warehouseName: ''`
**Check:**
- Console logs for relation loading warnings
- Ensure products and warehouses exist in database
- Verify foreign key relationships

### Issue 3: Wrong Field Names
**Symptom:** Fields are `undefined`
**Solution:** Use camelCase field names (see section 4)

### Issue 4: Quantity as String
**Symptom:** `quantity: "50"` instead of `50`
**Solution:** Parse to number: `parseFloat(movement.quantity)`

## 7. Testing the Endpoint
**Test with curl or Postman:**
```bash
# Get all stock movements
GET http://localhost:3000/api/v1/supplychain/stock-movements

# With pagination
GET http://localhost:3000/api/v1/supplychain/stock-movements?page=1&limit=10

# With filters
GET http://localhost:3000/api/v1/supplychain/stock-movements?warehouse_id=xxx&movement_type=receive
```

## 8. Console Logs to Check
**API Gateway logs will show:**
- `Stock movements API Gateway response:` - Full response structure
- `Stock movements response from gRPC:` - gRPC response

**Supplychain microservice logs will show:**
- `Sample movement relations:` - Relation loading status
- Warnings if relations aren't loaded

## 9. Expected Behavior
- **Empty state:** If no movements exist, `movements: []` with `total: 0`
- **With data:** Array of movement objects with all relations loaded
- **Pagination:** Default limit is 1000 if no pagination specified (for dashboards)

## 10. If Dashboard Needs Current Stock Levels
**Note:** Stock movements track **changes** in stock, not current levels.

**If dashboard needs current stock:**
- Calculate from movements: Sum quantities by movement type
- Or create a separate endpoint for current stock levels
- Current stock = Sum of "receive" - Sum of "ship" + Sum of "transfer in" - Sum of "transfer out" + Sum of "adjustment"

