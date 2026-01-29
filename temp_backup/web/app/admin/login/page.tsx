"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { fetchJson } from "../../../lib/api";

type LoginResponse = {
  accessToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetchJson<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      localStorage.setItem("auth_token", response.accessToken);
      localStorage.setItem("auth_user", JSON.stringify(response.user));
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError("Giriş başarısız. Bilgilerinizi kontrol edin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <img src="/logo.png" alt="Emlaknomi" />
        </div>
        <div className="login-title">Welcome to Admin Panel</div>
        <div className="login-subtitle">Please log in below.</div>
        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label" htmlFor="login-email">
            Email
          </label>
          <input
            id="login-email"
            className="login-input"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            required
          />
          <label className="login-label" htmlFor="login-password">
            Password
          </label>
          <input
            id="login-password"
            className="login-input"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            required
          />
          {error ? <div className="login-error">{error}</div> : null}
          <button className="login-button" disabled={isLoading}>
            {isLoading ? "Giriş yapılıyor..." : "Log in"}
          </button>
        </form>
      </div>
    </main>
  );
}
