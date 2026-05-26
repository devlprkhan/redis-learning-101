import Redis from "ioredis";
import express from "express";

const PORT = process.env.PORT || 3000;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const END_POINT = `http://localhost:${PORT}`;

const app = express();
app.use(express.json());
const redis = new Redis(REDIS_URL);

function postsKey(postId) {
  return `post:${postId}`;
}

// Increment view count of post
app.post("/post/:id/view", async (req, res) => {
  const views = await redis.incr(postsKey(req.params.id));
  res.json({ postViews: parseInt(views) });
});

// Get view count without incrementing
app.get("/post/:id/view", async (req, res) => {
  const views = (await redis.get(postsKey(req.params.id))) || 0;
  res.json({ postViews: views });
});

// Add points to a user score, values accepted in body are(userid, points)
app.post("/leaderboard/score", async (req, res) => {
  const { userId, points } = req.body;
  const totalPoints = await redis.zincrby("leaderboard", points, userId);

  res.json({ user: userId, totalPoints });
});

// Get top 10 leaders
app.get("/leaderboard", async (req, res) => {
  // ZREVRANGE = get highest scores first (reverse order)
  const topLeaders = await redis.zrevrange("leaderboard", 0, 9, "WITHSCORES");

  // Format: ["player1", "1500", "player2", "1200", ...]
  const leaderboard = [];
  for (let i = 0; i < topLeaders.length; i += 2) {
    leaderboard.push({
      rank: i / 2 + 1,
      player: topLeaders[i],
      score: parseInt(topLeaders[i + 1]),
    });
  }

  res.json(leaderboard);
});

// Get a rank of user
app.get("/leaderboard/:uid/rank", async (req, res) => {
  const { uid } = req.params;

  // Get rank (0-based, so add 1)
  const rank = await redis.zrevrank("leaderboard", uid);
  const score = await redis.zscore("leaderboard", uid);

  if (rank === null) {
    res.json({ player: uid, rank: null, score: 0 });
  } else {
    res.json({ player: uid, rank: rank + 1, score: parseInt(score) });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on ${END_POINT}`);
});
