import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

const foodSchema = z.object({
  name: z.string().trim().min(1),
  weight: z.number().int().positive(),
  calories: z.number().int().nonnegative(),
});

router.use(requireAuth);

// CACHE: GET /api/food/cache/:barcode - pobiera zbuforowane dane produktu po kodzie.
router.get("/cache/:barcode", async (req, res) => {
  const barcode = String(req.params.barcode || "").trim();
  if (!barcode) {
    return res.status(400).json({ message: "Nieprawidłowy barcode" });
  }

  const cached = await prisma.cachedProduct.findUnique({
    where: { barcode },
  });

  if (!cached) {
    return res.status(404).json({ message: "Produkt nie znaleziony w cache" });
  }

  return res.json(cached);
});

// CACHE: POST /api/food/cache - zapisuje/aktualizuje produkt w cache.
router.post("/cache", async (req, res) => {
  const cacheSchema = z.object({
    barcode: z.string().trim().min(1),
    name: z.string().trim().min(1),
    calories: z.number().int().nonnegative(),
    verified: z.boolean().optional(),
  });

  const parsed = cacheSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Nieprawidłowy payload" });
  }

  const { barcode, name, calories, verified = false } = parsed.data;

  const cached = await prisma.cachedProduct.upsert({
    where: { barcode },
    update: { name, calories, verified },
    create: { barcode, name, calories, verified },
  });

  return res.status(201).json(cached);
});

// GET /api/food - Pobiera listę wszystkich wpisów jedzenia użytkownika.
// Co wysyła: tablica wpisów jedzenia (nazwa, waga, kalorie, data).
// Co pobiera: firebaseUid z tokenu (middleware).
// Po co: wyświetlić w aplikacji co użytkownik jadł.
router.get("/", async (req, res) => {
  const food = await prisma.foodEntry.findMany({
    where: { firebaseUid: req.user!.firebaseUid },
    orderBy: { createdAt: "desc" },
  });
  return res.json(food);
});

// POST /api/food - Tworzy nowy wpis jedzenia (dodanie posiłku do dziennika).
// Co wysyła: nowy wpis jedzenia z ID i datą.
// Co pobiera: JSON z name (nazwa), weight (waga), calories (kalorie).
// Po co: użytkownik rejestruje co i ile zjadł.
router.post("/", async (req, res) => {
  const parsed = foodSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const entry = await prisma.foodEntry.create({
    data: {
      firebaseUid: req.user!.firebaseUid,
      ...parsed.data,
    },
  });

  return res.status(201).json(entry);
});

// PUT /api/food/:id - Aktualizuje istniejący wpis jedzenia (zmiana danych).
// Co wysyła: zaktualizowany wpis jedzenia.
// Co pobiera: ID w URL (/:id) i JSON z nowymi danymi (name, weight, calories).
// Po co: użytkownik poprawia błąd lub zmienia dane o posiłku.
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const parsed = foodSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const entry = await prisma.foodEntry.findFirst({
    where: { id, firebaseUid: req.user!.firebaseUid },
  });
  if (!entry) {
    return res.status(404).json({ message: "Entry not found" });
  }

  const updatedEntry = await prisma.foodEntry.update({
    where: { id },
    data: parsed.data,
  });

  return res.json(updatedEntry);
});

// DELETE /api/food/:id - Usuwa wpis jedzenia (kasuje z dziennika).
// Co wysyła: odpowiedź "204 No Content" (nic, ale OK).
// Co pobiera: ID wpisu w URL (/:id).
// Po co: użytkownik chce usunąć błędny lub zbędny wpis.
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const entry = await prisma.foodEntry.findFirst({
    where: { id, firebaseUid: req.user!.firebaseUid },
  });
  if (!entry) {
    return res.status(404).json({ message: "Entry not found" });
  }

  await prisma.foodEntry.delete({ where: { id } });
  return res.status(204).send();
});

router.get("/cache/:barcode", async (req, res) => {
  const barcode = req.params.barcode;
  if (!barcode || barcode.length < 8) {
    return res.status(400).json({ message: "Invalid barcode" });
  }

  const cached = await prisma.cachedProduct.findUnique({ where: { barcode } });
  if (!cached) {
    return res.status(404).json({ message: "Product not in cache" });
  }

  return res.json(cached);
});

const cacheSchema = z.object({
  barcode: z.string().min(8),
  name: z.string().trim().min(1),
  calories: z.number().int().nonnegative(),
});

router.post("/cache", async (req, res) => {
  const parsed = cacheSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid payload", errors: parsed.error.errors });
  }

  const { barcode, name, calories } = parsed.data;
  const existing = await prisma.cachedProduct.findUnique({
    where: { barcode },
  });

  const result = existing
    ? await prisma.cachedProduct.update({
        where: { barcode },
        data: { name, calories, verified: true },
      })
    : await prisma.cachedProduct.create({
        data: { barcode, name, calories, verified: true },
      });

  return res.status(201).json(result);
});

export default router;
