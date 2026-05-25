import express from "express";
import cors from "cors";
import dotenv from "dotenv";

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

app.listen(port, () => {
  console.log(`API server is running on http://localhost:${port}`);
});
