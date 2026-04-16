# 🏆 Assignment 6 - Sports Equipment Rental System

## 📌 Project Title

**SportRent – Full Stack Sports Equipment Rental Platform**

---

## 📖 Description

This project is a **full-stack web application** that allows users to rent sports equipment, manage bookings, and leave reviews.

It provides a professional rental system with authentication, equipment management, booking system, and rating features.

The backend is built using Node.js, Express, and MongoDB, while the frontend is built using HTML, CSS, JavaScript, and Bootstrap.

---

## 🛠️ Technologies Used

### Frontend

* HTML5
* CSS3
* JavaScript
* Bootstrap

### Backend

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT (JSON Web Token)
* Bcrypt.js

Dependencies used in the project include Express, Mongoose, JWT, and Bcrypt for authentication and database operations. 

---

## ✨ Features

### 🔐 Authentication System

* User registration and login
* Password hashing using bcrypt
* JWT-based authentication

User passwords are securely hashed before saving to the database. 

---

### 🎯 Equipment Management

* Add new equipment
* Edit and delete equipment
* Categorized equipment (cricket, gym, etc.)
* Search and filter functionality

Equipment schema includes price, condition, category, and availability. 

---

### 📅 Booking System

* Rent equipment for specific dates
* Automatic price calculation
* Deposit and damage handling
* Booking status tracking

Booking cost is calculated automatically using rental duration and price per day. 

---

### ⭐ Review System

* Users can rate equipment
* Multi-parameter reviews (quality, cleanliness, etc.)
* Average rating calculation

Reviews are linked with booking and equipment IDs. 

---

### 📊 Dashboard & Statistics

* View booking history
* Track total spending
* Equipment performance metrics

---

### 🎨 UI Features

* Responsive design
* Bootstrap-based UI
* Search, filter, and sort options

---

## 📂 Project Structure

```id="a61x9d"
sports-rental/
│── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Equipment.js
│   │   ├── Booking.js
│   │   ├── Review.js
│   │
│   ├── routes/
│   ├── server.js
│   └── package.json
│
│── frontend/
│   └── public/
│       ├── index.html
│       ├── script.js
│       └── style.css
│
│── README.md
```

---

## ▶️ How to Run

### 1️⃣ Install Dependencies

```bash id="b9lq2n"
npm install
```

---

### 2️⃣ Start MongoDB

```bash id="l2k3mn"
mongod
```

---

### 3️⃣ Run Server

```bash id="z8q1pl"
node server.js
```

---

### 4️⃣ Open Application

```
http://localhost:3000
```

Server connects to MongoDB database:
**sportsRentalDB** 

---

## 🎯 Learning Outcomes

* Full stack development
* REST API design
* Database schema design using MongoDB
* Authentication using JWT
* CRUD operations
* Real-world project development

---

## 👨‍💻 Author

**Aniket Damedhar**

---

## 📌 Note

This project is part of **FSDL Assignment 6**, focusing on advanced full-stack development with real-world features like booking and review systems.
