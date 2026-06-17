import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const assistantId = Number(req.query.assistantId);
    const userId = (req as any).user.userId;

    if (!Number.isInteger(assistantId) || assistantId <= 0) {
      return res.status(400).json({ error: "assistantId is required" });
    }

    const assistant = await prisma.assistant.findFirst({
      where: {
        id: assistantId,
        ownerId: userId,
      },
    });

    if (!assistant) {
      return res.status(404).json({ error: "Assistant not found" });
    }

    const chats = await prisma.chat.findMany({
      where: {
        assistantId,
        ownerId: userId,
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

router.post("/", requireAuth, async (req, res) => {
  try {
    const { assistantId, title } = req.body;
    const userId = (req as any).user.userId;
    const parsedAssistantId = Number(assistantId);

    if (!Number.isInteger(parsedAssistantId) || parsedAssistantId <= 0) {
      return res.status(400).json({ error: "assistantId is required" });
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

    const chat = await prisma.chat.create({
      data: {
        assistantId: parsedAssistantId,
        ownerId: userId,
        title: title || "New chat",
      },
    });

    return res.status(201).json(chat);
  } catch (error) {
    console.error("Create chat error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/:id/duplicate", requireAuth, async (req, res) => {
  try {
    const chatId = Number(req.params.id);
    const userId = (req as any).user.userId;

    if (!Number.isInteger(chatId) || chatId <= 0) {
      return res.status(400).json({ error: "Invalid chat id" });
    }

    const existingChat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        ownerId: userId,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!existingChat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const duplicatedChat = await prisma.chat.create({
      data: {
        assistantId: existingChat.assistantId,
        ownerId: userId,
        title: `${existingChat.title} copy`,
        messages: {
          create: existingChat.messages.map((message) => ({
            role: message.role,
            text: message.text,
            assistantId: message.assistantId,
          })),
        },
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    return res.status(201).json(duplicatedChat);
  } catch (error) {
    console.error("Duplicate chat error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/:id", requireAuth, async (req, res) => {
  try {
    const chatId = Number(req.params.id);
    const { title } = req.body;
    const userId = (req as any).user.userId;

    if (!Number.isInteger(chatId) || chatId <= 0) {
      return res.status(400).json({ error: "Invalid chat id" });
    }

    if (!title || typeof title !== "string") {
      return res.status(400).json({ error: "Title is required" });
    }

    const existingChat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        ownerId: userId,
      },
    });

    if (!existingChat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const updatedChat = await prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        title,
      },
    });

    return res.json(updatedChat);
  } catch (error) {
    console.error("Update chat error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const chatId = Number(req.params.id);
    const userId = (req as any).user.userId;

    if (!Number.isInteger(chatId) || chatId <= 0) {
      return res.status(400).json({ error: "Invalid chat id" });
    }

    const existingChat = await prisma.chat.findFirst({
      where: {
        id: chatId,
        ownerId: userId,
      },
    });

    if (!existingChat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    await prisma.chat.delete({
      where: {
        id: chatId,
      },
    });

    return res.json({ message: "Chat deleted successfully" });
  } catch (error) {
    console.error("Delete chat error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;