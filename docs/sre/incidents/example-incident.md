# Incident Report: [Incident Name / Identifier]

**Date:** `[YYYY-MM-DD]`
**Severity:** `[Sev-1 (Critical) / Sev-2 (High) / Sev-3 (Medium)]`
**Status:** `[Resolved]`
**Lead Responder:** `[Name]`

## 1. Summary
*What happened, in 1-2 sentences?*
`[e.g., Redis cluster failed in staging, causing degraded performance and delayed worker processing.]`

## 2. Impact
*Who was affected and how badly?*
- **User Impact:** `[e.g., Real-time socket updates failed, bookings still succeeded but were slow.]`
- **Duration:** `[e.g., 45 minutes]`

## 3. Timeline
*(Use UTC or local time consistently)*
- `[09:00]` - `[Monitoring alert triggered for Redis connection errors]`
- `[09:05]` - `[Incident declared. Responder began investigation.]`
- `[09:12]` - `[Identified Redis instance as unhealthy.]`
- `[09:20]` - `[Initiated Redis failover / reboot.]`
- `[09:40]` - `[Redis back online, API error rates dropping.]`
- `[09:45]` - `[Full recovery confirmed. Incident closed.]`

## 4. Detection
*How did we know this was happening?*
`[e.g., Datadog/CloudWatch alert "Redis Connection Refused" triggered and paged on-call.]`

## 5. Root Cause
*Why did this happen?*
`[e.g., Deliberate chaos engineering test simulating Redis failure.]`

## 6. Resolution & Recovery Time
*What fixed it and how long did it take?*
- **Resolution:** `[Manual restart of Redis instance.]`
- **Time to Detect (TTD):** `[5 minutes]`
- **Time to Recover (TTR):** `[40 minutes]`

## 7. Corrective Actions (Action Items)
*What are we going to do to prevent this or recover faster next time?*
- [ ] Add better fallback mechanisms in the API when Redis is down.
- [ ] Implement auto-failover in staging Redis.
- [ ] Update runbook to include specific Redis diagnostic commands.
