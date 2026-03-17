import { useState, useRef, useEffect } from "react";

const QUICK_TOPICS = [
  { label: "Mota para iniciante", msg: "Que mota devo comprar para iniciante em Portugal?" },
  { label: "Trail até 10k€", msg: "Quais as melhores motas trail até 10.000€?" },
  { label: "Peças originais", msg: "Como identificar peças originais vs réplica?" },
  { label: "Preços PT", msg: "Qual o preço médio de uma Honda CB500F usada em Portugal?" },
  { label: "Naked urbana", msg: "Quais as melhores naked para uso diário na cidade?" },
  { label: "Mudança de óleo", msg: "Como fazer a mudança de óleo da minha mota? Que óleo usar?" },
  { label: "Barulho estranho", msg: "A minha mota está a fazer um barulho estranho no motor. Como diagnostico?" },
  { label: "Luz de avaria", msg: "Acendeu uma luz de avaria na minha moto. O que pode ser?" },
];

function formatText(text) {
  const lines = text.split("\n");
  return lines.map((line, i) => {
    const isBullet = line.trim().startsWith("- ") || line.trim().startsWith("• ");
    const content = isBullet ? line.trim().slice(2) : line;
    const parts = content.split(/(\*\*.*?\*\*)/g).map((part, j) =>
      part.startsWith("**") && part.endsWith("**")
        ? <strong key={j} style={{ color: "inherit", fontWeight: 700 }}>{part.slice(2, -2)}</strong>
        : part
    );
    if (isBullet) return <li key={i} style={{ marginBottom: 4, marginLeft: 16 }}>{parts}</li>;
    if (line.trim() === "") return <br key={i} />;
    return <span key={i}>{parts}{"\n"}</span>;
  });
}

