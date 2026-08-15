# Chaos Testing Matrix

This matrix tracks the required chaos experiments and failure simulations required for production certification.

| Failure | Expected Behavior | Tested | Result | Notes |
| :--- | :--- | :--- | :--- | :--- |
| Redis unavailable | API degradation (no cache), Workers fail safely | `[ ]` | `PASS/FAIL` | |
| Worker stopped | Background jobs remain queued, recover on restart | `[ ]` | `PASS/FAIL` | |
| Worker duplicated | Jobs process exactly once (idempotent) | `[ ]` | `PASS/FAIL` | |
| ECS task killed | Load balancer shifts traffic, replacement task spins up | `[ ]` | `PASS/FAIL` | |
| Auto-scaling scales out | New task spins up gracefully under load | `[ ]` | `PASS/FAIL` | |
| Auto-scaling scales in | Task drains connections cleanly when load drops | `[ ]` | `PASS/FAIL` | |
| Payment timeout | Booking remains in 'pending' or 'failed' safely | `[ ]` | `PASS/FAIL` | |
| Email unavailable | Booking succeeds, failure logged, retry scheduled | `[ ]` | `PASS/FAIL` | |
| AI unavailable | Core system functions unaffected | `[ ]` | `PASS/FAIL` | |
| Socket disconnect | Client detects, reconnects, state syncs | `[ ]` | `PASS/FAIL` | |
| Database unavailable | Health checks fail, alerts trigger, no data corruption | `[ ]` | `PASS/FAIL` | |
| Broken frontend deploy | Quick rollback possible | `[ ]` | `PASS/FAIL` | |
| Broken backend deploy | Rollback restores API availability | `[ ]` | `PASS/FAIL` | |
| DB Backup & Restore | Restore to isolated environment is completely verified | `[ ]` | `PASS/FAIL` | |

*(Never mark a test PASS without actually performing it in a staging environment.)*
