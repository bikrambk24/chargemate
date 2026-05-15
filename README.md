# ChargeMate – EV Charging Station Finder & Booking System

A cloud-native microservices application built for the DevOps module.

## Project Overview

ChargeMate allows EV drivers to find nearby charging stations, check real-time slot availability, and book charging slots. Admins can manage stations and bookings through a dedicated dashboard.

## Architecture
Frontend (Next.js)     → Port 3000
Station Service (Node) → Port 4001
Booking Service (Node) → Port 4002
Database (MongoDB Atlas)

## Tech Stack

- **Frontend:** Next.js 14, Bootstrap 5
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas
- **DevOps:** Jenkins, Docker, AWS ECR, AWS Elastic Beanstalk
- **Testing:** Jest, Supertest, ESLint
- **Version Control:** Git, GitHub

## Getting Started

### Prerequisites

- Node.js 20+
- Docker
- MongoDB Atlas account

### Run Locally

```bash
# Clone the repository
git clone https://github.com/bikrambk24/chargemate.git
cd chargemate

# Set up environment variables
cp station-service/.env.example station-service/.env
cp booking-service/.env.example booking-service/.env

# Edit .env files with MongoDB URI and JWT secret

# Run with Docker Compose
docker-compose up --build
```

Open `http://localhost:3000` in your browser.

### Run Without Docker

```bash
# Terminal 1 - Station Service
cd station-service
npm install
npm run dev

# Terminal 2 - Booking Service
cd booking-service
npm install
npm run dev

# Terminal 3 - Frontend
cd frontend
npm install
npm run dev
```

## Environment Variables

### Station Service
PORT=4001
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret

### Booking Service
PORT=4002
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
STATION_SERVICE_URL=http://localhost:4001

## Running Tests

```bash
# Station Service tests
cd station-service
npm run test

# Booking Service tests
cd booking-service
npm run test

# Run all tests with Docker
docker-compose -f docker-compose.test.yml up
```

## CI/CD Pipeline

The project uses Jenkins for CI/CD with the following stages:

1. **Checkout** – Pull code from GitHub
2. **Install** – Install dependencies for all services
3. **Lint** – Run ESLint on all services
4. **Test** – Run Jest unit and integration tests
5. **Build** – Build Docker images
6. **Push** – Push images to AWS ECR
7. **Deploy** – Deploy to AWS Elastic Beanstalk
8. **Verify** – Check deployment status
9. **Health Check** – Verify services are running

## AWS Infrastructure

- **ECR** – Docker image registry (3 repositories)
- **Elastic Beanstalk** – Application hosting
- **S3** – Deployment artifact storage
- **CloudWatch** – Monitoring and logging
- **IAM** – Access management

## Live Application
URL: http://chargemate-production.eba-2vauspwj.us-east-1.elasticbeanstalk.com

## Features

- User registration and login with JWT authentication
- Browse and filter EV charging stations by city, charger type, and availability
- Real-time slot availability tracking
- Book charging slots with cost calculation
- Cancel bookings with automatic slot restoration
- Admin dashboard with station and booking management
- Role-based access control (admin and user roles)

## Branch Strategy
main     → production ready code, triggers Jenkins pipeline
develop  → integration branch, all features merged here
feature/ → individual feature branches for each team member

## Project Structure
chargemate/
├── station-service/     # Backend API for stations and auth
├── booking-service/     # Backend API for bookings
├── frontend/            # Next.js frontend application
├── aws/                 # AWS deployment configuration
├── scripts/             # Health check and rollback scripts
├── monitoring/          # CloudWatch monitoring setup
├── Jenkinsfile          # CI/CD pipeline definition
├── docker-compose.yml   # Local development setup
└── docker-compose-eb.yml # AWS Elastic Beanstalk deployment