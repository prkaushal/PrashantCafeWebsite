import express from "express";
import { config } from "dotenv";
import mongoose from "mongoose";
import foodRoute from "./routes/foodRoute.js";
import orderRoute from "./routes/orderRoute.js";
import { authRouter } from "./controllers/authController.js";
import { auth } from "./middleware/authMiddleware.js";
import cors from "cors";
import User from "./models/user.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { WebSocketServer } from 'ws';


config();

const app = express();

app.use(cors());

const server = app.listen(process.env.PORT, () => console.log(`Server running on ${process.env.PORT} PORT`));
const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
    console.log('Client connected');
  
    ws.on('message', (message) => {
      const { orderId, action } = JSON.parse(message);
      if (action === 'startTimer') {
        startOrderTimer(orderId, ws);
      }
    });
  
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });


  const startOrderTimer = (orderId, ws) => {
    let timeLeft = 600; // 10 minutes in seconds
  
    const interval = setInterval(() => {
      if (timeLeft <= 0) {
        clearInterval(interval);
        ws.send(JSON.stringify({ orderId, timeLeft: 0 }));
      } else {
        timeLeft -= 1;
        ws.send(JSON.stringify({ orderId, timeLeft }));
      }
    }, 1000);
  };

mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log('Database is connected'))
    .catch((error) => console.log(error));


app.use(express.json());


app.use('/food', foodRoute);
app.use('/order', orderRoute);
app.use('/auth', authRouter);



cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use((req, res, next) => {
    req.cloudinary = cloudinary;
    next();
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'images',
        allowedFormats: ['jpeg', 'png', 'jpg'],
    }
});


const parser = multer({ storage: storage });

   


app.post('/upload-image', auth, parser.single('file'), (req, res) => {
        if (!req.file) {
            return res.status(400).send('No file uploaded.');
        }

        try {
            if (!req.file.path) {
                throw new Error('File uploaded, but no path available');
            }

            res.json({ secure_url: req.file.path });
        } catch (error) {
            console.error('Error during file upload: ', error);
            res.status(500).send('Internal server error');
        }
});

app.get('/userProfile', auth, async (req, res) => {
    try {

        const user = await User.findById(req.user.id).select('-password')
        if (!user) {
            return res.status(404).json({ msg: 'User not found'});
        }

        res.json(user);

    } catch (error) {
        console.error(error);
        res.status(500).send('Server error');
    }
});

