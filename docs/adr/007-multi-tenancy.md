# ADR-007: Multi-Tenancy via Application-Layer Scoping

## Status
Accepted

## Context
ParkOps serves multiple parking operator organizations (tenants). Each tenant's data must be completely isolated — users, parking locations, slots, bookings, payments, and analytics.

Two common multi-tenancy models exist:
1. **Database per tenant** — separate MongoDB database or Atlas cluster per tenant
2. **Shared database with tenant scoping** — all tenants share the same collections; every document contains a `tenantId` field

## Decision
Use **shared database with application-layer tenant scoping** via `tenantId` field on all tenant-owned documents.

## Alternatives Considered
| Option | Reason Rejected |
| :--- | :--- |
| Database per tenant | Operationally expensive — N databases × N tenants; no cross-tenant analytics; complex Atlas cluster management |
| Schema per tenant (PostgreSQL) | Not applicable to MongoDB |
| Separate MongoDB Atlas cluster per tenant | Cost-prohibitive at launch; management overhead |

## Reasons
1. **Operational simplicity** — one Atlas cluster, one connection pool, one backup policy
2. **Cost efficiency** — Atlas M10 cluster can serve many tenants without provisioning separate resources
3. **Cross-tenant analytics** — Super Admin can query across tenants with appropriate access
4. **Middleware enforcement** — `resolveTenant()` middleware ensures `tenantId` is always set and verified before any controller logic executes
5. **Index efficiency** — all high-cardinality queries are indexed on `(tenantId, ...)` compound fields

## How Isolation is Enforced
```
Request → X-Tenant-Id header
       → TenantMembership.findOne({ userId, tenantId, status: 'ACTIVE' })
       → 403 if not member
       → All DB queries: { ...filter, tenantId: req.tenant._id }
```

No controller logic can accidentally query across tenants because `tenantId` is always prepended by the middleware and passed explicitly.

## Consequences
- BOLA/IDOR protection is entirely at the application layer (not enforced by database isolation)
- A bug that omits `tenantId` from a query could expose cross-tenant data — mitigated by code review and the `resolveTenant` middleware pattern
- At extreme scale (thousands of tenants, millions of documents), shared-collection indexes may become hot spots — addressable with shard keys if needed
- Database per tenant might be required for tenants with regulatory data residency requirements (GDPR, etc.)
