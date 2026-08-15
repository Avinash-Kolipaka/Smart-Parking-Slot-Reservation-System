# ADR 002: MongoDB as Primary Datastore

**Status:** Accepted

## Context
Parking structures vary wildly. Some have simple flat lots, others have multiple floors, zones, and complex pricing rules. A rigid relational schema could require constant migrations as the product evolves. However, we also need to strictly prevent double-booking.

## Decision
We chose MongoDB (specifically Atlas) as our primary database.
- We utilize **Document Schemas** to model hierarchical data (Parking -> Floors -> Slots) naturally without complex JOINs.
- To handle the transactional integrity required for bookings, we leverage **MongoDB Multi-Document ACID Transactions** and unique compound indexing on the `bookings` collection.

## Consequences
- **Positive:** Flexible schema allows rapid feature addition.
- **Negative:** Requires a Replica Set to use transactions. If not carefully designed, NoSQL data can become highly denormalized and difficult to aggregate across complex reports.
