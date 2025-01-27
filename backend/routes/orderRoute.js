import express from "express";
import Order from "../models/orderModel.js";
import crypto from "crypto";
import { auth } from "../middleware/authMiddleware.js";
import { config } from "dotenv";
import { io } from "../index.js"; 

config();

const router = express.Router();



//fetching all the orders
router.get('/', async (req, res) => {
    const orders = await Order.find();

    res.json(orders);
})

//fetching a single order by id
router.get('/:id', async (req, res) => {
    const order = await Order.findById(req.params.id);

    res.json(order);
})

//updating an existing order
router.put('/:id', auth, async (req, res) => {
    const updateOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true});
    io.emit('orderUpdated', updateOrder);
    res.json(updateOrder);
})

//delete an order
router.delete('/:id', auth, async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deletedOrder) {
            return res.status(404).json({ message: 'Order not found' });
        }
        io.emit('orderDeleted', deletedOrder);
        res.json(deletedOrder);
    } catch (error) {
        console.error('Error deleting order:', error.message);
        res.status(500).json({ message: 'Error deleting order: ' + error.message });
    }
});

//creating a new order
router.post('/', async (req, res) => {
    const { items, seatNumber, userName, totalPrice } = req.body;

    if (!seatNumber || !userName) {
        return res.status(400).json({ message: 'Seat number and name are required.' });
    }

    const orderId = crypto.createHash('sha256').update(JSON.stringify(req.body)).digest('hex');

        const order = new Order({ orderId,  items, seatNumber, userName , totalPrice });
        try {
            await order.save();
            io.emit('orderCreated', order); // Emit event
           
        } catch (error) {
            console.error('Error saving order: ', error.message);
            return res.status(500).send({ message: 'Error saving order: ' + error.message });
        }

        return res.status(201).json(order);
    
});

export default router;