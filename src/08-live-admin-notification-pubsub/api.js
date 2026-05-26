import Redis from "ioredis";
import express from "express";

const PORT = process.env.PORT || 3000;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const END_POINT = `http://localhost:${PORT}`;

const app = express();
app.use(express.json());
const publisher = new Redis(REDIS_URL);

app.post("/notifications", async (req, res) => {
  const payload = {
    title: req.body.title || "Default Title",
    body: req.body.body || "Default Title",
    createdAt: new Date().toISOString(),
  };

  const receivers = await publisher.publish(
    "notifications",
    JSON.stringify(payload),
  );

  res.json({ message: `Notification sent to ${receivers} subscribers` });
});

app.listen(PORT, () => {
  console.log(`Server is running on ${END_POINT}`);
});
