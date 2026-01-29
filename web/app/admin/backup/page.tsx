"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface BackupInfo {
  name: string;
  date: string;
  files: string[];
  totalSize: number;
  totalSizeFormatted: string;
}

interface BackupResult {
  success: boolean;
  message: string;
  data: {
    timestamp: string;
    backupName: string;
    files: {
      sourceCode?: string;
      database?: string;
      uploads?: string;
      settings?: string;
    };
    totalSize: string;
    errors: string[];
  };
}

export default function AdminBackupPage() {
  const [isReady, setIsReady] = useState(false);
  const [isAuthed, setIsAuthed] = useState(false);
  const [backups, setBackups] = useState<BackupInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isCreating, setIsCreating] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);

  // Seçici yedekleme seçenekleri
  const [options, setOptions] = useState({
    includeSourceCode: true,
    includeDatabase: true,
    includeUploads: true,
    includeSettings: true,
  });

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    setIsAuthed(!!token);
    setIsReady(true);
    if (token) {
      loadBackups();
    }
  }, []);

  const getToken = () => localStorage.getItem("auth_token") || "";

  const loadBackups = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/admin/backup/list`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBackups(data.data || []);
      }
    } catch (error) {
      console.error("Yedekler yüklenemedi:", error);
    } finally {
      setLoading(false);
    }
  };

  const createFullBackup = async () => {
    setIsCreating(true);
    setProgress(["Tam yedekleme başlatılıyor..."]);
    setMessage({ type: "", text: "" });

    try {
      setProgress((p) => [...p, "Kaynak kod, database, uploads ve ayarlar yedekleniyor..."]);
      
      const res = await fetch(`${API_BASE_URL}/admin/backup/full`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
      });

      const result: BackupResult = await res.json();

      if (result.success) {
        setProgress((p) => [...p, "✅ Yedekleme tamamlandı!"]);
        setMessage({
          type: "success",
          text: `${result.message} - Toplam: ${result.data.totalSize}`,
        });
        loadBackups();
      } else {
        setProgress((p) => [...p, "⚠️ Yedekleme kısmen başarılı"]);
        setMessage({
          type: "warning",
          text: `${result.message}${result.data.errors.length > 0 ? `: ${result.data.errors.join(", ")}` : ""}`,
        });
        loadBackups();
      }
    } catch (error) {
      setProgress((p) => [...p, "❌ Hata oluştu"]);
      setMessage({ type: "error", text: "Yedekleme sırasında bir hata oluştu" });
    } finally {
      setIsCreating(false);
      setTimeout(() => setProgress([]), 3000);
    }
  };

  const createSelectiveBackup = async () => {
    // En az bir seçenek seçili mi kontrol et
    if (!options.includeSourceCode && !options.includeDatabase && !options.includeUploads && !options.includeSettings) {
      setMessage({ type: "error", text: "En az bir yedekleme seçeneği seçmelisiniz" });
      return;
    }

    setIsCreating(true);
    setProgress(["Seçili yedekleme başlatılıyor..."]);
    setMessage({ type: "", text: "" });

    const selectedItems: string[] = [];
    if (options.includeSourceCode) selectedItems.push("Kaynak Kod");
    if (options.includeDatabase) selectedItems.push("Database");
    if (options.includeUploads) selectedItems.push("Uploads");
    if (options.includeSettings) selectedItems.push("Ayarlar");

    try {
      setProgress((p) => [...p, `Yedekleniyor: ${selectedItems.join(", ")}...`]);

      const res = await fetch(`${API_BASE_URL}/admin/backup/selective`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      });

      const result: BackupResult = await res.json();

      if (result.success) {
        setProgress((p) => [...p, "✅ Yedekleme tamamlandı!"]);
        setMessage({
          type: "success",
          text: `${result.message} - Toplam: ${result.data.totalSize}`,
        });
        loadBackups();
      } else {
        setProgress((p) => [...p, "⚠️ Yedekleme kısmen başarılı"]);
        setMessage({
          type: "warning",
          text: `${result.message}${result.data.errors.length > 0 ? `: ${result.data.errors.join(", ")}` : ""}`,
        });
        loadBackups();
      }
    } catch (error) {
      setProgress((p) => [...p, "❌ Hata oluştu"]);
      setMessage({ type: "error", text: "Yedekleme sırasında bir hata oluştu" });
    } finally {
      setIsCreating(false);
      setTimeout(() => setProgress([]), 3000);
    }
  };

  const downloadFile = async (backupName: string, fileName: string) => {
    try {
      const url = `${API_BASE_URL}/admin/backup/download/${backupName}/${fileName}`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        setMessage({ type: "error", text: "Dosya indirilemedi" });
        return;
      }

      // Blob olarak al ve indir
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      setMessage({ type: "error", text: "İndirme sırasında bir hata oluştu" });
    }
  };

  const deleteBackup = async (backupName: string) => {
    if (!confirm(`"${backupName}" yedeğini silmek istediğinize emin misiniz?`)) {
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/admin/backup/${backupName}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${getToken()}` },
      });

      if (res.ok) {
        setMessage({ type: "success", text: "Yedek başarıyla silindi" });
        loadBackups();
      } else {
        setMessage({ type: "error", text: "Yedek silinemedi" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Silme sırasında bir hata oluştu" });
    }
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.includes("source_code")) return "fa-code";
    if (fileName.includes("database")) return "fa-database";
    if (fileName.includes("uploads")) return "fa-images";
    if (fileName.includes("settings")) return "fa-cog";
    return "fa-file";
  };

  const getFileLabel = (fileName: string) => {
    if (fileName.includes("source_code")) return "Kaynak Kod";
    if (fileName.includes("database")) return "Database";
    if (fileName.includes("uploads")) return "Uploads";
    if (fileName.includes("settings")) return "Ayarlar";
    return fileName;
  };

  if (!isReady) return null;

  if (!isAuthed) {
    return (
      <main className="admin-page">
        <div className="admin-container">
          <div className="admin-card" style={{ textAlign: "center", padding: 40 }}>
            <i className="fa-solid fa-lock" style={{ fontSize: 48, color: "#ccc", marginBottom: 16 }}></i>
            <h2>Giriş Gerekli</h2>
            <p>Bu sayfayı görüntülemek için giriş yapmalısınız.</p>
            <Link href="/admin/login" className="btn btn-primary" style={{ marginTop: 16 }}>
              Giriş Yap
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-container">
        {/* Header */}
        <div className="admin-header">
          <h1 className="admin-title">
            <i className="fa-solid fa-shield-halved"></i> Yedekleme Yönetimi
          </h1>
          <div className="admin-actions">
            <Link href="/admin" className="btn btn-secondary">
              <i className="fa-solid fa-arrow-left"></i> Admin Panel
            </Link>
          </div>
        </div>

        {/* Mesaj */}
        {message.text && (
          <div
            className={`admin-message ${message.type}`}
            style={{
              padding: "12px 16px",
              borderRadius: 8,
              marginBottom: 20,
              background: message.type === "success" ? "#d4edda" : message.type === "error" ? "#f8d7da" : "#fff3cd",
              color: message.type === "success" ? "#155724" : message.type === "error" ? "#721c24" : "#856404",
              border: `1px solid ${message.type === "success" ? "#c3e6cb" : message.type === "error" ? "#f5c6cb" : "#ffeeba"}`,
            }}
          >
            <i className={`fa-solid ${message.type === "success" ? "fa-check-circle" : message.type === "error" ? "fa-exclamation-circle" : "fa-exclamation-triangle"}`}></i>{" "}
            {message.text}
          </div>
        )}

        {/* Progress */}
        {progress.length > 0 && (
          <div
            style={{
              padding: "16px 20px",
              borderRadius: 8,
              marginBottom: 20,
              background: "linear-gradient(135deg, #1e3a5f 0%, #0a4ea3 100%)",
              color: "#fff",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <i className="fa-solid fa-spinner fa-spin"></i>
              <strong>Yedekleme İşlemi</strong>
            </div>
            {progress.map((p, i) => (
              <div key={i} style={{ padding: "4px 0", opacity: i === progress.length - 1 ? 1 : 0.7 }}>
                {p}
              </div>
            ))}
          </div>
        )}

        {/* Tam Yedekleme Kartı */}
        <div
          className="admin-card"
          style={{
            marginBottom: 24,
            background: "linear-gradient(135deg, #0a4ea3 0%, #1e3a5f 100%)",
            color: "#fff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: 12 }}>
                <i className="fa-solid fa-download"></i> Tam Yedekleme
              </h2>
              <p style={{ margin: "8px 0 0", opacity: 0.9 }}>
                Kaynak kod, database, uploads ve tüm ayarları tek seferde yedekler
              </p>
            </div>
            <button
              onClick={createFullBackup}
              disabled={isCreating}
              className="btn"
              style={{
                background: "#fff",
                color: "#0a4ea3",
                padding: "12px 24px",
                fontSize: 16,
                fontWeight: 600,
                opacity: isCreating ? 0.7 : 1,
              }}
            >
              {isCreating ? (
                <>
                  <i className="fa-solid fa-spinner fa-spin"></i> Yedekleniyor...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-shield-halved"></i> Tam Yedekle
                </>
              )}
            </button>
          </div>

          {/* İçerik bilgisi */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 16,
              marginTop: 20,
              padding: 16,
              background: "rgba(255,255,255,0.1)",
              borderRadius: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <i className="fa-solid fa-code"></i>
              <span>Kaynak Kod (ZIP)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <i className="fa-solid fa-database"></i>
              <span>Database (SQL/JSON)</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <i className="fa-solid fa-images"></i>
              <span>Uploads Klasörü</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <i className="fa-solid fa-cog"></i>
              <span>Site Ayarları</span>
            </div>
          </div>
        </div>

        {/* Seçici Yedekleme Kartı */}
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h2 style={{ margin: "0 0 16px", display: "flex", alignItems: "center", gap: 12 }}>
            <i className="fa-solid fa-list-check"></i> Seçici Yedekleme
          </h2>
          <p style={{ margin: "0 0 20px", color: "#666" }}>
            Sadece istediğiniz bileşenleri yedekleyin
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 16,
              marginBottom: 20,
            }}
          >
            {/* Kaynak Kod */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 16,
                borderRadius: 8,
                border: `2px solid ${options.includeSourceCode ? "#0a4ea3" : "#e0e0e0"}`,
                background: options.includeSourceCode ? "#f0f7ff" : "#fff",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <input
                type="checkbox"
                checked={options.includeSourceCode}
                onChange={(e) => setOptions({ ...options, includeSourceCode: e.target.checked })}
                style={{ width: 20, height: 20 }}
              />
              <div>
                <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fa-solid fa-code" style={{ color: "#0a4ea3" }}></i>
                  Kaynak Kod
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>API + Web (ZIP)</div>
              </div>
            </label>

            {/* Database */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 16,
                borderRadius: 8,
                border: `2px solid ${options.includeDatabase ? "#0a4ea3" : "#e0e0e0"}`,
                background: options.includeDatabase ? "#f0f7ff" : "#fff",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <input
                type="checkbox"
                checked={options.includeDatabase}
                onChange={(e) => setOptions({ ...options, includeDatabase: e.target.checked })}
                style={{ width: 20, height: 20 }}
              />
              <div>
                <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fa-solid fa-database" style={{ color: "#27ae60" }}></i>
                  Database
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>PostgreSQL (SQL/JSON)</div>
              </div>
            </label>

            {/* Uploads */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 16,
                borderRadius: 8,
                border: `2px solid ${options.includeUploads ? "#0a4ea3" : "#e0e0e0"}`,
                background: options.includeUploads ? "#f0f7ff" : "#fff",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <input
                type="checkbox"
                checked={options.includeUploads}
                onChange={(e) => setOptions({ ...options, includeUploads: e.target.checked })}
                style={{ width: 20, height: 20 }}
              />
              <div>
                <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fa-solid fa-images" style={{ color: "#9b59b6" }}></i>
                  Uploads
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>Resimler, Dosyalar</div>
              </div>
            </label>

            {/* Ayarlar */}
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: 16,
                borderRadius: 8,
                border: `2px solid ${options.includeSettings ? "#0a4ea3" : "#e0e0e0"}`,
                background: options.includeSettings ? "#f0f7ff" : "#fff",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <input
                type="checkbox"
                checked={options.includeSettings}
                onChange={(e) => setOptions({ ...options, includeSettings: e.target.checked })}
                style={{ width: 20, height: 20 }}
              />
              <div>
                <div style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                  <i className="fa-solid fa-cog" style={{ color: "#e67e22" }}></i>
                  Ayarlar
                </div>
                <div style={{ fontSize: 12, color: "#666" }}>Site Ayarları (JSON)</div>
              </div>
            </label>
          </div>

          <button
            onClick={createSelectiveBackup}
            disabled={isCreating}
            className="btn btn-primary"
            style={{
              padding: "12px 24px",
              fontSize: 16,
              opacity: isCreating ? 0.7 : 1,
            }}
          >
            {isCreating ? (
              <>
                <i className="fa-solid fa-spinner fa-spin"></i> Yedekleniyor...
              </>
            ) : (
              <>
                <i className="fa-solid fa-download"></i> Seçilenleri Yedekle
              </>
            )}
          </button>
        </div>

        {/* Mevcut Yedekler */}
        <div className="admin-card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ margin: 0, display: "flex", alignItems: "center", gap: 12 }}>
              <i className="fa-solid fa-clock-rotate-left"></i> Yedekleme Geçmişi
            </h2>
            <button onClick={loadBackups} className="btn btn-secondary" disabled={loading}>
              <i className={`fa-solid fa-refresh ${loading ? "fa-spin" : ""}`}></i> Yenile
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
              <i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 32 }}></i>
              <p>Yedekler yükleniyor...</p>
            </div>
          ) : backups.length === 0 ? (
            <div style={{ textAlign: "center", padding: 40, color: "#666" }}>
              <i className="fa-solid fa-box-open" style={{ fontSize: 48, marginBottom: 16 }}></i>
              <p>Henüz yedekleme yapılmamış</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {backups.map((backup) => (
                <div
                  key={backup.name}
                  style={{
                    padding: 20,
                    borderRadius: 8,
                    border: "1px solid #e0e0e0",
                    background: "#fafafa",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 16 }}>
                        <i className="fa-solid fa-folder" style={{ color: "#0a4ea3", marginRight: 8 }}></i>
                        {backup.name}
                      </div>
                      <div style={{ fontSize: 13, color: "#666", marginTop: 4 }}>
                        <i className="fa-regular fa-calendar"></i> {backup.date} &nbsp;|&nbsp;
                        <i className="fa-solid fa-hard-drive"></i> {backup.totalSizeFormatted}
                      </div>
                    </div>
                    <button
                      onClick={() => deleteBackup(backup.name)}
                      className="btn"
                      style={{
                        background: "#fff",
                        color: "#dc3545",
                        border: "1px solid #dc3545",
                        padding: "8px 16px",
                      }}
                    >
                      <i className="fa-solid fa-trash"></i> Sil
                    </button>
                  </div>

                  {/* Dosya listesi */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 8,
                    }}
                  >
                    {backup.files.map((file) => (
                      <button
                        key={file}
                        onClick={() => downloadFile(backup.name, file)}
                        className="btn"
                        style={{
                          background: "#fff",
                          border: "1px solid #0a4ea3",
                          color: "#0a4ea3",
                          padding: "8px 16px",
                          fontSize: 13,
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <i className={`fa-solid ${getFileIcon(file)}`}></i>
                        {getFileLabel(file)}
                        <i className="fa-solid fa-download" style={{ marginLeft: 4, opacity: 0.7 }}></i>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bilgi Kartı */}
        <div
          className="admin-card"
          style={{
            marginTop: 24,
            background: "#fff8e6",
            border: "1px solid #ffe0b2",
          }}
        >
          <h3 style={{ margin: "0 0 12px", display: "flex", alignItems: "center", gap: 8, color: "#e65100" }}>
            <i className="fa-solid fa-lightbulb"></i> Yedekleme Hakkında
          </h3>
          <ul style={{ margin: 0, paddingLeft: 20, color: "#666", lineHeight: 1.8 }}>
            <li><strong>Kaynak Kod:</strong> API ve Web kaynak kodlarını içerir (node_modules hariç)</li>
            <li><strong>Database:</strong> PostgreSQL veritabanının tam dökümü (SQL veya JSON formatında)</li>
            <li><strong>Uploads:</strong> Yüklenen tüm resim ve dosyalar</li>
            <li><strong>Ayarlar:</strong> Site ayarları JSON formatında</li>
            <li><strong>Önerilen:</strong> Düzenli olarak tam yedekleme yapmanız tavsiye edilir</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
