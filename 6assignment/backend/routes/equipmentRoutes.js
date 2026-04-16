const express = require("express");
const router = express.Router();
const Equipment = require("../models/Equipment");
const { verifyToken } = require("./authRoutes");

// ✅ GET ALL EQUIPMENT WITH FILTERS AND SEARCH
router.get("/", async (req, res) => {
    try {
        const { category, minPrice, maxPrice, search, sort, available } = req.query;
        let filter = {};

        // Category filter
        if (category) {
            filter.category = category;
        }

        // Price range filter
        if (minPrice || maxPrice) {
            filter.pricePerDay = {};
            if (minPrice) filter.pricePerDay.$gte = Number(minPrice);
            if (maxPrice) filter.pricePerDay.$lte = Number(maxPrice);
        }

        // Available filter
        if (available) {
            filter.available = available === "true";
        }

        // Search by name, description, brand
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { brand: { $regex: search, $options: "i" } }
            ];
        }

        // Sorting
        let sortQuery = {};
        switch (sort) {
            case "price_asc":
                sortQuery = { pricePerDay: 1 };
                break;
            case "price_desc":
                sortQuery = { pricePerDay: -1 };
                break;
            case "rating":
                sortQuery = { averageRating: -1 };
                break;
            case "newest":
                sortQuery = { createdAt: -1 };
                break;
            default:
                sortQuery = { createdAt: -1 };
        }

        const items = await Equipment.find(filter)
            .sort(sortQuery)
            .populate("owner", "fullName profilePicture rating");

        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ GET SINGLE EQUIPMENT
router.get("/:id", async (req, res) => {
    try {
        const item = await Equipment.findById(req.params.id)
            .populate("owner", "fullName profilePicture rating totalBookings");

        if (!item) {
            return res.status(404).json({ error: "Equipment not found" });
        }

        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ ADD NEW EQUIPMENT (Protected)
router.post("/", verifyToken, async (req, res) => {
    try {
        const { name, category, description, pricePerDay, deposit, image } = req.body;

        // Validation
        if (!name || !category || !pricePerDay || !deposit) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const newItem = new Equipment({
            ...req.body,
            owner: req.userId
        });

        await newItem.save();
        await newItem.populate("owner", "fullName profilePicture");

        res.status(201).json({
            message: "Equipment added successfully",
            equipment: newItem
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ UPDATE EQUIPMENT (Protected)
router.put("/:id", verifyToken, async (req, res) => {
    try {
        const item = await Equipment.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ error: "Equipment not found" });
        }

        // Only owner or admin can update
        if (item.owner.toString() !== req.userId && req.userRole !== "admin") {
            return res.status(403).json({ error: "Not authorized to update this equipment" });
        }

        // Update only allowed fields
        const allowedFields = ["name", "category", "description", "pricePerDay", "pricePerWeek", "pricePerMonth",
                              "deposit", "available", "quantity", "size", "color", "brand", "condition"];
        Object.keys(req.body).forEach(key => {
            if (allowedFields.includes(key)) {
                item[key] = req.body[key];
            }
        });

        await item.save();
        await item.populate("owner", "fullName profilePicture");

        res.json({
            message: "Equipment updated successfully",
            equipment: item
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ DELETE EQUIPMENT (Protected)
router.delete("/:id", verifyToken, async (req, res) => {
    try {
        const item = await Equipment.findById(req.params.id);

        if (!item) {
            return res.status(404).json({ error: "Equipment not found" });
        }

        // Only owner or admin can delete
        if (item.owner.toString() !== req.userId) {
            return res.status(403).json({ error: "Not authorized to delete this equipment" });
        }

        await Equipment.findByIdAndDelete(req.params.id);

        res.json({ message: "Equipment deleted successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ✅ GET EQUIPMENT BY CATEGORY
router.get("/category/:category", async (req, res) => {
    try {
        const items = await Equipment.find({ category: req.params.category })
            .populate("owner", "fullName profilePicture rating");

        res.json(items);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
