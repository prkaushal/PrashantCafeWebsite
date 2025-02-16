import express from "express";
import Order from "../models/orderModel.js";
import crypto from "crypto";
import { auth, adminAuth } from "../middleware/authMiddleware.js";
import { config } from "dotenv";
import { io } from "../index.js";

config();

const router = express.Router();

// Fetch orders for authenticated user
router.get("/", auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const orders = await Order.find({ user: userId });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch all orders for admin dashboard
router.get("/all", adminAuth, async (req, res) => {
  try {
    const orders = await Order.find();
    res.json(orders);
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Fetch a single order by ID
router.get("/:id", async (req, res) => {
  const order = await Order.findById(req.params.id);
  res.json(order);
});

// Update an existing order
router.put("/:id", auth, async (req, res) => {
  const updateOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
  io.emit("orderUpdated", updateOrder);
  res.json(updateOrder);
});

// Delete an order (admin only)
router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }
    io.emit("orderDeleted", deletedOrder);
    res.json(deletedOrder);
  } catch (error) {
    console.error("Error deleting order:", error.message);
    res.status(500).json({ message: "Error deleting order: " + error.message });
  }
});

// Create a new order 
router.post("/", auth, async (req, res) => {
  const { user, items, seatNumber, userName, totalPrice } = req.body;

  if (!seatNumber || !userName ) {
    return res.status(400).json({ message: "Seat number and userName are required." });
  }

  try {
    // Generate a unique orderId
    const orderId = crypto.createHash("sha256")
      .update(JSON.stringify({ user, items, seatNumber, userName, totalPrice, time: Date.now() }))
      .digest("hex");

    const order = new Order({
      orderId,
      items,
      seatNumber,
      userName,
      totalPrice,
      user,
      
    });

    await order.save();
    io.emit("orderCreated", order);
    return res.status(201).json({ 
      message: "Order placed successfully",
      order 
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return res.status(500).json({ message: "Order creation failed: " + error.message });
  }
});


export default router;
