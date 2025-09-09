# E-commerce API

## Setup

1. Clone repository
2. `npm install`
3. Create a `.env` file (see `.env` example in project)
4. Create MySQL database and tables (see SQL below)
5. `npm run dev` or `npm start`

## Endpoints (examples)
- `POST /api/auth/register` — { name, email, password }
- `POST /api/auth/login` — { email, password } -> returns token
- `GET /api/products` — list or search products
- `POST /api/products` — Create product (admin)
- `GET /api/cart` — view cart (auth)
- `POST /api/cart/add` — { productId, quantity } (auth)
- `POST /api/orders/checkout` — creates order & Stripe PaymentIntent -> returns clientSecret
- `POST /api/orders/confirm` — { paymentIntentId } confirm & mark order paid

## Database schema (MySQL)

Run the following SQL to create tables used by the example:

```sql
CREATE DATABASE IF NOT EXISTS ecommerce;
USE ecommerce;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  isAdmin TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  inventory INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE cart_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cart_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  FOREIGN KEY (cart_id) REFERENCES carts(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  shipping JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  quantity INT DEFAULT 1,
  price DECIMAL(10,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  stripe_payment_id VARCHAR(255),
  amount DECIMAL(10,2),
  status VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

---

## Notes, next steps & suggestions
- **Admin creation**: Create admin by directly setting `isAdmin = 1` in DB for a user, or add an admin-only registration route.
- **Stripe**: This example uses PaymentIntents and returns `client_secret`. On frontend you complete the payment using Stripe.js. For robust production flows, implement webhook verification via `stripe.webhooks.constructEvent` using raw body and your webhook signing secret.
- **Validation & security**: Add request validation (e.g., `express-validator`) and sanitization before production.
- **Transactions & inventory**: Reduce inventory when order payment is succeeded. Consider using DB transactions and row-level locking if you expect concurrent purchases on same product.
- **Pagination & filters**: Expand `listProducts` with categories, sorting, and pagination metadata.
- **Tests & error handling**: Add unit/integration tests and better centralized error handling.

---

