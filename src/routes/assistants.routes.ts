import { Router } from "express";
import { prisma } from "../lib/prisma";

export const assistantsRouter = Router();

assistantsRouter.get("/", async (_req, res) => {
  try {
    const assistants = await prisma.assistant.findMany({
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

    const assistant = await prisma.assistant.findUnique({
      where: {
        id: assistantId,
      },
    });

    if (!assistant) {
      return res.status(404).json({
        error: "Assistant not found",
      });
    }

    res.json(assistant);
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

    if (!name || !instruction) {
      return res.status(400).json({
        error: "name and instruction are required",
      });
    }

    const assistant = await prisma.assistant.create({
      data: {
        name,
        instruction,
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