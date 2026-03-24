import { Router } from "express";
import { z } from "zod";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();
const goalsSchema = z.object({
  calorieGoal: z.number().int().nonnegative(),
  waterGoal: z.number().int().nonnegative(),
});

router.use(requireAuth);

// GET /api/auth/me - Pobiera dane zalogowanego użytkownika.
// Co wysyła: dane użytkownika (id, firebaseUid, email, cele kalorii i wody).
// Co pobiera: token w nagłówku Authorization (sprawdzane przez middleware).
// Po co: aplikacja chce wiedzieć, kto jest zalogowany i jakie ma cele.
router.get("/me", async (req, res) => {
  const firebaseUid = req.user!.firebaseUid;
  const email = req.user!.email;

  const user = await prisma.user.upsert({
    where: { firebaseUid },
    update: {
      email: email ?? undefined,
    },
    create: {
      firebaseUid,
      email,
    },
    select: {
      id: true,
      firebaseUid: true,
      email: true,
      calorieGoal: true,
      waterGoal: true,
      createdAt: true,
    },
  });

  return res.json({ user });
});

// PUT /api/auth/goals - Aktualizuje cele użytkownika (kalorie, woda).
// Co wysyła: zaktualizowane dane użytkownika.
// Co pobiera: JSON z calorieGoal i waterGoal z ciała requesta.
// Po co: użytkownik ustawia swoje cele na dzień/tydzień.
router.put("/goals", async (req, res) => {
  const parsed = goalsSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const user = await prisma.user.upsert({
    where: { firebaseUid: req.user!.firebaseUid },
    update: parsed.data,
    create: {
      firebaseUid: req.user!.firebaseUid,
      email: req.user!.email,
      ...parsed.data,
    },
    select: {
      id: true,
      firebaseUid: true,
      email: true,
      calorieGoal: true,
      waterGoal: true,
      createdAt: true,
    },
  });

  return res.json({ user });
});

export default router;
