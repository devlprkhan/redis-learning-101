import Redis from "ioredis";
import express from "express";

const PORT = process.env.PORT || 3000;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const END_POINT = `http://localhost:${PORT}`;
const QUEUE_KEY = "queue:emails";

const app = express();
app.use(express.json());
const redis = new Redis(REDIS_URL);

app.post("/emails", async (req, res) => {
  const job = {
    to: req.body.to,
    subject: req.body.subject || "No Subject",
    body: req.body.body || "No content",
    createdAt: new Date().toISOString(),
  };

  await redis.lpush(QUEUE_KEY, JSON.stringify(job));
  // Get the current queue length
  const queueLength = await redis.llen(QUEUE_KEY);
  res.json({ queued: true, job, queueLength });
});

app.get("/emails/process-one", async (req, res) => {
  const rawJob = await redis.rpop(QUEUE_KEY);
  if (!rawJob) {
    const queueLength = await redis.llen(QUEUE_KEY);
    return res.json({ message: "No jobs in queue", queueLength });
  }

  const job = JSON.parse(rawJob);
  const queueLength = await redis.llen(QUEUE_KEY);

  res.json({ message: "Email sent", job, remainingJobs: queueLength });
});

app.listen(PORT, () => {
  console.log(`Server is running on ${END_POINT}`);
});
