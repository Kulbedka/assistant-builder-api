import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const assistantId = Number(req.query.assistantId);

    if (!assistantId) {
      return res.status(400).json({ error: "assistantId is required" });
    }

    const chats = await prisma.chat.findMany({
      where: {
        assistantId,
      },
      orderBy: {
        updatedAt: "desc",
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    return res.json(chats);
  } catch (error) {
    console.error("Get chats error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { assistantId, title } = req.body;

    if (!assistantId) {
      return res.status(400).json({ error: "assistantId is required" });
    }

    const chat = await prisma.chat.create({
      data: {
        assistantId: Number(assistantId),
        title: title || "New chat",
      },
    });

    return res.status(201).json(chat);
  } catch (error) {
    console.error("Create chat error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;