export default function MotoHubChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const messagesEnd = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const newHistory = [...history, { role: "user", content: msg }];
    setHistory(newHistory);
    setMessages((prev) => [...prev, { role: "user", text: msg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newHistory }),
      });
      const data = await res.json();
      const reply = data.reply || "Desculpa, ocorreu um erro.";
      setHistory((h) => [...h, { role: "assistant", content: reply }]);
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: "bot", text: "Erro de ligação. Tenta novamente." }]);
    }
    setLoading(false);
  };

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const autoResize = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  return (
    <div style={{
      background: "#0a0a0a",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      fontFamily: "'Barlow', 'Segoe UI', sans-serif",
      backgroundImage: "linear-gradient(rgba(255,69,0,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,69,0,0.03) 1px, transparent 1px)",
      backgroundSize: "40px 40px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;900&family=Barlow:wght@300;400;500&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #222; border-radius: 2px; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.3; } }
        @keyframes bounce { 0%,80%,100% { transform:translateY(0); opacity:0.4; } 40% { transform:translateY(-6px); opacity:1; } }
        .msg-anim { animation: fadeUp 0.3s ease; }
        .chip:hover { border-color: #ff4500 !important; color: #ff4500 !important; background: rgba(255,69,0,0.08) !important; }
        .send-btn:hover:not(:disabled) { transform: scale(1.07); box-shadow: 0 0 22px rgba(255,69,0,0.5) !important; }
        .send-btn:disabled { opacity: 0.35; cursor: not-allowed; }
        textarea:focus { outline: none; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 760, height: "100vh", display: "flex", flexDirection: "column", padding: "0 16px" }}>

        <div style={{ padding: "18px 0 14px", display: "flex", alignItems: "center", gap: 14, borderBottom: "1px solid #1e1e1e", flexShrink: 0 }}>
          <div style={{ width: 46, height: 46, borderRadius: 11, background: "linear-gradient(135deg, #ff4500, #ff6a00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, boxShadow: "0 0 20px rgba(255,69,0,0.25)", flexShrink: 0 }}>🏍</div>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 22, letterSpacing: 2, textTransform: "uppercase", color: "#fff", lineHeight: 1 }}>MotoHub AI</div>
            <div style={{ fontSize: 11, color: "#ff4500", letterSpacing: 3, textTransform: "uppercase", fontWeight: 600, marginTop: 2 }}>Assistente de Motas PT</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 7, fontSize: 11, color: "#555", letterSpacing: 1, textTransform: "uppercase" }}>
            <div style={{ width: 7, height: 7, background: "#22c55e", borderRadius: "50%", animation: "pulse 2s infinite" }} />
            Online
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, padding: "12px 0", overflowX: "auto", flexShrink: 0, scrollbarWidth: "none" }}>
          {QUICK_TOPICS.map((t) => (
            <button key={t.label} className="chip" onClick={() => sendMessage(t.msg)} style={{
              flexShrink: 0, padding: "6px 13px", border: "1px solid #222", borderRadius: 4,
              fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              letterSpacing: 1, textTransform: "uppercase", color: "#666",
              cursor: "pointer", background: "transparent", whiteSpace: "nowrap", transition: "all 0.2s"
            }}>{t.label}</button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: "auto", paddingBottom: 16, display: "flex", flexDirection: "column", gap: 14 }}>
          <div className="msg-anim" style={{ display: "flex", gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg,#ff4500,#ff6a00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, marginTop: 2 }}>🏍</div>
            <div style={{ background: "#111", border: "1px solid #1e1e1e", borderLeft: "3px solid #ff4500", borderRadius: 12, borderTopLeftRadius: 4, padding: "14px 18px", maxWidth: "82%" }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 18, letterSpacing: 1, textTransform: "uppercase", color: "#fff", marginBottom: 8 }}>Bem-vindo ao MotoHub AI</div>
              <div style={{ fontSize: 14, color: "#888", lineHeight: 1.65 }}>Sou o teu especialista em motas para o mercado português. Posso ajudar-te com recomendações por perfil, identificação de peças, preços atuais em Portugal, e diagnóstico mecânico.</div>
              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                {["Recomendações", "Peças", "Preços PT", "Mecânico"].map(tag => (
                  <span key={tag} style={{ padding: "3px 10px", background: "rgba(255,69,0,0.1)", border: "1px solid rgba(255,69,0,0.3)", borderRadius: 4, fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#ff4500" }}>{tag}</span>
                ))}
              </div>
            </div>
          </div>

          {messages.map((m, i) => (
            <div key={i} className="msg-anim" style={{ display: "flex", gap: 12, flexDirection: m.role === "user" ? "row-reverse" : "row" }}>
              <div style={{
                width: 34, height: 34, borderRadius: 8, flexShrink: 0, marginTop: 2,
                display: "flex", alignItems: "center", justifyContent: "center",
                ...(m.role === "bot"
                  ? { background: "linear-gradient(135deg,#ff4500,#ff6a00)", fontSize: 16 }
                  : { background: "#181818", border: "1px solid #222", fontSize: 12, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: "#555" })
              }}>{m.role === "bot" ? "🏍" : "TU"}</div>
              <div style={{
                maxWidth: "78%", padding: "11px 15px", borderRadius: 12, fontSize: 14.5, lineHeight: 1.65,
                ...(m.role === "bot"
                  ? { background: "#111", border: "1px solid #1e1e1e", borderTopLeftRadius: 4, color: "#e0e0e0" }
                  : { background: "linear-gradient(135deg,#c43500,#ff4500)", borderTopRightRadius: 4, color: "#fff" })
              }}>
                <ul style={{ listStyle: "disc", padding: 0, margin: 0 }}>{formatText(m.text)}</ul>
              </div>
            </div>
          ))}

          {loading && (
            <div className="msg-anim" style={{ display: "flex", gap: 12 }}>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: "linear-gradient(135deg,#ff4500,#ff6a00)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0, marginTop: 2 }}>🏍</div>
              <div style={{ background: "#111", border: "1px solid #1e1e1e", borderRadius: 12, borderTopLeftRadius: 4, padding: "14px 18px", display: "flex", gap: 5, alignItems: "center" }}>
                {[0, 0.2, 0.4].map((d, i) => (
                  <div key={i} style={{ width: 7, height: 7, background: "#ff4500", borderRadius: "50%", animation: `bounce 1.2s ${d}s infinite` }} />
                ))}
              </div>
            </div>
          )}
          <div ref={messagesEnd} />
        </div>

        <div style={{ padding: "12px 0 20px", borderTop: "1px solid #1e1e1e", flexShrink: 0 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-end", background: "#111", border: "1px solid #222", borderRadius: 10, padding: "10px 12px" }}>
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => { setInput(e.target.value); autoResize(e); }}
              onKeyDown={handleKey}
              placeholder="Pergunta sobre motas, peças, mecânica..."
              rows={1}
              style={{ flex: 1, background: "transparent", border: "none", color: "#e0e0e0", fontFamily: "'Barlow', sans-serif", fontSize: 14.5, resize: "none", minHeight: 24, maxHeight: 120, lineHeight: 1.5 }}
            />
            <button
              className="send-btn"
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{ width: 36, height: 36, background: "linear-gradient(135deg,#ff4500,#ff6a00)", border: "none", borderRadius: 8, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s", boxShadow: "0 0 14px rgba(255,69,0,0.3)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M2 21l21-9L2 3v7l15 2-15 2z" /></svg>
            </button>
          </div>
          <div style={{ textAlign: "center", fontSize: 11, color: "#444", marginTop: 9 }}>MotoHub AI — especializado no mercado PT</div>
        </div>
      </div>
    </div>
  );
