import express from 'express';
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from 'mongoose';
import { connectToSocket } from './controllers/socketManagers.js';
import cors from 'cors';
import userRoutes from './routes/users.routes.js';

const app = express();
const server = createServer(app);
const io = connectToSocket(server);

app.set("port", process.env.PORT || 8000);

app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

app.use(express.json({ limit: "40kb" }));
app.use(express.urlencoded({ limit: "40kb", extended: true }));

app.use("/api/v1/users", userRoutes);
app.use("/api/v1", userRoutes);

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


