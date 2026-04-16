const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Booking = require("../models/Booking");
const { verifyToken } = require("./authRoutes");

// ✅ GET USER PROFILE (Protected)
router.get("/profile", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ UPDATE USER PROFILE (Protected)
router.put("/profile", verifyToken, async (req, res) => {
    try {
        const { fullName, phone, address, profilePicture } = req.body;

        const user = await User.findByIdAndUpdate(
            req.userId,
            {
                fullName,
                phone,
                address,
                profilePicture
            },
            { new: true, runValidators: true }
        ).select("-password");

        res.json({
            message: "Profile updated successfully",
            user
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ CHANGE PASSWORD (Protected)
router.put("/change-password", verifyToken, async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;

        // Get user with password
        const user = await User.findById(req.userId).select("+password");

        // Verify old password
        const isPasswordValid = await user.comparePassword(oldPassword);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Old password is incorrect" });
        }

        // Update password
        user.password = newPassword;
        await user.save();

        res.json({ message: "Password changed successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ GET USER DASHBOARD DATA (Protected)
router.get("/dashboard", verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select("-password");

        const bookings = await Booking.countDocuments({ userId: req.userId });
        const completedBookings = await Booking.countDocuments({
            userId: req.userId,
            status: "returned"
        });
        const activeBookings = await Booking.countDocuments({
            userId: req.userId,
            status: { $in: ["pending", "confirmed", "in_use"] }
        });

        const recentBookings = await Booking.find({ userId: req.userId })
            .populate("equipmentId", "name image category")
            .sort({ createdAt: -1 })
            .limit(5);

        res.json({
            user,
            stats: {
                totalBookings: bookings,
                completedBookings,
                activeBookings,
                totalSpent: user.totalSpent
            },
            recentBookings
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ GET ALL USERS (Admin only)
router.get("/", async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ GET USER BY ID (Admin only)
router.get("/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ GET USER BOOKING HISTORY (Protected)
router.get("/bookings/history", verifyToken, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.userId })
            .populate("equipmentId", "name image category pricePerDay")
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
