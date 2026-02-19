import express from "express";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Gemini API Proxy Endpoint
  app.post("/api/chat", async (req, res) => {
    const { message, context } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: "API_KEY_MISSING", message: "Server configuration error." });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.0-flash-exp",
        contents: `Context: ${JSON.stringify(context)}\nQuestion: ${message}\nRespond in Korean concisely based on governance.`,
      });

      if (response && response.text) {
        res.json({ text: response.text });
      } else {
        res.status(502).json({ error: "EMPTY_RESPONSE", message: "Model returned an empty response." });
      }
    } catch (error: any) {
      console.error("Gemini Proxy Error:", error);
      const status = error.status || 500;
      res.status(status).json({ 
        error: error.name || "API_ERROR", 
        message: error.message || "An error occurred with the AI service." 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
