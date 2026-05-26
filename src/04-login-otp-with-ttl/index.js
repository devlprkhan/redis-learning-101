import Redis from "ioredis";
import express from "express";

const PORT = process.env.PORT || 3000;
const REDIS_URL = process.env.REDIS_URL || "redis://localhost:6379";
const END_POINT = `http://localhost:${PORT}`;

const app = express();
app.use(express.json());
const redis = new Redis(REDIS_URL);

function otpKey(phone) {
  return `otp:${phone}`;
}

app.post("/otp", async (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  await redis.set(otpKey(phone), otp, "EX", 30); // OTP Valid for 30 Sec
  res.json({ message: "OTP sent", otp }); // In real application, sent OTP via SMS
});

app.post("/otp/verify", async (req, res) => {
  const { phone, otp } = req.body;
  const savedOtp = await redis.get(otpKey(phone));

  if (!savedOtp)
    return res.status(400).json({ message: "OTP expired or not found" });
  if (savedOtp !== otp) return res.status(400).json({ message: "Invalid OTP" });

  await redis.del(otpKey(phone));
  res.json({ message: "OTP verified successfully" });
});

app.get("/otp/:phone/ttl", async (req, res) => {
  const ttl = await redis.ttl(otpKey(req.params.phone));
  res.json({ ttl });
});

app.listen(PORT, () => {
  console.log(`Server is running on ${END_POINT}`);
});
