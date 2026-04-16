# 📘 Assignment Write-up: Electronics E-commerce System

---

## 🎯 Aim

To develop a full-stack electronics e-commerce web application with product browsing, cart management, user authentication, orders, wishlist, and admin management.

---

## 🎯 Objectives

1. To design a responsive frontend using React, Vite, and CSS
2. To develop backend APIs using Node.js and Express
3. To implement database persistence using MongoDB and Mongoose
4. To create shopping cart, wishlist, and checkout workflows
5. To implement user authentication and authorization using JWT

---

## 📖 Theory

### 1. Full Stack Development

Full stack development includes both frontend and backend development.

* Frontend: User interface and product interaction
* Backend: Server logic, API routes, and database integration

---

### 2. Node.js and Express

Used to create server and APIs:

* Handle HTTP requests
* Manage routes for auth, products, cart, orders, reviews, wishlist, admin
* Connect to database and process business logic

---

### 3. MongoDB and Mongoose

Used for database:

* Store users, products, carts, orders, reviews, coupons
* Schema-based data modeling with validation
* Relationships between users and product references

---

### 4. Authentication (JWT)

* Token-based authentication
* Secure login and protected routes
* Maintains user sessions for profile, cart, orders, and admin access

---

### 5. E-commerce Logic

* Products are displayed with search, filters, and categories
* Users add items to cart and wishlist
* Checkout flow calculates totals and order details
* Admin can manage products, orders, and users

---

### 6. Additional Features

* Admin dashboard for product and order control
* Seed script to populate initial products and users
* React Query for async data fetching
* Toast notifications for user feedback

---

## ⚙️ Working

1. User registers and logs in
2. JWT token is generated and used for authenticated requests
3. User can:

   * Browse electronics products
   * Search and filter products
   * Add/remove items from cart
   * Save items to wishlist
   * Place orders
4. Admin can access protected admin routes
5. Data is stored in MongoDB
6. Frontend displays product data dynamically using React

---

## 📊 Result

The system successfully supports electronics e-commerce operations including product listing, authentication, cart management, wishlist, order creation, and admin controls.

---

## ✅ Conclusion

This assignment demonstrates a complete full-stack e-commerce application with real-world functionality, including authentication, database-backed product management, shopping workflow, and admin authorization.
