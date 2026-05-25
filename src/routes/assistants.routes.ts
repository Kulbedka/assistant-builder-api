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