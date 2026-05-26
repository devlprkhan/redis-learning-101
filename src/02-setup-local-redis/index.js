import express, { json } from "express";
import Redis from "ioredis";
import mongoose from "mongoose";

const app = express();
app.use(express.json());

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
const MONGO_DB_URL =
  process.env.MONGO_URL || "mongodb://localhost:27017/mongo_learning_db";

app.get("/redis", async (req, res) => {
  const reply = await redis.ping();
  res.json({ redis: reply });
});

app.get("/mongo", async (req, res) => {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGO_DB_URL);
  }

  res.json({ mongo: "connected", database: mongoose.connection.name });
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
