# Multi-Tenancy Architecture

## Tenant Resolution
ParkOps utilizes a shared-database multi-tenant architecture. 
Tenants are isolated logically via the `tenantId` field attached to all transactional and analytics records.

### Context Resolution
The system resolves the active tenant primarily via the `X-Tenant-Id` HTTP header. 
The `tenantMiddleware.js` pipeline executes the following checks:
1. Verifies the header exists.
2. Looks up the `Tenant` record.
3. Checks if the `Tenant` status is `ACTIVE` or `TRIAL`.
4. Looks up the `TenantMembership` to verify that `req.user` belongs to this tenant.
5. Injects `req.tenant` and `req.membership` into the request pipeline.

## Authorization & Roles
Role-based access control is handled by `permissionsMiddleware.js`.
Rather than checking `if (user.role === 'ADMIN')` in controllers, the system uses capability mappings.
Example: `router.delete('/:id', requirePermission('parking.manage'), deleteLocation)`

### Default Roles
- **TENANT_OWNER**: Full access to all resources and billing.
- **TENANT_ADMIN**: Full operational access, limited billing access.
- **PARKING_MANAGER**: Can manage locations and slots, but not billing or user management.
- **PARKING_OPERATOR**: Can view slots and bookings (read-only operations).
- **FINANCE_MANAGER**: Access to payments and reports.
- **SECURITY_OPERATOR**: Can scan QRs and verify check-ins.

## Webhooks & API Keys
The API Platform enables tenants to programmatically integrate ParkOps into their own workflows.
- API keys are scoped (e.g., `booking:read`) and hashed securely in the database.
- Webhooks are dispatched via a Redis background queue. The payload is signed using a tenant-specific HMAC secret (`X-ParkOps-Signature`) to verify authenticity.
