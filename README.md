# E-commerce SQL Backend

> 🚧 **Work in Progress:** This project is currently ongoing and under active development.

![TypeScript](https://img.shields.io/badge/TypeScript-v5-blue?style=for-the-badge&logo=typescript)
![Express](https://img.shields.io/badge/Express-v4-lightgrey?style=for-the-badge&logo=express)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-v15-blue?style=for-the-badge&logo=postgresql)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)

A high-performance, strictly-typed REST API backend for an E-commerce platform. Built with **Express**, **TypeScript**, and **Prisma ORM** connecting to a **PostgreSQL** database. 

---

## 🚀 Core Features

This backend is structured using a modular architecture for scalability and maintainability:

- **🔐 Authentication & User Management (`usersAuth`)**:
  - Secure Registration and Login using `bcryptjs`.
  - JWT-based authentication with Access and Refresh tokens.
  - Profile management including Cloudinary-powered avatar uploads.
  - Automatic Token Rotation and Refresh workflows.
  
- **🛍️ Product Catalog (`product`)**:
  - Full CRUD operations for products.
  - Support for multiple Cloudinary images per product.
  - Advanced filtering, searching, and pagination logic.
  - Dynamic pricing and stock tracking.

- **📁 Categories (`category`)**:
  - Full CRUD operations for product categories.
  - URL-friendly slug generation automatically via `slugify`.
  - Image assignments for categories.

- **🛒 Shopping Cart & Orders (`cart`, `order`)**:
  - Add to cart, update quantity, and remove items.
  - Create full checkout orders processing subtotals and shipping fees.
  - Automated stock decrement upon order placement.
  - Admin controls for updating order and payment statuses.

- **⭐ Reviews (`review`)**:
  - Users can review products they have successfully purchased.
  - Strict one-review-per-user per-product enforcement.
  - Real-time rating aggregation and review statistics.
  - Review moderation controls for users and administrators.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Framework** | [Express.js](https://expressjs.com/) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) |
| **ORM** | [Prisma](https://www.prisma.io/) |
| **Media Storage** | [Cloudinary](https://cloudinary.com/) + [Multer](https://github.com/expressjs/multer) |
| **Validation** | [Zod](https://zod.dev/) |
| **Authentication**| [JWT](https://jwt.io/) & [Bcryptjs](https://www.npmjs.com/package/bcryptjs) |

---

## 📁 Project Folder Structure

```text
src/
├── config/                # Environment variables and core config
├── database/              # Prisma client initialization
├── helpers/               # Reusable helpers (Cloudinary, CustomError)
├── middleware/            # AuthGuards, Zod Validation, Multer setups
├── modules/               # Feature-based modular architecture
│   ├── cart/              # Cart management
│   ├── category/          # Category controller, service, validation, route
│   ├── order/             # Order and checkout logic
│   ├── product/           # Product controller, service, validation, route
│   ├── review/            # Product reviews and rating logic
│   └── usersAuth/         # User and Authentication logic
├── routes/                # Global API Router mapping
└── utils/                 # Utility functions (Pagination, AsyncHandlers)
```

---

## ⚙️ Development Setup

### Prerequisites

- **Node.js**: v18 or later
- **PostgreSQL**: A running instance (local or cloud)
- **Cloudinary Account**: For media uploads

### Installation

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd E-commerce_SQL
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Environment Configuration**:
   Create a `.env` file in the root directory based on your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/ecommerce_db?schema=public"
   
   # Security
   JWT_SECRET="your_jwt_access_secret"
   JWT_REFRESH_SECRET="your_jwt_refresh_secret"
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME="..."
   CLOUDINARY_API_KEY="..."
   CLOUDINARY_API_SECRET="..."
   ```

4. **Database Sync**:
   Sync the Prisma schema with your PostgreSQL database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

### Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Spins up the development server with `ts-node-dev`. |
| `npm run build` | Compiles the TypeScript source code to JavaScript. |

---

## 🔌 API Overview

The API is prefixed with `/api/v1/`:

- **Auth & Users**: `/api/v1/user`
  - `POST /register`, `POST /login`, `POST /refresh-token`, `POST /logout`
  - `GET /get-my-profile`, `PATCH /update-user`, `GET /get-all-user`
- **Products**: `/api/v1/product`
  - `POST /create-product`, `GET /get-all-products`, `PATCH /update-product/:id`
- **Categories**: `/api/v1/category`
  - `POST /create-category`, `GET /get-all-category`, `PATCH /update-category/:id`
- **Cart & Orders**: `/api/v1/cart`, `/api/v1/order`
  - `GET /cart`, `POST /cart-item/add`, `POST /order/create`
  - `GET /order/my-orders`, `PATCH /order/:orderId/status`
- **Reviews**: `/api/v1/review`
  - `POST /`, `GET /product/:productId`, `PATCH /:reviewId`, `DELETE /:reviewId`

---

## 🔒 Security & Architecture Decisions

- **Strict Validation**: Every incoming payload is validated using Zod schemas (`.validation.ts` files) before hitting the service layer.
- **Typed Payloads**: The service layers (`.service.ts`) strictly expect destructured payload types exported from the validation files, ensuring type safety from request to database.
- **Atomic File Uploads**: Cloudinary logic gracefully handles removing old images when new ones are uploaded to prevent orphans.
- **Error Handling**: A centralized global error handler catches and formats `CustomError` instances into a standardized JSON response.