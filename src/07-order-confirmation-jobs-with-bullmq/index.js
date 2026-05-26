import Redis from "ioredis";
import express from "express";
import { emailQueue } from "./queue.js";

const PORT = process.env.PORT || 3000;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const END_POINT = `http://localhost:${PORT}`;

const app = express();
app.use(express.json());
const redis = new Redis(REDIS_URL);

app.post("/welcome-email", async (req, res) => {
  const job = await emailQueue.add(
    "send-welcome-email",
    {
      to: req.body.to,
      subject: req.body.subject || "No Subject",
      body: req.body.body || "No content",
      createdAt: new Date().toISOString(),
    },
    { attempts: 3, backoff: { type: "exponential", delay: 1000 } },
  );

  res.json({ message: "Welcome email job added to the queue!", jobId: job.id });
});

app.listen(PORT, () => {
  console.log(`Server is running on ${END_POINT}`);
});
