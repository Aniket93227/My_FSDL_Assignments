const express = require("express");
const router = express.Router();
const Trip = require("../models/Trip");

// GET
router.get("/", async (req, res) => {
    const trips = await Trip.find();
    res.json(trips);
});

// POST
router.post("/", async (req, res) => {
    const trip = new Trip(req.body);
    await trip.save();
    res.json(trip);
});

// DELETE
router.delete("/:id", async (req, res) => {
    await Trip.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

module.exports = router;