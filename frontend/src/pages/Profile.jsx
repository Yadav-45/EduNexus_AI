import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Profile() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        navigate("/");
        return;
      }

      try {
        const response = await fetch(
          "http://127.0.0.1:8000/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to load profile");
        }

        const data = await response.json();

        setName(data.full_name || "");
        setEmail(data.email || "");
        setRole(data.role || "");
      } catch (error) {
        console.error(
          "Profile loading error:",
          error
        );

        setError(
          "Unable to load your profile."
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [navigate]);

  const saveProfile = async () => {
    if (!name.trim() || !email.trim()) {
      setError(
        "Name and email are required."
      );
      return;
    }

    const token =
      localStorage.getItem("access_token");

    if (!token) {
      navigate("/");
      return;
    }

    setSaving(true);
    setSaved(false);
    setError("");

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            full_name: name.trim(),
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail ||
            "Failed to update profile"
        );
      }

      setName(data.full_name);
      setEmail(data.email);
      setRole(data.role);

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 2500);
    } catch (error) {
      console.error(
        "Profile update error:",
        error
      );

      setError(
        error.message ||
          "Unable to update your profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <style>{`
          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
          }

          .profile-loading {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;

            font-family:
              Inter,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              Arial,
              sans-serif;
          }

          .loading-box {
            width: 220px;
            padding: 28px;

            text-align: center;

            background: #ffffff;

            border: 1px solid #e4e7ec;
            border-radius: 16px;

            box-shadow:
              0 10px 30px
              rgba(16, 24, 40, 0.06);
          }

          .spinner {
            width: 38px;
            height: 38px;

            margin: 0 auto 14px;

            border: 3px solid #e7edf5;
            border-top-color: #2563eb;

            border-radius: 50%;

            animation:
              profileSpin 0.8s linear infinite;
          }

          .loading-title {
            margin: 0;

            color: #101828;

            font-size: 12px;
            font-weight: 750;
          }

          .loading-text {
            margin: 5px 0 0;

            color: #98a2b3;

            font-size: 9px;
          }

          @keyframes profileSpin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>

        <div className="loading-box">
          <div className="spinner" />

          <p className="loading-title">
            Loading profile
          </p>

          <p className="loading-text">
            Preparing your account...
          </p>
        </div>
      </div>
    );
  }

  const firstLetter =
    name.trim().charAt(0).toUpperCase() || "S";

  return (
    <div className="profile-page">
      <style>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #f8fafc;
        }

        button,
        input {
          font-family: inherit;
        }

        .profile-page {
          min-height: 100vh;

          background: #f8fafc;

          color: #101828;

          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Arial,
            sans-serif;
        }

        /* =========================
           HEADER
        ========================= */

        .profile-header {
          height: 70px;

          padding: 0 42px;

          display: flex;
          align-items: center;
          justify-content: space-between;

          background: #ffffff;

          border-bottom:
            1px solid #eaecf0;

          position: sticky;

          top: 0;

          z-index: 50;
        }

        .profile-brand {
          display: flex;
          align-items: center;

          gap: 10px;

          cursor: pointer;
        }

        .brand-mark {
          width: 34px;
          height: 34px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 9px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );

          color: #ffffff;

          font-size: 15px;
          font-weight: 850;

          box-shadow:
            0 5px 12px
            rgba(37, 99, 235, 0.16);
        }

        .brand-name {
          color: #101828;

          font-size: 15px;

          font-weight: 800;

          letter-spacing: -0.4px;
        }

        .brand-name span {
          color: #2563eb;
        }

        .brand-caption {
          margin-top: 2px;

          color: #98a2b3;

          font-size: 7px;

          font-weight: 700;

          letter-spacing: 0.7px;
        }

        .header-button {
          padding: 8px 13px;

          border:
            1px solid #dfe4ea;

          border-radius: 8px;

          background: #ffffff;

          color: #475467;

          font-size: 9px;

          font-weight: 750;

          cursor: pointer;

          transition: 0.18s ease;
        }

        .header-button:hover {
          color: #2563eb;

          border-color: #bfd3f2;

          background: #f8fbff;
        }

        /* =========================
           CONTENT
        ========================= */

        .profile-content {
          max-width: 1040px;

          margin: 0 auto;

          padding:
            32px 38px 55px;
        }

        .breadcrumb {
          display: flex;

          align-items: center;

          gap: 7px;

          margin-bottom: 20px;

          color: #98a2b3;

          font-size: 9px;

          font-weight: 650;
        }

        .breadcrumb button {
          padding: 0;

          border: none;

          background: transparent;

          color: #667085;

          font-size: 9px;

          font-weight: 750;

          cursor: pointer;
        }

        .breadcrumb button:hover {
          color: #2563eb;
        }

        .breadcrumb-arrow {
          color: #d0d5dd;
        }

        /* =========================
           HERO
        ========================= */

        .profile-hero {
          position: relative;

          overflow: hidden;

          padding: 27px 30px;

          border:
            1px solid #dfe6ef;

          border-radius: 18px;

          background:
            linear-gradient(
              135deg,
              #f5f9ff,
              #eef3fb
            );

          margin-bottom: 18px;

          box-shadow:
            0 4px 18px
            rgba(16, 24, 40, 0.035);
        }

        .profile-hero::before {
          content: "";

          position: absolute;

          width: 270px;
          height: 270px;

          right: -100px;
          top: -150px;

          border-radius: 50%;

          background:
            rgba(37, 99, 235, 0.06);
        }

        .hero-content {
          position: relative;

          z-index: 2;

          display: flex;

          align-items: center;

          gap: 17px;
        }

        .avatar {
          width: 66px;
          height: 66px;

          flex-shrink: 0;

          display: flex;

          align-items: center;
          justify-content: center;

          border-radius: 18px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );

          color: #ffffff;

          font-size: 23px;

          font-weight: 850;

          box-shadow:
            0 8px 18px
            rgba(37, 99, 235, 0.17);
        }

        .hero-label {
          margin-bottom: 4px;

          color: #2563eb;

          font-size: 8px;

          font-weight: 850;

          text-transform: uppercase;

          letter-spacing: 0.8px;
        }

        .hero-title {
          margin: 0;

          color: #101828;

          font-size: 25px;

          line-height: 1.2;

          font-weight: 850;

          letter-spacing: -0.7px;
        }

        .hero-description {
          margin: 6px 0 0;

          color: #667085;

          font-size: 9px;

          line-height: 1.6;
        }

        /* =========================
           MAIN GRID
        ========================= */

        .profile-grid {
          display: grid;

          grid-template-columns:
            minmax(0, 1fr)
            280px;

          gap: 18px;

          align-items: start;
        }

        .profile-card {
          background: #ffffff;

          border:
            1px solid #e1e6ed;

          border-radius: 16px;

          padding: 24px;

          box-shadow:
            0 3px 14px
            rgba(16, 24, 40, 0.025);
        }

        .card-header {
          margin-bottom: 20px;

          padding-bottom: 17px;

          border-bottom:
            1px solid #eef0f3;
        }

        .card-label {
          margin-bottom: 5px;

          color: #2563eb;

          font-size: 8px;

          font-weight: 850;

          text-transform: uppercase;

          letter-spacing: 0.8px;
        }

        .card-title {
          margin: 0;

          color: #101828;

          font-size: 17px;

          font-weight: 820;

          letter-spacing: -0.3px;
        }

        .card-description {
          margin: 5px 0 0;

          color: #98a2b3;

          font-size: 8px;

          line-height: 1.6;
        }

        /* =========================
           ERROR
        ========================= */

        .error-message {
          margin-bottom: 17px;

          padding: 11px 13px;

          border:
            1px solid #fecaca;

          border-radius: 9px;

          background: #fff7f7;

          color: #b91c1c;

          font-size: 9px;

          font-weight: 650;
        }

        /* =========================
           FORM
        ========================= */

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

        .input-wrapper {
          position: relative;
        }

        .form-input {
          width: 100%;

          padding: 11px 13px;

          border:
            1px solid #d7dce3;

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

        .form-input.disabled {
          background: #f8fafc;

          color: #667085;

          cursor: not-allowed;
        }

        .role-note {
          margin-top: 5px;

          color: #98a2b3;

          font-size: 7px;
        }

        .save-row {
          display: flex;

          align-items: center;

          gap: 12px;

          flex-wrap: wrap;

          margin-top: 22px;
        }

        .save-button {
          min-width: 130px;

          padding: 10px 15px;

          border: none;

          border-radius: 8px;

          background:
            linear-gradient(
              135deg,
              #2563eb,
              #4f46e5
            );

          color: #ffffff;

          font-size: 9px;

          font-weight: 750;

          cursor: pointer;

          box-shadow:
            0 4px 10px
            rgba(37, 99, 235, 0.12);

          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease,
            opacity 0.18s ease;
        }

        .save-button:hover:not(:disabled) {
          transform: translateY(-1px);

          box-shadow:
            0 7px 14px
            rgba(37, 99, 235, 0.18);
        }

        .save-button:disabled {
          background: #98a2b3;

          cursor: default;

          box-shadow: none;
        }

        .saved-message {
          display: flex;

          align-items: center;

          gap: 5px;

          color: #16a34a;

          font-size: 8px;

          font-weight: 750;
        }

        /* =========================
           SIDE INFORMATION
        ========================= */

        .account-card {
          background: #ffffff;

          border:
            1px solid #e1e6ed;

          border-radius: 16px;

          padding: 21px;

          box-shadow:
            0 3px 14px
            rgba(16, 24, 40, 0.025);
        }

        .account-avatar {
          width: 46px;
          height: 46px;

          display: flex;

          align-items: center;
          justify-content: center;

          margin-bottom: 13px;

          border-radius: 13px;

          background: #eef4ff;

          border:
            1px solid #dce8fb;

          color: #2563eb;

          font-size: 16px;

          font-weight: 850;
        }

        .account-title {
          margin: 0;

          color: #101828;

          font-size: 13px;

          font-weight: 800;
        }

        .account-subtitle {
          margin: 4px 0 17px;

          color: #98a2b3;

          font-size: 8px;

          line-height: 1.5;
        }

        .account-item {
          padding: 11px 0;

          border-top:
            1px solid #f0f2f5;
        }

        .account-item-label {
          margin-bottom: 3px;

          color: #98a2b3;

          font-size: 7px;

          font-weight: 800;

          text-transform: uppercase;

          letter-spacing: 0.6px;
        }

        .account-item-value {
          color: #344054;

          font-size: 9px;

          font-weight: 700;

          word-break: break-word;
        }

        .security-note {
          margin-top: 17px;

          padding: 11px;

          border-radius: 9px;

          background: #f8fafc;

          border:
            1px solid #eef0f3;

          color: #667085;

          font-size: 7px;

          line-height: 1.55;
        }

        /* =========================
           RESPONSIVE
        ========================= */

        @media (max-width: 800px) {
          .profile-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .profile-header {
            padding: 0 18px;
          }

          .profile-content {
            padding:
              24px 18px 40px;
          }

          .brand-caption {
            display: none;
          }

          .profile-hero {
            padding: 22px;
          }

          .hero-title {
            font-size: 22px;
          }

          .hero-content {
            align-items: flex-start;
          }
        }

        @media (max-width: 430px) {
          .profile-header {
            height: 64px;
          }

          .brand-name {
            font-size: 14px;
          }

          .header-button {
            padding: 7px 9px;
            font-size: 8px;
          }

          .profile-content {
            padding:
              20px 13px 35px;
          }

          .hero-content {
            flex-direction: column;
          }

          .profile-card,
          .account-card {
            padding: 19px;
          }
        }
      `}</style>

      {/* =========================
          HEADER
      ========================= */}

      <header className="profile-header">
        <div
          className="profile-brand"
          onClick={() => navigate("/dashboard")}
        >
          <div className="brand-mark">E</div>

          <div>
            <div className="brand-name">
              edu<span>nexus.ai</span>
            </div>

            <div className="brand-caption">
              AI LEARNING PLATFORM
            </div>
          </div>
        </div>

        <button
          className="header-button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>
      </header>

      {/* =========================
          CONTENT
      ========================= */}

      <main className="profile-content">
        <div className="breadcrumb">
          <button
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </button>

          <span className="breadcrumb-arrow">
            /
          </span>

          <span>Profile & Settings</span>
        </div>

        {/* =========================
            HERO
        ========================= */}

        <section className="profile-hero">
          <div className="hero-content">
            <div className="avatar">
              {firstLetter}
            </div>

            <div>
              <div className="hero-label">
                Student Account
              </div>

              <h1 className="hero-title">
                {name
                  ? `Welcome, ${name}`
                  : "Student Profile"}
              </h1>

              <p className="hero-description">
                Manage your EduNexus AI account
                information and learning profile.
              </p>
            </div>
          </div>
        </section>

        {/* =========================
            MAIN GRID
        ========================= */}

        <div className="profile-grid">
          {/* FORM CARD */}

          <section className="profile-card">
            <div className="card-header">
              <div className="card-label">
                Account Settings
              </div>

              <h2 className="card-title">
                Personal Information
              </h2>

              <p className="card-description">
                Update the information associated
                with your EduNexus AI account.
              </p>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                Full Name
              </label>

              <input
                className="form-input"
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Enter your name"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Email Address
              </label>

              <input
                className="form-input"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Account Role
              </label>

              <input
                className="form-input disabled"
                type="text"
                value={role}
                disabled
              />

              <div className="role-note">
                Account role is managed by the
                system.
              </div>
            </div>

            <div className="save-row">
              <button
                className="save-button"
                onClick={saveProfile}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Profile"}
              </button>

              {saved && (
                <div className="saved-message">
                  <span>✓</span>
                  Profile saved successfully
                </div>
              )}
            </div>
          </section>

          {/* ACCOUNT CARD */}

          <aside className="account-card">
            <div className="account-avatar">
              {firstLetter}
            </div>

            <h2 className="account-title">
              EduNexus AI Account
            </h2>

            <p className="account-subtitle">
              Your account information and access
              details.
            </p>

            <div className="account-item">
              <div className="account-item-label">
                Name
              </div>

              <div className="account-item-value">
                {name || "Not provided"}
              </div>
            </div>

            <div className="account-item">
              <div className="account-item-label">
                Email
              </div>

              <div className="account-item-value">
                {email || "Not provided"}
              </div>
            </div>

            <div className="account-item">
              <div className="account-item-label">
                Role
              </div>

              <div className="account-item-value">
                {role || "Student"}
              </div>
            </div>

            <div className="security-note">
              🔒 Your profile is linked to your
              authenticated EduNexus AI account.
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Profile;