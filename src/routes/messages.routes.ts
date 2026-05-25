import { Router } from "express";
import { prisma } from "../lib/prisma";

export const messagesRouter = Router();

messagesRouter.post("/", async (req, res) => {
  try {
    const { assistantId, role, text } = req.body;

    if (!assistantId || !role || !text) {
      return res.status(400).json({
        error: "assistantId, role and text are required",
      });
    }

    const message = await prisma.message.create({
      data: {
        assistantId,
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