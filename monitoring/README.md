## Overview
This document describes the monitoring and reliability
setup for the ChargeMate EV Charging Platform.

---

## Scripts

### Health Check
Checks if all 3 services are running:

```bash
bash scripts/health-check.sh
```

### Rollback
Reverts to previous working deployment:

```bash
bash scripts/rollback.sh
```

### Simulate Failure
Demonstrates failure detection and recovery:

```bash
bash scripts/simulate-failure.sh
```

### Create CloudWatch Alarms
Sets up AWS monitoring alerts (run once after deploy):

```bash
bash aws/create-alarms.sh
```

---

## Monitoring Architecture

```text
AWS CloudWatch
├── Log Groups
│   ├── /chargemate/station-service
│   ├── /chargemate/booking-service
│   └── /chargemate/frontend
├── Alarms
│   ├── ChargeMate-HighCPU (>80%)
│   ├── ChargeMate-HighMemory (>85%)
│   └── ChargeMate-EnvironmentHealth
└── SNS Alerts
    └── Email notifications to team
```

---

## Health Check Endpoints

| Service  | URL                              | Expected Response         |
|----------|----------------------------------|---------------------------|
| Station  | http://localhost:4001/health     | {"status":"healthy"}      |
| Booking  | http://localhost:4002/health     | {"status":"healthy"}      |
| Frontend | http://localhost:3000            | HTTP 200                  |

---

## Rollback Strategy

1. Jenkins pipeline detects deployment failure
2. Rollback script runs automatically
3. Previous version restored within 5 minutes
4. Team notified via CloudWatch alarm email

