import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

const waterSchema = z.object({
  name: z.string().trim().min(1),
  amount: z.number().int().positive(),
});

router.use(requireAuth);

// GET /api/water - Pobiera listę wszystkich wpisów wody/napojów użytkownika.
// Co wysyła: tablica wpisów (nazwa, ilość, data).
// Co pobiera: firebaseUid z tokenu (middleware).
// Po co: wyświetlić ile użytkownik wypił wody/napojów.
router.get("/", async (req, res) => {
  const water = await prisma.waterEntry.findMany({
    where: { firebaseUid: req.user!.firebaseUid },
    orderBy: { createdAt: "desc" },
  });
  return res.json(water);
});

// POST /api/water - Tworzy nowy wpis wody/napoju (dodanie do dziennika).
// Co wysyła: nowy wpis z ID i datą.
// Co pobiera: JSON z name (nazwa) i amount (ilość).
// Po co: użytkownik rejestruje ile i co wypił.
router.post("/", async (req, res) => {
  const parsed = waterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res
      .status(400)
      .json({ message: "Invalid payload", errors: parsed.error.errors });
  }

  try {
    const entry = await prisma.waterEntry.create({
      data: {
        firebaseUid: req.user!.firebaseUid,
        ...parsed.data,
      },
    });

    return res.status(201).json(entry);
  } catch (error) {
    console.error("Błąd w trasie /water POST:", error);
    return res.status(500).json({
      message: "Wystąpił błąd podczas zapisu napoju.",
      details: error instanceof Error ? error.message : "Unknown",
    });
  }
});

// PUT /api/water/:id - Aktualizuje istniejący wpis wody (zmiana danych).
// Co wysyła: zaktualizowany wpis.
// Co pobiera: ID w URL (/:id) i JSON z nowymi danymi (name, amount).
// Po co: użytkownik zmienia błędne dane o napoju.
router.put("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const parsed = waterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const entry = await prisma.waterEntry.findFirst({
    where: { id, firebaseUid: req.user!.firebaseUid },
  });
  if (!entry) {
    return res.status(404).json({ message: "Entry not found" });
  }

  const updatedEntry = await prisma.waterEntry.update({
    where: { id },
    data: parsed.data,
  });

  return res.json(updatedEntry);
});

// DELETE /api/water/:id - Usuwa wpis wody (kasuje z dziennika).
// Co wysyła: odpowiedź "204 No Content" (nic, ale OK).
// Co pobiera: ID wpisu w URL (/:id).
// Po co: użytkownik chce usunąć błędny wpis o napoju.
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(400).json({ message: "Invalid id" });
  }

  const entry = await prisma.waterEntry.findFirst({
    where: { id, firebaseUid: req.user!.firebaseUid },
  });
  if (!entry) {
    return res.status(404).json({ message: "Entry not found" });
  }

  await prisma.waterEntry.delete({ where: { id } });
  return res.status(204).send();
});

export default router;
