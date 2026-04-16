const express = require("express");
const router = express.Router();
const Review = require("../models/Review");
const Equipment = require("../models/Equipment");
const Booking = require("../models/Booking");
const { verifyToken } = require("./authRoutes");

// ✅ ADD REVIEW (Protected)
router.post("/", verifyToken, async (req, res) => {
    try {
        const { bookingId, equipmentId, rating, title, comment, cleanliness, quality, punctuality } = req.body;

        // Validate rating
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ error: "Rating must be between 1 and 5" });
        }

        // Check if user owns this booking
        const booking = await Booking.findById(bookingId);
        if (booking.userId.toString() !== req.userId) {
            return res.status(403).json({ error: "Not authorized to review this booking" });
        }

        // Create review
        const review = new Review({
            bookingId,
            equipmentId,
            userId: req.userId,
            rating,
            title,
            comment,
            cleanliness: cleanliness || rating,
            quality: quality || rating,
            punctuality: punctuality || rating,
            verified: true
        });

        await review.save();

        // Update equipment average rating
        const allReviews = await Review.find({ equipmentId });
        const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

        await Equipment.findByIdAndUpdate(equipmentId, {
            averageRating: avgRating,
            reviewCount: allReviews.length
        });

        res.status(201).json({
            message: "Review added successfully",
            review: await review.populate("userId", "fullName profilePicture")
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ GET REVIEWS FOR EQUIPMENT
router.get("/equipment/:equipmentId", async (req, res) => {
    try {
        const reviews = await Review.find({ equipmentId: req.params.equipmentId })
            .populate("userId", "fullName profilePicture")
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ GET USER'S REVIEWS (Protected)
router.get("/user/my-reviews", verifyToken, async (req, res) => {
    try {
        const reviews = await Review.find({ userId: req.userId })
            .populate("equipmentId", "name image")
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ GET ALL REVIEWS
router.get("/", async (req, res) => {
    try {
        const reviews = await Review.find()
            .populate("userId", "fullName profilePicture")
            .populate("equipmentId", "name")
            .sort({ createdAt: -1 });

        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ UPDATE REVIEW (Protected)
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        if (review.userId.toString() !== req.userId) {
            return res.status(403).json({ error: "Not authorized to update this review" });
        }

        const updated = await Review.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate("userId", "fullName profilePicture");

        res.json({
            message: "Review updated successfully",
            review: updated
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ DELETE REVIEW (Protected)
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);

        if (!review) {
            return res.status(404).json({ error: "Review not found" });
        }

        if (review.userId.toString() !== req.userId) {
            return res.status(403).json({ error: "Not authorized to delete this review" });
        }

        await Review.findByIdAndDelete(req.params.id);

        // Update equipment rating
        const allReviews = await Review.find({ equipmentId: review.equipmentId });
        const avgRating = allReviews.length > 0
            ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
            : 0;

        await Equipment.findByIdAndUpdate(review.equipmentId, {
            averageRating: avgRating,
            reviewCount: allReviews.length
        });

        res.json({ message: "Review deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ GET EQUIPMENT RATING STATS
router.get("/stats/:equipmentId", async (req, res) => {
    try {
        const reviews = await Review.find({ equipmentId: req.params.equipmentId });

        const stats = {
            totalReviews: reviews.length,
            averageRating: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1) : 0,
            averageCleanliness: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + (r.cleanliness || r.rating), 0) / reviews.length).toFixed(1) : 0,
            averageQuality: reviews.length > 0 ? (reviews.reduce((sum, r) => sum + (r.quality || r.rating), 0) / reviews.length).toFixed(1) : 0,
            ratingBreakdown: {
                "5": reviews.filter(r => r.rating === 5).length,
                "4": reviews.filter(r => r.rating === 4).length,
                "3": reviews.filter(r => r.rating === 3).length,
                "2": reviews.filter(r => r.rating === 2).length,
                "1": reviews.filter(r => r.rating === 1).length
            }
        };

        res.json(stats);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
