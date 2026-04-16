# 🚀 Quick Setup Guide - SportRent

Follow these steps to get your professional sports rental system up and running!

---

## ✅ Prerequisites

- **Node.js** (v14+) - [Download](https://nodejs.org/)
- **MongoDB** (Local or Atlas) - [Download](https://www.mongodb.com/try/download/community)
- **Git** (Optional but recommended)

---

## 🔧 Installation Steps

### 1️⃣ Start MongoDB

**Windows:**
```bash
mongod
```

**macOS:**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### 2️⃣ Install Dependencies

```bash
cd sports-rental/backend
npm install
```

This will install all required packages:
- express (Web framework)
- mongoose (MongoDB ODM)
- cors (Cross-origin requests)
- body-parser (Request parsing)
- bcryptjs (Password hashing)
- jsonwebtoken (JWT authentication)
- dotenv (Environment variables)

### 3️⃣ Start the Server

```bash
npm start
```

Expected output:
```
╔════════════════════════════════════════╗
║  🏆 Sports Equipment Rental System 🏆  ║
║  Server running on port 3000           ║
║  http://localhost:3000                 ║
╚════════════════════════════════════════╝

✅ MongoDB Connected Successfully
```

### 4️⃣ Access the Application

Open your browser and go to:
```
http://localhost:3000
```

---

## 🎯 First Steps in the App

### 1. Register as a User
1. Click **"Register"** button
2. Fill in your details:
   - Full Name: Your Name
   - Email: your@email.com
   - Phone: 10-digit number
   - Password: Your password
3. Click **"Register"**
4. You'll be logged in automatically ✅

### 2. Add Your First Equipment
1. Scroll to **"Add Equipment to Rent"** section
2. Fill in details:
   - Equipment Name: e.g., "Cricket Bat - SS"
   - Category: Select from dropdown
   - Description: Brief description
   - Price/Day: e.g., 500
   - Deposit: e.g., 2000
   - Quantity: 1 or more
3. Click **"Add Equipment"**

### 3. Browse & Book Equipment
1. See all equipment in the grid
2. Use filters (Category, Search, Sort) to find equipment
3. Click **"Book Now"** on any equipment
4. Select rental dates
5. Review the price breakdown
6. Click **"Confirm Booking"**

### 4. View Your Bookings
1. Click **"Dashboard"** button in top-right
2. See your booking history
3. Track booking status (Pending, Confirmed, In Use, Returned)

---

## 🔗 API Testing with Postman

### Setup Postman Collection

**1. Register User:**
```
POST http://localhost:3000/api/auth/register
Body (JSON):
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "9876543210",
  "password": "password123"
}
```

**2. Login:**
```
POST http://localhost:3000/api/auth/login
Body (JSON):
{
  "email": "john@example.com",
  "password": "password123"
}

Response includes:
{
  "token": "eyJhbGc...",
  "user": { ... }
}
```

**3. Add Equipment (Use token from login):**
```
POST http://localhost:3000/api/equipment
Headers:
- Authorization: Bearer <YOUR_TOKEN>

Body (JSON):
{
  "name": "Cricket Bat",
  "category": "cricket",
  "description": "Professional grade cricket bat",
  "pricePerDay": 500,
  "deposit": 2000,
  "quantity": 2
}
```

**4. Get All Equipment:**
```
GET http://localhost:3000/api/equipment?category=cricket&sort=price_asc
```

**5. Create Booking (Use token):**
```
POST http://localhost:3000/api/booking
Headers:
- Authorization: Bearer <YOUR_TOKEN>

Body (JSON):
{
  "equipmentId": "<EQUIPMENT_ID>",
  "rentalStartDate": "2024-04-10",
  "rentalEndDate": "2024-04-15"
}
```

---

## 📊 Database Structure

### Collections Created Automatically:

1. **Users** - User accounts and profiles
2. **Equipment** - Available equipment inventory
3. **Bookings** - Rental transactions
4. **Reviews** - Equipment ratings and feedback

---

## 🐛 Troubleshooting

### "MongoDB Connection Error"
```
❌ Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution:** Make sure MongoDB is running
```bash
mongod  # Start MongoDB
```

### "Port 3000 already in use"
```
❌ Error: listen EADDRINUSE :::3000
```
**Solution:** Change port in server.js or kill the process:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9
```

### "Cannot POST /api/equipment"
```
❌ Error: 404 Not Found
```
**Solution:** Make sure server is running and routes are correct

### "Unauthorized 401"
```
❌ Error: No token provided
```
**Solution:** Include Bearer token in Authorization header for protected routes

---

## 🎨 Customization

### Change Color Scheme
Edit `frontend/public/style.css`:
```css
/* Change primary gradient color */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
/* To your preferred colors */
```

### Add More Equipment Categories
Edit `backend/models/Equipment.js`:
```javascript
enum: ["cricket", "badminton", "tennis", "cycling", "gym", "water_sports", "YOUR_CATEGORY"]
```

### Modify Database Name
Edit `backend/server.js`:
```javascript
mongoose.connect("mongodb://127.0.0.1:27017/YOUR_DB_NAME")
```

---

## 📱 Features Tour

| Feature | Steps |
|---------|-------|
| **Register** | Click Register → Fill Details → Submit |
| **Login** | Click Login → Enter Email & Password |
| **Add Equipment** | Login → Fill Equipment Form → Submit |
| **Search Equipment** | Use search bar or category filter |
| **Book Equipment** | Click Book Now → Select Dates → Confirm |
| **View Bookings** | Click Dashboard → See booking list |
| **Leave Review** | Complete booking → Click Review → Rate |

---

## 📝 Important Notes

1. **JWT Token:** Valid for 7 days, store in localStorage
2. **Password:** Hashed with bcrypt, never sent in plaintext
3. **Deposits:** Refunded when equipment is returned
4. **Ratings:** Calculated from verified reviews only
5. **Images:** Currently using placeholders, can add upload functionality

---

## 🚀 Next Steps

1. ✅ Test the application locally
2. ✅ Add sample equipment and bookings
3. ✅ Try booking workflow
4. ✅ Test filters and search
5. ✅ Deploy to production (Heroku/AWS/DigitalOcean)

---

## 🎓 Learning Resources

- [Express.js Docs](https://expressjs.com/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [JWT Docs](https://jwt.io/)
- [Bootstrap Docs](https://getbootstrap.com/)

---

## ✨ You're All Set! 🎉

Your professional sports rental platform is ready to use. Start adding equipment, creating bookings, and managing your sports rental business!

**For detailed API documentation, see README.md**

---

**Need Help?**
- Check the README.md for detailed documentation
- Review API endpoints in the README
- Check browser console for errors (F12)
- Review server logs in terminal

Happy Renting! 🏆
