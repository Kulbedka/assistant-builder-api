import { Router } from "express";
import { prisma } from "../lib/prisma";
import { requireAuth, type AuthRequest } from "../middleware/requireAuth";

export const assistantsRouter = Router();

assistantsRouter.use(requireAuth);

assistantsRouter.get("/", async (req, res) => {
  try {
    const userId = (req as AuthRequest).user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const assistants = await prisma.assistant.findMany({
      where: {
        ownerId: userId,
      },
      orderBy: {
        id: "asc",
      },
    });

    res.json(assistants);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to load assistants",
    });
  }
});

assistantsRouter.get("/:id", async (req, res) => {
  try {
    const assistantId = Number(req.params.id);

    if (Number.isNaN(assistantId)) {
      return res.status(400).json({
        error: "Invalid assistant id",
      });
    }

    const userId = (req as AuthRequest).user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const assistant = await prisma.assistant.findFirst({
      where: {
        id: assistantId,
        ownerId: userId,
      },
    });

    if (!assistant) {
      return res.status(404).json({
        error: "Assistant not found",
      });
    }

    const messages = await prisma.message.findMany({
      where: {
        assistantId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    res.json({
      ...assistant,
      messages,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to load assistant",
    });
  }
});

assistantsRouter.post("/", async (req, res) => {
  try {
    const { name, instruction } = req.body;

    const userId = (req as AuthRequest).user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    if (!name || !instruction) {
      return res.status(400).json({
        error: "name and instruction are required",
      });
    }

    const assistant = await prisma.assistant.create({
      data: {
        name,
        instruction,
        ownerId: userId,
      },
    });

    res.status(201).json(assistant);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Failed to create assistant",
    });
  }
});

assistantsRouter.delete("/:id", async (req, res) => {
  try {
    const assistantId = Number(req.params.id);

    if (Number.isNaN(assistantId)) {
      return res.status(400).json({
        error: "Invalid assistant id",
      });
    }

    const userId = (req as AuthRequest).user?.userId;

    if (!userId) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const assistant = await prisma.assistant.findFirst({
      where: {
        id: assistantId,
        ownerId: userId,
      },
    });

    if (!assistant) {
      return res.status(404).json({
        error: "Assistant not found",
      });
    }

    await prisma.$transaction([
      prisma.message.deleteMany({
        where: {
          assistantId,
        },
      }),
      prisma.chat.deleteMany({
        where: {
          assistantId,
          ownerId: userId,
        },
      }),
      prisma.assistant.deleteMany({
        where: {
          id: assistantId,
          ownerId: userId,
        },
      }),
    ]);

    return res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to delete assistant",
    });
  }
});
