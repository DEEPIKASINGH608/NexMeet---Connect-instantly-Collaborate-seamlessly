import express from 'express';
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from 'mongoose';
import { connectToSocket } from './controllers/socketManagers.js';
import cors from 'cors';
import userRouter from './routes/users.routes.js';

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8000);


  const allowedOrigins = [
    "http://localhost:5173",
    "https://nexmeetbackend-g4wl.onrender.com"
  , process.env.CLIENT_URL].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
};

app.use(cors(corsOptions));

app.options('*', cors(corsOptions));
app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRouter);
app.use("/api/v1", userRouter);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

const start = async () => {
  try {
  const connectionDb = await mongoose.connect(
    "mongodb+srv://ds0648775_db_user:Dkzq97tp@cluster0.msvxmyb.mongodb.net/"
  );

  console.log(`MONGO connected DB Host: ${connectionDb.connection.host}`);
} catch (error) {
        console.error("MongoDB Connection Failed:", error.message);
    }

    server.listen(app.get("port"), () => {
        console.log(`Listening on port ${app.get("port")}`);
    });
};

start();


