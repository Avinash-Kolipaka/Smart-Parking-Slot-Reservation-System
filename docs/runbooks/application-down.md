# Runbook: Application Down (Liveness Probe Failing)

**Symptoms:**
- Monitoring alerts report HTTP 502 Bad Gateway or Timeout on `/api/health/live`.
- Users report the site is completely inaccessible.

**Possible Causes:**
- The Node.js process crashed due to an Out Of Memory (OOM) error or Unhandled Promise Rejection.
- EC2 instance failure.
- Docker daemon failure.

**Checks:**
1. SSH into the EC2 instance via AWS SSM.
2. Check Docker container status: `docker compose ps`.
3. Check container logs: `docker compose logs --tail=100 backend`.
4. Check system memory: `free -m`.

**Recovery Steps:**
1. If the container exited, restart it: `docker compose restart backend`.
2. If the instance is out of memory, scale up the instance type via the AWS Console or Terraform.
3. If a specific bad commit caused a continuous crash loop, initiate a rollback (see `rollback.md`).
