# ChargeMate – EV Charging Station Finder & Booking System

Cloud-native microservices web application – SWE7303 DevOps Module

## Services
| Service         | Port | Description                  |
|----------------|------|------------------------------|
| station-service | 4001 | Manages charging stations    |
| booking-service | 4002 | Handles session bookings     |
| frontend        | 3000 | Next.js web UI               |

## Quick Start
```bash
cp .env.example .env
# Fill in your MongoDB URI and JWT secret
docker-compose up --build
```

## Team
| Member            | Role                        |
|------------------|-----------------------------|
| Bikram (HE38514) | DevOps & Cloud Architect    |
| Sudip (HE38869)  | Backend – Station Service   |
| Nainsi (HE38995) | Backend – Booking Service   |
| Suju (HE39012)   | QA & Automation             |
| Akashdeep(HE38702)| Frontend Developer         |
| Neeranjan(HE38983)| Site Reliability Engineer  |
