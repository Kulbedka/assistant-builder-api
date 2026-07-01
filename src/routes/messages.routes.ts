import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/requireAuth";

export const messagesRouter = Router();

messagesRouter.post("/", requireAuth, async (req, res) => {
  try {
    const { assistantId, chatId, role, text } = req.body;
    const userId = (req as any).user.userId;
    const parsedAssistantId = Number(assistantId);
    const parsedChatId = Number(chatId);

    if (
      !Number.isInteger(parsedAssistantId) ||
      parsedAssistantId <= 0 ||
      !Number.isInteger(parsedChatId) ||
      parsedChatId <= 0 ||
      !role ||
      !text
    ) {
      return res.status(400).json({
        error: "assistantId, chatId, role and text are required",
      });
    }

    const assistant = await prisma.assistant.findFirst({
      where: {
        id: parsedAssistantId,
        ownerId: userId,
      },
    });

    if (!assistant) {
      return res.status(404).json({ error: "Assistant not found" });
    }

    const chat = await prisma.chat.findFirst({
      where: {
        id: parsedChatId,
        assistantId: parsedAssistantId,
        ownerId: userId,
      },
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const message = await prisma.message.create({
      data: {
        assistantId: parsedAssistantId,
        chatId: parsedChatId,
        role,
        text,
      },
    });

    res.status(201).json(message);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create message",
    });
  }
});
