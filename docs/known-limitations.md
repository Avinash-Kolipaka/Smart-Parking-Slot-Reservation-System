# ParkOps — Known Limitations

This document honestly describes the current limitations of the ParkOps v1.0.0 release. These are deliberate trade-offs or not-yet-implemented features, not defects.

---

## 1. Payment Gateway (CRITICAL LIMITATION)

**Status:** Simulated / Not Production-Ready

The current payment implementation uses an internal simulation (`MockGateway`). No real payment processor (Stripe, Razorpay, PayU, etc.) is integrated. Every payment call automatically returns `Success`.

**Impact:** ParkOps cannot process real financial transactions in the current state.

**Resolution:** Integrate a real payment gateway (e.g., Stripe) and implement webhook verification for payment status confirmation before accepting real money.

---

## 2. Report File Generation

**Status:** Not Implemented

The report job (`reportJob.js`) has the infrastructure scaffolding but does not generate actual PDF or CSV files. Reports submitted through the admin dashboard will be marked as `FAILED` with an "not yet implemented" message.

**Resolution:** Implement using `pdfkit` (PDF) and `csv-writer` (CSV) with Cloudinary or S3 storage for file hosting.

---

## 3. AI Features — Optional Dependency

**Status:** Graceful Degradation

The AI analytics assistant requires a valid `OPENAI_API_KEY` or `GEMINI_API_KEY`. If not configured, AI features silently return a placeholder response and the core booking/parking system continues normally.

**Impact:** AI-powered insights are not available without a configured AI provider.

---

## 4. Load-Tested Capacity (NOT VERIFIED)

**Status:** Not Load Tested Against Staging

The following capacity estimates are **theoretical**, not measured:

| Users | Expected Status | Notes |
| :--- | :--- | :--- |
| 100 | Likely works | Single ECS task + MongoDB Atlas free tier |
| 500 | Unknown | Redis + MongoDB capacity depends on Atlas tier |
| 1,000+ | Unknown | Requires horizontal ECS scaling and Atlas scaling |

**Resolution:** Execute the load testing scenarios in `docs/sre/slo.md` against a staging environment.

---

## 5. Report Generation URLs

**Status:** Stub

No report download URLs are generated. The `report.fileUrl` field will remain empty until report generation is implemented.

---

## 6. Recommendation Engine Distance Scoring

**Status:** Mocked

The parking recommendation service's distance scoring is mocked for baseline. It does not calculate real geospatial distance between the user's location and parking facilities (though the parking search API does use MongoDB 2dsphere geolocation queries).

---

## 7. Multi-Tenant Seeder Bootstrapping

**Status:** Incomplete

The database seeder (`utils/seeder.js`) does not create Tenant or TenantMembership records. This means seeded demo users do not have tenant membership, and tenant-scoped endpoints requiring `X-Tenant-Id` will return errors for seeded users without manual tenant setup.

**Workaround:** After seeding, manually create a Tenant document and TenantMembership documents linking the seeded users.

---

## 8. Backup and Restore — Not Drilled

**Status:** NOT VERIFIED

MongoDB Atlas automated backups are configured in infrastructure Terraform. A restore drill has **not** been performed against staging. The RTO and RPO values in documentation are theoretical targets, not measured values.

---

## 9. Browser Support

**Status:** Modern browsers only

| Browser | Support |
| :--- | :--- |
| Chrome 90+ | ✅ Supported |
| Firefox 88+ | ✅ Supported |
| Edge 90+ | ✅ Supported |
| Safari 14+ | ✅ Supported |
| Internet Explorer | ✗ Not Supported |

---

## 10. Mobile QR Scanner

**Status:** Frontend Implementation Only

The QR scanner feature in the admin panel relies on the device camera. It has not been tested on all mobile browsers. The backend QR verification is robust; the frontend scanner depends on browser MediaDevices API support.
