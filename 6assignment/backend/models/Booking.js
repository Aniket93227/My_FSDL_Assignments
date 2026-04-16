const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    equipmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Equipment",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    rentalStartDate: {
        type: Date,
        required: true
    },
    rentalEndDate: {
        type: Date,
        required: true
    },
    days: {
        type: Number,
        required: true
    },
    pricePerDay: {
        type: Number,
        required: true
    },
    rentCost: {
        type: Number,
        required: true
    },
    depositPaid: {
        type: Number,
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ["pending", "confirmed", "in_use", "returned", "cancelled"],
        default: "pending"
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "completed", "failed"],
        default: "pending"
    },
    paymentId: String,
    returnDate: Date,
    returnCondition: {
        type: String,
        enum: ["excellent", "good", "damaged"],
        default: null
    },
    depositRefunded: {
        type: Boolean,
        default: false
    },
    damageCharge: {
        type: Number,
        default: 0
    },
    notes: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

// Calculate rental duration automatically
bookingSchema.pre("save", function(next) {
    if (this.rentalStartDate && this.rentalEndDate) {
        const start = new Date(this.rentalStartDate);
        const end = new Date(this.rentalEndDate);
        this.days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        this.rentCost = this.days * this.pricePerDay;
        this.totalAmount = this.rentCost + this.depositPaid - (this.depositRefunded ? this.depositPaid : 0) + this.damageCharge;
    }
    next();
});

module.exports = mongoose.model("Booking", bookingSchema);