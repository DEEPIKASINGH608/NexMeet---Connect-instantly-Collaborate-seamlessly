import express from 'express';
import { createServer } from "node:http";
import mongoose from 'mongoose';
import { connectToSocket } from './controllers/socketManagers.js';
import userRouter from './routes/users.routes.js';

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8000);

app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://nexmeetfrontend-23jc.onrender.com"
  ];

  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://nexmeetfrontend-23jc.onrender.com');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({ message: "NexMeet Backend API is live" });
});

app.use("/api/v1/users", userRouter);
app.use("/api/v1", userRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const start = async () => {
  try {
    const mongoUri = process.env.MONGO_URL || "mongodb+srv://ds0648775_db_user:Dkzq97tp@cluster0.msvxmyb.mongodb.net/";
    const connectionDb = await mongoose.connect(mongoUri);
    console.log(`MONGO connected DB Host: ${connectionDb.connection.host}`);
  } catch (error) {
    console.error("MongoDB Connection Failed:", error.message);
  }

  server.listen(app.get("port"), () => {
    console.log(`Listening on port ${app.get("port")}`);
  });
};

start();