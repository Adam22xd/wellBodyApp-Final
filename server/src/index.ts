import express from "express";
import cors from "cors";
import { env } from "./config/env";
import authRoutes from "./routes/auth.routes";
import foodRoutes from "./routes/food.routes";
import waterRoutes from "./routes/water.routes";

const app = express();

app.use(cors());
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
