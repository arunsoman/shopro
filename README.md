# Shopro POS 🚀

A modern, full-stack Restaurant Point of Sale (POS) system designed for efficiency, reliability, and visual excellence. Shopro POS provides a comprehensive suite of tools for restaurant management, from tableside ordering to kitchen displays and sophisticated inventory procurement.

![Shopro POS Logo](docs/logo.jpeg)

## 🌟 Key Modules

Shopro POS is built with a modular architecture to support diverse restaurant operations:

- **Core Order Management**: Seamless table management, order taking, and high-performance checkout flows.
- **Kitchen Display System (KDS)**: Real-time order synchronization for back-of-house efficiency.
- **Inventory & Procurement**: Sophisticated supply chain management including Purchase Order (PO) lifecycles and supplier bidding.
- **Tableside Ordering**: Optimized mobile interfaces for waitstaff to take orders directly at the table.
- **CRM & Loyalty**: Customer relationship management with integrated loyalty programs and personalized rewards.
- **Analytics Dashboard**: Real-time sales data, inventory alerts, and performance metrics.
- **Notification Engine**: Multi-channel (In-App, Email, SMS, Push) system with dynamic routing configuration.

## 🛠 Tech Stack

### Backend
- **Core**: Java 21 & Spring Boot 3.2.3
- **Database**: PostgreSQL 15+
- **Migrations**: Flyway
- **Real-time**: Spring WebSocket (STOMP)
- **Security**: JWT (JWS/DPoP) for secure API access
- **API Documentation**: SpringDoc / OpenAPI

### Frontend
- **Web**: TypeScript, React 19, Vite
- **Styling**: Tailwind CSS, Lucide Icons, Radix UI
- **State Management**: TanStack React Query
- **Charts**: Recharts

### Mobile
- **Cross-platform**: Flutter (Admin, Tableside Apps)

## 🚀 Getting Started

### Prerequisites
- JDK 21+
- Node.js 18+
- PostgreSQL 15+
- Gradle (included via wrapper)

### Setup Database
1. Create a database named `shopro_pos`.
2. Configure your credentials in `shopro-pos-server/src/main/resources/application-dev.yml`.
3. Flyway will automatically apply migrations upon server startup.

### Run Backend
```bash
./gradlew :shopro-pos-server:bootRun --args='--spring.profiles.active=dev'
```

### Run Frontend
```bash
cd shopro-pos-web
npm install
npm run dev
```

### Docker (Quick Start)
```bash
docker-compose up --build
```

## 🌐 Production Deployment

### 1. Clone the Repository
```bash
git clone https://github.com/arunsoman/shopro.git
cd shopro
```

### 2. Build and Deploy (Docker Compose)
The recommended way to deploy Shopro POS in production is using Docker Compose. This ensures all services (Database, API, and all UI modules) are orchestrated correctly.

```bash
docker-compose up -d --build
```

### 3. Access the System
Once started, the various modules are available at the following URLs:

| Module | URL | Description |
| :--- | :--- | :--- |
| **Admin & Web POS** | [http://localhost:5173](http://localhost:5173) | Primary web interface for management and POS operations. |
| **Flutter Admin/POS** | [http://localhost:5171](http://localhost:5171) | Multi-platform administrative and order interface. |
| **Tableside App** | [http://localhost:5170](http://localhost:5170) | Dedicated mobile interface optimized for tablets/phones. |
| **Backend API** | [http://localhost:5172](http://localhost:5172) | Central API Gateway (OpenAPI at `/swagger-ui.html`). |

## 📐 Architecture

Shopro POS follows a modular monorepo structure:
- `shopro-pos-server`: The Spring Boot application serving as the central API gateway and business logic engine.
- `shopro-pos-web`: The primary web-based management and POS interface.
- `shopro-pos-flutter`: Enterprise-grade mobile apps for staff and administration.
- `shopro_tableside_app`: Specialized Flutter app for tableside ordering.

## 📜 License
This project is proprietary and confidential. All rights reserved.

---

Built with ❤️ by the Shopro Team.
