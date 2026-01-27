export default function Header() {
  return (
    <header className="header">
      <div className="container header-inner">
        <div className="logo">Emlaknomi</div>
        <div className="search-bar">
          <input
            className="search-input"
            placeholder="İlan, şehir, ilçe ara"
          />
          <button className="btn">Filtre</button>
        </div>
        <div>
          <div style={{ fontWeight: 600 }}>Özcan Aktaş</div>
          <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
            Danışman
          </div>
        </div>
      </div>
    </header>
  );
}
