# Incident Response Plan

This document outlines the standard operating procedure for handling critical production incidents in ParkOps.

## 1. Incident Severity Definitions

| Severity | Definition | Examples |
| :--- | :--- | :--- |
| **SEV-1** | Core production functionality unavailable. | API down, database offline, Redis down in strict mode, all bookings failing. |
| **SEV-2** | Major degradation affecting significant users. | High latency, intermittent 5xx errors, AI analytics failing, Socket.IO broadcast failing. |
| **SEV-3** | Limited/non-critical issue. | Email delivery delayed, admin dashboard slow, single minor API endpoint failing. |

## 2. Incident Response Lifecycle

### 1. Detection
- **Automated**: CloudWatch alarms trigger (High CPU, 5xx Spikes, Latency, Target Tracking failure).
- **Manual**: Customer reports via support channels or internal team observation.

### 2. Triage
- On-call engineer acknowledges the page.
- Assess the impact and declare the incident severity (SEV-1, SEV-2, or SEV-3).
- Create an incident tracking ticket and communicate status internally.

### 3. Containment
- Stop the bleeding immediately.
- If caused by a deployment: **Rollback immediately** (do not attempt to fix-forward for SEV-1).
- If caused by load: Scale out manually or aggressively rate limit.

### 4. Recovery
- Implement the long-term fix once containment is achieved.
- Monitor metrics to ensure the system returns to a healthy baseline.

### 5. Verification
- Run the full smoke test suite against production.
- Confirm with affected users/stakeholders that service is restored.

### 6. Communication
- Update external status pages (if applicable).
- Send internal "All Clear" communication.

### 7. Postmortem
- Within 48 hours of a SEV-1 or SEV-2, complete the `docs/sre/postmortem-template.md`.
- Focus on blameless RCA (Root Cause Analysis) and preventative action items.
