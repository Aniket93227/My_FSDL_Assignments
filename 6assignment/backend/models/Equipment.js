const mongoose = require("mongoose");

const equipmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please provide equipment name"],
        trim: true
    },
    category: {
        type: String,
        enum: ["cricket", "badminton", "tennis", "cycling", "gym", "water_sports", "other"],
        required: true
    },
    description: {
        type: String,
        maxlength: 500
    },
    image: {
        type: String,
        default: "https://via.placeholder.com/300?text=Sports+Equipment"
    },
    condition: {
        type: String,
        enum: ["excellent", "good", "fair"],
        default: "good"
    },
    pricePerDay: {
        type: Number,
        required: [true, "Please provide price per day"],
        min: 0
    },
    pricePerWeek: {
        type: Number,
        min: 0
    },
    pricePerMonth: {
        type: Number,
        min: 0
    },
    deposit: {
        type: Number,
        required: [true, "Please provide deposit amount"],
        min: 0
    },
    available: {
        type: Boolean,
        default: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    booked: {
        type: Number,
        default: 0
    },
    size: String, // S, M, L, XL
    color: String,
    brand: String,
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Index for search and filtering
equipmentSchema.index({ name: "text", description: "text", category: 1 });

module.exports = mongoose.model("Equipment", equipmentSchema);