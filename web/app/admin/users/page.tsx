"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Branch = {
  id: string;
  name: string;
};

type User = {
  id: string;
  email: string;
  username: string | null;
  name: string;
  role: string;
  isActive: boolean;
  photoUrl: string | null;
  phone: string | null;
  whatsapp: string | null;
  title: string | null;
  createdAt: string;
  consultant?: {
    id: string;
    branchId: string;
    branch: Branch;
  };
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  MANAGER: "Yönetici",
  BROKER: "Broker",
  FIRM_OWNER: "Firma Sahibi",
  REAL_ESTATE_EXPERT: "Emlak Uzmanı",
  BRANCH_MANAGER: "Şube Müdürü",
  CONSULTANT: "Danışman",
};

const CONSULTANT_ROLES = [
  { value: "CONSULTANT", label: "Danışman" },
  { value: "BRANCH_MANAGER", label: "Şube Müdürü" },
];

const MANAGER_ROLES = [
  { value: "MANAGER", label: "Yönetici" },
  { value: "BROKER", label: "Broker" },
  { value: "FIRM_OWNER", label: "Firma Sahibi" },
  { value: "REAL_ESTATE_EXPERT", label: "Emlak Uzmanı" },
];

export default function UsersPage() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState<"consultants" | "managers">("consultants");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    password: "",
    name: "",
    role: "CONSULTANT",
    phone: "",
    whatsapp: "",
    title: "",
    branchId: "",
    isActive: true,
  });

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthed(Boolean(token));
    setIsReady(true);

    if (token) {
      loadUsers(token);
      loadBranches(token);
    }
  }, []);

  const loadUsers = async (token: string) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch {
      setError("Kullanıcılar yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const loadBranches = async (token: string) => {
    try {
      const res = await fetch(`${API_BASE_URL}/branches`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBranches(data);
      }
    } catch {
      // ignore
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      const url = editingUser
        ? `${API_BASE_URL}/users/${editingUser.id}`
        : `${API_BASE_URL}/users`;
      
      const method = editingUser ? "PATCH" : "POST";
      
      const body: Record<string, unknown> = {
        email: formData.email,
        username: formData.username || undefined,
        name: formData.name,
        role: formData.role,
        phone: formData.phone || undefined,
        whatsapp: formData.whatsapp || undefined,
        title: formData.title || undefined,
        branchId: formData.branchId || undefined,
        isActive: formData.isActive,
      };

      // Şifre sadece yeni kullanıcı veya değiştirilmek istendiğinde
      if (formData.password) {
        body.password = formData.password;
      }

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "İşlem başarısız");
      }

      setSuccess(editingUser ? "Kullanıcı güncellendi" : "Kullanıcı oluşturuldu");
      setShowForm(false);
      setEditingUser(null);
      resetForm();
      loadUsers(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata oluştu");
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      email: user.email,
      username: user.username || "",
      password: "",
      name: user.name,
      role: user.role,
      phone: user.phone || "",
      whatsapp: user.whatsapp || "",
      title: user.title || "",
      branchId: user.consultant?.branchId || "",
      isActive: user.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) return;

    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Silme işlemi başarısız");
      }

      setSuccess("Kullanıcı silindi");
      loadUsers(token);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hata oluştu");
    }
  };

  const handleToggleActive = async (userId: string) => {
    const token = localStorage.getItem("auth_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/users/${userId}/toggle-active`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        loadUsers(token);
      }
    } catch {
      // ignore
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      username: "",
      password: "",
      name: "",
      role: activeTab === "consultants" ? "CONSULTANT" : "BROKER",
      phone: "",
      whatsapp: "",
      title: "",
      branchId: "",
      isActive: true,
    });
  };

  const openNewForm = (type: "consultants" | "managers") => {
    setActiveTab(type);
    setEditingUser(null);
    resetForm();
    setFormData(prev => ({
      ...prev,
      role: type === "consultants" ? "CONSULTANT" : "BROKER",
    }));
    setShowForm(true);
  };

  const filteredUsers = users.filter(u => {
    if (activeTab === "consultants") {
      return ["CONSULTANT", "BRANCH_MANAGER"].includes(u.role);
    } else {
      return ["MANAGER", "BROKER", "FIRM_OWNER", "REAL_ESTATE_EXPERT"].includes(u.role);
    }
  });

  if (!isReady) {
    return (
      <main className="section">
        <div className="container">
          <div className="section-title">Kullanıcı Yönetimi</div>
          <div className="card">
            <div className="card-body">Yükleniyor...</div>
          </div>
        </div>
      </main>
    );
  }

  if (!isAuthed) {
    return (
      <main className="section">
        <div className="container">
          <div className="section-title">Kullanıcı Yönetimi</div>
          <div className="card">
            <div className="card-body">
              Bu sayfayı görmek için giriş yapmalısınız.{" "}
              <Link href="/admin/login" className="btn btn-outline">
                Giriş Yap
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="section">
      <div className="container">
        <div className="section-title">Kullanıcı Yönetimi</div>

        <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
          <Link href="/admin" className="btn btn-outline">
            ← Yönetim Paneli
          </Link>
          <button
            className="btn"
            style={{ background: "#10b981" }}
            onClick={() => openNewForm("consultants")}
          >
            <i className="fa-solid fa-user-plus" style={{ marginRight: 6 }}></i>
            Danışman Ekle
          </button>
          <button
            className="btn"
            style={{ background: "#0a4ea3" }}
            onClick={() => openNewForm("managers")}
          >
            <i className="fa-solid fa-user-tie" style={{ marginRight: 6 }}></i>
            Yönetici Ekle
          </button>
        </div>

        {error && (
          <div className="card" style={{ background: "#fee2e2", marginBottom: 16 }}>
            <div className="card-body" style={{ color: "#dc2626" }}>{error}</div>
          </div>
        )}

        {success && (
          <div className="card" style={{ background: "#d1fae5", marginBottom: 16 }}>
            <div className="card-body" style={{ color: "#059669" }}>{success}</div>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-body">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <h3 style={{ margin: 0 }}>
                  {editingUser ? "Kullanıcı Düzenle" : (activeTab === "consultants" ? "Yeni Danışman" : "Yeni Yönetici")}
                </h3>
                <button className="btn btn-outline" onClick={() => { setShowForm(false); setEditingUser(null); }}>
                  Kapat
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
                  <div>
                    <label className="form-label">Ad Soyad *</label>
                    <input
                      className="form-input"
                      type="text"
                      value={formData.name}
                      onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">E-posta *</label>
                    <input
                      className="form-input"
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>

                  <div>
                    <label className="form-label">Kullanıcı Adı</label>
                    <input
                      className="form-input"
                      type="text"
                      value={formData.username}
                      onChange={e => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="Opsiyonel"
                    />
                  </div>

                  <div>
                    <label className="form-label">
                      {editingUser ? "Yeni Şifre (boş bırakılırsa değişmez)" : "Şifre *"}
                    </label>
                    <input
                      className="form-input"
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required={!editingUser}
                      minLength={6}
                    />
                  </div>

                  <div>
                    <label className="form-label">Rol *</label>
                    <select
                      className="form-select"
                      value={formData.role}
                      onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
                      required
                    >
                      {activeTab === "consultants" ? (
                        CONSULTANT_ROLES.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))
                      ) : (
                        MANAGER_ROLES.map(r => (
                          <option key={r.value} value={r.value}>{r.label}</option>
                        ))
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="form-label">Ünvan</label>
                    <input
                      className="form-input"
                      type="text"
                      value={formData.title}
                      onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Örn: Kıdemli Danışman"
                    />
                  </div>

                  <div>
                    <label className="form-label">Telefon</label>
                    <input
                      className="form-input"
                      type="tel"
                      value={formData.phone}
                      onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="form-label">WhatsApp</label>
                    <input
                      className="form-input"
                      type="tel"
                      value={formData.whatsapp}
                      onChange={e => setFormData(prev => ({ ...prev, whatsapp: e.target.value }))}
                    />
                  </div>

                  {activeTab === "consultants" && (
                    <div>
                      <label className="form-label">Şube *</label>
                      <select
                        className="form-select"
                        value={formData.branchId}
                        onChange={e => setFormData(prev => ({ ...prev, branchId: e.target.value }))}
                        required={activeTab === "consultants"}
                      >
                        <option value="">Şube Seçin</option>
                        {branches.map(b => (
                          <option key={b.id} value={b.id}>{b.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div style={{ display: "flex", alignItems: "center", gap: 8, paddingTop: 28 }}>
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={formData.isActive}
                      onChange={e => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    />
                    <label htmlFor="isActive">Aktif</label>
                  </div>
                </div>

                <div style={{ marginTop: 20 }}>
                  <button className="btn" type="submit">
                    {editingUser ? "Güncelle" : "Kaydet"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 16 }}>
          <button
            className={`btn ${activeTab === "consultants" ? "" : "btn-outline"}`}
            style={{ borderRadius: "8px 0 0 8px" }}
            onClick={() => setActiveTab("consultants")}
          >
            <i className="fa-solid fa-user-tie" style={{ marginRight: 6 }}></i>
            Danışmanlar
          </button>
          <button
            className={`btn ${activeTab === "managers" ? "" : "btn-outline"}`}
            style={{ borderRadius: "0 8px 8px 0" }}
            onClick={() => setActiveTab("managers")}
          >
            <i className="fa-solid fa-users-gear" style={{ marginRight: 6 }}></i>
            Yöneticiler
          </button>
        </div>

        {/* Users List */}
        <div className="card">
          <div className="card-body">
            {loading ? (
              <div>Yükleniyor...</div>
            ) : filteredUsers.length === 0 ? (
              <div style={{ textAlign: "center", padding: 40, color: "var(--color-muted)" }}>
                <i className="fa-solid fa-users" style={{ fontSize: 48, marginBottom: 16 }}></i>
                <p>{activeTab === "consultants" ? "Henüz danışman eklenmemiş" : "Henüz yönetici eklenmemiş"}</p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {filteredUsers.map(user => (
                  <div
                    key={user.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: 16,
                      border: "1px solid var(--color-border)",
                      borderRadius: 8,
                      background: user.isActive ? "#fff" : "#f5f5f5",
                      opacity: user.isActive ? 1 : 0.7,
                    }}
                  >
                    {/* Avatar */}
                    <div
                      style={{
                        width: 50,
                        height: 50,
                        borderRadius: "50%",
                        background: user.photoUrl ? `url(${user.photoUrl.startsWith("/uploads") ? API_BASE_URL + user.photoUrl : user.photoUrl})` : "var(--color-primary)",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: 18,
                      }}
                    >
                      {!user.photoUrl && user.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 15 }}>
                        {user.name}
                        {!user.isActive && (
                          <span style={{ marginLeft: 8, fontSize: 11, color: "#dc2626" }}>(Pasif)</span>
                        )}
                      </div>
                      <div style={{ fontSize: 13, color: "var(--color-muted)" }}>
                        {user.email}
                        {user.username && <span> (@{user.username})</span>}
                      </div>
                      <div style={{ fontSize: 12, marginTop: 4 }}>
                        <span
                          style={{
                            background: ["CONSULTANT", "BRANCH_MANAGER"].includes(user.role) ? "#10b981" : "#0a4ea3",
                            color: "#fff",
                            padding: "2px 8px",
                            borderRadius: 4,
                            marginRight: 8,
                          }}
                        >
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                        {user.consultant?.branch && (
                          <span style={{ color: "var(--color-muted)" }}>
                            <i className="fa-solid fa-building-columns" style={{ marginRight: 4 }}></i>
                            {user.consultant.branch.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Contact */}
                    <div style={{ fontSize: 12, color: "var(--color-muted)" }}>
                      {user.phone && (
                        <div>
                          <i className="fa-solid fa-phone" style={{ marginRight: 6 }}></i>
                          {user.phone}
                        </div>
                      )}
                      {user.whatsapp && (
                        <div>
                          <i className="fa-brands fa-whatsapp" style={{ marginRight: 6 }}></i>
                          {user.whatsapp}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn btn-outline"
                        style={{ padding: "6px 12px", fontSize: 12 }}
                        onClick={() => handleEdit(user)}
                      >
                        <i className="fa-solid fa-edit"></i>
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{ padding: "6px 12px", fontSize: 12 }}
                        onClick={() => handleToggleActive(user.id)}
                        title={user.isActive ? "Pasife Al" : "Aktif Et"}
                      >
                        <i className={`fa-solid ${user.isActive ? "fa-toggle-on" : "fa-toggle-off"}`}></i>
                      </button>
                      <button
                        className="btn btn-outline"
                        style={{ padding: "6px 12px", fontSize: 12, color: "#dc2626", borderColor: "#dc2626" }}
                        onClick={() => handleDelete(user.id)}
                      >
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
