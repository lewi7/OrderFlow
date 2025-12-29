# OrderFlow 🍕
**Multi-tenant restaurant order management system**

OrderFlow is a full-stack platform that unifies restaurant orders from multiple sources into a single real-time dashboard. It is designed with scalability, security, and real-world operations in mind.

---

## What Problem It Solves
Restaurants often juggle multiple delivery platforms and manual orders, leading to fragmented workflows and missed orders.

**OrderFlow solves this by:**
- Consolidating all orders into one dashboard
- Providing real-time order updates
- Supporting multiple restaurants (multi-tenancy)
- Enforcing role-based access and data isolation

---

## Key Features
- 🧾 Unified order management (manual + external sources)
- ⚡ Real-time updates via WebSockets
- 🔐 JWT authentication with role-based access control
- 🏪 Multi-tenant architecture (restaurant-level isolation)
- 📊 Basic revenue and order analytics
- 🐳 Dockerized for easy local development

---

## Tech Stack

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- WebSockets
- Axios

### Backend
- Java 21
- Spring Boot
- Spring Security (JWT)
- Spring Data JPA
- WebSockets

### Database & DevOps
- PostgreSQL
- Docker & Docker Compose
- Maven

---

## Architecture Overview

- Single backend instance
- Tenant-aware data access
- Stateless authentication
- Real-time event updates

---

## Security
- JWT-based authentication
- Role-based access control (Owner, Staff)
- Tenant-level data isolation
- Secure API access via Spring Security

---

## Getting Started

### Prerequisites
- Java 21
- Node.js 18+
- Docker (recommended)

### Run with Docker
```bash
docker-compose up -d

# Backend
cd backend
./mvnw spring-boot:run

# Frontend
cd frontend
npm install
npm run dev
POST   /api/auth/login
GET    /api/orders
POST   /api/orders
PUT    /api/orders/{id}/status
GET    /api/users
