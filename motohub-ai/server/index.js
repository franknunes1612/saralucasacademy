import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "MotoHub AI API running" });
});

// POST /api/chat — proxy para Groq
app.post("/api/chat", async (req, res) => {
  const { messages } = req.body;

  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "GROQ_API_KEY não definida" });
  }

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Campo 'messages' obrigatório (array)" });
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || "Erro na API Groq" });
    }

    const reply = data.choices?.[0]?.message?.content || "Sem resposta.";
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: "Erro ao contactar a API Groq" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
