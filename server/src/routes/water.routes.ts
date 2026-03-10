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

router.get("/", async (req, res) => {
  const water = await prisma.waterEntry.findMany({
    where: { firebaseUid: req.user!.firebaseUid },
    orderBy: { createdAt: "desc" },
  });
  return res.json(water);
});

router.post("/", async (req, res) => {
  const parsed = waterSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: "Invalid payload" });
  }

  const entry = await prisma.waterEntry.create({
    data: {
      firebaseUid: req.user!.firebaseUid,
      ...parsed.data,
    },
  });

  return res.status(201).json(entry);
});

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
