import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../api/config";

const STORAGE_KEY = "edunexus_ai_tutor_messages";

function AITutor() {
  const navigate = useNavigate();
  const messagesEndRef = useRef(null);

  const [question, setQuestion] = useState("");

  const [messages, setMessages] = useState(() => {
    const savedMessages =
      localStorage.getItem(STORAGE_KEY);

    if (savedMessages) {
      try {
        return JSON.parse(savedMessages);
      } catch (error) {
        console.error(
          "Failed to load saved chat:",
          error
        );
      }
    }

    return [
      {
        role: "ai",
        text:
          "Hello! 👋 I'm your EduNexus AI Tutor. I'm ready to help you with Python and your course.",
      },
    ];
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(messages)
    );
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  const askQuestion = async () => {
    const trimmedQuestion =
      question.trim();

    if (!trimmedQuestion || loading) {
      return;
    }

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        text: trimmedQuestion,
      },
    ]);

    setQuestion("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/ai-tutor`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            question: trimmedQuestion,
            course: "Python Programming",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to contact AI Tutor"
        );
      }

      const data = await response.json();

      setMessages((previous) => [
        ...previous,
        {
          role: "ai",
          text: data.answer,
        },
      ]);
    } catch (error) {
      console.error(
        "AI Tutor error:",
        error
      );

      setMessages((previous) => [
        ...previous,
        {
          role: "ai",
          text:
            "Sorry, I couldn't connect to the AI Tutor right now.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    const confirmed =
      window.confirm(
        "Are you sure you want to clear your AI Tutor chat?"
      );

    if (!confirmed) {
      return;
    }

    const welcomeMessage = [
      {
        role: "ai",
        text:
          "Hello! 👋 I'm your EduNexus AI Tutor. I'm ready to help you with Python and your course.",
      },
    ];

    setMessages(welcomeMessage);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(welcomeMessage)
    );
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      askQuestion();
    }
  };

  return (
    <div className="ai-tutor-page">

      <style>{`

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #ffffff;
        }

        button,
        textarea {
          font-family: inherit;
        }

        .ai-tutor-page {
          min-height: 100vh;

          background:
            linear-gradient(
              180deg,
              #ffffff 0%,
              #f8fafc 100%
            );

          color: #172033;

          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Arial,
            sans-serif;

          display: flex;

          flex-direction: column;
        }

        /* =========================
           HEADER
        ========================= */

        .ai-header {
          height: 72px;

          flex-shrink: 0;

          background: #ffffff;

          border-bottom:
            1px solid #e7ebf0;

          display: flex;

          align-items: center;

          justify-content: space-between;

          padding:
            0 42px;

          position: sticky;

          top: 0;

          z-index: 30;
        }

        .ai-brand {
          display: flex;

          align-items: center;

          gap: 10px;

          cursor: pointer;
        }

        .brand-mark {
          width: 36px;
          height: 36px;

          border-radius: 9px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );

          display: flex;

          align-items: center;

          justify-content: center;

          color: white;

          font-size: 16px;

          font-weight: 800;

          box-shadow:
            0 5px 12px
            rgba(37, 99, 235, 0.16);
        }

        .brand-name {
          color: #101828;

          font-size: 16px;

          font-weight: 800;

          letter-spacing: -0.4px;
        }

        .brand-name span {
          color: #2563eb;
        }

        .brand-caption {
          color: #98a2b3;

          font-size: 7px;

          letter-spacing: 0.6px;

          margin-top: 2px;
        }

        .header-actions {
          display: flex;

          align-items: center;

          gap: 9px;
        }

        .header-button {
          padding:
            9px 14px;

          border:
            1px solid #dfe5ec;

          border-radius: 8px;

          background: #ffffff;

          color: #475467;

          font-size: 10px;

          font-weight: 700;

          cursor: pointer;

          transition: 0.18s;
        }

        .header-button:hover {
          color: #2563eb;

          border-color: #bfd3f2;

          background: #f8fbff;
        }

        .clear-button {
          color: #dc2626;

          border-color: #fecaca;

          background: #fffafa;
        }

        .clear-button:hover {
          color: #b91c1c;

          border-color: #fca5a5;

          background: #fff5f5;
        }

        /* =========================
           MAIN
        ========================= */

        .ai-main {
          width: 100%;

          max-width: 1180px;

          margin: 0 auto;

          padding:
            30px 42px 42px;

          flex: 1;

          display: flex;

          flex-direction: column;
        }

        .breadcrumb {
          display: flex;

          align-items: center;

          gap: 7px;

          margin-bottom: 16px;

          color: #98a2b3;

          font-size: 9px;

          font-weight: 600;
        }

        .breadcrumb button {
          padding: 0;

          border: none;

          background: transparent;

          color: #667085;

          font-size: 9px;

          font-weight: 700;

          cursor: pointer;
        }

        .breadcrumb button:hover {
          color: #2563eb;
        }

        .breadcrumb-arrow {
          color: #d0d5dd;
        }

        /* =========================
           AI WORKSPACE
        ========================= */

        .ai-workspace {
          background: #ffffff;

          border:
            1px solid #dfe6ef;

          border-radius: 17px;

          overflow: hidden;

          box-shadow:
            0 7px 28px
            rgba(16, 24, 40, 0.055);

          display: flex;

          flex-direction: column;

          flex: 1;

          min-height: 650px;
        }

        /* =========================
           AI HERO
        ========================= */

        .ai-hero {
          padding:
            24px 27px;

          background:
            linear-gradient(
              135deg,
              #f5f9ff,
              #eef3fb
            );

          border-bottom:
            1px solid #e1e7ef;

          display: flex;

          align-items: center;

          justify-content: space-between;

          gap: 20px;
        }

        .ai-hero-left {
          display: flex;

          align-items: center;

          gap: 14px;
        }

        .ai-avatar {
          width: 52px;
          height: 52px;

          flex-shrink: 0;

          border-radius: 14px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );

          display: flex;

          align-items: center;

          justify-content: center;

          color: white;

          font-size: 23px;

          box-shadow:
            0 7px 15px
            rgba(37, 99, 235, 0.18);
        }

        .ai-hero-title {
          margin: 0;

          color: #101828;

          font-size: 19px;

          font-weight: 800;

          letter-spacing: -0.3px;
        }

        .ai-hero-description {
          margin:
            5px 0 0;

          color: #667085;

          font-size: 9px;

          line-height: 1.5;
        }

        .course-pill {
          display: flex;

          align-items: center;

          gap: 7px;

          padding:
            8px 12px;

          border:
            1px solid #d6e1ef;

          border-radius: 20px;

          background: #ffffff;

          color: #475467;

          font-size: 8px;

          font-weight: 750;

          white-space: nowrap;
        }

        .course-pill-icon {
          color: #2563eb;

          font-size: 11px;
        }

        /* =========================
           CHAT
        ========================= */

        .chat-area {
          flex: 1;

          min-height: 440px;

          max-height: 580px;

          overflow-y: auto;

          padding:
            25px 27px;

          background:
            #ffffff;
        }

        .message-row {
          display: flex;

          width: 100%;

          margin-bottom: 18px;
        }

        .message-row.user {
          justify-content: flex-end;
        }

        .message-row.ai {
          justify-content: flex-start;
        }

        .message-wrapper {
          display: flex;

          align-items: flex-end;

          gap: 8px;

          max-width: 78%;
        }

        .message-row.user
          .message-wrapper {
          flex-direction: row-reverse;
        }

        .message-avatar {
          width: 27px;
          height: 27px;

          flex-shrink: 0;

          border-radius: 8px;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 11px;

          font-weight: 800;
        }

        .message-avatar.ai {
          background: #eef4ff;

          color: #2563eb;

          border:
            1px solid #dbe7f8;
        }

        .message-avatar.user {
          background: #e8eef8;

          color: #475467;

          border:
            1px solid #d8e0eb;
        }

        .message-bubble {
          padding:
            11px 14px;

          border-radius: 13px;

          font-size: 9px;

          line-height: 1.7;

          white-space: pre-wrap;

          word-break: break-word;
        }

        .message-bubble.ai {
          background: #f4f6f9;

          border:
            1px solid #e8ebef;

          color: #344054;

          border-bottom-left-radius: 4px;
        }

        .message-bubble.user {
          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );

          color: white;

          border-bottom-right-radius: 4px;

          box-shadow:
            0 4px 10px
            rgba(37, 99, 235, 0.12);
        }

        /* =========================
           TYPING
        ========================= */

        .typing-wrapper {
          display: flex;

          align-items: flex-end;

          gap: 8px;

          margin-bottom: 18px;
        }

        .typing-bubble {
          padding:
            11px 14px;

          border-radius:
            13px 13px 13px 4px;

          background: #f4f6f9;

          border:
            1px solid #e8ebef;

          display: flex;

          align-items: center;

          gap: 4px;
        }

        .typing-dot {
          width: 5px;
          height: 5px;

          border-radius: 50%;

          background: #98a2b3;

          animation:
            typing 1.2s infinite ease-in-out;
        }

        .typing-dot:nth-child(2) {
          animation-delay: 0.15s;
        }

        .typing-dot:nth-child(3) {
          animation-delay: 0.3s;
        }

        @keyframes typing {
          0%,
          60%,
          100% {
            transform: translateY(0);

            opacity: 0.45;
          }

          30% {
            transform: translateY(-3px);

            opacity: 1;
          }
        }

        /* =========================
           INPUT
        ========================= */

        .input-area {
          padding:
            15px 18px 17px;

          border-top:
            1px solid #e6eaf0;

          background: #fbfcfe;
        }

        .input-box {
          display: flex;

          align-items: flex-end;

          gap: 9px;

          padding:
            7px 7px 7px 12px;

          border:
            1px solid #d8e0e9;

          border-radius: 11px;

          background: #ffffff;

          transition:
            border-color 0.18s,
            box-shadow 0.18s;
        }

        .input-box:focus-within {
          border-color: #9bbcf0;

          box-shadow:
            0 0 0 3px
            rgba(37, 99, 235, 0.06);
        }

        .question-input {
          flex: 1;

          min-height: 38px;

          max-height: 120px;

          resize: none;

          border: none;

          outline: none;

          padding:
            9px 2px;

          background: transparent;

          color: #172033;

          font-size: 9px;

          line-height: 1.5;
        }

        .question-input::placeholder {
          color: #98a2b3;
        }

        .send-button {
          width: 42px;
          height: 38px;

          flex-shrink: 0;

          border: none;

          border-radius: 8px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );

          color: white;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 15px;

          cursor: pointer;

          box-shadow:
            0 4px 10px
            rgba(37, 99, 235, 0.15);

          transition:
            transform 0.18s,
            opacity 0.18s;
        }

        .send-button:hover:not(:disabled) {
          transform:
            translateY(-1px);
        }

        .send-button:disabled {
          background: #cbd5e1;

          box-shadow: none;

          cursor: default;

          opacity: 0.8;
        }

        .input-hint {
          margin:
            7px 3px 0;

          color: #98a2b3;

          font-size: 7px;
        }

        /* =========================
           EMPTY CHAT
        ========================= */

        .chat-empty {
          min-height: 350px;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          text-align: center;

          color: #98a2b3;
        }

        .chat-empty-icon {
          width: 52px;
          height: 52px;

          border-radius: 14px;

          background: #f1f6fd;

          display: flex;

          align-items: center;

          justify-content: center;

          font-size: 22px;

          margin-bottom: 12px;
        }

        .chat-empty-title {
          margin: 0;

          color: #344054;

          font-size: 12px;

          font-weight: 800;
        }

        .chat-empty-text {
          margin:
            5px 0 0;

          font-size: 8px;
        }

        /* =========================
           RESPONSIVE
        ========================= */

        @media (max-width: 700px) {

          .ai-header {
            padding:
              0 18px;
          }

          .ai-main {
            padding:
              22px 18px 30px;
          }

          .ai-hero {
            align-items: flex-start;

            flex-direction: column;

            padding: 20px;
          }

          .course-pill {
            width: 100%;

            justify-content: center;
          }

          .chat-area {
            padding:
              20px 15px;

            min-height: 430px;
          }

          .message-wrapper {
            max-width: 90%;
          }

          .brand-caption {
            display: none;
          }

        }

        @media (max-width: 500px) {

          .ai-header {
            height: 64px;
          }

          .brand-name {
            font-size: 14px;
          }

          .header-button {
            padding:
              8px 10px;

            font-size: 9px;
          }

          .clear-button {
            display: none;
          }

          .ai-main {
            padding:
              18px 10px 20px;
          }

          .breadcrumb {
            padding-left: 3px;
          }

          .ai-workspace {
            border-radius: 13px;
          }

          .ai-hero-left {
            align-items: flex-start;
          }

          .ai-avatar {
            width: 44px;
            height: 44px;

            border-radius: 11px;

            font-size: 19px;
          }

          .ai-hero-title {
            font-size: 16px;
          }

          .chat-area {
            min-height: 420px;
          }

          .message-wrapper {
            max-width: 94%;
          }

          .message-bubble {
            font-size: 9px;
          }

          .input-area {
            padding:
              12px;
          }

          .input-hint {
            display: none;
          }

        }

      `}</style>

      {/* =========================
          HEADER
      ========================= */}

      <header className="ai-header">

        <div
          className="ai-brand"
          onClick={() =>
            navigate("/dashboard")
          }
        >

          <div className="brand-mark">
            E
          </div>

          <div>

            <div className="brand-name">
              edu<span>nexus.ai</span>
            </div>

            <div className="brand-caption">
              AI LEARNING PLATFORM
            </div>

          </div>

        </div>

        <div className="header-actions">

          <button
            className="header-button"
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Dashboard
          </button>

          <button
            className="header-button clear-button"
            onClick={clearChat}
          >
            Clear Chat
          </button>

        </div>

      </header>

      {/* =========================
          MAIN
      ========================= */}

      <main className="ai-main">

        <div className="breadcrumb">

          <button
            onClick={() =>
              navigate("/dashboard")
            }
          >
            Dashboard
          </button>

          <span className="breadcrumb-arrow">
            /
          </span>

          <span>
            AI Tutor
          </span>

        </div>

        <section className="ai-workspace">

          {/* =====================
              AI HERO
          ===================== */}

          <div className="ai-hero">

            <div className="ai-hero-left">

              <div className="ai-avatar">
                🤖
              </div>

              <div>

                <h1 className="ai-hero-title">
                  EduNexus AI Tutor
                </h1>

                <p className="ai-hero-description">
                  Your personal assistant for
                  learning Python.
                </p>

              </div>

            </div>

            <div className="course-pill">

              <span className="course-pill-icon">
                📚
              </span>

              Current Course:
              &nbsp;Python Programming

            </div>

          </div>

          {/* =====================
              CHAT
          ===================== */}

          <div className="chat-area">

            {messages.length === 0 && (

              <div className="chat-empty">

                <div className="chat-empty-icon">
                  🤖
                </div>

                <h3 className="chat-empty-title">
                  Start a conversation
                </h3>

                <p className="chat-empty-text">
                  Ask your AI Tutor anything
                  about Python.
                </p>

              </div>

            )}

            {messages.map(
              (message, index) => (

                <div
                  key={index}
                  className={
                    message.role === "user"
                      ? "message-row user"
                      : "message-row ai"
                  }
                >

                  <div className="message-wrapper">

                    <div
                      className={
                        message.role === "user"
                          ? "message-avatar user"
                          : "message-avatar ai"
                      }
                    >
                      {message.role === "user"
                        ? "You"
                        : "AI"}
                    </div>

                    <div
                      className={
                        message.role === "user"
                          ? "message-bubble user"
                          : "message-bubble ai"
                      }
                    >
                      {message.text}
                    </div>

                  </div>

                </div>

              )
            )}

            {loading && (

              <div className="typing-wrapper">

                <div className="message-avatar ai">
                  AI
                </div>

                <div className="typing-bubble">

                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />

                </div>

              </div>

            )}

            <div ref={messagesEndRef} />

          </div>

          {/* =====================
              INPUT
          ===================== */}

          <div className="input-area">

            <div className="input-box">

              <textarea
                className="question-input"
                value={question}
                onChange={(event) =>
                  setQuestion(
                    event.target.value
                  )
                }
                onKeyDown={handleKeyDown}
                placeholder="Ask about Python, lessons, loops, functions..."
                rows={2}
              />

              <button
                className="send-button"
                onClick={askQuestion}
                disabled={
                  loading ||
                  !question.trim()
                }
                aria-label="Send question"
              >
                {loading ? "…" : "➤"}
              </button>

            </div>

            <div className="input-hint">
              Press Enter to send • Shift + Enter
              for a new line
            </div>

          </div>

        </section>

      </main>

    </div>
  );
}

export default AITutor;