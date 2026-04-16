const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("../frontend/public"));

// MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/travelDB")
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Routes
const tripRoutes = require("./routes/tripRoutes");
const authRoutes = require("./routes/authRoutes");

app.use("/api/trips", tripRoutes);
app.use("/api/auth", authRoutes);

app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});