import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
    orderId: {
        type: String,
        required: true,
        unique: true
    },
    items: [{
        name: String,
        quantity: Number
    }],
    seatNumber: {
        type: Number,
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    totalPrice : {
        type: Number,
        required: true
    }
}, { timestamps: true })

export default mongoose.model('Order', orderSchema);