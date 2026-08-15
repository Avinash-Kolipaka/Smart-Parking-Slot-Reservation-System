# Report Generation

## Background Processing
Generating heavy PDF or CSV reports blocks the Node.js event loop. 
Therefore, ParkOps offloads this to a background worker:
1. Admin requests a report via the API.
2. A `Report` document is created with status `PENDING`.
3. The `reportJob.js` cron (running every 5 minutes) picks up the pending report, fetches the necessary Analytics data, and generates the file format.
4. The generated file is uploaded to a storage provider, and the report status is marked `COMPLETED` with a secure `fileUrl`.

## Expiration
To comply with data retention policies, generated reports contain an `expiresAt` field. MongoDB TTL indexes automatically delete these documents (and theoretically trigger storage bucket cleanup) after 30 days.
