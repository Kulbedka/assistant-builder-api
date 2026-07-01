import { prisma } from "../lib/prisma";

type CreateMessageForUserInput = {
  userId: number;
  assistantId: unknown;
  chatId: unknown;
  role: unknown;
  text: unknown;
};

export class MessageServiceError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "MessageServiceError";
  }
}

export async function createMessageForUser(input: CreateMessageForUserInput) {
  const parsedAssistantId = Number(input.assistantId);
  const parsedChatId = Number(input.chatId);

  if (
    !Number.isInteger(parsedAssistantId) ||
    parsedAssistantId <= 0 ||
    !Number.isInteger(parsedChatId) ||
    parsedChatId <= 0 ||
    !input.role ||
    !input.text
  ) {
    throw new MessageServiceError(
      400,
      "assistantId, chatId, role and text are required",
    );
  }

  const assistant = await prisma.assistant.findFirst({
    where: {
      id: parsedAssistantId,
      ownerId: input.userId,
    },
  });

  if (!assistant) {
    throw new MessageServiceError(404, "Assistant not found");
  }

  const chat = await prisma.chat.findFirst({
    where: {
      id: parsedChatId,
      assistantId: parsedAssistantId,
      ownerId: input.userId,
    },
  });

  if (!chat) {
    throw new MessageServiceError(404, "Chat not found");
  }

  return prisma.message.create({
    data: {
      assistantId: parsedAssistantId,
      chatId: parsedChatId,
      role: input.role as string,
      text: input.text as string,
    },
  });
}
