# Network Security Architecture

## VPC & Subnets

The infrastructure is deployed into a custom VPC (`10.0.0.0/16`) with strict subnet isolation.

| Subnet | CIDR | Purpose | Routing |
| :--- | :--- | :--- | :--- |
| Public A | `10.0.1.0/24` | ALB, NAT Gateway | IGW (Internet Gateway) |
| Public B | `10.0.2.0/24` | ALB (multi-AZ requirement) | IGW (Internet Gateway) |
| Private A | `10.0.10.0/24` | ECS Tasks | NAT Gateway |
| Private B | `10.0.11.0/24` | ECS Tasks | NAT Gateway |

## Security Groups

Traffic flows are strictly controlled via Security Groups using the principle of least privilege.

### 1. Application Load Balancer (`alb-sg`)
**Inbound (Ingress):**
- Port 80 (HTTP) from `0.0.0.0/0` (Redirects to 443)
- Port 443 (HTTPS) from `0.0.0.0/0`

**Outbound (Egress):**
- All traffic (`0.0.0.0/0`) allowed to communicate with ECS.

### 2. ECS Application Tasks (`ecs-tasks-sg`)
**Inbound (Ingress):**
- Port 5000 (TCP) from **`alb-sg` ONLY**. The application cannot be accessed directly from the public internet.

**Outbound (Egress):**
- All traffic (`0.0.0.0/0`) allowed out to the NAT Gateway to access MongoDB Atlas, external APIs (Stripe, Cloudinary), and AWS APIs.

### 3. EC2 Fallback/Admin Host (`app-sg`)
**Inbound (Ingress):**
- Port 80, 443 for web traffic.
- **Note:** Port 22 (SSH) is explicitly **denied** from `0.0.0.0/0`. Access must be performed securely via AWS Systems Manager (SSM) Session Manager.

## TLS / Encryption in Transit
- **CloudFront**: Enforces HTTPS for all frontend traffic.
- **ALB**: Terminates TLS for API traffic. HTTP is redirected to HTTPS (Status 301).
- **Internal**: ECS communicates with MongoDB Atlas and Redis using TLS.

## Missing/Future Enhancements
- MongoDB Atlas peering: Currently, ECS connects to Atlas over the public internet (via NAT). Future optimization should establish VPC Peering or AWS PrivateLink to Atlas for internal routing.
