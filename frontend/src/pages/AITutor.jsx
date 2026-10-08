import React, { useEffect, useRef, useState } from "react";
import AppLayout from "../components/AppLayout";
import { API_BASE_URL } from "../api/config";
import {
  Sparkles,
  Send,
  Trash2,
  Copy,
  Check,
  Bot,
  User,
  Zap,
  Code2,
  Lightbulb,
  BookOpen,
  ArrowRight
} from "lucide-react";

const STORAGE_KEY = "edunexus_ai_tutor_messages";

const SUGGESTED_PROMPTS = [
  "Explain Python loops with a simple example",
  "What is the difference between a list and a tuple in Python?",
  "How does recursion work with a factorial function?",
  "Write a Python script to calculate average student grades",
  "Explain Big O notation and algorithm time complexity",
];

export default function AITutor() {
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [question, setQuestion] = useState("");
  const [copiedIndex, setCopiedIndex] = useState(null);

  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error("Failed to load saved chat history:", err);
      }
    }
    return [
      {
        role: "ai",
        text: "Greetings! 👋 I am your EduNexus AI Neural Tutor. Ask me any conceptual question, request code walkthroughs, or debug Python programming assignments.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const askQuestion = async (overrideText) => {
    const promptText = (overrideText || question).trim();
    if (!promptText || loading) return;

    const userMsg = {
      role: "user",
      text: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/ai-tutor`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          question: promptText,
          course: "Python Programming",
        }),
      });

      if (!response.ok) {
        throw new Error(`AI Gateway responded with status ${response.status}`);
      }

      const data = await response.json();
      const aiReply = data?.answer || "No response received from the neural engine.";

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: aiReply,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } catch (err) {
      console.error("AI Tutor response error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "⚠️ Neural connection timeout: Unable to reach the EduNexus AI service. Please verify your connection or try again shortly.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          isError: true,
        },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const clearChat = () => {
    if (!window.confirm("Are you sure you want to reset your neural chat history?")) return;
    const initial = [
      {
        role: "ai",
        text: "Neural workspace reset. How can I assist your learning today?",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ];
    setMessages(initial);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
  };

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 1800);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      askQuestion();
    }
  };

  return (
    <AppLayout
      title="Neural AI Tutor"
      subtitle="Autonomous generative tutor, code analyst, and interactive academic copilot."
      actions={
        <button
          onClick={clearChat}
          className="btn btn-secondary"
          style={{ display: "inline-flex", alignItems: "center", gap: "8px", fontSize: "13px" }}
        >
          <Trash2 size={15} />
          Reset Chat
        </button>
      }
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "calc(100vh - 170px)",
          minHeight: "580px",
          gap: "16px",
        }}
      >
        {/* TOP STATUS RIBBON */}
        <div
          className="card"
          style={{
            padding: "14px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            background: "linear-gradient(90deg, rgba(99, 102, 241, 0.1) 0%, rgba(6, 182, 212, 0.08) 100%)",
            border: "1px solid rgba(99, 102, 241, 0.25)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, var(--accent-indigo), var(--accent-cyan))",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
              }}
            >
              <Zap size={18} />
            </div>
            <div>
              <div style={{ fontSize: "13.5px", fontWeight: 700, color: "var(--text-bright)" }}>
                EduNexus Intelligence v2.4 (Python & Core Sciences)
              </div>
              <div style={{ fontSize: "11.5px", color: "var(--text-secondary)" }}>
                Active context: Python Data Structures, Control Flow, and Object Orientation
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "4px 10px",
                borderRadius: "999px",
                fontSize: "11px",
                fontWeight: 600,
                background: "rgba(16, 185, 129, 0.12)",
                color: "#34d399",
                border: "1px solid rgba(16, 185, 129, 0.25)",
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10b981" }} />
              Engine Online
            </span>
          </div>
        </div>

        {/* CHAT MESSAGES SCROLL CONTAINER */}
        <div
          className="card"
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            background: "rgba(11, 15, 25, 0.75)",
          }}
        >
          {messages.map((msg, index) => {
            const isUser = msg.role === "user";

            return (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: "14px",
                  alignSelf: isUser ? "flex-end" : "flex-start",
                  maxWidth: isUser ? "80%" : "88%",
                  flexDirection: isUser ? "row-reverse" : "row",
                }}
              >
                {/* AVATAR */}
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "10px",
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: isUser
                      ? "linear-gradient(135deg, #4f46e5, #6366f1)"
                      : "linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(99, 102, 241, 0.25))",
                    border: isUser
                      ? "1px solid rgba(99, 102, 241, 0.5)"
                      : "1px solid rgba(6, 182, 212, 0.3)",
                    color: isUser ? "#fff" : "var(--accent-cyan)",
                  }}
                >
                  {isUser ? <User size={18} /> : <Bot size={18} />}
                </div>

                {/* BUBBLE */}
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: isUser ? "flex-end" : "flex-start" }}>
                  <div
                    style={{
                      padding: "16px 20px",
                      borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
                      background: isUser
                        ? "linear-gradient(135deg, #4338ca, #4f46e5)"
                        : "var(--bg-surface)",
                      color: isUser ? "#ffffff" : "var(--text-bright)",
                      border: isUser
                        ? "1px solid rgba(99, 102, 241, 0.4)"
                        : "1px solid var(--border-default)",
                      fontSize: "14px",
                      lineHeight: 1.65,
                      boxShadow: isUser
                        ? "0 4px 16px rgba(79, 70, 229, 0.25)"
                        : "0 2px 10px rgba(0, 0, 0, 0.2)",
                      whiteSpace: "pre-wrap",
                      position: "relative",
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.text}

                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.text, index)}
                        title="Copy Response"
                        style={{
                          position: "absolute",
                          top: "10px",
                          right: "10px",
                          background: "rgba(255, 255, 255, 0.05)",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          borderRadius: "6px",
                          padding: "5px",
                          color: "var(--text-muted)",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {copiedIndex === index ? <Check size={13} style={{ color: "var(--accent-emerald)" }} /> : <Copy size={13} />}
                      </button>
                    )}
                  </div>

                  <span style={{ fontSize: "11px", color: "var(--text-muted)", padding: "0 4px" }}>
                    {msg.timestamp || ""}
                  </span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div style={{ display: "flex", gap: "14px", alignSelf: "flex-start" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "10px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(99, 102, 241, 0.25))",
                  border: "1px solid rgba(6, 182, 212, 0.3)",
                  color: "var(--accent-cyan)",
                }}
              >
                <Bot size={18} />
              </div>
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: "4px 16px 16px 16px",
                  background: "var(--bg-surface)",
                  border: "1px solid var(--border-default)",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "var(--accent-indigo)",
                    animation: "pulse 1.2s infinite ease-in-out",
                  }}
                />
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "var(--accent-cyan)",
                    animation: "pulse 1.2s infinite ease-in-out 0.2s",
                  }}
                />
                <span
                  style={{
                    width: "7px",
                    height: "7px",
                    borderRadius: "50%",
                    background: "var(--accent-purple)",
                    animation: "pulse 1.2s infinite ease-in-out 0.4s",
                  }}
                />
                <span style={{ fontSize: "12.5px", color: "var(--text-muted)", marginLeft: "4px" }}>
                  Synthesizing neural response...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* QUICK SUGGESTION PILLS */}
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
          {SUGGESTED_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => askQuestion(prompt)}
              disabled={loading}
              style={{
                background: "rgba(255, 255, 255, 0.03)",
                border: "1px solid var(--border-default)",
                borderRadius: "999px",
                padding: "7px 14px",
                color: "var(--text-secondary)",
                fontSize: "12px",
                whiteSpace: "nowrap",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--accent-indigo)";
                e.currentTarget.style.color = "var(--text-bright)";
                e.currentTarget.style.background = "rgba(99, 102, 241, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border-default)";
                e.currentTarget.style.color = "var(--text-secondary)";
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.03)";
              }}
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* INPUT COMPOSER */}
        <div
          className="card"
          style={{
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "var(--bg-surface)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
          }}
        >
          <textarea
            ref={inputRef}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything about Python, algorithmic logic, functions, assignments..."
            rows={1}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "var(--text-bright)",
              fontSize: "14px",
              resize: "none",
              fontFamily: "inherit",
              padding: "6px 4px",
              maxHeight: "100px",
            }}
          />

          <button
            onClick={() => askQuestion()}
            disabled={loading || !question.trim()}
            className="btn btn-primary"
            style={{
              padding: "10px 16px",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              opacity: loading || !question.trim() ? 0.5 : 1,
            }}
          >
            <span>Ask</span>
            <Send size={15} />
          </button>
        </div>
      </div>
    </AppLayout>
  );
}