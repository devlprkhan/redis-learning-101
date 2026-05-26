import Redis from "ioredis";
import express from "express";

const PORT = process.env.PORT || 3000;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const END_POINT = `http://localhost:${PORT}`;

const app = express();
app.use(express.json());
const redis = new Redis(REDIS_URL);

app.post("/user/:id/json", async (req, res) => {
  await redis.set(`user:${req.params.id}:json`, JSON.stringify(req.body));
  res.json({ savedAs: "json" });
});

app.get("/user/:id/json", async (req, res) => {
  const raw = await redis.get(`user:${req.params.id}:json`);
  res.json({ user: raw ? JSON.parse(raw) : null });
});

app.post("/user/:id/hash", async (req, res) => {
  await redis.hset(`user:${req.params.id}:hash`, req.body);
  res.json({ savedAs: "hash" });
});

app.get("/user/:id/hash", async (req, res) => {
  const user = await redis.hgetall(`user:${req.params.id}:hash`);
  res.json({ user });
});

app.patch("/user/:id/hash/email", async (req, res) => {
  const { email } = req.body;

  // Directly update ONLY the email field - no GET needed!
  const updated = await redis.hset(`user:${req.params.id}:hash`, { email });

  res.json({
    message: "Email updated (hash field only)",
    fieldsUpdated: updated,
    note: "Only email field was modified",
  });
});

app.patch("/user/:id/hash/update", async (req, res) => {
  const updates = req.body; // e.g., { email: "new@email.com", age: 31 }

  // Update multiple fields in one command without affecting others
  const updated = await redis.hset(`user:${req.params.id}:hash`, updates);

  res.json({
    message: "Specific fields updated",
    updatedFields: Object.keys(updates),
    fieldsUpdatedCount: updated,
  });
});

app.post("/user/:id/hash/increment-login", async (req, res) => {
  const newCount = await redis.hincrby(
    `user:${req.params.id}:hash`,
    "loginCount",
    1,
  );

  res.json({
    message: "Login count incremented",
    loginCount: newCount,
    note: "Only loginCount field was modified",
  });
});

app.get("/user/:id/hash/check-field", async (req, res) => {
  const { field } = req.query;
  const exists = await redis.hexists(`user:${req.params.id}:hash`, field);

  res.json({
    field,
    exists,
    note: "Checked without loading entire user object",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on ${END_POINT}`);
});
