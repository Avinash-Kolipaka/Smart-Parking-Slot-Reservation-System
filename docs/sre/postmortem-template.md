# Incident Postmortem Template

**Incident Name:** [Short, descriptive name of the incident]
**Date:** [YYYY-MM-DD]
**Authors:** [List of authors]
**Status:** [Draft / In Review / Published]
**Severity:** [SEV-1 / SEV-2 / SEV-3 / SEV-4]

---

## 1. Summary

[A brief, one-paragraph summary of what happened, the impact, and how it was resolved. This should be understandable by non-technical stakeholders.]

## 2. Impact

*   **User Impact:** [How many users were affected? What couldn't they do? E.g., "Users could not create new bookings for 45 minutes."]
*   **Business Impact:** [Revenue lost, reputational damage, SLA breaches.]
*   **Technical Impact:** [Systems degraded, data loss (if any).]

## 3. Timeline

[Chronological list of events. Use UTC time. Include when the issue started, when it was detected, key actions taken, mitigation, and final resolution.]

*   *10:00 UTC:* Deployment of version 1.2.3 begins.
*   *10:05 UTC:* 5xx error rate spikes to 10% on the booking API.
*   *10:08 UTC:* PagerDuty alert triggers for high error rate; on-call engineer paged.
*   *10:15 UTC:* Engineer identifies bad deployment and initiates rollback.
*   *10:20 UTC:* Rollback completes. Error rate returns to baseline (< 0.1%).

## 4. Root Cause

[A detailed explanation of why the incident occurred. Go deep (e.g., using the "5 Whys" method) to find the underlying systemic issue, not just the immediate trigger.]

## 5. Contributing Factors

[Things that didn't directly cause the incident but made it worse or harder to detect/resolve. E.g., "The monitoring dashboard was slow to load," or "The runbook was outdated."]

## 6. Detection

*   **How was it detected?** [Automated alert, customer report, internal testing?]
*   **Time to detect:** [How long between start and detection?]
*   **Could it have been detected earlier?** [If yes, how?]

## 7. Mitigation and Resolution

*   **How was the impact stopped?** (Mitigation)
*   **How was the underlying issue permanently fixed?** (Resolution)
*   **Time to mitigate:** [Time from detection to mitigation]

## 8. Lessons Learned

*   **What went well?** [e.g., "The automated rollback script worked flawlessly."]
*   **What went wrong?** [e.g., "The initial alert was ignored because it looked like a known flaky test."]
*   **Where did we get lucky?**

## 9. Action Items

[Concrete tasks to prevent this from happening again or to improve detection/response. Each item must have an owner and a ticket link.]

| Action Item | Owner | Ticket | Status |
| :--- | :--- | :--- | :--- |
| Update deployment script to automatically verify health check before committing. | @engineer1 | TICK-123 | To Do |
| Add specific alert for Database connection pool exhaustion. | @engineer2 | TICK-124 | Done |

---
*Note: Postmortems are blameless. We focus on systems, processes, and improving resilience, not on human error.*
