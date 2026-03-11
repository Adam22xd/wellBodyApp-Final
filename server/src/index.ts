import express from "express";
import cors from "cors";
import { env } from "./config/env";
import authRoutes from "./routes/auth.routes";
import foodRoutes from "./routes/food.routes";
import waterRoutes from "./routes/water.routes";

const app = express();
const allowedOriginPatterns = [
  /^https:\/\/well-body-app\.onrender\.com$/,
  /^http:\/\/localhost:\d+$/,
  /^http:\/\/127\.0\.0\.1:\d+$/,
];

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOriginPatterns.some((pattern) => pattern.test(origin))
      ) {
        callback(null, true);
        return;
      }

      callback(new Error(`Blocked by CORS: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/water", waterRoutes);

app.listen(env.port, () => {
  console.log(`API running on http://localhost:${env.port}`);
});
