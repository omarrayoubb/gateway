# gRPC Integration Guide

## Architecture Overview

This monorepo now includes:
- **API Gateway** (HTTP REST) - Port 3000
- **Accounts Microservice** (gRPC) - Port 50051
- **CRM Service** (HTTP REST + gRPC) - HTTP: 3002, gRPC: 50052
- **Desk Service** (HTTP REST) - Port 3001

## Communication Flow

```
Client → API Gateway (3000)
         ├─ /api/accounts/* → gRPC → Accounts (50051)
         ├─ /api/crm/* → HTTP → CRM (3002)
         └─ /api/desk/* → HTTP → Desk (3001)

Desk (3001) → gRPC → CRM (50052) [for contacts/accounts]
```

## Running the Services

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment Variables

Create `.env` file in root:
```env
# Accounts Database
ACCOUNTS_DB_HOST=localhost
ACCOUNTS_DB_PORT=5432
ACCOUNTS_DB_USERNAME=postgres
ACCOUNTS_DB_PASSWORD=your_password
ACCOUNTS_DB_DATABASE=accounts_db
ACCOUNTS_DB_SYNCHRONIZE=true

# Desk Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_NAME=desk_backend

# CRM Database (for CRM service)
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=crm_db

# Ports
PORT=3000  # API Gateway
```

### 3. Run Services

**Terminal 1 - Accounts Microservice:**
```bash
nest start accounts --watch
```

**Terminal 2 - CRM Service:**
```bash
nest start crm --watch
```

**Terminal 3 - Desk Service:**
```bash
nest start desk --watch
```

**Terminal 4 - API Gateway:**
```bash
nest start api-gateway --watch
```

## gRPC Proto Definitions

Proto files are located in `libs/common/src/proto/`:
- `auth.proto` - Accounts service
- `crm.proto` - CRM Contacts and Accounts services

## How Desk Communicates with CRM

Desk uses the `CrmClientService` to fetch contacts and accounts from CRM via gRPC:

```typescript
// In any Desk service
constructor(private readonly crmClient: CrmClientService) {}

async getAccountName(accountId: string) {
  const account = await this.crmClient.getAccount(accountId);
  return account?.name || '';
}
```

## Next Steps

1. Fix import paths in CRM (replace `'src/'` with relative paths)
2. Update Desk services to use CrmClientService for account/contact lookups
3. Add API Gateway routing for Desk and CRM endpoints
4. Test the integration

## Known Issues

- Import paths in CRM need to be fixed (change `'src/'` to relative paths)
- Desk services need to be updated to use CrmClientService
- API Gateway routing needs to be configured

