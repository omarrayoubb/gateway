---
name: Configure TypeORM for CRM Module
overview: Configure TypeORM root connection in the CRM module with PostgreSQL database, using separate database configuration environment variables following the accounts module pattern.
todos: []
---

# Configure TypeORM for CRM Module

## Overview

Add TypeORM root database configuration to the CRM module, following the same pattern as the accounts module but with separate CRM-specific environment variables.

## Files to Modify

### 1. Update CRM Module

- **File**: `apps/crm/src/crm.module.ts`
  - Add `ConfigModule` import and configuration (global, using `.env` file)
  - Add `TypeOrmModule.forRootAsync()` configuration with PostgreSQL settings
  - Use environment variables: `CRM_DB_HOST`, `CRM_DB_PORT`, `CRM_DB_USERNAME`, `CRM_DB_PASSWORD`, `CRM_DB_DATABASE`, `CRM_DB_SYNCHRONIZE`
  - Register all entities: `Lead`, `Profile`, `User`
  - Import `ConfigModule` for dependency injection

### 2. Create Environment Variables Example

- **File**: `.env.example` (create if doesn't exist, or add to existing)
  - Add CRM database configuration variables:
    ```
    CRM_DB_HOST=localhost
    CRM_DB_PORT=5432
    CRM_DB_USERNAME=crm_user
    CRM_DB_PASSWORD=crm_password
    CRM_DB_DATABASE=crm_db
    CRM_DB_SYNCHRONIZE=true
    ```


## Implementation Details

- **Database Type**: PostgreSQL
- **Configuration Pattern**: Match `apps/accounts/src/accounts.module.ts` pattern
- **Entities to Register**: `Lead`, `Profile`, `User` (import from their respective entity files)
- **Synchronize**: Controlled via `CRM_DB_SYNCHRONIZE` environment variable (should be `'true'` string)
- **Module Structure**: Add `ConfigModule` and `TypeOrmModule.forRootAsync()` to `CrmModule` imports array

## Code Structure

The `CrmModule` should have:

- `ConfigModule.forRoot()` as global configuration
- `TypeOrmModule.forRootAsync()` with factory function using `ConfigService`
- All entity imports for registration
- Existing module imports (`LeadsModule`, `ProfileModule`) remain unchanged