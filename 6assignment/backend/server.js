const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const app = express();

// ============ MIDDLEWARE ============
app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001", process.env.CLIENT_URL],
    credentials: true
}));

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: true }));

// Serve frontend
app.use(express.static(path.join(__dirname, "../frontend/public")));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ============ MONGODB CONNECTION ============
mongoose.connect("mongodb://127.0.0.1:27017/sportsRentalDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log("✅ MongoDB Connected Successfully"))
    .catch(err => console.error("❌ MongoDB Connection Error:", err.message));

// ============ ROUTES ============
app.use("/api/equipment", require("./routes/equipmentRoutes"));
app.use("/api/booking", require("./routes/bookingRoutes"));
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
app.use("/api/user", require("./routes/userRoutes"));

// ============ HEALTH CHECK ============
app.get("/api/health", (req, res) => {
    res.json({ status: "Server is running", timestamp: new Date() });
});

// ============ 404 HANDLER ============
app.use((req, res) => {
    res.status(404).json({ error: "Route not found" });
});

// ============ ERROR HANDLING MIDDLEWARE ============
app.use((err, req, res, next) => {
    console.error("❌ Error:", err);
    res.status(err.status || 500).json({
        error: err.message || "Internal Server Error",
        ...(process.env.NODE_ENV === "development" && { stack: err.stack })
    });
});

// ============ SERVER START ============
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`
    ╔════════════════════════════════════════╗
    ║  🏆 Sports Equipment Rental System 🏆  ║
    ║  Server running on port ${PORT}       ║
    ║  http://localhost:${PORT}              ║
    ╚════════════════════════════════════════╝
    `);
});
