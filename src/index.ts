import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma";

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "assistant-builder-api",
  });
});

app.get("/api/assistants", async (req, res) => {
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

app.listen(port, () => {
  console.log(`API server is running on http://localhost:${port}`);
});
