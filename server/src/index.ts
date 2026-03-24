import express from "express";
import { env } from "./config/env";
import authRoutes from "./routes/auth.routes";
import foodRoutes from "./routes/food.routes";
import waterRoutes from "./routes/water.routes";

const app = express();

// Middleware CORS: pozwala frontendowi (np. z telefonu) łączyć się z serwerem.
// Sprawdza, skąd przyszedł request (req), ustawia nagłówki w odpowiedzi (res), żeby przeglądarka nie blokowała.
// Wysyła: nagłówki pozwalające na dostęp (np. "Access-Control-Allow-Origin").
// Pobiera: origin z requesta.
// Po co: bezpieczeństwo, żeby inne strony mogły korzystać z API.
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  } else {
    res.setHeader("Access-Control-Allow-Origin", "*");
  }

  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});

// Middleware express.json(): tłumaczy dane JSON z requesta na obiekt JavaScript.
// Wysyła: nic (tylko przetwarza dane).
// Pobiera: ciało requesta w JSON.
// Po co: żeby rozumieć dane wysyłane przez frontend (np. formularze).
app.use(express.json());

// Route GET /health: prosty test, czy serwer działa.
// Wysyła: odpowiedź JSON { ok: true }.
// Pobiera: nic (ignoruje request).
// Po co: do sprawdzania statusu serwera przez inne systemy.
app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

// Mounting routes: dodaje "menu" dla różnych części API.
// Wysyła: przekierowuje requesty do odpowiednich plików routes.
// Pobiera: requesty na /api/auth, /api/food, /api/water.
// Po co: organizuje kod, żeby każdy temat (auth, food, water) miał swój plik.
app.use("/api/auth", authRoutes);
app.use("/api/food", foodRoutes);
app.use("/api/water", waterRoutes);

// app.listen: uruchamia serwer na danym porcie.
// Wysyła: wiadomość w konsoli.
// Pobiera: port z env.
// Po co: startuje serwer, żeby mógł przyjmować requesty.
app.listen(env.port, () => {
  console.log(`API running on http://localhost:${env.port}`);
});
