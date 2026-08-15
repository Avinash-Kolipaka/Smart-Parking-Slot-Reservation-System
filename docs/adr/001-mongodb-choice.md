# ADR-001: MongoDB as Primary Database

## Status
Accepted

## Context
ParkOps needs a database that can store:
- Parking locations with variable metadata (images, amenities, geolocation)
- Bookings with embedded status history
- User profiles with embedded vehicle arrays
- Analytics aggregations across many dimensions

The data model varies between different parking operators. Some have multi-floor facilities, some are open lots. Forcing a rigid relational schema would either mean many NULLable columns or complex table hierarchies.

## Decision
Use **MongoDB** (via MongoDB Atlas) as the primary datastore.

## Alternatives Considered
| Option | Reason Rejected |
| :--- | :--- |
| PostgreSQL | Rigid schema makes parking metadata difficult. Geospatial requires PostGIS extension. More complex JOIN-heavy queries for this use case. |
| MySQL | Same as PostgreSQL. |
| DynamoDB | Good at scale, but complex query model. Secondary index design becomes difficult for multi-dimensional filtering (city + vehicleType + priceRange). |

## Reasons
1. **Document model** naturally represents a parking location with embedded amenities, images array, and pricing
2. **Embedded sub-documents** (vehicles in user profile) avoid JOINs for the common case
3. **Native 2dsphere geolocation index** — `$near` operator for proximity search without PostGIS
4. **Mongoose ODM** provides schema validation, middleware hooks, and type coercion
5. **Atlas managed service** — automated backups, point-in-time recovery, monitoring dashboards
6. **Aggregation pipeline** is powerful enough for analytics without a separate data warehouse
7. **Development velocity** — faster iteration on schema changes during the build phase

## Consequences
- Transactions are supported (MongoDB 4.0+) but more verbose than PostgreSQL
- No foreign-key referential integrity enforcement (enforced at application level)
- Reporting/analytics aggregation is more complex than SQL GROUP BY
- A relational database might be preferable if the booking/payment domain requires complex multi-table transactions

## Where Relational Would Be Better
If ParkOps were to add complex financial reconciliation, multi-currency accounting, or regulatory reporting requirements, a PostgreSQL secondary store (or a data warehouse) would be the right choice.
