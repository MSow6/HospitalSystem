"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

function BrandMark({ compact = false }) {
  return (
    <div className={`brand ${compact ? "brand--compact" : ""}`}>
      <div className="brand__mark" aria-hidden="true">
        <svg viewBox="0 0 40 40" fill="none">
          <path
            d="M20 3.5 34 9v10.6c0 8.6-5.7 14.1-14 17-8.3-2.9-14-8.4-14-17V9l14-5.5Z"
            fill="currentColor"
            opacity=".16"
          />
          <path
            d="M20 7.2 30.5 11v8.4c0 6.5-4.1 10.9-10.5 13.4-6.4-2.5-10.5-6.9-10.5-13.4V11L20 7.2Z"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <path
            d="M20 13.3v11.8M14.1 19.2h11.8"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <div className="brand__name">
        <strong>HMS</strong>
        <span>Hospital Management System</span>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showRecoveryHelp, setShowRecoveryHelp] = useState(false);

  function handleSubmit(event) {
    event.preventDefault();
    // No authentication yet — the username decides which role panel opens.
    const username = String(
      new FormData(event.currentTarget).get("username") ?? "",
    )
      .trim()
      .toLowerCase();
    if (username.includes("doctor")) {
      router.push("/doctor");
      return;
    }
    if (username.includes("lab")) {
      router.push("/lab");
      return;
    }
    router.push("/reception");
  }

  return (
    <main className="login-shell">
      <section
        className="welcome-panel"
        aria-label="Hospital Management System"
      >
        <img
          alt="A doctor listening to a patient in a hospital consultation room"
          className="welcome-image"
          src="/hospital-login-photo.png"
        />
        <div className="welcome-image__tint" aria-hidden="true" />
      </section>

      <section className="form-panel">
        <div className="form-panel__inner">
          <div className="mobile-brand">
            <BrandMark compact />
          </div>
          <div className="form-heading">
            <p className="eyebrow eyebrow--dark">WELCOME BACK</p>
            <h2>Sign in to your account</h2>
            <p>Enter your staff credentials to continue.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <label className="field-label" htmlFor="username">
              Username
            </label>
            <div className="input-wrap">
              <svg
                className="input-icon"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="12"
                  cy="8"
                  r="3.4"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M5.4 19c.4-3.1 2.9-5.1 6.6-5.1s6.2 2 6.6 5.1"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
              <input
                autoComplete="username"
                id="username"
                name="username"
                placeholder="Enter your username"
                required
                defaultValue="receptionist"
              />
            </div>
            <p className="recovery-help" role="status">
              Use <strong>receptionist</strong> for the Reception panel or{" "}
              <strong>doctor</strong> for the Doctor panel.
            </p>

            <div className="password-label-row">
              <label className="field-label" htmlFor="password">
                Password
              </label>
            </div>
            <div className="input-wrap">
              <svg
                className="input-icon"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <rect
                  x="5.2"
                  y="10.1"
                  width="13.6"
                  height="10.2"
                  rx="2.1"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="M8.1 10V7.3a3.9 3.9 0 0 1 7.8 0V10"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
                <circle cx="12" cy="15.2" r="1" fill="currentColor" />
              </svg>
              <input
                autoComplete="current-password"
                id="password"
                name="password"
                placeholder="Enter your password"
                required
                defaultValue="receptionist123"
                type={showPassword ? "text" : "password"}
              />
              <button
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="password-toggle"
                onClick={() => setShowPassword((visible) => !visible)}
                type="button"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <div className="form-options">
              <label className="remember-option">
                <input type="checkbox" name="remember" />
                <span className="custom-checkbox" aria-hidden="true" />
                <span>Remember me</span>
              </label>
              <button
                aria-expanded={showRecoveryHelp}
                className="forgot-link"
                onClick={() => setShowRecoveryHelp((visible) => !visible)}
                type="button"
              >
                Forgot password?
              </button>
            </div>
            {showRecoveryHelp && (
              <p className="recovery-help" role="status">
                Please contact your system administrator to reset your password.
              </p>
            )}

            <button className="submit-button" type="submit">
              Sign in
              <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path
                  d="M4 10h11m-4.5-4.5L15 10l-4.5 4.5"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </form>

          <div className="security-note">
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path
                d="M10 2.5 16 5v4.6c0 3.7-2.4 6.1-6 7.8-3.6-1.7-6-4.1-6-7.8V5l6-2.5Z"
                stroke="currentColor"
                strokeWidth="1.35"
              />
              <path
                d="m7.5 9.9 1.7 1.7 3.5-3.7"
                stroke="currentColor"
                strokeWidth="1.35"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Your account helps protect patient information.</span>
          </div>
          <p className="copyright">© 2026 Hospital Management System</p>
        </div>
      </section>
    </main>
  );
}
