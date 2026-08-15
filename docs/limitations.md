# Known System Limitations

The current ParkOps architecture has been purposefully designed for small-to-medium scale operations. The following limitations are acknowledged:

## 1. Single-Region Database
The MongoDB Atlas cluster and AWS infrastructure are currently deployed in a single region (e.g., `us-east-1`). A full region outage will result in service downtime. Multi-region read replicas and active-passive failover are not currently implemented.

## 2. External Dependencies
The system relies on third-party providers:
- **Payments (e.g., Stripe/Razorpay):** If the payment provider is down, users cannot finalize bookings, though they can still search and view availability.
- **Email Delivery:** Failed email delivery relies on internal worker retry logic; prolonged provider outages may delay QR receipts.

## 3. Scale Limits of Stateful WebSockets
While Socket.IO provides excellent real-time capabilities, scaling it horizontally requires a Redis Pub/Sub adapter and sticky sessions on the AWS ALB. Currently, this adds networking overhead. Extreme scale (millions of concurrent users) would necessitate a shift to a managed Pub/Sub service like AWS AppSync or API Gateway WebSockets.

## 4. Hardware Integrations
Currently, QR check-in requires a human operator to scan the code using the web app. Direct IoT integration with boom barriers/ANPR (Automatic Number Plate Recognition) cameras is not yet natively supported by the backend polling mechanism.
