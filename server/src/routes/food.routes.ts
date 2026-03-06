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

router.get("/", async (req, res) => {
  const food = await prisma.foodEntry.findMany({
    where: { firebaseUid: req.user!.firebaseUid },
    orderBy: { createdAt: "desc" },
  });
  return res.json(food);
});

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

export default router;
