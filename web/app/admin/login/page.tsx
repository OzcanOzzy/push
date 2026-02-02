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
    username?: string;
    role: string;
    photoUrl?: string;
    phone?: string;
    whatsapp?: string;
    title?: string;
    consultantId?: string;
    branchId?: string;
    branchName?: string;
  };
};

export default function AdminLoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Backend'e identifier olarak gönder (email veya username olabilir)
      const response = await fetchJson<LoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: identifier, password }),
      });

      localStorage.setItem("auth_token", response.accessToken);
      localStorage.setItem("auth_user", JSON.stringify(response.user));
      router.push("/admin");
      router.refresh();
    } catch {
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
        <div className="login-title">Yönetim Paneli</div>
        <div className="login-subtitle">Lütfen giriş yapın</div>
        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label" htmlFor="login-email">
            E-posta veya Kullanıcı Adı
          </label>
          <input
            id="login-email"
            className="login-input"
            placeholder="email@ornek.com veya kullaniciadi"
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            autoComplete="email"
            required
          />
          <label className="login-label" htmlFor="login-password">
            Şifre
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
            {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </main>
  );
}
