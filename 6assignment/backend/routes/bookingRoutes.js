const express = require("express");
const router = express.Router();
const Booking = require("../models/Booking");
const Equipment = require("../models/Equipment");
const User = require("../models/User");
const { verifyToken } = require("./authRoutes");

// ✅ CREATE BOOKING (Protected)
router.post("/", verifyToken, async (req, res) => {
    try {
        const { equipmentId, rentalStartDate, rentalEndDate } = req.body;

        // Validate dates
        const startDate = new Date(rentalStartDate);
        const endDate = new Date(rentalEndDate);

        if (startDate >= endDate) {
            return res.status(400).json({ error: "End date must be after start date" });
        }

        if (startDate < new Date()) {
            return res.status(400).json({ error: "Cannot book for past dates" });
        }

        // Get equipment
        const equipment = await Equipment.findById(equipmentId);
        if (!equipment) {
            return res.status(404).json({ error: "Equipment not found" });
        }

        if (!equipment.available || equipment.booked >= equipment.quantity) {
            return res.status(400).json({ error: "Equipment not available for these dates" });
        }

        // Calculate rental duration
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const rentCost = days * equipment.pricePerDay;

        // Create booking
        const booking = new Booking({
            equipmentId,
            userId: req.userId,
            rentalStartDate: startDate,
            rentalEndDate: endDate,
            days,
            pricePerDay: equipment.pricePerDay,
            rentCost,
            depositPaid: equipment.deposit,
            totalAmount: rentCost + equipment.deposit,
            status: "pending",
            paymentStatus: "pending"
        });

        await booking.save();

        // Update equipment availability
        equipment.booked += 1;
        equipment.available = equipment.booked < equipment.quantity;
        await equipment.save();

        // Update user booking count
        await User.findByIdAndUpdate(req.userId, {
            $inc: { totalBookings: 1, totalSpent: booking.totalAmount }
        });

        res.status(201).json({
            message: "Booking created successfully",
            booking: await booking.populate("equipmentId", "name category")
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ GET USER'S BOOKINGS (Protected)
router.get("/user/bookings", verifyToken, async (req, res) => {
    try {
        const bookings = await Booking.find({ userId: req.userId })
            .populate("equipmentId", "name category image pricePerDay")
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ GET ALL BOOKINGS (Admin only)
router.get("/", async (req, res) => {
    try {
        const bookings = await Booking.find()
            .populate("equipmentId", "name category")
            .populate("userId", "fullName email phone")
            .sort({ createdAt: -1 });

        res.json(bookings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ GET SINGLE BOOKING
router.get("/:id", async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id)
            .populate("equipmentId")
            .populate("userId", "fullName email phone address");

        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        res.json(booking);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ CONFIRM BOOKING (Admin/Owner)
router.put("/:id/confirm", verifyToken, async (req, res) => {
    try {
        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status: "confirmed", paymentStatus: "completed" },
            { new: true }
        ).populate("equipmentId");

        res.json({
            message: "Booking confirmed",
            booking
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ RETURN EQUIPMENT (Update Booking)
router.put("/:id/return", verifyToken, async (req, res) => {
    try {
        const { returnCondition, damageCharge } = req.body;

        const booking = await Booking.findById(req.params.id);
        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        // Update booking
        booking.status = "returned";
        booking.returnDate = new Date();
        booking.returnCondition = returnCondition || "good";
        booking.damageCharge = damageCharge || 0;
        booking.depositRefunded = true;

        await booking.save();

        // Update equipment - mark as available
        const equipment = await Equipment.findById(booking.equipmentId);
        equipment.booked -= 1;
        equipment.available = equipment.booked < equipment.quantity;
        await equipment.save();

        res.json({
            message: "Equipment returned successfully",
            booking
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ CANCEL BOOKING (Protected)
router.put("/:id/cancel", verifyToken, async (req, res) => {
    try {
        const booking = await Booking.findById(req.params.id);

        if (!booking) {
            return res.status(404).json({ error: "Booking not found" });
        }

        if (booking.status === "in_use" || booking.status === "returned") {
            return res.status(400).json({ error: "Cannot cancel active or returned bookings" });
        }

        booking.status = "cancelled";
        booking.depositRefunded = true;
        await booking.save();

        // Update equipment availability
        const equipment = await Equipment.findById(booking.equipmentId);
        equipment.booked -= 1;
        equipment.available = equipment.booked < equipment.quantity;
        await equipment.save();

        res.json({
            message: "Booking cancelled successfully",
            booking
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ GET BOOKING STATISTICS
router.get("/stats", async (req, res) => {
    try {
        const stats = {
            totalBookings: await Booking.countDocuments(),
            completedBookings: await Booking.countDocuments({ status: "returned" }),
            activeBookings: await Booking.countDocuments({ status: { $in: ["pending", "confirmed", "in_use"] } }),
            totalRevenue: 0
        };

        const revenue = await Booking.aggregate([
            { $group: { _id: null, total: { $sum: "$totalAmount" } } }
        ]);

        stats.totalRevenue = revenue[0]?.total || 0;

        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
