import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import { assistantsRouter } from "./routes/assistants.routes";
import { messagesRouter } from "./routes/messages.routes";
import authRouter from "./routes/auth.routes.js";


dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "assistant-builder-api",
  });
});

app.use("/api/assistants", assistantsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/auth", authRouter);

app.listen(port, () => {
  console.log(`API server is running on http://localhost:${port}`);
});