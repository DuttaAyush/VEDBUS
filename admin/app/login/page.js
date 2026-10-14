"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { adminFetch } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [adminType, setAdminType] = useState("SUPER_ADMIN"); // "SUPER_ADMIN" | "ADMIN"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [error, setError] = useState("");
  const [otpNotice, setOtpNotice] = useState("");
  const [cooldown, setCooldown] = useState(0);

  // Countdown timer for resend OTP cooldown
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 1 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleTabChange = (type) => {
    setAdminType(type);
    setEmail("");
    setPassword("");
    setOtp("");
    setError("");
    setOtpNotice("");
  };

  const handleRequestOtp = async () => {
    setError("");
    setOtpNotice("");
    if (!email.trim() || !password) {
      setError("Please enter your admin email and password before requesting an OTP.");
      return;
    }

    setOtpLoading(true);
    try {
      const res = await adminFetch("/api/auth/admin-otp", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          adminType,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setOtpNotice("OTP generated! Check your backend server console to retrieve the 6-digit code.");
        setCooldown(60);
      } else {
        setError(data.message || "Failed to generate verification OTP.");
      }
    } catch {
      setError("Could not communicate with the authentication server.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");
    setOtpNotice("");

    if (!email.trim() || !password) {
      setError("Email and password are required.");
      setLoading(false);
      return;
    }

    if (!otp.trim()) {
      setError("Please enter the 6-digit verification OTP (logged in server console).");
      setLoading(false);
      return;
    }

    try {
      const res = await adminFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          otp: otp.trim(),
          adminType,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        if (typeof window !== "undefined") {
          const userObj = data.data?.user || data.user;
          const tokenVal = data.data?.accessToken || data.accessToken;
          if (!tokenVal || !userObj || !["ADMIN", "SUPER_ADMIN"].includes(userObj.role)) {
            await adminFetch("/api/auth/logout", { method: "POST" });
            localStorage.removeItem("admin_token");
            localStorage.removeItem("admin_user");
            setError("Server returned an invalid administrator session.");
            return;
          }
          const finalUser = {
            ...userObj,
            role: userObj.role,
            name: userObj.name,
          };

          localStorage.setItem("admin_token", tokenVal);
          localStorage.setItem("admin_user", JSON.stringify(finalUser));
        }
        router.push("/dashboard");
      } else {
        setError(data.message || "Invalid administrator credentials or OTP.");
      }
    } catch {
      setError("Could not reach the authentication service.");
    } finally {
      setLoading(false);
    }
  };

  const isSuper = adminType === "SUPER_ADMIN";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0B1120",
        backgroundImage: "radial-gradient(ellipse at top, #1E293B, #0B1120)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 440,
          background: "#FFFFFF",
          borderRadius: 18,
          boxShadow: "0 24px 48px -12px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)",
          padding: "2.25rem 2rem",
        }}
      >
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 58,
              height: 58,
              borderRadius: 16,
              backgroundColor: isSuper ? "#FEF3C7" : "#EFF6FF",
              color: isSuper ? "#B45309" : "#1D4ED8",
              marginBottom: "0.875rem",
              boxShadow: isSuper
                ? "0 4px 12px rgba(217, 119, 6, 0.2)"
                : "0 4px 12px rgba(29, 78, 216, 0.15)",
              transition: "all 200ms ease",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 32 }}>
              {isSuper ? "admin_panel_settings" : "badge"}
            </span>
          </div>

          <h1
            style={{
              fontFamily: "var(--font-playfair, 'Playfair Display', serif)",
              fontSize: "1.65rem",
              fontWeight: 800,
              color: "#0F172A",
              lineHeight: 1.2,
              margin: 0,
            }}
          >
            YatraBus Admin Portal
          </h1>
          <p style={{ color: "#64748B", fontSize: "0.875rem", marginTop: 6, lineHeight: 1.4 }}>
            Secure sign in with two-factor OTP verification
          </p>
        </div>

        {/* Role Selection Tabs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.375rem",
            backgroundColor: "#F1F5F9",
            padding: 4,
            borderRadius: 12,
            marginBottom: "1.5rem",
            border: "1px solid #E2E8F0",
          }}
        >
          <button
            type="button"
            onClick={() => handleTabChange("SUPER_ADMIN")}
            style={{
              padding: "0.6rem 0.5rem",
              borderRadius: 8,
              border: "none",
              fontSize: "0.8125rem",
              fontWeight: 700,
              cursor: "pointer",
              backgroundColor: isSuper ? "#FFFFFF" : "transparent",
              color: isSuper ? "#92400E" : "#64748B",
              boxShadow: isSuper ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.35rem",
              transition: "all 150ms ease",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 17, color: isSuper ? "#D97706" : "inherit" }}>
              workspace_premium
            </span>
            Super Admin
          </button>

          <button
            type="button"
            onClick={() => handleTabChange("ADMIN")}
            style={{
              padding: "0.6rem 0.5rem",
              borderRadius: 8,
              border: "none",
              fontSize: "0.8125rem",
              fontWeight: 700,
              cursor: "pointer",
              backgroundColor: !isSuper ? "#FFFFFF" : "transparent",
              color: !isSuper ? "#1E40AF" : "#64748B",
              boxShadow: !isSuper ? "0 2px 6px rgba(0,0,0,0.08)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.35rem",
              transition: "all 150ms ease",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 17, color: !isSuper ? "#2563EB" : "inherit" }}>
              person
            </span>
            Staff Admin
          </button>
        </div>

        {/* Status Notices */}
        {error && (
          <div
            style={{
              backgroundColor: "#FEF2F2",
              border: "1px solid #FCA5A5",
              color: "#991B1B",
              padding: "0.75rem 1rem",
              borderRadius: 8,
              fontSize: "0.8125rem",
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#DC2626", flexShrink: 0 }}>
              error
            </span>
            <span>{error}</span>
          </div>
        )}

        {otpNotice && (
          <div
            style={{
              backgroundColor: "#F0FDF4",
              border: "1px solid #86EFAC",
              color: "#166534",
              padding: "0.75rem 1rem",
              borderRadius: 8,
              fontSize: "0.8125rem",
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "flex-start",
              gap: "0.5rem",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18, color: "#16A34A", flexShrink: 0 }}>
              terminal
            </span>
            <span>{otpNotice}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.125rem" }}>
          {/* Email */}
          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
              {isSuper ? "Super Admin Email" : "Admin Email"}
            </label>
            <div style={{ position: "relative" }}>
              <span
                className="material-symbols-outlined"
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 18,
                  color: "#94A3B8",
                  pointerEvents: "none",
                }}
              >
                mail
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={isSuper ? "superadmin@yatrabus.in" : "admin@yatrabus.in"}
                required
                autoComplete="email"
                style={{
                  width: "100%",
                  paddingLeft: 38,
                  paddingRight: 12,
                  paddingTop: 10,
                  paddingBottom: 10,
                  border: "1px solid #CBD5E1",
                  borderRadius: 8,
                  fontSize: "0.875rem",
                  color: "#0F172A",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 150ms",
                }}
                onFocus={(e) => (e.target.style.borderColor = isSuper ? "#D97706" : "#2563EB")}
                onBlur={(e) => (e.target.style.borderColor = "#CBD5E1")}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: "block", fontSize: "0.8125rem", fontWeight: 600, color: "#334155", marginBottom: 6 }}>
              Password
            </label>
            <div style={{ position: "relative" }}>
              <span
                className="material-symbols-outlined"
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 18,
                  color: "#94A3B8",
                  pointerEvents: "none",
                }}
              >
                lock
              </span>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                style={{
                  width: "100%",
                  paddingLeft: 38,
                  paddingRight: 40,
                  paddingTop: 10,
                  paddingBottom: 10,
                  border: "1px solid #CBD5E1",
                  borderRadius: 8,
                  fontSize: "0.875rem",
                  color: "#0F172A",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 150ms",
                }}
                onFocus={(e) => (e.target.style.borderColor = isSuper ? "#D97706" : "#2563EB")}
                onBlur={(e) => (e.target.style.borderColor = "#CBD5E1")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "#94A3B8",
                  display: "flex",
                  alignItems: "center",
                  padding: 4,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
          </div>

          {/* OTP Verification Code */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <label style={{ fontSize: "0.8125rem", fontWeight: 600, color: "#334155" }}>
                6-Digit OTP Code
              </label>
              <button
                type="button"
                onClick={handleRequestOtp}
                disabled={otpLoading || cooldown > 0}
                style={{
                  background: "none",
                  border: "none",
                  color: cooldown > 0 ? "#94A3B8" : isSuper ? "#B45309" : "#1D4ED8",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  cursor: cooldown > 0 || otpLoading ? "not-allowed" : "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: 0,
                }}
              >
                {otpLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin" style={{ fontSize: 13 }}>
                      progress_activity
                    </span>
                    Generating...
                  </>
                ) : cooldown > 0 ? (
                  `Resend in ${cooldown}s`
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: 13 }}>
                      send
                    </span>
                    Send OTP to Console
                  </>
                )}
              </button>
            </div>

            <div style={{ position: "relative" }}>
              <span
                className="material-symbols-outlined"
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 18,
                  color: "#94A3B8",
                  pointerEvents: "none",
                }}
              >
                pin
              </span>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                placeholder="123456"
                required
                style={{
                  width: "100%",
                  paddingLeft: 38,
                  paddingRight: 12,
                  paddingTop: 10,
                  paddingBottom: 10,
                  border: "1px solid #CBD5E1",
                  borderRadius: 8,
                  fontSize: "0.9375rem",
                  letterSpacing: "0.15em",
                  fontWeight: 600,
                  color: "#0F172A",
                  outline: "none",
                  boxSizing: "border-box",
                  transition: "border-color 150ms",
                }}
                onFocus={(e) => (e.target.style.borderColor = isSuper ? "#D97706" : "#2563EB")}
                onBlur={(e) => (e.target.style.borderColor = "#CBD5E1")}
              />
            </div>
            <p style={{ margin: "4px 0 0", fontSize: "0.6875rem", color: "#64748B" }}>
              Click <strong>&quot;Send OTP to Console&quot;</strong> and view the 6-digit code logged in the backend terminal.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: 8,
              border: "none",
              backgroundColor: isSuper ? "#B45309" : "#1D4ED8",
              color: "#FFFFFF",
              fontSize: "0.9375rem",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              boxShadow: isSuper
                ? "0 3px 8px rgba(180, 83, 9, 0.25)"
                : "0 3px 8px rgba(29, 78, 216, 0.25)",
              marginTop: "0.25rem",
              transition: "background-color 150ms",
            }}
            onMouseEnter={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = isSuper ? "#92400E" : "#1E40AF";
            }}
            onMouseLeave={(e) => {
              if (!loading) e.currentTarget.style.backgroundColor = isSuper ? "#B45309" : "#1D4ED8";
            }}
          >
            {loading ? (
              <>
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>
                  progress_activity
                </span>
                <span>Verifying credentials...</span>
              </>
            ) : (
              <>
                <span>{isSuper ? "Sign In as Super Admin" : "Sign In as Staff Admin"}</span>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                  arrow_forward
                </span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
