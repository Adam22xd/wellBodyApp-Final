import { Router } from "express";
import { prisma } from "../db/prisma";
import { requireAuth } from "../middleware/auth";

const router = Router();

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
      createdAt: true,
    },
  });

  return res.json({ user });
});

export default router;
