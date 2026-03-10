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
