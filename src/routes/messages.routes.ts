import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth";
import {
  createMessageForUser,
  MessageServiceError,
} from "../services/messages.service";

export const messagesRouter = Router();

messagesRouter.post("/", requireAuth, async (req, res) => {
  try {
    const { assistantId, chatId, role, text } = req.body;
    const userId = (req as any).user.userId;

    const message = await createMessageForUser({
      userId,
      assistantId,
      chatId,
      role,
      text,
    });

    res.status(201).json(message);
  } catch (error) {
    if (error instanceof MessageServiceError) {
      return res.status(error.statusCode).json({ error: error.message });
    }

    console.error(error);

    res.status(500).json({
      error: "Failed to create message",
    });
  }
});
