import express from "express";
import { config } from "dotenv";
import mongoose from "mongoose";
import foodRoute from "./routes/foodRoute.js";
import orderRoute from "./routes/orderRoute.js";
import { authRouter } from "./controllers/authController.js";
import { adminAuth } from "./middleware/authMiddleware.js";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { Server } from "socket.io";

config();

const app = express();

app.use(cors());

const server = app.listen(process.env.PORT, () =>
  console.log(`Server running on ${process.env.PORT} PORT`)
);

// web sockets code here
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.log('Database connection failed:', error));

app.use(express.json());

app.use("/food", foodRoute);
app.use("/order", orderRoute);
app.use("/auth", authRouter);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

app.use((req, res, next) => {
  req.cloudinary = cloudinary;
  next();
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "images",
    allowedFormats: ["jpeg", "png", "jpg"],
  },
});

const parser = multer({ storage: storage });

app.post("/upload-image", adminAuth, parser.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    if (!req.file.path) {
      throw new Error("File uploaded, but no path available");
    }

    res.json({ secure_url: req.file.path });
  } catch (error) {
    console.error("Error during file upload: ", error);
    res.status(500).send("Internal server error");
  }
});

io.on("connection", (socket) => {
  // console.log("New client connected");

  socket.on("disconnect", () => {
    // console.log("Client disconnected");
  });
});

export { io };
