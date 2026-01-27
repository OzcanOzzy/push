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
    <main className="section">
      <div className="container" style={{ maxWidth: 480 }}>
        <div className="section-title">Danışman Girişi</div>
        <div className="card">
          <form
            className="card-body"
            style={{ display: "grid", gap: 12 }}
            onSubmit={handleSubmit}
          >
            <input
              className="search-input"
              placeholder="E-posta"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              required
            />
            <input
              className="search-input"
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              required
            />
            {error ? (
              <div style={{ color: "var(--color-accent)", fontSize: 13 }}>
                {error}
              </div>
            ) : null}
            <button className="btn" disabled={isLoading}>
              {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
