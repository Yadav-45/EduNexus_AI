import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@edunexus.com");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const getUserRoleFromToken = (token) => {
    try {
      const payload = JSON.parse(
        atob(token.split(".")[1])
      );

      return payload.role;
    } catch (error) {
      console.error("Unable to read user role:", error);
      return null;
    }
  };

  const getDashboardPath = (role) => {
    switch (role) {
      case "OWNER":
        return "/owner-dashboard";

      case "ADMIN":
        return "/admin-dashboard";

      case "ACCOUNTANT":
        return "/finance-dashboard";

      case "TEACHER":
        return "/teacher-dashboard";

      case "PARENT":
        return "/parent-dashboard";

      case "STUDENT":
        return "/dashboard";

      default:
        return "/dashboard";
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    setMessage("");
    setLoading(true);

    try {
      const response = await api.post(
        "/auth/login",
        {
          email: email,
          password: password,
        }
      );

      const accessToken = response.data.access_token;

      localStorage.setItem(
        "access_token",
        accessToken
      );

      const role = getUserRoleFromToken(
        accessToken
      );

      if (!role) {
        setMessage(
          "Login succeeded, but your user role could not be determined."
        );
        return;
      }

      localStorage.setItem(
        "user_role",
        role
      );

      setMessage("Login successful!");

      navigate(getDashboardPath(role));
    } catch (error) {
      console.error("Login error:", error);

      if (error.response) {
        setMessage(
          `Server error ${error.response.status}: ${
            error.response.data?.detail ||
            "Invalid email or password"
          }`
        );
      } else if (error.request) {
        setMessage(
          "Cannot connect to backend. Make sure FastAPI is running."
        );
      } else {
        setMessage(
          `Error: ${error.message}`
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        button,
        input {
          font-family: inherit;
        }

        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 30px;
          background:
            linear-gradient(
              135deg,
              #f8fafc 0%,
              #f4f7fc 50%,
              #eef3fb 100%
            );
          color: #101828;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Arial,
            sans-serif;
          position: relative;
          overflow: hidden;
        }

        .background-shape-one {
          position: absolute;
          width: 420px;
          height: 420px;
          top: -230px;
          right: -160px;
          border-radius: 50%;
          background: rgba(37, 99, 235, 0.055);
        }

        .background-shape-two {
          position: absolute;
          width: 350px;
          height: 350px;
          bottom: -210px;
          left: -170px;
          border-radius: 50%;
          background: rgba(79, 70, 229, 0.045);
        }

        .login-layout {
          width: 100%;
          max-width: 930px;
          display: grid;
          grid-template-columns: 1fr 410px;
          gap: 65px;
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .brand-section {
          padding: 20px 0;
        }

        .brand {
          display: flex;
          align-items: center;
          gap: 11px;
          margin-bottom: 30px;
        }

        .brand-mark {
          width: 39px;
          height: 39px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );
          color: #ffffff;
          font-size: 17px;
          font-weight: 850;
          box-shadow:
            0 7px 18px
            rgba(37, 99, 235, 0.18);
        }

        .brand-name {
          color: #101828;
          font-size: 17px;
          font-weight: 850;
          letter-spacing: -0.5px;
        }

        .brand-name span {
          color: #2563eb;
        }

        .brand-caption {
          margin-top: 3px;
          color: #98a2b3;
          font-size: 7px;
          font-weight: 750;
          letter-spacing: 1px;
        }

        .welcome-title {
          max-width: 490px;
          margin: 0;
          color: #101828;
          font-size: 42px;
          line-height: 1.1;
          font-weight: 850;
          letter-spacing: -1.5px;
        }

        .welcome-title span {
          color: #2563eb;
        }

        .welcome-description {
          max-width: 430px;
          margin: 16px 0 0;
          color: #667085;
          font-size: 12px;
          line-height: 1.7;
        }

        .feature-list {
          display: flex;
          flex-direction: column;
          gap: 13px;
          margin-top: 27px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #475467;
          font-size: 9px;
          font-weight: 650;
        }

        .feature-icon {
          width: 27px;
          height: 27px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: #ffffff;
          border: 1px solid #e5e9ef;
          color: #2563eb;
          font-size: 11px;
          box-shadow:
            0 3px 9px
            rgba(16, 24, 40, 0.035);
        }

        .login-card {
          padding: 34px;
          background: #ffffff;
          border: 1px solid #e1e6ed;
          border-radius: 18px;
          box-shadow:
            0 18px 50px
            rgba(16, 24, 40, 0.07);
        }

        .login-card-header {
          margin-bottom: 24px;
        }

        .login-label {
          margin-bottom: 6px;
          color: #2563eb;
          font-size: 8px;
          font-weight: 850;
          text-transform: uppercase;
          letter-spacing: 0.9px;
        }

        .login-title {
          margin: 0;
          color: #101828;
          font-size: 24px;
          font-weight: 850;
          letter-spacing: -0.6px;
        }

        .login-subtitle {
          margin: 6px 0 0;
          color: #98a2b3;
          font-size: 9px;
          line-height: 1.6;
        }

        .message {
          margin-bottom: 17px;
          padding: 10px 12px;
          border-radius: 8px;
          background: #fff7f7;
          border: 1px solid #fecaca;
          color: #b91c1c;
          font-size: 8px;
          line-height: 1.5;
          font-weight: 650;
        }

        .form-group {
          margin-bottom: 17px;
        }

        .form-label {
          display: block;
          margin-bottom: 7px;
          color: #344054;
          font-size: 9px;
          font-weight: 750;
        }

        .form-input {
          width: 100%;
          padding: 11px 13px;
          border: 1px solid #d7dce3;
          border-radius: 9px;
          background: #ffffff;
          color: #101828;
          font-size: 10px;
          outline: none;
          transition:
            border-color 0.18s ease,
            box-shadow 0.18s ease;
        }

        .form-input::placeholder {
          color: #b0b8c4;
        }

        .form-input:focus {
          border-color: #84aef5;
          box-shadow:
            0 0 0 3px
            rgba(37, 99, 235, 0.08);
        }

        .login-button {
          width: 100%;
          margin-top: 5px;
          padding: 12px;
          border: none;
          border-radius: 9px;
          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );
          color: #ffffff;
          font-size: 10px;
          font-weight: 800;
          cursor: pointer;
          box-shadow:
            0 6px 14px
            rgba(37, 99, 235, 0.16);
          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease,
            opacity 0.18s ease;
        }

        .login-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow:
            0 9px 18px
            rgba(37, 99, 235, 0.2);
        }

        .login-button:disabled {
          opacity: 0.7;
          cursor: default;
        }

        .login-footer {
          margin-top: 20px;
          padding-top: 17px;
          border-top: 1px solid #eef0f3;
          text-align: center;
          color: #98a2b3;
          font-size: 7px;
          line-height: 1.6;
        }

        .secure-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          margin-top: 11px;
          padding: 5px 8px;
          border-radius: 6px;
          background: #f8fafc;
          border: 1px solid #eef0f3;
          color: #667085;
          font-size: 7px;
          font-weight: 700;
        }

        @media (max-width: 800px) {
          .login-layout {
            grid-template-columns: 1fr;
            max-width: 430px;
            gap: 25px;
          }

          .brand-section {
            text-align: center;
          }

          .brand {
            justify-content: center;
            margin-bottom: 20px;
          }

          .welcome-title {
            max-width: none;
            font-size: 32px;
          }

          .welcome-description {
            margin-left: auto;
            margin-right: auto;
          }

          .feature-list {
            display: none;
          }
        }

        @media (max-width: 480px) {
          .login-page {
            padding: 18px;
          }

          .login-card {
            padding: 25px 21px;
          }

          .welcome-title {
            font-size: 28px;
          }

          .welcome-description {
            font-size: 10px;
          }
        }
      `}</style>

      <div className="background-shape-one" />
      <div className="background-shape-two" />

      <div className="login-layout">
        <section className="brand-section">
          <div className="brand">
            <div className="brand-mark">E</div>

            <div>
              <div className="brand-name">
                edu<span>nexus.ai</span>
              </div>

              <div className="brand-caption">
                AI SCHOOL OPERATING SYSTEM
              </div>
            </div>
          </div>

          <h1 className="welcome-title">
            One platform.
            <br />
            <span>Every learner.</span>
          </h1>

          <p className="welcome-description">
            EduNexus AI brings school management,
            learning, communication, finance, and
            intelligent assistance into one connected
            platform.
          </p>

          <div className="feature-list">
            <div className="feature-item">
              <div className="feature-icon">
                ✓
              </div>

              <span>
                Manage your school in one place
              </span>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                ✦
              </div>

              <span>
                Use AI-powered school intelligence
              </span>
            </div>

            <div className="feature-item">
              <div className="feature-icon">
                ✓
              </div>

              <span>
                Give every role the right workspace
              </span>
            </div>
          </div>
        </section>

        <section className="login-card">
          <div className="login-card-header">
            <div className="login-label">
              EduNexus AI
            </div>

            <h2 className="login-title">
              Welcome back
            </h2>

            <p className="login-subtitle">
              Sign in to access your school workspace.
            </p>
          </div>

          {message && (
            <div className="message">
              {message}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">
                Email Address
              </label>

              <input
                className="form-input"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Password
              </label>

              <input
                className="form-input"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                required
              />
            </div>

            <button
              className="login-button"
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Signing in..."
                : "Sign In"}
            </button>
          </form>

          <div className="login-footer">
            <div>
              Sign in using your EduNexus AI
              account credentials.
            </div>

            <div className="secure-badge">
              🔒 Secure authenticated access
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;